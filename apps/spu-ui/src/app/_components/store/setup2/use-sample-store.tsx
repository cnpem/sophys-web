import { useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useStore } from "@sophys-web/api-client/hooks";
import { usePvData } from "@sophys-web/pvws-store";
import { sampleTagSchema } from "../../plans/schemas/common";
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
  sampleTag: sampleTagSchema,
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

export function isValidCardCoordinatesGridSlot({
  x,
  y,
}: {
  x: number;
  y: number;
}) {
  return Math.sqrt(x ** 2 + y ** 2) <= cardSlotRadius;
}

export const sampleSchemaValidPosition = sampleSchema.refine(
  (data) =>
    data.position &&
    isValidCardCoordinatesGridSlot({ x: data.position.x, y: data.position.y }),
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
  cardStatus: "CardNotFound" | "NameNotFound" | "Identified" | "StoreMismatch";
  samples: SampleRecord;
  cardType: z.infer<typeof validCardType> | undefined;
}

function parseCardTypeFromCardName(
  cardName: string | undefined,
): z.infer<typeof validCardType> | undefined {
  if (!cardName) return undefined;
  const [typeCode, _unusedNumber] = cardName.split("_");
  if (typeCode === "STD") return "standard";
  if (typeCode === "CAP") return "capillary";
  // Default return for unreconized typeCode
  return undefined;
}

export const useSampleStoreCard = (
  cardIndex: (typeof cardIndexOptions)[number],
): UseSampleStoreCard => {
  const pvName = `SPU:B:YASKAWA01:Card${cardIndex}_RBV`;
  const pvData = usePvData(pvName);

  const pendingDeleteSamples = useRef(new Set<string>());

  const cardName = pvData?.text ?? undefined;
  const status = getCardNameStatus(cardName);
  const cardType = parseCardTypeFromCardName(cardName);

  const { storeData, deleteSample } = useSampleStore();

  // Memoized computation of samples and mismatched IDs
  // 1. Parse the sample IDs in the store
  // 2. Filter out samples that do not belong to the current card
  // 3. Check if the sample type matches the card type and collect mismatched IDs for deletion
  // 4. Return the valid samples and the list of mismatched IDs
  const { samples, mismatchedIds } = useMemo<{
    samples: SampleRecord;
    mismatchedIds: string[];
  }>(() => {
    const samples: SampleRecord = {};
    const mismatchedIds: string[] = [];

    for (const [id, sample] of Object.entries(storeData ?? {})) {
      const parsed = sampleIdDecoder.safeParse(id);

      if (!parsed.success) {
        toast.error("Unrecognized sample ID.", {
          description: `Sample ID ${id} will be removed from store.`,
        });
        mismatchedIds.push(id);
        continue;
      }

      // The store may contain samples for other cards.
      if (parsed.data.card !== cardIndex) continue;

      if (cardType && parsed.data.type !== cardType) {
        toast.error("Invalid sample ID.", {
          description: `Sample ID ${id} has type ${parsed.data.type}, which does not match the card type ${cardType}. Sample will be removed from store.`,
        });
        mismatchedIds.push(id);
        continue;
      }

      samples[id] = { decodedId: parsed.data, data: sample };
    }

    return { samples, mismatchedIds };
  }, [storeData, cardIndex, cardType]);

  // Effect to delete mismatched samples from the store
  useEffect(() => {
    const currentMismatches = new Set(mismatchedIds);

    for (const id of pendingDeleteSamples.current) {
      if (!currentMismatches.has(id)) pendingDeleteSamples.current.delete(id);
    }

    for (const id of mismatchedIds) {
      if (pendingDeleteSamples.current.has(id)) continue;
      pendingDeleteSamples.current.add(id);

      void deleteSample(id).catch((cause: unknown) => {
        pendingDeleteSamples.current.delete(id);
        console.error(`Failed to delete mismatched sample ${id}:`, cause);
        toast.error(`Failed to remove mismatched sample ${id}.`);
      });
    }
  }, [deleteSample, mismatchedIds]);

  if (status === "Identified" && !cardType) {
    toast.error("Unrecognized card type", {
      description: `Card ${cardIndex} has an unrecognized type in its name: ${cardName}, please check the card and the store.`,
    });
  }

  return {
    samples,
    cardType,
    cardName: status === "Identified" ? cardName : undefined,
    cardStatus: status,
  };
};
