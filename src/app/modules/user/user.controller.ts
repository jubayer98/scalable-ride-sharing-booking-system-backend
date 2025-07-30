/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { userServices } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { JwtPayload } from "jsonwebtoken";

// create new user (by default user role will be rider)
const createUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = await userServices.createUser(req.body);
    
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        message: "User created successfully",
        success: true,
        data: user,
    });
})

// update the user information (role based access)
const updateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    const verifiedToken = req.user;
    const payload = req.body;

    const user = await userServices.updateUser(userId, payload, verifiedToken as JwtPayload);
    
    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: "User updated successfully",
        success: true,
        data: user,
    });
})

// get all user information by admin
const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await userServices.getAllUsers();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: "All users retrieved successfully",
        success: true,
        data: result.data,
        meta: result.meta,
    });
})

// get the user profile information
const getMe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;
    const result = await userServices.getMe(decodedToken.userId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: "User profile retrieved successfully",
        success: true,
        data: result.data
    });
})

// get a single user information (role based access)
const getSingleUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const result = await userServices.getSingleUser(id);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User Retrieved Successfully",
        data: result.data
    })
})

// generate report (role based access)
const generateUserReport = catchAsync(async (req: Request, res: Response) => {
  const decoded = req.user as JwtPayload;
  const report = await userServices.generateUserReport(decoded.role);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "User report generated successfully",
    success: true,
    data: report,
  });
});

export const userControllers = {
    createUser,
    updateUser,
    getSingleUser,
    getAllUsers,
    getMe,
    generateUserReport
}