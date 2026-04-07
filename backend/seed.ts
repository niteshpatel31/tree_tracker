import { db, treesTable } from "./src/db/index.ts";
import { sql, eq, and } from "drizzle-orm";

const INDIAN_STATES = [
  { state: "Maharashtra", stateCode: "MH", districts: [{ name: "Pune", code: "PUN", lat: 18.5204, lng: 73.8567 }, { name: "Mumbai", code: "MUM", lat: 19.0760, lng: 72.8777 }] },
  { state: "Madhya Pradesh", stateCode: "MP", districts: [{ name: "Bhopal", code: "BHO", lat: 23.2599, lng: 77.4126 }, { name: "Jabalpur", code: "JAB", lat: 23.1815, lng: 79.9864 }] },
  { state: "Karnataka", stateCode: "KA", districts: [{ name: "Bangalore", code: "BAN", lat: 12.9716, lng: 77.5946 }, { name: "Mysore", code: "MYS", lat: 12.2958, lng: 76.6394 }] },
  { state: "Rajasthan", stateCode: "RJ", districts: [{ name: "Jaipur", code: "JAI", lat: 26.9124, lng: 75.7873 }, { name: "Udaipur", code: "UDA", lat: 24.5854, lng: 73.7125 }] },
  { state: "Gujarat", stateCode: "GJ", districts: [{ name: "Surat", code: "SUR", lat: 21.1702, lng: 72.8311 }, { name: "Ahmedabad", code: "AHM", lat: 23.0225, lng: 72.5714 }] },
  { state: "Tamil Nadu", stateCode: "TN", districts: [{ name: "Chennai", code: "CHE", lat: 13.0827, lng: 80.2707 }, { name: "Coimbatore", code: "COI", lat: 11.0168, lng: 76.9558 }] },
  { state: "Kerala", stateCode: "KL", districts: [{ name: "Kochi", code: "KOC", lat: 9.9312, lng: 76.2673 }, { name: "Trivandrum", code: "TRV", lat: 8.5241, lng: 76.9366 }] }
];

const SPECIES = ["Teak", "Mango", "Banyan", "Peepal", "Neem", "Bamboo", "Eucalyptus", "Pine"];
const STATUSES = ["planted", "cut", "at_risk"];
const SURVIVAL_STATUSES = ["healthy", "sick", "dead"];

function calculateCarbonCredits(species: string): number {
  const highCapture = ["teak", "bamboo", "eucalyptus", "pine", "mango"];
  const lowerName = species.toLowerCase();
  const isHigh = highCapture.some((s) => lowerName.includes(s));
  return isHigh ? 2.5 : 1.2;
}

function randomizeOffset(coord: number) {
  // Random offset between -0.5 and 0.5 degrees
  return coord + (Math.random() - 0.5);
}

function generateTreeCode(stateCode: string, districtCode: string, year: number, serial: number): string {
  const serialPadded = String(serial).padStart(6, "0");
  return `${stateCode.toUpperCase()}-${districtCode.toUpperCase()}-${year}-${serialPadded}`;
}

async function getNextSerial(stateCode: string, districtCode: string, year: number): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(treesTable)
    .where(
      and(
        eq(treesTable.stateCode, stateCode.toUpperCase()),
        eq(treesTable.districtCode, districtCode.toUpperCase()),
        sql`EXTRACT(YEAR FROM ${treesTable.plantationDate}) = ${year}`
      )
    );
  return Number(result[0]?.count ?? 0) + 1;
}

async function runSeed() {
  const year = new Date().getFullYear();
  let planted = 0;

  console.log("Cleaning up old dummy trees...");
  await db.delete(treesTable).where(eq(treesTable.plantedBy, "Dummy Seeder Script"));

  console.log("Seeding 50 dummy trees...");

  for (let i = 0; i < 50; i++) {
    const sIdx = Math.floor(Math.random() * INDIAN_STATES.length);
    const stateObj = INDIAN_STATES[sIdx];
    const dIdx = Math.floor(Math.random() * stateObj.districts.length);
    const distObj = stateObj.districts[dIdx];

    const serialNum = await getNextSerial(stateObj.stateCode, distObj.code, year);
    const treeCode = generateTreeCode(stateObj.stateCode, distObj.code, year, serialNum);
    const species = SPECIES[Math.floor(Math.random() * SPECIES.length)];
    const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
    const survivalStatus = SURVIVAL_STATUSES[Math.floor(Math.random() * SURVIVAL_STATUSES.length)];

    await db.insert(treesTable).values({
      treeCode,
      state: stateObj.state,
      stateCode: stateObj.stateCode,
      district: distObj.name,
      districtCode: distObj.code,
      latitude: randomizeOffset(distObj.lat),
      longitude: randomizeOffset(distObj.lng),
      plantationDate: new Date(Date.now() - Math.floor(Math.random() * 31536000000 / 12)), // random within recent months of current year
      status, 
      species,
      plantedBy: "Dummy Seeder Script",
      survivalStatus,
      carbonCredits: calculateCarbonCredits(species),
      serialNumber: serialNum
    });

    planted++;
    if (planted % 10 === 0) console.log(`Planted ${planted} trees...`);
  }

  console.log(`Done! Seeded ${planted} trees successfully.`);
  process.exit(0);
}

runSeed().catch(err => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
