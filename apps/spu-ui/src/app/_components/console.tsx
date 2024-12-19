"use client";

import { useEffect, useRef } from "react";
import { DownloadIcon, RotateCcwIcon, Trash2Icon } from "lucide-react";
import { cn } from "@sophys-web/ui";
import { Button } from "@sophys-web/ui/button";
import { ScrollArea } from "@sophys-web/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@sophys-web/ui/tooltip";
import { api } from "../../trpc/react";

export function Console({ className }: { className?: string }) {
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
    <div
      className={cn(
        "mx-auto w-full max-w-3xl overflow-hidden rounded-lg border bg-white",
        className,
      )}
    >
      <TopBar
        onRefetch={refetch}
        onClear={() => utils.consoleOutput.stream.reset()}
        onExport={handleExport}
      />

      <ScrollArea className="h-[220px] w-full p-2 font-mono text-sm" ref={ref}>
        {(!messages || messages.length === 0) && (
          <span className="text-muted-foreground">
            Waiting for new messages...
          </span>
        )}
        {messages?.map((message, i) => (
          <ConsoleMessage key={i} message={message} />
        ))}
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
      return splitNames[splitNames.length - 1]?.toUpperCase() ?? "";
    }
    return service.toUpperCase();
  };

  return (
    <div className="my-1">
      <span className="mr-2 text-slate-400">
        [{message.logLevel.toUpperCase()}] {message.date} {message.timestamp}
      </span>
      <span
        className={cn("mr-2", "font-semibold text-muted-foreground", {
          "text-purple-600":
            message.service === "bluesky_queueserver.manager.manager",
          "text-blue-600":
            message.service === "bluesky_queueserver.manager.start_manager",
          "text-cyan-600":
            message.service === "bluesky_queueserver.manager.profile_ops",
          "text-green-600":
            message.service === "bluesky_queueserver.manager.worker",
          "text-rose-600":
            message.service === "bluesky_queueserver.manager.executor",
        })}
      >
        {formattedServiceName(message.service)}
      </span>
      <span className="text-muted-foreground">{message.textMessage}</span>
    </div>
  );
}

interface TopBarProps {
  onRefetch: () => void;
  onClear: () => void;
  onExport: () => void;
}

export function TopBar(props: TopBarProps) {
  const { onRefetch, onClear, onExport } = props;
  return (
    <div className="flex items-center justify-end border-b border-slate-300 bg-slate-100 p-2">
      <div className="flex space-x-2">
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
