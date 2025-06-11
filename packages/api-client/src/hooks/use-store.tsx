"use client";

import type { z } from "zod";
import { useEffect, useState } from "react";
import { api } from "../react";

export function useStore<T extends z.ZodTypeAny>(storeSchema: T) {
  const utils = api.useUtils();
  const [store, setStore] = useState<z.infer<T> | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isParsingError, setIsParsingError] = useState(false);

  const {
    data,
    isLoading,
    isError: isQueryError,
  } = api.store.hGetAll.useQuery(undefined, {
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: true,
  });

  useEffect(() => {
    if (data) {
      setIsParsing(true);
      try {
        const parsed = storeSchema.safeParse(data);
        if (parsed.success) {
          setStore(parsed.data as z.infer<T>);
        } else {
          console.error("Store data does not match schema:", parsed.error);
          setStore(null);
          setIsParsingError(true);
        }
      } catch (error) {
        console.error("Error parsing store data:", error);
        setStore(null);
        setIsParsingError(true);
      }
      setIsParsing(false);
    }
  }, [data, storeSchema]);

  const {
    mutate,
    isError: isMutateError,
    isPending,
  } = api.store.hSetField.useMutation({
    onSuccess: async () => {
      await utils.store.hGetAll.invalidate();
    },
  });

  function setItem<K extends keyof z.infer<T>>(
    key: K,
    newValue: z.infer<T>[K],
  ) {
    mutate({
      field: key as string,
      value: JSON.stringify(newValue),
    });
  }

  // use the subscription to invalidate the hGetAll query and trigger a refetch
  api.store.keyspaceEvents.useSubscription(
    undefined, // Subscriptions typically don't have input, or a void input
    {
      onData(data) {
        // This callback is fired every time the server yields a new event
        console.log("Received keyspace event:", data);
        // Invalidate the hGetAll query to refetch the store data
        utils.store.hGetAll.invalidate().catch((err) => {
          console.error("Error invalidating hGetAll query:", err);
        });
      },
      onError(err) {
        // This callback is fired if there's an error in the subscription stream
        console.error("Subscription error:", err);
      },
      onStarted() {
        // This callback is fired when the subscription successfully starts
        console.log("Redis keyspace event subscription started!");
      },
    },
  );

  return {
    store,
    isLoading,
    isPending,
    isParsing,
    isQueryError,
    isMutateError,
    isParsingError,
    setItem,
  };
}
