"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { JsonEditor, monoLightTheme } from "json-edit-react";
import { CheckIcon, MoveRightIcon, UploadIcon } from "lucide-react";
import { useForm } from "react-hook-form";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@sophys-web/ui/form";
import { Input } from "@sophys-web/ui/input";
import { ScrollArea } from "@sophys-web/ui/scroll-area";
import type { schema as cleanCapillaryKwargsSchema } from "../../../lib/schemas/plans/clean-and-acquire";
import type {
  tableSchema as acquisitionTableSchema,
  cleaningSchema as cleaningKwargsSchema,
} from "../../../lib/schemas/plans/complete-acquisition";
import type { Sample } from "../sample";
import { name as cleanCapillaryPlanName } from "../../../lib/schemas/plans/clean-and-acquire";
import { name as acquisitionPlanName } from "../../../lib/schemas/plans/complete-acquisition";
import {
  getSamples as getServerSamples,
  setSamples as setServerSamples,
} from "../../actions/samples";
import { AcquisitionCleaningForm } from "./acquisition-cleaning-form";
import { AcquisitionTableForm } from "./acquisition-table-form";
import { CleanCapillaryForm } from "./capillary-form";

export function UploadQueue() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost">
          <UploadIcon className="size-4" />
          Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-xl">
        <DialogHeader>
          <DialogTitle>Load Experiment Queue</DialogTitle>
          <DialogDescription>
            Load a new experiment queue from a CSV file.
          </DialogDescription>
        </DialogHeader>
        <StepByStepForm onSubmitSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function samplePosition(row: string, col: string, tray: string) {
  return {
    complete: `${tray}-${col}${row}`,
    relative: `${col}${row}`,
  };
}

async function uploadSamples(
  tableItems: z.infer<typeof acquisitionTableSchema>[],
  prevSamples: Sample[] | undefined,
) {
  const newSamples = tableItems.map((item) => {
    const { complete, relative } = samplePosition(
      item.row,
      item.col,
      item.tray,
    );
    return {
      id: complete,
      relativePosition: relative,
      type: item.sampleType,
      ...item,
    } as Sample;
  });
  if (prevSamples === undefined) {
    await setServerSamples(newSamples);
    return;
  }
  const updatedSamples = prevSamples.map((prevSample) => {
    const newSample = newSamples.find((sample) => sample.id === prevSample.id);
    return newSample ?? prevSample;
  });
  await setServerSamples(updatedSamples);
}

const errorResultsArray = z.array(
  z.object({
    success: z.boolean(),
    msg: z.string(),
  }),
);

function useStepForm(steps: React.ReactElement[]) {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  function next() {
    setCurrentStepIdx((prev) => {
      if (prev < steps.length - 1) {
        return prev + 1;
      }
      return prev;
    });
  }
  function back() {
    setCurrentStepIdx((prev) => {
      if (prev > 0) {
        return prev - 1;
      }
      return prev;
    });
  }
  function goTo(step: number) {
    setCurrentStepIdx(step);
  }

  return {
    step: steps[currentStepIdx],
    steps,
    currentStepIdx,
    isFirst: currentStepIdx === 0,
    isLast: currentStepIdx === steps.length - 1,
    next,
    back,
    goTo,
  };
}
interface Step {
  label: string;
  onClick: () => void;
  isDisabled?: boolean;
}

interface StepNavigationProps {
  steps: Step[];
  currentStep: number;
}

