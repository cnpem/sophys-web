"use client";

import type { z } from "zod";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { BubblesIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useQueue } from "@sophys-web/api-client/hooks";
import { cn } from "@sophys-web/ui";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@sophys-web/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@sophys-web/ui/select";
import { standardCleaningOptions } from "~/lib/constants";
import {
  name,
  schema,
} from "~/lib/schemas/plans/setup1-standard-cleaning-procedure";

export function StandardCleaningDialog({
  className,
  onClose,
}: {
  className?: string;
  onClose?: () => void;
}) {
  const [open, setOpen] = useState(false);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      onClose?.();
    }
  };

  const handleSubmitSuccess = () => {
    setOpen(false);
    onClose?.();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" className={className}>
          <BubblesIcon className="mr-2 h-4 w-4" />
          Standard Cleaning
        </Button>
      </DialogTrigger>

      <DialogContent className="w-64">
        <DialogHeader>
          <DialogTitle>Standard Cleaning</DialogTitle>
          <DialogDescription className="flex flex-col gap-2">
            Please select a standard cleaning option to proceed.
          </DialogDescription>
        </DialogHeader>
        <StandardCleaningForm onSubmitSuccess={handleSubmitSuccess} />
      </DialogContent>
    </Dialog>
  );
}

export function StandardCleaningForm({
  className,
  onSubmitSuccess,
}: {
  className?: string;
  onSubmitSuccess?: () => void;
}) {
  const { add } = useQueue();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      standardOption: "normal" as const,
    },
  });

  function onSubmit(data: z.infer<typeof schema>) {
    toast.info("Submitting sample...");
    const kwargs = schema.parse(data);
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
          toast.success("Standard cleaning added to the queue");
          onSubmitSuccess?.();
        },
        onError: (error) => {
          toast.error("Failed to add standard cleaning to the queue", {
            description: error.message,
            closeButton: true,
          });
        },
      },
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("w-full space-y-8", className)}
      >
        <FormField
          control={form.control}
          name="standardOption"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Standard Option</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                name={field.name}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {standardCleaningOptions.map((option) => {
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
        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full"
        >
          Submit
        </Button>
      </form>
    </Form>
  );
}
