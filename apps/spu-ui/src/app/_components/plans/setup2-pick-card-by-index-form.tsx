import { zodResolver } from "@hookform/resolvers/zod";
import { SquareMousePointerIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import type { ButtonProps } from "@sophys-web/ui/button";
import { useQueue } from "@sophys-web/api-client/hooks";
import { cn } from "@sophys-web/ui";
import { Button } from "@sophys-web/ui/button";
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
import { cardIndexOptions } from "../store/setup2/constants";

export const planName = "setup2_pick_card_by_index";

export const planSchema = z.object({
  index: z.enum(cardIndexOptions),
});

export function PickCardForm({
  className,
  onSubmitSuccess,
  index,
}: {
  className?: string;
  onSubmitSuccess?: () => void;
  index?: z.infer<typeof planSchema>["index"];
}) {
  const { add } = useQueue();
  const form = useForm({
    resolver: zodResolver(planSchema),
    defaultValues: {
      index: index ?? cardIndexOptions[0],
    },
  });

  function onSubmit(data: z.infer<typeof planSchema>) {
    toast.info("Submitting sample...");
    const kwargs = planSchema.parse(data);
    add.mutate(
      {
        item: {
          name: planName,
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
          name="index"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Card Index</FormLabel>
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
                  {cardIndexOptions.map((option) => {
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

type PickCardButtonFormProps = Omit<ButtonProps, "type"> & {
  onSubmitSuccess?: () => void;
  index: z.infer<typeof planSchema>["index"];
};

export function PickCardButtonForm({
  variant,
  size,
  asChild,
  className,
  onSubmitSuccess,
  index,
  disabled,
  ...props
}: PickCardButtonFormProps) {
  const { add } = useQueue();
  const form = useForm({
    resolver: zodResolver(planSchema),
    defaultValues: {
      index: index,
    },
  });

  function onSubmit(data: z.infer<typeof planSchema>) {
    toast.info("Submitting sample...");
    const kwargs = planSchema.parse(data);
    add.mutate(
      {
        item: {
          name: planName,
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
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Button
          type="submit"
          disabled={form.formState.isSubmitting || disabled}
          className={className}
          variant={variant}
          size={size}
          asChild={asChild}
          {...props}
        >
          <SquareMousePointerIcon className="size-4" /> Pick card {index}
        </Button>
      </form>
    </Form>
  );
}
