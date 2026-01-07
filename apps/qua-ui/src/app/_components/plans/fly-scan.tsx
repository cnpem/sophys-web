"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useQueue } from "@sophys-web/api-client/hooks";
import { api } from "@sophys-web/api-client/react";
import { cn } from "@sophys-web/ui";
import { Button } from "@sophys-web/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@sophys-web/ui/form";
import { Input } from "@sophys-web/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@sophys-web/ui/select";
import { Textarea } from "@sophys-web/ui/textarea";
import {
  ErrorMessageTooltip,
  InfoTooltip,
} from "@sophys-web/widgets/form-components/info-tooltip";
import type { AddEnergyScanProps } from "./energy-scan-utils";
import type { QueueItemProps } from "~/lib/types";
import {
  BasePosition,
  calculateAcceleration,
  calculateMaxFrequency,
  convertTotalTimeToReadable,
  crystalEnum,
  crystalOptions,
  MAX_ACCELERATION,
} from "./energy-scan-utils";

export const PLAN_NAME_FLY = "exafs_fly_scan" as const;

/**
 * Base Schema for form validation
 */
export const baseFormSchema = z.object({
  initialEnergy: z.coerce
    .number({})
    .gt(4000, "Initial energy must be at leats 4000 eV"),
  finalEnergy: z.coerce.number({}),
  period: z.coerce.number({}),
  duration: z.coerce.number({}),
  fluorescence: z.boolean(),
  crystal: z.nativeEnum(crystalEnum),
  acquireThermocouple: z.boolean(),
  fileName: z.string().optional(),
  deltaEnergy: z.coerce.number({}),
  filterOrder: z.coerce.number({}),
  filterCutoff: z.coerce.number({}),
  metadata: z.string().optional(),
  proposal: z
    .string({
      description: "Proposal ID",
    })
    .min(1, "Proposal ID is required"),
});

const formSchema = baseFormSchema.superRefine((data, ctx) => {
  const acceleration = calculateAcceleration(
    data.initialEnergy,
    data.finalEnergy,
    data.crystal,
    data.period,
  );
  if (acceleration > MAX_ACCELERATION) {
    ctx.addIssue({
      path: ["period"],
      code: z.ZodIssueCode.custom,
      message: `Acceleration is above maximum limit (${MAX_ACCELERATION} deg/s²).  Current acceleration: ${acceleration.toFixed(2)} deg/s². Increase period or reduce delta energy!`,
    });
  }
});

/**
 * Default values for the form, using object structure.
 */
const formDefaults = {
  initialEnergy: 7000,
  finalEnergy: 8000,
  period: 1,
  duration: 86400, // 24h in seconds
  fluorescence: false,
  crystal: "Si111",
  acquireThermocouple: false,
  fileName: "",
  deltaEnergy: 0.2,
  filterOrder: 1,
  filterCutoff: 20,
  metadata: "",
} as z.infer<typeof formSchema>;

// =========================================================================
// MainForm Component
// =========================================================================

/**
 * Main form component for the Fly Scan plan.
 * Handles both creation and editing of plans.
 * Props:
 * - className: optional class name for styling
 * - proposal: proposal ID to associate with the plan
 * - editItemParams: optional parameters for editing an existing plan
 * - onSubmitSuccess: optional callback to be triggered on submit success.
 *
 * If editItemParams is provided, the form will be pre-filled with the existing plan data.
 * and submitting the form will update the existing plan instead of creating a new one in the queue.
 */
