"use client";

import type { UniqueIdentifier } from "@dnd-kit/core";
import { cn } from "@sophys-web/ui";
import type { SampleParams } from "../../lib/schemas/sample";

export type Sample = {
  id: UniqueIdentifier;
  relativePosition: string;
  type: "S" | "B" | null;
  isUsed?: boolean;
} & Partial<SampleParams>;

export function SampleItem({ sample }: { sample: Sample }) {
  const disabled = sample.type === null || sample.isUsed;

  const classNames = cn(
    "relative flex h-7 w-7 cursor-pointer items-center justify-center rounded-full font-semibold text-white text-xs",
    { "hover:scale-105 hover:ring hover:ring-primary": !disabled },
    { "cursor-not-allowed opacity-50": disabled },
    {
      "bg-slate-500": !sample.type,
      "bg-emerald-500": sample.type === "S",
      "bg-sky-500": sample.type === "B",
    },
  );

  return (
    <div className="select-none">
      <span className={classNames}>{sample.type ?? "-"}</span>
    </div>
  );
}
