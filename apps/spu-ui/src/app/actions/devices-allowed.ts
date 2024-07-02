"use server";
import { auth } from "@repo/auth";
import { z } from "zod";
import { env } from "../../env";

const ComponentSchema = z.object({
  classname: z.string(),
  is_flyable: z.boolean(),
  is_movable: z.boolean(),
  is_readable: z.boolean(),
  long_name: z.string(),
  module: z.string(),
});

const DeviceSchema = z.object({
  classname: z.string(),
  is_flyable: z.boolean(),
  is_movable: z.boolean(),
  is_readable: z.boolean(),
  long_name: z.string(),
  module: z.string(),
  components: z.record(ComponentSchema).optional(),
});

const ApiResponseSchema = z.object({
  success: z.boolean(),
  msg: z.string(),
  devices_allowed: z.record(DeviceSchema),
});

export async function get() {
  const session = await auth();
  if (!session) {
    throw new Error("User not authenticated");
  }
  const blueskyToken = session.user.blueskyAccessToken;
  if (!blueskyToken) {
    throw new Error("No bluesky token found");
  }
  const response = await fetch(
    `${env.BLUESKY_HTTPSERVER_URL}/api/devices/allowed`,
    {
      headers: {
        Authorization: `Bearer ${blueskyToken}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch allowed devices");
  }
  const parsed = ApiResponseSchema.parse(await response.json());
  if (!parsed.success) {
    throw new Error(parsed.msg);
  }
  return parsed.devices_allowed;
}

export async function getLongNames() {
  const parsed = await get();
  const devicesLongNameList = Object.entries(parsed).map(
    ([_, value]) => value.long_name
  );
  return devicesLongNameList;
}

export async function getDevicesLongNamesBySelector() {
  const parsed = await get();
  const flyableDevices: string[] = [];
  const movableDevices: string[] = [];
  const readableDevices: string[] = [];
  Object.values(parsed).forEach((device) => {
    if (device.is_readable) {
      readableDevices.push(device.long_name);
    }
    if (device.is_movable) {
      movableDevices.push(device.long_name);
    }
    if (device.is_flyable) {
      flyableDevices.push(device.long_name);
    }
  });
  return {
    flyables: flyableDevices,
    movables: movableDevices,
    readables: readableDevices,
  };
}
