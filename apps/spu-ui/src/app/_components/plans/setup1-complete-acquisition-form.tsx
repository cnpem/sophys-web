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
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@sophys-web/ui/field";
import { Input } from "@sophys-web/ui/input";
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
import { Separator } from "@sophys-web/ui/separator";
import { Switch } from "@sophys-web/ui/switch";
import {
  FieldLabelWithTooltip,
  InfoTooltip,
} from "@sophys-web/widgets/form-components/info-tooltip";
import type { Sample } from "../store/setup1/use-sample-store";
import {
  cleaningOptions,
  sampleTypeOptions,
  trayColumns,
  trayOptions,
  trayRows,
} from "~/app/_components/store/setup1/constants";
import {
  motionSpeedSchema,
  tecanAspireVolumeSchema,
} from "../plans/schemas/common";
import { useSampleStore } from "../store/setup1/use-sample-store";
import {
  acquireTimeSchema,
  proposalSchema,
  sampleTagSchema,
} from "./schemas/common";

export const planName = "setup1_complete_standard_acquisition";

export const planSchema = z.object({
  acquireTime: acquireTimeSchema,
  numExposures: z.coerce.number().int().positive(),
  row: z
    .string()
    .transform((val) => val.trimStart().trimEnd())
    .pipe(
      z.enum(trayRows, {
        message: `Row must be one of the following options ${trayRows.join(", ")}`,
      }),
    ),
  col: z.coerce
    .string()
    .transform((val) => val.trimStart().trimEnd())
    .pipe(
      z.enum(trayColumns, {
        message: `Column must be one of the following options ${trayColumns.join(", ")}`,
      }),
    ),
  tray: z
    .string()
    .transform((val) => val.trimStart().trimEnd())
    .pipe(
      z.enum(trayOptions, {
        message: `Tray must be one of the following options ${trayOptions.join(", ")}`,
      }),
    ),
  volume: z.coerce.number().positive(),
  proposal: proposalSchema,
  sampleTag: sampleTagSchema,
  sampleType: z
    .string()
    .transform((val) => val.trimStart().trimEnd())
    .pipe(
      z.enum(sampleTypeOptions, {
        message: "Sample type must be either 'buffer' or 'sample'",
      }),
    ),
  expUvTime: z.coerce.number().min(0).optional(),
  measureUvNumber: z.coerce.number().int().min(0).optional(),
  temperature: z.coerce.number().positive().optional(),
  setTemperature: z.boolean().optional(),
  standardOption: z.enum(cleaningOptions).optional(),
  agentsList: z.array(z.string()).optional(),
  agentsDuration: z.array(z.coerce.number().positive()).optional(),
  motionSpeed: motionSpeedSchema.optional(),
  tecanAspireVolume: tecanAspireVolumeSchema.optional(),
});

