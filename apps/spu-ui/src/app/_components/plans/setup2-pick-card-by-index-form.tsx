import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { SquareMousePointerIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import type { ButtonProps } from "@sophys-web/ui/button";
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
import { Field, FieldGroup, FieldLabel } from "@sophys-web/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@sophys-web/ui/select";
import { InfoTooltip } from "@sophys-web/widgets/form-components/info-tooltip";
import { cardIndexOptions, cardModes } from "../store/setup2/constants";

export const planName = "setup2_pick_card_by_index";

export const planSchema = z.object({
  index: z.enum(cardIndexOptions),
  cardMode: z.enum(cardModes).optional().default("standard"),
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
      cardMode: "standard",
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
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className={cn("flex w-full flex-col space-y-2", className)}
    >
      <FieldGroup
        className={cn("grid w-full grid-flow-row grid-cols-2 gap-2", className)}
      >
        <Controller
          name="index"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Card Index</FieldLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                name={field.name}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
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
              {fieldState.invalid && (
                <InfoTooltip variant={"destructive"}>
                  {fieldState.error?.message}
                </InfoTooltip>
              )}
            </Field>
          )}
        />
        <Controller
          name="cardMode"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Card Mode</FieldLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                name={field.name}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {cardModes.map((option) => {
                    return (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {fieldState.invalid && (
                <InfoTooltip variant={"destructive"}>
                  {fieldState.error?.message}
                </InfoTooltip>
              )}
            </Field>
          )}
        />
      </FieldGroup>
      <Button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="w-full"
      >
        <SquareMousePointerIcon className="size-4" /> Pick card
      </Button>
    </form>
  );
}

type PickCardButtonFormProps = Omit<ButtonProps, "type"> & {
  onSubmitSuccess?: () => void;
  index: z.infer<typeof planSchema>["index"];
  cardMode?: z.infer<typeof planSchema>["cardMode"];
};

export function PickCardButtonForm({
  variant,
  size,
  asChild,
  className,
  onSubmitSuccess,
  index,
  cardMode,
  disabled,
  ...props
}: PickCardButtonFormProps) {
  const { add } = useQueue();
  const form = useForm({
    resolver: zodResolver(planSchema),
    defaultValues: {
      index: index,
      cardMode: cardMode ?? "standard",
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
  );
}

interface Setup2PickCardByIndexDialogProps extends Omit<ButtonProps, "type"> {
  onClose?: () => void;
}
export function Setup2PickCardByIndexDialog({
  variant,
  size,
  className,
  onClose,
  ...props
}: Setup2PickCardByIndexDialogProps) {
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
        <Button variant={variant} className={className} size={size} {...props}>
          <SquareMousePointerIcon className="size-4" /> Pick card by index
        </Button>
      </DialogTrigger>
      <DialogContent className="w-80">
        <DialogHeader>
          <DialogTitle>Pick Card by Index</DialogTitle>
          <DialogDescription className="flex flex-col gap-2">
            Select a card to pick and move to the experiment position.
          </DialogDescription>
        </DialogHeader>
        <PickCardForm onSubmitSuccess={handleSubmitSuccess} />
      </DialogContent>
    </Dialog>
  );
}
