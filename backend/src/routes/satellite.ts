import { Router, type IRouter } from "express";
import { db, satelliteScansTable } from "../db";
import { eq, desc } from "drizzle-orm";

const router: IRouter = Router();

// Post a new satellite satellite scan map
router.post("/api/satellite/scan", async (req, res, next) => {
    try {
        const { regionCode, latitude, longitude, ndviScore, previousNdviScore } = req.body;

        // Auto detect red zones based on significant NDVI drops (e.g. rapid deforestation)
        const isRedZone = (previousNdviScore - ndviScore) > 0.2;

        const [scan] = await db.insert(satelliteScansTable).values({
            regionCode,
            latitude,
            longitude,
            ndviScore,
            previousNdviScore,
            isRedZone
        }).returning();

        res.json(scan);
    } catch (err) {
        next(err);
    }
});

// Get all recent red zones
router.get("/api/satellite/red-zones", async (req, res, next) => {
    try {
        const redZones = await db.select()
            .from(satelliteScansTable)
            .where(eq(satelliteScansTable.isRedZone, true))
            .orderBy(desc(satelliteScansTable.scanDate))
            .limit(100);

        res.json(redZones);
    } catch (err) {
        next(err);
    }
});

export default router;
