import { z } from "zod";

export const planName = "setup1_cleaning_procedure";

export const kwargsResponseSchema = z
  .object({
    standard_option: z.string().nullable(),
    agents_list: z.array(z.string()).optional(),
    agents_duration: z.array(z.number()).optional(),
  })
  .transform((data) => {
    const {
      standard_option: standardOption,
      agents_list: agentsList,
      agents_duration: agentsDuration,
    } = data;
    return {
      standardOption,
      agentsList,
      agentsDuration,
    };
  });

export const kwargsSubmitSchema = z
  .object({
    standardOption: z.string().nullable(),
    agentsList: z.array(z.string()).optional(),
    agentsDuration: z.array(z.number()).optional(),
  })
  .transform((data) => {
    const { standardOption, agentsList, agentsDuration } = data;
    return {
      standard_option: standardOption,
      agents_list: agentsList,
      agents_duration: agentsDuration,
    };
  });
