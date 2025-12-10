"use client";

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
import type { Sample } from "./sample-item";
import { getSamples, setSamples } from "../../actions/samples";

const sampleSchema = z.object({
  sampleType: z.literal("sample"),
  sampleTag: z.string().min(2, { message: "Sample tag is required" }),
  bufferTag: z.string().optional(),
});
const bufferSchema = z.object({
  sampleType: z.literal("buffer"),
  sampleTag: z.string().min(2, { message: "Sample tag is required" }),
  bufferTag: z.string().optional(),
});

const registerSchema = z.discriminatedUnion("sampleType", [
  sampleSchema,
  bufferSchema,
]);

export function RegisterSampleForm({
  sample,
  onSubmitCallback,
}: {
  sample: Sample;
  onSubmitCallback?: () => void;
}) {
  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      sampleType: sample.sampleType ?? "sample",
      sampleTag: sample.sampleTag ?? "",
      bufferTag: sample.bufferTag ?? "",
    },
  });

  async function onSubmit(data: z.infer<typeof registerSchema>) {
    toast.info("Registering sample...");
    const samples = await getSamples();
    await setSamples(
      samples.map((s) =>
        s.id === sample.id
          ? ({ ...s, ...data, sampleType: data.sampleType } as Sample)
          : s,
      ),
    );
    toast.success("Sample registered!");
    onSubmitCallback?.();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="sampleType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sample Type</FormLabel>
              <FormDescription>
                Please select the type of sample you are registering.
              </FormDescription>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
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
                <Input placeholder="Buffer tag" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
