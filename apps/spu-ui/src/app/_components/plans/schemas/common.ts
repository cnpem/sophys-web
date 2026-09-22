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

export const acquireTimeSchema = z.coerce.number().positive();

/**
 * sampleTag is a common field used in acquisition related forms and
 * can be used to generate filenames for acquired data.
 */
export const sampleTagSchema = z
  .string()
  .min(1, "Sample tag must not be empty")
  .max(100, "Sample tag must not exceed 100 characters")
  .regex(
    regexPatterns.noEmptySpaces,
    "Sample tag must not contain empty spaces",
  )
  .regex(regexPatterns.noDots, "Sample tag must not contain dots")
  .regex(
    regexPatterns.invalidChars,
    'Sample tag must not contain any of the following characters: \\ / : * ? " < > |',
  );
