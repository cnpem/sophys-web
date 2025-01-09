"use client";

import type { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import camelCase from "camelcase";
import { useForm } from "react-hook-form";
import { Button } from "@sophys-web/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@sophys-web/ui/form";
import { Input } from "@sophys-web/ui/input";
import { Label } from "@sophys-web/ui/label";
import { ScrollArea } from "@sophys-web/ui/scroll-area";
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
  TooltipProvider,
  TooltipTrigger,
} from "@sophys-web/ui/tooltip";
import type { AnySchema, Parameter } from "./lib/create-schema";
import { MultiSelectDialog } from "./form-components/multi-select";
import { RecordInput } from "./form-components/record-input";

function snakeToTitleCase(str: string) {
  return str
    .split("_")
    .map(
      ([first, ...rest]) =>
        first !== undefined && first.toUpperCase() + rest.join(""),
    )
    .join(" ");
}

interface DynamicFormProps {
  planData: {
    name: string;
    description: string;
    parameters: Parameter[];
  };
  devices: {
    readables: string[];
    movables: string[];
    flyables: string[];
  };
  schema: AnySchema;
  initialValues?: z.infer<AnySchema>;
  onSubmit: (data: z.infer<AnySchema>) => void;
}

export function AnyForm({
  planData,
  devices,
  schema,
  onSubmit,
  initialValues,
}: DynamicFormProps) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues:
      initialValues ??
      Object.fromEntries(
        planData.parameters
          .filter((param) => Boolean(param.default) && param.default !== "None")
          .map((param) => [camelCase(param.name), param.default]),
      ),
  });

  return (
    <Form {...form}>
      <ScrollArea className="max-w-screen h-[400px] p-2 font-mono text-sm">
        <TooltipProvider>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <h2 className="text-2xl font-bold">{planData.name}</h2>
            <p className="text-gray-600">{planData.description}</p>
            <div className="grid grid-cols-3 gap-2">
              {planData.parameters.map((param) => (
                <FormField
                  control={form.control}
                  key={camelCase(param.name)}
                  name={camelCase(param.name)}
                  render={({ field }) => {
                    if (!param.annotation?.type) {
                      return (
                        <div
                          className="flex flex-col text-red-500"
                          key={camelCase(param.name)}
                        >
                          <p>Unsupported parameter with no type annotations:</p>
                          <p>{camelCase(param.name)}</p>
                        </div>
                      );
                    }
                    if (param.annotation.type.includes("__CALLABLE__")) {
                      return (
                        <FormItem>
                          <Tooltip>
                            <TooltipTrigger>
                              <FormLabel>
                                {snakeToTitleCase(param.name)}
                              </FormLabel>
                            </TooltipTrigger>
                            <TooltipContent>
                              <FormDescription>
                                This is a special python object that is not
                                supported in this form
                                {param.description}
                              </FormDescription>
                            </TooltipContent>
                          </Tooltip>
                          <FormControl>
                            <Input
                              {...field}
                              disabled
                              placeholder="Callable"
                              type="text"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }
                    if (
                      deviceOptionsNames.some((name) =>
                        param.annotation?.type.includes(name),
                      )
                    ) {
                      if (param.annotation.type.includes("typing.Sequence")) {
                        return (
                          <MultiSelectListOptions
                            defaultValue={field.value as string[]}
                            listOptions={devices}
                            onValueChange={field.onChange}
                            param={param}
                          />
                        );
                      }
                      return (
                        <SelectListOptions
                          defaultValue={field.value as string}
                          listOptions={devices}
                          onValueChange={field.onChange}
                          param={param}
                        />
                      );
                    }
                    if (param.annotation.type === "bool") {
                      return (
                        <FormItem>
                          <Tooltip>
                            <TooltipTrigger>
                              <FormLabel>
                                {snakeToTitleCase(param.name)}
                              </FormLabel>
                            </TooltipTrigger>
                            <TooltipContent>
                              <FormDescription>
                                {param.description}
                              </FormDescription>
                            </TooltipContent>
                          </Tooltip>
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
                      );
                    }
                    if (
                      param.annotation.type === "typing.List[int]" ||
                      param.annotation.type === "list[int]" ||
                      param.annotation.type === "typing.List[float]" ||
                      param.annotation.type === "list[float]" ||
                      param.annotation.type === "typing.List[str]" ||
                      param.annotation.type === "list[str]"
                    ) {
                      return (
                        <FormItem>
                          <Tooltip>
                            <TooltipTrigger>
                              <FormLabel>
                                {snakeToTitleCase(param.name)}
                              </FormLabel>
                            </TooltipTrigger>
                            <TooltipContent>
                              <FormDescription>
                                {param.description}
                              </FormDescription>
                            </TooltipContent>
                          </Tooltip>
                          <FormControl>
                            <Input
                              placeholder={definePlaceholder(
                                param.annotation.type,
                              )}
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
                      );
                    }
                    if (
                      param.annotation.type.includes("int") ||
                      param.annotation.type.includes("float") ||
                      param.annotation.type.includes("str")
                    ) {
                      return (
                        <FormItem>
                          <Tooltip>
                            <TooltipTrigger>
                              <FormLabel>
                                {snakeToTitleCase(param.name)}
                              </FormLabel>
                            </TooltipTrigger>
                            <TooltipContent>
                              <FormDescription>
                                {param.description}
                              </FormDescription>
                            </TooltipContent>
                          </Tooltip>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={definePlaceholder(
                                param.annotation.type,
                              )}
                              type={
                                ["int", "float"].includes(param.annotation.type)
                                  ? "number"
                                  : "text"
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }
                    if (param.annotation.type.includes("typing.Literal")) {
                      const optionsStr = param.annotation.type
                        .replace("typing.Literal[", "")
                        .replace("]", "");
                      const options = optionsStr.split(", ").map((option) => {
                        return option.replace(/'/g, "");
                      });
                      return (
                        <FormItem>
                          <Tooltip>
                            <TooltipTrigger>
                              <FormLabel>
                                {snakeToTitleCase(param.name)}
                              </FormLabel>
                            </TooltipTrigger>
                            <TooltipContent>
                              <FormDescription>
                                {param.description}
                              </FormDescription>
                            </TooltipContent>
                          </Tooltip>
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
                      );
                    }
                    if (param.annotation.type.includes("dict")) {
                      return (
                        <FormItem>
                          <Tooltip>
                            <TooltipTrigger>
                              <FormLabel>
                                {snakeToTitleCase(param.name)}
                              </FormLabel>
                            </TooltipTrigger>
                            <TooltipContent>
                              <FormDescription>
                                {param.description}
                              </FormDescription>
                            </TooltipContent>
                          </Tooltip>
                          <FormControl>
                            <RecordInput onValueChange={field.onChange} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }
                    return (
                      <div
                        className="flex flex-col text-red-500"
                        key={camelCase(param.name)}
                      >
                        <p>Unsupported parameter with no type annotations:</p>
                        <p>{camelCase(param.name)}</p>
                      </div>
                    );
                  }}
                />
              ))}
            </div>
            <Button className="mt-4 w-full" type="submit">
              Submit
            </Button>
          </form>
        </TooltipProvider>
      </ScrollArea>
    </Form>
  );
}

const deviceOptionsNames = ["__READABLE__", "__MOVABLE__", "__FLYABLE__"];

function SelectListOptions({
  param,
  listOptions,
  defaultValue,
  onValueChange,
}: {
  param: Parameter;
  listOptions: DynamicFormProps["devices"];
  defaultValue: string;
  onValueChange: (value: string) => void;
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
    <FormItem>
      <Tooltip>
        <TooltipTrigger>
          <FormLabel>{snakeToTitleCase(param.name)}</FormLabel>
        </TooltipTrigger>
        <TooltipContent>
          <FormDescription>{param.description}</FormDescription>
        </TooltipContent>
      </Tooltip>
      <Select defaultValue={defaultValue} onValueChange={onValueChange}>
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
  );
}

function MultiSelectListOptions({
  param,
  listOptions,
  defaultValue,
  onValueChange,
}: {
  param: Parameter;
  listOptions: DynamicFormProps["devices"];
  defaultValue?: string[];
  onValueChange: (value: string[]) => void;
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
        defaultOptions={defaultValue}
        onChange={onValueChange}
        options={typeOptions}
        placeholder="Select options"
      />
      <FormDescription>{param.description}</FormDescription>
      <FormMessage />
    </FormItem>
  );
}

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
