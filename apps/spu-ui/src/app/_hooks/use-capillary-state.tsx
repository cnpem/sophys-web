import { useEffect, useState } from "react";
import { api } from "@sophys-web/api-client/react";
import type {
  sampleTypeOptions,
  trayColumns,
  trayOptions,
  trayRows,
} from "../../lib/constants";
import { name as cleanAndCheckPlan } from "../../lib/schemas/plans/clean-and-acquire";
import { name as completeAcquisitionWithCleaningPlan } from "../../lib/schemas/plans/complete-acquisition";
import {
  schema as loadSampleKwargs,
  name as loadSamplePlan,
} from "../../lib/schemas/plans/load";
import { name as singleCleaningPlan } from "../../lib/schemas/plans/single-cleaning";

const STALE_TIME_IN_SECONDS = 15 * 60; // 15 minutes

const knownErrorExitStatuses = [
  "error",
  "canceled",
  "aborted",
  "failed",
  "exception",
  "timeout",
] as const;

const cleaningPlans = [
  completeAcquisitionWithCleaningPlan,
  cleanAndCheckPlan,
  singleCleaningPlan,
];

export interface LastSampleParams {
  sampleTag: string;
  bufferTag: string;
  sampleType: (typeof sampleTypeOptions)[number];
  row: (typeof trayRows)[number];
  col: (typeof trayColumns)[number];
  tray: (typeof trayOptions)[number];
}

type CapillaryState = "sample" | "stale" | "clean" | "error" | "unknown";

function capillaryStateFromTimes({
  lastSampleTime,
  lastCleaningTime,
  lastErrorTime,
}: {
  lastSampleTime: number | undefined;
  lastCleaningTime: number | undefined;
  lastErrorTime: number | undefined;
}): CapillaryState {
  const timesToStates: [number | undefined, CapillaryState][] = [
    [lastSampleTime, "sample"],
    [lastCleaningTime, "clean"],
    [lastErrorTime, "error"],
  ];
  // Determine the most recent valid time and its state
  const mostRecentState = timesToStates
    .filter(([time]) => time !== undefined)
    .sort(([timeA], [timeB]) => (timeB ?? 0) - (timeA ?? 0))
    .map(([, state]) => state)[0];
  return mostRecentState ?? "stale"; // Default to "stale" if no valid times
}

export const useCapillaryState = () => {
  const { data } = api.history.get.useQuery(undefined, {
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
    refetchInterval: 10 * 1000,
  });
  const [loadedSample, setLoadedSample] = useState<
    LastSampleParams | undefined
  >(undefined);
  const [capillaryState, setCapillaryState] =
    useState<CapillaryState>("unknown");
  // search history for last sample and last cleaning time and store them in state
  useEffect(() => {
    if (!data?.items) {
      return;
    }
    // filter history items that happened before the stale time and sort them from most recent to least recent
    const nowInSeconds = Date.now() / 1000;
    const sortedRecentHistoryItems = data.items
      .filter(
        (item) => nowInSeconds - item.result.timeStop < STALE_TIME_IN_SECONDS,
      )
      .sort((a, b) => b.result.timeStop - a.result.timeStop);
    const lastErrorTime = sortedRecentHistoryItems.find((item) => {
      if (item.result.traceback) {
        return true;
      }
      if (item.result.exitStatus) {
        return knownErrorExitStatuses.includes(
          item.result.exitStatus as (typeof knownErrorExitStatuses)[number],
        );
      }
    })?.result.timeStop;
    // filter recent history items to only include non-error results
    const nonErrorRecentItems = sortedRecentHistoryItems.filter((item) => {
      if (item.result.traceback) {
        return false;
      }
      if (item.result.exitStatus) {
        return !knownErrorExitStatuses.includes(
          item.result.exitStatus as (typeof knownErrorExitStatuses)[number],
        );
      }
      return true;
    });
    // find the last sample and last cleaning time
    const lastSample = nonErrorRecentItems.find(
      (item) => item.name === loadSamplePlan,
    );
    const lastSampleTime = lastSample?.result.timeStop;
    const lastCleaning = nonErrorRecentItems.find((item) =>
      cleaningPlans.includes(item.name),
    );
    const lastCleaningTime = lastCleaning?.result.timeStop;
    // set capillary state based on lastSampleTime, lastCleaningTime, and lastErrorTime
    const capillaryState = capillaryStateFromTimes({
      lastSampleTime,
      lastCleaningTime,
      lastErrorTime,
    });
    setCapillaryState(capillaryState);
    if (capillaryState === "sample") {
      const parsedKwargs = loadSampleKwargs.safeParse(lastSample?.kwargs);
      if (!parsedKwargs.success) {
        throw new Error("Failed to parse load sample kwargs");
      }
      if (!parsedKwargs.data.metadata) {
        throw new Error("Failed to parse metadata from load sample kwargs");
      }
      setLoadedSample({
        sampleTag: parsedKwargs.data.metadata.sampleTag,
        bufferTag: parsedKwargs.data.metadata.bufferTag,
        sampleType: parsedKwargs.data.metadata.sampleType,
        row: parsedKwargs.data.row,
        col: parsedKwargs.data.col,
        tray: parsedKwargs.data.tray,
      });
    } else {
      setLoadedSample(undefined);
    }
  }, [data]);

  return {
    capillaryState,
    loadedSample,
  };
};
