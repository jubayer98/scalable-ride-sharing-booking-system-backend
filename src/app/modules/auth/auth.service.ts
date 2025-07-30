/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import AppError from "../../errorHelpers/AppError";
import { userModel } from "../user/user.model";
import httpStatus from "http-status-codes";
import bcryptjs from "bcryptjs";
import { createNewAccessTokenWithRefreshToken } from "../../utils/userToken";
import jwt, { JwtPayload } from "jsonwebtoken";
import { envVariables } from "../../config/env";
import { IsActive } from "../user/user.interface";
import { sendEmail } from "../../utils/sendEmail";

// get new access token service
const getNewAccessToken = async (refreshToken: string) => {
    const getNewAccessToken = await createNewAccessTokenWithRefreshToken(refreshToken);
    return {
        accessToken: getNewAccessToken
    }
}

// change password service
const changePassword = async (oldPassword: string, newPassword: string, decodedToken: JwtPayload) => {

    const user = await userModel.findById(decodedToken.userId);

    const isOldPasswordMatched = await bcryptjs.compare(oldPassword, user!.password as string);

    if (!isOldPasswordMatched) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Old password is incorrect");
    }

    user!.password = await bcryptjs.hash(newPassword, parseInt(envVariables.BCRYPT_SALT_ROUNDS));
    user!.save();
}

// reset password service
const resetPassword = async (payload: Record<string, any>, decodedToken: JwtPayload) => {
    if (payload.id != decodedToken.userId) {
        throw new AppError(401, "You can not reset your password")
    }

    const isUserExist = await userModel.findById(decodedToken.userId)
    if (!isUserExist) {
        throw new AppError(401, "User does not exist")
    }

    const hashedPassword = await bcryptjs.hash(
        payload.newPassword,
        Number(envVariables.BCRYPT_SALT_ROUNDS)
    )

    isUserExist.password = hashedPassword;

    await isUserExist.save()
}

// forgot password service using nodemailer
const forgotPassword = async (email: string) => {
    const isUserExists = await userModel.findOne({ email });

    if (!isUserExists) {
        throw new AppError(httpStatus.BAD_REQUEST, "User does not exist")
    }
    if (!isUserExists.isVerified) {
        throw new AppError(httpStatus.BAD_REQUEST, "User is not verified")
    }
    if (isUserExists.isActive === IsActive.BLOCKED || isUserExists.isActive === IsActive.INACTIVE) {
        throw new AppError(httpStatus.BAD_REQUEST, `User is ${isUserExists.isActive}`)
    }
    if (isUserExists.isDeleted) {
        throw new AppError(httpStatus.BAD_REQUEST, "User is deleted")
    }

    const jwtPayload = {
        userId: isUserExists._id,
        email: isUserExists.email,
        role: isUserExists.role
    }

    const resetToken = jwt.sign(jwtPayload, envVariables.JWT_ACCESS_SECRET, {
        expiresIn: "10m"
    })

    const resetUILink = `${envVariables.FRONTEND_URL}/reset-password?id=${isUserExists._id}&token=${resetToken}`

    sendEmail({
        to: isUserExists.email,
        subject: "Password Reset",
        templateName: "forgotPassword",
        templateData: {
            name: isUserExists.name,
            resetUILink
        }
    })
}

export const authServices = {
    getNewAccessToken,
    changePassword,
    resetPassword,
    forgotPassword
};