import { z } from "zod";
import { cleaningAgents } from "../../constants";

const name = "setup1_custom_cleaning_procedure";
const schema = z
  .object({
    agentsList: z.array(
      z.enum(cleaningAgents, {
        message: `Agents must be one of ${cleaningAgents.join(", ")}`,
      }),
      {
        message: `Agents must be a list of strings`,
      },
    ),
    agentsDuration: z.array(
      z.coerce.number({
        message: "Duration must be a number",
      }),
      {
        message: "Duration must be a list of numbers",
      },
    ),
  })
  .superRefine((data, ctx) => {
    if (data.agentsList.length !== data.agentsDuration.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Agents and durations must have the same length",
      });
    }
  });

export { name, schema };
