import type { z } from "zod";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { DropletIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useQueue } from "@sophys-web/api-client/hooks";
import { Button } from "@sophys-web/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@sophys-web/ui/dialog";
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
import { cleaningAgents, cleaningDefaults } from "../../../lib/constants";
import {
  schema as cleaningKwargsSchema,
  name,
} from "../../../lib/schemas/plans/single-cleaning";

const cleaningSelectOptions = [...cleaningDefaults, "custom"] as const;

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

function CleaningForm({ onSubmitSuccess }: { onSubmitSuccess?: () => void }) {
  const { addBatch } = useQueue();
  const form = useForm<z.infer<typeof cleaningKwargsSchema>>({
    resolver: zodResolver(cleaningKwargsSchema),
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
      addBatch.mutate(
        {
          items: [
            {
              name: name,
              itemType: "plan",
              args: [],
              kwargs: {
                standardOption: data.standardOption,
                agentsList: data.agentsList,
                agentsDuration: data.agentsDuration,
              },
            },
            {
              name: "queue_stop",
              itemType: "instruction",
              args: [],
              kwargs: {},
            },
          ],
          pos: "front",
        },
        {
          onSuccess: () => {
            toast.success("Sample submitted!");
            onSubmitSuccess?.();
          },
          onError: (error) => {
            toast.error("Failed to submit sample", {
              description: error.message,
              closeButton: true,
            });
          },
        },
      );
      return;
    }
    addBatch.mutate(
      {
        items: [
          {
            name: name,
            itemType: "plan",
            args: [],
            kwargs: {
              standardOption: data.standardOption,
              agentsList: undefined,
              agentsDuration: undefined,
            },
          },
          {
            name: "queue_stop",
            itemType: "instruction",
            args: [],
            kwargs: {},
          },
        ],
        pos: "front",
      },
      {
        onSuccess: () => {
          toast.success("Sample submitted!");
          onSubmitSuccess?.();
        },
        onError: (error) => {
          toast.error("Failed to submit sample", {
            description: error.message,
            closeButton: true,
          });
        },
      },
    );
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
                    {cleaningSelectOptions.map((option) => {
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
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}

export function CleaningDialog({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          <DropletIcon className="mr-2 h-4 w-4" />
          Clean
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Acquire</DialogTitle>
          <DialogDescription>
            Please fill in the details below to submit the plan. The sample
            details are pre-filled.
          </DialogDescription>
        </DialogHeader>
        <CleaningForm
          onSubmitSuccess={() => {
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
