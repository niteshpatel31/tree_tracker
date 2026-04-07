import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, reportsTable, treesTable } from "../db";
import { createReportBody } from "../generated/api";

const router: IRouter = Router();

router.get("/reports", async (_req, res): Promise<void> => {
  const reports = await db
    .select()
    .from(reportsTable)
    .orderBy(reportsTable.createdAt);

  res.json({ reports, total: reports.length });
});

router.post("/reports", async (req, res): Promise<void> => {
  const parsed = createReportBody.safeParse(req.body);
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

router.patch("/reports/:id/action", async (req, res): Promise<void> => {
  const userType = req.headers["x-user-type"] as string;
  if (userType !== "officer" && userType !== "admin") {
    res.status(403).json({ error: "Only officers or admins can act on reports" });
    return;
  }

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const reportId = parseInt(raw, 10);
  if (isNaN(reportId)) {
    res.status(400).json({ error: "Invalid report ID" });
    return;
  }

  const { status } = req.body;
  if (status !== "verified" && status !== "rejected") {
    res.status(400).json({ error: "Status must be verified or rejected" });
    return;
  }

  const [report] = await db
    .update(reportsTable)
    .set({ status })
    .where(eq(reportsTable.id, reportId))
    .returning();

  if (!report) {
    res.status(404).json({ error: "Report not found" });
    return;
  }

  // Update underlying tree status based on the report type if verified
  if (status === "verified" && report.treeId) {
    if (report.reportType === "cutting" || report.reportType === "illegal_cutting") {
      await db.update(treesTable).set({ status: "cut" }).where(eq(treesTable.id, report.treeId));
    } else if (report.reportType === "survival_check") {
      await db.update(treesTable).set({ survivalStatus: "at_risk" }).where(eq(treesTable.id, report.treeId));
    }
  }

  res.json(report);
});

export default router;
