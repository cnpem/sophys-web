import { z } from "zod";
import {
  cardColumns,
  cardIndexOptions,
  cardRows,
} from "../../store/setup2/constants";
import { proposalSchema, regexPatterns } from "./common";

const sampleTagSchema = z
  .string()
  .min(1)
  .max(
    100,
    "Sample name or other form of identification must be at most 100 characters long",
  )
  .regex(regexPatterns.invalidChars, {
    message:
      "Sample tag can only contain letters, numbers, dashes, and underscores",
  })
  .regex(regexPatterns.noEmptySpaces, {
    message: "Sample tag must not contain empty spaces",
  })
  .regex(regexPatterns.noDots, {
    message: "Sample tag must not contain dots",
  });

export const schema = z
  .object({
    proposal: proposalSchema,
    sampleTag: sampleTagSchema,
    acquireTime: z.coerce
      .number()
      .min(0.1, "Acquire time (in seconds) must be at least 0.1"),
    numExposures: z.coerce
      .number()
      .int()
      .min(1, "Number of exposures must be at least 1"),
    col: z.enum(cardColumns, {
      message: `Column must be one of the following options ${cardColumns.join(", ")}`,
    }),
    row: z.enum(cardRows, {
      message: `Row must be one of the following options ${cardRows.join(", ")}`,
    }),
    cardIndex: z
      .enum(cardIndexOptions, {
        message: `Card index must be one of the following options ${cardIndexOptions.join(", ")}`,
      })
      .optional(),
    cardName: z.string().optional(),
    retrieveCard: z.boolean().optional(),
    usePimega: z.boolean().optional(),
    usePicolo: z.boolean().optional(),
    picoloChannel: z
      .enum(["channel1", "channel2"], {
        message: `Picolo channel must be either 'channel1' or 'channel2'`,
      })
      .optional(),
    samplePosX: z.coerce.number().optional(),
    samplePosY: z.coerce.number().optional(),
  })
  .refine(
    (data) => {
      return data.cardIndex !== undefined || data.cardName !== undefined;
    },
    {
      message: "Either card index or card name must be provided",
    },
  )
  .refine(
    (data) => {
      if (data.usePicolo) {
        return data.picoloChannel !== undefined;
      } else {
        return data.picoloChannel === undefined;
      }
    },
    {
      message:
        "Picolo channel must be provided if usePicolo is true, and must be undefined if usePicolo is false",
    },
  );

export const name = "setup2_complete_standard_acquisition";
