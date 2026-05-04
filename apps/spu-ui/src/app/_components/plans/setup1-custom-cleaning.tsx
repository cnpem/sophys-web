import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { BubblesIcon, Trash2Icon } from "lucide-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useQueue } from "@sophys-web/api-client/hooks";
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
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@sophys-web/ui/field";
import { Form } from "@sophys-web/ui/form";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@sophys-web/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@sophys-web/ui/select";
import { Skeleton } from "@sophys-web/ui/skeleton";
import { ErrorMessageTooltip } from "@sophys-web/widgets/form-components/info-tooltip";
import { cleaningAgents } from "~/app/_components/store/setup1/constants";

export const planName = "setup1_custom_cleaning_procedure";
const planSchema = z
  .object({
    agentsList: z.array(
      z.enum(cleaningAgents, {
        message: `Agents must be one of ${cleaningAgents.join(", ")}`,
      }),
      {
        message: `Agents must be a list of strings`,
      },
    ),
    agentsDuration: z.array(
      z.coerce.number().int().positive({
        message: "Duration must be a positive integer",
      }),
      {
        message: "Duration must be a list of numbers",
      },
    ),
  })
  .superRefine((data, ctx) => {
    if (data.agentsList.length !== data.agentsDuration.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Agents and durations must have the same length",
      });
    }
  });

/** formSchema is used to validate the ui form inputs, with a list of objects {agent: string, duration: number}, validate the input and
 * then transform it to the planSchema format {agentsList: string[], agentsDuration: number[]} before submitting to the queue
 */
const formSchema = z.object({
  cleaningSteps: z
    .array(
      z.object({
        agent: z.enum(cleaningAgents, {
          message: `Agent must be one of ${cleaningAgents.join(", ")}`,
        }),
        duration: z.coerce.number().int().positive({
          message: "Duration must be a positive integer",
        }),
      }),
    )
    .min(1, {
      message: "At least one cleaning step is required",
    }),
});

const formSchemaWithTransform = formSchema.transform((data) => {
  const agentsList = data.cleaningSteps.map((step) => step.agent);
  const agentsDuration = data.cleaningSteps.map((step) => step.duration);
  return { agentsList, agentsDuration } as z.infer<typeof planSchema>;
});

const parsePlanDataToFormData = ({
  agentsList,
  agentsDuration,
}: {
  agentsList: string[];
  agentsDuration: number[];
}) => {
  const unsafeList = agentsList.map((agent, index) => ({
    agent,
    duration: agentsDuration[index] ?? 0,
  }));
  return formSchema.parse({ cleaningSteps: unsafeList });
};

export function CustomCleaningDialog({
  className,
  onClose,
}: {
  className?: string;
  onClose?: () => void;
}) {
  const [open, setOpen] = useState(false);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      onClose?.();
    }
  };

  const handleSubmitSuccess = () => {
    setOpen(false);
    onClose?.();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" className={className}>
          <BubblesIcon className="mr-2 h-4 w-4" />
          Custom Cleaning
        </Button>
      </DialogTrigger>
      <DialogContent className="w-80">
        <DialogHeader>
          <DialogTitle>Custom Cleaning</DialogTitle>
          <DialogDescription className="flex flex-col gap-2">
            Please configure the custom cleaning steps.
          </DialogDescription>
        </DialogHeader>
        <CustomCleaningForm onSubmitSuccess={handleSubmitSuccess} />
      </DialogContent>
    </Dialog>
  );
}

export function CustomCleaningForm({
  className,
  onSubmitSuccess,
  planData,

  // agentsList,
  // agentsDuration,
}: {
  className?: string;
  onSubmitSuccess?: () => void;
  planData?: {
    agentsList: string[];
    agentsDuration: number[];
  };
}) {
  const { add } = useQueue();
  const parsedData = planData ? parsePlanDataToFormData(planData) : undefined;
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cleaningSteps: parsedData?.cleaningSteps ?? [],
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    toast.info("Submitting sample...");
    const parsedData = formSchemaWithTransform.parse(data);
    const kwargs = planSchema.parse(parsedData);
    add.mutate(
      {
        item: {
          name: planName,
          itemType: "plan",
          args: [],
          kwargs,
        },
      },
      {
        onSuccess: () => {
          toast.success("Custom cleaning added to the queue");
          onSubmitSuccess?.();
        },
        onError: (error) => {
          toast.error("Failed to add custom cleaning to the queue", {
            description: error.message,
            closeButton: true,
          });
        },
      },
    );
  }

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "cleaningSteps",
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("w-full space-y-4", className)}
      >
        <FieldSet>
          <FieldLegend variant="label">Cleaning Steps</FieldLegend>
          <FieldDescription>
            Add cleaning steps by selecting an agent and specifying the duration
            for each step.
          </FieldDescription>
          <FieldGroup className="gap-2">
            {/* column headers */}
            <div className="grid grid-cols-[4fr_4fr_1fr] items-center gap-2">
              <FieldLabel>Agent</FieldLabel>
              <FieldLabel>Duration (s)</FieldLabel>
              <div></div>
            </div>
            {/* Array items  */}
            {!fields.length && (
              <div className="grid grid-cols-[4fr_4fr_1fr] items-center gap-2">
                <Skeleton className="h-10 w-full animate-pulse rounded" />
                <Skeleton className="h-10 w-full animate-pulse rounded" />
                <div></div>
              </div>
            )}
            {fields.map((arrayItemField, arrayIndex) => (
              <Field
                key={arrayItemField.id}
                className="grid grid-cols-[4fr_4fr_1fr] items-center gap-2"
              >
                <Controller
                  name={`cleaningSteps.${arrayIndex}.agent`}
                  control={form.control}
                  render={({ field: controlledField, fieldState }) => (
                    <Field
                      data-invalid={fieldState.invalid}
                      className="flex flex-row"
                    >
                      <Select
                        onValueChange={(value) => {
                          controlledField.onChange(value);
                        }}
                        value={controlledField.value}
                        name={controlledField.name}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {cleaningAgents.map((agent) => (
                            <SelectItem key={agent} value={agent}>
                              {agent}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <ErrorMessageTooltip>
                          {fieldState.error?.message}
                        </ErrorMessageTooltip>
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name={`cleaningSteps.${arrayIndex}.duration`}
                  control={form.control}
                  render={({ field: controlledField, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <InputGroup>
                        <InputGroupInput
                          type="number"
                          {...controlledField}
                          onChange={(e) => {
                            controlledField.onChange(e.target.value);
                          }}
                        />
                        {fieldState.invalid && (
                          <InputGroupAddon align={"inline-end"}>
                            <ErrorMessageTooltip>
                              {fieldState.error?.message}
                            </ErrorMessageTooltip>
                          </InputGroupAddon>
                        )}
                      </InputGroup>
                    </Field>
                  )}
                />
                <Button
                  variant="ghost"
                  onClick={() => remove(arrayIndex)}
                  size={"icon"}
                  className="text-destructive align-middle"
                >
                  <Trash2Icon className="size-4" />
                </Button>
              </Field>
            ))}
          </FieldGroup>
        </FieldSet>
        {form.formState.errors.cleaningSteps?.message && (
          <FieldError>{form.formState.errors.cleaningSteps.message}</FieldError>
        )}
        <Button
          type="button"
          variant={"outline"}
          onClick={() => append({ agent: cleaningAgents[0], duration: 0 })}
          className="w-full"
        >
          Add Cleaning Step
        </Button>
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
