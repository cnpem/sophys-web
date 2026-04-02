import type { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { MoveRightIcon } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@sophys-web/ui/select";
import { cleaningAgents, cleaningOptions } from "../../../lib/constants";
import { cleaningSchema as cleaningKwargsSchema } from "../../../lib/schemas/plans/complete-acquisition";

function formatAgentList(input: string) {
  return input
    .split(",")
    .map((item) => item.trimStart().trimEnd())
    .filter((item) => item.length > 0)
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1).toLowerCase());
}

function formatAgentDuration(input: string) {
  return input
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export function AcquisitionCleaningForm({
  onSubmit,
  initialValues,
}: {
  onSubmit: (data: z.infer<typeof cleaningKwargsSchema>) => void;
  initialValues?: Partial<z.infer<typeof cleaningKwargsSchema>>;
}) {
  const form = useForm<z.infer<typeof cleaningKwargsSchema>>({
    resolver: zodResolver(cleaningKwargsSchema),
    defaultValues: initialValues,
  });

  const handleSubmitDiscriminated = (
    data: z.infer<typeof cleaningKwargsSchema>,
  ) => {
    if (data.standardOption === "custom") {
      if (!data.agentsList || !data.agentsDuration) {
        return;
      }
      if (data.agentsList.length !== data.agentsDuration.length) {
        return;
      }
      onSubmit({
        standardOption: undefined,
        agentsList: data.agentsList,
        agentsDuration: data.agentsDuration,
      });
      return;
    }
    onSubmit({
      standardOption: data.standardOption,
      agentsList: undefined,
      agentsDuration: undefined,
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmitDiscriminated)}
        className="flex flex-col items-end space-y-8"
      >
        <div className="grid grid-cols-3 gap-8">
          <FormField
            control={form.control}
            name="standardOption"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cleaning Method</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value ?? undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {cleaningOptions.map((option) => {
                      return (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                  <FormDescription>
                    Select a standard cleaning method or choose custom to
                    specify agents and durations.
                  </FormDescription>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="agentsList"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Agents</FormLabel>
                <FormControl>
                  <Input
                    disabled={form.watch("standardOption") !== "custom"}
                    placeholder="e.g. Water, Agent 1, Air"
                    {...field}
                    onBlur={(e) => {
                      const value = e.target.value;
                      field.onChange(
                        value ? formatAgentList(value) : undefined,
                      );
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Make a comma separated list of cleaning agents for the
                  available agents: {cleaningAgents.join(", ")}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="agentsDuration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Agents Duration</FormLabel>
                <FormControl>
                  <Input
                    disabled={form.watch("standardOption") !== "custom"}
                    placeholder="e.g. 10, 20, 30"
                    {...field}
                    value={field.value ? field.value.toString() : ""}
                    onBlur={(e) => {
                      const value = e.target.value;
                      field.onChange(
                        value ? formatAgentDuration(value) : undefined,
                      );
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Make a comma separated list of durations in seconds for the
                  time each agent is applied.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit">
          Next
          <MoveRightIcon className="ml-2 h-4 w-4" />
        </Button>
      </form>
    </Form>
  );
}