export function CompleteAcquisitionForm({
  sampleParams,
  className,
  onSubmitSuccess,
}: {
  sampleParams: Sample | undefined;
  className?: string;
  onSubmitSuccess: () => void;
}) {
  const { add } = useQueue();
  const { data: userData } = api.auth.getUser.useQuery();
  const { storeData, setSample } = useSampleStore();

  const form = useForm({
    resolver: zodResolver(planSchema),
    defaultValues: {
      proposal: userData?.proposal ?? "",
      sampleType: "sample",
      volume: 60,
      acquireTime: 0.1,
      numExposures: 1,
      expUvTime: 0,
      measureUvNumber: 0,
      temperature: 25,
      setTemperature: false,
      standardOption: "normal",
      motionSpeed: 0,
      tecanAspireVolume: 75,
      ...(sampleParams && {
        tray: sampleParams.tray,
        row: sampleParams.row,
        col: sampleParams.col,
        sampleType: sampleParams.sampleType,
        sampleTag: sampleParams.sampleTag,
      }),
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
      const currentSample = storeData?.[sampleParams?.id ?? ""];
      if (!currentSample) {
        toast.error("Sample not found in store to update volume data");
        return;
      }
      const volumeAfter = currentSample.volume - data.volume;
      if (volumeAfter < 0) {
        toast.error("Loaded volume exceeds available sample volume");
      }
      toast.info("Updating sample volume in store...");
      await setSample(sampleParams?.id ?? "", {
        ...currentSample,
        volume: volumeAfter > 0 ? volumeAfter : 0,
      });
      toast.success("Sample submitted!");
      onSubmitSuccess();
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
      className={cn("flex w-full flex-col gap-2", className)}
    >
      <FieldGroup className="grid grid-cols-3 gap-2">
        {/* uneditable fields for sample tag, position (combined) and type */}
        <Field>
          <FieldLabel>Sample Tag</FieldLabel>
          <Input value={sampleParams?.sampleTag} disabled className="h-8" />
        </Field>
        <Field>
          <FieldLabel>Position</FieldLabel>
          <Input
            value={`${sampleParams?.tray}-${sampleParams?.row}${sampleParams?.col}`}
            disabled
            className="h-8"
          />
        </Field>
        <Field>
          <FieldLabel>Sample Type</FieldLabel>
          <Input value={sampleParams?.sampleType} disabled className="h-8" />
        </Field>
      </FieldGroup>
      <Separator />
      <FieldGroup className={cn("grid grid-cols-3 gap-2", className)}>
        <Controller
          name="acquireTime"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabelWithTooltip
                labelName="Acquire Time"
                labelDescription="The time for the acquisition of one sample in seconds in both pimega with the detector readout."
              />
              <InputGroup>
                <InputGroupInput
                  {...field}
                  id={field.name}
                  type={"number"}
                  step="any"
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
              <FieldLabelWithTooltip
                labelName="Exposures"
                labelDescription="The number of acquisitions to be made."
              />

              <InputGroup>
                <InputGroupInput
                  {...field}
                  id={field.name}
                  type={"number"}
                  step={1}
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
        <FieldSet className="w-full min-w-0">
          <FieldLegend>
            <FieldLabelWithTooltip
              labelName="Set Temperature"
              labelDescription="Whether to set the temperature during acquisition."
            />
          </FieldLegend>
          <FieldGroup className="flex w-full flex-row items-center gap-1">
            <Controller
              name="setTemperature"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  className="w-auto shrink-0"
                >
                  <FieldLabel className="sr-only">Set Temperature</FieldLabel>
                  <Switch
                    id={field.name}
                    className="mr-1 w-8"
                    checked={field.value ?? false}
                    onCheckedChange={field.onChange}
                  />
                </Field>
              )}
            />
            <Controller
              name="temperature"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  className="min-w-0 flex-1 gap-0"
                >
                  <FieldLabel className="sr-only">Temperature</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      disabled={!form.watch("setTemperature")}
                      {...field}
                      id={field.name}
                      type={"number"}
                      step="any"
                      value={!form.watch("setTemperature") ? "" : field.value}
                      aria-invalid={fieldState.invalid}
                    />
                    <InputGroupAddon align={"inline-end"}>°C</InputGroupAddon>
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
          name="motionSpeed"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabelWithTooltip
                labelName="Motion Speed"
                labelDescription="The speed of the acquisition motion in uL/s. If 0, the sample doesn't move."
              />
              <InputGroup>
                <InputGroupInput
                  {...field}
                  id={field.name}
                  type={"number"}
                  step={0.001}
                  aria-invalid={fieldState.invalid}
                />
                <InputGroupAddon align={"inline-end"}>uL/s</InputGroupAddon>
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
          name="standardOption"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabelWithTooltip
                labelName="Cleaning"
                labelDescription="The cleaning preset after acquisition."
              />
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className="w-full" size="sm">
                  <SelectValue placeholder="Select cleaning option" />
                  {fieldState.invalid && (
                    <InfoTooltip variant={"destructive"}>
                      {fieldState.error?.message}
                    </InfoTooltip>
                  )}
                </SelectTrigger>
                <SelectContent>
                  {cleaningOptions
                    .filter((option) => option !== "custom")
                    .map((option) => {
                      return (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      );
                    })}
                </SelectContent>
              </Select>
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
                labelDescription="The proposal associated with the sample acquisition."
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
