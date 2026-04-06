import { pgTable, text, serial, timestamp, doublePrecision, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const iotSensorsTable = pgTable("iot_sensors", {
    id: serial("id").primaryKey(),
    treeCode: text("tree_code").notNull(),
    soilMoisture: doublePrecision("soil_moisture").notNull(),
    temperature: doublePrecision("temperature").notNull(),
    humidity: doublePrecision("humidity").notNull(),
    alertGenerated: text("alert_generated"), // e.g., "NEEDS_WATER", "HIGH_HEAT"
    recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertIotSensorSchema = createInsertSchema(iotSensorsTable).omit({ id: true, recordedAt: true });
export type InsertIotSensor = z.infer<typeof insertIotSensorSchema>;
export type IotSensor = typeof iotSensorsTable.$inferSelect;
