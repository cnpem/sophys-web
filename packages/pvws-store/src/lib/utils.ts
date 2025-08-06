import type { PvData } from "./schemas";

/**
 * Custom equality function for Maps containing PvData.
 * Only compares the values for the PV names provided.
 */
export const compareSelectedPvMaps =
  (pvNames: string[]) =>
  (
    oldMap: Map<string, PvData | undefined>,
    newMap: Map<string, PvData | undefined>,
  ): boolean => {
    if (oldMap === newMap) return true;

    if (pvNames.length === 0) {
      return oldMap.size === 0 && newMap.size === 0;
    }

    for (const pvName of pvNames) {
      const oldVal = oldMap.get(pvName);
      const newVal = newMap.get(pvName);

      if (!comparePvData(oldVal, newVal)) {
        return false;
      }
    }
    return true;
  };

// Helper function for deep equality of PvData objects (needed for memoization)
export const comparePvData = (
  a: PvData | undefined,
  b: PvData | undefined,
): boolean => {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.value === b.value && a.seconds === b.seconds;
};

export function mergePvDataUpdate(
  oldData: PvData | undefined,
  partialUpdate: PvData,
): PvData {
  if (!oldData) {
    return partialUpdate;
  }
  return { ...oldData, ...partialUpdate } as PvData;
}

export function formatLogMessage(message: string): string {
  return `[usePVWS] ${message}`;
}
