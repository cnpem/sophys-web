import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useQueue } from "@sophys-web/api-client/hooks";
import { api } from "@sophys-web/api-client/react";
import { cn } from "@sophys-web/ui";
import { Button } from "@sophys-web/ui/button";
import { Field, FieldGroup, FieldLabel } from "@sophys-web/ui/field";
import { Input } from "@sophys-web/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@sophys-web/ui/input-group";
import {
  FieldLabelWithTooltip,
  InfoTooltip,
} from "@sophys-web/widgets/form-components/info-tooltip";
import type { Sample } from "./use-sample-store";
import {
  sampleTypeOptions,
  trayColumns,
  trayOptions,
  trayRows,
} from "../../store/setup1/constants";
import {
  proposalSchema,
  sampleTagSchema,
  tecanAspireVolumeSchema,
} from "./../../plans/schemas/common";
import { useSampleStore } from "./use-sample-store";

export const planName = "setup1_load_procedure";

export const planSchema = z.object({
  row: z.enum(trayRows),
  col: z.enum(trayColumns),
  tray: z.enum(trayOptions),
  volume: z.coerce
    .number()
    .positive()
    .max(100, "Volume must be between 0 and 100 µL"),
  proposal: proposalSchema,
  sampleTag: sampleTagSchema,
  sampleType: z.enum(sampleTypeOptions),
  expUvTime: z.coerce.number().nonnegative().optional(),
  measureUvNumber: z.coerce.number().int().nonnegative().optional(),
  tecanAspireVolume: tecanAspireVolumeSchema.optional(),
});

export function LoadSampleForm({
  sample,
  onSubmitCallback,
  className,
}: {
  sample: Sample;
  onSubmitCallback?: () => void;
  className?: string;
}) {
  const { data: userData } = api.auth.getUser.useQuery();
  const { add } = useQueue();
  const { storeData, setSample } = useSampleStore();
  const form = useForm({
    resolver: zodResolver(planSchema),
    defaultValues: {
      tray: sample.tray,
      row: sample.row,
      col: sample.col,
      volume: 60, // default load volume to 60 µL
      tecanAspireVolume: 75, // default to 75 µL
      measureUvNumber: 0, // default to 0 measurements
      expUvTime: 0, // default to 0 seconds
      sampleTag: sample.sampleTag,
      sampleType: sample.sampleType,
      proposal: userData?.proposal ?? "", // default proposal to user's current proposal
    },
  });

  async function onSubmit(data: z.infer<typeof planSchema>) {
    try {
      toast.info("Submitting sample...");

      const kwargs = planSchema.parse(data);

      await add.mutateAsync({
        item: {
          name: planName,
          itemType: "plan",
          args: [],
          kwargs,
        },
      });

      const currentSample = storeData?.[sample.id];
      if (!currentSample) {
        toast.error("Sample not found in store");
        return;
      }

      const volumeAfter = currentSample.volume - data.volume;
      if (volumeAfter < 0) {
        toast.error("Loaded volume exceeds available sample volume");
      }

      await setSample(sample.id, {
        ...currentSample,
        volume: volumeAfter > 0 ? volumeAfter : 0,
      });

      toast.success("Sample submitted!");
      onSubmitCallback?.();
    } catch (error) {
      toast.error("Failed to submit sample", {
        description: error instanceof Error ? error.message : String(error),
        closeButton: true,
      });
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className={cn("flex w-full flex-col gap-4", className)}
    >
      <FieldGroup className="grid grid-cols-3 gap-2">
        {/* uneditable fields for sample tag, position (combined) and type */}
        <Field>
          <FieldLabel>Sample Tag</FieldLabel>
          <Input value={sample.sampleTag} disabled className="h-8" />
        </Field>
        <Field>
          <FieldLabel>Position</FieldLabel>
          <Input
            value={`${sample.tray}-${sample.row}${sample.col}`}
            disabled
            className="h-8"
          />
        </Field>
        <Field>
          <FieldLabel>Sample Type</FieldLabel>
          <Input value={sample.sampleType} disabled className="h-8" />
        </Field>
      </FieldGroup>
      <FieldGroup className="grid w-full grid-cols-3 gap-4">
        <Controller
          name="volume"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabelWithTooltip
                labelName="Volume"
                labelDescription="The volume of the sample to acquire in microliters (µL)."
              />
              <InputGroup>
                <InputGroupInput
                  {...field}
                  id={field.name}
                  type={"number"}
                  step="any"
                  aria-invalid={fieldState.invalid}
                />
                <InputGroupAddon align={"inline-end"}>µL</InputGroupAddon>
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
          name="tecanAspireVolume"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabelWithTooltip
                labelName="Aspire Volume"
                labelDescription="The volume to be aspirated into the sample positioning stage (Tecan Pump)."
              />
              <InputGroup>
                <InputGroupInput
                  {...field}
                  id={field.name}
                  type={"number"}
                  step={0.001}
                  aria-invalid={fieldState.invalid}
                />
                <InputGroupAddon align={"inline-end"}>uL</InputGroupAddon>
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
          name="expUvTime"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabelWithTooltip
                labelName="UV Exposure"
                labelDescription="The duration of UV exposure for the cleaning step in seconds."
              />
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
          name="measureUvNumber"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabelWithTooltip
                labelName="UV Measurements"
                labelDescription="The number of measurements to take during the UV exposure cleaning step."
              />
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
          control={form.control}
          name="proposal"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabelWithTooltip
                labelName="Proposal"
                labelDescription="The proposal associated with this sample."
              />
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
      <Button type="submit" disabled={form.formState.isSubmitting}>
        Submit
      </Button>
    </form>
  );
}
