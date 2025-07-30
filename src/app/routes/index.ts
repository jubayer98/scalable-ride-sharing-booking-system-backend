import { Router } from "express";
import { userRoutes } from "../modules/user/user.route";
import { authRoutes } from "../modules/auth/auth.route";
import { rideRoutes } from "../modules/ride/ride.route";
import { driverRoutes } from "../modules/driver/driver.route";

export const router = Router();

const moduleRoutes = [
    {
        path: "/user",
        route: userRoutes,
    },
    {
        path: "/auth",
        route: authRoutes,
    },
    {
        path: "/ride",
        route: rideRoutes,
    },
    {
        path: "/driver",
        route: driverRoutes,
    }
]

moduleRoutes.forEach((route) => {
    router.use(route.path, route.route);
});