import type { UseFormReturn } from "react-hook-form";
import type { z } from "zod";
import camelCase from "camelcase";
import { JsonEditor, monoLightTheme } from "json-edit-react";
import { InfoIcon } from "lucide-react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@sophys-web/ui/form";
import { Input } from "@sophys-web/ui/input";
import { Label } from "@sophys-web/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@sophys-web/ui/select";
import { Switch } from "@sophys-web/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@sophys-web/ui/tooltip";
import type { AnySchema, Parameter } from "../lib/create-schema";
import { MultiSelectDialog } from "./multi-select";

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

function InfoTooltip({ children }: { children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger>
        <InfoIcon className="size-4" />
      </TooltipTrigger>
      <TooltipContent>{children}</TooltipContent>
    </Tooltip>
  );
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
  if (type.includes("typing.Literal")) {
    return <LiteralField param={param} form={form} type={type} />;
  }
  if (type.includes("int") || type.includes("float") || type.includes("str")) {
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
    if (type.includes("typing.Sequence")) {
      return (
        <MultiSelectField listOptions={devices} param={param} form={form} />
      );
    }
    return <SelectListField listOptions={devices} param={param} form={form} />;
  }

  return (
    <div className="flex flex-col text-red-500" key={camelCase(param.name)}>
      <p>Unsupported parameter with no type annotations:</p>
      <p>{camelCase(param.name)}</p>
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

function LiteralField({ param, type, form }: TypedFieldProps) {
  const optionsStr = type.replace("typing.Literal[", "").replace("]", "");
  const options = optionsStr.split(", ").map((option) => {
    return option.replace(/'/g, "");
  });
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
            <Select
              defaultValue={field.value as string}
              onValueChange={field.onChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

function SelectListField({
  param,
  listOptions,
  form,
}: {
  param: Parameter;
  listOptions: Devices;
  form: UseFormReturn<z.infer<AnySchema>>;
}) {
  const type = param.annotation?.type ?? "";
  if (!type) {
    return null;
  }
  const typeOptions: string[] = (() => {
    if (type.includes("__READABLE__")) {
      return listOptions.readables;
    }
    if (type.includes("__MOVABLE__")) {
      return listOptions.movables;
    }
    if (type.includes("__FLYABLE__")) {
      return listOptions.flyables;
    }
    return [];
  })();

  if (typeOptions.length === 0) {
    return null;
  }

  return (
    <FormField
      control={form.control}
      name={camelCase(param.name)}
      render={({ field }) => (
        <FormItem>
          <Tooltip>
            <TooltipTrigger>
              <FormLabel>{snakeToTitleCase(param.name)}</FormLabel>
            </TooltipTrigger>
            <TooltipContent>
              <FormDescription>{param.description}</FormDescription>
            </TooltipContent>
          </Tooltip>
          <Select
            defaultValue={field.value as string}
            onValueChange={field.onChange}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {typeOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function MultiSelectField({
  param,
  listOptions,
  form,
}: {
  param: Parameter;
  listOptions: Devices;
  form: UseFormReturn<z.infer<AnySchema>>;
}) {
  const type = param.annotation?.type ?? "";
  if (!type) {
    return null;
  }
  const typeOptions: string[] = (() => {
    if (type.includes("__READABLE__")) {
      return listOptions.readables;
    }
    if (type.includes("__MOVABLE__")) {
      return listOptions.movables;
    }
    if (type.includes("__FLYABLE__")) {
      return listOptions.flyables;
    }
    return [];
  })();

  if (typeOptions.length === 0) {
    return null;
  }

  return (
    <FormField
      control={form.control}
      name={camelCase(param.name)}
      render={({ field }) => (
        <FormItem className="mt-2 flex flex-col">
          <Tooltip>
            <TooltipTrigger>
              <FormLabel>{snakeToTitleCase(param.name)}</FormLabel>
            </TooltipTrigger>
            <TooltipContent>
              <FormDescription>{param.description}</FormDescription>
            </TooltipContent>
          </Tooltip>
          <MultiSelectDialog
            defaultOptions={field.value as string[]}
            onChange={field.onChange}
            options={typeOptions}
            placeholder="Select options"
          />
          <FormDescription>{param.description}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export { AnyField };
