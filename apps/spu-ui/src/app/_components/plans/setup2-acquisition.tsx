import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CameraIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import type { ButtonProps } from "@sophys-web/ui/button";
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
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@sophys-web/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@sophys-web/ui/input-group";
import { InfoTooltip } from "@sophys-web/widgets/form-components/info-tooltip";
import { proposalSchema } from "./schemas/common";

export const name = "setup2_acquisition";

export const schema = z.object({
  acquireTime: z.coerce.number().positive(),
  numExposures: z.coerce.number().int().positive(),
  proposal: proposalSchema,
  sampleTag: z.string().min(1),
  usePimega: z.boolean().optional().default(true),
  usePicolo: z.boolean().optional().default(true),
  picoloChannel: z
    .enum(["channel1", "channel2"])
    .optional()
    .default("channel2"),
  detReadout: z.coerce.number().positive().optional().default(0.001),
});

export function Setup2AquisitionForm({
  className,
  onSubmitSuccess,
  params,
}: {
  className?: string;
  onSubmitSuccess?: () => void;
  params?: z.infer<typeof schema>;
}) {
  const { add } = useQueue();
  const { data: userData } = api.auth.getUser.useQuery();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      acquireTime: params?.acquireTime ?? 1,
      numExposures: params?.numExposures ?? 1,
      detReadout: params?.detReadout ?? 0.001,
      proposal: userData?.proposal ?? "",
      sampleTag: params?.sampleTag ?? "",
    },
  });

  function onSubmit(data: z.infer<typeof schema>) {
    toast.info("Submitting sample...");
    const kwargs = schema.parse(data);
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
          toast.success("Plan added to the queue");
          onSubmitSuccess?.();
        },
        onError: (error) => {
          toast.error("Failed to add plan to the queue", {
            description: error.message,
            closeButton: true,
          });
        },
      },
    );
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className={cn("flex flex-col", className)}
    >
      <FieldGroup
        className={cn("grid w-full grid-flow-row grid-cols-2 gap-2", className)}
      >
        <Controller
          name="sampleTag"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Sample Tag
                <InfoTooltip>
                  <FieldDescription>
                    A tag to identify the sample in generated data and metadata.
                  </FieldDescription>
                </InfoTooltip>
              </FieldLabel>
              <InputGroup>
                <InputGroupInput
                  {...field}
                  id={field.name}
                  type={"text"}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <InputGroupAddon align={"inline-end"}>
                    <InfoTooltip variant={"destructive"}>
                      {fieldState.error?.message}
                    </InfoTooltip>
                  </InputGroupAddon>
                )}
              </InputGroup>
            </Field>
          )}
        />
        <Controller
          name="acquireTime"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Acquire Time
                <InfoTooltip>
                  <FieldDescription>
                    The time for the acquisition of one sample in seconds in
                    both pimega and picolo.
                  </FieldDescription>
                </InfoTooltip>
              </FieldLabel>
              <InputGroup>
                <InputGroupInput
                  {...field}
                  id={field.name}
                  type={"number"}
                  aria-invalid={fieldState.invalid}
                />
                <InputGroupAddon align={"inline-end"}>seconds</InputGroupAddon>
                {fieldState.invalid && (
                  <InputGroupAddon align={"inline-end"}>
                    <InfoTooltip variant={"destructive"}>
                      {fieldState.error?.message}
                    </InfoTooltip>
                  </InputGroupAddon>
                )}
              </InputGroup>
            </Field>
          )}
        />
        <Controller
          name="numExposures"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field
              data-invalid={fieldState.invalid}
              className="whitespace-nowrap"
            >
              <FieldLabel htmlFor={field.name}>
                Number of Exposures
                <InfoTooltip>
                  <FieldDescription>
                    Number of acquisitions to be made.
                  </FieldDescription>
                </InfoTooltip>
              </FieldLabel>
              <InputGroup>
                <InputGroupInput
                  {...field}
                  id={field.name}
                  type={"number"}
                  step={1}
                  aria-invalid={fieldState.invalid}
                />
                <InputGroupAddon align={"inline-end"}>#</InputGroupAddon>
                {fieldState.invalid && (
                  <InputGroupAddon align={"inline-end"}>
                    <InfoTooltip variant={"destructive"}>
                      {fieldState.error?.message}
                    </InfoTooltip>
                  </InputGroupAddon>
                )}
              </InputGroup>
            </Field>
          )}
        />
        <Controller
          name="detReadout"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field
              data-invalid={fieldState.invalid}
              className="whitespace-nowrap"
            >
              <FieldLabel htmlFor={field.name}>
                Detector Readout Time
                <InfoTooltip>
                  <FieldDescription>
                    The time for the readout of the detector in seconds.
                  </FieldDescription>
                </InfoTooltip>
              </FieldLabel>
              <InputGroup>
                <InputGroupInput
                  {...field}
                  id={field.name}
                  type={"number"}
                  step={0.001}
                  aria-invalid={fieldState.invalid}
                />
                <InputGroupAddon align={"inline-end"}>seconds</InputGroupAddon>
                {fieldState.invalid && (
                  <InputGroupAddon align={"inline-end"}>
                    <InfoTooltip variant={"destructive"}>
                      {fieldState.error?.message}
                    </InfoTooltip>
                  </InputGroupAddon>
                )}
              </InputGroup>
            </Field>
          )}
        />
        <Controller
          name="proposal"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Proposal
                <InfoTooltip>
                  <FieldDescription>
                    The user's proposal to associated with the experiment.
                  </FieldDescription>
                </InfoTooltip>
              </FieldLabel>
              <InputGroup>
                <InputGroupInput
                  {...field}
                  id={field.name}
                  type={"text"}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <InputGroupAddon align={"inline-end"}>
                    <InfoTooltip variant={"destructive"}>
                      {fieldState.error?.message}
                    </InfoTooltip>
                  </InputGroupAddon>
                )}
              </InputGroup>
            </Field>
          )}
        />
      </FieldGroup>
      <Button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="mt-4 w-full"
      >
        Submit
      </Button>
    </form>
  );
}

interface Setup2AquisitionDialogProps extends Omit<ButtonProps, "type"> {
  onClose?: () => void;
}
export function Setup2AquisitionDialog({
  variant,
  size,
  className,
  onClose,
  ...props
}: Setup2AquisitionDialogProps) {
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
        <Button variant={variant} className={className} size={size} {...props}>
          <CameraIcon className="mr-2 h-4 w-4" />
          Acquisition
        </Button>
      </DialogTrigger>
      <DialogContent className="w-fit">
        <DialogHeader>
          <DialogTitle>Setup 2 Acquisition</DialogTitle>
          <DialogDescription className="flex flex-col gap-2">
            Acquire data from both the pimega and picolo devices for the setup
            2.
          </DialogDescription>
        </DialogHeader>
        <Setup2AquisitionForm onSubmitSuccess={handleSubmitSuccess} />
      </DialogContent>
    </Dialog>
  );
}
