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
import { cardSlotRadius } from "../store/setup2/constants";
import { isValidCardCoordinates } from "../store/setup2/use-sample-store";

const name = "setup2_move_inside_sample";

const schema = z.object({
  x: z.coerce.number(),
  y: z.coerce.number(),
});

const schemaRefined = schema.refine(
  (data) => isValidCardCoordinates({ x: data.x, y: data.y }),
  (data) => ({
    message: `Coordinates must be within a circle of radius ${cardSlotRadius}mm. 
    Radius for (${data.x},${data.y}): ${Math.sqrt(data.x ** 2 + data.y ** 2).toFixed(2)}`,
    path: ["x"],
  }),
);

export { name, schema };

export function MoveInsideSampleForm({
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
    resolver: zodResolver(schemaRefined),
    defaultValues: {
      x: x ?? 0,
      y: y ?? 0,
    },
  });

  function onSubmit(data: z.infer<typeof schemaRefined>) {
    toast.info("Submitting sample...");
    const kwargs = schemaRefined.parse(data);
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
                      Position X of the sample on the card slot. Must be within
                      a circle of radius {cardSlotRadius}mm.
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
                      Position Y of the sample on the card slot. Must be within
                      a circle of radius {cardSlotRadius}mm.
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
