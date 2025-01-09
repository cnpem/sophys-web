import { z } from "zod";

// const kind = z.object({
//   name: z.string(),
//   value: z.number(),
// });

// const annotation = z.object({
//   type: z.string(),
// });

// const parameter = z
//   .object({
//     annotation: annotation.optional(),
//     convert_device_names: z.boolean().optional(),
//     description: z.string().optional(),
//     kind: kind,
//     name: z.string(),
//     default: z.any().optional(),
//     eval_expressions: z.boolean().optional(),
//   })
//   .transform((data) => {
//     const {
//       convert_device_names: convertDeviceNames,
//       eval_expressions: evalExpressions,
//       ...unchanged
//     } = data;
//     return {
//       convertDeviceNames,
//       evalExpressions,
//       ...unchanged,
//     };
//   });

// const properties = z
//   .object({
//     is_generator: z.boolean(),
//   })
//   .transform((data) => ({ isGenerator: data.is_generator }));

// const plan = z.object({
//   description: z.string(),
//   module: z.string(),
//   name: z.string(),
//   parameters: z.array(parameter),
//   properties: properties,
// });

// const allowed = z
//   .object({
//     success: z.boolean(),
//     msg: z.string(),
//     plans_allowed_uid: z.string(),
//     plans_allowed: z.record(plan),
//   })
//   .transform((data) => {
//     const {
//       plans_allowed_uid: plansAllowedUid,
//       plans_allowed: plansAllowed,
//       ...unchanged
//     } = data;
//     return {
//       plansAllowedUid,
//       plansAllowed,
//       ...unchanged,
//     };
//   });

// const existing = z
//   .object({
//     success: z.boolean(),
//     msg: z.string(),
//     plans_existing_uid: z.string(),
//     plans_existing: z.record(plan),
//   })
//   .transform((data) => {
//     const {
//       plans_existing_uid: plansExistingUid,
//       plans_existing: plansExisting,
//       ...unchanged
//     } = data;
//     return {
//       plansExistingUid,
//       plansExisting,
//       ...unchanged,
//     };
//   });

const allowed = z.object({
  success: z.boolean(),
  msg: z.string(),
  plansAllowedUid: z.string(),
  plansAllowed: z.record(
    z.object({
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
    }),
  ),
});

const existing = z.object({
  success: z.boolean(),
  msg: z.string(),
  plansExistingUid: z.string(),
  plansExisting: z.record(
    z.object({
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
