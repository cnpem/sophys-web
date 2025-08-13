import { env } from "../../env";
import devicesSchema from "../schemas/devices";
import { protectedProcedure } from "../trpc";
import { zodSnakeFetcher } from "../utils";

export interface AllowedNames {
  flyables: string[];
  movables: string[];
  readables: string[];
}

export const devicesRouter = {
  allowed: protectedProcedure.query(async ({ ctx }) => {
    const fetchURL = `${env.BLUESKY_HTTPSERVER_URL}/api/devices/allowed`;
    try {
      const res = await zodSnakeFetcher(devicesSchema, {
        url: fetchURL,
        method: "GET",
        body: undefined,
        authorization: `Bearer ${ctx.session.user.blueskyAccessToken}`,
      });
      return res.devicesAllowed;
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(e.message);
      }
      throw new Error("Unknown error");
    }
  }),
  allowedNames: protectedProcedure.query(async ({ ctx }) => {
    const fetchURL = `${env.BLUESKY_HTTPSERVER_URL}/api/devices/allowed`;
    try {
      const res = await zodSnakeFetcher(devicesSchema, {
        url: fetchURL,
        method: "GET",
        body: undefined,
        authorization: `Bearer ${ctx.session.user.blueskyAccessToken}`,
      });
      // map through devicesAllowed, if isFlyable, isMovable, or isReadable
      // get the device's key as its name
      const response: AllowedNames = Object.entries(res.devicesAllowed).reduce(
        (acc: AllowedNames, [key, device]) => {
          if (device.isFlyable) {
            acc.flyables.push(camelToTitleCase(key));
          }
          if (device.isMovable) {
            acc.movables.push(camelToTitleCase(key));
          }
          if (device.isReadable) {
            acc.readables.push(camelToTitleCase(key));
          }
          return acc;
        },
        { flyables: [], movables: [], readables: [] },
      );
      return response;
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(e.message);
      }
      throw new Error("Unknown error");
    }
  }),
};

function camelToTitleCase(str: string) {
  return str
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
