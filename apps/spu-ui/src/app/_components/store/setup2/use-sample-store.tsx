import { useMemo } from "react";
import { z } from "zod";
import { useStore } from "@sophys-web/api-client/hooks";
import { usePvData } from "@sophys-web/pvws-store";
import {
  cardCapillaryColumns,
  cardColumns,
  cardIndexOptions,
  cardRows,
  cardSlotRadius,
  cardTypesCapillary,
  cardTypesGrid,
} from "./constants";

const STORE_INSTANCE_NAME = "sampleStoreSetup2";

const validCardIndex = z.enum(cardIndexOptions, {
  message: "Invalid card index",
});
const validCardType = z.enum([cardTypesGrid, cardTypesCapillary], {
  message: "Invalid card type",
});
const validGridRow = z.enum(cardRows, {
  message: "Invalid grid row",
});
const validGridColumn = z.enum(cardColumns, {
  message: "Invalid grid column",
});
const validCapillaryColumn = z.enum(cardCapillaryColumns, {
  message: "Invalid capillary column",
});

export const sampleIdRegex = /^card(\d)-([A-Z]\d?)-(standard|capillary)$/;

const sampleIdSchema = z.object({
  card: validCardIndex,
  position: z.string().regex(/^[A-Z]\d?$/),
  type: validCardType,
});

const sampleIdStringToObject = z.string().transform((id, ctx) => {
  const match = sampleIdRegex.exec(id);
  if (!match) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Invalid ID format: ${id}`,
    });
    return z.NEVER;
  }
  const [_, card, position, type] = match;

  const parsed = sampleIdSchema.safeParse({ card, position, type });
  if (!parsed.success) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Invalid ID components: ${JSON.stringify(parsed.error.issues)}`,
    });
    return z.NEVER;
  }

  return parsed.data;
});

const samplePositionGridSchema = z.object({
  column: validGridColumn,
  row: validGridRow,
});

const samplePositionCapillarySchema = z.object({
  column: validCapillaryColumn,
});

