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
  } = api.store.hGetAll.useQuery(
    {
      key: "app-store",
    },
    {
      refetchInterval: 1000 * 60 * 3,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
  );

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
      await utils.store.hGetAll.invalidate({ key: "app-store" });
    },
  });

  function setItem<K extends keyof z.infer<T>>(
    key: K,
    newValue: z.infer<T>[K],
  ) {
    mutate({
      key: "app-store",
      field: key as string,
      value: JSON.stringify(newValue),
    });
  }

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
