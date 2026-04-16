import type { z } from "zod";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
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
  name,
  schema,
} from "~/app/_components/plans/schemas/setup2-complete-acquisition";
import { picoloChannels } from "~/app/_components/store/setup1/constants";
import {
  cardColumns,
  cardIndexOptions,
  cardRows,
} from "../store/setup2/constants";

export function CompleteAcquisitionForm({
  sampleParams,
  className,
  onSubmitSuccess,
}: {
  sampleParams: Sample | undefined;
  className?: string;
  onSubmitSuccess: () => void;
}) {
  const { add } = useQueue();
  const { data: userData } = api.auth.getUser.useQuery();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      proposal: userData?.proposal ?? "",
      sampleTag: "",
      acquireTime: 0.1,
      numExposures: 1,
      col: sampleParams?.column ?? "A",
      row: sampleParams?.row ?? "1",
      cardIndex: sampleParams?.cardIndex,
      // cardName: sampleParams?.cardName,
      cardName: "",
      retrieveCard: true,
      usePimega: true,
      usePicolo: false,
      picoloChannel: undefined,
      samplePosX: sampleParams?.samplePositionX,
      samplePosY: sampleParams?.samplePositionY,
    },
  });

  const watchUsePicolo = useWatch({
    control: form.control,
    name: "usePicolo",
  });

  useEffect(() => {
    if (!watchUsePicolo) {
      form.setValue("picoloChannel", undefined);
    }
  }, [watchUsePicolo, form]);

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
            name="picoloChannel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Picolo Channel</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={!watchUsePicolo}
                  value={watchUsePicolo ? (field.value ?? "") : ""}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {picoloChannels.map((option) => {
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
