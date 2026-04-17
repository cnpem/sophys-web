"use-client";

import { useCallback, useEffect, useState } from "react";
import { formatDistanceToNowStrict, fromUnixTime } from "date-fns";
import { JsonEditor, monoLightTheme } from "json-edit-react";
import { EllipsisIcon } from "lucide-react";
import { useQueue, useStatus } from "@sophys-web/api-client/hooks";
import { ButtonGroup } from "@sophys-web/ui/button-group";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@sophys-web/ui/hover-card";
import { Item, ItemContent, ItemMedia, ItemTitle } from "@sophys-web/ui/item";
import { Spinner } from "@sophys-web/ui/spinner";
import {
  CancelRunningItemButton,
  EmergencyStopButton,
  PauseAndResumeButton,
} from "@sophys-web/widgets/control-bar/run-engine-controls";

const ONE_SECOND_IN_MS = 1000;

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
    if (reState === "paused") {
      // If paused, show "Paused" instead of elapsed time
      return;
    }
    setElapsedStr(formatDistanceToNowStrict(fromUnixTime(timeStartMs)));
  }, [reState, runningItem]);

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
            {elapsedStr} {reState === "paused" && " (Paused)"}
          </ItemContent>
          <ButtonGroup>
            <PauseAndResumeButton />
            <CancelRunningItemButton />
            <EmergencyStopButton />
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
