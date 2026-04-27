import { zodResolver } from "@hookform/resolvers/zod";
import { SquareArrowDownIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import type { ButtonProps } from "@sophys-web/ui/button";
import { useQueue } from "@sophys-web/api-client/hooks";
import { Button } from "@sophys-web/ui/button";
import { Form } from "@sophys-web/ui/form";
import { useSampleCardStatus } from "./sample-card-state";

export const name = "setup2_retrieve_card";

export const schema = z.object({});

type RetrieveCardButtonFormProps = Omit<ButtonProps, "type"> & {
  onSubmitSuccess?: () => void;
};

export function RetrieveCardButtonForm({
  variant,
  size,
  asChild,
  className,
  onSubmitSuccess,
  ...props
}: RetrieveCardButtonFormProps) {
  const { status } = useSampleCardStatus();
  const { add } = useQueue();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {},
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
          toast.success("Sample card retrieval added to the queue");
          onSubmitSuccess?.();
        },
        onError: (error) => {
          toast.error("Failed to submit sample card retrieval", {
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
          disabled={form.formState.isSubmitting || status !== "loaded"}
          className={className}
          variant={variant}
          size={size}
          asChild={asChild}
          {...props}
        >
          <SquareArrowDownIcon className="size-4" /> Retrieve Card
        </Button>
      </form>
    </Form>
  );
}
