import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { InfoIcon } from "lucide-react";
import { cn } from "@sophys-web/ui";
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

export { InfoTooltip, ErrorMessageTooltip };
