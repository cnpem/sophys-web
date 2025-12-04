"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2Icon } from "lucide-react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useQueue } from "@sophys-web/api-client/hooks";
import { api } from "@sophys-web/api-client/react";
import { cn } from "@sophys-web/ui";
import { Button } from "@sophys-web/ui/button";
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
import type { AddRegionEnergyScanProps } from "./energy-scan-utils";
import type { QueueItemProps } from "~/lib/types";
import {
  baseRegionObjectSchema,
  calculatePointsInRegion,
  convertTotalTimeToReadable,
  EnergyToK,
  spaceEnum,
} from "./energy-scan-utils";

export const PLAN_NAME = "region_energy_scan" as const;

/**
 * Schema for a single region in object format.
 * This is used for form state management.
 */
const regionObjectSchema = baseRegionObjectSchema.refine(
  (data) => data.final > data.initial,
  {
    message: "Final value must be greater than Initial value",
    path: ["final"],
  },
);

/**
 * Schema for a single region in tuple format.
 * This is used for API submission and retrieval.
 */
export const regionTupleSchema = z.tuple([
  spaceEnum,
  z.number(),
  z.number(),
  z.number(),
]);

const defaultRegionObject = {
  space: "energy-space",
  initial: 1,
  final: 1,
  step: 1,
} as const satisfies z.infer<typeof regionObjectSchema>;

/**
 * Base Schema for form validation
 */
export const baseFormSchema = z.object({
  regions: z.array(regionObjectSchema).min(1, {
    message: "At least one region is required",
  }),
  settleTime: z.coerce
    .number({
      description: "Time in ms for the settling phase",
    })
    .gt(0, "Settle Time must be a positive number"),
  acquisitionTime: z.coerce
    .number({
      description: "Time in ms for the acquisition phase",
    })
    .gt(0, "Acquisition Time must be a positive number"),
  fluorescence: z.boolean(),
  edgeEnergy: z.coerce
    .number({
      description:
        "Edge (E0) energy in eV for converting energy space to k-space",
    })
    .gt(0, "Edge Energy must be a positive number"),
  acquireThermocouple: z.boolean(),
  upAndDown: z.boolean(),
  saveFlyData: z.boolean(),
  fileName: z.string().optional(),
  metadata: z.string().optional(),
  repeats: z.coerce
    .number({
      description: "Number of repeats for the plan",
    })
    .int("Repeats must be an integer")
    .min(1, "Repeats must be at least 1"),
  proposal: z
    .string({
      description: "Proposal ID",
    })
    .min(1, "Proposal ID is required"),
});

/**
 * Subset of the form schema to be watched and calculate
 * dynamically the estimated total time of the plan
 */
const watchEstimateTimeSchema = baseFormSchema.pick({
  regions: true,
  settleTime: true,
  acquisitionTime: true,
  repeats: true,
  upAndDown: true,
});

/**
 *  Schema for submitting the complete form
 */
