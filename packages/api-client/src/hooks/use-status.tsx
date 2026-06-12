"use client";

import { useEffect, useRef } from "react";
import { api } from "@sophys-web/api-client/react";

export const useStatus = () => {
  const utils = api.useUtils();
  const prevQueueUid = useRef<string | undefined>(undefined);
  const prevHistoryUid = useRef<string | undefined>(undefined);

  const status = api.httpserver.status.get.useQuery(undefined, {
    refetchInterval: 2 * 1000,
    refetchOnWindowFocus: "always",
    refetchOnMount: "always",
  });

  const envUpdate = api.httpserver.environment.update.useMutation({
    onSuccess: async () => {
      await utils.httpserver.status.get.invalidate();
    },
  });

  const envOpen = api.httpserver.environment.open.useMutation({
    onSuccess: async () => {
      await utils.httpserver.status.get.invalidate();
    },
  });

  const envClose = api.httpserver.environment.close.useMutation({
    onSuccess: async () => {
      await utils.httpserver.status.get.invalidate();
    },
  });

  const envDestroy = api.httpserver.environment.destroy.useMutation({
    onSuccess: async () => {
      await utils.httpserver.status.get.invalidate();
    },
  });

  useEffect(() => {
    if (status.data) {
      const { planQueueUid, planHistoryUid } = status.data;

      if (planQueueUid !== prevQueueUid.current) {
        prevQueueUid.current = planQueueUid;
        void utils.httpserver.queue.get.invalidate();
      }

      if (planHistoryUid !== prevHistoryUid.current) {
        prevHistoryUid.current = planHistoryUid;
        void utils.httpserver.history.get.invalidate();
      }
    }
  }, [status.data, utils.httpserver.history.get, utils.httpserver.queue.get]);

  return { status, envUpdate, envOpen, envClose, envDestroy };
};
