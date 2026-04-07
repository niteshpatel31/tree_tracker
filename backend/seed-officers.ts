import { db, forestOfficersTable } from "./src/db/index.ts";
import crypto from "crypto";

function hashPassword(password: string): string {
  return crypto.pbkdf2Sync(password, "treetrack-india-salt-v2", 12000, 64, "sha512").toString("hex");
}

const officers = [
  {
    name: "Ravi Shankar",
    email: "ravi.shankar@treetrack.gov.in",
    password: "Password123!",
    state: "Maharashtra",
    employeeId: "MH-OFF-001",
    department: "State Forest Department",
    designation: "Chief Conservator",
    verificationStatus: "verified"
  },
  {
    name: "Anjali Desai",
    email: "anjali.desai@treetrack.gov.in",
    password: "Password123!",
    state: "Gujarat",
    employeeId: "GJ-OFF-042",
    department: "Regional Environment Board",
    designation: "Field Officer",
    verificationStatus: "verified"
  },
  {
    name: "Mohan Kumar",
    email: "mohan.kumar@treetrack.gov.in",
    password: "Password123!",
    state: "Karnataka",
    employeeId: "KA-OFF-108",
    department: "Forest Monitoring Unit",
    designation: "District Supervisor",
    verificationStatus: "verified"
  }
];

async function seedOfficers() {
  console.log("Seeding dummy forest officers...");
  
  for (const officer of officers) {
    const { password, ...details } = officer;
    await db.insert(forestOfficersTable).values({
      ...details,
      passwordHash: hashPassword(password),
    }).onConflictDoNothing({ target: forestOfficersTable.email });
  }

  console.log("Officers inserted successfully!");
  process.exit(0);
}

seedOfficers().catch(err => {
  console.error("Failed to seed officers:", err);
  process.exit(1);
});
