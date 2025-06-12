"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { api } from "../react";

const recordOrStrSchema = z.record(
  z.string().transform((str) => {
    try {
      return JSON.parse(str) as unknown;
    } catch {
      return str;
    }
  }),
);

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
        const jsonParsedData = recordOrStrSchema.safeParse(data);
        if (!jsonParsedData.success) {
          throw new Error(
            "Unexpected error parsing redis string fields: " +
              jsonParsedData.error.message,
          );
        }
        const schemaParsedData = storeSchema.safeParse(jsonParsedData.data);
        if (!schemaParsedData.success) {
          throw new Error(
            "Store data does not match schema: " +
              schemaParsedData.error.message,
          );
        }
        setStore(schemaParsedData.data as z.infer<T>);
      } catch (error) {
        console.error("Error parsing store data:", error);
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

  api.store.keyspaceEvents.useSubscription(undefined, {
    onData() {
      // This callback is fired every time the server yields a new event
      // to invalidate the hGetAll query to refetch the store data
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
  });

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
