import { Router, type IRouter } from "express";
import { db, treesTable, reportsTable } from "../db";
import { sql, eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/dashboard/stats", async (_req, res): Promise<void> => {
  const [treeCounts] = await db
    .select({
      totalTrees: sql<number>`count(*)`,
      totalPlanted: sql<number>`count(*) filter (where ${treesTable.status} = 'planted')`,
      totalCut: sql<number>`count(*) filter (where ${treesTable.status} = 'cut')`,
      totalAtRisk: sql<number>`count(*) filter (where ${treesTable.status} = 'at_risk')`,
      totalStates: sql<number>`count(distinct ${treesTable.stateCode})`,
      carbonCreditsTotal: sql<number>`coalesce(sum(${treesTable.carbonCredits}), 0)`,
      totalHealthy: sql<number>`count(*) filter (where ${treesTable.survivalStatus} = 'healthy')`,
    })
    .from(treesTable);

  const [reportCounts] = await db
    .select({ totalReports: sql<number>`count(*)` })
    .from(reportsTable);

  const totalTrees = Number(treeCounts?.totalTrees ?? 0);
  const totalPlanted = Number(treeCounts?.totalPlanted ?? 0);
  const totalHealthy = Number(treeCounts?.totalHealthy ?? 0);
  const survivalRate = totalTrees > 0 ? Math.round((totalHealthy / totalTrees) * 100 * 10) / 10 : 0;

  res.json({
    totalTrees,
    totalPlanted,
    totalCut: Number(treeCounts?.totalCut ?? 0),
    totalAtRisk: Number(treeCounts?.totalAtRisk ?? 0),
    totalStates: Number(treeCounts?.totalStates ?? 0),
    totalReports: Number(reportCounts?.totalReports ?? 0),
    carbonCreditsTotal: Number(treeCounts?.carbonCreditsTotal ?? 0),
    survivalRate,
  });
});

router.get("/dashboard/state-stats", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      state: treesTable.state,
      stateCode: treesTable.stateCode,
      totalTrees: sql<number>`count(*)`,
      planted: sql<number>`count(*) filter (where ${treesTable.status} = 'planted')`,
      cut: sql<number>`count(*) filter (where ${treesTable.status} = 'cut')`,
      atRisk: sql<number>`count(*) filter (where ${treesTable.status} = 'at_risk')`,
      healthy: sql<number>`count(*) filter (where ${treesTable.survivalStatus} = 'healthy')`,
    })
    .from(treesTable)
    .groupBy(treesTable.state, treesTable.stateCode)
    .orderBy(sql`count(*) desc`);

  const states = rows.map((row) => {
    const total = Number(row.totalTrees);
    const healthy = Number(row.healthy);
    const survivalRate = total > 0 ? Math.round((healthy / total) * 100 * 10) / 10 : 0;
    return {
      state: row.state,
      stateCode: row.stateCode,
      totalTrees: total,
      planted: Number(row.planted),
      cut: Number(row.cut),
      atRisk: Number(row.atRisk),
      survivalRate,
    };
  });

  res.json({ states });
});

router.get("/dashboard/year-stats", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      year: sql<number>`EXTRACT(YEAR FROM ${treesTable.plantationDate})`,
      planted: sql<number>`count(*) filter (where ${treesTable.status} = 'planted')`,
      cut: sql<number>`count(*) filter (where ${treesTable.status} = 'cut')`,
    })
    .from(treesTable)
    .groupBy(sql`EXTRACT(YEAR FROM ${treesTable.plantationDate})`)
    .orderBy(sql`EXTRACT(YEAR FROM ${treesTable.plantationDate})`);

  const years = rows.map((row) => ({
    year: Number(row.year),
    planted: Number(row.planted),
    cut: Number(row.cut),
  }));

  res.json({ years });
});

export default router;
