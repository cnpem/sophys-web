"use client";

import type { UniqueIdentifier } from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import { cn } from "@sophys-web/ui";

export interface Sample {
  id: UniqueIdentifier;
  pos: string;
  type: "A" | "B" | "C" | "D" | null;
  isUsed?: boolean;
}

export function getSampleColor(type: Sample["type"]) {
  switch (type) {
    case "A":
      return "bg-red-500";
    case "B":
      return "bg-blue-500";
    case "C":
      return "bg-green-500";
    case "D":
      return "bg-yellow-500";
    default:
      return "bg-gray-500";
  }
}

export function SampleItem({
  sample,
  isDragging,
}: {
  sample: Sample;
  isDragging: boolean;
}) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: sample.id,
    disabled: sample.type === null || sample.isUsed,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="select-none"
    >
      <div
        className={cn(
          "relative flex h-12 w-12 cursor-grab items-center justify-center rounded-full font-bold text-white hover:scale-110 hover:ring hover:ring-primary",
          getSampleColor(sample.type),
          isDragging && "cursor-grabbing rounded-sm opacity-90",
          (sample.type === null || sample.isUsed) &&
            "cursor-not-allowed opacity-50",
        )}
      >
        {sample.pos}
        <span className="absolute bottom-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-white text-xs text-black">
          {sample.type ?? "N/A"}
        </span>
      </div>
    </div>
  );
}
