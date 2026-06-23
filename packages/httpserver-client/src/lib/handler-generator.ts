import type { z } from "zod";
import { pytsZodFetcher } from "./pyts-fetcher";

export const baseGetHandler = <R>(
  baseUrl: string,
  path: string,
  authorization: string | undefined = undefined,
  responseSchema: z.ZodType<R>,
) => {
  return async (): Promise<R> => {
    const fetchURL = `${baseUrl}${path}`;

    return pytsZodFetcher(responseSchema, {
      url: fetchURL,
      method: "GET",
      authorization: authorization ? `Bearer ${authorization}` : undefined,
      body: undefined,
    });
  };
};

type BaseBodyType = Record<string, unknown> | undefined;
export const basePostHandler = <R, T extends BaseBodyType>(
  baseUrl: string,
  path: string,
  authorization: string | undefined = undefined,
  bodySchema: z.ZodType<T>,
  responseSchema: z.ZodType<R>,
) => {
  return async (params: z.input<typeof bodySchema>): Promise<R> => {
    const fetchURL = `${baseUrl}${path}`;
    const parsedBody = bodySchema.parse(params);

    return pytsZodFetcher(responseSchema, {
      url: fetchURL,
      method: "POST",
      authorization: authorization ? `Bearer ${authorization}` : undefined,
      body: parsedBody,
    });
  };
};
