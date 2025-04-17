"use client";

import type { z } from "zod";
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import camelCase from "camelcase";
import { useForm } from "react-hook-form";
import { Button } from "@sophys-web/ui/button";
import { Form } from "@sophys-web/ui/form";
import { ScrollArea } from "@sophys-web/ui/scroll-area";
import { TooltipProvider } from "@sophys-web/ui/tooltip";
import type { AnySchema, Parameter } from "./lib/create-schema";
import { AnyField } from "./form-components/fields";

interface DynamicFormProps {
  planData: {
    name: string;
    description: string | undefined;
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
      <ScrollArea className="h-[400px]">
        <TooltipProvider>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 text-center"
          >
            <h2 className="text-2xl font-semibold">
              {planData.name.replace(/_/g, " ")}
            </h2>
            {planData.description && (
              <p className="text-muted-foreground">{planData.description}</p>
            )}
            <div className="space-y-8">
              {planData.parameters.map((param) => (
                <AnyField
                  devices={devices}
                  param={param}
                  form={form}
                  key={param.name}
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
