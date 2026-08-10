import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2Icon } from "lucide-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useQueue } from "@sophys-web/api-client/hooks";
import { api } from "@sophys-web/api-client/react";
import { cn } from "@sophys-web/ui";
import { Button } from "@sophys-web/ui/button";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from "@sophys-web/ui/combobox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@sophys-web/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@sophys-web/ui/input-group";
import { Skeleton } from "@sophys-web/ui/skeleton";
import { InfoTooltip } from "@sophys-web/widgets/form-components/info-tooltip";

export const name = "_scan_with_delay";

export const schemaStatic = z.object({
  detectors: z.array(z.string()),
  num: z.coerce.number().int().nullable(),
  delay: z.coerce.number().default(0),
  axes: z.array(z.tuple([z.string(), z.coerce.number(), z.coerce.number()])),
});

export function ScanWithDelayForm({
  className,
  onSubmitSuccess,
  params,
}: {
  className?: string;
  onSubmitSuccess?: () => void;
  params?: Partial<z.infer<typeof schemaStatic>>;
}) {
  const { add } = useQueue();

  const { data: devices } = api.httpserver.devices.allowedNames.useQuery();

  const detectorNames = devices?.readables ?? [];
  const movableNames = devices?.movables ?? [];

  const dynamicSchema = schemaStatic.extend({
    detectors: z
      .array(z.string())
      .min(1, { message: "At least one detector must be selected" })
      .refine(
        (detectors) =>
          detectors.every((detector) => detectorNames.includes(detector)),
        {
          message: "Invalid detector selected",
        },
      ),
    axes: z
      .array(
        z.tuple([
          z.string().refine((v) => movableNames.includes(v), {
            message: "Invalid axis specified",
          }),
          z.coerce.number(),
          z.coerce.number(),
        ]),
      )
      .min(1, { message: "At least one axis must be specified" }),
  });

  const form = useForm({
    resolver: zodResolver(dynamicSchema),
    defaultValues: {
      detectors: params?.detectors ?? [],
      num: params?.num ?? null,
      delay: params?.delay ?? 0,
      axes: params?.axes ?? [["", 0, 0]],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "axes",
  });

  function onSubmit(data: z.infer<typeof dynamicSchema>) {
    toast.info("Submitting sample...");
    // extend the schema with the validation for the detectors field based on the detectorNames
    // and the first item of the axes field based on the movableNames

    const kwargs = dynamicSchema.parse(data);
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
      <FieldGroup className={cn("flex w-full flex-col gap-2", className)}>
        <Controller
          name="detectors"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-rhf-combobox-language">
                Detectors
              </FieldLabel>
              <Combobox
                multiple
                items={detectorNames}
                value={field.value}
                onValueChange={field.onChange}
              >
                <ComboboxChips>
                  <ComboboxValue>
                    {(values: string[]) =>
                      values.map((item) => (
                        <ComboboxChip key={item}>{item}</ComboboxChip>
                      ))
                    }
                  </ComboboxValue>
                  <ComboboxChipsInput placeholder="Add detector" />
                </ComboboxChips>
                <ComboboxContent
                  // restoring pointer events and wheel propagation as a temporary fix for selecting items with the mouse
                  // see https://github.com/shadcn-ui/ui/issues/9770#issuecomment-4214505872
                  onWheel={(e) => e.stopPropagation()}
                  className="pointer-events-auto"
                >
                  <ComboboxEmpty />
                  <ComboboxList>
                    {(item: string) => (
                      <ComboboxItem key={item} value={item}>
                        {item}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="num"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Num
                <InfoTooltip>
                  <FieldDescription>
                    The number of samples to acquire??.
                  </FieldDescription>
                </InfoTooltip>
              </FieldLabel>
              <InputGroup>
                <InputGroupInput
                  {...field}
                  id={field.name}
                  value={field.value ?? ""}
                  type={"number"}
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
          name="delay"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Delay
                <InfoTooltip>
                  <FieldDescription>
                    The delay between samples??
                  </FieldDescription>
                </InfoTooltip>
              </FieldLabel>
              <InputGroup>
                <InputGroupInput
                  {...field}
                  id={field.name}
                  value={field.value ?? ""}
                  type={"number"}
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
        <FieldSet>
          <FieldLegend variant="label">Axes</FieldLegend>
          <FieldDescription>
            Add axes by specifying the device, start position, and end position
            for each axis.
          </FieldDescription>
          <FieldGroup className="gap-2">
            {/* column headers */}
            <div className="grid grid-cols-[4fr_4fr_4fr_1fr] items-center gap-2">
              <FieldLabel>Device</FieldLabel>
              <FieldLabel>Start</FieldLabel>
              <FieldLabel>End</FieldLabel>
              <div></div>
            </div>
            {!fields.length && (
              <div className="grid grid-cols-[4fr_4fr_4fr_1fr] items-center gap-2">
                <Skeleton className="h-10 w-full animate-pulse rounded" />
                <Skeleton className="h-10 w-full animate-pulse rounded" />
                <Skeleton className="h-10 w-full animate-pulse rounded" />
                <div></div>
              </div>
            )}
            {fields.map((arrayItemField, arrayIndex) => (
              <Field
                key={arrayItemField.id}
                className="grid grid-cols-[4fr_4fr_4fr_1fr] items-center gap-2"
              >
                <Controller
                  name={`axes.${arrayIndex}.0`}
                  control={form.control}
                  render={({ field: controlledField, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <Combobox
                        items={movableNames}
                        value={controlledField.value}
                        onValueChange={controlledField.onChange}
                      >
                        <ComboboxInput placeholder="Select axis" />
                        <ComboboxContent
                          // restoring pointer events and wheel propagation as a temporary fix for selecting items with the mouse
                          // see https://github.com/shadcn-ui/ui/issues/9770#issuecomment-4214505872
                          onWheel={(e) => e.stopPropagation()}
                          className="pointer-events-auto"
                        >
                          <ComboboxEmpty />
                          <ComboboxList>
                            {(item: string) => (
                              <ComboboxItem key={item} value={item}>
                                {item}
                              </ComboboxItem>
                            )}
                          </ComboboxList>
                        </ComboboxContent>
                      </Combobox>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name={`axes.${arrayIndex}.1`}
                  control={form.control}
                  render={({ field: controlledField, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <InputGroup>
                        <InputGroupInput
                          type="number"
                          {...controlledField}
                          onChange={(e) => {
                            controlledField.onChange(e.target.value);
                          }}
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
                  name={`axes.${arrayIndex}.2`}
                  control={form.control}
                  render={({ field: controlledField, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <InputGroup>
                        <InputGroupInput
                          type="number"
                          {...controlledField}
                          onChange={(e) => {
                            controlledField.onChange(e.target.value);
                          }}
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
                <Button
                  variant="ghost"
                  onClick={() => remove(arrayIndex)}
                  size={"icon"}
                  className="text-destructive align-middle"
                >
                  <Trash2Icon className="size-4" />
                </Button>
              </Field>
            ))}
          </FieldGroup>
        </FieldSet>
        <Button
          type="button"
          variant={"outline"}
          onClick={() => append([["", 0, 0]])}
          className="w-full"
        >
          Add Axis
        </Button>
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
