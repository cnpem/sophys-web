import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useQueue } from "@sophys-web/api-client/hooks";
import { cn } from "@sophys-web/ui";
import { Button } from "@sophys-web/ui/button";
import { Form } from "@sophys-web/ui/form";

export const name = "setup2_retrieve_card";

export const schema = z.object({});

export function RetrieveCardForm({
  className,
  onSubmitSuccess,
}: {
  className?: string;
  onSubmitSuccess?: () => void;
}) {
  const { add } = useQueue();
  const form = useForm({
    resolver: zodResolver(schema),
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
        {/* No fields needed since the card index is determined from the queue history */}
        <Button type="submit">Retrieve Card</Button>
      </form>
    </Form>
  );
}
