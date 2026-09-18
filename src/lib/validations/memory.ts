import { z } from "zod";

export const memoryInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Please provide a title for this memory."),
  occurred_start: z
    .string()
    .optional()
    .nullable(),
  body_text: z.string().optional().default(""),
});