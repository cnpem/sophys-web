import type { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { MoveRightIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@sophys-web/ui/button";
import { Checkbox } from "@sophys-web/ui/checkbox";
import {
  Form,
  FormControl,
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
import { cleaningDefaults } from "../../../lib/constants";
import { schema as cleanCapillaryKwargsSchema } from "../../../lib/schemas/plans/clean-and-acquire";

const cleaningSelectOptions = [...cleaningDefaults, "custom"] as const;

export function CleanCapillaryForm({
  onSubmit,
  initialValues,
}: {
  onSubmit: (data: z.infer<typeof cleanCapillaryKwargsSchema>) => void;
  initialValues?: Partial<z.infer<typeof cleanCapillaryKwargsSchema>>;
}) {
  const form = useForm<z.infer<typeof cleanCapillaryKwargsSchema>>({
    resolver: zodResolver(cleanCapillaryKwargsSchema),
    defaultValues: initialValues,
  });

  const handleSubmitDiscriminated = (
    data: z.infer<typeof cleanCapillaryKwargsSchema>,
  ) => {
    if (data.standardOption === "custom") {
      if (!data.agentsList || !data.agentsDuration) {
        return;
      }
      if (data.agentsList.length !== data.agentsDuration.length) {
        return;
      }
      onSubmit({
        ...data,
        standardOption: undefined,
        agentsList: data.agentsList,
        agentsDuration: data.agentsDuration,
      });
      return;
    }
    onSubmit({
      ...data,
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
            name="proposal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Proposal</FormLabel>
                <FormControl>
                  <Input disabled {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sampleType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sample Type</FormLabel>
                <FormControl>
                  <Input disabled {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="acquireTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Acquire Time</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="numExposures"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Exposures</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sampleTag"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sample Tag</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bufferTag"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Buffer Tag</FormLabel>
                <FormControl>
                  <Input disabled {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
                    {cleaningSelectOptions.map((option) => {
                      return (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
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
                    placeholder="e.g. agent1, agent2, agent3"
                    value={field.value ? field.value.join(",") : ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value ? value.split(",") : undefined);
                    }}
                  />
                </FormControl>
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
                    value={field.value ? field.value.join(",") : ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(
                        value ? value.split(",").map(Number) : undefined,
                      );
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isRef"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    disabled
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Is Reference?</FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>
        <Button type="submit">
          Next
          <MoveRightIcon className="ml-2 h-4 w-4" />
        </Button>
        <FormMessage />
      </form>
    </Form>
  );
}
