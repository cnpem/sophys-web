import { z } from "zod";

const responseSchema = z.object({
  success: z.boolean(),
  msg: z.string(),
  devicesAllowedUid: z.string(),
  devicesAllowed: z.record(
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
  ),
});

export default responseSchema;
