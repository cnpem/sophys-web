import { z } from "zod";

export const schema = z.object({
  water1: z.coerce.number().min(0, "Water 1 must be a positive number"),
  agent1: z.coerce.number().min(0, "Agent 1 must be a positive number"),
  water2: z.coerce.number().min(0, "Water 2 must be a positive number"),
  agent2: z.coerce.number().min(0, "Agent 2 must be a positive number"),
  air: z.coerce.number().min(0, "Air must be a positive number"),
  saveReference: z.boolean(),
  compareReference: z.boolean(),
});

export const info = {
  water1: "Time in seconds that water will be applied before the agent1.",
  agent1: "Time in seconds that the agent1 will be applied.",
  water2: "Time in seconds that water will be applied before the agent2.",
  agent2: "Time in seconds that the agent2 will be applied.",
  air: "Time in seconds that air will be applied.",
  saveReference: "Save the current data as reference.",
  compareReference: "Compare the current data with the reference data.",
};
