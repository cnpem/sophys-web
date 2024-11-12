import { z } from "zod";

const devicesAllowedSchema = z.record(
  z.object({
    classname: z.string(),
    isFlyable: z.boolean(),
    isMovable: z.boolean(),
    isReadable: z.boolean(),
    longName: z.string(),
    module: z.string(),
    components: z
      .record(
        z.object({
          classname: z.string(),
          isFlyable: z.boolean(),
          isMovable: z.boolean(),
          isReadable: z.boolean(),
          longName: z.string(),
          module: z.string(),
        }),
      )
      .optional(),
  }),
);

const responseSchema = z
  .object({
    success: z.boolean(),
    msg: z.string(),
    devices_allowed: z.record(
      z.object({
        classname: z.string(),
        is_flyable: z.boolean(),
        is_movable: z.boolean(),
        is_readable: z.boolean(),
        long_name: z.string(),
        module: z.string(),
        components: z
          .record(
            z.object({
              classname: z.string(),
              is_flyable: z.boolean(),
              is_movable: z.boolean(),
              is_readable: z.boolean(),
              long_name: z.string(),
              module: z.string(),
            }),
          )
          .optional(),
      }),
    ),
  })
  .transform((data) => {
    const { devices_allowed, ...unchanged } = data;
    const devicesAllowed = devicesAllowedSchema.parse(devices_allowed);
    return {
      devicesAllowed,
      ...unchanged,
    };
  });

export default responseSchema;
