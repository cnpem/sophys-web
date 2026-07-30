import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useQueue } from "@sophys-web/api-client/hooks";
import { cn } from "@sophys-web/ui";
import { Button } from "@sophys-web/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@sophys-web/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@sophys-web/ui/input-group";
import { InfoTooltip } from "@sophys-web/widgets/form-components/info-tooltip";
import { capillaryCardSlotLimitsMilimeters } from "../store/setup2/constants";

const name = "setup2_move_inside_card";

const schema = z.object({
  x: z.coerce
    .number()
    .min(capillaryCardSlotLimitsMilimeters.x.min)
    .max(capillaryCardSlotLimitsMilimeters.x.max),
  y: z.coerce
    .number()
    .min(capillaryCardSlotLimitsMilimeters.y.min)
    .max(capillaryCardSlotLimitsMilimeters.y.max),
});

export { name, schema };

export function MoveInsideCardForm({
  className,
  onSubmitSuccess,
  x,
  y,
}: {
  className?: string;
  onSubmitSuccess?: () => void;
  x?: z.infer<typeof schema.shape.x>;
  y?: z.infer<typeof schema.shape.y>;
}) {
  const { add } = useQueue();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      x: x ?? 0,
      y: y ?? 0,
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
          toast.success("Standard cleaning added to the queue");
          onSubmitSuccess?.();
        },
        onError: (error) => {
          toast.error("Failed to add standard cleaning to the queue", {
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
      className={cn("w-full", className)}
    >
      <FieldSet className="gap-2">
        <FieldLabel>Sample Position in the Slot</FieldLabel>
        <FieldGroup className="grid grid-cols-2 gap-2">
          <Controller
            name="x"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  Sample X
                  <InfoTooltip>
                    <FieldDescription>
                      Position X of the sample on the card slot.
                    </FieldDescription>
                  </InfoTooltip>
                </FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    type="number"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                    }}
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
            name="y"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  Sample Y
                  <InfoTooltip>
                    <FieldDescription>
                      Position Y of the sample on the card slot.
                    </FieldDescription>
                  </InfoTooltip>
                </FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    type="number"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                    }}
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
        </FieldGroup>
      </FieldSet>
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
