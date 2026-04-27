import type { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SquareMousePointerIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { ButtonProps } from "@sophys-web/ui/button";
import { useQueue } from "@sophys-web/api-client/hooks";
import { Button } from "@sophys-web/ui/button";
import { Form } from "@sophys-web/ui/form";
import {
  name,
  schema,
} from "~/app/_components/plans/schemas/setup2-pick-card-by-index";
import { useSampleCardStatus } from "./sample-card-state";

type PickCardButtonFormProps = Omit<ButtonProps, "type"> & {
  onSubmitSuccess?: () => void;
  index: z.infer<typeof schema>["index"];
};

export function PickCardButtonForm({
  variant,
  size,
  asChild,
  className,
  onSubmitSuccess,
  index,
  ...props
}: PickCardButtonFormProps) {
  const { status } = useSampleCardStatus();
  const { add } = useQueue();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      index: index,
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
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Button
          type="submit"
          disabled={form.formState.isSubmitting || status !== "no card/idle"}
          className={className}
          variant={variant}
          size={size}
          asChild={asChild}
          {...props}
        >
          <SquareMousePointerIcon className="size-4" /> Pick
        </Button>
      </form>
    </Form>
  );
}
