"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { MoveRightIcon, UploadIcon } from "lucide-react";
import { parse } from "papaparse";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@sophys-web/ui/select";
import { toast } from "@sophys-web/ui/sonner";
import type { schema as cleaningKwargsSchema } from "../../../lib/schemas/plans/cleaning";
import type { SampleParams } from "../../../lib/schemas/sample";
import type { TableItem } from "../../../lib/schemas/table";
import type { Sample } from "../sample";
import { useQueue } from "../../_hooks/use-queue";
import { useSSEData } from "../../_hooks/use-sse-data";
import {
  cleaningDefaults,
  name as cleaningPlanName,
} from "../../../lib/schemas/plans/cleaning";
import {
  defaults as cleanCapillaryDefaults,
  schema as cleanCapillaryKwargsSchema,
  name as cleanCapillaryPlanName,
} from "../../../lib/schemas/plans/clear-acquisition";
import {
  schema as acquisitionKwargsSchema,
  name as acquisitionPlanName,
} from "../../../lib/schemas/plans/complete-acquisition";
import { tableItemSchema } from "../../../lib/schemas/table";
import { setSamples as setServerSamples } from "../../actions/samples";
import { samplePosition } from "../experiment";

function parseFile(file: File) {
  return new Promise<TableItem[]>((resolve, reject) => {
    parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const { data: csvData, errors } = results;
        if (errors.length > 0) {
          console.error("Error reading CSV file", errors);
          reject(
            new Error(
              `Error reading CSV file: ${errors.map((e) => e.message).join(", ")}`,
            ),
          );
          return;
        }
        const parsedData = csvData
          .map((data, index) => {
            const result = tableItemSchema.safeParse(data);
            if (!result.success) {
              console.error(
                `Error parsing table item on line ${index + 1}`,
                result.error.message,
              );
              return null;
            }
            return result.data;
          })
          .filter((item): item is TableItem => item !== null);
        if (parsedData.length === 0) {
          console.error("Error parsing table items. No data returned");
          reject(new Error("Error parsing table items. No data returned"));
          return;
        }
        resolve(parsedData);
      },
    });
  });
}

function tableToPlanItems(
  table: TableItem[],
  proposal: string,
  planName: string,
) {
  return table.map((item) => {
    const { data, success, error } = acquisitionKwargsSchema.safeParse({
      ...item,
      proposal,
    });
    if (success) {
      return {
        name: planName,
        args: [],
        kwargs: {
          ...data,
        },
        itemType: "plan",
      };
    }
    throw new Error(`Error parsing table item into kwargs: ${error.message}`);
  });
}
const cleaningSelectOptions = [...cleaningDefaults, "custom"] as const;

const formSchema = z
  .object({
    useCapillary: z.boolean(),
    proposal: z.string().length(9),
    cleaningOption: z
      .string()
      .refine((option) =>
        cleaningSelectOptions.includes(
          option as (typeof cleaningSelectOptions)[number],
        ),
      ),
    agentsList: z.array(z.string()).optional(),
    agentsDuration: z.array(z.number()).optional(),
    file: z.instanceof(File),
  })
  .superRefine((data, ctx) => {
    if (data.cleaningOption === "custom") {
      if (!data.agentsList || !data.agentsDuration) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Custom cleaning option requires agents and durations",
        });
      }
      if (data.agentsList?.length !== data.agentsDuration?.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Agents and durations must have the same length",
        });
      }
    } else {
      if (
        (data.agentsList?.length ?? 0) > 0 ||
        (data.agentsDuration?.length ?? 0) > 0
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Standard cleaning options cannot have agents or durations",
        });
      }
    }
  });

