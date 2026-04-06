import { Router, type IRouter } from "express";
import { db, reportsTable } from "../db";
import { CreateReportBody } from "../generated/api";

const router: IRouter = Router();

router.get("/reports", async (_req, res): Promise<void> => {
  const reports = await db
    .select()
    .from(reportsTable)
    .orderBy(reportsTable.createdAt);

  res.json({ reports, total: reports.length });
});

router.post("/reports", async (req, res): Promise<void> => {
  const parsed = CreateReportBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const data = parsed.data;

  const [report] = await db
    .insert(reportsTable)
    .values({
      treeId: data.treeId ?? null,
      treeCode: data.treeCode ?? null,
      reportType: data.reportType,
      reportedBy: data.reportedBy,
      description: data.description,
      photoUrl: data.photoUrl ?? null,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      state: data.state,
      district: data.district,
      status: "pending",
    })
    .returning();

  res.status(201).json(report);
});

export default router;
