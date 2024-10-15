"use client";

import type {
  DragEndEvent,
  DragStartEvent,
  UniqueIdentifier,
} from "@dnd-kit/core";
import { useCallback, useEffect, useRef, useState } from "react";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import { Pause, Play, SquareIcon, Trash2, UploadIcon } from "lucide-react";
import { Button } from "@sophys-web/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@sophys-web/ui/tabs";
import type { SampleParams } from "../../lib/schemas/sample";
import type { Job } from "./queue";
import type { Sample } from "./sample";
import { Queue } from "./queue";
import { SampleItem } from "./sample";
import { Tray } from "./tray";
import { UploadButton } from "./upload-button";

export default function Experiment() {
  const rows = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10"];
  const columns = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const emptyTray1 = useRef(() =>
    rows.flatMap((row) =>
      columns.map((column) => ({
        id: `T1-${column}${row}`,
        position: `T1-${column}${row}`,
        relative_position: `${column}${row}`,
        type: null,
      })),
    ),
  );

  const emptyTray2 = useRef(() =>
    rows.flatMap((row) =>
      columns.map((column) => ({
        id: `T2-${column}${row}`,
        position: `T2-${column}${row}`,
        relative_position: `${column}${row}`,
        type: null,
      })),
    ),
  );
  const [samples, setSamples] = useState<Sample[]>([
    ...emptyTray1.current(),
    ...emptyTray2.current(),
  ]);
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
              setSamples((prevSamples) =>
                prevSamples.map((s) =>
                  s.id === sampleId ? { ...s, isUsed: true } : s,
                ),
              );
              return {
                id: nextJobId + index,
                sampleId,
                status: "enqueued" as const,
                progress: 0,
              };
            }
            return null;
          })
          .filter((job) => job !== null) as Job[];

        setNextJobId((prevId) => prevId + newJobs.length);

        return [...prevQueue, ...newJobs];
      });
    },
    [samples, nextJobId],
  );
  const removeFromQueue = (jobId: UniqueIdentifier) => {
    setQueue((prevQueue) => prevQueue.filter((job) => job.id !== jobId));
    setSamples((prevSamples) =>
      prevSamples.map((s) =>
        s.id === queue.find((job) => job.id === jobId)?.sampleId
          ? { ...s, isUsed: false }
          : s,
      ),
    );
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
    setSamples((prevSamples) =>
      prevSamples.map((s) => (s.isUsed ? { ...s, isUsed: false } : s)),
    );
  };

  const clearSamples = () => {
    setSamples([...emptyTray1.current(), ...emptyTray2.current()]);
  };

  const uploadSamples = (data: SampleParams[]) => {
    const prevSamples = samples;
    const newSamples = data.map(
      (sample) =>
        ({
          id: `${sample.position}`,
          relative_position: sample.position.split("-")[1],
          type: sample.buffer === "empty" ? "S" : "B",
          ...sample,
        }) as Sample,
    );
    // replace existing samples with new samples if they exist
    const updatedSamples = prevSamples.map((prevSample) => {
      const newSample = newSamples.find(
        (sample) => sample.id === prevSample.id,
      );
      return newSample ?? prevSample;
    });
    setSamples(updatedSamples);
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
        <Tabs defaultValue="tray1">
          <div className="flex items-center gap-2">
            <TabsList>
              <TabsTrigger value="tray1">Tray 1</TabsTrigger>
              <TabsTrigger value="tray2">Tray 2</TabsTrigger>
            </TabsList>
            <UploadButton handleUpload={uploadSamples}>
              <UploadIcon className="mr-2 h-4 w-4" />
              Upload Samples
            </UploadButton>
            <Button onClick={clearSamples} variant="link">
              <Trash2 className="mr-2 h-4 w-4" />
              Clear Samples
            </Button>
          </div>
          <TabsContent value="tray1">
            <Tray
              activeId={activeId}
              addToQueue={addToQueue}
              columns={columns}
              rows={rows}
              samples={samples.filter(
                (sample) => sample.position?.split("-")[0] === "T1",
              )}
            />
          </TabsContent>
          <TabsContent value="tray2">
            <Tray
              activeId={activeId}
              addToQueue={addToQueue}
              columns={columns}
              rows={rows}
              samples={samples.filter(
                (sample) => sample.position?.split("-")[0] === "T2",
              )}
            />
          </TabsContent>
        </Tabs>
        <div className="flex w-2/3 flex-col space-y-4 p-4">
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
                relative_position: "",
                type: null,
              }
            }
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
