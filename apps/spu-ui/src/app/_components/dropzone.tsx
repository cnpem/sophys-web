"use client";

import { useDroppable } from "@dnd-kit/core";
import { ArrowBigDownDashIcon } from "lucide-react";
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
        "border-muted relative flex w-fit items-center justify-center rounded-lg border-2 border-dashed p-2",
        isOver && "border-rose-600 bg-rose-600/10",
      )}
      ref={setNodeRef}
    >
      {props.children}
      {isOver ? (
        <div className="absolute animate-bounce rounded-full bg-rose-600/20 p-2 shadow-md">
          <ArrowBigDownDashIcon className="h-6 w-6 text-rose-800" />
        </div>
      ) : null}
    </div>
  );
}
