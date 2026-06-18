import { z } from "zod";

/**
 * Fetch a slice of array-like data.
 * @summary Full Array
 */
const FullArrayApiV1ArrayFullPathGetParams = z.object({
  path: z.string(),
});

const fullArrayApiV1ArrayFullPathGetQuerySliceDefault = ``;
const fullArrayApiV1ArrayFullPathGetQuerySliceRegExp = new RegExp(
  "^(?:(?:-?\\d+)?:){0,2}(?:-?\\d+)?(?:,(?:(?:-?\\d+)?:){0,2}(?:-?\\d+)?)\*$",
);

const fullArrayApiV1ArrayFullPathGetQueryExpectedShapeOneRegExp = new RegExp(
  "^[0-9]+(,[0-9]+)\*$|^scalar$",
);

const FullArrayApiV1ArrayFullPathGetQueryParams = z.object({
  format: z.union([z.string(), z.null()]).optional(),
  filename: z.union([z.string(), z.null()]).optional(),
  slice: z
    .string()
    .regex(fullArrayApiV1ArrayFullPathGetQuerySliceRegExp)
    .default(fullArrayApiV1ArrayFullPathGetQuerySliceDefault),
  expected_shape: z
    .union([
      z
        .string()
        .min(1)
        .regex(fullArrayApiV1ArrayFullPathGetQueryExpectedShapeOneRegExp),
      z.null(),
    ])
    .optional(),
});

const FullArrayApiV1ArrayFullPathGetResponse = z.object({
  data: z.union([z.unknown(), z.null()]),
  error: z
    .union([
      z.object({
        code: z.number(),
        message: z.string(),
      }),
      z.null(),
    ])
    .optional(),
  links: z.union([z.unknown(), z.null()]).optional(),
  meta: z.union([z.unknown(), z.null()]).optional(),
});

export const arrayGetResponse = FullArrayApiV1ArrayFullPathGetResponse;
export const arrayGetParams = FullArrayApiV1ArrayFullPathGetParams;
export const arrayGetQueryParams = FullArrayApiV1ArrayFullPathGetQueryParams;
