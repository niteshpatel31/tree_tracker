import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";

export const citizensTable = pgTable("citizens", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  state: text("state").notNull(),
  sessionToken: text("session_token"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Citizen = typeof citizensTable.$inferSelect;
