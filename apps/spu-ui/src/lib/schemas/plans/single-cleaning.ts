import { z } from "zod";
import { cleaningAgents } from "../../constants";

const name = "setup1_cleaning_procedure";
const schema = z
  .object({
    standardOption: z.string().nullable(),
    agentsList: z
      .array(z.string())
      .optional()
      .nullable()
      .refine(
        (agents) => {
          if (!agents || agents.length === 0) {
            return true;
          }
          return agents.every((agent) =>
            cleaningAgents.includes(agent as (typeof cleaningAgents)[number]),
          );
        },
        {
          message: `Agents must be one of ${cleaningAgents.join(", ")}`,
        },
      ),
    agentsDuration: z
      .array(z.number(), {
        message: "Duration must be a number",
      })
      .optional()
      .nullable(),
  })
  .superRefine((data, ctx) => {
    if (!data.standardOption || data.standardOption === "custom") {
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

export { name, schema };
