import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const aiAnalysesTable = pgTable("ai_analyses", {
    id: serial("id").primaryKey(),
    treeCode: text("tree_code"),
    photoUrl: text("photo_url").notNull(),
    analysisType: text("analysis_type").notNull(), // e.g., "SPECIES_RECOMMENDATION", "DISEASE_DETECTION", "PLANTATION_VERIFICATION"
    aiResult: text("ai_result").notNull(),
    confidenceScore: integer("confidence_score").notNull(), // percentage 0-100
    diseaseDetected: text("disease_detected"),
    recommendedSpecies: text("recommended_species"),
    analyzedAt: timestamp("analyzed_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAiAnalysisSchema = createInsertSchema(aiAnalysesTable).omit({ id: true, analyzedAt: true });
export type InsertAiAnalysis = z.infer<typeof insertAiAnalysisSchema>;
export type AiAnalysis = typeof aiAnalysesTable.$inferSelect;
