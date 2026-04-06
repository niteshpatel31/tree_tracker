import { Router, type IRouter } from "express";
import { db, iotSensorsTable } from "../db";
import { eq, desc } from "drizzle-orm";

const router: IRouter = Router();

// Retrieve all IoT sensor data for a specific tree
router.get("/api/iot/:treeCode", async (req, res, next) => {
    try {
        const { treeCode } = req.params;
        const sensors = await db
            .select()
            .from(iotSensorsTable)
            .where(eq(iotSensorsTable.treeCode, treeCode))
            .orderBy(desc(iotSensorsTable.recordedAt))
            .limit(50);

        res.json(sensors);
    } catch (err) {
        next(err);
    }
});

// Post new IoT sensor data (e.g., from hardware)
router.post("/api/iot/:treeCode", async (req, res, next) => {
    try {
        const { treeCode } = req.params;
        const { soilMoisture, temperature, humidity } = req.body;

        let alertGenerated = null;
        if (soilMoisture < 20) alertGenerated = "NEEDS_WATER";
        else if (temperature > 40) alertGenerated = "HIGH_HEAT";

        const [newReading] = await db.insert(iotSensorsTable).values({
            treeCode,
            soilMoisture,
            temperature,
            humidity,
            alertGenerated
        }).returning();

        res.json(newReading);
    } catch (err) {
        next(err);
    }
});

export default router;
