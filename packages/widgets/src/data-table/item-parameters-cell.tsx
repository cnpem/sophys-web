import { JsonEditor, monoLightTheme } from "json-edit-react";
import { Button } from "@sophys-web/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@sophys-web/ui/hover-card";
import type { QueueItemProps } from "../queue-table/types";

export function ItemParametersCell({
  kwargs,
  preview,
  maxColumCharacters = 30,
}: {
  maxColumCharacters?: number;
  kwargs: QueueItemProps["kwargs"];
  preview?: string | string[];
}) {
  if (!kwargs || Object.entries(kwargs).length === 0)
    return <div>{"(No parameters)"}</div>;

  const inlineText = Object.entries(kwargs)
    .filter(([key]) => {
      if (preview) return preview.includes(key);
      else {
        const defaultPreviewKeys = Object.keys(kwargs).slice(0, 3);
        return defaultPreviewKeys.includes(key);
      }
    })
    .map(([key, value]) => `${key}:${value}`)
    .join(", ")
    .substring(0, maxColumCharacters)
    .trim();

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link" className="p-0">
          {inlineText}
          {"..."}
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-fit text-sm opacity-100">
        <p>Parameters</p>
        <JsonEditor
          restrictAdd={true}
          restrictDelete={true}
          restrictEdit={true}
          restrictDrag={true}
          data={kwargs}
          rootName={"kwargs"}
          theme={monoLightTheme}
          rootFontSize={14}
        />
      </HoverCardContent>
    </HoverCard>
  );
}
