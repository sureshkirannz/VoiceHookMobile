import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const transcriptions = pgTable("transcriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  text: text("text").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  webhookStatus: varchar("webhook_status", { length: 20 }).notNull().default("pending"),
});

export const insertTranscriptionSchema = createInsertSchema(transcriptions).pick({
  text: true,
});

export type InsertTranscription = z.infer<typeof insertTranscriptionSchema>;

// Inferred type from Drizzle
type BaseTranscription = typeof transcriptions.$inferSelect;

// Properly typed Transcription with webhook status as literal union
export type Transcription = Omit<BaseTranscription, 'webhookStatus'> & {
  webhookStatus: "pending" | "sent" | "failed";
};
