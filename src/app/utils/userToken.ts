import { JwtPayload } from "jsonwebtoken";
import { envVariables } from "../config/env";
import { IsActive, IUser } from "../modules/user/user.interface";
import { userModel } from "../modules/user/user.model";
import { generateToken, verifyToken } from "./jwt";
import AppError from "../errorHelpers/AppError";
import httpStatus from "http-status-codes";

export const createUserTokens = (user: Partial<IUser>) => {
    const jwtPayload = {
        userId: user._id,
        email: user.email,
        role: user.role
    }

    const accessToken = generateToken(jwtPayload, envVariables.JWT_ACCESS_SECRET, envVariables.JWT_ACCESS_EXPIRATION);
    const refreshToken = generateToken(jwtPayload, envVariables.JWT_REFRESH_SECRET, envVariables.JWT_REFRESH_EXPIRATION);

    return {
        accessToken,
        refreshToken,
    }
}

export const createNewAccessTokenWithRefreshToken = async (refreshToken: string) => {
    const verifiedRefreshToken = await verifyToken(refreshToken, envVariables.JWT_REFRESH_SECRET) as JwtPayload;

    const isUserExists = await userModel.findOne({ email: verifiedRefreshToken.email });

    if (!isUserExists) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    if (isUserExists.isActive === IsActive.BLOCKED || isUserExists.isActive === IsActive.INACTIVE) {
        throw new AppError(httpStatus.FORBIDDEN, `User is ${isUserExists.isActive.toLowerCase()}`);
    }

    if (isUserExists.isDeleted) {
        throw new AppError(httpStatus.NOT_FOUND, "User is deleted");
    }

    const jwtPayload = {
        userId: isUserExists._id,
        email: isUserExists.email,
        role: isUserExists.role
    };

    const accessToken = generateToken(jwtPayload, envVariables.JWT_ACCESS_SECRET, envVariables.JWT_ACCESS_EXPIRATION);

    return accessToken;
}