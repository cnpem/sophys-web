import * as React from "react";
import { cn } from "@sophys-web/ui";

function WindowCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 overflow-hidden rounded-lg border",
        className,
      )}
      {...props}
    />
  );
}

function WindowCardHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "bg-muted text-muted-foreground @container/card-header flex w-full flex-row items-center gap-2 border-b px-1 py-0.5 pb-0 text-sm",
        "has-data-[slot=card-action]:grid-cols-[1fr_auto]",
        className,
      )}
      {...props}
    />
  );
}

function WindowCardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("flex w-full flex-row items-center font-normal", className)}
      {...props}
    />
  );
}

function WindowCardAction({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

function WindowCardContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("grow px-6 pb-6", className)}
      {...props}
    />
  );
}

function WindowCardFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("mt-auto flex items-center px-2 pb-2", className)}
      {...props}
    />
  );
}

export {
  WindowCard,
  WindowCardHeader,
  WindowCardTitle,
  WindowCardAction,
  WindowCardContent,
  WindowCardFooter,
};
