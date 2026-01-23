"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";
import { useQueue } from "@sophys-web/api-client/hooks";
import { Button } from "@sophys-web/ui/button";
import type { QueueItemProps } from "../lib/types";

export function CopyButton(props: QueueItemProps) {
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
          toast.success("Copied to queue");
        },
        onError: () => {
          toast.error("Failed to copy to queue");
        },
      },
    );
  };

  return (
    <Button variant="ghost" size="sm" onClick={rerun}>
      <Copy className="size-4" />
    </Button>
  );
}