export const formSchema = baseFormSchema.superRefine((data, ctx) => {
  data.regions.forEach((region, index) => {
    const points = calculatePointsInRegion(region);
    // `First energy region must start lower than edge energy (e0)
    if (index === 0 && region.initial >= data.edgeEnergy) {
      ctx.addIssue({
        path: ["regions", index, "initial"],
        code: z.ZodIssueCode.custom,
        message: `First energy region must start lower than edge energy (e0)! Current e0: ${data.edgeEnergy} eV, initial energy: ${region.initial} eV`,
      });
    }
    if (index === 0 && region.final <= data.edgeEnergy) {
      ctx.addIssue({
        path: ["regions", index, "final"],
        code: z.ZodIssueCode.custom,
        message: `Last energy range must be greater than edge energy (e0)! Current e0: ${data.edgeEnergy} eV, final energy: ${region.final} eV`,
      });
    }
    // Validate if number of points of each step is at least 15 (minimum reequired by hardware)
    if (points < 15) {
      ctx.addIssue({
        path: ["regions", index, "step"],
        code: z.ZodIssueCode.custom,
        message: `Region has only ${points} points. Minimum of 15 points required per region.`,
      });
    }
    // Validate if region i-1 final is equal to region i initial
    const prevRegion = data.regions[index - 1];
    const currentRegion = region;
    if (
      prevRegion &&
      prevRegion.space === currentRegion.space &&
      prevRegion.final > currentRegion.initial
    ) {
      ctx.addIssue({
        path: ["regions", index, "initial"],
        code: z.ZodIssueCode.custom,
        message: `Region initial value (${currentRegion.initial} ${currentRegion.space === "energy-space" ? "eV" : "A"}) must be greater than or equal to previous region final value (${prevRegion.final} ${currentRegion.space === "energy-space" ? "eV" : "A"}).`,
      });
    }
    if (
      prevRegion &&
      currentRegion.space === "k-space" &&
      prevRegion.space === "energy-space" &&
      currentRegion.initial < EnergyToK(prevRegion.final, data.edgeEnergy)
    ) {
      ctx.addIssue({
        path: ["regions", index, "initial"],
        code: z.ZodIssueCode.custom,
        message: `Region initial value (${currentRegion.initial} A) must be greater than or equal to previous region final value (${EnergyToK(prevRegion.final, data.edgeEnergy)} A).`,
      });
    }
  });
});

/**
 * Default values for the form, using object structure for regions.
 */
const formDefaults = {
  regions: [defaultRegionObject],
  edgeEnergy: 0,
  settleTime: 20,
  acquisitionTime: 0,
  fluorescence: false,
  acquireThermocouple: false,
  upAndDown: false,
  saveFlyData: false,
  repeats: 1,
  proposal: "",
  metadata: "",
} as z.infer<typeof formSchema>;

/**
 * Utility to convert an array of region objects to an array of region tuples.
 * This is used for API submission.
 */
function convertRegionObjectsToTuples(
  regions: z.infer<typeof regionObjectSchema>[],
): z.infer<typeof regionTupleSchema>[] {
  return regions.map((region) => [
    region.space,
    region.initial,
    region.final,
    region.step,
  ]);
}

/**
 * Utility to convert an array of region tuples to an array of region objects.
 * This is used for pre-filling the form.
 */
export function convertRegionTuplesToObjects(
  tuples: z.infer<typeof regionTupleSchema>[],
): z.infer<typeof regionObjectSchema>[] {
  return tuples.map((tuple) => ({
    space: tuple[0],
    initial: tuple[1],
    final: tuple[2],
    step: tuple[3],
  }));
}

// ========================================================================
// Estimate total time logic
// ========================================================================

/**
 * Estimate total time in ms for the scan based on the regions, settle time, acquisition time, repeats and upAndDown

 */
