import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useQueue } from "@sophys-web/api-client/hooks";
import { api } from "@sophys-web/api-client/react";
import { cn } from "@sophys-web/ui";
import { Button } from "@sophys-web/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@sophys-web/ui/form";
import { Input } from "@sophys-web/ui/input";
import { Label } from "@sophys-web/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@sophys-web/ui/select";
import { Switch } from "@sophys-web/ui/switch";
import type { Sample } from "../store/setup2/use-sample-store";
import {
  cardColumns,
  cardIndexOptions,
  cardRows,
} from "../store/setup2/constants";
import { proposalSchema, regexPatterns } from "./schemas/common";

const sampleTagSchema = z
  .string()
  .min(1)
  .max(
    100,
    "Sample name or other form of identification must be at most 100 characters long",
  )
  .regex(regexPatterns.invalidChars, {
    message:
      "Sample tag can only contain letters, numbers, dashes, and underscores",
  })
  .regex(regexPatterns.noEmptySpaces, {
    message: "Sample tag must not contain empty spaces",
  })
  .regex(regexPatterns.noDots, {
    message: "Sample tag must not contain dots",
  });

const schema = z
  .object({
    proposal: proposalSchema,
    sampleTag: sampleTagSchema,
    acquireTime: z.coerce
      .number()
      .min(0.1, "Acquire time (in seconds) must be at least 0.1"),
    numExposures: z.coerce
      .number()
      .int()
      .min(1, "Number of exposures must be at least 1"),
    col: z.enum(cardColumns, {
      message: `Column must be one of the following options ${cardColumns.join(", ")}`,
    }),
    row: z.enum(cardRows, {
      message: `Row must be one of the following options ${cardRows.join(", ")}`,
    }),
    cardIndex: z
      .enum(cardIndexOptions, {
        message: `Card index must be one of the following options ${cardIndexOptions.join(", ")}`,
      })
      .optional(),
    cardName: z.string().optional(),
    retrieveCard: z.boolean().optional(),
    usePimega: z.boolean().optional(),
    usePicolo: z.boolean().optional(),
    samplePosX: z.coerce.number().optional(),
    samplePosY: z.coerce.number().optional(),
  })
  .refine(
    (data) => {
      return data.cardIndex !== undefined || data.cardName !== undefined;
    },
    {
      message: "Either card index or card name must be provided",
    },
  );

const name = "setup2_complete_standard_acquisition";

export function CompleteAcquisitionForm({
  sampleParams,
  cardName,
  className,
  onSubmitSuccess,
}: {
  sampleParams: Sample | undefined;
  cardName?: string | undefined;
  className?: string;
  onSubmitSuccess: () => void;
}) {
  const { add } = useQueue();
  const { data: userData } = api.auth.getUser.useQuery();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      proposal: userData?.proposal ?? "",
      sampleTag: sampleParams?.sampleTag ?? "",
      acquireTime: 0.1,
      numExposures: 1,
      col: sampleParams?.column ?? "A",
      row: sampleParams?.row ?? "1",
      cardIndex: sampleParams?.cardIndex,
      cardName: cardName ?? "",
      retrieveCard: true,
      usePimega: true,
      usePicolo: false,
      samplePosX: sampleParams?.samplePositionX,
      samplePosY: sampleParams?.samplePositionY,
    },
  });

  function onSubmit(data: z.infer<typeof schema>) {
    toast.info("Submitting complete aquisition...");
    const kwargs = schema.parse({
      ...data,
    });
    add.mutate(
      {
        item: {
          name: name,
          itemType: "plan",
          args: [],
          kwargs,
        },
      },
      {
        onSuccess: () => {
          toast.success("Sample submitted!");
          onSubmitSuccess();
        },
        onError: (error) => {
          toast.error("Failed to submit sample", {
            description: error.message,
            closeButton: true,
          });
        },
      },
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("space-y-8", className)}
      >
        <div className="grid grid-cols-3 gap-8">
          <FormField
            control={form.control}
            name="sampleTag"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Sample Tag</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cardName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Card Name</FormLabel>
                <FormControl>
                  <Input {...field} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cardIndex"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Card Index</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {cardIndexOptions.map((option) => {
                      return (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="row"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Card Row</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {cardRows.map((option) => {
                      return (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="col"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Card Column</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {cardColumns.map((option) => {
                      return (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="samplePosX"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sample Pos x</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="samplePosY"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sample Pos y</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="retrieveCard"
            render={({ field }) => (
              <FormItem>
                <div className="inline-flex gap-1">
                  <FormLabel>Retrieve Card</FormLabel>
                </div>
                <FormControl>
                  <div className="flex items-center space-y-0 rounded-lg border p-2 align-middle">
                    <Label className="text-slate-500">
                      {field.value ? "Yes" : "No"}
                    </Label>
                    <Switch
                      checked={field.value ?? false}
                      className="ml-auto"
                      onCheckedChange={field.onChange}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="numExposures"
            render={({ field }) => (
              <FormItem>
                <FormLabel># of Exposures</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="acquireTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Acquire Time</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="usePimega"
            render={({ field }) => (
              <FormItem>
                <div className="inline-flex gap-1">
                  <FormLabel>Use Pimega</FormLabel>
                </div>
                <FormControl>
                  <div className="flex items-center space-y-0 rounded-lg border p-2 align-middle">
                    <Label className="text-slate-500">
                      {field.value ? "Yes" : "No"}
                    </Label>
                    <Switch
                      checked={field.value ?? false}
                      className="ml-auto"
                      onCheckedChange={field.onChange}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="usePicolo"
            render={({ field }) => (
              <FormItem>
                <div className="inline-flex gap-1">
                  <FormLabel>Use Picolo</FormLabel>
                </div>
                <FormControl>
                  <div className="flex items-center space-y-0 rounded-lg border p-2 align-middle">
                    <Label className="text-slate-500">
                      {field.value ? "Yes" : "No"}
                    </Label>
                    <Switch
                      checked={field.value ?? false}
                      className="ml-auto"
                      onCheckedChange={field.onChange}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="proposal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Proposal</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full"
        >
          Submit
        </Button>
      </form>
    </Form>
  );
}
