import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@sophys-web/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
import type { trayColumns, trayOptions, trayRows } from "./constants";
import type { Sample } from "./use-sample-store";
import { sampleTagSchema } from "../../plans/schemas/common";
import { initialVolume } from "./constants";
import { sampleIdFromPosition, useSampleStore } from "./use-sample-store";

const sampleSchema = z.object({
  sampleType: z.enum(["sample", "buffer"]),
  sampleTag: sampleTagSchema,
  volume: z.coerce.number().min(0),
});

export function RegisterSampleForm({
  tray,
  row,
  column,
  sampleTag,
  sampleType,
  volume = initialVolume,
  onSubmitCallback,
}: {
  tray: (typeof trayOptions)[number];
  row: (typeof trayRows)[number];
  column: (typeof trayColumns)[number];
  sampleTag?: string;
  sampleType?: "sample" | "buffer";
  volume?: number;
  onSubmitCallback?: () => void;
}) {
  const { setSample } = useSampleStore();
  const form = useForm({
    resolver: zodResolver(sampleSchema),
    defaultValues: {
      sampleType: sampleType ?? "sample",
      sampleTag: sampleTag ?? "",
      volume: volume,
    },
  });

  async function onSubmit(data: z.infer<typeof sampleSchema>) {
    toast.info("Registering sample...");
    const sampleId = sampleIdFromPosition(tray, row, column);
    const sample = {
      id: sampleId,
      relativePosition: `${row}${column}`,
      tray,
      row,
      col: column,
      ...data,
    } satisfies Sample;
    await setSample(sampleId, sample).then(() => {
      toast.success("Sample registered!");
      form.reset();
      onSubmitCallback?.();
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-96 space-y-8">
        <FormField
          control={form.control}
          name="sampleType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sample Type</FormLabel>
              <FormDescription>
                Please select the type of sample you are registering.
              </FormDescription>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a sample type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="sample">Sample</SelectItem>
                  <SelectItem value="buffer">Buffer</SelectItem>
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
              <FormDescription>
                Please enter the sample tag for this sample.
              </FormDescription>
              <FormControl>
                <Input placeholder="Sample tag" {...field} />
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
              <FormDescription>
                Please set the volume for this sample in microliters.
              </FormDescription>
              <FormControl>
                <Input type="number" placeholder="Volume in µL" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Submit
        </Button>
      </form>
    </Form>
  );
}
