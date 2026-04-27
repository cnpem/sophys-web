import { zodResolver } from "@hookform/resolvers/zod";
import { ListCheckIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import type { ButtonProps } from "@sophys-web/ui/button";
import { useQueue } from "@sophys-web/api-client/hooks";
import { Button } from "@sophys-web/ui/button";
import { Form } from "@sophys-web/ui/form";
import { useSampleCardStatus } from "./sample-card-state";

export const name = "setup2_errors_checkout";

export const schema = z.object({});

type ErrorsCheckoutButtonFormProps = Omit<ButtonProps, "type"> & {
  onSubmitSuccess?: () => void;
};

export function ErrorsCheckoutButtonForm({
  variant,
  size,
  asChild,
  className,
  onSubmitSuccess,
  ...props
}: ErrorsCheckoutButtonFormProps) {
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
          toast.success("Error checkout added to the queue");
          onSubmitSuccess?.();
        },
        onError: (error) => {
          toast.error("Failed to submit error checkout", {
            description: error.message,
            closeButton: true,
          });
        },
      },
    );
  }
  if (status !== "error") {
    return null; // Don't render the button if the status is not "error"
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className={className}
          variant={variant}
          size={size}
          asChild={asChild}
          {...props}
        >
          <ListCheckIcon className="size-4" /> Errors Checkout
        </Button>
      </form>
    </Form>
  );
}
