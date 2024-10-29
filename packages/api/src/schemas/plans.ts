import { z } from "zod";

const kind = z.object({
  name: z.string(),
  value: z.number(),
});

const annotation = z.object({
  type: z.string(),
});

const parameter = z.object({
  annotation: annotation.optional(),
  convert_device_names: z.boolean().optional(),
  description: z.string().optional(),
  kind: kind,
  name: z.string(),
  default: z.any().optional(),
  eval_expressions: z.boolean().optional(),
});

const properties = z.object({
  is_generator: z.boolean(),
});

const plan = z.object({
  description: z.string(),
  module: z.string(),
  name: z.string(),
  parameters: z.array(parameter),
  properties: properties,
});

const allowed = z.object({
  success: z.boolean(),
  msg: z.string(),
  plans_allowed_uid: z.string(),
  plans_allowed: z.record(plan),
});

const existing = z.object({
  success: z.boolean(),
  msg: z.string(),
  plans_existing_uid: z.string(),
  plans_existing: z.record(plan),
});

export default {
  allowed,
  existing,
  plan,
};
