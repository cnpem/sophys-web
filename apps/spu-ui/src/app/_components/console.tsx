"use client";

import { useEffect, useRef } from "react";
import { cn } from "@sophys-web/ui";
import { api } from "../../trpc/react";

export function Console() {
  const { data: messages } = api.consoleOutput.stream.useQuery();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      className="h-52 overflow-y-auto rounded-lg bg-slate-900 p-4 pr-8 font-mono text-sm text-slate-300"
      ref={ref}
    >
      {(!messages || messages.length === 0) && (
        <div>Waiting for new messages...</div>
      )}
      {messages?.map((message) => (
        <ConsoleMessage key={message.id} message={message} />
      ))}
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
      return splitNames[splitNames.length - 1].toUpperCase();
    }
    return service.toUpperCase();
  };

  return (
    <div className="mb-2">
      <span className="mr-2 text-gray-500">
        [{message.logLevel.toUpperCase()}] {message.date} {message.timestamp}
      </span>
      <span
        className={cn("mr-2", "text-gray-300", {
          "text-purple-400":
            message.service === "bluesky_queueserver.manager.manager",
          "text-blue-400":
            message.service === "bluesky_queueserver.manager.start_manager",
          "text-cyan-400":
            message.service === "bluesky_queueserver.manager.profile_ops",
          "text-green-400":
            message.service === "bluesky_queueserver.manager.worker",
          "text-rose-400":
            message.service === "bluesky_queueserver.manager.executor",
        })}
      >
        {formattedServiceName(message.service)}
      </span>
      <span>{message.textMessage}</span>
    </div>
  );
}
