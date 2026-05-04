import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useQueue } from "@sophys-web/api-client/hooks";
import { api } from "@sophys-web/api-client/react";
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
import type { Sample } from "./use-sample-store";
import {
  sampleTypeOptions,
  trayColumns,
  trayOptions,
  trayRows,
} from "../../store/setup1/constants";
import { proposalSchema } from "./../../plans/schemas/common";
import { useSampleStore } from "./use-sample-store";

export const planName = "setup1_load_procedure";

export const planSchema = z.object({
  row: z.enum(trayRows),
  col: z.enum(trayColumns),
  tray: z.enum(trayOptions),
  volume: z.coerce
    .number()
    .positive()
    .max(100, "Volume must be between 0 and 100 µL"),
  proposal: proposalSchema,
  sampleTag: z.string(),
  sampleType: z.enum(sampleTypeOptions),
  expUvTime: z.coerce.number().nonnegative().optional(),
  measureUvNumber: z.coerce.number().int().nonnegative().optional(),
  motionSpeed: z.coerce.number().positive().optional(),
});

export function LoadSampleForm({
  sample,
  onSubmitCallback,
}: {
  sample: Sample;
  onSubmitCallback?: () => void;
}) {
  const { data: userData } = api.auth.getUser.useQuery();
  const { add } = useQueue();
  const { storeData, setSample } = useSampleStore();
  const form = useForm({
    resolver: zodResolver(planSchema),
    defaultValues: {
      tray: sample.tray,
      row: sample.row,
      col: sample.col,
      volume: 60, // default load volume to 60 µL
      sampleTag: sample.sampleTag,
      sampleType: sample.sampleType,
      proposal: userData?.proposal ?? "", // default proposal to user's current proposal
    },
  });

  async function onSubmit(data: z.infer<typeof planSchema>) {
    try {
      toast.info("Submitting sample...");

      const kwargs = planSchema.parse(data);

      await add.mutateAsync({
        item: {
          name: planName,
          itemType: "plan",
          args: [],
          kwargs,
        },
      });

      const currentSample = storeData?.[sample.id];
      if (!currentSample) {
        toast.error("Sample not found in store");
        return;
      }

      const volumeAfter = currentSample.volume - data.volume;
      if (volumeAfter < 0) {
        toast.error("Loaded volume exceeds available sample volume");
        return;
      }

      await setSample(sample.id, {
        ...currentSample,
        volume: volumeAfter,
      });

      toast.success("Sample submitted!");
      onSubmitCallback?.();
    } catch (error) {
      toast.error("Failed to submit sample", {
        description: error instanceof Error ? error.message : String(error),
        closeButton: true,
      });
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-2 gap-4"
      >
        <FormField
          control={form.control}
          name="volume"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Volume (µL)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="expUvTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>UV Exposure Time (s)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder="Optional"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="measureUvNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of UV Measurements</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder="Optional"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* proposal */}
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
        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="col-span-2"
        >
          Submit
        </Button>
      </form>
    </Form>
  );
}
