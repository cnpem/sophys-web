"use client";

import { useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2Icon } from "lucide-react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import {
  CartesianGrid,
  Label,
  LabelList,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { z } from "zod";
import type { ChartConfig } from "@sophys-web/ui/chart";
import { useQueue } from "@sophys-web/api-client/hooks";
import { api } from "@sophys-web/api-client/react";
import { cn } from "@sophys-web/ui";
import { Button } from "@sophys-web/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@sophys-web/ui/chart";
import { Checkbox } from "@sophys-web/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@sophys-web/ui/form";
import { Input } from "@sophys-web/ui/input";
import { ScrollArea } from "@sophys-web/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@sophys-web/ui/select";
import { Textarea } from "@sophys-web/ui/textarea";
import { ErrorMessageTooltip } from "@sophys-web/widgets/form-components/info-tooltip";
import type { QueueItemProps } from "~/lib/types";

export const PLAN_NAME_HEAT = "heat_sample" as const;

export const rampTypeEnum = z.enum(["ramp", "dwell"]);
export const endTypeEnum = z.enum(["dwell", "reset"]);
export const devicesAllowed = z.enum(["blower", "furnance"]);

interface AddHeatProps {
  className: string;
  onSubmitSuccess?: () => void;
}

/**
 * Schema for a single region in object format,
 * used for form state and validation.
 */
const baseRegionObjectSchema = z.object({
  ramp: rampTypeEnum,
  rate: z.coerce.number(),
  temperature: z.coerce.number(),
  duration: z.coerce.number(),
});

/**
 * Schema for a single region in tuple format.
 * This is used for API submission and retrieval.
 */
export const regionTupleSchema = z.tuple([
  rampTypeEnum,
  z.number(),
  z.number(),
  z.number(),
]);

const defaultRegionObject = {
  ramp: "ramp",
  rate: 1,
  temperature: 25,
  duration: 1,
} as const satisfies z.infer<typeof baseRegionObjectSchema>;

/**
 * Base Schema for form validation
 */
export const baseFormSchema = z.object({
  regions: z.array(baseRegionObjectSchema).min(1, {
    message: "At least one region is required",
  }),
  endType: endTypeEnum,
  blockQueue: z.boolean(),
  device: devicesAllowed,
  proposal: z
    .string({
      description: "Proposal ID",
    })
    .min(1, "Proposal ID is required"),
  metadata: z.string().optional(),
});

/**
 * This check is done here to avoid problems if the user sets
 * temperature to an invalid number and then changes the ramp type,
 * which would cause the form to invalidate if we had strict validation
 * on the temperature and rate fields depending on the ramp type. Also,
 * the check of ramp rate is due to equipment safety reasons,
 * as high ramp rates above 400ºC can be dangerous for the equipment.
 */
const formSchema = baseFormSchema.superRefine((data, ctx) => {
  data.regions.forEach((region, index) => {
    if (region.ramp === "ramp" && region.rate > 5 && region.temperature > 400) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["regions", index, "rate"],
        message:
          "Above 400ºC, Ramp Rate must be 5ºC/min or less for equipament safety reasons.",
      });
    }
    if (region.ramp === "ramp" && region.rate <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["regions", index, "rate"],
        message: "Ramp Rate must be greater than 0ºC/min.",
      });
    }
    if (region.ramp === "ramp" && region.rate > 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["regions", index, "rate"],
        message: "Ramp Rate must be lower or equal than 10ºC/min.",
      });
    }
    if (region.ramp === "ramp" && region.temperature < 20) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["regions", index, "temperature"],
        message: "Temperature value must be greater than 20 ºC",
      });
    }
    if (region.ramp === "ramp" && region.temperature > 1000) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["regions", index, "temperature"],
        message: "Temperature value must be lower or equal than 1000 ºC",
      });
    }
    if (region.ramp === "dwell" && region.duration <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["regions", index, "duration"],
        message: "Duration must be greater than 0 min",
      });
    }
  });
});

/**
 * Default values for the form, using object structure for regions.
 */
const formDefaults = {
  regions: [defaultRegionObject],
  endType: "reset",
  device: "blower",
  blockQueue: true,
  proposal: "",
  metadata: "",
} as z.infer<typeof formSchema>;

/**
 * Utility to convert an array of region objects to an array of region tuples.
 * This is used for API submission.
 */
function convertRegionObjectsToTuples(
  regions: z.infer<typeof baseRegionObjectSchema>[],
): z.infer<typeof regionTupleSchema>[] {
  return regions.map((region) => [
    region.ramp,
    region.rate,
    region.temperature,
    region.duration,
  ]);
}

