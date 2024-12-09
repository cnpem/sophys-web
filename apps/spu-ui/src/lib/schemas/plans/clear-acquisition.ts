import { z } from "zod";

export const planName = "setup1_clean_and_acquire";

export const kwargsResponseSchema = z
  .object({
    acquire_time: z.number(),
    num_exposures: z.number(),
    volume: z.number(),
    proposal: z.string(),
    sample_tag: z.string(),
    buffer_tag: z.string(),
    standard_option: z.string().nullable(),
    agents_list: z.array(z.string()).optional(),
    agents_duration: z.array(z.number()).optional(),
    is_ref: z.boolean(),
  })
  .transform((data) => {
    const {
      acquire_time: acquireTime,
      num_exposures: numExposures,
      volume,
      proposal,
      sample_tag: sampleTag,
      buffer_tag: bufferTag,
      standard_option: standardOption,
      agents_list: agentsList,
      agents_duration: agentsDuration,
      is_ref: isRef,
    } = data;
    return {
      acquireTime,
      numExposures,
      volume,
      proposal,
      sampleTag,
      bufferTag,
      standardOption,
      agentsList,
      agentsDuration,
      isRef,
    };
  });

export const kwargsSubmitSchema = z
  .object({
    acquireTime: z.number(),
    numExposures: z.number(),
    volume: z.number(),
    proposal: z.string(),
    sampleTag: z.string(),
    bufferTag: z.string(),
    standardOption: z.string().nullable(),
    agentsList: z.array(z.string()).optional(),
    agentsDuration: z.array(z.number()).optional(),
    isRef: z.boolean(),
  })
  .transform((data) => {
    const {
      acquireTime,
      numExposures,
      volume,
      proposal,
      sampleTag,
      bufferTag,
      standardOption,
      agentsList,
      agentsDuration,
      isRef,
    } = data;
    return {
      acquire_time: acquireTime,
      num_exposures: numExposures,
      volume,
      proposal,
      sample_tag: sampleTag,
      buffer_tag: bufferTag,
      standard_option: standardOption,
      agents_list: agentsList,
      agents_duration: agentsDuration,
      is_ref: isRef,
    };
  });
