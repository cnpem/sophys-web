"use client";

import { useEffect, useRef } from "react";
import {
  DownloadIcon,
  RotateCcwIcon,
  SquareTerminalIcon,
  Trash2Icon,
} from "lucide-react";
import { api } from "@sophys-web/api-client/react";
import { cn } from "@sophys-web/ui";
import { Button } from "@sophys-web/ui/button";
import { ScrollArea } from "@sophys-web/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@sophys-web/ui/tooltip";

export function Console() {
  const { data: messages, refetch } = api.consoleOutput.stream.useQuery();
  const utils = api.useUtils();
  const ref = useRef<HTMLDivElement>(null);
  const handleExport = () => {
    const exportData = JSON.stringify(messages, null, 2);
    const blob = new Blob([exportData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "console_output.json";
    a.click();
  };

  useEffect(() => {
    if (ref.current) {
      const scrollContainer = ref.current.querySelector(
        "[data-radix-scroll-area-viewport]",
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  return (
    <div className="h-fit w-full overflow-hidden rounded-lg border">
      <TopBar
        onRefetch={refetch}
        onClear={() => utils.consoleOutput.stream.reset()}
        onExport={handleExport}
      />

      <ScrollArea className="h-96 p-2 font-mono" ref={ref}>
        {messages?.map((message, i) => (
          <ConsoleMessage key={i} message={message} />
        ))}
        <span className="text-muted-foreground text-center">
          $<span className="animate-pulse">{" \u2588"}</span>
        </span>
      </ScrollArea>
    </div>
  );
}

interface ParsedLogMessage {
  logLevel: string;
  date: string;
  timestamp: string;
  service: string;
  textMessage: string;
}

function ConsoleMessage({ message }: { message: ParsedLogMessage }) {
  const formattedServiceName = (service: string) => {
    if (service.includes("bluesky_queueserver.manager")) {
      const splitNames = service.split(".");
      return splitNames[splitNames.length - 1] ?? "";
    }
    return service;
  };

  return (
    <div
      data-loglevel={message.logLevel.toUpperCase()}
      className="animate-in slide-in-from-bottom fade-in my-1 flex flex-col rounded-xs border-l-4 p-1 text-sm data-[loglevel=E]:border-l-red-500 data-[loglevel=I]:border-l-sky-500 data-[loglevel=W]:border-l-yellow-500"
    >
      <div className="flex items-center justify-between gap-1">
        <span
          className={cn("text-muted-foreground ml-1 font-normal uppercase", {
            "text-violet-700":
              message.service === "bluesky_queueserver.manager.manager",
            "text-sky-700":
              message.service === "bluesky_queueserver.manager.start_manager",
            "text-teal-700":
              message.service === "bluesky_queueserver.manager.profile_ops",
            "text-lime-700":
              message.service === "bluesky_queueserver.manager.worker",
            "text-pink-700":
              message.service === "bluesky_queueserver.manager.executor",
          })}
        >
          {formattedServiceName(message.service)}
        </span>
        <span className="text-muted-foreground/50 mr-2 text-balance">
          {`${message.date} ${message.timestamp}`}
        </span>
      </div>
      <span className="text-muted-foreground ml-1 font-normal text-pretty">
        {message.textMessage}
      </span>
    </div>
  );
}

interface TopBarProps {
  onRefetch: () => void;
  onClear: () => void;
  onExport: () => void;
}
function TopBar(props: TopBarProps) {
  const { onRefetch, onClear, onExport } = props;
  return (
    <div className="bg-muted text-muted-foreground relative flex items-center gap-2 border-b p-2 text-sm font-normal">
      <SquareTerminalIcon className="size-4" />
      Console
      <div className="absolute end-1 flex space-x-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onRefetch}
                className="size-8"
                variant="outline"
                size="icon"
              >
                <RotateCcwIcon className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="size-8"
                variant="outline"
                size="icon"
                onClick={onExport}
              >
                <DownloadIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Download</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onClear}
                className="size-8"
                variant="outline"
                size="icon"
              >
                <Trash2Icon className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Clear</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
