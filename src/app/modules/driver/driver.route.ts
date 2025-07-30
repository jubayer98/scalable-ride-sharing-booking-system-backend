import { Router } from "express";
import { driverControllers } from "./driver.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { checkDriverApproval } from "../../middlewares/checkDriverApproval";

const router = Router();

router.patch("/availability", checkAuth(Role.DRIVER), checkDriverApproval, driverControllers.updateAvailability);
router.post("/ride/respond", checkAuth(Role.DRIVER), checkDriverApproval, driverControllers.respondToRideRequest);
router.patch("/ride/status", checkAuth(Role.DRIVER), checkDriverApproval, driverControllers.updateRideStatus);
router.patch("/profile", checkAuth(Role.DRIVER), driverControllers.updateDriverProfile);
router.get("/earnings", checkAuth(Role.DRIVER), checkDriverApproval, driverControllers.getEarningsHistory);
router.get("/available-rides", checkAuth(Role.DRIVER), checkDriverApproval, driverControllers.getAvailableRides);

export const driverRoutes = router;