/**
 * Utility to convert an array of region tuples to an array of region objects.
 * This is used for pre-filling the form.
 */
export function convertRegionTuplesToObjects(
  tuples: z.infer<typeof regionTupleSchema>[],
): z.infer<typeof baseRegionObjectSchema>[] {
  return tuples.map((tuple) => ({
    ramp: tuple[0],
    rate: tuple[1],
    temperature: tuple[2],
    duration: tuple[3],
  }));
}

/**
 * Generate chart data points from the watched regions.
 * @param watchedRegions - Array of region objects representing the current state of the form regions.
 * @returns Array of chart data points with time and temperature.
 */
export function generateChartDataFromRegions(
  watchedRegions: z.infer<typeof baseRegionObjectSchema>[],
) {
  let time = 0;
  let currentTemp = 20;

  /**
   * Add first point at time 0 with initial temperature (assumed to be 20ºC ~ room temperature)
   * We are assuming that this plan will be used for heating up samples from room temperature,
   * so we start the plot at 20ºC. This also allows to visualize the initial ramp up from room temperature
   * to the first target temperature.
   */
  const data: { time: number; temperature: number }[] = [
    { time: time, temperature: currentTemp },
  ];

  watchedRegions.forEach((region) => {
    const rate = region.rate;
    const targetTemp = region.temperature;
    const duration = region.duration;

    if (region.ramp === "ramp") {
      if (rate > 0) {
        const deltaT = targetTemp - currentTemp;
        const rampTimeMin = Math.abs(deltaT / rate);

        time += rampTimeMin;
        currentTemp = targetTemp;

        data.push({
          time,
          temperature: currentTemp,
        });
      }
    }

    if (region.ramp === "dwell") {
      const dwellTimeMin = duration;

      time += Number(dwellTimeMin);

      data.push({
        time,
        temperature: currentTemp,
      });
    }
  });

  return data;
}

// =========================================================================
// MainForm Component
// =========================================================================

/**
 * Main form component for the Region Energy Scan plan.
 * Handles both creation and editing of plans.
 * Props:
 * - className: optional class name for styling
 * - proposal: proposal ID to associate with the plan
 * - editItemParams: optional parameters for editing an existing plan
 * - onSubmitSuccess: optional callback to be triggered on submit success.
 *
 * If editItemParams is provided, the form will be pre-filled with the existing plan data.
 * and submitting the form will update the existing plan instead of creating a new one in the queue.
 */
