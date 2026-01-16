import { JsonEditor, monoLightTheme } from "json-edit-react";
import { Button } from "@sophys-web/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@sophys-web/ui/hover-card";
import type { QueueItemProps } from "../queue-table/types";

/**
 * Component to display item parameters in a cell with hover details
 * @param kwargs - The parameters to display
 * @param preview - Optional list of keys to include in the inline preview
 * @param maxCharacters - Maximum characters for the inline preview (default: 40)
 */
export function ItemParametersCell({
  kwargs,
  preview,
  maxCharacters = 40,
}: {
  maxCharacters?: number;
  kwargs: QueueItemProps["kwargs"];
  preview?: string | string[];
}) {
  if (!kwargs || Object.entries(kwargs).length === 0)
    return <div>{"(No parameters)"}</div>;

  const inlineText = Object.entries(kwargs)
    .filter(([key, value]) => {
      if (typeof value === "object") return false;
      if (preview) return preview.includes(key);
      return true;
    })
    .map(([key, value]) => `${key}:${value}`)
    .join(", ")
    .substring(0, maxCharacters)
    .trim();

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link" className="p-0 whitespace-pre-line">
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
