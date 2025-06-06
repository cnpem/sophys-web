"use client";

import type { z } from "zod";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CameraIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
import type { LastSampleParams } from "~/app/_hooks/use-capillary-state";
import { acquireTimeOptions, sampleTypeOptions } from "~/lib/constants";
import { name, schema } from "~/lib/schemas/plans/single-acquisition";

export function SingleAcquisition({
  className,
  lastSampleParams,
}: {
  lastSampleParams: LastSampleParams | undefined;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const { data } = api.auth.getUser.useQuery();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className={className}
          disabled={lastSampleParams === undefined}
        >
          <CameraIcon className="mr-2 h-4 w-4" />
          Acquire
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Acquire</DialogTitle>
          <DialogDescription className="flex flex-col gap-2">
            Please fill in the details below to submit the plan. The sample
            details are pre-filled.
            <span className="mr-2 font-semibold">Sample:</span>
            <span>
              {lastSampleParams?.tray}, {lastSampleParams?.row}-
              {lastSampleParams?.col}, {lastSampleParams?.sampleTag},{" "}
              {lastSampleParams?.bufferTag}
            </span>
          </DialogDescription>
        </DialogHeader>
        {lastSampleParams !== undefined && (
          <SingleAcquisitionForm
            proposal={data?.proposal}
            lastSampleParams={lastSampleParams}
            onSubmitSuccess={() => {
              setOpen(false);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function SingleAcquisitionForm({
  lastSampleParams,
  proposal,
  className,
  onSubmitSuccess,
}: {
  lastSampleParams: LastSampleParams;
  proposal?: string;
  className?: string;
  onSubmitSuccess: () => void;
}) {
  const { addBatch } = useQueue();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      proposal: proposal,
      isRef: false,
      metadata: {
        row: lastSampleParams.row,
        col: lastSampleParams.col,
        tray: lastSampleParams.tray,
      },
      sampleType: lastSampleParams.sampleType,
      sampleTag: lastSampleParams.sampleTag,
      bufferTag: lastSampleParams.bufferTag,
    },
  });

  function onSubmit(data: z.infer<typeof schema>) {
    toast.info("Submitting sample...");
    const kwargs = schema.parse({
      ...data,
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
        <div className="grid grid-cols-3 gap-8">
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
          <FormField
            control={form.control}
            name="sampleType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sample Type</FormLabel>
                <Select {...field}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {sampleTypeOptions.map((option) => {
                      return (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      );
                    })}
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
                <FormControl>
                  <Input {...field} />
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
                <FormControl>
                  <Input {...field} />
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
                  <Input type="number" {...field} />
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
                <Select {...field} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {acquireTimeOptions.map((option) => {
                      return (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="temperature"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Temperature</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isRef"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    disabled
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Is Reference?</FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          Submit
        </Button>
      </form>
    </Form>
  );
}
