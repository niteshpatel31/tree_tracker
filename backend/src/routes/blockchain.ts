import { Router, type IRouter } from "express";
import { db, blockchainLogsTable } from "../db";
import { eq, desc } from "drizzle-orm";
import crypto from "crypto";

const router: IRouter = Router();

// Create a tamper proof ledger entry
router.post("/api/blockchain/log", async (req, res, next) => {
    try {
        const { treeCode, actionType } = req.body;

        // Generate a secure SHA-256 hash representing this exact transaction in time
        const rawData = `${treeCode}-${actionType}-${Date.now()}`;
        const transactionHash = crypto.createHash("sha256").update(rawData).digest("hex");

        const [log] = await db.insert(blockchainLogsTable).values({
            treeCode,
            actionType,
            transactionHash,
            blockNumber: "PENDING_MINT" // Placeholder until pushed to an external blockchain oracle
        }).returning();

        res.json(log);
    } catch (err) {
        next(err);
    }
});

// Fetch full audit trail for a single tree
router.get("/api/blockchain/:treeCode", async (req, res, next) => {
    try {
        const { treeCode } = req.params;
        const ledger = await db.select()
            .from(blockchainLogsTable)
            .where(eq(blockchainLogsTable.treeCode, treeCode))
            .orderBy(desc(blockchainLogsTable.recordedAt));

        res.json(ledger);
    } catch (err) {
        next(err);
    }
});

export default router;
