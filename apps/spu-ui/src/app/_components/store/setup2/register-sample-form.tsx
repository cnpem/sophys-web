import type { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
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
import type { Sample } from "./use-sample-store";
import { cardSlotRadius } from "./constants";
import { sampleSchema, useSampleStore } from "./use-sample-store";

export function EditSampleForm({
  sample,
  onSubmitCallback,
}: {
  sample: Sample;
  onSubmitCallback?: () => void;
}) {
  const { setSample } = useSampleStore();
  const form = useForm({
    resolver: zodResolver(sampleSchema),
    defaultValues: {
      ...sample,
    },
  });

  async function onSubmit(data: z.infer<typeof sampleSchema>) {
    toast.info("Registering sample...");
    await setSample(data.id, data).then(() => {
      toast.success("Sample registered!");
      form.reset();
      onSubmitCallback?.();
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup className="mb-4 w-96 space-y-2">
        <Controller
          name="sampleTag"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor="sampleTag">
                Sample Tag
                <InfoTooltip>
                  <FieldDescription>
                    Tag to identify the sample.
                  </FieldDescription>
                </InfoTooltip>
              </FieldLabel>
              <InputGroup>
                <InputGroupInput {...field} />
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
        {/* sample position div*/}
        <FieldSet>
          <FieldLabel>Sample Position in the Slot</FieldLabel>
          <FieldGroup className="grid grid-cols-2 gap-4">
            <Controller
              name="position.x"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Sample X
                    <InfoTooltip>
                      <FieldDescription>
                        Position X of the sample on the card slot. Must be
                        within a circle of radius {cardSlotRadius}mm.
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
              name="position.y"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Sample Y
                    <InfoTooltip>
                      <FieldDescription>
                        Position Y of the sample on the card slot. Must be
                        within a circle of radius {cardSlotRadius}mm.
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
        <Controller
          name="notes"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor="notes">
                Notes
                <InfoTooltip>
                  <FieldDescription>
                    Additional notes for this sample.
                  </FieldDescription>
                </InfoTooltip>
              </FieldLabel>
              <InputGroup>
                <InputGroupInput {...field} />
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
      <Button type="submit" className="w-full">
        Submit
      </Button>
    </form>
  );
}

export function RegisterNewSampleForm({
  sampleId,
  onSubmitCallback,
}: {
  sampleId: string;
  onSubmitCallback?: () => void;
}) {
  const { setSample } = useSampleStore();
  const form = useForm({
    resolver: zodResolver(sampleSchema),
    defaultValues: {
      id: sampleId,
      sampleTag: "",
      position: undefined,
      notes: "",
    },
  });

  async function onSubmit(data: z.infer<typeof sampleSchema>) {
    toast.info("Registering sample...");
    await setSample(sampleId, data).then(() => {
      toast.success("Sample registered!");
      form.reset();
      onSubmitCallback?.();
    });
  }

  const errors = form.formState.errors;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup className="mb-4 w-96 space-y-2">
        <Controller
          name="sampleTag"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor="sampleTag">
                Sample Tag
                <InfoTooltip>
                  <FieldDescription>
                    Tag to identify the sample.
                  </FieldDescription>
                </InfoTooltip>
              </FieldLabel>
              <InputGroup>
                <InputGroupInput {...field} />
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
          name="notes"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor="notes">
                Notes
                <InfoTooltip>
                  <FieldDescription>
                    Additional notes for this sample.
                  </FieldDescription>
                </InfoTooltip>
              </FieldLabel>
              <InputGroup>
                <InputGroupInput {...field} />
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
      {/* render other form validation errors */}
      {Object.keys(errors).length > 0 && (
        <div className="error-banner">
          <h4>Please fix the following errors:</h4>
          <ul>
            {Object.values(errors).map((error, index) => (
              <li key={index}>{error.message}</li>
            ))}
          </ul>
        </div>
      )}
      <Button type="submit" className="w-full">
        Submit
      </Button>
    </form>
  );
}
