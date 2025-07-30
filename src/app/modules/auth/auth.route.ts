import { Router } from "express";
import { authControllers } from "./auth.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";

const router = Router();

router.post("/login", authControllers.credentialLogin);
router.post("/refresh-token", authControllers.getNewAccessToken);
router.post("/logout", authControllers.logout);
router.post("/change-password", checkAuth(...Object.values(Role)), authControllers.changePassword);
router.post("/forgot-password", authControllers.forgotPassword);
router.post("/reset-password", checkAuth(...Object.values(Role)), authControllers.resetPassword);

export const authRoutes = router;