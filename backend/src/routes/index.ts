import { Router, type IRouter } from "express";
import healthRouter from "./health";
import treesRouter from "./trees";
import reportsRouter from "./reports";
import dashboardRouter from "./dashboard";
import authRouter from "./auth";
import adminRouter from "./admin";
import iotRouter from "./iot";
import aiRouter from "./ai";
import satelliteRouter from "./satellite";
import blockchainRouter from "./blockchain";

const router: IRouter = Router();

router.use(authRouter);
router.use(adminRouter);
router.use(healthRouter);
router.use(treesRouter);
router.use(reportsRouter);
router.use(dashboardRouter);
router.use(iotRouter);
router.use(aiRouter);
router.use(satelliteRouter);
router.use(blockchainRouter);

export default router;
