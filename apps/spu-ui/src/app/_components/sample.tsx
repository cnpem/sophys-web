"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { cn } from "@sophys-web/ui";
import { Button } from "@sophys-web/ui/button";
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
import { toast } from "@sophys-web/ui/sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@sophys-web/ui/tooltip";
import type { SampleParams } from "../../lib/schemas/sample";
import {
  kwargsSubmitSchema,
  planName,
} from "~/lib/schemas/plans/complete-acquisition";
import { useQueue } from "../_hooks/use-queue";
import { sampleSubmitSchema } from "../../lib/schemas/sample";
import { getSamples, setSamples } from "../actions/samples";

export type Sample = {
  id: string | number;
  relativePosition: string;
  type: "buffer" | "sample" | undefined;
} & Partial<SampleParams>;

const sampleSchema = z.object({
  sampleType: z.literal("sample"),
  sampleTag: z.string().min(2, { message: "Sample tag is required" }),
  bufferTag: z
    .string()
    .min(2, { message: "Buffer tag is required for non-buffer samples" }),
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

function RegisterSampleForm({
  sample,
  className,
}: {
  sample: Sample;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      sampleTag: "",
      bufferTag: "",
    },
  });

  async function onSubmit(data: z.infer<typeof registerSchema>) {
    toast.info("Registering sample...");
    const samples = await getSamples();
    await setSamples(
      samples.map((s) =>
        s.id === sample.id
          ? ({ ...s, ...data, type: data.sampleType } as Sample)
          : s,
      ),
    );
    toast.success("Sample registered!");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={className}>
        <span>{sample.type?.charAt(0) ?? "-"}</span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Register a new sample</DialogTitle>
          <DialogDescription>
            Please fill in the details below to register a new sample.
          </DialogDescription>
        </DialogHeader>
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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
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
      </DialogContent>
    </Dialog>
  );
}

function SampleForm({
  sample,
  className,
}: {
  sample: Sample;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const { add } = useQueue();
  const form = useForm<z.infer<typeof sampleSubmitSchema>>({
    resolver: zodResolver(sampleSubmitSchema),
    defaultValues: {
      sampleTag: sample.sampleTag,
      bufferTag: sample.bufferTag,
      tray: sample.tray,
      row: sample.row,
      col: sample.col,
      sampleType: sample.type,
    },
  });

  function onSubmit(data: z.infer<typeof sampleSubmitSchema>) {
    toast.info("Submitting sample...");
    const kwargs = kwargsSubmitSchema.parse({
      ...data,
      proposal: "p12341234",
    });
    add.mutate(
      {
        item: {
          name: planName,
          kwargs,
          args: [],
          itemType: "plan",
        },
      },
      {
        onSuccess: () => {
          toast.success("Sample submitted!");
          setOpen(false);
        },
        onError: (error) => {
          toast.error("Failed to submit sample", {
            description: error.message,
          });
        },
      },
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" className={className}>
                <span>{sample.type?.charAt(0) ?? "-"}</span>
              </Button>
            </TooltipTrigger>
          </DialogTrigger>
          <TooltipContent>
            <div className="space-y-4">
              <div>
                <strong>Sample Tag:</strong>
                <span>{sample.sampleTag}</span>
              </div>
              <div>
                <strong>Buffer Tag:</strong>
                <span>{sample.bufferTag}</span>
              </div>
            </div>
          </TooltipContent>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit new complete acquisition</DialogTitle>
              <DialogDescription>
                Please fill in the details below to submit a new complete
                acquisition.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="volume"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Volume</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Volume" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="acquireTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Acquire Time</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Acquire time"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="numExposures"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Exposures</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Number of exposures"
                          {...field}
                        />
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
                      <FormLabel>Exposure UV Time</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Exposure UV time"
                          {...field}
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
                      <FormLabel>Measure UV Number</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Measure UV number"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  Submit
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </Tooltip>
    </TooltipProvider>
  );
}

export function SampleItem({ sample }: { sample: Sample }) {
  const isRegistered = sample.type !== undefined;

  const classNames = cn(
    "relative flex h-7 w-7 cursor-context-menu items-center justify-center rounded-full font-semibold text-white text-xs select-none hover:scale-105 hover:ring",
    { "cursor-text opacity-50": !isRegistered },
    {
      "bg-slate-500": !sample.type,
      "bg-emerald-500": sample.type === "sample",
      "bg-sky-500": sample.type === "buffer",
    },
  );

  return (
    <>
      {!isRegistered ? (
        <RegisterSampleForm sample={sample} className={classNames} />
      ) : (
        <SampleForm sample={sample} className={classNames} />
      )}
    </>
  );
}
