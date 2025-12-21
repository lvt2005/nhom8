import { Router } from "express";
import * as controller from "../controller/password.controller";

const router = Router();

router.post("/forgot-password", controller.requestPasswordReset);
router.post("/verify-otp", controller.verifyOTP);
router.post("/reset-password", controller.resetPassword);

export default router;
