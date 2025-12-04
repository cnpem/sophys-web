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
import { Label } from "@sophys-web/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@sophys-web/ui/select";
import { Switch } from "@sophys-web/ui/switch";
import type { LastSampleParams } from "~/app/_hooks/use-capillary-state";
import { sampleTypeOptions, standardCleaningOptions } from "~/lib/constants";
import { name, schema } from "~/lib/schemas/plans/complete-acquisition";

export function CompleteAcquisition({
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
        <Button variant="ghost" className={className}>
          <CameraIcon className="mr-2 h-4 w-4" />
          Complete Acquisition
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Acquire</DialogTitle>
          <DialogDescription className="flex flex-col gap-2">
            Please fill in the details below to submit the plan. The last loaded
            sample details are pre-filled.
          </DialogDescription>
        </DialogHeader>
        <CompleteAcquisitionForm
          proposal={data?.proposal}
          lastSampleParams={lastSampleParams}
          onSubmitSuccess={() => {
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

const defaultValues: z.infer<typeof schema> = {
  proposal: "",
  sampleType: "sample",
  sampleTag: "",
  bufferTag: "",
  tray: "Tray1",
  row: "A",
  col: "1",
  volume: 0,
  acquireTime: 0.1,
  numExposures: 1,
  expUvTime: 0,
  measureUvNumber: 0,
  temperature: 25,
  setTemperature: false,
  standardOption: "normal",
  agentsList: [],
  agentsDuration: [],
};

function CompleteAcquisitionForm({
  lastSampleParams,
  proposal,
  className,
  onSubmitSuccess,
}: {
  lastSampleParams: LastSampleParams | undefined;
  proposal?: string;
  className?: string;
  onSubmitSuccess: () => void;
}) {
  const { add } = useQueue();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      ...defaultValues,
      ...(proposal && { proposal }),
      ...(lastSampleParams && {
        tray: lastSampleParams.tray,
        row: lastSampleParams.row,
        col: lastSampleParams.col,
        sampleType: lastSampleParams.sampleType,
        sampleTag: lastSampleParams.sampleTag,
        bufferTag: lastSampleParams.bufferTag,
      }),
    },
  });

  function onSubmit(data: z.infer<typeof schema>) {
    toast.info("Submitting sample...");
    const kwargs = schema.parse({
      ...data,
    });
    add.mutate(
      {
        item: {
          name: name,
          itemType: "plan",
          args: [],
          kwargs,
        },
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
            name="sampleType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sample Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
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
                <FormLabel># of Exposures</FormLabel>
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
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
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
            name="setTemperature"
            render={({ field }) => (
              <FormItem>
                <div className="inline-flex gap-1">
                  <FormLabel>Set Temperature</FormLabel>
                </div>
                <FormControl>
                  <div className="flex items-center space-y-0 rounded-lg border p-2 align-middle">
                    <Label className="text-slate-500">
                      {field.value ? "Yes" : "No"}
                    </Label>
                    <Switch
                      checked={field.value ?? false}
                      className="ml-auto"
                      onCheckedChange={field.onChange}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="standardOption"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cleaning Option</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {/* Allow only standard cleaning options here */}
                    {standardCleaningOptions.map((option) => {
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
        </div>
        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full"
        >
          Submit
        </Button>
      </form>
    </Form>
  );
}
