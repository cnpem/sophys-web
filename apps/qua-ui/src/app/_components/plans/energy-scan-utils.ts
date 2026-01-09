import { z } from "zod";
import { useSinglePvData } from "@sophys-web/pvws-store";

export const spaceEnum = z.enum(["energy-space", "k-space"]);
export const MAX_ACCELERATION = 1000 as const;

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
  const oneDayMs = 24 * oneHourMs;
  if (!totalMs || totalMs === 0) {
    return "Unable to estimate";
  } else if (totalMs < oneSecondMs) {
    return "Less than a second";
  } else if (totalMs < oneMinuteMs) {
    return `${(totalMs / oneSecondMs).toFixed(1)} seconds`;
  } else if (totalMs < oneHourMs) {
    return `${(totalMs / oneMinuteMs).toFixed(1)} minutes`;
  } else if (totalMs < oneDayMs) {
    return `${(totalMs / oneHourMs).toFixed(1)} hours`;
  } else {
    return `${(totalMs / oneDayMs).toFixed(1)} days`;
  }
}
/**
 * Acceleration calculation based on a sinusoidal amplitude.
 * Formula: a = |(θ_final - θ_initial) / 2 * (2π / T)^2|
 * @param initialEnergy initial energy in eV
 * @param finalEnergy final energy in eV
 * @param crystal selected crystal for amplitude calculation
 * @param period period of oscilation
 * @returns computed acceleration
 */
export function calculateAcceleration(
  initialEnergy: number,
  finalEnergy: number,
  crystal: crystalEnum,
  period: number,
) {
  const dSpacing = crystal === crystalEnum.Si111 ? d111 : d311;
  const thetaInitial = EnergyToTheta(initialEnergy, dSpacing);
  const thetaFinal = EnergyToTheta(finalEnergy, dSpacing);
  const angularFrequency = (2 * Math.PI) / period;
  const acceleration =
    Math.abs((thetaFinal - thetaInitial) / 2) * Math.pow(angularFrequency, 2);
  return acceleration;
}

/**
 * Function to calculate the maximum frequency of HD-DCM-L,
 * for mechanical reasons, the (embbeded) acceleration is
 * capped in 1000 deg/s². This function calculates the approximate
 * theta amplitude based on the d-spacing of selected crystal.
 * @param initialEnergy Initial energy in eV
 * @param finalEnergy  Final energy in eV
 * @param crystal Selected crystal for frequency amplitude calculation
 * @returns maximum frequency in Hz for HD-DCM-L models
 */
export function calculateMaxFrequency(
  initialEnergy: number,
  finalEnergy: number,
  crystal: crystalEnum,
) {
  const dSpacing = crystal === crystalEnum.Si111 ? d111 : d311;
  const maxAcceleration = MAX_ACCELERATION; // deg/s²
  const thetaInitial = EnergyToTheta(initialEnergy, dSpacing);
  const thetaFinal = EnergyToTheta(finalEnergy, dSpacing);
  const deltaTheta = Math.abs(thetaFinal - thetaInitial) / 2;
  const angularFrequency = Math.sqrt(maxAcceleration / deltaTheta);
  const frequency = angularFrequency / (2 * Math.PI);
  return frequency;
}

export interface AddEnergyScanProps {
  className: string;
  onSubmitSuccess?: () => void;
}

/**
 * Base position PVWS store
 * @returns human readable current crystal according to granite base position
 */
export function BasePosition() {
  const pvName = "QUA:A:PB01:CS2:m7";
  const pvData = useSinglePvData(pvName);
  function format(value: number | "NaN" | undefined): number {
    if (value === undefined || value === "NaN") {
      return 0;
    }
    return value;
  }
  if (format(pvData?.value) < 20) {
    return "Si311";
  } else if (format(pvData?.value) > 20) {
    return "Si111";
  } else {
    return "Not defined";
  }
}
