import { Router, type IRouter } from "express";
import { db, aiAnalysesTable } from "../db";
import { eq, desc } from "drizzle-orm";

const router: IRouter = Router();

// Log an AI analysis result
router.post("/api/ai/analyze", async (req, res, next) => {
    try {
        const { treeCode, photoUrl, analysisType, aiResult, confidenceScore, diseaseDetected, recommendedSpecies } = req.body;

        const [analysis] = await db.insert(aiAnalysesTable).values({
            treeCode,
            photoUrl,
            analysisType,
            aiResult,
            confidenceScore,
            diseaseDetected,
            recommendedSpecies
        }).returning();

        res.json(analysis);
    } catch (err) {
        next(err);
    }
});

// Get AI analysis history for a tree
router.get("/api/ai/:treeCode", async (req, res, next) => {
    try {
        const { treeCode } = req.params;
        const history = await db.select()
            .from(aiAnalysesTable)
            .where(eq(aiAnalysesTable.treeCode, treeCode))
            .orderBy(desc(aiAnalysesTable.analyzedAt));

        res.json(history);
    } catch (err) {
        next(err);
    }
});

export default router;
