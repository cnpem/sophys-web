"use client";

import { useDroppable } from "@dnd-kit/core";
import { cn } from "@sophys-web/ui";

interface DropzoneProps {
  children: React.ReactNode;
  id: string;
}

export function Dropzone(props: DropzoneProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: props.id,
  });

  return (
    <div
      className={cn(
        "relative flex h-fit w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-4 font-medium",
        isOver && "border-purple-600 bg-purple-600/10",
      )}
      ref={setNodeRef}
    >
      {props.children}
      <p className="absolute -bottom-8 mt-2 text-center text-sm text-gray-500">
        {isOver ? "Drop here" : "Drag and drop here"}
      </p>
    </div>
  );
}
