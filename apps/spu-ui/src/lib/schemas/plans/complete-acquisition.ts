import { z } from "zod";

export const planName = "setup1_complete_standard_acquisition";

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
    exp_uv_time: z.number(),
    measure_uv_number: z.number(),
    standard_option: z.string(),
    agents_list: z.array(z.string()).optional(),
    agents_duration: z.array(z.number()).optional(),
    proposal: z.string(),
  })
  .transform((data) => {
    const {
      sample_tag: sampleTag,
      sample_type: sampleType,
      buffer_tag: bufferTag,
      acquire_time: acquireTime,
      num_exposures: numExposures,
      exp_uv_time: expUvTime,
      measure_uv_number: measureUvNumber,
      standard_option: standardOption,
      agents_list: agentsList,
      agents_duration: agentsDuration,
      ...rest
    } = data;
    return {
      sampleTag,
      sampleType,
      bufferTag,
      acquireTime,
      numExposures,
      expUvTime,
      measureUvNumber,
      standardOption,
      agentsList,
      agentsDuration,
      ...rest,
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
    expUvTime: z.number(),
    measureUvNumber: z.number(),
    standardOption: z.string(),
    agentsList: z.array(z.string()).optional(),
    agentsDuration: z.array(z.number()).optional(),
    proposal: z.string(),
  })
  .transform((data) => {
    const {
      sampleType,
      sampleTag,
      bufferTag,
      tray,
      row,
      col,
      volume,
      acquireTime,
      numExposures,
      expUvTime,
      measureUvNumber,
      standardOption,
      agentsList,
      agentsDuration,
      proposal,
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
      exp_uv_time: expUvTime,
      measure_uv_number: measureUvNumber,
      standard_option: standardOption,
      agents_list: agentsList,
      agents_duration: agentsDuration,
      proposal,
    };
  });
