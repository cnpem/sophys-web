import { z } from "zod";

export const regexPatterns = {
  proposal: /^\d{8}$/,
  noEmptySpaces: /^[^.\s][^.\s]*[^.\s]$/,
  noDots: /^[^.\s][^.\s]*[^.\s]$/,
  invalidChars: /^[^\\/:*?"<>|]+$/,
} as const;

/**
 * proposal is a common field used in queue item forms and login forms.
 * It must be a string containing a 8-digit number.
 */
export const proposalSchema = z
  .string()
  .regex(
    regexPatterns.proposal,
    "Proposal must be exactly 8 digits long and contain only numbers",
  );
