"use client";

import { QueueControls } from "./queue/queue";
import { UploadQueue } from "./queue/upload";
import { RunEngineControls } from "./run-engine-controls";

export function ControlPlane() {
  return (
    <div className="mx-auto flex w-fit items-center justify-center gap-2 rounded-md border bg-white p-2 shadow-md">
      <UploadQueue />
      <span className="h-8 border-r border-gray-300" />
      <QueueControls />
      <RunEngineControls />
    </div>
  );
}
