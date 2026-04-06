import { pgTable, text, serial, timestamp, doublePrecision, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const satelliteScansTable = pgTable("satellite_scans", {
    id: serial("id").primaryKey(),
    regionCode: text("region_code").notNull(), // e.g., DISTRICT-CODE or Geohash
    latitude: doublePrecision("latitude").notNull(),
    longitude: doublePrecision("longitude").notNull(),
    ndviScore: doublePrecision("ndvi_score").notNull(), // Current vegetation index
    previousNdviScore: doublePrecision("previous_ndvi_score").notNull(), // Past index for comparison
    isRedZone: boolean("is_red_zone").default(false), // Flagged if sudden extreme deforestation is detected
    scanDate: timestamp("scan_date", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSatelliteScanSchema = createInsertSchema(satelliteScansTable).omit({ id: true, scanDate: true });
export type InsertSatelliteScan = z.infer<typeof insertSatelliteScanSchema>;
export type SatelliteScan = typeof satelliteScansTable.$inferSelect;
