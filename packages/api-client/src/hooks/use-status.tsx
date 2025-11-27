"use client";

import { useEffect, useRef } from "react";
import { api } from "@sophys-web/api-client/react";

export const useStatus = () => {
  const utils = api.useUtils();
  const prevQueueUid = useRef<string | undefined>(undefined);
  const prevHistoryUid = useRef<string | undefined>(undefined);

  const status = api.status.get.useQuery(undefined, {
    refetchInterval: 2 * 1000,
    refetchOnWindowFocus: "always",
    refetchOnMount: "always",
  });

  const envUpdate = api.environment.update.useMutation({
    onSuccess: async () => {
      await utils.status.get.invalidate();
    },
  });

  const envOpen = api.environment.open.useMutation({
    onSuccess: async () => {
      await utils.status.get.invalidate();
    },
  });

  const envClose = api.environment.close.useMutation({
    onSuccess: async () => {
      await utils.status.get.invalidate();
    },
  });

  useEffect(() => {
    if (status.data) {
      const { planQueueUid, planHistoryUid } = status.data;

      if (planQueueUid !== prevQueueUid.current) {
        prevQueueUid.current = planQueueUid;
        void utils.queue.get.invalidate();
      }

      if (planHistoryUid !== prevHistoryUid.current) {
        prevHistoryUid.current = planHistoryUid;
        void utils.history.get.invalidate();
      }
    }
  }, [status.data, utils.history.get, utils.queue.get]);

  return { status, envUpdate, envOpen, envClose };
};
