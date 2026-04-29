import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useQueue } from "@sophys-web/api-client/hooks";
import { api } from "@sophys-web/api-client/react";
import { cn } from "@sophys-web/ui";
import { Button } from "@sophys-web/ui/button";
import { Checkbox } from "@sophys-web/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
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
  CRYSTAL_OPTIONS,
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
  frequency: z.coerce.number({}),
  duration: z.coerce.number({}),
  fluorescence: z.boolean(),
  crystal: z.enum(CRYSTAL_OPTIONS),
  acquireThermocouple: z.boolean(),
  potentiostat: z.boolean(),
  fileName: z
    .string()
    .regex(/[A-Za-z0-9][A-Za-z0-9_-]{0,254}$/, {
      message:
        "File name must start with a letter or number and can only contain letters, numbers, underscores, and hyphens.",
    })
    .optional(),
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
    1 / data.frequency,
  );
  if (acceleration > MAX_ACCELERATION) {
    ctx.addIssue({
      path: ["frequency"],
      code: z.ZodIssueCode.custom,
      message: `Acceleration is above maximum limit (${MAX_ACCELERATION} deg/s²).  Current acceleration: ${acceleration.toFixed(2)} deg/s². Reduce delta energy or frequency!`,
    });
  }
});

/**
 * Default values for the form, using object structure.
 */
const formDefaults = {
  initialEnergy: 7000,
  finalEnergy: 8000,
  frequency: 1,
  duration: 86400, // 24h in seconds
  fluorescence: false,
  crystal: "Si111",
  acquireThermocouple: false,
  potentiostat: false,
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

  const watchedFrequency = useWatch({
    control: form.control,
    name: "frequency",
  });
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
  const currentCrystal = watchedCrystal;

  const enableScan =
    calculateAcceleration(
      watchedInitialEnergy,
      watchedFinalEnergy,
      currentCrystal,
      1 / watchedFrequency,
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
        className={cn("grid grid-cols-3 gap-4", className)}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.preventDefault();
        }}
      >
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

        <FormField
          control={form.control}
          name="frequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Frequency (Hz)
                <InfoTooltip>
                  The maximum acceleration is capped at {MAX_ACCELERATION}{" "}
                  deg/s².
                </InfoTooltip>
              </FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormDescription className="text-secondary-foreground text-sm italic">
                Maximum frequency:
                <span className="ml-1">
                  {calculateMaxFrequency(
                    watchedInitialEnergy,
                    watchedFinalEnergy,
                    currentCrystal,
                  ).toFixed(2)}
                  {"Hz"}
                </span>
              </FormDescription>
              <ErrorMessageTooltip />
            </FormItem>
          )}
        />

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
                      {CRYSTAL_OPTIONS.map((crystal) => (
                        <SelectItem key={crystal} value={crystal}>
                          {crystal}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription className="text-secondary-foreground text-sm italic">
                Current crystal: <BasePosition />
              </FormDescription>
              <ErrorMessageTooltip />
            </FormItem>
          )}
        />
        <FormLabel className="text-md col-span-3 text-center font-semibold">
          Sample environment
        </FormLabel>
        <FormField
          control={form.control}
          name="acquireThermocouple"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Thermocouple</FormLabel>
              </div>
              <ErrorMessageTooltip />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="potentiostat"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Potentiostat</FormLabel>
              </div>
              <ErrorMessageTooltip />
            </FormItem>
          )}
        />

        <FormLabel className="text-md col-span-3 text-center font-semibold">
          Post-Processing parameters
        </FormLabel>
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
        <FormField
          control={form.control}
          name="proposal"
          render={({ field }) => (
            <FormItem>
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
            <FormItem className="col-span-2">
              <FormLabel>File Name</FormLabel>
              <FormControl>
                <Input type="text" {...field} />
              </FormControl>
              <ErrorMessageTooltip />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="metadata"
          render={({ field }) => (
            <FormItem className="col-span-3">
              <FormLabel>Metadata</FormLabel>
              <FormControl>
                <Textarea
                  disabled // Metadata is currently not supported in the backend, so we disable the input for now to avoid confusion. It can be enabled once the backend supports it.
                  {...field}
                  rows={2}
                  className="font-mono"
                  placeholder={
                    'Additional text metadata e.g. "Trying new setup. Sample looks good."'
                  }
                />
              </FormControl>
              <ErrorMessageTooltip />
            </FormItem>
          )}
        />

        <div
          className="bg-muted text-secondary-foreground col-span-3 flex flex-col gap-1 rounded-md border border-dashed p-4 text-sm italic"
          role="region-block"
        >
          <FormLabel className="text-md font-semibold not-italic">
            Scan Summary
          </FormLabel>

          <p>
            Estimated Total Time:{" "}
            {convertTotalTimeToReadable(watchedDuration * 1000)}
          </p>

          <p>Estimated Period: {(1 / watchedFrequency).toFixed(2)} s</p>

          <p>
            Estimated Maximum Acceleration:{" "}
            <span
              data-error={!enableScan}
              className="data-[error=true]:text-red-500"
            >
              {calculateAcceleration(
                watchedInitialEnergy,
                watchedFinalEnergy,
                currentCrystal,
                1 / watchedFrequency,
              ).toFixed(2)}{" "}
              deg / s²
            </span>
          </p>
        </div>
        <Button
          type="submit"
          className="col-span-3"
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
  frequency: z.coerce.number({}),
  duration: z.coerce.number({}),
  fluorescence: z.boolean(),
  acquireThermocouple: z.boolean(),
  potentiostat: z.boolean(),
  fileName: z.string().optional(),
  crystal: z.enum(CRYSTAL_OPTIONS),
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
  onSubmitSuccess?: () => void;
  className?: string;
}

export function EditFlyScanForm(props: EditFlyScanFormProps) {
  const { data: userData } = api.auth.getUser.useQuery();
  const userProposal = userData?.proposal;
  const initialValues = editKwargsSchema.safeParse({
    ...props.kwargs,
    proposal: userProposal,
  });
  if (!initialValues.success) {
    console.error(
      "Failed to parse kwargs for fly scan plan",
      initialValues.error,
    );
    return <div>Error parsing plan data</div>;
  }
  if (!userProposal) {
    return <div>Cannot edit plan without a proposal ID</div>;
  }
  return (
    <MainForm
      editItemParams={{
        itemUid: props.itemUid,
        kwargs: initialValues.data,
      }}
      proposal={userProposal}
      onSubmitSuccess={props.onSubmitSuccess}
      className={props.className}
    />
  );
}
