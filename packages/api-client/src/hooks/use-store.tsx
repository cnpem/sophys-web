import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { api } from "@sophys-web/api-client/react";

type StoreResponse<TSchema extends z.ZodType<unknown>> = {
  etag: string;
} & Record<string, z.infer<TSchema>>;

type ParsedStore<TSchema extends z.ZodType<unknown>> = Omit<
  StoreResponse<TSchema>,
  "etag"
>;

interface UseStoreParams<TSchema extends z.ZodType<unknown>> {
  schema: TSchema;
  storeInstanceName: string;
}

/**
 * useStore is a custom React hook that provides an interface for interacting with a key-value store on the server.
 * It allows you to fetch, set, and delete fields in the store, as well as clear the entire store instance.
 * The hook uses Zod for schema validation and transformation of the store's fields.
 * The hook manages the state of the store data, loading and error states, and provides callback functions for manipulating the store.
 * The store is expected to have a unique instance name and each field in the store is expected to be a JSON string that can be parsed into the specified Zod schema.
 * There is a polling mechanism in place that refetches the store data every 2 seconds to ensure the client has the most up-to-date data, and it uses an ETag mechanism to avoid unnecessary parsing and state updates when the data hasn't changed.
 *
 * @param schema - Zod schema defining the structure of the store's fields. Each field is expected to be a JSON string that can be parsed into the specified schema.
 * @param storeInstanceName - Unique name of the store instance to interact with.
 * @returns An object containing:
 *  - storeData
 *  - isLoading
 *  - isPending
 *  - error
 *  - parseError
 *  - mutationError: setFieldMutation.error
 *  - setSample
 *  - setMultipleSamples
 *  - getSample
 *  - deleteSample
 *  - clearStore
 *  - isFetching
 */
export function useStore<TSchema extends z.ZodType<unknown>>({
  schema,
  storeInstanceName,
}: UseStoreParams<TSchema>) {
  const utils = api.useUtils();
  const etag = useRef<string | undefined>(undefined);
  const [parseError, setParseError] = useState<z.ZodError | null>(null);
  const [storeData, setStoreData] = useState<ParsedStore<TSchema> | undefined>(
    undefined,
  );

  const sampleFieldSchema = useMemo(
    () =>
      z
        .string()
        .transform((str, ctx): unknown => {
          try {
            return JSON.parse(str);
          } catch {
            console.log(
              `[useStore][sampleFieldSchema] Failed to parse string as JSON: ${str}`,
            );
            ctx.addIssue({
              code: "invalid_type",
              expected: "string",
              received: "string",
              message: "Invalid JSON string",
              fatal: true,
            });
            return z.NEVER;
          }
        })
        .pipe(schema),
    [schema],
  );

  const storeSchema = useMemo(
    () =>
      z
        .object({
          etag: z.string(),
        })
        .catchall(sampleFieldSchema),
    [sampleFieldSchema],
  );

  const {
    data: rawQueryResult,
    isLoading,
    isPending,
    error,
    isFetching,
  } = api.store.getStore.useQuery(
    { storeInstanceName },
    {
      refetchOnMount: false,
      refetchInterval: 2000,
    },
  );

  const setFieldMutation = api.store.setStoreField.useMutation({
    onSuccess: async () => {
      await utils.store.getStore.invalidate({ storeInstanceName });
    },
    onError: (e: unknown) => {
      console.error("[useStore] Error setting field", e);
      toast.error("Failed to update field", {
        description: e instanceof Error ? e.message : String(e),
        closeButton: true,
      });
    },
  });

  const setFieldsMutation = api.store.setStoreFields.useMutation({
    onSuccess: async () => {
      await utils.store.getStore.invalidate({ storeInstanceName });
    },
    onError: (e) => {
      console.error("[useStore] Error setting fields", e);
      toast.error("Failed to update fields", {
        description: e.message,
        closeButton: true,
      });
    },
  });

  const deleteFieldMutation = api.store.deleteStoreField.useMutation({
    onSuccess: async () => {
      await utils.store.getStore.invalidate({ storeInstanceName });
    },
    onError: (e) => {
      console.error("[useStore] Error deleting field", e);
      toast.error("Failed to delete field", {
        description: e.message,
        closeButton: true,
      });
    },
  });

  const cleanStoreMutation = api.store.deleteStoreInstance.useMutation({
    onSuccess: async () => {
      await utils.store.getStore.invalidate({ storeInstanceName });
    },
    onError: (e) => {
      console.error("[useStore] Error clearing store", e);
      toast.error("Failed to clear store", {
        description: e.message,
        closeButton: true,
      });
    },
  });

  useEffect(() => {
    if (!rawQueryResult?.etag) return;

    if (rawQueryResult.etag === etag.current) {
      setParseError(null);
      return;
    }

    const parsedDataResult = storeSchema.safeParse(rawQueryResult);

    if (!parsedDataResult.success) {
      setParseError(parsedDataResult.error);
      setStoreData(undefined);
      return;
    }

    const { etag: newEtag, ...fields } = parsedDataResult.data;
    setStoreData(fields as ParsedStore<TSchema>);
    etag.current = newEtag;
    setParseError(null);
  }, [rawQueryResult, storeSchema]);

  const setSample = useCallback(
    (sampleId: string, sampleData: z.infer<TSchema>) =>
      setFieldMutation.mutateAsync({
        storeInstanceName,
        fieldKey: sampleId,
        value: JSON.stringify(sampleData),
      }),
    [setFieldMutation, storeInstanceName],
  );

  const setMultipleSamples = useCallback(
    (samples: Record<string, z.infer<TSchema>>) => {
      const fields = Object.entries(samples).map(([fieldKey, value]) => ({
        fieldKey,
        value: JSON.stringify(value),
      }));
      return setFieldsMutation.mutateAsync({
        storeInstanceName,
        fields,
      });
    },
    [setFieldsMutation, storeInstanceName],
  );

  const getSample = useCallback(
    (sampleId: string): z.infer<TSchema> | undefined => storeData?.[sampleId],
    [storeData],
  );

  const deleteSample = useCallback(
    (sampleId: string) =>
      deleteFieldMutation.mutateAsync({
        storeInstanceName,
        fieldKey: sampleId,
      }),
    [deleteFieldMutation, storeInstanceName],
  );

  const clearStore = useCallback(
    () => cleanStoreMutation.mutateAsync({ storeInstanceName }),
    [cleanStoreMutation, storeInstanceName],
  );

  return {
    storeData,
    isLoading,
    isPending,
    error,
    parseError,
    mutationError: setFieldMutation.error,
    setSample,
    setMultipleSamples,
    getSample,
    deleteSample,
    clearStore,
    isFetching,
  };
}
