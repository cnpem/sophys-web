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
import type { cardColumns, cardIndexOptions, cardRows } from "./constants";
import type { Sample } from "./use-sample-store";
import { cardSlotRadius, isValidCardPosition } from "./constants";
import {
  sampleIdFromPosition,
  sampleSchema,
  useSampleStore,
} from "./use-sample-store";

const registerSchema = sampleSchema
  .omit({
    id: true,
  })
  .refine(
    (data) =>
      isValidCardPosition({ x: data.samplePositionX, y: data.samplePositionY }),
    (data) => ({
      message: `Sample position must be within a circle of radius ${cardSlotRadius}. 
      Position for (${data.samplePositionX},${data.samplePositionY}): ${Math.sqrt(data.samplePositionX ** 2 + data.samplePositionY ** 2).toFixed(2)}`,
      path: ["samplePositionX"],
    }),
  );

export function RegisterSampleForm({
  cardIndex,
  row,
  column,
  sampleTag,
  samplePositionX = 0,
  samplePositionY = 0,
  meta = "",
  onSubmitCallback,
}: {
  cardIndex: (typeof cardIndexOptions)[number];
  row: (typeof cardRows)[number];
  column: (typeof cardColumns)[number];
  sampleTag?: string;
  samplePositionX?: number;
  samplePositionY?: number;
  meta?: string;
  onSubmitCallback?: () => void;
}) {
  const { setSample } = useSampleStore();
  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      sampleTag: sampleTag ?? "",
      row,
      column,
      cardIndex,
      samplePositionX,
      samplePositionY,
      meta,
    },
  });

  async function onSubmit(data: z.infer<typeof registerSchema>) {
    toast.info("Registering sample...");
    const sampleId = sampleIdFromPosition({ cardIndex, row, column });
    const sample = {
      id: sampleId,
      ...data,
    } satisfies Sample;
    await setSample(sampleId, sample).then(() => {
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
              name="samplePositionX"
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
              name="samplePositionY"
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
          name="meta"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor="meta">
                Metadata
                <InfoTooltip>
                  <FieldDescription>
                    Additional metadata for this sample.
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
  cardIndex,
  row,
  column,
  sampleTag,
  meta = "",
  onSubmitCallback,
}: {
  cardIndex: (typeof cardIndexOptions)[number];
  row: (typeof cardRows)[number];
  column: (typeof cardColumns)[number];
  sampleTag?: string;
  samplePositionX?: number;
  samplePositionY?: number;
  meta?: string;
  onSubmitCallback?: () => void;
}) {
  const { setSample } = useSampleStore();
  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      sampleTag: sampleTag ?? "",
      row,
      column,
      cardIndex,
      samplePositionX: 0,
      samplePositionY: 0,
      meta,
    },
  });

  async function onSubmit(data: z.infer<typeof registerSchema>) {
    toast.info("Registering sample...");
    const sampleId = sampleIdFromPosition({ cardIndex, row, column });
    const sample = {
      id: sampleId,
      ...data,
    } satisfies Sample;
    await setSample(sampleId, sample).then(() => {
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
        <Controller
          name="meta"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor="meta">
                Metadata
                <InfoTooltip>
                  <FieldDescription>
                    Additional metadata for this sample.
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