function UploadQueueForm({
  onSubmitSuccess,
}: {
  onSubmitSuccess?: () => void;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      useCapillary: false,
      proposal: "",
    },
  });
  const { data: samples } = useSSEData<Sample[]>("/api/samples");
  const { addBatch } = useQueue();

  const uploadSamples = async (data: SampleParams[]) => {
    const prevSamples = samples;
    const newSamples = data.map((sample) => {
      const { complete, relative } = samplePosition(
        sample.row,
        sample.col,
        sample.tray,
      );
      return {
        id: complete,
        relativePosition: relative,
        type: sample.sampleType,
        ...sample,
      } as Sample;
    });

    if (prevSamples === undefined) {
      await setServerSamples(newSamples);
      return;
    }
    const updatedSamples = prevSamples.map((prevSample) => {
      const newSample = newSamples.find(
        (sample) => sample.id === prevSample.id,
      );
      return newSample ?? prevSample;
    });
    await setServerSamples(updatedSamples);
  };

  async function onSubmit(data: z.infer<typeof formSchema>) {
    toast.message("Parsing CSV file...");
    try {
      const parsedFileData = await parseFile(data.file);
      toast.success("Uploading queue...");
      await uploadSamples(parsedFileData);
      const planData = tableToPlanItems(
        parsedFileData,
        data.proposal,
        acquisitionPlanName,
      );
      // add a "normal" cleaning plan for each sample
      const items = planData.flatMap((plan) => {
        const cleaningPlan = {
          name: cleaningPlanName,
          args: [],
          kwargs: {
            standardOption:
              data.cleaningOption !== "custom" ? data.cleaningOption : "",
            agentsList: data.agentsList ?? undefined,
            agentsDuration: data.agentsDuration ?? undefined,
          } as z.infer<typeof cleaningKwargsSchema>,
          itemType: "plan",
        };
        return [plan, cleaningPlan];
      });
      toast.info("Submitting batch to the queue");
      await addBatch.mutateAsync(
        {
          items: [
            ...(data.useCapillary
              ? [
                  {
                    name: cleanCapillaryPlanName,
                    args: [],
                    kwargs: {
                      ...cleanCapillaryDefaults,
                      proposal: data.proposal,
                    } as z.infer<typeof cleanCapillaryKwargsSchema>,
                    itemType: "plan",
                  },
                ]
              : []),
            ...items,
          ],
        },
        {
          onSuccess: () => {
            onSubmitSuccess?.();
            toast.success("Batch submitted");
          },
          onError: (error) => {
            toast.error(`Failed to submit batch: ${error.message}`);
          },
        },
      );
      return;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error parsing form data";
      toast.error("Error parsing form data", {
        description: message,
      });
      return;
    }
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="proposal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Proposal</FormLabel>
              <FormControl>
                <Input maxLength={9} placeholder="p00000000" {...field} />
              </FormControl>
              <FormDescription>
                This is your proposal ID, e.g. p00000000.
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
        <FormField
          control={form.control}
          name="cleaningOption"
          render={({ field }) => (
            <FormItem>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select the cleaning type between acquisitions" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {cleaningSelectOptions.map((option) => {
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
          name="agentsList"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Agents</FormLabel>
              <FormControl>
                <Input
                  disabled={form.watch("cleaningOption") !== "custom"}
                  placeholder="e.g. agent1, agent2, agent3"
                  value={field.value ? field.value.join(",") : ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value ? value.split(",") : undefined);
                  }}
                />
              </FormControl>
              <FormDescription>
                Enter the agents used for cleaning, separated by commas.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="agentsDuration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Agents Duration</FormLabel>
              <FormControl>
                <Input
                  disabled={form.watch("cleaningOption") !== "custom"}
                  placeholder="e.g. 10, 20, 30"
                  value={field.value ? field.value.join(",") : ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(
                      value ? value.split(",").map(Number) : undefined,
                    );
                  }}
                />
              </FormControl>
              <FormDescription>
                Enter the durations for each agent, separated by commas.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CSV Queue</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file !== undefined) {
                      field.onChange(file);
                    }
                  }}
                />
              </FormControl>
              <FormDescription>
                This is the CSV file containing the experiment queue.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}

export function UploadQueue() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
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

type Steps = "proposal" | "capillary" | "cleaning" | "acquisition";

