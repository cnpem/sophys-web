"use client";

import { RotateCcwIcon } from "lucide-react";
import { toast } from "sonner";
import { useQueue } from "@sophys-web/api-client/hooks";
import { Button } from "@sophys-web/ui/button";
import type { HistoryItemProps } from "./types";

export function RerunButton(props: HistoryItemProps) {
  const { add } = useQueue();
  const { kwargs } = props;

  if (!kwargs) {
    return null;
  }
  const rerun = () => {
    add.mutate(
      {
        item: {
          name: props.name,
          kwargs,
          args: [],
          itemType: props.itemType,
        },
      },
      {
        onSuccess: () => {
          toast.success("Added to queue");
        },
        onError: () => {
          toast.error("Failed to add to queue");
        },
      },
    );
  };

  return (
    <Button variant="ghost" size="sm" onClick={rerun}>
      <RotateCcwIcon className="size-4" />
      Rerun
    </Button>
  );
}
