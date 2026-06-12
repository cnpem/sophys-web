"use-client";

import { useCallback, useEffect, useState } from "react";
import { formatDistanceToNowStrict, fromUnixTime } from "date-fns";
import { JsonEditor, monoLightTheme } from "json-edit-react";
import { EllipsisIcon, PauseIcon } from "lucide-react";
import { toast } from "sonner";
import type { ButtonProps } from "@sophys-web/ui/button";
import { useQueue, useStatus } from "@sophys-web/api-client/hooks";
import { api } from "@sophys-web/api-client/react";
import { cn } from "@sophys-web/ui";
import { Button } from "@sophys-web/ui/button";
import { ButtonGroup } from "@sophys-web/ui/button-group";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@sophys-web/ui/hover-card";
import { Item, ItemContent, ItemMedia, ItemTitle } from "@sophys-web/ui/item";
import { Spinner } from "@sophys-web/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@sophys-web/ui/tooltip";
import {
  CancelRunningItemButton,
  ResumeButton,
} from "@sophys-web/widgets/control-bar/run-engine-controls";

const ONE_SECOND_IN_MS = 1000;

function PauseImmediateButton({
  className,
  variant = "outline",
}: {
  className?: string;
  variant?: ButtonProps["variant"];
}) {
  const { status } = useStatus();
  const utils = api.useUtils();
  const pause = api.httpserver.runEngine.pause.useMutation({
    onSettled: async () => {
      await utils.httpserver.status.get.invalidate();
    },
  });

  const onClick = useCallback(() => {
    toast.info("Pausing run engine immediately...");
    pause.mutate(
      { option: "immediate" },
      {
        onError: () => {
          toast.error("Failed to pause run engine");
        },
      },
    );
  }, [pause]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          className={cn(
            "text-destructive h-8 w-12 gap-0 rounded-full duration-300 ease-in-out",
            status.data?.pausePending && "animate-pulse",
            className,
          )}
          variant={variant}
          onClick={onClick}
        >
          <PauseIcon className="size-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">Pause Now</TooltipContent>
    </Tooltip>
  );
}

function PauseAndResumeButton({
  className,
  variant = "outline",
}: {
  className?: string;
  variant?: ButtonProps["variant"];
}) {
  const { status } = useStatus();
  const reState = status.data?.reState ?? "unknown";

  if (reState === "paused") {
    return <ResumeButton className={className} variant={variant} />;
  }

  return <PauseImmediateButton className={className} variant={variant} />;
}

export function CustomRunningItem() {
  const [elapsedStr, setElapsedStr] = useState<string>("");
  const { queue } = useQueue();
  const runningItem = queue.data?.runningItem;
  const { status } = useStatus();
  const reState = status.data?.reState ?? "unknown";

  const tick = useCallback(() => {
    if (!runningItem) {
      // Reset elapsed time if no running item
      setElapsedStr("");
      return;
    }
    const timeStartMs = runningItem.properties?.timeStart;
    if (!timeStartMs) {
      // If no start time, reset elapsed time
      setElapsedStr("");
      return;
    }
    setElapsedStr(formatDistanceToNowStrict(fromUnixTime(timeStartMs)));
  }, [runningItem]);

  useEffect(() => {
    // Initial tick on mount or when runningItem changes
    tick();
  }, [runningItem, tick]);

  useEffect(() => {
    // Set up interval to update elapsed time every second
    const timerID = setInterval(() => tick(), ONE_SECOND_IN_MS);
    return () => clearInterval(timerID);
  }, [tick]);

  if (!runningItem)
    return (
      <Item variant={"outline"} className="text-muted-foreground">
        <ItemMedia>
          <EllipsisIcon className="size-4" />
        </ItemMedia>
        <ItemTitle className="line-clamp-1">
          No task currently running
        </ItemTitle>
      </Item>
    );

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Item variant={"outline"} className="text-busy">
          <ItemMedia>
            <Spinner />
          </ItemMedia>
          <ItemTitle className="line-clamp-1">
            {runningItem.name}
            {" - "}
            <span className="text-muted-foreground">{runningItem.user}</span>
          </ItemTitle>
          <ItemContent className="ml-auto flex-none text-center">
            {elapsedStr} {reState === "paused" && "(Paused)"}
          </ItemContent>
          <ButtonGroup>
            <PauseAndResumeButton />
            <CancelRunningItemButton />
          </ButtonGroup>
        </Item>
      </HoverCardTrigger>
      <HoverCardContent className="w-fit text-sm opacity-100">
        <p>Parameters</p>
        <JsonEditor
          restrictAdd={true}
          restrictDelete={true}
          restrictEdit={true}
          restrictDrag={true}
          data={runningItem.kwargs}
          rootName={"kwargs"}
          theme={monoLightTheme}
          rootFontSize={14}
        />
      </HoverCardContent>
    </HoverCard>
  );
}
