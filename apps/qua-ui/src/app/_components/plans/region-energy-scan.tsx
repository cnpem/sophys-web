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

const kRegionSchema = z.object({
  space: z.literal("k-space"),
  initial: z.coerce.number().max(30).gt(0),
  final: z.coerce.number().max(30).gt(0),
  step: z.coerce.number().min(0.01),
});

const energyRegionSchema = z.object({
  space: z.literal("energy-space"),
  initial: z.coerce.number().gt(0),
  final: z.coerce.number().gt(0),
  step: z.coerce.number().min(0.1),
});

export const formSchema = z.object({
  regions: z.array(z.union([kRegionSchema, energyRegionSchema])),
  settleTime: z.coerce.number({
    description: "Time in ms for the settling phase",
  }),
  acquisitionTime: z.coerce.number({
    description: "Time in ms for the acquisition phase",
  }),
  fluorescence: z.boolean(),
  edgeEnergy: z.coerce.number({
    description:
      "Edge (E0) energy in eV for converting the energy space to k-space",
  }),
  acquireThermocouple: z.boolean().optional().default(false),
  upAndDown: z.boolean().default(false),
  saveFlyData: z.boolean().default(false),
  fileName: z.string().optional(),
  metadata: z.string().optional(),
  repeats: z.coerce
    .number({
      description: "Number of repeats for the plan",
    })
    .int()
    .min(1)
    .default(1),
  proposal: z.string({
    description: "Proposal ID",
  }),
});

// schema for reading the plan kwargs from the queue as json and converting it to the form schema
// the only difference is that the regions are tuples instead of objects and need to be converted
export const planEditSchema = z.object({
  regions: z
    .array(z.tuple([z.string(), z.number(), z.number(), z.number()]))
    .transform((regions) =>
      regions.map((region) => convertRegionTupleToObject(region)),
    ),
  settleTime: z.coerce.number(),
  acquisitionTime: z.coerce.number(),
  fluorescence: z.boolean(),
  edgeEnergy: z.coerce.number(),
  acquireThermocouple: z.boolean().optional().default(false),
  upAndDown: z.boolean().optional().default(false),
  saveFlyData: z.boolean().optional().default(false),
  fileName: z.string().optional(),
  metadata: z.string().optional(),
  repeats: z.coerce.number().int().min(1).default(1),
  proposal: z.string(),
});

// this plan performs the inverse transformation from formSchema to the plan submission schema
// changing the regions from objects to tuples
export const planSubmitSchema = z.object({
  regions: z
    .array(z.union([kRegionSchema, energyRegionSchema]))
    .min(1, "At least one region is required")
    .transform((regions) =>
      regions.map((region) =>
        convertRegionObjectToTuple(region as z.infer<typeof kRegionSchema>),
      ),
    ),
  settleTime: z.coerce.number().min(1),
  acquisitionTime: z.coerce.number().min(1),
  fluorescence: z.boolean(),
  edgeEnergy: z.coerce.number().min(1),
  // Optional fields with defaults
  acquireThermocouple: z.boolean().default(false),
  upAndDown: z.boolean().default(false),
  saveFlyData: z.boolean().default(false),
  fileName: z.string().optional(),
  metadata: z.string().optional(),
  repeats: z.coerce.number().int().min(1).default(1),
  proposal: z.string(),
});

export const planName = "region_energy_scan";

