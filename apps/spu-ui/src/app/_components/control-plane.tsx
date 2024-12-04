"use client";

import { QueueControls } from "./queue";
import { RunEngineControls } from "./run-engine-controls";

export function ControlPlane() {
  return (
    <div className="mx-auto flex w-fit items-center justify-center gap-2 rounded-md border bg-white p-2 shadow-md">
      <QueueControls />
      <RunEngineControls />
    </div>
  );
}
