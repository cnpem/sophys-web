import { z } from "zod";

export const planName = "setup1_acquisition";

export const kwargsResponseSchema = z
  .object({
    sample_tag: z.string(),
    sample_type: z.string(),
    buffer_tag: z.string(),
    tray: z.string(),
    row: z.string(),
    col: z.number(),
    volume: z.number(),
    acquire_time: z.number(),
    num_exposures: z.number(),
    proposal: z.string(),
    is_ref: z.boolean(),
  })
  .transform((data) => {
    const {
      sample_tag: sampleTag,
      sample_type: sampleType,
      buffer_tag: bufferTag,
      tray,
      row,
      col,
      volume,
      acquire_time: acquireTime,
      num_exposures: numExposures,
      proposal,
      is_ref: isRef,
    } = data;
    return {
      sampleTag,
      sampleType,
      bufferTag,
      tray,
      row,
      col,
      volume,
      acquireTime,
      numExposures,
      proposal,
      isRef,
    };
  });

export const kwargsSubmitSchema = z
  .object({
    sampleTag: z.string(),
    sampleType: z.string(),
    bufferTag: z.string(),
    tray: z.string(),
    row: z.string(),
    col: z.number(),
    volume: z.number(),
    acquireTime: z.number(),
    numExposures: z.number(),
    proposal: z.string(),
    isRef: z.boolean(),
  })
  .transform((data) => {
    const {
      sampleTag,
      sampleType,
      bufferTag,
      tray,
      row,
      col,
      volume,
      acquireTime,
      numExposures,
      proposal,
      isRef,
    } = data;
    return {
      sample_tag: sampleTag,
      sample_type: sampleType,
      buffer_tag: bufferTag,
      tray,
      row,
      col,
      volume,
      acquire_time: acquireTime,
      num_exposures: numExposures,
      proposal,
      is_ref: isRef,
    };
  });
