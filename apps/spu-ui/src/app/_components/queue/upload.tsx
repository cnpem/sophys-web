"use client";

import { useCallback, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { MoveRightIcon, UploadIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "@sophys-web/api-client/react";
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
import { toast } from "@sophys-web/ui/sonner";
import type { schema as cleanCapillaryKwargsSchema } from "../../../lib/schemas/plans/clean-and-acquire";
import type {
  tableSchema as acquisitionTableSchema,
  cleaningSchema as cleaningKwargsSchema,
} from "../../../lib/schemas/plans/complete-acquisition";
import type { Sample } from "../sample";
import { useQueue } from "../../_hooks/use-queue";
import { name as cleanCapillaryPlanName } from "../../../lib/schemas/plans/clean-and-acquire";
import { name as acquisitionPlanName } from "../../../lib/schemas/plans/complete-acquisition";
import {
  getSamples as getServerSamples,
  setSamples as setServerSamples,
} from "../../actions/samples";
import { samplePosition } from "../experiment";
import { AcquisitionCleaningForm } from "./acquisition-cleaning-form";
import { AcquisitionTableForm } from "./acquisition-table-form";
import { CleanCapillaryForm } from "./capillary-form";

export function UploadQueue() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen} modal={false}>
      <DialogTrigger asChild>
        <Button title="load new experiment queue" size="icon" variant="outline">
          <UploadIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-screen-sm">
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

const stepsMap = [
  "proposal",
  "capillary",
  "cleaning",
  "acquisition",
  "check",
] as const;

function StepByStepForm({ onSubmitSuccess }: { onSubmitSuccess?: () => void }) {
  const { data: session, isLoading } = api.auth.getSession.useQuery();

  const [cleaningParams, setCleaningParams] =
    useState<z.infer<typeof cleaningKwargsSchema>>();
  const [acquisitionParams, setAcquisitionParams] =
    useState<z.infer<typeof acquisitionTableSchema>[]>();
  const [capillaryParams, setCapillaryParams] =
    useState<z.infer<typeof cleanCapillaryKwargsSchema>>();
  const [proposal, setProposal] = useState<string>("");
  const [useCapillary, setUseCapillary] = useState(false);

  const { addBatch } = useQueue();

  const getProposal = useCallback(() => {
    if (!proposal && session) {
      return session.user.proposal;
    }
    return proposal;
  }, [proposal, session]);

  const { step, currentStepIdx, next, goTo } = useStepForm([
    <ProposalForm
      key="proposal"
      initialValues={{
        proposal: getProposal(),
        useCapillary,
      }}
      onSubmit={onSubmitProposal}
    />,
    <CleanCapillaryForm
      key="capillary"
      initialValues={{
        proposal,
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
    <div className="text-xs text-muted-foreground">
      <div className="text-lg font-bold">Step 1: Proposal</div>
      <p>Proposal: {proposal}</p>
      <p>Use Capillary: {useCapillary ? "Yes" : "No"}</p>
      {!!useCapillary && (
        <>
          <div className="text-lg font-bold">Step 2: Capillary</div>
          <p>Acquire Time: {capillaryParams?.acquireTime}</p>
          <p>Number of Exposures: {capillaryParams?.numExposures}</p>
          <p>Sample Type: {capillaryParams?.sampleType}</p>
          <p>Sample Tag: {capillaryParams?.sampleTag}</p>
          <p>Buffer Tag: {capillaryParams?.bufferTag}</p>
          <p>Cleaning Method: {capillaryParams?.standardOption}</p>
          <p>Agents: {capillaryParams?.agentsList?.join(", ")}</p>
          <p>Agents Duration: {capillaryParams?.agentsDuration?.join(", ")}</p>
        </>
      )}
      <div className="text-lg font-bold">Step 3: Cleaning</div>
      <p>Cleaning Method: {cleaningParams?.standardOption}</p>
      <p>Agents: {cleaningParams?.agentsList?.join(", ")}</p>
      <p>Agents Duration: {cleaningParams?.agentsDuration?.join(", ")}</p>
      <div className="text-lg font-bold">Step 4: Acquisition Kwargs</div>
      <details>
        <ScrollArea className="h-96">
          {acquisitionParams?.map((params, index) => (
            <div key={index} className="mt-1 rounded-sm border p-2">
              <span>
                Row: {params.row}
                {", "}
              </span>
              <span>
                Col: {params.col}
                {", "}
              </span>
              <span>
                Tray: {params.tray}
                {", "}
              </span>
              <span>
                Acquire Time: {params.acquireTime}
                {", "}
              </span>
              <span>
                Number of Exposures: {params.numExposures}
                {", "}
              </span>
              <span>
                Volume: {params.volume}
                {", "}
              </span>
              <span>
                Sample Tag: {params.sampleTag}
                {", "}
              </span>
              <span>Buffer Tag: {params.bufferTag}</span>
            </div>
          ))}
        </ScrollArea>
      </details>
      <Button className="mt-4" onClick={onSubmitToQueue}>
        Submit to Queue
      </Button>
    </div>,
  ]);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!session) {
    return <div>Not authenticated</div>;
  }

  function onSubmitProposal(data: z.infer<typeof proposalSchema>) {
    setProposal(data.proposal);
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
        proposal,
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
                proposal,
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
      <div className="flex items-center justify-between gap-4">
        {Object.entries({
          proposal: "Proposal",
          capillary: "Capillary",
          cleaning: "Cleaning",
          acquisition: "Acquisition",
          check: "Check",
        }).map(([key, label], index) => (
          <div key={key} className="flex flex-col items-center">
            <Button
              className="rounded-full"
              size="icon"
              disabled={(key === "capillary" && !useCapillary) || !proposal}
              variant={currentStepIdx === index ? "default" : "outline"}
              onClick={() => goTo(index)}
            >
              {index + 1}
            </Button>
            <div className="text-sm">{label}</div>
          </div>
        ))}
      </div>
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
  const form = useForm<z.infer<typeof proposalSchema>>({
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
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
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
