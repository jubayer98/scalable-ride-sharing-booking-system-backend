/* eslint-disable @typescript-eslint/no-unused-vars */
import { Router } from "express";
import { riderControllers } from "./ride.controller";
import { Role } from "../user/user.interface";
import { checkAuth } from "../../middlewares/checkAuth";


const router = Router();

router.post("/request", checkAuth(Role.RIDER), riderControllers.requestRide);
router.get("/history", checkAuth(Role.RIDER), riderControllers.getRideHistory);
router.patch("/cancel/:id", checkAuth(Role.RIDER), riderControllers.cancelRide);

export const rideRoutes = router;