function estimateTotalTimeInMs(props: z.infer<typeof watchEstimateTimeSchema>) {
  const parsed = watchEstimateTimeSchema.safeParse(props);
  if (!parsed.success) {
    return;
  }
  const { regions, settleTime, acquisitionTime, repeats, upAndDown } =
    parsed.data;

  const result = regions.reduce(
    (acc, region) => {
      const points = calculatePointsInRegion(region);
      acc.points += points;
      return acc;
    },
    { points: 0, errors: [] as string[] },
  );
  const upAndDownTimes = upAndDown ? 2 : 1;
  return (
    result.points * (settleTime + acquisitionTime) * repeats * upAndDownTimes
  );
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
            name: PLAN_NAME,
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
              name: PLAN_NAME,
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

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "regions",
  });

  // Watch regions and other relevant fields for time estimation
  const watchedRegions = useWatch({
    control: form.control,
    name: "regions",
  });
  const watchedSettleTime = useWatch({
    control: form.control,
    name: "settleTime",
  });
  const watchedAcquisitionTime = useWatch({
    control: form.control,
    name: "acquisitionTime",
  });
  const watchedRepeats = useWatch({ control: form.control, name: "repeats" });
  const watchedUpAndDown = useWatch({
    control: form.control,
    name: "upAndDown",
  });
  const watchedEdgeEnergy = useWatch({
    control: form.control,
    name: "edgeEnergy",
  });

  function handleAddNewRegion() {
    const lastRegion = watchedRegions[watchedRegions.length - 1];
    if (!lastRegion) {
      toast.error("Unexpected error: No last region found.");
      return;
    }
    const lastSpace = lastRegion.space;
    const lastFinal = lastRegion.final;

    const newRegionData: z.infer<typeof regionObjectSchema> = {
      space: lastSpace,
      initial: lastFinal,
      final: 0,
      step: 0,
    };
    append(newRegionData);
  }

  function handleRegionSpaceChange(
    index: number,
    newSpace: "k-space" | "energy-space",
  ) {
    if (newSpace !== "k-space") {
      // do nothing, we only convert to k-space and not the other way around
      return;
    }
    const currentRegion = watchedRegions[index];
    if (!currentRegion) {
      toast.error("Unexpected error: No region found at the specified index.");
      return;
    }

    // validate just the edgeEnergy
    const edgeEnergy = watchedEdgeEnergy;
    const safeEdgeEnergy = baseFormSchema
      .pick({ edgeEnergy: true })
      .safeParse({ edgeEnergy });
    if (safeEdgeEnergy.error) {
      // resetting last region selector
      update(index, {
        ...currentRegion,
        space: "energy-space",
      });
      const cause = safeEdgeEnergy.error.message;
      toast.error(`Failed to validate Edge Energy value: ${cause}`);
      return;
    }

    // Update the region at the specified index with converted values
    update(index, {
      space: "k-space",
      initial: currentRegion.initial
        ? EnergyToK(currentRegion.initial, safeEdgeEnergy.data.edgeEnergy)
        : 0,
      final: currentRegion.final
        ? EnergyToK(currentRegion.final, safeEdgeEnergy.data.edgeEnergy)
        : 0,
      step: 0,
    });
  }

  const estimatedTime = estimateTotalTimeInMs({
    regions: watchedRegions,
    settleTime: watchedSettleTime,
    acquisitionTime: watchedAcquisitionTime,
    repeats: watchedRepeats,
    upAndDown: watchedUpAndDown,
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("space-y-8", className)}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.preventDefault();
        }}
      >
        <div className="flex flex-col space-y-4">
          <div className="flex flex-row items-center space-x-4">
            <FormField
              control={form.control}
              name="edgeEnergy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Edge Energy (eV)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <ErrorMessageTooltip />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="settleTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Settle Time (ms)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <ErrorMessageTooltip />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="acquisitionTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Acquisition Time (ms)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <ErrorMessageTooltip />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="upAndDown"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Up and Down Scan?</FormLabel>
                  </div>
                  <ErrorMessageTooltip />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="saveFlyData"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Save Fly Data?</FormLabel>
                  </div>
                  <ErrorMessageTooltip />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fluorescence"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Add Fluorescence?</FormLabel>
                  </div>
                  <ErrorMessageTooltip />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="acquireThermocouple"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Acquire Thermocouple?</FormLabel>
                  </div>
                  <ErrorMessageTooltip />
                </FormItem>
              )}
            />
          </div>

          <ScrollArea className="h-64 max-h-72 w-full px-1">
            <div
              data-error={Object.keys(form.formState.errors).length > 0}
              className="flex flex-col gap-2 rounded-md border border-dashed p-4 data-[error=true]:border-red-500"
              role="region-block"
            >
              <FormLabel className="col-span-5 text-center text-lg font-semibold">
                Regions
              </FormLabel>
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="col-span-5 grid [grid-template-columns:1.2fr_1fr_1fr_1fr_0.1fr] items-center gap-2"
                >
                  {index === 0 && (
                    <>
                      <span className="text-sm font-semibold">Space</span>
                      <span className="text-sm font-semibold">Initial</span>
                      <span className="text-sm font-semibold">Final</span>
                      <span className="text-sm font-semibold">Step</span>
                      <span></span>
                    </>
                  )}
                  <FormField
                    control={form.control}
                    name={`regions.${index}.space`}
                    render={({ field: selectField }) => (
                      <FormItem className="w-full">
                        <Select
                          value={selectField.value}
                          onValueChange={(
                            value: "k-space" | "energy-space",
                          ) => {
                            selectField.onChange(value); // Update form state FIRST
                            handleRegionSpaceChange(index, value); // Then trigger custom logic
                          }}
                          disabled={
                            index === 0 ||
                            index !== fields.length - 1 ||
                            field.space === "k-space"
                          }
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select Region Type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="k-space">K-Space</SelectItem>
                            <SelectItem value="energy-space">
                              Energy Space
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <ErrorMessageTooltip />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`regions.${index}.initial`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Initial"
                            className="min-w-[9ch]"
                            {...field}
                          />
                        </FormControl>
                        <ErrorMessageTooltip />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`regions.${index}.final`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Final"
                            className="min-w-[9ch]"
                            {...field}
                          />
                        </FormControl>
                        <ErrorMessageTooltip />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`regions.${index}.step`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Step"
                            className="min-w-[9ch]"
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
                    disabled={
                      fields.length === 1 || index !== fields.length - 1
                    }
                  >
                    <Trash2Icon className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}

              <p className="text-secondary-foreground col-span-5 mt-1 text-center text-sm italic">
                Estimated Total Time:{" "}
                <span
                  data-error={!estimatedTime}
                  className="data-[error=true]:text-red-500"
                >
                  {convertTotalTimeToReadable(estimatedTime)}
                </span>
              </p>

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
              >
                Add Region
              </Button>
            </div>
          </ScrollArea>
          <div className="flex w-full flex-row items-stretch space-x-4">
            <FormField
              control={form.control}
              name="proposal"
              render={({ field }) => (
                <FormItem className="w-28 flex-shrink-0">
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
              name="fileName"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>File Name</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <ErrorMessageTooltip />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="repeats"
              render={({ field }) => (
                <FormItem className="w-20 flex-shrink-0">
                  <FormLabel>Repeats</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <ErrorMessageTooltip />
                </FormItem>
              )}
            />
          </div>
        </div>
        <FormField
          control={form.control}
          name="metadata"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Metadata</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  className="h-32 font-mono"
                  placeholder='Additional text metadata e.g. "Trying new setup. Sample looks good."'
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

export function AddRegionEnergyScan(props: AddRegionEnergyScanProps) {
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
    regions: z.array(regionTupleSchema),
    settleTime: z.coerce.number(),
    acquisitionTime: z.coerce.number(),
    fluorescence: z.boolean(),
    edgeEnergy: z.coerce.number(),
    acquireThermocouple: z.boolean(),
    upAndDown: z.boolean(),
    saveFlyData: z.boolean(),
    fileName: z.string().optional(),
    metadata: z.string().optional(),
    repeats: z.coerce.number(),
    proposal: z.string(),
  })
  .transform(
    (data) =>
      ({
        ...data,
        // convert regions from array of tuples into array of objects
        regions: convertRegionTuplesToObjects(data.regions),
      }) as const satisfies z.infer<typeof formSchema>,
  );

interface EditRegionEnergyScanFormProps
  extends Pick<QueueItemProps, "itemUid" | "kwargs"> {
  proposal?: string;
  onSubmitSuccess?: () => void;
  className?: string;
}

export function EditRegionEnergyScanForm(props: EditRegionEnergyScanFormProps) {
  const initialValues = editKwargsSchema.safeParse({
    ...props.kwargs,
    proposal: props.proposal ?? undefined,
  });
  if (!initialValues.success) {
    console.error(
      "Failed to parse kwargs for EXAFS scan regions plan",
      initialValues.error,
    );
    return <div>Error parsing plan data</div>;
  }
  if (!props.proposal) {
    return <div>Cannot edit plan without a proposal ID</div>;
  }
  return (
    <MainForm
      editItemParams={{
        itemUid: props.itemUid,
        kwargs: initialValues.data,
      }}
      proposal={props.proposal}
      onSubmitSuccess={props.onSubmitSuccess}
      className={props.className}
    />
  );
}