export function AddRegionEnergyScan({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const { data } = api.auth.getUser.useQuery();
  const { addBatch } = useQueue();

  function onSubmit(data: z.infer<typeof planSubmitSchema>) {
    toast.info("Submitting sample...");

    addBatch.mutate(
      {
        items: [
          {
            name: planName,
            itemType: "plan",
            args: [],
            kwargs: data,
          },
          // Add a stop instruction to the queue
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
          toast.success("Sample submitted!");
          setOpen(false);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className={className}>
          <CameraIcon className="mr-2 h-4 w-4" />
          New Region Energy Scan
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl sm:min-w-[540px]">
        <DialogHeader>
          <DialogTitle>Example</DialogTitle>
          <DialogDescription className="flex flex-col gap-2">
            Please fill in the details below to submit the plan.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] w-full">
          <PlanForm
            onSubmit={onSubmit}
            initialValues={{
              proposal: data?.proposal ?? "",
            }}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function EnergyToK(energy: number, edgeEnergy: number) {
  // Convert energy to k-space using the formula k = sqrt(2 * m * (E - E0)) / hbar
  // Here, we use the simplified formula k = sqrt((E-E0)/3.81)
  // and round to 4 decimal places
  return Math.round(Math.sqrt((energy - edgeEnergy) / 3.81) * 10000) / 10000; // Round to 4 decimal places
}

function calculateNextRegion(
  regionsArray: z.infer<typeof formSchema>["regions"],
  edgeEnergyRaw: unknown,
) {
  // Calculate the next region based on the last region in the array in the same space as the last region
  const edgeEnergy = Number(edgeEnergyRaw);
  if (isNaN(edgeEnergy)) {
    throw new Error("edgeEnergy must be a valid number");
  }
  const lastRegion = regionsArray[regionsArray.length - 1];
  if (!lastRegion) {
    // If no regions exist, create a new one in energy-space with zero values
    return {
      space: "energy-space",
      initial: 0, // Default initial value
      final: 0, // Default final value
      step: 0, // Default step value
    } as z.infer<typeof energyRegionSchema>;
  }
  const initial = lastRegion.final;
  const final = 0; // Increment by the same delta as the last region
  const step = 0; // Keep the same step
  if (lastRegion.space === "k-space") {
    // If the last region is in k-space, return a new region in k-space
    return {
      space: "k-space",
      initial,
      final,
      step,
    } as z.infer<typeof kRegionSchema>;
  } else {
    // If the last region is in energy-space, return a new region in energy-space
    return {
      space: "energy-space",
      initial,
      final,
      step,
    } as z.infer<typeof energyRegionSchema>;
  }
}

function convertRegionObjectToTuple(
  region: z.infer<typeof formSchema>["regions"][number],
) {
  return [region.space, region.initial, region.final, region.step];
}

function convertRegionTupleToObject(
  region: [string, number, number, number],
): z.infer<typeof kRegionSchema> | z.infer<typeof energyRegionSchema> {
  const [space, initial, final, step] = region;
  if (space === "k-space") {
    return { space, initial, final, step } as z.infer<typeof kRegionSchema>;
  } else {
    return { space, initial, final, step } as z.infer<
      typeof energyRegionSchema
    >;
  }
}

const requiredDefaults = {
  regions: [
    {
      space: "energy-space",
      initial: 0,
      final: 0,
      step: 0,
    },
  ],
  edgeEnergy: 0,
  settleTime: 0,
  acquisitionTime: 0,
  fluorescence: false,
  acquireThermocouple: false,
  upAndDown: false,
  saveFlyData: false,
  repeats: 1,
  proposal: "",
} as z.infer<typeof formSchema>;

export function PlanForm({
  className,
  onSubmit,
  initialValues,
}: {
  className?: string;
  onSubmit: (data: z.infer<typeof planSubmitSchema>) => void;
  initialValues?: Partial<z.infer<typeof planEditSchema>>;
}) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...requiredDefaults,
      ...initialValues, // override with initial values if provided
    } as z.infer<typeof formSchema>,
    // mode: "onSubmit",
  });

  // Use useFieldArray for managing the 'regions' array
  const {
    fields: regionsArrayFields,
    append,
    remove,
    update,
  } = useFieldArray({
    control: form.control,
    name: "regions",
  });

  function handleInternalTransformSubmit(data: z.infer<typeof formSchema>) {
    // Transform regions to tuples for submissiion from formSchema to planSchema
    console.log("handling transform submit with data:", data);
    const transformed = planSubmitSchema.safeParse(data);
    if (!transformed.success) {
      toast.error(`Failed to transform data: ${transformed.error.message}`);
      return;
    }
    console.log("Transformed data:", transformed.data);

    onSubmit(transformed.data);
  }

  function handleRegionSpaceChange(index: number, newSpace: string) {
    if (newSpace !== "k-space") {
      // do nothing, we only convert to k-space and not the other way around
      return;
    }
    const currentRegion = form.getValues(`regions.${index}`);
    const edgeEnergy = form.getValues("edgeEnergy");

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

  function handleAddNewRegion() {
    const regions = form.getValues("regions");
    const edgeEnergy = form.getValues("edgeEnergy");
    try {
      const newRegion = calculateNextRegion(regions, edgeEnergy);
      append(newRegion);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unknown error occurred while adding a new region");
      }
    }
  }

  // Watch relevant fields for estimated time calculation
  const watchedRegions = useWatch({
    control: form.control,
    name: "regions",
    exact: true,
  });
  const watchedSettleTime = useWatch({
    control: form.control,
    name: "settleTime",
    exact: true,
  });
  const watchedAcquisitionTime = useWatch({
    control: form.control,
    name: "acquisitionTime",
    exact: true,
  });
  const watchedRepeats = useWatch({ control: form.control, name: "repeats" });
  const watchedUpAndDown = useWatch({
    control: form.control,
    name: "upAndDown",
    exact: true,
  });

  const estimatedTotalTime = () => {
    // Calculate total time in milliseconds
    const oneSecondMs = 1000;
    const oneMinuteMs = 60000;
    const oneHourMs = 3600000;
    const numRegions = watchedRegions.length;
    const settleTime = z.coerce.number().default(0).parse(watchedSettleTime);
    const acquisitionTime = z.coerce
      .number()
      .default(0)
      .parse(watchedAcquisitionTime);
    const repeats = z.coerce.number().default(1).parse(watchedRepeats);
    const upAndDownTimes = watchedUpAndDown ? 2 : 1;
    const totalTimeMs =
      numRegions * (settleTime + acquisitionTime) * repeats * upAndDownTimes;
    // decide to show in seconds, minutes or hours based on the value
    if (totalTimeMs < oneSecondMs) {
      // less than a second, just show a message
      return "less than a second";
    } else if (totalTimeMs < oneMinuteMs) {
      // less than a minute, show in seconds
      return `${(totalTimeMs / oneSecondMs).toFixed(1)} seconds`;
    } else if (totalTimeMs < oneHourMs) {
      // less than an hour, show in minutes
      return `${(totalTimeMs / oneMinuteMs).toFixed(1)} minutes`;
    } else {
      // more than an hour, show in hours
      return `${(totalTimeMs / oneHourMs).toFixed(1)} hours`;
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleInternalTransformSubmit)}
        className={cn("space-y-8", className)}
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
                    <Input type="number" step="any" {...field} />
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
                    <Input type="number" step="any" {...field} />
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

            {regionsArrayFields.map((field, index) => (
              <div
                key={field.id} // Use field.id for unique key prop
                className="col-span-5 grid [grid-template-columns:1.2fr_1fr_1fr_1fr_0.1fr] items-center gap-2"
              >
                {
                  // Only show the header on the first row
                  index === 0 && (
                    <>
                      <span className="text-sm font-semibold">Space</span>
                      <span className="text-sm font-semibold">Initial</span>
                      <span className="text-sm font-semibold">Final</span>
                      <span className="text-sm font-semibold">Step</span>
                      <span></span>
                    </>
                  )
                }
                <Select
                  // disabled if it is the first region or not the last region
                  disabled={
                    index === 0 || index !== regionsArrayFields.length - 1
                  }
                  value={field.space}
                  onValueChange={(value) => {
                    handleRegionSpaceChange(index, value);
                  }}
                >
                  <FormControl>
                    <SelectTrigger
                      disabled={field.space === "k-space"}
                      className="w-full"
                    >
                      <SelectValue placeholder="Select Region Type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="k-space">K-Space</SelectItem>
                    <SelectItem value="energy-space">Energy Space</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  placeholder="Initial"
                  {...form.register(`regions.${index}.initial`, {
                    valueAsNumber: true,
                  })}
                  step="any"
                />
                <Input
                  type="number"
                  placeholder="Final"
                  {...form.register(`regions.${index}.final`, {
                    valueAsNumber: true,
                  })}
                  step="any"
                />
                <Input
                  type="number"
                  placeholder="Step"
                  {...form.register(`regions.${index}.step`, {
                    valueAsNumber: true,
                  })}
                  step="any"
                  // capture keypress enter to add a new region
                  onKeyDown={(e) => {
                    // only add a new region if it is the last region
                    if (index !== regionsArrayFields.length - 1) {
                      return;
                    }
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddNewRegion();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-1 p-1"
                  onClick={() => remove(index)}
                  // disabled if it is the first region or not the last region
                  disabled={
                    index === 0 || index !== regionsArrayFields.length - 1
                  }
                >
                  <Trash2Icon className="h-4 w-4 text-red-500" />
                </Button>
                <FormMessage />
              </div>
            ))}
            {/* show estimated total time */}
            <span className="text-secondary-foreground col-span-5 mt-2 text-center text-sm italic">
              Estimated Total Time: {estimatedTotalTime()}
            </span>
            <Button
              type="button"
              variant="default"
              className="col-span-5"
              onClick={handleAddNewRegion}
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
              name="repeats"
              render={({ field }) => (
                <FormItem className="w-20 flex-shrink-0">
                  <FormLabel>Repeats</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value}
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
                  value={field.value}
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
