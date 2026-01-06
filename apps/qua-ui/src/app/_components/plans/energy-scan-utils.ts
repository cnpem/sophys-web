import { z } from "zod";

export const spaceEnum = z.enum(["energy-space", "k-space"]);

export enum crystalEnum {
  Si111 = "Si111",
  Si311 = "Si311",
}

export const crystalOptions = Object.values(crystalEnum);

export const d111 = 2 * 3.1356; // 2 times Si 111 d spacing
export const d311 = 2 * 1.6375; // 2 times Si 311 d spacing
const hc = 12398.41; // Planck's constant times speed of light

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
 * Convert energy in eV to theta in degrees for given d-spacing in Angstroms
 * @param energy
 * @param dSpacing
 * @returns
 */
export function EnergyToTheta(energy: number, dSpacing: number) {
  const ratio = hc / (dSpacing * energy);
  if (ratio > 1) {
    console.warn(
      `Ratio (${ratio}) is greater than 1. Cannot compute arcsin for Theta calculation.`,
    );
    return 90;
  }
  const radians = Math.asin(ratio);
  return (radians * 180) / Math.PI;
}

/**
 * Convert theta in degrees to energy in eV for given d-spacing in Angstroms
 * @param theta
 * @param dSpacing
 * @returns
 */
export function ThetaToEnergy(theta: number, dSpacing: number) {
  const radians = (theta * Math.PI) / 180;
  return hc / (dSpacing * Math.sin(radians));
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
