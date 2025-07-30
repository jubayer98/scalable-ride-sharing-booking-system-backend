// middlewares/checkDriverApproval.ts

import { Request, Response, NextFunction } from "express";
import { driverModel } from "../modules/driver/driver.model";
import { DriverApprovalStatus } from "../modules/driver/driver.interface";
import AppError from "../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";

// check driver profile is being approved by admin or not
export const checkDriverApproval = async (req: Request, res: Response, next: NextFunction) => {
    const driverId = (req.user as JwtPayload).userId;

    const driver = await driverModel.findById(driverId);

    if (!driver) {
        throw new AppError(httpStatus.NOT_FOUND, "Driver not found");
    }

    if (driver.approvalStatus === DriverApprovalStatus.PENDING) {
        throw new AppError(httpStatus.FORBIDDEN, "Driver profile pending approval. Please update your profile.");
    }

    if (driver.approvalStatus === DriverApprovalStatus.SUSPENDED) {
        throw new AppError(httpStatus.FORBIDDEN, "Driver is suspended by admin.");
    }

    next();
};
