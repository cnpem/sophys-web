import { z } from "zod";

const componentSchema = z.object({
  classname: z.string(),
  is_flyable: z.boolean(),
  is_movable: z.boolean(),
  is_readable: z.boolean(),
  long_name: z.string(),
  module: z.string(),
});

const deviceSchema = z.object({
  classname: z.string(),
  is_flyable: z.boolean(),
  is_movable: z.boolean(),
  is_readable: z.boolean(),
  long_name: z.string(),
  module: z.string(),
  components: z.record(componentSchema).optional(),
});

const apiResponseSchema = z.object({
  success: z.boolean(),
  msg: z.string(),
  devices_allowed: z.record(deviceSchema),
});

export default {
    device: deviceSchema,
    devicesAllowed: z.record(deviceSchema),
    devicesAllowedResponse: apiResponseSchema,
};

