import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const blockchainLogsTable = pgTable("blockchain_logs", {
    id: serial("id").primaryKey(),
    treeCode: text("tree_code").notNull(),
    transactionHash: text("transaction_hash").notNull().unique(), // The cryptographic hash
    blockNumber: text("block_number"), // If posted to an external blockchain
    actionType: text("action_type").notNull(), // e.g., "PLANTED", "CUT", "INSPECTED"
    recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertBlockchainLogSchema = createInsertSchema(blockchainLogsTable).omit({ id: true, recordedAt: true });
export type InsertBlockchainLog = z.infer<typeof insertBlockchainLogSchema>;
export type BlockchainLog = typeof blockchainLogsTable.$inferSelect;
