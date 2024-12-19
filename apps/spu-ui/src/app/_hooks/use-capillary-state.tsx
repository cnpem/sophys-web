import { useEffect, useState } from "react";
import type {
  sampleTypeOptions,
  trayColumns,
  trayOptions,
  trayRows,
} from "../../lib/constants";
import type { HistoryItemProps } from "../../lib/types";
import { name as cleanAndCheckPlan } from "../../lib/schemas/plans/clean-and-acquire";
import { name as completeAcquisitionWithCleaningPlan } from "../../lib/schemas/plans/complete-acquisition";
import {
  schema as loadSampleKwargs,
  name as loadSamplePlan,
} from "../../lib/schemas/plans/load";
import { name as basicCleaningPlan } from "../../lib/schemas/plans/single-cleaning";
import { api } from "../../trpc/react";

const STALE_TIME_IN_SECONDS = 15 * 60; // 15 minutes

const cleanVerifiedPlans = [
  completeAcquisitionWithCleaningPlan,
  cleanAndCheckPlan,
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

export const useCapillaryState = () => {
  const { data } = api.history.get.useQuery(undefined, {
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
    refetchInterval: 10 * 1000,
  });
  const [lastItem, setLastItem] = useState<HistoryItemProps | undefined>(
    undefined,
  );
  const [loadedSample, setLoadedSample] = useState<
    LastSampleParams | undefined
  >(undefined);
  const [capillaryState, setCapillaryState] =
    useState<CapillaryState>("unknown");

  useEffect(() => {
    if (!data?.items) {
      return;
    }
    // last item can be found sorting by result.timeStop
    const lastItem = data.items.sort(
      (a, b) => b.result.timeStop - a.result.timeStop,
    )[0];
    setLastItem(lastItem);
    if (lastItem?.name === loadSamplePlan) {
      const { data: kwargs, success } = loadSampleKwargs.safeParse(
        lastItem.kwargs,
      );
      if (!success) {
        console.error("Failed to parse load sample kwargs", lastItem.kwargs);
        setLoadedSample(undefined);
        return;
      }
      if (kwargs.metadata === undefined) {
        console.error("Failed to parse load sample metadata", lastItem.kwargs);
        setLoadedSample(undefined);
        return;
      }
      setLoadedSample({
        row: kwargs.row,
        col: kwargs.col,
        tray: kwargs.tray,
        sampleType: kwargs.metadata.sampleType,
        sampleTag: kwargs.metadata.sampleTag,
        bufferTag: kwargs.metadata.bufferTag,
      });
    } else {
      setLoadedSample(undefined);
    }
  }, [data]);

  useEffect(() => {
    if (!lastItem) {
      return;
    }
    const nowInSeconds = Date.now() / 1000;
    const lastItemStopTimeInSeconds = lastItem.result.timeStop;
    if (nowInSeconds - lastItemStopTimeInSeconds > STALE_TIME_IN_SECONDS) {
      if (lastItem.result.traceback) {
        setCapillaryState("error");
      } else {
        setCapillaryState("stale");
      }
      return;
    }
    if (cleanVerifiedPlans.includes(lastItem.name)) {
      if (lastItem.result.traceback) {
        setCapillaryState("error");
      } else {
        setCapillaryState("clean");
      }
      return;
    }
    if (lastItem.name === loadSamplePlan) {
      if (lastItem.result.traceback) {
        setCapillaryState("error");
      } else {
        setCapillaryState("sample");
      }
      return;
    }
    if (lastItem.name === basicCleaningPlan) {
      if (lastItem.result.traceback) {
        setCapillaryState("error");
      } else {
        setCapillaryState("clean");
      }
      return;
    }
    setCapillaryState("unknown");
  }, [lastItem]);

  return {
    capillaryState,
    loadedSample,
  };
};
