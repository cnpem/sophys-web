import type { UseFormReturn } from "react-hook-form";
import type { z } from "zod";
import camelCase from "camelcase";
import { JsonEditor, monoLightTheme } from "json-edit-react";
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
  useComboboxAnchor,
} from "@sophys-web/ui/combobox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@sophys-web/ui/form";
import { Input } from "@sophys-web/ui/input";
import { Label } from "@sophys-web/ui/label";
import { Switch } from "@sophys-web/ui/switch";
import type { AnySchema, Parameter } from "../lib/create-schema";
import { parseLiteralList } from "../lib/create-schema";
import { InfoTooltip } from "./info-tooltip";

const deviceOptionsNames = ["__READABLE__", "__MOVABLE__", "__FLYABLE__"];

function definePlaceholder(type: string) {
  if (type === "typing.Sequence[float]") {
    return "1.0, 2.0, 3.0";
  }
  if (type === "typing.Sequence[int]") {
    return "1, 2, 3";
  }
  if (type.includes("int")) {
    return "1";
  }
  if (type.includes("float")) {
    return "1.0";
  }
  return "No information on input type";
}

function snakeToTitleCase(str: string) {
  return str
    .split("_")
    .map(
      ([first, ...rest]) =>
        first !== undefined && first.toUpperCase() + rest.join(""),
    )
    .join(" ");
}

interface Devices {
  readables: string[];
  movables: string[];
  flyables: string[];
}

interface AnyFieldProps {
  devices: Devices;
  param: Parameter;
  form: UseFormReturn<z.infer<AnySchema>>;
}

interface TypedFieldProps extends Omit<AnyFieldProps, "devices"> {
  type: string;
}

function AnyField({ devices, param, form }: AnyFieldProps) {
  const type = param.annotation?.type;
  if (!type) {
    return (
      <div className="flex flex-col text-red-500" key={camelCase(param.name)}>
        <p>Unsupported parameter with no type annotations:</p>
        <p>{camelCase(param.name)}</p>
      </div>
    );
  }
  if (type.includes("__CALLABLE__")) {
    return <CallableField type={type} param={param} form={form} />;
  }
  if (type.includes("dict")) {
    return <RecordField type={type} param={param} form={form} />;
  }
  if (type.includes("bool")) {
    return <BoolField param={param} form={form} type={type} />;
  }
  if (
    type.includes("Literal") &&
    !(type.includes("list") || type.includes("Sequence"))
  ) {
    const options = parseLiteralList(type);
    if (options.length === 0) {
      console.warn(`LiteralField: There is no options for type "${type}"`);
    }
    return (
      <ComboboxField
        multiple={false}
        options={options}
        param={param}
        form={form}
      />
    );
  }
  if (
    (type.includes("list") || type.includes("Sequence")) &&
    type.includes("Literal")
  ) {
    const options = parseLiteralList(type);
    if (options.length === 0) {
      console.warn(`MultiLiteralField: There is no options for type "${type}"`);
    }
    return <ComboboxField options={options} param={param} form={form} />;
  }
  if (
    !type.includes("list") &&
    (type.includes("int") || type.includes("float") || type.includes("str"))
  ) {
    return <BaseTypeField param={param} form={form} type={type} />;
  }
  if (
    type === "typing.List[int]" ||
    type === "list[int]" ||
    type === "typing.List[float]" ||
    type === "list[float]" ||
    type === "typing.List[str]" ||
    type === "list[str]"
  ) {
    return <ListField param={param} form={form} type={type} />;
  }
  if (
    deviceOptionsNames.some((name) => param.annotation?.type.includes(name))
  ) {
    const type = param.annotation?.type ?? "";
    if (!type) {
      return null;
    }
    const options: string[] = (() => {
      if (type.includes("__READABLE__")) {
        return devices.readables;
      }
      if (type.includes("__MOVABLE__")) {
        return devices.movables;
      }
      if (type.includes("__FLYABLE__")) {
        return devices.flyables;
      }
      return [];
    })();
    if (type.includes("typing.Sequence") || type.includes("list")) {
      return <ComboboxField options={options} param={param} form={form} />;
    }
    return (
      <ComboboxField
        multiple={false}
        options={options}
        param={param}
        form={form}
      />
    );
  }

  return (
    <div className="flex flex-col text-red-500" key={camelCase(param.name)}>
      <p>Unsupported parameter: {camelCase(param.name)}</p>
      <RecordField type={type} param={param} form={form} />
    </div>
  );
}

