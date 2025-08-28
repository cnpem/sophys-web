"use client";

import { RotateCcwIcon } from "lucide-react";
import { toast } from "sonner";
import { useQueue } from "@sophys-web/api-client/hooks";
import { api } from "@sophys-web/api-client/react";
import { Button } from "@sophys-web/ui/button";
import type { HistoryItemProps } from "~/lib/types";

export function RerunButton(props: HistoryItemProps) {
  const { data: userData } = api.auth.getUser.useQuery();
  const { add } = useQueue();
  const { name, itemType, kwargs } = props;

  if (!kwargs) {
    return null;
  }

  // replace proposal in kwargs with the current user's proposal if the field exists
  const updatedKwargs = { ...kwargs };
  if ("proposal" in updatedKwargs && userData?.proposal) {
    updatedKwargs.proposal = userData.proposal;
  }

  const rerun = () => {
    add.mutate(
      {
        item: {
          name,
          kwargs: updatedKwargs,
          args: [],
          itemType,
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
