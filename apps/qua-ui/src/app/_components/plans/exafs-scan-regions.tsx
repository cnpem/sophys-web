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

const kRegionSchema = z.object({
  space: z.literal("k-space"),
  initial: z.number().min(0).max(30),
  final: z.number().min(0).max(30),
  step: z.number().min(0.01),
});

const EnergyRegionSchema = z.object({
  space: z.literal("energy-space"),
  initial: z.number().min(0),
  final: z.number().min(0),
  step: z.number().min(0.1),
});

const planSchema = z.object({
  regions: z.array(z.union([kRegionSchema, EnergyRegionSchema])),
  settleTime: z.number({
    description: "Time in ms for the settling phase",
  }),
  acquisitionTime: z.number({
    description: "Time in ms for the acquisition phase",
  }),
  fluorescence: z.boolean(),
  edgeEnergy: z.number({
    description:
      "Edge (E0) energy in eV for converting the energy space to k-space",
  }),
  repeats: z
    .number({
      description: "Number of repeats for the plan",
    })
    .int()
    .min(1),
  proposal: z.string({
    description: "Proposal ID",
  }),
});

const planName = "example-plan";

export function AddExafsScanRegions({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const { data } = api.auth.getUser.useQuery();

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
        <ExampleForm
          proposal={data?.proposal}
          onSubmitSuccess={() => {
            setOpen(false);
          }}
        />
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

function calculateNewRegionInK(
  regionsArray: z.infer<typeof planSchema>["regions"],
) {
  // Calculate the new region based on the existing regions
  const lastRegion = regionsArray[regionsArray.length - 1];
  if (lastRegion) {
    if (lastRegion.space === "energy-space") {
      const initial = EnergyToK(lastRegion.final);
      const step = EnergyToK(lastRegion.step);
      const final = initial + step; // Increment by step
      return {
        space: "k-space",
        initial,
        final,
        step,
      } as z.infer<typeof kRegionSchema>;
    } else {
      // If the last region is already in k-space, just return it with the added step
      const initial = lastRegion.final;
      const step = lastRegion.step;
      const final = initial + step; // Increment by step
      return {
        space: "k-space",
        initial,
        final,
        step,
      } as z.infer<typeof kRegionSchema>;
    }
  }
  return { space: "k-space", initial: 0, final: 0, step: 0.01 } as z.infer<
    typeof kRegionSchema
  >;
}

function convertRegionKtoEnergy(
  region: z.infer<typeof kRegionSchema>,
  edgeEnergy: number,
): z.infer<typeof EnergyRegionSchema> {
  // Convert k-space region to energy-space region
  return {
    space: "energy-space",
    initial: KToEnergy(region.initial) + edgeEnergy,
    final: KToEnergy(region.final) + edgeEnergy,
    step: KToEnergy(region.step),
  } as z.infer<typeof EnergyRegionSchema>;
}

function convertRegionEnergyToK(
  region: z.infer<typeof EnergyRegionSchema>,
): z.infer<typeof kRegionSchema> {
  // Convert energy-space region to k-space region
  return {
    space: "k-space",
    initial: EnergyToK(region.initial),
    final: EnergyToK(region.final),
    step: EnergyToK(region.step),
  } as z.infer<typeof kRegionSchema>;
}

function ExampleForm({
  proposal,
  className,
  onSubmitSuccess,
}: {
  proposal?: string;
  className?: string;
  onSubmitSuccess: () => void;
}) {
  const { addBatch } = useQueue();

  const form = useForm<z.infer<typeof planSchema>>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      regions: [],
      settleTime: 0,
      acquisitionTime: 0,
      fluorescence: false,
      edgeEnergy: 0,
      repeats: 1,
      proposal: proposal,
    },
  });

  // Use useFieldArray for managing the 'regions' array
  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "regions",
  });

  function onSubmit(data: z.infer<typeof planSchema>) {
    toast.info("Submitting sample...");
    const kwargs = data;

    addBatch.mutate(
      {
        items: [
          {
            name: planName,
            itemType: "plan",
            args: [],
            kwargs,
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
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
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
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex flex-row items-center space-x-4">
            <FormField
              control={form.control}
              name="acquisitionTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Acquisition Time (ms)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
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
                        update(
                          index,
                          convertRegionEnergyToK(
                            field as z.infer<typeof EnergyRegionSchema>,
                          ),
                        );
                      } else {
                        update(
                          index,
                          convertRegionKtoEnergy(
                            field as z.infer<typeof kRegionSchema>,
                            form.getValues("edgeEnergy"),
                          ),
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
                  />
                  <Input
                    type="number"
                    placeholder="Final"
                    {...form.register(`regions.${index}.final`, {
                      valueAsNumber: true,
                    })}
                  />
                  <Input
                    type="number"
                    placeholder="Step"
                    {...form.register(`regions.${index}.step`, {
                      valueAsNumber: true,
                    })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                  >
                    <Trash2Icon className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="default"
                  className="w-full"
                  onClick={() => {
                    // Append a new default k-space region
                    const newRegion = calculateNewRegionInK(
                      form.getValues("regions"),
                    );
                    append(newRegion);
                  }}
                >
                  Add Region
                </Button>
                <Button
                  type="button"
                  className="w-full"
                  variant="destructive"
                  onClick={() => {
                    if (fields.length > 0) {
                      remove(fields.length - 1);
                    }
                  }}
                >
                  Remove Region
                </Button>
              </div>
            </div>
          </div>
          <FormField
            control={form.control}
            name="proposal"
            render={({ field }) => (
              <FormItem>
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
        </div>
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