export function StepNavigation({ steps, currentStep }: StepNavigationProps) {
  return (
    <div className="mx-auto p-4">
      <div className="relative flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <StepButton
              label={step.label}
              number={index + 1}
              onClick={step.onClick}
              isActive={currentStep === index}
              isCompleted={currentStep > index}
              isDisabled={step.isDisabled}
            />
            {index < steps.length - 1 && (
              <div className="flex flex-1 items-center">
                <div
                  className={cn(
                    "h-[2px] w-full",
                    currentStep > index ? "bg-primary" : "bg-muted",
                  )}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

interface StepButtonProps {
  label: string;
  number: number;
  onClick: () => void;
  isActive: boolean;
  isCompleted: boolean;
  isDisabled?: boolean;
}

function StepButton({
  label,
  number,
  onClick,
  isActive,
  isCompleted,
  isDisabled,
}: StepButtonProps) {
  return (
    <div className="relative flex flex-col items-center">
      <Button
        onClick={onClick}
        variant={isActive ? "default" : "outline"}
        size="icon"
        disabled={isDisabled}
        className={cn(
          "rounded-full",
          isCompleted &&
            "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
        )}
      >
        {isCompleted ? <CheckIcon className="h-4 w-4" /> : number}
      </Button>
      <span className="absolute -bottom-6 text-xs font-medium whitespace-nowrap">
        {label}
      </span>
    </div>
  );
}

const stepsMap = [
  "proposal",
  "capillary",
  "cleaning",
  "acquisition",
  "check",
] as const;

function StepByStepForm({ onSubmitSuccess }: { onSubmitSuccess?: () => void }) {
  const { data: user } = api.auth.getUser.useQuery();

  const { addBatch } = useQueue();

  const [cleaningParams, setCleaningParams] =
    useState<z.infer<typeof cleaningKwargsSchema>>();
  const [acquisitionParams, setAcquisitionParams] =
    useState<z.infer<typeof acquisitionTableSchema>[]>();
  const [capillaryParams, setCapillaryParams] =
    useState<z.infer<typeof cleanCapillaryKwargsSchema>>();
  const [formProposal, setFormProposal] = useState<string | undefined>();
  const [useCapillary, setUseCapillary] = useState(false);

  const { step, currentStepIdx, next, goTo } = useStepForm([
    <ProposalForm
      key="proposal"
      initialValues={{
        proposal: formProposal ?? user?.proposal ?? "",
        useCapillary,
      }}
      onSubmit={onSubmitProposal}
    />,
    <CleanCapillaryForm
      key="capillary"
      initialValues={{
        proposal: formProposal,
        ...capillaryParams,
        sampleType: "buffer",
        bufferTag: "NA",
        isRef: true,
      }}
      onSubmit={onSubmitCapillary}
    />,
    <AcquisitionCleaningForm
      key="cleaning"
      initialValues={{
        ...cleaningParams,
      }}
      onSubmit={onSubmitCleaning}
    />,
    <AcquisitionTableForm key="acquisition" onSubmit={onSubmitAcquisition} />,
    <>
      <ScrollArea className="h-72">
        <JsonEditor
          viewOnly
          data={{
            Proposal: formProposal,
            Capillary: {
              useCapillary,
              ...capillaryParams,
            },
            Cleaning: cleaningParams,
            Acquisition: acquisitionParams,
          }}
          rootName={"Check"}
          theme={monoLightTheme}
        />
      </ScrollArea>
      <Button className="mt-4" onClick={onSubmitToQueue}>
        Submit to Queue
      </Button>
    </>,
  ]);

  function onSubmitProposal(data: z.infer<typeof proposalSchema>) {
    setFormProposal(data.proposal);
    setUseCapillary(data.useCapillary);
    if (data.useCapillary) {
      next();
    } else {
      goTo(stepsMap.indexOf("cleaning"));
    }
  }

  function onSubmitCapillary(data: z.infer<typeof cleanCapillaryKwargsSchema>) {
    setCapillaryParams(data);
    next();
  }

  function onSubmitCleaning(data: z.infer<typeof cleaningKwargsSchema>) {
    setCleaningParams(data);
    next();
  }

  function onSubmitAcquisition(data: z.infer<typeof acquisitionTableSchema>[]) {
    setAcquisitionParams(data);
    next();
  }

  async function onSubmitToQueue() {
    if (!acquisitionParams) {
      return;
    }
    const prevSamples = await getServerSamples();
    await uploadSamples(acquisitionParams, prevSamples);
    toast.success("Samples uploaded");
    const items = acquisitionParams.map((params) => ({
      name: acquisitionPlanName,
      args: [],
      kwargs: {
        ...params,
        proposal: formProposal,
        ...cleaningParams,
      },
      itemType: "plan",
    }));
    const batch = [
      ...(useCapillary
        ? [
            {
              name: cleanCapillaryPlanName,
              args: [],
              kwargs: {
                ...capillaryParams,
                proposal: formProposal,
              },
              itemType: "plan",
            },
          ]
        : []),
      ...items,
    ];
    toast.info("Submitting batch to the queue");
    addBatch.mutate(
      {
        items: batch,
      },
      {
        onSuccess: () => {
          onSubmitSuccess?.();
          toast.success("Batch submitted");
        },
        onError: (error) => {
          const parsedErrorArray = errorResultsArray.safeParse(
            JSON.parse(error.message),
          );
          if (parsedErrorArray.data) {
            parsedErrorArray.data.forEach((result) => {
              toast.error("Add batch item failed", {
                description: result.msg,
                closeButton: true,
              });
            });
          } else {
            console.error(
              "Failed to submit batch: Unknown error format.",
              error.message,
            );
            toast.error("Failed to submit batch", {
              description: "An unknown error occurred",
              closeButton: true,
            });
          }
        },
      },
    );
  }

  return (
    <div className="space-y-8">
      <StepNavigation
        steps={[
          {
            label: "Proposal",
            onClick: () => goTo(0),
          },
          {
            label: "Capillary",
            onClick: () => goTo(1),
            isDisabled: !useCapillary || !formProposal || currentStepIdx < 1,
          },
          {
            label: "Cleaning",
            onClick: () => goTo(2),
            isDisabled: !formProposal || currentStepIdx < 2,
          },
          {
            label: "Acquisition",
            onClick: () => goTo(3),
            isDisabled: !formProposal || currentStepIdx < 3,
          },
          {
            label: "Check",
            onClick: () => goTo(4),
            isDisabled:
              !formProposal || !acquisitionParams || currentStepIdx < 4,
          },
        ]}
        currentStep={currentStepIdx}
      />
      <>{step}</>
    </div>
  );
}

const proposalSchema = z.object({
  proposal: z.string().length(8, "Proposal ID must be 8 characters"),
  useCapillary: z.boolean(),
});

function ProposalForm({
  initialValues,
  onSubmit,
}: {
  initialValues: z.infer<typeof proposalSchema>;
  onSubmit: (data: z.infer<typeof proposalSchema>) => void;
}) {
  const form = useForm({
    resolver: zodResolver(proposalSchema),
    defaultValues: initialValues,
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col items-end space-y-8"
      >
        <FormField
          control={form.control}
          name="proposal"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Proposal</FormLabel>
              <FormControl>
                <Input maxLength={8} placeholder="20250001" {...field} />
              </FormControl>
              <FormDescription>
                This is your proposal ID, e.g. 20250001.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="useCapillary"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Make empty capillary acquisition</FormLabel>
                <FormDescription>
                  This will add an empty capillary acquisition plan in the
                  queue, which can be used as a reference measure.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <Button type="submit">
          Next
          <MoveRightIcon className="ml-2 h-4 w-4" />
        </Button>
      </form>
    </Form>
  );
}