function RecordField(props: TypedFieldProps) {
  const { form, param } = props;
  return (
    <FormField
      control={form.control}
      name={camelCase(param.name)}
      render={({ field }) => (
        <FormItem className="col-span-full">
          <div className="inline-flex gap-1">
            <FormLabel>{snakeToTitleCase(param.name)}</FormLabel>
            <InfoTooltip>{param.description}</InfoTooltip>
          </div>
          <JsonEditor
            restrictTypeSelection={true}
            data={field.value as Record<string, unknown>}
            setData={field.onChange}
            rootName={camelCase(param.name)}
            theme={monoLightTheme}
            defaultValue="New Data!"
          />
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function CallableField({ param, form }: TypedFieldProps) {
  return (
    <FormField
      control={form.control}
      name={camelCase(param.name)}
      render={({ field }) => (
        <FormItem>
          <div className="inline-flex gap-1">
            <FormLabel>{snakeToTitleCase(param.name)}</FormLabel>
            <InfoTooltip>{param.description}</InfoTooltip>
          </div>
          <FormControl>
            <Input {...field} disabled placeholder="Callable" type="text" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function BoolField({ param, form }: TypedFieldProps) {
  return (
    <FormField
      control={form.control}
      name={camelCase(param.name)}
      render={({ field }) => (
        <FormItem>
          <div className="inline-flex gap-1">
            <FormLabel>{snakeToTitleCase(param.name)}</FormLabel>
            <InfoTooltip>{param.description}</InfoTooltip>
          </div>
          <FormControl>
            <div className="flex items-center space-y-0 rounded-lg border p-2 align-middle">
              <Label className="text-slate-500">
                {(field.value as boolean) ? "On" : "Off"}
              </Label>

              <Switch
                checked={field.value as boolean}
                className="ml-auto"
                onCheckedChange={field.onChange}
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function BaseTypeField({ param, type, form }: TypedFieldProps) {
  return (
    <FormField
      control={form.control}
      name={camelCase(param.name)}
      render={({ field }) => (
        <FormItem>
          <div className="inline-flex gap-1">
            <FormLabel>{snakeToTitleCase(param.name)}</FormLabel>
            <InfoTooltip>{param.description}</InfoTooltip>
          </div>
          <FormControl>
            <Input
              {...field}
              placeholder={definePlaceholder(type)}
              type={["int", "float"].includes(type) ? "number" : "text"}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function ListField({ param, type, form }: TypedFieldProps) {
  return (
    <FormField
      control={form.control}
      name={camelCase(param.name)}
      render={({ field }) => (
        <FormItem>
          <div className="inline-flex gap-1">
            <FormLabel>{snakeToTitleCase(param.name)}</FormLabel>
            <InfoTooltip>{param.description}</InfoTooltip>
          </div>
          <FormControl>
            <Input
              placeholder={definePlaceholder(type)}
              {...field}
              onBlur={(e) => {
                const value = e.target.value;
                field.onChange(
                  value
                    ? value
                        .split(",")
                        .map((item) => item.trim())
                        .filter((item) => item.length > 0)
                    : undefined,
                );
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

/**
 * Helper function for type narrowing to check if a value is an array of strings.
 */
function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every((item): item is string => typeof item === "string")
  );
}

/**
 * Helper function to define the value for the Combobox component based on whether it accepts multiple selections or not.
 */
function defineValue(value: unknown, multiple: boolean): string | string[] {
  if (multiple) {
    return isStringArray(value) ? value : [];
  }
  return typeof value === "string" ? value : "";
}

function ComboboxField({
  multiple = true,
  param,
  options,
  form,
}: {
  multiple?: boolean;
  param: Parameter;
  options: string[];
  form: UseFormReturn<z.infer<AnySchema>>;
}) {
  const anchor = useComboboxAnchor();

  return (
    <FormField
      control={form.control}
      name={camelCase(param.name)}
      render={({ field }) => (
        <FormItem className="mt-2 flex flex-col">
          <div className="inline-flex gap-1">
            <FormLabel>{snakeToTitleCase(param.name)}</FormLabel>
            <InfoTooltip>{param.description}</InfoTooltip>
          </div>
          <Combobox
            multiple={multiple}
            items={options}
            value={defineValue(field.value, multiple)}
            onValueChange={field.onChange}
          >
            {multiple && (
              <ComboboxChips ref={anchor}>
                <ComboboxValue>
                  {(values: string[]) =>
                    values.map((item) => (
                      <ComboboxChip key={item}>{item}</ComboboxChip>
                    ))
                  }
                </ComboboxValue>
                <ComboboxChipsInput placeholder="Add item" />
              </ComboboxChips>
            )}
            {!multiple && <ComboboxInput placeholder="Select an option" />}
            <ComboboxContent
              // restoring pointer events and wheel propagation as a temporary fix for selecting items with the mouse
              // see https://github.com/shadcn-ui/ui/issues/9770#issuecomment-4214505872
              onWheel={(e) => e.stopPropagation()}
              className="pointer-events-auto"
              align="end"
              anchor={anchor}
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
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export { AnyField };
