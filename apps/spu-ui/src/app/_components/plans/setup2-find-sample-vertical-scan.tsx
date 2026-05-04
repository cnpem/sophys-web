import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useQueue } from "@sophys-web/api-client/hooks";
import { api } from "@sophys-web/api-client/react";
import { cn } from "@sophys-web/ui";
import { Button } from "@sophys-web/ui/button";
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

export const name = "setup2_find_sample_vertical_scan";

export const schema = z.object({
  proposal: proposalSchema,
  sampleTag: z.string().min(1),
  minY: z.coerce.number(),
  maxY: z.coerce.number(),
  stepY: z.coerce.number().int().positive().default(1),
  posX: z.coerce.number().default(0),
});

export function Setup2FindSampleVerticalScanForm({
  className,
  onSubmitSuccess,
  sampleTag,
  minY,
  maxY,
  stepY,
  posX,
}: {
  className?: string;
  onSubmitSuccess?: () => void;
  sampleTag?: string;
  minY?: number;
  maxY?: number;
  stepY?: number;
  posX?: number;
}) {
  const { add } = useQueue();
  const { data: userData } = api.auth.getUser.useQuery();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      proposal: userData?.proposal ?? "",
      sampleTag: sampleTag ?? "",
      minY: minY ?? 0,
      maxY: maxY ?? 0,
      stepY: stepY ?? 1,
      posX: posX ?? 0,
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
          name="minY"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Minimum Y Position
                <InfoTooltip>
                  <FieldDescription>
                    Minimum Y position of the vertical scan.
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
                <InputGroupAddon align={"inline-end"}>mm</InputGroupAddon>
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
          name="maxY"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Maximum Y Position
                <InfoTooltip>
                  <FieldDescription>
                    Maximum Y position of the vertical scan.
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
                <InputGroupAddon align={"inline-end"}>mm</InputGroupAddon>
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
          name="stepY"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field
              data-invalid={fieldState.invalid}
              className="whitespace-nowrap"
            >
              <FieldLabel htmlFor={field.name}>
                Y Step Size
                <InfoTooltip>
                  <FieldDescription>
                    The step size for the Y-axis scan.
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
                <InputGroupAddon align={"inline-end"}>mm</InputGroupAddon>
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
          name="posX"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field
              data-invalid={fieldState.invalid}
              className="whitespace-nowrap"
            >
              <FieldLabel htmlFor={field.name}>
                X Position
                <InfoTooltip>
                  <FieldDescription>X position of the scan.</FieldDescription>
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
                <InputGroupAddon align={"inline-end"}>mm</InputGroupAddon>
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
