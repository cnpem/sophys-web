import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { InfoIcon } from "lucide-react";
import { cn } from "@sophys-web/ui";
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

export { InfoTooltip };
