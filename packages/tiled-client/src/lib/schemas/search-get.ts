import { z } from "zod";

const MaybeString = z.string().nullish();
const MaybeStringArray = z.array(z.string()).nullish();
const MaybeBoolArray = z.array(z.boolean()).nullish();

const SearchPathGetQueryParams = z
  .object({
    fields: z
      .array(
        z.enum([
          "metadata",
          "structure_family",
          "structure",
          "count",
          "sorting",
          "specs",
          "data_sources",
          "access_blob",
        ]),
      )
      .default([
        "metadata",
        "structure_family",
        "structure",
        "count",
        "sorting",
        "specs",
        "data_sources",
        "access_blob",
      ]),
    select_metadata: MaybeString,
    max_depth: z.number().int().min(0).max(5).nullish(),
    omit_links: z.boolean().default(false),
    include_data_sources: z.boolean().default(false),

    "page[offset]": z.number().int().min(0).nullish(),
    "page[cursor]": z.number().int().min(0).nullish(),
    "page[limit]": z.number().int().min(0).max(300).default(100),

    sort: z.array(z.string()).nullish(),

    "filter[fulltext][condition][text]": MaybeStringArray,
    "filter[lookup][condition][key]": MaybeStringArray,
    "filter[keys_filter][condition][keys]": MaybeStringArray,
    "filter[regex][condition][key]": MaybeStringArray,
    "filter[regex][condition][pattern]": MaybeStringArray,
    "filter[regex][condition][case_sensitive]": MaybeBoolArray,

    "filter[eq][condition][key]": MaybeStringArray,
    "filter[eq][condition][value]": z.array(z.unknown()).nullish(),
    "filter[noteq][condition][key]": MaybeStringArray,
    "filter[noteq][condition][value]": z.array(z.unknown()).nullish(),

    "filter[comparison][condition][operator]": z
      .array(z.enum(["lt", "gt", "le", "ge"]))
      .nullish(),
    "filter[comparison][condition][key]": MaybeStringArray,
    "filter[comparison][condition][value]": z.array(z.unknown()).nullish(),

    "filter[contains][condition][key]": MaybeStringArray,
    "filter[contains][condition][value]": z.array(z.unknown()).nullish(),

    "filter[in][condition][key]": MaybeStringArray,
    "filter[in][condition][value]": MaybeStringArray,
    "filter[notin][condition][key]": MaybeStringArray,
    "filter[notin][condition][value]": MaybeStringArray,

    "filter[keypresent][condition][key]": MaybeStringArray,
    "filter[keypresent][condition][exists]": MaybeBoolArray,

    "filter[like][condition][key]": MaybeStringArray,
    "filter[like][condition][pattern]": MaybeStringArray,

    "filter[specs][condition][include]": MaybeStringArray,
    "filter[specs][condition][exclude]": MaybeStringArray,

    "filter[access_blob_filter][condition][user_id]": z
      .array(z.string().nullable())
      .nullish(),
    "filter[access_blob_filter][condition][tags]": MaybeStringArray,

    "filter[structure_family][condition][value]": z
      .array(
        z.enum(["array", "awkward", "container", "ragged", "sparse", "table"]),
      )
      .nullish(),
  })
  .passthrough();

const UnknownRecord = z.record(z.string(), z.unknown()).nullish();
const UnknownRecordOfUnknownRecord = z
  .record(z.string(), UnknownRecord)
  .nullish();
const SearchPathGetLinks = z
  .record(z.string(), z.string().nullable())
  .nullish();

const SearchPathGetResponseItem = z
  .object({
    id: z.string(),
    attributes: z
      .object({
        ancestors: z.array(z.string()),
        structure_family: z
          .enum(["array", "awkward", "container", "ragged", "sparse", "table"])
          .nullish(),
        specs: z
          .array(
            z.object({
              name: z.string(),
              version: z.string().nullish(),
            }),
          )
          .max(20)
          .nullish(),
        metadata: UnknownRecordOfUnknownRecord,
        structure: z.unknown().nullish(),
        access_blob: UnknownRecord,
        sorting: z
          .array(
            z.object({
              key: z.string(),
              direction: z.union([z.literal(1), z.literal(-1)]),
            }),
          )
          .nullish(),
        data_sources: z.unknown().nullish(),
      })
      .passthrough(),
    links: SearchPathGetLinks,
    meta: UnknownRecord,
  })
  .passthrough();

const SearchPathGetResponse = z
  .object({
    data: z.array(SearchPathGetResponseItem).nullish(),
    error: z
      .object({
        code: z.number(),
        message: z.string(),
      })
      .nullish(),
    links: SearchPathGetLinks,
    meta: UnknownRecord,
  })
  .passthrough();

/** searchGetParams: path (string) */
export const searchGetParams = z.string().nullish();
export const searchGetQueryParams = SearchPathGetQueryParams;
export const searchGetResponse = SearchPathGetResponse;
