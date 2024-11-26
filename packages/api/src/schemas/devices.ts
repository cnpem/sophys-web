import { z } from "zod";

const responseSchema = z.object({
  success: z.boolean(),
  msg: z.string(),
  devices_allowed: z.record(
    z.string(),
    z.object({
      classname: z.string(),
      is_flyable: z.boolean().optional(),
      is_movable: z.boolean().optional(),
      is_readable: z.boolean().optional(),
      long_name: z.string(),
      module: z.string(),
      components: z
        .record(
          z.string(),
          z.object({
            classname: z.string(),
            is_flyable: z.boolean().optional(),
            is_movable: z.boolean().optional(),
            is_readable: z.boolean().optional(),
            long_name: z.string(),
            module: z.string(),
          }),
        )
        .optional(),
    }),
  ),
});

export default responseSchema;
