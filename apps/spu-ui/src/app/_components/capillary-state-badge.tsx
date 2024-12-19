"use client";

import { cn } from "@sophys-web/ui";
import { useCapillaryState } from "~/app/_hooks/use-capillary-state";

export function CapillaryStateBadge({ className }: { className?: string }) {
  const { capillaryState } = useCapillaryState();
  return (
    <div className={cn("flex flex-row items-center", className)}>
      <span
        className={cn("mr-2 inline-block h-2 w-2 rounded-full bg-slate-400", {
          "bg-yellow-500 ": capillaryState === "stale",
          "bg-green-500 ": capillaryState === "clean",
          "bg-blue-500 ": capillaryState === "sample",
          "bg-red-500 ": capillaryState === "error",
          "bg-gray-500 ": capillaryState === "unknown",
        })}
      />
      <span className="capitalize">Capillary: {capillaryState}</span>
    </div>
  );
}
