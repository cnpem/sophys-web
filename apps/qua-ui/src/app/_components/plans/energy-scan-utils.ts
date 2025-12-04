import { z } from "zod";

export const spaceEnum = z.enum(["energy-space", "k-space"]);

export const baseRegionObjectSchema = z.object({
  space: spaceEnum,
  initial: z.coerce
    .number()
    .gt(0, { message: "Initial value must be greater than 0" }),
  final: z.coerce
    .number()
    .gt(0, { message: "Final value must be greater than 0" }),
  step: z.coerce
    .number()
    .gt(0, { message: "Step value must be greater than 0" }),
});

export function EnergyToK(energy: number, edgeEnergy: number) {
  const value = (energy - edgeEnergy) / 3.81;
  if (value < 0) {
    console.warn(
      `Energy (${energy}) is less than Edge Energy (${edgeEnergy}). Cannot convert to k-space.`,
    );
    return 0;
  }
  return Math.round(Math.sqrt(value) * 10000) / 10000;
}

/**
 * Calculate number of points in a region as int((final - initial) / step)
 * returns 0 for invalid regions (no step, step <= 0, final - initial <= 0)
 * @param region
 * @returns number of points
 */
export function calculatePointsInRegion(
  region: z.infer<typeof baseRegionObjectSchema>,
) {
  return Math.floor((region.final - region.initial) / region.step);
}

/**
 * Convert total time in ms to a readable string in seconds, minutes or hours
 * @param totalMs
 * @returns human readable string representation of estimated time (e.g. "5.0 seconds", "2.5 minutes", "1.0 hours")
 */
export function convertTotalTimeToReadable(totalMs: number | undefined) {
  const oneSecondMs = 1000;
  const oneMinuteMs = 60000;
  const oneHourMs = 3600000;
  if (!totalMs || totalMs === 0) {
    return "Unable to estimate";
  } else if (totalMs < oneSecondMs) {
    return "Less than a second";
  } else if (totalMs < oneMinuteMs) {
    return `${(totalMs / oneSecondMs).toFixed(1)} seconds`;
  } else if (totalMs < oneHourMs) {
    return `${(totalMs / oneMinuteMs).toFixed(1)} minutes`;
  } else {
    return `${(totalMs / oneHourMs).toFixed(1)} hours`;
  }
}

export interface AddRegionEnergyScanProps {
  className: string;
  onSubmitSuccess?: () => void;
}
