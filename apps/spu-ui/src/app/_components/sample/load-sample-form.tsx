"use client";

import type { z } from "zod";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useQueue } from "@sophys-web/api-client/hooks";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@sophys-web/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@sophys-web/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@sophys-web/ui/tooltip";
import type { Sample } from "./sample-item";
import { loadVolumeOptions } from "~/lib/constants";
import { name, schema } from "~/lib/schemas/plans/load";

export function LoadSampleForm({
  sample,
  children,
}: {
  sample: Sample;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { addBatch } = useQueue();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      tray: sample.tray,
      row: sample.row,
      col: sample.col,
      volume: 0,
    },
  });

  function handleOpenChange(open: boolean) {
    setOpen(open);
    form.reset();
  }

  function onSubmit(data: z.infer<typeof schema>) {
    toast.info("Submitting sample...");
    const kwargs = schema.parse({
      ...data,
      metadata: {
        sampleTag: sample.sampleTag,
        bufferTag: sample.bufferTag,
        sampleType: sample.type,
      },
    });
    addBatch.mutate(
      {
        items: [
          {
            name: name,
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
          setOpen(false);
          form.reset();
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
    <TooltipProvider>
      <Tooltip>
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <TooltipTrigger asChild>{children}</TooltipTrigger>
          </DialogTrigger>
          <TooltipContent align="end" className="flex flex-col">
            <span>{`position: ${sample.tray}-${sample.row}${sample.col}`}</span>
            <span>{`type: ${sample.type}`}</span>
            <span>{`name: ${sample.sampleTag}`}</span>
            {sample.bufferTag && <span>{`buffer: ${sample.bufferTag}`}</span>}
          </TooltipContent>

          <DialogContent className="flex w-fit flex-col items-center">
            <DialogHeader>
              <DialogTitle>Load sample</DialogTitle>
              <DialogDescription className="flex flex-col items-start">
                <span>{`position: ${sample.tray}-${sample.row}${sample.col}`}</span>
                <span>{`type: ${sample.type}`}</span>
                <span>{`name: ${sample.sampleTag}`}</span>
                {sample.bufferTag && (
                  <span>{`buffer: ${sample.bufferTag}`}</span>
                )}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full space-y-8"
              >
                <FormField
                  control={form.control}
                  name="volume"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Volume (µL)</FormLabel>
                      <Select onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {loadVolumeOptions.map((option) => {
                            return (
                              <SelectItem key={option} value={option}>
                                {option} µL
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="w-full"
                >
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
