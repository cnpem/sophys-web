"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@sophys-web/ui/input";
import { Switch } from "@sophys-web/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@sophys-web/ui/select";
import { MultiSelectDialog } from "@sophys-web/ui/multi-select";
import { Button } from "@sophys-web/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@sophys-web/ui/hover-card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@sophys-web/ui/form";
import { Label } from "@sophys-web/ui/label";
import { createSchema, type Parameter } from "./create-schema";

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
  const schema = createSchema(planData.parameters);
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: planData.parameters.reduce((acc, param) => {
      if (param.default) {
        acc[param.name] = param.default as any;
      }
      return acc;
    }, {}),
  });

  const onSubmit = (data: any) => {
    console.log("Form data:", data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <h2 className="text-2xl font-bold">{planData.name}</h2>
        <p className="text-gray-600">{planData.description}</p>
        <div className="grid grid-cols-3 gap-6 mb-6">
          {planData.parameters.map((param) => (
            <FormField
              control={form.control}
              key={param.name}
              // this is crazy
              name={param.name as keyof typeof form.control._defaultValues}
              render={({ field }) => {
                if (!param.annotation?.type) {
                  // returning fragment to avoid returning null and breaking the form
                  return <></>;
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
                              This is a special python object that is not supported in this form
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
                    param.annotation?.type.includes(name)
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
                            <div className="flex items-center align-middle border rounded-lg p-2 space-y-0">
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
                  param.annotation.type.includes("str") ||
                  param.annotation.type.includes("dict")
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
                                param.annotation.type
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
                // returning fragment to avoid returning null and breaking the form
                return <></>;
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

const deviceOptionsNames = [
  "__READABLE__",
  "__MOVABLE__",
  "__FLYABLE__",
];

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
        <FormItem className="flex flex-col mt-2">
          <FormLabel>{param.name}</FormLabel>
          <MultiSelectDialog
            defaultOptions={defaultValue}
            options={typeOptions}
            placeholder="Select options"
            onChange={onValueChange}
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
  if (type.includes("dict")) {
    return "{key1: value1, key2: value2}";
  }
  if (type === "typing.Sequence[float]") {
    return "[1.0, 2.0, 3.0]";
  }
  if (type === "typing.Sequence[int]") {
    return "[1, 2, 3]";
  }
  if (type === "typing.Sequence[str]") {
    return '["a", "b", "c"]';
  }
  if (type.includes("int")) {
    return "1";
  }
  if (type.includes("float")) {
    return "1.0";
  }
  return "No information on input type";
}
