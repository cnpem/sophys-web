import { zodResolver } from "@hookform/resolvers/zod";
import { SearchIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import type { ButtonProps } from "@sophys-web/ui/button";
import { useQueue } from "@sophys-web/api-client/hooks";
import { Button } from "@sophys-web/ui/button";
import { Form } from "@sophys-web/ui/form";

export const name = "setup2_detect_sample_cards";

export const schema = z.object({});

type DetectSampleCardsButtonFormProps = Omit<ButtonProps, "type"> & {
  onSubmitSuccess?: () => void;
};

export function DetectSampleCardsButtonForm({
  variant,
  size,
  asChild,
  className,
  onSubmitSuccess,
  ...props
}: DetectSampleCardsButtonFormProps) {
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
          toast.success("Sample cards detected");
          onSubmitSuccess?.();
        },
        onError: (error) => {
          toast.error("Failed to detect sample cards", {
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
          disabled={form.formState.isSubmitting}
          className={className}
          variant={variant}
          size={size}
          asChild={asChild}
          {...props}
        >
          <SearchIcon className="size-4" /> Detect Cards
        </Button>
      </form>
    </Form>
  );
}
