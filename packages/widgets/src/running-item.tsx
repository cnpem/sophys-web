"use-client";

import { useCallback, useEffect, useState } from "react";
import { formatDistanceToNowStrict, fromUnixTime } from "date-fns";
import { JsonEditor, monoLightTheme } from "json-edit-react";
import { EllipsisIcon } from "lucide-react";
import { useQueue } from "@sophys-web/api-client/hooks";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@sophys-web/ui/hover-card";
import { Item, ItemContent, ItemMedia, ItemTitle } from "@sophys-web/ui/item";
import { Spinner } from "@sophys-web/ui/spinner";

const ONE_SECOND_IN_MS = 1000;

export function RunningItem() {
  const [elapsedStr, setElapsedStr] = useState<string>("");
  const { queue } = useQueue();
  const runningItem = queue.data?.runningItem;

  const tick = useCallback(() => {
    const timeStartMs = runningItem?.properties?.timeStart;
    if (!timeStartMs) {
      return;
    }
    setElapsedStr(formatDistanceToNowStrict(fromUnixTime(timeStartMs)));
  }, [runningItem]);

  useEffect(() => {
    const timerID = setInterval(() => tick(), 5 * ONE_SECOND_IN_MS);
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
        <Item variant={"outline"} className="text-busy animate-pulse">
          <ItemMedia>
            <Spinner />
          </ItemMedia>
          <ItemTitle className="line-clamp-1">
            {runningItem.name}
            {" - "}
            <span className="text-muted-foreground">{runningItem.user}</span>
          </ItemTitle>
          <ItemContent className="ml-auto flex-none text-center">
            {elapsedStr}
          </ItemContent>
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