export const sampleIdDecoder = z.string().transform((id, ctx) => {
  const parsed = sampleIdStringToObject.safeParse(id);
  if (!parsed.success) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Invalid sample ID: ${id}`,
    });
    return z.NEVER;
  }
  const { card, position, type } = parsed.data;
  if (type === cardTypesGrid) {
    const [column, row] = position.split("");
    const positionResult = samplePositionGridSchema.safeParse({ column, row });
    if (!positionResult.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Invalid grid position in sample ID: ${id}`,
      });
      return z.NEVER;
    }
    return { card, position: positionResult.data, type };
  } else {
    const positionResult = samplePositionCapillarySchema.safeParse({
      column: position,
    });
    if (!positionResult.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Invalid capillary position in sample ID: ${id}`,
      });
      return z.NEVER;
    }
    return { card, position: positionResult.data, type };
  }
});

export const sampleIdEncoder = z
  .object({
    card: validCardIndex,
    position: z.union([
      samplePositionGridSchema,
      samplePositionCapillarySchema,
    ]),
    type: validCardType,
  })
  .transform(({ card, position, type }) => {
    if (type === cardTypesGrid) {
      const { column, row } = position as z.infer<
        typeof samplePositionGridSchema
      >;
      return `card${card}-${column}${row}-${type}`;
    } else {
      const { column } = position as z.infer<
        typeof samplePositionCapillarySchema
      >;
      return `card${card}-${column}-${type}`;
    }
  });

/**
 * The main schema for a sample object, which includes the sample's ID (which encodes its position and type), a sample tag, its position in 2D space, etc.
 */
export const sampleSchema = z.object({
  id: z.string(),
  sampleTag: z.string(),
  position: z
    .object({
      x: z.coerce.number(),
      y: z.coerce.number(),
    })
    .optional(),
  notes: z.string().optional(),
});

/**
 * Instantiates a sample store for sampleSchema data.
 * @returns A hook that provides access to the sample store, with the data validated against the sampleSchema.
 */
export const useSampleStore = () =>
  useStore({
    schema: sampleSchema,
    storeInstanceName: STORE_INSTANCE_NAME,
  });

// Type helpers

export type Sample = z.infer<typeof sampleSchema>;
export type SampleStore = ReturnType<typeof useSampleStore>["storeData"];

// Helper functions for generating sample IDs based on their position and type

export function isValidCardCoordinates({ x, y }: { x: number; y: number }) {
  return Math.sqrt(x ** 2 + y ** 2) <= cardSlotRadius;
}

export const sampleSchemaValidPosition = sampleSchema.refine(
  (data) =>
    data.position &&
    isValidCardCoordinates({ x: data.position.x, y: data.position.y }),
  {
    message: `Sample position must be within a circle of radius ${cardSlotRadius}.`,
    path: ["position", "x"],
  },
);

/**
 * Determines the status of a card based on its name value.
 * @param cardName
 * @returns
 */
function getCardNameStatus(
  cardName: string | null | undefined,
): "CardNotFound" | "NameNotFound" | "Identified" {
  if (!cardName) {
    return "CardNotFound";
  }
  if (cardName === "Not Identified by Robot") {
    return "CardNotFound";
  }
  if (cardName === "Not Identified by Cam") {
    return "NameNotFound";
  }
  return "Identified";
}

type SampleRecord = Record<
  string,
  {
    decodedId: z.infer<typeof sampleIdDecoder>;
    data: Sample;
  }
>;

interface UseSampleStoreCard {
  cardName: string | undefined;
  cardStatus: "CardNotFound" | "NameNotFound" | "Identified";
  samples: SampleRecord;
  cardType: z.infer<typeof validCardType> | undefined;
  inconsistentSampleIds: string[];
}

export const useSampleStoreCard = (
  cardIndex: (typeof cardIndexOptions)[number],
): UseSampleStoreCard => {
  const pvName = `SPU:B:YASKAWA01:Card${cardIndex}_RBV`;
  const pvData = usePvData(pvName);
  const cardName = pvData?.text ?? undefined;
  const status = getCardNameStatus(cardName);

  const { storeData } = useSampleStore();

  const derived = useMemo<
    Omit<UseSampleStoreCard, "cardName" | "cardStatus" | "clearCardSamples">
  >(() => {
    if (!storeData) {
      return {
        samples: {},
        cardType: undefined,
        inconsistentSampleIds: [],
      };
    }

    const samples: SampleRecord = {};

    Object.keys(storeData).forEach((id) => {
      const parsed = sampleIdDecoder.safeParse(id);
      const sample = storeData[id];

      if (!parsed.success || parsed.data.card !== cardIndex || !sample) {
        return;
      }

      samples[id] = {
        decodedId: parsed.data,
        data: sample,
      };
    });

    if (Object.keys(samples).length === 0) {
      return {
        samples: {},
        cardType: undefined,
        inconsistentSampleIds: [],
      };
    }

    const types = new Set(Object.values(samples).map((s) => s.decodedId.type));
    const firstType = types.values().next().value;
    if (types.size > 1) {
      const inconsistentSampleIds = Object.values(samples)
        .filter((s) => s.decodedId.type !== firstType)
        .map((s) => sampleIdEncoder.parse(s.decodedId));
      return {
        samples,
        cardType: undefined,
        inconsistentSampleIds,
      };
    }

    if (firstType !== "standard" && firstType !== "capillary") {
      return {
        samples,
        cardType: undefined,
        inconsistentSampleIds: [],
      };
    }

    return {
      samples,
      cardType: firstType,
      inconsistentSampleIds: [],
    };
  }, [storeData, cardIndex]);

  return {
    ...derived,
    cardName: status === "Identified" ? cardName : undefined,
    cardStatus: status,
  };
};
