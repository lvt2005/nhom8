import { Router } from "express";
const router = Router();
import * as report from "../controller/report.controller";

router.post("/create", report.createReport);

export default router;
