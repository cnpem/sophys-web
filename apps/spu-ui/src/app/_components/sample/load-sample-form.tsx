import type { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useQueue } from "@sophys-web/api-client/hooks";
import { api } from "@sophys-web/api-client/react";
import { Button } from "@sophys-web/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@sophys-web/ui/form";
import { Input } from "@sophys-web/ui/input";
import type { Sample } from "./sample-item";
import { name, schema } from "~/lib/schemas/plans/load";

export function LoadSampleForm({
  sample,
  onSubmitCallback,
}: {
  sample: Sample;
  onSubmitCallback?: () => void;
}) {
  const { data: userData } = api.auth.getUser.useQuery();
  const { add } = useQueue();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      tray: sample.tray,
      row: sample.row,
      col: sample.col,
      volume: 60, // default load volume to 60 µL
      sampleTag: sample.sampleTag,
      sampleType: sample.sampleType,
      proposal: userData?.proposal ?? "", // default proposal to user's current proposal
    },
  });

  function onSubmit(data: z.infer<typeof schema>) {
    toast.info("Submitting sample...");
    const kwargs = schema.parse({
      ...data,
    });
    add.mutate(
      {
        item: {
          name: name,
          itemType: "plan",
          args: [],
          kwargs,
        },
      },
      {
        onSuccess: () => {
          toast.success("Sample submitted!");
          form.reset();
        },
        onError: (error) => {
          toast.error("Failed to submit sample", {
            description: error.message,
            closeButton: true,
          });
        },
      },
    );
    onSubmitCallback?.();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-2 gap-4"
      >
        <FormField
          control={form.control}
          name="volume"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Volume (µL)</FormLabel>
              {/* <FormDescription className="flex-wrap">
                Load volume (default: 60).
              </FormDescription> */}
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* expUvTime */}
        <FormField
          control={form.control}
          name="expUvTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>UV Exposure Time (s)</FormLabel>
              {/* <FormDescription className="flex-wrap">
                UV exposure time in seconds.
              </FormDescription> */}
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder="Optional"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* measureUvNumber */}
        <FormField
          control={form.control}
          name="measureUvNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of UV Measurements</FormLabel>
              {/* <FormDescription className="flex-wrap">
                Number of UV measurements to take.
              </FormDescription> */}
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder="Optional"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* proposal */}
        <FormField
          control={form.control}
          name="proposal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Proposal</FormLabel>
              {/* <FormDescription className="flex-wrap">
                Proposal name or ID.
              </FormDescription> */}
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="col-span-2"
        >
          Submit
        </Button>
      </form>
    </Form>
  );
}
