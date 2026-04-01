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
/**
 * Compares two PvData objects for deep equality.
 * @param a The first PvData object.
 * @param b The second PvData object.
 * @returns True if the objects are equal according to PVWS docs:
 * "Note how the web socket sends the complete meta data (units etc.)
 * just once. The following updates then only contain the changed "value",
 * timestamp "seconds" and "nanos", and maybe alarm "severity""
 */
export const comparePvData = (
  a: PvData | undefined,
  b: PvData | undefined,
): boolean => {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.value === b.value &&
    a.seconds === b.seconds &&
    a.severity === b.severity &&
    a.nanos == b.nanos
  );
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