export function MainForm({
  className,
  proposal,
  editItemParams,
  onSubmitSuccess,
}: {
  className?: string;
  proposal: string;
  editItemParams?: {
    kwargs: z.infer<typeof formSchema>;
    itemUid: string;
  };
  onSubmitSuccess?: () => void;
}) {
  /**
   *  Schema for submitting the complete form
   */

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...formDefaults,
      ...editItemParams?.kwargs,
      proposal,
    },
  });

  const { addBatch: submitPlan, update: editPlan } = useQueue();

  const watchedPeriod = useWatch({ control: form.control, name: "period" });
  const watchedInitialEnergy = useWatch({
    control: form.control,
    name: "initialEnergy",
  });
  const watchedFinalEnergy = useWatch({
    control: form.control,
    name: "finalEnergy",
  });
  const watchedDuration = useWatch({ control: form.control, name: "duration" });
  const watchedCrystal = useWatch({ control: form.control, name: "crystal" });
  const currentCrystal = watchedCrystal as crystalEnum;

  const enableScan =
    calculateAcceleration(
      watchedInitialEnergy,
      watchedFinalEnergy,
      currentCrystal,
      watchedPeriod,
    ) < MAX_ACCELERATION;

  function onSubmit(formData: z.infer<typeof formSchema>) {
    const apiData = {
      ...formData,
    };

    if (editItemParams) {
      editPlan.mutate(
        {
          item: {
            name: PLAN_NAME_FLY,
            itemType: "plan",
            args: [],
            kwargs: apiData,
            itemUid: editItemParams.itemUid,
          },
        },
        {
          onSuccess: () => {
            if (onSubmitSuccess) onSubmitSuccess();
          },
          onError: (error) => {
            toast.error("Failed to edit plan", {
              description: error.message,
              closeButton: true,
            });
          },
        },
      );
    } else {
      submitPlan.mutate(
        {
          items: [
            {
              name: PLAN_NAME_FLY,
              itemType: "plan",
              args: [],
              kwargs: apiData,
            },
          ],
          pos: "back",
        },
        {
          onSuccess: () => {
            if (onSubmitSuccess) onSubmitSuccess();
          },
          onError: (error) => {
            toast.error("Failed to submit", {
              description: error.message,
              closeButton: true,
            });
          },
        },
      );
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("space-y-8", className)}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.preventDefault();
        }}
      >
        <div className="flex flex-col space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="initialEnergy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Initial Energy (eV)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <ErrorMessageTooltip />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="finalEnergy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Final Energy (eV)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <ErrorMessageTooltip />
                </FormItem>
              )}
            />

            <div className="flex w-full flex-col">
              <FormField
                control={form.control}
                name="period"
                render={({ field }) => (
                  <FormItem>
                    <div className="inline-flex w-full gap-1">
                      <FormLabel>Period (s)</FormLabel>
                      <InfoTooltip>
                        The maximum acceleration is capped at {MAX_ACCELERATION}{" "}
                        deg/s².
                      </InfoTooltip>
                    </div>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <ErrorMessageTooltip />
                  </FormItem>
                )}
              />
              <p className="text-secondary-foreground mt-1 text-sm italic">
                Minimum period:{" "}
                {(
                  1 /
                  calculateMaxFrequency(
                    watchedInitialEnergy,
                    watchedFinalEnergy,
                    currentCrystal,
                  )
                ).toFixed(5)}{" "}
                seconds
              </p>
            </div>
            <div className="flex w-full flex-col">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (s)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <ErrorMessageTooltip />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex w-full flex-col">
              <FormField
                control={form.control}
                name="crystal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Crystal</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <SelectTrigger className="w-auto">
                          <SelectValue placeholder="Select crystal" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Available Crystals</SelectLabel>
                            {crystalOptions.map((crystal) => (
                              <SelectItem key={crystal} value={crystal}>
                                {crystal}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <ErrorMessageTooltip />
                  </FormItem>
                )}
              />
              <p className="text-secondary-foreground mt-1 text-sm italic">
                Current crystal: <BasePosition />
              </p>
            </div>
          </div>

          <div className="max-h-72 w-full px-1">
            <div
              className="border-dashedp flex flex-col gap-2 rounded-md border p-4"
              role="region-block"
            >
              <FormLabel className="col-span-5 text-center text-lg font-semibold">
                Post-Processing parameters
              </FormLabel>
              <div className="flex-col-3 flex gap-4">
                <FormField
                  control={form.control}
                  name="deltaEnergy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Energy step(eV)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <ErrorMessageTooltip />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="filterOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Filter Order</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <ErrorMessageTooltip />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="filterCutoff"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Filter Cutoff (kHz)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <ErrorMessageTooltip />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
          <div className="flex w-full flex-row items-stretch space-x-4">
            <FormField
              control={form.control}
              name="proposal"
              render={({ field }) => (
                <FormItem className="w-28 flex-shrink-0">
                  <FormLabel>Proposal ID</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <ErrorMessageTooltip />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fileName"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>File Name</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <ErrorMessageTooltip />
                </FormItem>
              )}
            />
          </div>
        </div>
        <FormField
          control={form.control}
          name="metadata"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Metadata</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  className="h-32 font-mono"
                  placeholder='Additional text metadata e.g. "Trying new setup. Sample looks good."'
                />
              </FormControl>
              <ErrorMessageTooltip />
            </FormItem>
          )}
        />

        <div
          className="border-dashedp flex flex-col gap-2 rounded-md border p-4"
          role="region-block"
        >
          <FormLabel className="col-span-5 text-lg font-semibold">
            Scan Summary
          </FormLabel>

          <p className="text-secondary-foreground col-span-5 mt-1 text-sm italic">
            Estimated Total Time:{" "}
            {convertTotalTimeToReadable(watchedDuration * 1000)}
          </p>

          <p className="text-secondary-foreground col-span-5 mt-1 text-sm italic">
            Estimated Frequency: {(1 / watchedPeriod).toFixed(2)} Hz
          </p>

          <p className="text-secondary-foreground col-span-5 mt-1 text-sm italic">
            Estimated Maximum Acceleration:{" "}
            <span
              data-error={!enableScan}
              className="data-[error=true]:text-red-500"
            >
              {calculateAcceleration(
                watchedInitialEnergy,
                watchedFinalEnergy,
                currentCrystal,
                watchedPeriod,
              ).toFixed(2)}{" "}
              deg / s²
            </span>
          </p>
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          Submit
        </Button>
      </form>
    </Form>
  );
}

