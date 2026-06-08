import type { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
import type { cardColumns, cardIndexOptions, cardRows } from "./constants";
import type { Sample } from "./use-sample-store";
import {
  sampleIdFromPosition,
  sampleSchema,
  useSampleStore,
} from "./use-sample-store";

const registerSchema = sampleSchema.omit({
  id: true,
});

export function RegisterSampleForm({
  cardIndex,
  row,
  column,
  sampleTag,
  samplePositionX = 0,
  samplePositionY = 0,
  meta = "",
  onSubmitCallback,
}: {
  cardIndex: (typeof cardIndexOptions)[number];
  row: (typeof cardRows)[number];
  column: (typeof cardColumns)[number];
  sampleTag?: string;
  samplePositionX?: number;
  samplePositionY?: number;
  meta?: string;
  onSubmitCallback?: () => void;
}) {
  const { setSample } = useSampleStore();
  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      sampleTag: sampleTag ?? "",
      row,
      column,
      cardIndex,
      samplePositionX,
      samplePositionY,
      meta,
    },
  });

  async function onSubmit(data: z.infer<typeof registerSchema>) {
    toast.info("Registering sample...");
    const sampleId = sampleIdFromPosition({ cardIndex, row, column });
    const sample = {
      id: sampleId,
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
        {/* sample position */}
        <FormField
          control={form.control}
          name="samplePositionX"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sample Position X</FormLabel>
              <FormDescription>
                Please enter the sample position X for this sample.
              </FormDescription>
              <FormControl>
                <Input placeholder="Sample position X" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="samplePositionY"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sample Position Y</FormLabel>
              <FormDescription>
                Please enter the sample position Y for this sample.
              </FormDescription>
              <FormControl>
                <Input placeholder="Sample position Y" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="meta"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meta</FormLabel>
              <FormDescription>
                Please enter any additional metadata for this sample.
              </FormDescription>
              <FormControl>
                <Input placeholder="Meta" {...field} />
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

export function RegisterNewSampleForm({
  cardIndex,
  row,
  column,
  sampleTag,
  meta = "",
  onSubmitCallback,
}: {
  cardIndex: (typeof cardIndexOptions)[number];
  row: (typeof cardRows)[number];
  column: (typeof cardColumns)[number];
  sampleTag?: string;
  samplePositionX?: number;
  samplePositionY?: number;
  meta?: string;
  onSubmitCallback?: () => void;
}) {
  const { setSample } = useSampleStore();
  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      sampleTag: sampleTag ?? "",
      row,
      column,
      cardIndex,
      samplePositionX: 0,
      samplePositionY: 0,
      meta,
    },
  });

  async function onSubmit(data: z.infer<typeof registerSchema>) {
    toast.info("Registering sample...");
    const sampleId = sampleIdFromPosition({ cardIndex, row, column });
    const sample = {
      id: sampleId,
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
          name="meta"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meta</FormLabel>
              <FormDescription>
                Please enter any additional metadata for this sample.
              </FormDescription>
              <FormControl>
                <Input placeholder="Meta" {...field} />
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
