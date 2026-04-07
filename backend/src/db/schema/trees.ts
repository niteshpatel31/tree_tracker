import { pgTable, text, serial, timestamp, doublePrecision, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const treesTable = pgTable("trees", {
  id: serial("id").primaryKey(),
  treeCode: text("tree_code").notNull().unique(),
  state: text("state").notNull(),
  stateCode: text("state_code").notNull(),
  district: text("district").notNull(),
  districtCode: text("district_code").notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  plantationDate: timestamp("plantation_date", { withTimezone: true }).notNull().defaultNow(),
  status: text("status").notNull().default("planted"),
  species: text("species").notNull(),
  plantedBy: text("planted_by").notNull(),
  planterEmail: text("planter_email"),
  photoUrl: text("photo_url"),
  survivalStatus: text("survival_status").notNull().default("healthy"),
  carbonCredits: doublePrecision("carbon_credits").notNull().default(0),
  notes: text("notes"),
  serialNumber: integer("serial_number").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertTreeSchema = createInsertSchema(treesTable).omit({ id: true, createdAt: true, updatedAt: true, treeCode: true, serialNumber: true, plantationDate: true, carbonCredits: true });
export type InsertTree = z.infer<typeof insertTreeSchema>;
export type Tree = typeof treesTable.$inferSelect;