// ========================================================================
// Add New Plan Dialog Component
// ========================================================================

export function AddFlyScan(props: AddEnergyScanProps) {
  const { data } = api.auth.getUser.useQuery();
  return (
    <MainForm
      proposal={data?.proposal ?? ""}
      onSubmitSuccess={props.onSubmitSuccess}
      className={props.className}
    />
  );
}

// ========================================================================
// Edit Form Component and schemas
// ========================================================================

/**
 * Schema for parsing queue items into the form inputs with less rigorous validation.
 */
const editKwargsSchema = z.object({
  initialEnergy: z.coerce.number({}),
  finalEnergy: z.coerce.number({}),
  period: z.coerce.number({}),
  duration: z.coerce.number({}),
  fluorescence: z.boolean(),
  acquireThermocouple: z.boolean(),
  fileName: z.string().optional(),
  crystal: z.nativeEnum(crystalEnum),
  deltaEnergy: z.coerce.number({}),
  filterOrder: z.coerce.number({}),
  filterCutoff: z.coerce.number({}),
  metadata: z.string().optional(),
  proposal: z
    .string({
      description: "Proposal ID",
    })
    .min(1, "Proposal ID is required"),
});

interface EditFlyScanFormProps
  extends Pick<QueueItemProps, "itemUid" | "kwargs"> {
  proposal?: string;
  onSubmitSuccess?: () => void;
  className?: string;
}

export function EditFlyScanForm(props: EditFlyScanFormProps) {
  const initialValues = editKwargsSchema.safeParse({
    ...props.kwargs,
    proposal: props.proposal ?? undefined,
  });
  if (!initialValues.success) {
    console.error(
      "Failed to parse kwargs for fly scan plan",
      initialValues.error,
    );
    return <div>Error parsing plan data</div>;
  }
  if (!props.proposal) {
    return <div>Cannot edit plan without a proposal ID</div>;
  }
  return (
    <MainForm
      editItemParams={{
        itemUid: props.itemUid,
        kwargs: initialValues.data,
      }}
      proposal={props.proposal}
      onSubmitSuccess={props.onSubmitSuccess}
      className={props.className}
    />
  );
}
