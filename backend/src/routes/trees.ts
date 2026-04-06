import { Router, type IRouter } from "express";
import { eq, and, sql } from "drizzle-orm";
import { db, treesTable } from "../db";
import {
  CreateTreeBody,
  UpdateTreeStatusBody,
  UpdateTreeStatusParams,
  GetTreeParams,
  ListTreesQueryParams,
} from "../generated/api";

const router: IRouter = Router();

function generateTreeCode(stateCode: string, districtCode: string, year: number, serial: number): string {
  const serialPadded = String(serial).padStart(6, "0");
  return `${stateCode.toUpperCase()}-${districtCode.toUpperCase()}-${year}-${serialPadded}`;
}

function calculateCarbonCredits(species: string): number {
  const highCapture = ["teak", "bamboo", "eucalyptus", "pine", "mango"];
  const lowerName = species.toLowerCase();
  const isHigh = highCapture.some((s) => lowerName.includes(s));
  return isHigh ? 2.5 : 1.2;
}

async function getNextSerial(stateCode: string, year: number): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(treesTable)
    .where(
      and(
        eq(treesTable.stateCode, stateCode.toUpperCase()),
        sql`EXTRACT(YEAR FROM ${treesTable.plantationDate}) = ${year}`
      )
    );
  return (result[0]?.count ?? 0) + 1;
}

router.get("/trees", async (req, res): Promise<void> => {
  const parsed = ListTreesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { state, district, status, year } = parsed.data;

  const conditions = [];
  if (state) conditions.push(eq(treesTable.state, state));
  if (district) conditions.push(eq(treesTable.district, district));
  if (status) conditions.push(eq(treesTable.status, status));
  if (year) {
    conditions.push(sql`EXTRACT(YEAR FROM ${treesTable.plantationDate}) = ${year}`);
  }

  const trees = await db
    .select()
    .from(treesTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(treesTable.createdAt);

  res.json({ trees, total: trees.length });
});

router.post("/trees", async (req, res): Promise<void> => {
  const parsed = CreateTreeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const data = parsed.data;
  const now = new Date();
  const year = now.getFullYear();
  const serial = await getNextSerial(data.stateCode, year);
  const treeCode = generateTreeCode(data.stateCode, data.districtCode, year, serial);
  const carbonCredits = calculateCarbonCredits(data.species);

  const [tree] = await db
    .insert(treesTable)
    .values({
      treeCode,
      state: data.state,
      stateCode: data.stateCode.toUpperCase(),
      district: data.district,
      districtCode: data.districtCode.toUpperCase(),
      latitude: data.latitude,
      longitude: data.longitude,
      species: data.species,
      plantedBy: data.plantedBy,
      photoUrl: data.photoUrl ?? null,
      notes: data.notes ?? null,
      status: "planted",
      survivalStatus: "healthy",
      carbonCredits,
      serialNumber: serial,
      plantationDate: now,
    })
    .returning();

  res.status(201).json(tree);
});

router.get("/trees/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetTreeParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [tree] = await db
    .select()
    .from(treesTable)
    .where(eq(treesTable.id, params.data.id));

  if (!tree) {
    res.status(404).json({ error: "Tree not found" });
    return;
  }

  res.json(tree);
});

router.patch("/trees/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateTreeStatusParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateTreeStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = { status: parsed.data.status };
  if (parsed.data.survivalStatus) updateData.survivalStatus = parsed.data.survivalStatus;
  if (parsed.data.notes !== undefined) updateData.notes = parsed.data.notes;

  const [tree] = await db
    .update(treesTable)
    .set(updateData)
    .where(eq(treesTable.id, params.data.id))
    .returning();

  if (!tree) {
    res.status(404).json({ error: "Tree not found" });
    return;
  }

  res.json(tree);
});

router.delete("/trees/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetTreeParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [tree] = await db
    .delete(treesTable)
    .where(eq(treesTable.id, params.data.id))
    .returning();

  if (!tree) {
    res.status(404).json({ error: "Tree not found" });
    return;
  }

  res.json({ success: true });
});

export default router;
