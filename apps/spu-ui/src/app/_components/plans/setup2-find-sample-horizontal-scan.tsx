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

export const name = "setup2_find_sample_horizontal_scan";

export const schema = z.object({
  proposal: proposalSchema,
  sampleTag: z.string().min(1),
  minX: z.coerce.number(),
  maxX: z.coerce.number(),
  stepX: z.coerce.number().int().positive().default(1),
  posY: z.coerce.number().default(0),
});

export function Setup2FindSampleHorizontalScanForm({
  className,
  onSubmitSuccess,
  sampleTag,
  minX,
  maxX,
  stepX,
  posY,
}: {
  className?: string;
  onSubmitSuccess?: () => void;
  sampleTag?: string;
  minX?: number;
  maxX?: number;
  stepX?: number;
  posY?: number;
}) {
  const { add } = useQueue();
  const { data: userData } = api.auth.getUser.useQuery();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      proposal: userData?.proposal ?? "",
      sampleTag: sampleTag ?? "",
      minX: minX ?? 0,
      maxX: maxX ?? 0,
      stepX: stepX ?? 1,
      posY: posY ?? 0,
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
          name="minX"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Minimum X Position
                <InfoTooltip>
                  <FieldDescription>
                    Minimum X position of the horizontal scan.
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
          name="maxX"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Maximum X Position
                <InfoTooltip>
                  <FieldDescription>
                    Maximum X position of the horizontal scan.
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
          name="stepX"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field
              data-invalid={fieldState.invalid}
              className="whitespace-nowrap"
            >
              <FieldLabel htmlFor={field.name}>
                X Step Size
                <InfoTooltip>
                  <FieldDescription>
                    The step size for the X-axis scan.
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
          name="posY"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field
              data-invalid={fieldState.invalid}
              className="whitespace-nowrap"
            >
              <FieldLabel htmlFor={field.name}>
                Y Position
                <InfoTooltip>
                  <FieldDescription>Y position of the scan.</FieldDescription>
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
