import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { InfoIcon } from "lucide-react";
import { cn } from "@sophys-web/ui";
import { FieldLabel } from "@sophys-web/ui/field";
import { useFormField } from "@sophys-web/ui/form";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@sophys-web/ui/tooltip";

const iconVariants = cva("text-muted-foreground hover:text-foreground size-4", {
  variants: {
    variant: {
      default: "text-muted-foreground hover:text-foreground",
      subtle: "text-muted-foreground hover:text-foreground",
      destructive: "text-destructive hover:text-destructive/80",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

function InfoTooltip({
  children,
  variant,
}: {
  children: React.ReactNode;
} & VariantProps<typeof iconVariants>) {
  return (
    <Tooltip>
      <TooltipTrigger>
        <InfoIcon className={cn(iconVariants({ variant }))} />
      </TooltipTrigger>
      <TooltipContent>{children}</TooltipContent>
    </Tooltip>
  );
}

function ErrorMessageTooltip({
  className,
  ...props
}: React.ComponentProps<"p">) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error.message ?? "") : props.children;

  if (!body) {
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger className="w-fit">
        <InfoIcon
          className={cn("text-destructive size-4 text-sm", className)}
        />
      </TooltipTrigger>
      <TooltipContent
        className={cn("text-primary-foreground text-sm", className)}
      >
        <p data-slot="form-message" id={formMessageId} {...props}>
          {body}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * Creates a FieldLabel component with a tooltip for additional information.
 * The tooltip is triggered by hovering over the ⓘ symbol next to the label name and it's non clickable for preventing focus on the tooltip trigger.
 */
function FieldLabelWithTooltip({
  labelName,
  labelDescription,
}: {
  labelName: string;
  labelDescription: string;
}) {
  return (
    <FieldLabel>
      <span className="whitespace-nowrap">{labelName}</span>
      <Tooltip>
        <TooltipTrigger asChild>
          <span tabIndex={-1} className="text-muted-foreground">
            ⓘ
          </span>
        </TooltipTrigger>
        <TooltipContent>{labelDescription}</TooltipContent>
      </Tooltip>
    </FieldLabel>
  );
}

export { InfoTooltip, ErrorMessageTooltip, FieldLabelWithTooltip };
