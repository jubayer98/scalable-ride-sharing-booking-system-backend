import { NextFunction, Request, Response } from "express";
import AppError from "../errorHelpers/AppError";
import { verifyToken } from "../utils/jwt";
import { JwtPayload } from "jsonwebtoken";
import { envVariables } from "../config/env";
import { userModel } from "../modules/user/user.model";
import httpStatus from "http-status-codes";
import { IsActive } from "../modules/user/user.interface";

// check only the authenticate user can login in the system
export const checkAuth = (...authRoles: string[]) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const accessToken = req.headers.authorization;

        if (!accessToken) {
            throw new AppError(403, "Access token is missing");
        }

        const verifiedToken = verifyToken(accessToken, envVariables.JWT_ACCESS_SECRET) as JwtPayload;

        const isUserExists = await userModel.findOne({ email: verifiedToken.email });

        if (!isUserExists) {
            throw new AppError(httpStatus.NOT_FOUND, "User not found");
        }

        if (!isUserExists.isVerified) {
            throw new AppError(httpStatus.BAD_REQUEST, "User is not verified");
        }

        if (isUserExists.isActive === IsActive.BLOCKED || isUserExists.isActive === IsActive.INACTIVE) {
            throw new AppError(httpStatus.FORBIDDEN, `User is ${isUserExists.isActive.toLowerCase()}`);
        }

        if (isUserExists.isDeleted) {
            throw new AppError(httpStatus.NOT_FOUND, "User is deleted");
        }

        if (!authRoles.includes(verifiedToken.role)) {
            throw new AppError(403, "You do not have permission to access this route");
        }
        req.user = verifiedToken;
        next();
    } catch (error) {
        next(error)
    }
}
