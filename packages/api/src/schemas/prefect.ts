import { z } from "zod";

const basicValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
]);

const variableValueSchema = z.union([
  basicValueSchema,
  z.array(basicValueSchema),
]);

const prefectVariableNameSchema = z.object({
  id: z.string().uuid(),
  created: z.string().nullable(),
  updated: z.string().nullable(),
  name: z.string(),
  value: variableValueSchema,
  tags: z.array(z.string()),
});

export default prefectVariableNameSchema;
