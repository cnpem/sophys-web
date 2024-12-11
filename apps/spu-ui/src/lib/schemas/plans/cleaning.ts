import { z } from "zod";

const cleaningDefaults = ["light", "normal", "heavy"] as const;
const cleaningAgents = ["air", "water", "agent1", "agent2"] as const; // TODO: this shouldn't be hardcoded
const name = "setup1_cleaning_procedure";
const schema = z
  .object({
    standardOption: z.string().nullable(),
    agentsList: z
      .array(z.string())
      .optional()
      .refine((agents) => {
        if (agents) {
          return agents.every((agent) =>
            cleaningAgents.includes(agent as (typeof cleaningAgents)[number]),
          );
        }
      }),
    agentsDuration: z.array(z.number()).optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.standardOption) {
      if (!data.agentsList || !data.agentsDuration) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Custom cleaning option requires agents and durations",
        });
      }
      if (data.agentsList?.length !== data.agentsDuration?.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Agents and durations must have the same length",
        });
      }
    } else {
      if (data.agentsList || data.agentsDuration) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Standard cleaning options cannot have agents or durations",
        });
      }
    }
  });

export { name, schema, cleaningDefaults, cleaningAgents };
