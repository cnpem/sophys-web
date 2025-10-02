"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CameraIcon, Trash2Icon } from "lucide-react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useQueue } from "@sophys-web/api-client/hooks";
import { api } from "@sophys-web/api-client/react";
import { cn } from "@sophys-web/ui";
import { Button } from "@sophys-web/ui/button";
import { Checkbox } from "@sophys-web/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@sophys-web/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
import { QueueItemProps } from "~/lib/types";

export const PLAN_NAME = "region_energy_scan" as const;

const spaceEnum = z.enum(["energy-space", "k-space"]);
/**
 * Schema for a single region in object format.
 * This is used for form state management.
 */
const regionObjectSchema = z
  .object({
    space: spaceEnum,
    initial: z.coerce
      .number()
      .gt(0, { message: "Initial value must be greater than 0" }),
    final: z.coerce
      .number()
      .gt(0, { message: "Final value must be greater than 0" }),
    step: z.coerce
      .number()
      .min(0.1, { message: "Step value must be at least 0.1" }),
  })
  .refine((data) => data.final > data.initial, {
    message: "Final value must be greater than Initial value",
  });

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
 *  Schema for submitting the form
 *  Regions are now an array of objects
 */
export const formSchema = z.object({
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
    .gt(0, "Acquisition Time must a positive number"),
  fluorescence: z.boolean(),
  edgeEnergy: z.coerce
    .number({
      description:
        "Edge (E0) energy in eV for converting energy space to k-space",
    })
    .gt(0, "Edge Energy must a positive number"),
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
 * Default values for the form, using object structure for regions.
 */
const formDefaults = {
  regions: [defaultRegionObject],
  edgeEnergy: 0,
  settleTime: 0,
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

function EnergyToK(energy: number, edgeEnergy: number) {
  const value = (energy - edgeEnergy) / 3.81;
  if (value < 0) {
    console.warn(
      `Energy (${energy}) is less than Edge Energy (${edgeEnergy}). Cannot convert to k-space.`,
    );
    return 0;
  }
  return Math.round(Math.sqrt(value) * 10000) / 10000;
}

// ========================================================================
// Estimate total time logic
// ========================================================================

/**
 * Calculate number of points in a region as int((final - initial) / step)
 * returns 0 for invalid regions (no step, step <= 0, final - initial <= 0)
 * @param region
 * @returns number of points
 */
function calculatePointsInRegion(region: z.infer<typeof regionObjectSchema>): {
  points: number | undefined;
  error?: string;
} {
  return { points: Math.floor((region.final - region.initial) / region.step) };
}

const estimateTimeSchema = formSchema.pick({
  regions: true,
  settleTime: true,
  acquisitionTime: true,
  repeats: true,
  upAndDown: true,
});
/**
 * Estimate total time in ms for the scan based on the regions, settle time, acquisition time, repeats and upAndDown
 * @param regions
 * @param settleTime
 * @param acquisitionTime
 * @param repeats
 * @param upAndDown
 * @returns
 * { timeInMs: number; errors: string[] } - estimated time in ms and any errors encountered during calculation
 */
function estimateTotalTimeInMs(props: z.infer<typeof estimateTimeSchema>): {
  timeInMs: number;
  errors: string[];
} {
  const parsed = estimateTimeSchema.safeParse(props);
  const errors: string[] = [];
  if (!parsed.success) {
    parsed.error.errors.forEach((err) => {
      if (err.message) errors.push(err.message);
    });
    return { timeInMs: 0, errors };
  }
  const { regions, settleTime, acquisitionTime, repeats, upAndDown } =
    parsed.data;

  const result = regions.reduce(
    (acc, region) => {
      const { points, error } = calculatePointsInRegion(region);
      if (error) acc.errors.push(error);
      acc.points += points ?? 0;
      return acc;
    },
    { points: 0, errors: [] as string[] },
  );
  const countTotalPoints = result.points;
  const upAndDownTimes = upAndDown ? 2 : 1;
  const timeInMs =
    countTotalPoints *
    (settleTime + acquisitionTime) *
    repeats *
    upAndDownTimes;
  return {
    timeInMs,
    errors: result.errors,
  };
}

/**
 * Convert total time in ms to a readable string in seconds, minutes or hours
 * @param totalMs
 * @returns human readable string representation of estimated time (e.g. "5.0 seconds", "2.5 minutes", "1.0 hours")
 */
function convertTotalTimeToReadable(totalMs: number) {
  const oneSecondMs = 1000;
  const oneMinuteMs = 60000;
  const oneHourMs = 3600000;
  if (totalMs === 0) {
    return "Not enough data";
  } else if (totalMs < oneSecondMs) {
    return "less than a second";
  } else if (totalMs < oneMinuteMs) {
    return `${(totalMs / oneSecondMs).toFixed(1)} seconds`;
  } else if (totalMs < oneHourMs) {
    return `${(totalMs / oneMinuteMs).toFixed(1)} minutes`;
  } else {
    return `${(totalMs / oneHourMs).toFixed(1)} hours`;
  }
}

/**
 * Component to display estimated total time message based on form inputs.
 */
function EstimatedTotalTimeMessage({
  regions,
  settleTime,
  acquisitionTime,
  repeats,
  upAndDown,
}: z.infer<typeof estimateTimeSchema>) {
  const estimated = estimateTotalTimeInMs({
    regions,
    settleTime,
    acquisitionTime,
    repeats,
    upAndDown,
  });
  if (estimated.errors.length > 0) {
    return (
      <ul className="col-span-5 mt-1 list-inside list-disc text-center text-sm text-red-400 italic">
        {estimated.errors.map((error, idx) => (
          <li key={idx}>{error}</li>
        ))}
      </ul>
    );
  }
  return (
    <span className="text-secondary-foreground col-span-5 mt-1 text-center text-sm italic">
      Estimated Total Time: {convertTotalTimeToReadable(estimated.timeInMs)}
    </span>
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
    name: string;
    itemType: string;
    args?: unknown[];
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
            name: editItemParams.name,
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
            {
              name: "queue_stop",
              itemType: "instruction",
              args: [],
              kwargs: {},
            },
          ],
          pos: "front",
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

  // Watch edgeEnergy for k-space conversion logic
  const edgeEnergy = form.watch("edgeEnergy");

  function handleAddNewRegion() {
    if (isNaN(edgeEnergy)) {
      toast.error("Please enter a valid edge energy to add a k-space region.");
      return;
    }
    const regions = form.getValues("regions");
    const lastRegion = regions[regions.length - 1];
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
    const regions = form.getValues("regions");
    const currentRegion = regions[index];
    if (!currentRegion) {
      toast.error("Unexpected error: No region found at the specified index.");
      return;
    }

    if (!edgeEnergy || isNaN(edgeEnergy)) {
      toast.error("Please enter a valid edge energy before converting regions");
      return;
    }

    // Update the region at the specified index with converted values
    update(index, {
      space: "k-space",
      initial: currentRegion.initial
        ? EnergyToK(currentRegion.initial, edgeEnergy)
        : 0,
      final: currentRegion.final
        ? EnergyToK(currentRegion.final, edgeEnergy)
        : 0,
      step: 0,
    });
  }

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
                    <Input
                      type="number"
                      step="any"
                      {...field}
                      value={field.value === 0 ? "" : field.value}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
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
                    <Input
                      type="number"
                      step="any"
                      {...field}
                      value={field.value === 0 ? "" : field.value}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
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
                    <Input
                      type="number"
                      step="any"
                      {...field}
                      value={field.value === 0 ? "" : field.value}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
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
                  <FormMessage />
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
                  <FormMessage />
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
                  <FormMessage />
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
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div
            className="flex flex-col gap-2 rounded-md border border-dashed p-4"
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
                        onValueChange={(value: "k-space" | "energy-space") => {
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
                      <FormMessage />
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
                          value={field.value === 0 ? "" : field.value}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
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
                          value={field.value === 0 ? "" : field.value}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
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
                          value={field.value === 0 ? "" : field.value}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
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
                  disabled={fields.length === 1 || index !== fields.length - 1}
                >
                  <Trash2Icon className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
            <EstimatedTotalTimeMessage
              regions={watchedRegions}
              settleTime={watchedSettleTime}
              acquisitionTime={watchedAcquisitionTime}
              repeats={watchedRepeats}
              upAndDown={watchedUpAndDown}
            />
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

          <div className="flex w-full flex-row items-stretch space-x-4">
            <FormField
              control={form.control}
              name="proposal"
              render={({ field }) => (
                <FormItem className="w-28 flex-shrink-0">
                  <FormLabel>Proposal ID</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      {...field}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
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
                    <Input
                      type="text"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
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
                    <Input
                      type="number"
                      {...field}
                      value={field.value === 0 ? "" : field.value}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
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
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                  className="h-32 font-mono"
                  placeholder='Additional text metadata e.g. "Trying new setup. Sample looks good."'
                />
              </FormControl>
              <FormMessage />
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

export function AddRegionEnergyScan({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const { data } = api.auth.getUser.useQuery();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className={className}
          disabled={!data?.proposal}
        >
          <CameraIcon className="mr-2 h-4 w-4" />
          New Region Energy Scan
        </Button>
      </DialogTrigger>

      <DialogContent className="w-fit max-w-full flex-col">
        <DialogHeader>
          <DialogTitle>Example</DialogTitle>
          <DialogDescription className="flex flex-col gap-2">
            Please fill in the details below to submit the plan.
          </DialogDescription>
        </DialogHeader>
        {data?.proposal && (
          <MainForm
            proposal={data.proposal}
            onSubmitSuccess={() => setOpen(false)}
            className="w-2xl"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

// ========================================================================
// Edit Form Component and schemas
// ========================================================================

const editKwargsSchema = formSchema
  .omit({ regions: true })
  .extend({
    regions: z.array(regionTupleSchema),
  })
  .transform((data) => ({
    ...data,
    // convert regions from array of tuples into array of objects
    regions: convertRegionTuplesToObjects(data.regions),
  }));

interface EditRegionEnergyScanFormProps
  extends Pick<QueueItemProps, "name" | "itemUid" | "kwargs"> {
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
        name: props.name,
        itemType: "plan",
        kwargs: initialValues.data,
      }}
      proposal={props.proposal}
      onSubmitSuccess={props.onSubmitSuccess}
      className={props.className}
    />
  );
}
