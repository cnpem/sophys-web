import type { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
import {
  name,
  schema,
} from "~/app/_components/plans/schemas/setup2-pick-card-by-index";
import { cardIndexOptions } from "../store/setup2/constants";

export function PickCardForm({
  className,
  onSubmitSuccess,
  index,
}: {
  className?: string;
  onSubmitSuccess?: () => void;
  index?: z.infer<typeof schema>["index"];
}) {
  const { add } = useQueue();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      index: index ?? cardIndexOptions[0],
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
