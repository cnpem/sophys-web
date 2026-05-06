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
import { Label } from "@sophys-web/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@sophys-web/ui/select";
import { Separator } from "@sophys-web/ui/separator";
import { Switch } from "@sophys-web/ui/switch";
import { InfoTooltip } from "@sophys-web/widgets/form-components/info-tooltip";
import type { Sample } from "../store/setup1/use-sample-store";
import {
  cleaningOptions,
  picoloChannels,
  sampleTypeOptions,
  trayColumns,
  trayOptions,
  trayRows,
} from "~/app/_components/store/setup1/constants";
import { useSampleStore } from "../store/setup1/use-sample-store";
import { proposalSchema } from "./schemas/common";

export const planName = "setup1_complete_standard_acquisition";

export const planSchema = z.object({
  acquireTime: z.coerce.number().positive(),
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
  sampleTag: z
    .string()
    .min(1, "Sample name or other form of identification is required"),
  sampleType: z
    .string()
    .transform((val) => val.trimStart().trimEnd())
    .pipe(
      z.enum(sampleTypeOptions, {
        message: "Sample type must be either 'buffer' or 'sample'",
      }),
    ),
  expUvTime: z.coerce.number().positive().optional(),
  measureUvNumber: z.coerce.number().int().positive().optional(),
  temperature: z.coerce.number().positive().optional(),
  setTemperature: z.boolean().optional(),
  bufferTag: z.string().optional(),
  standardOption: z.enum(cleaningOptions).optional(),
  agentsList: z.array(z.string()).optional(),
  agentsDuration: z.array(z.coerce.number().positive()).optional(),
  picoloChannel: z
    .string()
    .transform((val) => val.trimStart().trimEnd())
    .pipe(
      z.enum(picoloChannels, {
        message: `Picolo channel must be one of the following options ${picoloChannels.join(", ")}`,
      }),
    ),
  motionSpeed: z.coerce.number().nonnegative().optional(),
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
      picoloChannel: "channel2",
      standardOption: "normal",
      motionSpeed: 0,
      ...(sampleParams && {
        tray: sampleParams.tray,
        row: sampleParams.row,
        col: sampleParams.col,
        sampleType: sampleParams.sampleType,
        sampleTag: sampleParams.sampleTag,
        bufferTag: sampleParams.bufferTag,
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
      className={cn("flex flex-col gap-2", className)}
    >
      <FieldGroup
        className={cn("grid w-full grid-flow-row grid-cols-3 gap-2", className)}
      >
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
                    both pimega with the detector readout.
                  </FieldDescription>
                </InfoTooltip>
              </FieldLabel>
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
              <FieldLabel htmlFor={field.name}>
                Exposures
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
          name="motionSpeed"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Motion Speed
                <InfoTooltip>
                  <FieldDescription>
                    The speed of the acquisition motion in uL/s
                  </FieldDescription>
                </InfoTooltip>
              </FieldLabel>
              <InputGroup>
                <InputGroupInput
                  {...field}
                  id={field.name}
                  type={"number"}
                  step="any"
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
          name="picoloChannel"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Picolo Channel
                <InfoTooltip>
                  <FieldDescription>
                    The picolo channel to use for the acquisition.
                  </FieldDescription>
                </InfoTooltip>
              </FieldLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className="w-full" size="sm">
                  <SelectValue placeholder="Select picolo channel" />
                  {fieldState.invalid && (
                    <InfoTooltip variant={"destructive"}>
                      {fieldState.error?.message}
                    </InfoTooltip>
                  )}
                </SelectTrigger>
                <SelectContent>
                  {picoloChannels.map((option) => {
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
          name="setTemperature"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name} className="whitespace-nowrap">
                Set Temperature
                <InfoTooltip>
                  <FieldDescription>
                    Whether to set the temperature during acquisition.
                  </FieldDescription>
                </InfoTooltip>
              </FieldLabel>
              <div className="flex h-8 items-center space-y-0 rounded-md border px-2 align-middle">
                <Switch
                  id={field.name}
                  className="mr-auto"
                  checked={field.value ?? false}
                  onCheckedChange={field.onChange}
                />
                <Label className="text-slate-500">
                  {field.value ? "Yes" : "No"}
                </Label>
                {fieldState.invalid && (
                  <InfoTooltip variant={"destructive"}>
                    {fieldState.error?.message}
                  </InfoTooltip>
                )}
              </div>
            </Field>
          )}
        />
        <Controller
          name="temperature"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Temperature
                <InfoTooltip>
                  <FieldDescription>
                    The temperature to set during acquisition in degrees
                    Celsius.
                  </FieldDescription>
                </InfoTooltip>
              </FieldLabel>
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
      <Separator />
      <FieldGroup
        id="load-parameters"
        className={cn("grid w-full grid-flow-row grid-cols-3 gap-2", className)}
      >
        <Label htmlFor="load-parameters" className="col-span-full mb-2">
          Load Parameters
        </Label>
        <Controller
          control={form.control}
          name="sampleTag"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>
                Sample Tag
                <InfoTooltip>
                  <FieldDescription>
                    The name or other form of identification for the sample.
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
          control={form.control}
          name="bufferTag"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>
                Buffer Tag
                <InfoTooltip>
                  <FieldDescription>
                    The name or other form of identification for the buffer.
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
          control={form.control}
          name="sampleType"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>
                Sample Type
                <InfoTooltip>
                  <FieldDescription>
                    The type of the sample, either "sample" or "buffer".
                  </FieldDescription>
                </InfoTooltip>
              </FieldLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className="w-full" size="sm">
                  <SelectValue placeholder="Select sample type" />
                  {fieldState.invalid && (
                    <InfoTooltip variant={"destructive"}>
                      {fieldState.error?.message}
                    </InfoTooltip>
                  )}
                </SelectTrigger>
                <SelectContent>
                  {sampleTypeOptions.map((option) => {
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
          name="tray"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Tray
                <InfoTooltip>
                  <FieldDescription>
                    The tray where the sample is located.
                  </FieldDescription>
                </InfoTooltip>
              </FieldLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className="w-full" size="sm">
                  <SelectValue placeholder="Select tray" />
                  {fieldState.invalid && (
                    <InfoTooltip variant={"destructive"}>
                      {fieldState.error?.message}
                    </InfoTooltip>
                  )}
                </SelectTrigger>
                <SelectContent>
                  {trayOptions.map((option) => {
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
          name="row"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Row
                <InfoTooltip>
                  <FieldDescription>
                    The row of the tray where the sample is located.
                  </FieldDescription>
                </InfoTooltip>
              </FieldLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className="w-full" size="sm">
                  <SelectValue placeholder="Select row" />
                  {fieldState.invalid && (
                    <InfoTooltip variant={"destructive"}>
                      {fieldState.error?.message}
                    </InfoTooltip>
                  )}
                </SelectTrigger>
                <SelectContent>
                  {trayRows.map((option) => {
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
          name="col"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Column
                <InfoTooltip>
                  <FieldDescription>
                    The column of the tray where the sample is located.
                  </FieldDescription>
                </InfoTooltip>
              </FieldLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className="w-full" size="sm">
                  <SelectValue placeholder="Select column" />
                  {fieldState.invalid && (
                    <InfoTooltip variant={"destructive"}>
                      {fieldState.error?.message}
                    </InfoTooltip>
                  )}
                </SelectTrigger>
                <SelectContent>
                  {trayColumns.map((option) => {
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
          name="volume"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Volume
                <InfoTooltip>
                  <FieldDescription>
                    The volume of the sample to acquire in microliters (µL).
                  </FieldDescription>
                </InfoTooltip>
              </FieldLabel>
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
          name="expUvTime"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                UV Exposure
                <InfoTooltip>
                  <FieldDescription>
                    The duration of UV exposure for the cleaning step in
                    seconds.
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
          name="measureUvNumber"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name} className="whitespace-nowrap">
                UV Measurements
                <InfoTooltip>
                  <FieldDescription>
                    The number of measurements to take during the UV exposure
                    cleaning step.
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
      </FieldGroup>
      <Separator />
      <FieldGroup
        id="cleaning-parameters"
        className={cn("grid w-full grid-flow-row grid-cols-3 gap-2", className)}
      >
        <Label htmlFor="cleaning-parameters" className="col-span-full mb-2">
          Cleaning Parameters
        </Label>
        <Controller
          name="standardOption"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Cleaning Option
                <InfoTooltip>
                  <FieldDescription>
                    The cleaning preset after acquisition.
                  </FieldDescription>
                </InfoTooltip>
              </FieldLabel>
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
