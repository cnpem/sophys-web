import { zodResolver } from "@hookform/resolvers/zod";
import { MoveRightIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { cleaningOptions, sampleTypeOptions } from "../store/setup1/constants";

export const planName = "setup1_clean_and_acquire";

export const planSchema = z.object({
  acquireTime: z.coerce
    .number()
    .min(0.1, "Acquire time (in seconds) must be at least 0.1"),
  sampleType: z
    .string()
    .transform((val) => val.trimStart().trimEnd())
    .pipe(
      z.enum(sampleTypeOptions, {
        message: "Sample type must be either 'buffer' or 'sample'",
      }),
    ),
  numExposures: z.coerce.number(),
  proposal: z.string().length(8),
  sampleTag: z.string(),
  standardOption: z.string().optional(),
  agentsList: z.array(z.string()).optional(),
  agentsDuration: z.array(z.number()).optional(),
  isRef: z.boolean(),
});

export function CleanCapillaryForm({
  onSubmit,
  initialValues,
}: {
  onSubmit: (data: z.infer<typeof planSchema>) => void;
  initialValues?: Partial<z.infer<typeof planSchema>>;
}) {
  const form = useForm({
    resolver: zodResolver(planSchema),
    defaultValues: { ...initialValues },
  });

  const handleSubmitDiscriminated = (data: z.infer<typeof planSchema>) => {
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