export function MainForm({
  className,
  proposal,
  editItemParams,
  onSubmitSuccess,
}: {
  className?: string;
  proposal: string;
  editItemParams?: {
    kwargs: z.infer<typeof formSchema>;
    itemUid: string;
  };
  onSubmitSuccess?: () => void;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...formDefaults,
      ...editItemParams?.kwargs,
      proposal,
    },
  });

  const { addBatch: submitPlan, update: editPlan } = useQueue();

  function onSubmit(formData: z.infer<typeof formSchema>) {
    const apiData = {
      ...formData,
      regions: convertRegionObjectsToTuples(formData.regions),
    };

    if (editItemParams) {
      editPlan.mutate(
        {
          item: {
            name: PLAN_NAME_HEAT,
            itemType: "plan",
            args: [],
            kwargs: apiData,
            itemUid: editItemParams.itemUid,
          },
        },
        {
          onSuccess: () => {
            if (onSubmitSuccess) onSubmitSuccess();
          },
          onError: (error) => {
            toast.error("Failed to edit plan", {
              description: error.message,
              closeButton: true,
            });
          },
        },
      );
    } else {
      submitPlan.mutate(
        {
          items: [
            {
              name: PLAN_NAME_HEAT,
              itemType: "plan",
              args: [],
              kwargs: apiData,
            },
          ],
          pos: "back",
        },
        {
          onSuccess: () => {
            if (onSubmitSuccess) onSubmitSuccess();
          },
          onError: (error) => {
            toast.error("Failed to submit", {
              description: error.message,
              closeButton: true,
            });
          },
        },
      );
    }
  }

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "regions",
  });

  // Watch regions and other relevant fields for plotting actions
  const watchedRegions = useWatch({
    control: form.control,
    name: "regions",
  });

  function handleAddNewRegion() {
    const lastRegion = watchedRegions[watchedRegions.length - 1];
    if (!lastRegion) {
      toast.error("Unexpected error: No last region found.");
      return;
    }
    const newRegionData: z.infer<typeof baseRegionObjectSchema> = {
      ramp: "ramp",
      rate: 4,
      temperature: lastRegion.temperature,
      duration: lastRegion.duration,
    };
    append(newRegionData);
  }

  /**
   * Chart data for the temperature ramping process. It is calculated based on the regions defined in the form,
   * simulating the temperature changes over time according to the ramp rates and dwell times.
   * This allows users to visualize the heating profile they are creating or editing in real-time as they modify the regions.
   * The time is calculated in minutes, and the temperature is calculated based on the ramp rates and dwell times.
   * For ramp regions, the time to reach the target temperature is calculated based on the rate, and for dwell regions,
   * the time is simply increased by the dwell duration while keeping the temperature constant.
   */

  const chartData = useMemo(
    () => generateChartDataFromRegions(watchedRegions),
    [watchedRegions],
  );

  const chartConfig = {
    temperature: {
      label: "Temperature ",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("space-y-8", className)}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.preventDefault();
        }}
      >
        <div className="flex flex-col space-y-2">
          <ChartContainer className="max-h-55 w-full" config={chartConfig}>
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{
                top: 23,
                left: 10,
                right: 15,
                bottom: 10,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="time"
                type="number"
                tickLine={true}
                axisLine={true}
                tickMargin={8}
              >
                <Label value="Time [min]" offset={-1} position="bottom" />
              </XAxis>
              <YAxis
                dataKey="temperature"
                tickLine={true}
                axisLine={true}
                tickMargin={8}
              >
                <Label
                  value="Temperature [ºC]"
                  angle={-90}
                  dx={-20}
                  position="inside"
                />
              </YAxis>
              <Line
                dataKey="temperature"
                type="linear"
                stroke="var(--color-temperature)"
                strokeWidth={2}
                dot={{
                  fill: "var(--color-temperature)",
                }}
                activeDot={{
                  r: 6,
                }}
              >
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      hideLabel
                      formatter={(value, name) => (
                        <div className="text-muted-foreground flex min-w-[130px] items-center text-xs">
                          {chartConfig[name as keyof typeof chartConfig]
                            .label || name}
                          <div className="text-foreground ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums">
                            {value}
                            <span className="text-muted-foreground font-normal">
                              ºC
                            </span>
                          </div>
                        </div>
                      )}
                    />
                  }
                  cursor={false}
                  defaultIndex={1}
                />
                <LabelList
                  position="top"
                  offset={12}
                  className="fill-foreground"
                  fontSize={12}
                />
              </Line>
            </LineChart>
          </ChartContainer>
          <div className="flex flex-col gap-2 rounded-md p-4">
            <FormLabel className="col-span-5 text-center text-lg font-semibold">
              Regions
            </FormLabel>

            <div
              key="header"
              className="col-span-5 grid [grid-template-columns:1.2fr_1.3fr_1.9fr_1.4fr_0.1fr] items-center gap-2 px-1"
            >
              <span className="text-sm font-semibold">Type</span>
              <span className="text-sm font-semibold">Rate [ºC/min]</span>
              <span className="text-sm font-semibold">Temperature [ºC]</span>
              <span className="text-sm font-semibold">Duration [min]</span>

              <span></span>
            </div>
          </div>
          <ScrollArea className="h-42 min-h-34 w-full px-1">
            <div
              data-error={Object.keys(form.formState.errors).length > 0}
              className="flex flex-col gap-2 rounded-md border border-dashed p-4 data-[error=true]:border-red-500"
              role="region-block"
            >
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="col-span-5 grid [grid-template-columns:1.2fr_1.3fr_1.9fr_1.4fr_0.1fr] items-center gap-2"
                >
                  <FormField
                    control={form.control}
                    name={`regions.${index}.ramp`}
                    render={({ field: selectField }) => (
                      <FormItem className="w-full">
                        <Select
                          value={selectField.value}
                          onValueChange={selectField.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Region Type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ramp">Ramp</SelectItem>
                            <SelectItem value="dwell">Dwell</SelectItem>
                          </SelectContent>
                        </Select>
                        <ErrorMessageTooltip />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`regions.${index}.rate`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            className="min-w-[9ch]"
                            disabled={
                              form.getValues(`regions.${index}.ramp`) !== "ramp"
                            }
                            {...field}
                          />
                        </FormControl>
                        <ErrorMessageTooltip />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`regions.${index}.temperature`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            className="min-w-[9ch]"
                            disabled={
                              form.getValues(`regions.${index}.ramp`) !== "ramp"
                            }
                            {...field}
                          />
                        </FormControl>
                        <ErrorMessageTooltip />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`regions.${index}.duration`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            className="min-w-[9ch]"
                            disabled={
                              form.getValues(`regions.${index}.ramp`) !==
                              "dwell"
                            }
                            {...field}
                          />
                        </FormControl>
                        <ErrorMessageTooltip />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-1 p-1"
                    onClick={() => remove(index)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        remove(index);
                      }
                    }}
                    disabled={fields.length === 1}
                  >
                    <Trash2Icon className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
          <Button
            type="button"
            variant="default"
            className="col-span-5"
            onClick={handleAddNewRegion}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddNewRegion();
              }
            }}
            disabled={watchedRegions.length >= 16}
          >
            Add Region
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <FormField
            control={form.control}
            name={`endType`}
            render={({ field: selectField }) => (
              <FormItem>
                <FormLabel>End type</FormLabel>
                <Select
                  value={selectField.value}
                  onValueChange={selectField.onChange}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select end type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="reset">Finish</SelectItem>
                    <SelectItem value="dwell">Hold last setpoint</SelectItem>
                  </SelectContent>
                </Select>
                <ErrorMessageTooltip />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`device`}
            render={({ field: selectField }) => (
              <FormItem>
                <FormLabel>Heater Device</FormLabel>
                <Select
                  value={selectField.value}
                  onValueChange={selectField.onChange}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select heater device" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="blower">Gas Blower</SelectItem>
                    <SelectItem value="furnance">Furnance</SelectItem>
                  </SelectContent>
                </Select>
                <ErrorMessageTooltip />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="proposal"
            render={({ field }) => (
              <FormItem className="">
                <FormLabel>Proposal ID</FormLabel>
                <FormControl>
                  <Input type="text" {...field} />
                </FormControl>
                <ErrorMessageTooltip />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="blockQueue"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-y-0 space-x-3 rounded-md border p-2.5">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Wait until done</FormLabel>
                </div>
                <ErrorMessageTooltip />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="metadata"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Metadata</FormLabel>
              <FormControl>
                <Textarea
                  disabled // Metadata is currently not supported in the backend, so we disable the input for now to avoid confusion. It can be enabled once the backend supports it.
                  {...field}
                  rows={2}
                  className="font-mono"
                  placeholder={
                    'Additional text metadata e.g. "Trying new setup. Sample looks good."'
                  }
                />
              </FormControl>
              <ErrorMessageTooltip />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          Submit
        </Button>
      </form>
    </Form>
  );
}

// ========================================================================
// Add New Plan Dialog Component
// ========================================================================

export function AddHeat(props: AddHeatProps) {
  const { data } = api.auth.getUser.useQuery();
  return (
    <MainForm
      proposal={data?.proposal ?? ""}
      onSubmitSuccess={props.onSubmitSuccess}
      className={props.className}
    />
  );
}

// ========================================================================
// Edit Form Component and schemas
// ========================================================================

/**
 * Schema for parsing queue items into the form inputs with less rigorous validation.
 */
const editKwargsSchema = z
  .object({
    regions: z.array(regionTupleSchema).min(1, {
      message: "At least one region is required",
    }),
    blockQueue: z.boolean(),
    proposal: z.string(),
    endType: endTypeEnum,
    device: devicesAllowed,
    metadata: z.string().optional(),
  })
  .transform(
    (data) =>
      ({
        ...data,
        // convert regions from array of tuples into array of objects
        regions: convertRegionTuplesToObjects(data.regions),
      }) as const satisfies z.infer<typeof formSchema>,
  );

interface EditHeatFormProps extends Pick<QueueItemProps, "itemUid" | "kwargs"> {
  onSubmitSuccess?: () => void;
  className?: string;
}

export function EditHeatForm(props: EditHeatFormProps) {
  const { data: userData } = api.auth.getUser.useQuery();
  const userProposal = userData?.proposal;
  const initialValues = editKwargsSchema.safeParse({
    ...props.kwargs,
    proposal: userProposal,
  });
  if (!initialValues.success) {
    console.error("Failed to parse kwargs for heat plan", initialValues.error);
    return <div>Error parsing plan data</div>;
  }
  if (!userProposal) {
    return <div>Cannot edit plan without a proposal ID</div>;
  }
  return (
    <MainForm
      editItemParams={{
        itemUid: props.itemUid,
        kwargs: initialValues.data,
      }}
      proposal={userProposal}
      onSubmitSuccess={props.onSubmitSuccess}
      className={props.className}
    />
  );
}
