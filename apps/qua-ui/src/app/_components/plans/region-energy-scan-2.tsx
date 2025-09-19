"use client";

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
import { ScrollArea } from "@sophys-web/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@sophys-web/ui/select";
import { Textarea } from "@sophys-web/ui/textarea";

const PLAN_NAME = "region_energy_scan" as const;

const spaceEnum = z.enum(["energy-space", "k-space"]);
/**
 * Schema for a single region in object format.
 * This is used for form state management.
 */
const regionObjectSchema = z.object({
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
});

/**
 * Schema for a single region in tuple format.
 * This is used for API submission and retrieval.
 */
const regionTupleSchema = z.tuple([
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
const formSchema = z.object({
  regions: z.array(regionObjectSchema).min(1, {
    message: "At least one region is required",
  }),
  settleTime: z.coerce
    .number({
      description: "Time in ms for the settling phase",
    })
    .min(0, "Settle Time must be non-negative"),
  acquisitionTime: z.coerce
    .number({
      description: "Time in ms for the acquisition phase",
    })
    .min(0, "Acquisition Time must be non-negative"),
  fluorescence: z.boolean(),
  edgeEnergy: z.coerce
    .number({
      description:
        "Edge (E0) energy in eV for converting energy space to k-space",
    })
    .min(0, "Edge Energy must be non-negative"),
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
function convertRegionTuplesToObjects(
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

// =========================================================================
// MainForm Component
// =========================================================================

export function MainForm({
  className,
  proposal,
  initialRegionsData,
  // submitType,
}: {
  className?: string;
  proposal: string;
  initialRegionsData?: z.infer<typeof regionTupleSchema>[];
  // submitType?: "newPlan" | "editPlan";
}) {
  // Pre-process initial data if provided in tuple format
  const initialFormRegions = initialRegionsData
    ? convertRegionTuplesToObjects(initialRegionsData)
    : formDefaults.regions;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { ...formDefaults, proposal, regions: initialFormRegions },
  });

  const { addBatch } = useQueue();

  function onSubmit(formData: z.infer<typeof formSchema>) {
    toast.info("Submitting sample...");

    const apiData = {
      ...formData,
      regions: convertRegionObjectsToTuples(formData.regions),
    };

    addBatch.mutate(
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
          toast.success("Sample submitted!");
          form.reset({ ...formDefaults, proposal: formData.proposal });
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
                        disabled={field.space === "k-space"}
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
            <span className="text-secondary-foreground col-span-5 mt-2 text-center text-sm italic">
              Regions length: {fields.length}
            </span>
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

export function AddRegionEnergyScan({ className }: { className?: string }) {
  const { data } = api.auth.getUser.useQuery();

  // // Example of pre-filling with tuple data (simulated)
  // const simulatedInitialRegionsFromAPI: z.infer<typeof regionTupleSchema>[] = [
  //   ["energy-space", 500, 600, 0.5],
  //   ["k-space", 2, 5, 0.05],
  // ];

  return (
    <Dialog>
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

      <DialogContent className="max-w-2xl sm:min-w-[540px]">
        <DialogHeader>
          <DialogTitle>Example</DialogTitle>
          <DialogDescription className="flex flex-col gap-2">
            Please fill in the details below to submit the plan.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] w-full">
          {data?.proposal && (
            <MainForm
              proposal={data.proposal}
              // Pass the simulated API data here to test pre-filling
              // initialRegionsData={simulatedInitialRegionsFromAPI}
            />
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
