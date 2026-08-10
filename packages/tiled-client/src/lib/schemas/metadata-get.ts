import { z } from "zod";

/**
 * Fetch the metadata and structure information for one entry
 * @summary Metadata
 */
const MetadataApiV1MetadataPathGetParams = z.object({
  path: z.string(),
});

const metadataApiV1MetadataPathGetQueryMaxDepthOneMin = 0;
const metadataApiV1MetadataPathGetQueryMaxDepthOneMax = 5;

const metadataApiV1MetadataPathGetQueryOmitLinksDefault = false;
const metadataApiV1MetadataPathGetQueryIncludeDataSourcesDefault = false;
const metadataApiV1MetadataPathGetQueryRootPathDefault = false;

const MetadataApiV1MetadataPathGetQueryParams = z.object({
  fields: z.union([
    z.array(
      z.enum([
        "metadata",
        "structure_family",
        "structure",
        "count",
        "sorting",
        "specs",
        "data_sources",
        "",
        "access_blob",
      ]),
    ),
    z.null(),
  ]),
  select_metadata: z.union([z.string(), z.null()]).optional(),
  max_depth: z
    .union([
      z
        .number()
        .min(metadataApiV1MetadataPathGetQueryMaxDepthOneMin)
        .max(metadataApiV1MetadataPathGetQueryMaxDepthOneMax),
      z.null(),
    ])
    .optional(),
  omit_links: z
    .boolean()
    .default(metadataApiV1MetadataPathGetQueryOmitLinksDefault),
  include_data_sources: z
    .boolean()
    .default(metadataApiV1MetadataPathGetQueryIncludeDataSourcesDefault),
  root_path: z
    .boolean()
    .default(metadataApiV1MetadataPathGetQueryRootPathDefault),
});

const metadataApiV1MetadataPathGetResponseDataOneAttributesSpecsOneItemNameMax = 255;

const metadataApiV1MetadataPathGetResponseDataOneAttributesSpecsOneItemVersionOneMax = 255;

const metadataApiV1MetadataPathGetResponseDataOneAttributesSpecsOneMax = 20;

const metadataApiV1MetadataPathGetResponseDataOneAttributesStructureOneResizableDefault =
  false;
const metadataApiV1MetadataPathGetResponseDataOneAttributesStructureThreeResizableDefault =
  false;
const metadataApiV1MetadataPathGetResponseDataOneAttributesStructureFourResizableDefault =
  false;
const metadataApiV1MetadataPathGetResponseDataOneAttributesStructureFourLayoutDefault = `COO`;
const metadataApiV1MetadataPathGetResponseDataOneAttributesStructureSixResizableDefault =
  false;
const metadataApiV1MetadataPathGetResponseDataOneAttributesDataSourcesOneItemParametersDefault =
  {};
const metadataApiV1MetadataPathGetResponseDataOneAttributesDataSourcesOneItemPropertiesDefault =
  {};
const metadataApiV1MetadataPathGetResponseDataOneAttributesDataSourcesOneItemManagementDefault = `writable`;

