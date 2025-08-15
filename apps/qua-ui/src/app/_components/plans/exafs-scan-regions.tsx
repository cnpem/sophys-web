"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CameraIcon, Trash2Icon } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
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
  initial: z.coerce.number().min(0).max(30),
  final: z.coerce.number().min(0).max(30),
  step: z.coerce.number().min(0.01),
});

const energyRegionSchema = z.object({
  space: z.literal("energy-space"),
  initial: z.coerce.number().min(0),
  final: z.coerce.number().min(0),
  step: z.coerce.number().min(0.1),
});

export const planSchema = z.object({
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
  upAndDown: z.boolean().optional().default(false),
  saveFlyData: z.boolean().optional().default(false),
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
  proposal: z.string().optional(),
});

export const planName = "region_energy_scan";

export function AddExafsScanRegions({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const { data } = api.auth.getUser.useQuery();
  const { addBatch } = useQueue();

  function onSubmit(data: z.infer<typeof planSchema>) {
    toast.info("Submitting sample...");
    // const kwargs = data;
    // const repeatedItems = generateRepeatedItems(data);

    addBatch.mutate(
      {
        items: [
          // ...repeatedItems,
          {
            name: planName,
            itemType: "plan",
            args: [],
            kwargs: {
              regions: data.regions.map(convertRegionObjectToTuple),
              settleTime: data.settleTime,
              acquisitionTime: data.acquisitionTime,
              fluorescence: data.fluorescence,
              edgeEnergy: data.edgeEnergy,
              acquireThermocouple: data.acquireThermocouple,
              upAndDown: data.upAndDown,
              saveFlyData: data.saveFlyData,
              fileName: data.fileName,
              proposal: data.proposal,
              metadata: data.metadata,
              repeats: data.repeats,
            },
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
          Example
        </Button>
      </DialogTrigger>

      <DialogContent className="*:min-w-2/3 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Example</DialogTitle>
          <DialogDescription className="flex flex-col gap-2">
            Please fill in the details below to submit the plan.
          </DialogDescription>
        </DialogHeader>
        <PlanForm proposal={data?.proposal} onSubmit={onSubmit} />
      </DialogContent>
    </Dialog>
  );
}

function EnergyToK(energy: number) {
  // Convert energy to k-space using the formula k = sqrt(2 * m * (E - E0)) / hbar
  // Here, we use the simplified formula k = sqrt(E/3.81)
  return Math.sqrt(energy / 3.81);
}

function KToEnergy(k: number) {
  // Convert k-space to energy using the formula E = (hbar^2 * k^2) / (2 * m)
  // Here, we use the simplified formula E = 3.81 * k^2
  return 3.81 * k * k;
}

function calculateNewRegionInEnergy(
  regionsArray: z.infer<typeof planSchema>["regions"],
  edgeEnergyRaw: unknown,
) {
  const edgeEnergy = Number(edgeEnergyRaw);
  if (isNaN(edgeEnergy)) {
    throw new Error("edgeEnergy must be a valid number");
  }
  // Calculate the new region based on the existing regions
  const lastRegion = regionsArray[regionsArray.length - 1];
  if (!lastRegion) {
    // If no regions exist, create a new one starting from edgeEnergy
    return {
      space: "energy-space",
      initial: edgeEnergy,
      final: edgeEnergy + 0.1, // Default step of 0.1 eV
      step: 0.1,
    } as z.infer<typeof energyRegionSchema>;
  }

  if (lastRegion.space === "k-space") {
    const initial = KToEnergy(lastRegion.final) + edgeEnergy;
    const step = KToEnergy(lastRegion.step);
    const final = initial + step; // Increment by step
    return {
      space: "energy-space",
      initial,
      final,
      step,
    } as z.infer<typeof energyRegionSchema>;
  } else {
    // If the last region is already in energy-space, just return it with the added step
    const initial = lastRegion.final;
    const step = lastRegion.step;
    const final = initial + step; // Increment by step
    return {
      space: "energy-space",
      initial,
      final,
      step,
    } as z.infer<typeof energyRegionSchema>;
  }
}

function convertRegionKtoEnergy(
  region: z.infer<typeof kRegionSchema>,
  edgeEnergyRaw: unknown,
): z.infer<typeof energyRegionSchema> {
  const edgeEnergy = Number(edgeEnergyRaw);
  if (isNaN(edgeEnergy)) {
    throw new Error("edgeEnergy must be a valid number");
  }

  // Convert k-space region to energy-space region
  return {
    space: "energy-space",
    initial: KToEnergy(region.initial) + edgeEnergy,
    final: KToEnergy(region.final) + edgeEnergy,
    step: KToEnergy(region.step),
  } as z.infer<typeof energyRegionSchema>;
}

function convertRegionEnergyToK(
  region: z.infer<typeof energyRegionSchema>,
): z.infer<typeof kRegionSchema> {
  // Convert energy-space region to k-space region
  return {
    space: "k-space",
    initial: EnergyToK(region.initial),
    final: EnergyToK(region.final),
    step: EnergyToK(region.step),
  } as z.infer<typeof kRegionSchema>;
}

function convertRegionObjectToTuple(
  region: z.infer<typeof planSchema>["regions"][number],
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

type defaultValuesPartial = Partial<z.infer<typeof planSchema>>;

export function PlanForm({
  proposal,
  className,
  onSubmit,
  defaultValues = {
    regions: [],
    settleTime: 0,
    acquisitionTime: 0,
    edgeEnergy: 0,
    fluorescence: false,
    acquireThermocouple: false,
    upAndDown: false,
    saveFlyData: false,
    repeats: 1,
  },
}: {
  proposal?: string;
  className?: string;
  onSubmit: (data: z.infer<typeof planSchema>) => void;
  defaultValues?: defaultValuesPartial;
}) {
  const form = useForm<z.infer<typeof planSchema>>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      ...defaultValues,
      proposal,
    },
  });

  // Use useFieldArray for managing the 'regions' array
  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "regions",
  });

  function handleUpdateRegionField(
    index: number,
    fieldName:
      | keyof z.infer<typeof kRegionSchema>
      | keyof z.infer<typeof energyRegionSchema>,
    inputValue: string,
  ) {
    const value = parseFloat(inputValue);
    if (isNaN(value)) return;
    const currentRegion = form.getValues("regions")[index];
    if (!currentRegion) return;

    // if the field is "step", it updates the final based on initial + step
    // else it just updates the specific field
    const updatedRegion = {
      ...currentRegion,
      [fieldName]: value,
    };
    if (fieldName === "step") {
      updatedRegion.final = updatedRegion.initial + value;
    }

    // Validate the updated region based on its space type
    if (currentRegion.space === "k-space") {
      const parsed = kRegionSchema.safeParse(updatedRegion);
      if (parsed.success) {
        update(index, parsed.data);
      } else {
        toast.error(`Invalid K-Space region: ${parsed.error.message}`);
      }
    } else {
      const parsed = energyRegionSchema.safeParse(updatedRegion);
      if (parsed.success) {
        update(index, parsed.data);
      } else {
        toast.error(`Invalid Energy Space region: ${parsed.error.message}`);
      }
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
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
                </FormItem>
              )}
            />

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
                </FormItem>
              )}
            />
          </div>

          <div
            className="flex flex-col space-y-4 rounded-md border border-dashed p-4"
            role="region-block"
          >
            <FormLabel>Regions</FormLabel>
            <div className="flex flex-col space-y-2">
              {fields.map((field, index) => (
                <div
                  key={field.id} // Use field.id for unique key prop
                  className="flex flex-row items-center space-x-2"
                >
                  <Select
                    value={field.space}
                    onValueChange={(value) => {
                      // When changing space type, update the existing region
                      // and provide default values for the new type
                      if (value === "k-space") {
                        const regionInE = energyRegionSchema.safeParse(field);
                        if (!regionInE.success) {
                          toast.error("Failed to parse region data");
                          return;
                        }
                        update(index, convertRegionEnergyToK(regionInE.data));
                      } else {
                        const regionInK = kRegionSchema.safeParse(field);
                        if (!regionInK.success) {
                          toast.error("Failed to parse region data");
                          return;
                        }
                        const edgeEnergy = form.getValues("edgeEnergy");
                        update(
                          index,
                          convertRegionKtoEnergy(regionInK.data, edgeEnergy),
                        );
                      }
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
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
                    onChange={(e) =>
                      handleUpdateRegionField(index, "initial", e.target.value)
                    }
                    step="any"
                  />
                  <Input
                    type="number"
                    placeholder="Final"
                    {...form.register(`regions.${index}.final`, {
                      valueAsNumber: true,
                    })}
                    onChange={(e) =>
                      handleUpdateRegionField(index, "final", e.target.value)
                    }
                    step="any"
                  />
                  <Input
                    type="number"
                    placeholder="Step"
                    {...form.register(`regions.${index}.step`, {
                      valueAsNumber: true,
                    })}
                    onChange={(e) =>
                      handleUpdateRegionField(index, "step", e.target.value)
                    }
                    step="any"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-1 p-1"
                    onClick={() => remove(index)}
                  >
                    <Trash2Icon className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="default"
                className="w-full"
                onClick={() => {
                  // Append a new default energy-space region
                  const edgeEnergy = form.getValues("edgeEnergy");
                  const newRegion = calculateNewRegionInEnergy(
                    form.getValues("regions"),
                    edgeEnergy,
                  );
                  append(newRegion);
                }}
              >
                Add Region
              </Button>
            </div>
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
                      value={field.value || proposal}
                      onChange={(e) => field.onChange(e.target.value)}
                      disabled={!!proposal} // Disable if proposal is provided
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
              <FormLabel>Metadata (JSON)</FormLabel>
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
