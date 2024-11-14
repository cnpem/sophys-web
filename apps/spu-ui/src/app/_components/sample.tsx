"use client";

import type { UniqueIdentifier } from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import { cn } from "@sophys-web/ui";
import type { SampleParams } from "../../lib/schemas/sample";

export type Sample = {
  id: UniqueIdentifier;
  relativePosition: string;
  type: "S" | "B" | null;
  isUsed?: boolean;
} & Partial<SampleParams>;

export function SampleItem({
  sample,
  isDragging,
}: {
  sample: Sample;
  isDragging: boolean;
}) {
  const disabled = sample.type === null || sample.isUsed;
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: sample.id,
    disabled,
  });

  const classNames = cn(
    "relative flex h-12 w-12 cursor-grab items-center justify-center rounded-full font-bold text-white",
    { "hover:scale-110 hover:ring hover:ring-primary": !disabled },
    { "cursor-grabbing rounded-sm opacity-90": isDragging },
    { "cursor-not-allowed opacity-50": disabled },
    {
      "bg-gray-500": !sample.type,
      "bg-emerald-500": sample.type === "S",
      "bg-sky-500": sample.type === "B",
    },
  );

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="select-none"
    >
      <div className={classNames}>
        {sample.relativePosition}
        <span className="absolute bottom-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-white text-xs text-black">
          {sample.type ?? "-"}
        </span>
      </div>
    </div>
  );
}
