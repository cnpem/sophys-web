import { z } from "zod";

/**
 * Fetch the data for the given container via a GET request.
 * @summary Full 'Container' Metadata And Data
 */
const FullContainerMetadataAndDataApiV1ContainerFullPathGetParams = z.object({
  path: z.string(),
});

const FullContainerMetadataAndDataApiV1ContainerFullPathGetQueryParams =
  z.object({
    field: z.union([z.array(z.string()).min(1), z.null()]).optional(),
    format: z.union([z.string(), z.null()]).optional(),
    filename: z.union([z.string(), z.null()]).optional(),
  });

const FullContainerMetadataAndDataApiV1ContainerFullPathGetResponse = z.object({
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

export const containerGetResponse =
  FullContainerMetadataAndDataApiV1ContainerFullPathGetResponse;
export const containerGetParams =
  FullContainerMetadataAndDataApiV1ContainerFullPathGetParams;
export const containerGetQueryParams =
  FullContainerMetadataAndDataApiV1ContainerFullPathGetQueryParams;
