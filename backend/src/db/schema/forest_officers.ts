import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";

export const forestOfficersTable = pgTable("forest_officers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  state: text("state").notNull(),
  employeeId: text("employee_id").notNull().unique(),
  department: text("department").notNull(),
  designation: text("designation").notNull(),
  verificationStatus: text("verification_status").notNull().default("pending"),
  verificationOtp: text("verification_otp"),
  sessionToken: text("session_token"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ForestOfficer = typeof forestOfficersTable.$inferSelect;
