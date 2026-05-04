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
import type { Sample } from "../store/setup1/use-sample-store";
import {
  cleaningOptions,
  picoloChannels,
  sampleTypeOptions,
  trayColumns,
  trayOptions,
  trayRows,
} from "~/app/_components/store/setup1/constants";
import { proposalSchema } from "./schemas/common";

export const planName = "setup1_complete_standard_acquisition";

export const planSchema = z.object({
  acquireTime: z.coerce.number().positive(),
  numExposures: z.coerce.number().int().positive(),
  row: z
    .string()
    .transform((val) => val.trimStart().trimEnd())
    .pipe(
      z.enum(trayRows, {
        message: `Row must be one of the following options ${trayRows.join(", ")}`,
      }),
    ),
  col: z.coerce
    .string()
    .transform((val) => val.trimStart().trimEnd())
    .pipe(
      z.enum(trayColumns, {
        message: `Column must be one of the following options ${trayColumns.join(", ")}`,
      }),
    ),
  tray: z
    .string()
    .transform((val) => val.trimStart().trimEnd())
    .pipe(
      z.enum(trayOptions, {
        message: `Tray must be one of the following options ${trayOptions.join(", ")}`,
      }),
    ),
  volume: z.coerce.number().positive(),
  proposal: proposalSchema,
  sampleTag: z
    .string()
    .min(1, "Sample name or other form of identification is required"),
  sampleType: z
    .string()
    .transform((val) => val.trimStart().trimEnd())
    .pipe(
      z.enum(sampleTypeOptions, {
        message: "Sample type must be either 'buffer' or 'sample'",
      }),
    ),
  expUvTime: z.coerce.number().positive().optional(),
  measureUvNumber: z.coerce.number().int().positive().optional(),
  temperature: z.coerce.number().positive().optional(),
  setTemperature: z.boolean().optional(),
  bufferTag: z.string().optional(),
  standardOption: z.enum(cleaningOptions).optional(),
  agentsList: z.array(z.string()).optional(),
  agentsDuration: z.array(z.coerce.number().positive()).optional(),
  picoloChannel: z
    .string()
    .transform((val) => val.trimStart().trimEnd())
    .pipe(
      z.enum(picoloChannels, {
        message: `Picolo channel must be one of the following options ${picoloChannels.join(", ")}`,
      }),
    ),
  motionSpeed: z.coerce.number().positive().optional(),
});

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
    resolver: zodResolver(planSchema),
    defaultValues: {
      proposal: userData?.proposal ?? "",
      sampleType: "sample",
      volume: 60,
      acquireTime: 0.1,
      numExposures: 1,
      expUvTime: 0,
      measureUvNumber: 0,
      temperature: 25,
      setTemperature: false,
      picoloChannel: "channel2",
      standardOption: "normal",
      motionSpeed: 0,
      ...(sampleParams && {
        tray: sampleParams.tray,
        row: sampleParams.row,
        col: sampleParams.col,
        sampleType: sampleParams.sampleType,
        sampleTag: sampleParams.sampleTag,
        bufferTag: sampleParams.bufferTag,
      }),
    },
  });

  function onSubmit(data: z.infer<typeof planSchema>) {
    toast.info("Submitting complete aquisition...");
    const kwargs = planSchema.parse({
      ...data,
    });
    add.mutate(
      {
        item: {
          name: planName,
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
            name="sampleType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sample Type</FormLabel>
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
                    {sampleTypeOptions.map((option) => {
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
            name="sampleTag"
            render={({ field }) => (
              <FormItem>
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
            name="bufferTag"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Buffer Tag</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="volume"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Volume (µL)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
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
            name="motionSpeed"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Motion Speed</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="temperature"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Temperature</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="setTemperature"
            render={({ field }) => (
              <FormItem>
                <div className="inline-flex gap-1">
                  <FormLabel>Set Temperature</FormLabel>
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
            name="standardOption"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cleaning Option</FormLabel>
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
                    {/* Filter out "custom" cleaning option */}
                    {cleaningOptions
                      .filter((option) => option !== "custom")
                      .map((option) => {
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
