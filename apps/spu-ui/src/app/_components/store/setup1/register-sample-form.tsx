import { useCallback } from "react";
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
import { initialVolume } from "./constants";
import { sampleIdFromPosition, useSampleStore } from "./use-sample-store";

const sampleSchema = z.object({
  sampleType: z.literal("sample"),
  sampleTag: z.string().min(2, { message: "Sample tag is required" }),
  bufferTag: z.string().optional(),
  volume: z.coerce.number().min(0),
});
const bufferSchema = z.object({
  sampleType: z.literal("buffer"),
  sampleTag: z.string().min(2, { message: "Sample tag is required" }),
  bufferTag: z.string().optional(),
  volume: z.coerce.number().min(0),
});

const registerSchema = z.discriminatedUnion("sampleType", [
  sampleSchema,
  bufferSchema,
]);

export function RegisterSampleForm({
  tray,
  row,
  column,
  sampleTag,
  bufferTag,
  sampleType,
  volume = initialVolume,
  onSubmitCallback,
}: {
  tray: (typeof trayOptions)[number];
  row: (typeof trayRows)[number];
  column: (typeof trayColumns)[number];
  sampleTag?: string;
  bufferTag?: string;
  sampleType?: "sample" | "buffer";
  volume?: number;
  onSubmitCallback?: () => void;
}) {
  const { setSample } = useSampleStore();
  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      sampleType: sampleType ?? "sample",
      sampleTag: sampleTag ?? "",
      bufferTag: bufferTag ?? "",
      volume: volume,
    },
  });

  async function onSubmit(data: z.infer<typeof registerSchema>) {
    toast.info("Registering sample...");
    const sampleId = sampleIdFromPosition(tray, row, column);
    const sample = {
      id: sampleId,
      relativePosition: `${row}${column}`,
      tray,
      row,
      col: column,
      ...data,
      bufferTag: data.bufferTag ?? "",
    } satisfies Sample;
    await setSample(sampleId, sample).then(() => {
      toast.success("Sample registered!");
      form.reset();
      onSubmitCallback?.();
    });
  }

  const onChangeSampleType = useCallback(
    (value: string) => {
      if (value === "buffer") {
        form.setValue("bufferTag", "");
      }
    },
    [form],
  );

  const watchSampleType = form.watch("sampleType");

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
                  onChangeSampleType(value);
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
          name="bufferTag"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Buffer Tag</FormLabel>
              <FormDescription>
                Please enter the buffer tag for this sample.
              </FormDescription>
              <FormControl>
                <Input
                  placeholder="Buffer tag"
                  {...field}
                  disabled={watchSampleType === "buffer"}
                />
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
