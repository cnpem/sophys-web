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

export const containerGetParams =
  FullContainerMetadataAndDataApiV1ContainerFullPathGetParams;
export const containerGetQueryParams =
  FullContainerMetadataAndDataApiV1ContainerFullPathGetQueryParams;

const containerNode = z.object({
  contents: z.record(z.string(), z.unknown()),
  metadata: z.record(z.string(), z.unknown()),
});

/**
 * Schema for the response for the GET request for the first level of a container, containing the contents and metadata keys and unknown values.
 */
export const containerGetResponse = containerNode;
