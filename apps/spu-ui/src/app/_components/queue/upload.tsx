"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { UploadIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@sophys-web/ui/button";
import { Checkbox } from "@sophys-web/ui/checkbox";
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
import { toast } from "@sophys-web/ui/sonner";

const formSchema = z.object({
  useCapillary: z.boolean(),
  proposal: z.string().length(9),
  file: z.string().min(1),
});
function UploadQueueForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      useCapillary: false,
      proposal: "",
      file: "",
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    toast.message("Uploading queue...", {
      description: (
        <pre className="mt-2 rounded-md bg-slate-950 p-4">
          <code className="text-sm text-white">
            {JSON.stringify(data, null, 2)}
          </code>
        </pre>
      ),
    });
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="proposal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Proposal</FormLabel>
              <FormControl>
                <Input maxLength={9} placeholder="p00000000" {...field} />
              </FormControl>
              <FormDescription>
                This is your proposal ID, e.g. p00000000.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="useCapillary"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Make empty capillary acquisition</FormLabel>
                <FormDescription>
                  This will add an empty capillary acquisition plan in the
                  queue, which can be used as a reference measure.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CSV Queue</FormLabel>
              <FormControl>
                <Input type="file" {...field} accept=".csv" />
              </FormControl>
              <FormDescription>
                This is the CSV file containing the experiment queue.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}

export function UploadQueue() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button title="load new experiment queue" size="icon" variant="outline">
          <UploadIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Load Experiment Queue</DialogTitle>
          <DialogDescription>
            Load a new experiment queue from a CSV file.
          </DialogDescription>
        </DialogHeader>
        <UploadQueueForm />
      </DialogContent>
    </Dialog>
  );
}
