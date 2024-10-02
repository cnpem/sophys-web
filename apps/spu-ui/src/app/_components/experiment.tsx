"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@sophys-web/ui/button";
import type {
  DragEndEvent,
  DragStartEvent,
  UniqueIdentifier,
} from "@dnd-kit/core";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import { Play, Pause, Trash2, SquareIcon } from "lucide-react";
import { SampleItem } from "./sample";
import type { Sample } from "./sample";
import type { Job } from "./queue";
import { Tray } from "./tray";
import { Queue } from "./queue";

export default function Experiment() {
  const rows = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
  const columns = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const [tray1] = useState<Sample[]>(
    columns.flatMap((column) =>
      rows.map((row) => ({
        id: `${column}${row}`,
        type: ["A", "B", null][Math.floor(Math.random() * 3)] as Sample["type"],
      })),
    ),
  );
  const [tray2] = useState<Sample[]>(
    columns.flatMap((column) =>
      rows.map((row) => ({
        id: `${row}${column}`,
        type: ["A", "B", "C", "D", null][
          Math.floor(Math.random() * 5)
        ] as Sample["type"],
      })),
    ),
  );
  const [samples] = useState<Sample[]>([...tray1, ...tray2]);
  const [queue, setQueue] = useState<Job[]>([]);
  const [nextJobId, setNextJobId] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  const addToQueue = useCallback(
    (sampleIds: UniqueIdentifier[]) => {
      setQueue((prevQueue) => {
        const newJobs = sampleIds
          .map((sampleId, index) => {
            const sample = samples.find((s) => s.id === sampleId);
            if (sample) {
              return {
                id: nextJobId + index,
                sampleId,
                status: "enqueued" as const,
                progress: 0,
              };
            }
            return null;
          })
          .filter((job) => job !== null);

        setNextJobId((prevId) => prevId + newJobs.length);

        return [...prevQueue, ...newJobs];
      });
    },
    [samples, nextJobId],
  );
  const removeFromQueue = (jobId: UniqueIdentifier) => {
    setQueue((prevQueue) => prevQueue.filter((job) => job.id !== jobId));
  };

  const cancelJob = (jobId: UniqueIdentifier) => {
    setQueue((prevQueue) =>
      prevQueue.map((job) =>
        job.id === jobId ? { ...job, status: "cancelled" } : job,
      ),
    );
  };

  const stopQueue = () => {
    setIsProcessing(false);
    setQueue((prevQueue) =>
      prevQueue.map((job) =>
        job.status === "enqueued" || job.status === "running"
          ? { ...job, status: "cancelled" }
          : job,
      ),
    );
  };

  const clearQueue = () => {
    setQueue([]);
  };

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isProcessing) {
      timer = setInterval(() => {
        setQueue((prevQueue) => {
          const updatedQueue = [...prevQueue];
          const runningJobIndex = updatedQueue.findIndex(
            (job) => job.status === "running",
          );

          if (runningJobIndex !== -1) {
            const runningJob = updatedQueue[runningJobIndex];
            if (runningJob.progress < 100) {
              runningJob.progress += 10;
              if (runningJob.progress >= 100) {
                runningJob.status = "done";
                runningJob.progress = 100;
                const nextJob = updatedQueue.find(
                  (job) => job.status === "enqueued",
                );
                if (nextJob) {
                  nextJob.status = "running";
                  nextJob.progress = 0;
                }
              }
            }
          } else {
            const nextJob = updatedQueue.find(
              (job) => job.status === "enqueued",
            );
            if (nextJob) {
              nextJob.status = "running";
              nextJob.progress = 0;
            } else {
              setIsProcessing(false);
            }
          }

          return updatedQueue;
        });
      }, 1000);
    }

    return () => {
      clearInterval(timer);
    };
  }, [isProcessing]);
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { over } = event;

    if (over && over.id === "queue-dropzone") {
      addToQueue([activeId ?? 0]);
    }

    setActiveId(null);
  };
  return (
    <DndContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
      <div className="mx-auto flex items-center justify-center gap-4">
        <div className="flex flex-col gap-2">
          <Tray
            activeId={activeId}
            addToQueue={addToQueue}
            columns={columns}
            rows={rows}
            samples={tray1}
          />
          {/* <Tray activeId={activeId} addToQueue={addToQueue} columns={columns} rows={rows} samples={tray2} /> */}
        </div>
        <div className="flex h-screen w-2/3 flex-col space-y-4 p-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">Experiment Queue</h1>
            <div className="flex items-center justify-center space-x-2">
              <Button
                onClick={() => {
                  setIsProcessing(!isProcessing);
                }}
                variant={isProcessing ? "destructive" : "default"}
              >
                {isProcessing ? (
                  <Pause className="mr-2 h-4 w-4" />
                ) : (
                  <Play className="mr-2 h-4 w-4" />
                )}
                {isProcessing ? "Pause Queue" : "Start Queue"}
              </Button>
              <Button
                disabled={!(queue.length > 0 && isProcessing)}
                onClick={stopQueue}
                variant="destructive"
              >
                <SquareIcon className="mr-2 h-4 w-4" />
                Stop Queue
              </Button>
              <Button onClick={clearQueue} variant="outline">
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Queue
              </Button>
            </div>
            <Queue
              cancelJob={cancelJob}
              isProcessing={isProcessing}
              queue={queue}
              removeFromQueue={removeFromQueue}
              samples={samples}
              toggleProcessing={setIsProcessing}
              updateQueue={setQueue}
            />
          </div>
        </div>
      </div>
      <DragOverlay>
        {activeId ? (
          <SampleItem
            isDragging
            sample={
              samples.find((s) => s.id === activeId) ?? {
                id: activeId,
                type: null,
              }
            }
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
