"use client";

import { useEffect, useMemo } from "react";
import type { PvData } from "./schemas";
import { _usePVWS } from "./store";
import { comparePvData, compareSelectedPvMaps } from "./utils";

/**
 * Hook to selectively access PVWS data subscription for specific PV names.
 * Handles subscribing and unsubscribing to PVs automatically.
 *
 * @param pvNames
 * @returns Map<string, PvData | undefined> - Map of PV names to their data
 *
 * Example usage 1:
 * function MyComponent(pvNames: string[]) {
 *   const pvDataMap = usePvDataMap(pvNames);
 *   return (
 *     <div>
 *       {pvNames.map((pvName) => (
 *         <div key={pvName}>
 *           {pvDataMap.get(pvName) ? pvDataMap.get(pvName)?.value : "Loading..."}
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 *
 * Example usage 2 (dynamically creating PV names):
 *
 * function MyComponent(idRange: number) {
 *
 * // Here we need React.useMemo to avoid unnecessary rerenders due to the array being recreated on every component mount
 * const pvNames = useMemo(() => {
 *   return Array.from({ length: idRange }, (_, i) => `PV:${i}`);
 * }, [idRange]);
 *
 * const pvDataMap = usePvDataMap(pvNames);
 *
 * return (
 *   <div>
 *     {pvNames.map((pvName) => (
 *       <div key={pvName}>
 *         {pvDataMap.get(pvName) ? pvDataMap.get(pvName)?.value : `Loading data for ${pvName}...`}
 *      </div>
 *     ))}
 *   </div>
 * );
 *
 */
export const usePvDataMap = (
  pvNames: string[],
): Map<string, PvData | undefined> => {
  const subscribePvs = _usePVWS((state) => state.subscribePvs);
  const unsubscribePvs = _usePVWS((state) => state.unsubscribePvs);

  const customEqualityFn = useMemo(
    () => compareSelectedPvMaps(pvNames),
    [pvNames],
  );

  const rawPvDataMap = _usePVWS(
    (state) => state.subscriptionData,
    customEqualityFn,
  );

  const selectedPvDataMap = useMemo(() => {
    const newMap = new Map<string, PvData | undefined>();
    pvNames.forEach((pvName) => {
      newMap.set(pvName, rawPvDataMap.get(pvName));
    });
    return newMap;
  }, [rawPvDataMap, pvNames]);

  useEffect(() => {
    subscribePvs(pvNames);
    return () => {
      unsubscribePvs(pvNames);
    };
  }, [pvNames, subscribePvs, unsubscribePvs]);

  return selectedPvDataMap;
};

/**
 * Hook to access a single PV's data subscription.
 * Handles subscribing and unsubscribing to the PV automatically.
 *
 * @param pvName
 * @returns PvData | undefined - The up-to-date data for the specified PV,
 * or undefined if not available
 *
 * Example usage:
 *
 * function MyComponent(pvName: string) {
 *   const pvData = useSinglePvData(pvName);
 *   return <div>{pvData ? pvData.value : "Loading..."}</div>;
 * }
 */
export const useSinglePvData = (pvName: string): PvData | undefined => {
  const subscribePvs = _usePVWS((state) => state.subscribePvs);
  const unsubscribePvs = _usePVWS((state) => state.unsubscribePvs);

  const rawPvDataMap = _usePVWS(
    (state) => state.subscriptionData,
    (oldMap, newMap) => {
      if (oldMap === newMap) return true;
      const oldVal = oldMap.get(pvName);
      const newVal = newMap.get(pvName);
      return comparePvData(oldVal, newVal);
    },
  );

  const pvData = useMemo(() => {
    return rawPvDataMap.get(pvName);
  }, [rawPvDataMap, pvName]);

  useEffect(() => {
    subscribePvs([pvName]);
    return () => {
      unsubscribePvs([pvName]);
    };
  }, [pvName, subscribePvs, unsubscribePvs]);

  return pvData;
};
