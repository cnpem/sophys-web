"use client";

import { useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@sophys-web/ui/hover-card";
import { Input } from "@sophys-web/ui/input";
import { Label } from "@sophys-web/ui/label";
import { MultiSelectDialog } from "@sophys-web/ui/multi-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@sophys-web/ui/select";
import { toast } from "@sophys-web/ui/sonner";
import { Switch } from "@sophys-web/ui/switch";
import type { Parameter } from "./create-schema";
import { useQueue } from "../../_hooks/use-queue";
import { createSchema } from "./create-schema";
import { RecordInput } from "./record-input";

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
}

export default function PlanForm({ planData, devices }: DynamicFormProps) {
  const { add } = useQueue();
  const schema = createSchema(planData.parameters);
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: planData.parameters.reduce((acc, param) => {
      if (param.default && param.default !== "None") {
        acc[param.name] = param.default;
      }
      return acc;
    }, {}),
  });

  const onSubmit = useCallback(
    async (data) => {
      console.log("Form data:", data);
      const kwargs = data;
      console.log("Kwargs:", kwargs);
      await add.mutateAsync(
        {
          item: {
            itemType: "plan",
            name: planData.name,
            kwargs,
            args: [],
          },
        },
        {
          onSuccess: () => {
            toast.success(`Plan ${planData.name} added to the queue`);
          },
          onError: (error) => {
            const message = error.message.replace("\n", " ");
            toast.error(
              `Failed to add plan ${planData.name} to the queue: ${message}`,
            );
          },
        },
      );
    },
    [add],
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <h2 className="text-2xl font-bold">{planData.name}</h2>
        <p className="text-gray-600">{planData.description}</p>
        <div className="mb-6 grid grid-cols-3 gap-6">
          {planData.parameters.map((param) => (
            <FormField
              control={form.control}
              key={param.name}
              name={param.name as keyof typeof form.control._defaultValues}
              render={({ field }) => {
                if (!param.annotation?.type) {
                  return (
                    <div
                      className="flex flex-col text-red-500"
                      key={param.name}
                    >
                      <p>Unsupported parameter with no type annotations:</p>
                      <p>{param.name}</p>
                    </div>
                  );
                }
                if (param.annotation.type.includes("__CALLABLE__")) {
                  return (
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <FormItem>
                          <FormLabel>{param.name}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled
                              placeholder="Callable"
                              type="text"
                            />
                          </FormControl>
                          <HoverCardContent>
                            <FormDescription>
                              This is a special python object that is not
                              supported in this form
                              {param.description}
                            </FormDescription>
                          </HoverCardContent>
                          <FormMessage />
                        </FormItem>
                      </HoverCardTrigger>
                    </HoverCard>
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
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <FormItem>
                          <FormLabel>{param.name}</FormLabel>
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
                          <HoverCardContent>
                            <FormDescription>
                              {param.description}
                            </FormDescription>
                          </HoverCardContent>
                          <FormMessage />
                        </FormItem>
                      </HoverCardTrigger>
                    </HoverCard>
                  );
                }
                if (
                  param.annotation.type.includes("int") ||
                  param.annotation.type.includes("float") ||
                  param.annotation.type.includes("str")
                  // param.annotation.type.includes("dict")
                ) {
                  return (
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <FormItem>
                          <FormLabel>{param.name}</FormLabel>
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
                          <HoverCardContent>
                            <FormDescription>
                              {param.description}
                            </FormDescription>
                          </HoverCardContent>
                          <FormMessage />
                        </FormItem>
                      </HoverCardTrigger>
                    </HoverCard>
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
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <FormItem>
                          <FormLabel>{param.name}</FormLabel>
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
                          <HoverCardContent>
                            <FormDescription>
                              {param.description}
                            </FormDescription>
                          </HoverCardContent>
                          <FormMessage />
                        </FormItem>
                      </HoverCardTrigger>
                    </HoverCard>
                  );
                }
                if (param.annotation.type.includes("dict")) {
                  return (
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <FormItem>
                          <FormLabel>{param.name}</FormLabel>
                          <FormControl>
                            <RecordInput onValueChange={field.onChange} />
                          </FormControl>
                          <HoverCardContent>
                            <FormDescription>
                              {param.description}
                            </FormDescription>
                          </HoverCardContent>
                          <FormMessage />
                        </FormItem>
                      </HoverCardTrigger>
                    </HoverCard>
                  );
                }
                return (
                  <div className="flex flex-col text-red-500" key={param.name}>
                    <p>Unsupported parameter with no type annotations:</p>
                    <p>{param.name}</p>
                  </div>
                );
              }}
            />
          ))}
        </div>
        <Button className="w-full" type="submit">
          Submit
        </Button>
      </form>
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
  const type = param.annotation?.type || "";
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
    <HoverCard>
      <HoverCardTrigger asChild>
        <FormItem>
          <FormLabel>{param.name}</FormLabel>
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
          <HoverCardContent>
            <FormDescription>{param.description}</FormDescription>
          </HoverCardContent>
          <FormMessage />
        </FormItem>
      </HoverCardTrigger>
    </HoverCard>
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
  const type = param.annotation?.type || "";
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
    <HoverCard>
      <HoverCardTrigger asChild>
        <FormItem className="mt-2 flex flex-col">
          <FormLabel>{param.name}</FormLabel>
          <MultiSelectDialog
            defaultOptions={defaultValue}
            onChange={onValueChange}
            options={typeOptions}
            placeholder="Select options"
          />
          <HoverCardContent>
            <FormDescription>{param.description}</FormDescription>
          </HoverCardContent>
          <FormMessage />
        </FormItem>
      </HoverCardTrigger>
    </HoverCard>
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
