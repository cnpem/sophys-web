import { z } from "zod";
import { cleaningAgents } from "../../constants";

const name = "setup1_cleaning_procedure";
const schema = z
  .object({
    standardOption: z.string().optional(),
    agentsList: z
      .array(
        z.enum(cleaningAgents, {
          message: `Agents must be one of ${cleaningAgents.join(", ")}`,
        }),
        {
          message: `Agents must be a list of strings`,
        },
      )
      .optional(),
    agentsDuration: z
      .array(
        z.coerce.number({
          message: "Duration must be a number",
        }),
        {
          message: "Duration must be a list of numbers",
        },
      )
      .optional(),
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
