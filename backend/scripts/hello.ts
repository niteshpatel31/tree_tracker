import { db, forestOfficersTable } from "@workspace/db";
import crypto from "crypto";

function hashPassword(password: string): string {
  return crypto.pbkdf2Sync(password, "treetrack-india-salt-v2", 12000, 64, "sha512").toString("hex");
}

async function createTestOfficer() {
  try {
    console.log("Creating test officer...");
    const [officer] = await db.insert(forestOfficersTable).values({
      name: "Test Officer",
      email: "officer@test.com",
      passwordHash: hashPassword("password123"),
      state: "Maharashtra",
      employeeId: "FO001",
      department: "Forest Department",
      designation: "Forest Officer",
      verificationStatus: "verified",
    }).returning();

    console.log("Test officer created:", officer);
  } catch (error) {
    console.error("Error creating test officer:", error);
  }
}

createTestOfficer().then(() => {
  console.log("Hello from @workspace/scripts");
});
