/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { authServices } from "./auth.service";
import AppError from "../../errorHelpers/AppError";
import { setAuthCookie } from "../../utils/setCookies";
import passport from "passport";
import { createUserTokens } from "../../utils/userToken";
import { JwtPayload } from "jsonwebtoken";

// credential login through passport js
const credentialLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    passport.authenticate("local", async (error: any, user: any, info: any) => {

        if (error) {
            return next(new AppError(401, error))
        }

        if (!user) {
            return next(new AppError(401, info.message))
        }

        const userTokens = await createUserTokens(user)

        const { password: pass, ...rest } = user.toObject();

        setAuthCookie(res, userTokens)

        sendResponse(res, {
            statusCode: httpStatus.OK,
            message: "User logged in successfully",
            success: true,
            data: {
                accessToken: userTokens.accessToken,
                refreshToken: userTokens.refreshToken,
                user: rest
            },
        });
    })(req, res, next)
})

// getting new access token by requesting refresh token
const getNewAccessToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Refresh token is required");
    }

    const tokenInfo = await authServices.getNewAccessToken(refreshToken);

    setAuthCookie(res, tokenInfo);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: "Token refreshed successfully",
        success: true,
        data: tokenInfo,
    });
})

// logout functionality
const logout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    });

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: "User logged out successfully",
        success: true,
        data: null,
    });
});

// change password of the user
const changePassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const newPassword = req.body.newPassword;
    const oldPassword = req.body.oldPassword;
    const decodedToken = req.user;

    await authServices.changePassword(oldPassword, newPassword, decodedToken as JwtPayload);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: "Password change successfully",
        success: true,
        data: null,
    });
});

// reset password of the user
const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const decodedToken = req.user

    await authServices.resetPassword(req.body, decodedToken as JwtPayload);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Password reset successfully",
        data: null,
    })
})

// forgot password by user
const forgotPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const { email } = req.body;

    await authServices.forgotPassword(email);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Email sent successfully",
        data: null,
    })
})

export const authControllers = {
    credentialLogin,
    getNewAccessToken,
    logout,
    changePassword,
    resetPassword,
    forgotPassword
};