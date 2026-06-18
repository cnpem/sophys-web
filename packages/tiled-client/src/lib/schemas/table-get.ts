import { z } from "zod";

/**
 * Fetch the data for the given table [GET route].
 * @summary Full 'Table' Data
 */
const FullTableDataApiV1TableFullPathGetParams = z.object({
  path: z.string(),
});

const FullTableDataApiV1TableFullPathGetQueryParams = z.object({
  column: z.union([z.array(z.string()).min(1), z.null()]).optional(),
  format: z.union([z.string(), z.null()]).optional(),
  filename: z.union([z.string(), z.null()]).optional(),
});

const FullTableDataApiV1TableFullPathGetResponse = z.object({
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

export const tableGetResponse = FullTableDataApiV1TableFullPathGetResponse;
export const tableGetParams = FullTableDataApiV1TableFullPathGetParams;
export const tableGetQueryParams =
  FullTableDataApiV1TableFullPathGetQueryParams;
