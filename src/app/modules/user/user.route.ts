import { Router } from "express";
import { userControllers } from "./user.controller";
import { createUserZodSchema } from "./user.validation";
import { validateRequest } from "../../middlewares/validateRequest";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "./user.interface";

const router = Router();

router.post("/register", validateRequest(createUserZodSchema), userControllers.createUser);
router.get("/all-users", checkAuth(Role.ADMIN), userControllers.getAllUsers);
router.get("/me", checkAuth(...Object.values(Role)), userControllers.getMe);
router.get("/report", checkAuth(Role.ADMIN), userControllers.generateUserReport);
router.get("/:id", checkAuth(Role.ADMIN), userControllers.getSingleUser);
router.patch("/:id", checkAuth(...Object.values(Role)), userControllers.updateUser);

export const userRoutes = router;