const MetadataApiV1MetadataPathGetResponse = z.object({
  data: z.union([
    z.object({
      id: z.union([z.string(), z.string().uuid()]),
      attributes: z.object({
        ancestors: z.array(z.string()),
        structure_family: z
          .union([
            z.enum([
              "array",
              "awkward",
              "container",
              "ragged",
              "sparse",
              "table",
            ]),
            z.null(),
          ])
          .optional(),
        specs: z
          .union([
            z
              .array(
                z.object({
                  name: z
                    .string()
                    .max(
                      metadataApiV1MetadataPathGetResponseDataOneAttributesSpecsOneItemNameMax,
                    ),
                  version: z
                    .union([
                      z
                        .string()
                        .max(
                          metadataApiV1MetadataPathGetResponseDataOneAttributesSpecsOneItemVersionOneMax,
                        ),
                      z.null(),
                    ])
                    .optional(),
                }),
              )
              .max(
                metadataApiV1MetadataPathGetResponseDataOneAttributesSpecsOneMax,
              ),
            z.null(),
          ])
          .optional(),
        metadata: z
          .union([z.record(z.string(), z.unknown()), z.null()])
          .optional(),
        structure: z
          .union([
            z.object({
              data_type: z.union([
                z.object({
                  endianness: z
                    .enum(["big", "little", "not_applicable"])
                    .describe(
                      "An enum of endian values: big, little, not_applicable.",
                    ),
                  kind: z.enum([
                    "t",
                    "b",
                    "i",
                    "u",
                    "f",
                    "c",
                    "m",
                    "M",
                    "S",
                    "U",
                    "V",
                  ]),
                  itemsize: z.number(),
                  dt_units: z.union([z.string(), z.null()]).optional(),
                }),
                z.object({
                  itemsize: z.number(),
                  fields: z.array(
                    z.object({
                      name: z.string(),
                      dtype: z.union([
                        z.object({
                          endianness: z
                            .enum(["big", "little", "not_applicable"])
                            .describe(
                              "An enum of endian values: big, little, not_applicable.",
                            ),
                          kind: z.enum([
                            "t",
                            "b",
                            "i",
                            "u",
                            "f",
                            "c",
                            "m",
                            "M",
                            "S",
                            "U",
                            "V",
                          ]),
                          itemsize: z.number(),
                          dt_units: z.union([z.string(), z.null()]).optional(),
                        }),
                        z.unknown(),
                      ]),
                      shape: z.union([z.array(z.number()), z.null()]),
                    }),
                  ),
                }),
              ]),
              chunks: z.array(z.array(z.number())),
              shape: z.array(z.number()),
              dims: z.union([z.array(z.string()), z.null()]).optional(),
              resizable: z
                .union([z.boolean(), z.array(z.boolean())])
                .default(
                  metadataApiV1MetadataPathGetResponseDataOneAttributesStructureOneResizableDefault,
                ),
            }),
            z.object({
              length: z.number(),
              form: z.record(z.string(), z.unknown()),
            }),
            z.object({
              data_type: z.union([
                z.object({
                  endianness: z
                    .enum(["big", "little", "not_applicable"])
                    .describe(
                      "An enum of endian values: big, little, not_applicable.",
                    ),
                  kind: z.enum([
                    "t",
                    "b",
                    "i",
                    "u",
                    "f",
                    "c",
                    "m",
                    "M",
                    "S",
                    "U",
                    "V",
                  ]),
                  itemsize: z.number(),
                  dt_units: z.union([z.string(), z.null()]).optional(),
                }),
                z.object({
                  itemsize: z.number(),
                  fields: z.array(
                    z.object({
                      name: z.string(),
                      dtype: z.union([
                        z.object({
                          endianness: z
                            .enum(["big", "little", "not_applicable"])
                            .describe(
                              "An enum of endian values: big, little, not_applicable.",
                            ),
                          kind: z.enum([
                            "t",
                            "b",
                            "i",
                            "u",
                            "f",
                            "c",
                            "m",
                            "M",
                            "S",
                            "U",
                            "V",
                          ]),
                          itemsize: z.number(),
                          dt_units: z.union([z.string(), z.null()]).optional(),
                        }),
                        z.unknown(),
                      ]),
                      shape: z.union([z.array(z.number()), z.null()]),
                    }),
                  ),
                }),
              ]),
              shape: z.array(z.union([z.number(), z.null()])),
              size: z.number(),
              chunks: z.array(z.union([z.array(z.number()), z.null()])),
              dims: z.union([z.array(z.string()), z.null()]).optional(),
              resizable: z
                .union([z.boolean(), z.array(z.boolean())])
                .default(
                  metadataApiV1MetadataPathGetResponseDataOneAttributesStructureThreeResizableDefault,
                ),
            }),
            z.object({
              chunks: z.array(z.array(z.number())),
              shape: z.array(z.number()),
              data_type: z
                .union([
                  z.object({
                    endianness: z
                      .enum(["big", "little", "not_applicable"])
                      .describe(
                        "An enum of endian values: big, little, not_applicable.",
                      ),
                    kind: z.enum([
                      "t",
                      "b",
                      "i",
                      "u",
                      "f",
                      "c",
                      "m",
                      "M",
                      "S",
                      "U",
                      "V",
                    ]),
                    itemsize: z.number(),
                    dt_units: z.union([z.string(), z.null()]).optional(),
                  }),
                  z.object({
                    itemsize: z.number(),
                    fields: z.array(
                      z.object({
                        name: z.string(),
                        dtype: z.union([
                          z.object({
                            endianness: z
                              .enum(["big", "little", "not_applicable"])
                              .describe(
                                "An enum of endian values: big, little, not_applicable.",
                              ),
                            kind: z.enum([
                              "t",
                              "b",
                              "i",
                              "u",
                              "f",
                              "c",
                              "m",
                              "M",
                              "S",
                              "U",
                              "V",
                            ]),
                            itemsize: z.number(),
                            dt_units: z
                              .union([z.string(), z.null()])
                              .optional(),
                          }),
                          z.unknown(),
                        ]),
                        shape: z.union([z.array(z.number()), z.null()]),
                      }),
                    ),
                  }),
                  z.null(),
                ])
                .optional(),
              coord_data_type: z
                .union([
                  z.object({
                    endianness: z
                      .enum(["big", "little", "not_applicable"])
                      .describe(
                        "An enum of endian values: big, little, not_applicable.",
                      ),
                    kind: z.enum([
                      "t",
                      "b",
                      "i",
                      "u",
                      "f",
                      "c",
                      "m",
                      "M",
                      "S",
                      "U",
                      "V",
                    ]),
                    itemsize: z.number(),
                    dt_units: z.union([z.string(), z.null()]).optional(),
                  }),
                  z.null(),
                ])
                .optional(),
              dims: z.union([z.array(z.string()), z.null()]).optional(),
              resizable: z
                .union([z.boolean(), z.array(z.boolean())])
                .default(
                  metadataApiV1MetadataPathGetResponseDataOneAttributesStructureFourResizableDefault,
                ),
              layout: z
                .enum(["COO"])
                .default(
                  metadataApiV1MetadataPathGetResponseDataOneAttributesStructureFourLayoutDefault,
                ),
            }),
            z.object({
              contents: z.union([z.record(z.string(), z.unknown()), z.null()]),
              count: z.number(),
            }),
            z.object({
              arrow_schema: z.string(),
              npartitions: z.number(),
              columns: z.array(z.string()),
              resizable: z
                .union([z.boolean(), z.array(z.boolean())])
                .default(
                  metadataApiV1MetadataPathGetResponseDataOneAttributesStructureSixResizableDefault,
                ),
            }),
            z.null(),
          ])
          .optional(),
        access_blob: z
          .union([z.record(z.string(), z.unknown()), z.null()])
          .optional(),
        sorting: z
          .union([
            z.array(
              z.object({
                key: z.string(),
                direction: z.union([z.literal(1), z.literal(-1)]),
              }),
            ),
            z.null(),
          ])
          .optional(),
        data_sources: z
          .union([
            z.array(
              z.object({
                id: z.union([z.number(), z.null()]).optional(),
                structure_family: z.enum([
                  "array",
                  "awkward",
                  "container",
                  "ragged",
                  "sparse",
                  "table",
                ]),
                structure: z.union([z.unknown(), z.null()]),
                mimetype: z.union([z.string(), z.null()]).optional(),
                parameters: z
                  .record(z.string(), z.unknown())
                  .default(
                    metadataApiV1MetadataPathGetResponseDataOneAttributesDataSourcesOneItemParametersDefault,
                  ),
                properties: z
                  .record(z.string(), z.unknown())
                  .default(
                    metadataApiV1MetadataPathGetResponseDataOneAttributesDataSourcesOneItemPropertiesDefault,
                  ),
                assets: z
                  .array(
                    z.object({
                      data_uri: z.string(),
                      is_directory: z.boolean(),
                      parameter: z.union([z.string(), z.null()]).optional(),
                      num: z.union([z.number(), z.null()]).optional(),
                      id: z.union([z.number(), z.null()]).optional(),
                    }),
                  )
                  .default([]),
                management: z
                  .enum(["external", "immutable", "locked", "writable"])
                  .default(
                    metadataApiV1MetadataPathGetResponseDataOneAttributesDataSourcesOneItemManagementDefault,
                  ),
              }),
            ),
            z.null(),
          ])
          .optional(),
      }),
      links: z.union([z.record(z.string(), z.unknown()), z.null()]).optional(),
      meta: z.union([z.record(z.string(), z.unknown()), z.null()]).optional(),
    }),
    z.null(),
  ]),
  error: z
    .union([
      z.object({
        code: z.number(),
        message: z.string(),
      }),
      z.null(),
    ])
    .optional(),
  links: z.union([z.record(z.string(), z.unknown()), z.null()]).optional(),
  meta: z.union([z.record(z.string(), z.unknown()), z.null()]).optional(),
});

export const metadataGetResponse = MetadataApiV1MetadataPathGetResponse;
export const metadataGetParams = MetadataApiV1MetadataPathGetParams;
export const metadataGetQueryParams = MetadataApiV1MetadataPathGetQueryParams;
