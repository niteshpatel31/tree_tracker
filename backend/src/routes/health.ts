import { Router, type IRouter } from "express";
import { healthCheckResponse } from "../generated/api";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data = healthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

export default router;
