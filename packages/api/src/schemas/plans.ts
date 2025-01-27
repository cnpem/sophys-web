import { z } from "zod";

const allowed = z.object({
  success: z.boolean(),
  msg: z.string(),
  plansAllowedUid: z.string(),
  plansAllowed: z.record(
    z.object({
      description: z.string().optional(),
      module: z.string(),
      name: z.string(),
      parameters: z.array(
        z.object({
          annotation: z
            .object({
              type: z.string(),
            })
            .optional(),
          convertDeviceNames: z.boolean().optional(),
          description: z.string().optional(),
          kind: z.object({
            name: z.string(),
            value: z.number(),
          }),
          name: z.string(),
          default: z.any().optional(),
          evalExpressions: z.boolean().optional(),
        }),
      ),
      properties: z.object({
        isGenerator: z.boolean(),
      }),
    }),
  ),
});

const existing = z.object({
  success: z.boolean(),
  msg: z.string(),
  plansExistingUid: z.string(),
  plansExisting: z.record(
    z.object({
      description: z.string().optional(),
      module: z.string(),
      name: z.string(),
      parameters: z.array(
        z.object({
          annotation: z
            .object({
              type: z.string(),
            })
            .optional(),
          convertDeviceNames: z.boolean().optional(),
          description: z.string().optional(),
          kind: z.object({
            name: z.string(),
            value: z.number(),
          }),
          name: z.string(),
          default: z.any().optional(),
          evalExpressions: z.boolean().optional(),
        }),
      ),
      properties: z.object({
        isGenerator: z.boolean(),
      }),
    }),
  ),
});

const plan = z.object({
  description: z.string(),
  module: z.string(),
  name: z.string(),
  parameters: z.array(
    z.object({
      annotation: z
        .object({
          type: z.string(),
        })
        .optional(),
      convertDeviceNames: z.boolean().optional(),
      description: z.string().optional(),
      kind: z.object({
        name: z.string(),
        value: z.number(),
      }),
      name: z.string(),
      default: z.any().optional(),
      evalExpressions: z.boolean().optional(),
    }),
  ),
  properties: z.object({
    isGenerator: z.boolean(),
  }),
});

export default {
  allowed,
  existing,
  plan,
};
