"use client";

import { api } from "../../trpc/react";

export const useStatus = () => {
  const utils = api.useUtils();

  const status = api.status.get.useQuery(undefined, {
    refetchInterval: 4000,
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

  return { status, envUpdate, envOpen };
};