function StepByStepForm({ onSubmitSuccess }: { onSubmitSuccess?: () => void }) {
  const [step, setStep] = useState<Steps>("proposal");
  const [cleaningParams, setCleaningParams] =
    useState<z.infer<typeof cleaningKwargsSchema>>();
  const [acquisitionParams, setAcquisitionParams] =
    useState<z.infer<typeof acquisitionKwargsSchema>[]>();
  const [capillaryParams, setCapillaryParams] =
    useState<z.infer<typeof cleanCapillaryKwargsSchema>>();
  const [proposal, setProposal] = useState<string>("");
  const [useCapillary, setUseCapillary] = useState(false);

  const { addBatch } = useQueue();

  function onSubmitProposal(data: z.infer<typeof proposalSchema>) {
    setProposal(data.proposal);
    setUseCapillary(data.useCapillary);
    if (data.useCapillary) {
      setStep("capillary");
    } else {
      setStep("cleaning");
    }
  }

  function onSubmitCapillary(data: z.infer<typeof cleanCapillaryKwargsSchema>) {
    setCapillaryParams(data);
    setStep("cleaning");
  }

  function onSubmitCleaning(data: z.infer<typeof cleaningKwargsSchema>) {
    setCleaningParams(data);
    setStep("acquisition");
  }

  function onSubmitAcquisition(
    data: z.infer<typeof acquisitionKwargsSchema>[],
  ) {
    setAcquisitionParams(data);
    // submit the batch
    const items = acquisitionParams?.map((params) => ({
      name: acquisitionPlanName,
      args: [],
      kwargs: {
        ...params,
        proposal,
      },
      itemType: "plan",
    }));
    if (items === undefined) {
      return;
    }
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
    // add a "normal" cleaning plan for each sample
    const cleaningPlan = {
      name: cleaningPlanName,
      args: [],
      kwargs: cleaningParams,
      itemType: "plan",
    };
    const itemsWithCleaning = batch.flatMap((plan) => [plan, cleaningPlan]) as {
      name: string;
      args: never[];
      kwargs: Record<string, unknown>;
      itemType: "plan";
    }[];
    // submit the batch
    toast.info("Submitting batch to the queue");

    addBatch.mutate(
      {
        items: itemsWithCleaning,
      },
      {
        onSuccess: () => {
          onSubmitSuccess?.();
          toast.success("Batch submitted");
        },
        onError: (error) => {
          toast.error(`Failed to submit batch: ${error.message}`);
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
        }).map(([key, label], index) => (
          <div key={key} className="flex flex-col items-center">
            <Button
              className="rounded-full"
              size="icon"
              disabled={(key === "capillary" && !useCapillary) || !proposal}
              variant={step === (key as Steps) ? "default" : "outline"}
              onClick={() => setStep(key as Steps)}
            >
              {index + 1}
            </Button>
            <div className="text-sm">{label}</div>
          </div>
        ))}
      </div>
      <>
        {step === "proposal" && (
          <ProposalForm
            onSubmit={onSubmitProposal}
            initialValues={{
              proposal,
              useCapillary,
            }}
          />
        )}
        {step === "capillary" && (
          <CleanAndAcquireForm
            onSubmit={onSubmitCapillary}
            initialValues={{
              proposal,
              ...capillaryParams,
              isRef: true,
            }}
          />
        )}
        {step === "cleaning" && (
          <CleanAndAcquireForm
            onSubmit={onSubmitCleaning}
            initialValues={{
              proposal,
              ...cleaningParams,
              isRef: false,
            }}
          />
        )}
        {step === "acquisition" && (
          // <AcquisitionForm onSubmitSuccess={onSubmitAcquisition} />
          <span>acquisition step</span>
        )}
      </>
    </div>
  );
}

const proposalSchema = z.object({
  proposal: z.string().length(9, "Proposal ID must be 9 characters"),
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
                <Input maxLength={9} placeholder="p00000000" {...field} />
              </FormControl>
              <FormDescription>
                This is your proposal ID, e.g. p00000000.
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

function CleanAndAcquireForm({
  onSubmit,
  initialValues,
}: {
  onSubmit: (data: z.infer<typeof cleanCapillaryKwargsSchema>) => void;
  initialValues?: Partial<z.infer<typeof cleanCapillaryKwargsSchema>>;
}) {
  const form = useForm<z.infer<typeof cleanCapillaryKwargsSchema>>({
    resolver: zodResolver(cleanCapillaryKwargsSchema),
    defaultValues: initialValues,
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col items-end space-y-8"
      >
        <div className="grid grid-cols-3 gap-8">
          <FormField
            control={form.control}
            name="proposal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Proposal</FormLabel>
                <FormControl>
                  <Input disabled {...field} />
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
            name="volume"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Volume</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
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
            name="standardOption"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cleaning Method</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value ?? undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {cleaningSelectOptions.map((option) => {
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
            name="agentsList"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Agents</FormLabel>
                <FormControl>
                  <Input
                    disabled={form.watch("standardOption") !== "custom"}
                    placeholder="e.g. agent1, agent2, agent3"
                    value={field.value ? field.value.join(",") : ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value ? value.split(",") : undefined);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="agentsDuration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Agents Duration</FormLabel>
                <FormControl>
                  <Input
                    disabled={form.watch("standardOption") !== "custom"}
                    placeholder="e.g. 10, 20, 30"
                    value={field.value ? field.value.join(",") : ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(
                        value ? value.split(",").map(Number) : undefined,
                      );
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isRef"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
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
        <Button type="submit">
          Next
          <MoveRightIcon className="ml-2 h-4 w-4" />
        </Button>
      </form>
    </Form>
  );
}
