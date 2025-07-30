import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { driverServices } from "./driver.service";
import { JwtPayload } from "jsonwebtoken";

// update driver profile
const updateDriverProfile = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;

    const updatedDriver = await driverServices.updateDriverProfile(user.userId, req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: "Driver profile updated successfully",
        success: true,
        data: updatedDriver,
    });
});

// set availability (online/offline)
const updateAvailability = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;
    const { isOnline } = req.body;

    const result = await driverServices.updateAvailability(user.userId, isOnline);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: "Availability status updated",
        success: true,
        data: result,
    });
});

// accept or reject a ride
const respondToRideRequest = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;
    const { rideId, action } = req.body; // action = "accept" or "reject" based on rideId

    const result = await driverServices.respondToRideRequest(user.userId, rideId, action);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: `Ride ${action}ed successfully`,
        success: true,
        data: result,
    });
});

// update ride status
const updateRideStatus = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.user as JwtPayload;
    const { rideId, status, amount } = req.body;

    const ride = await driverServices.updateRideStatus(userId, rideId, status, amount);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: `Ride status updated to ${status}`,
        success: true,
        data: ride,
    });
});


// get all available rides information
const getAvailableRides = catchAsync(async (req: Request, res: Response) => {
    const result = await driverServices.getAvailableRides();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: "Available rides retrieved successfully",
        success: true,
        data: result.data,
        meta: result.meta,
    });
})

// view earnings history
const getEarningsHistory = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;

    const result = await driverServices.getEarningsHistory(user.userId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: "Earnings history retrieved",
        success: true,
        data: result,
    });
});

export const driverControllers = {
    updateAvailability,
    respondToRideRequest,
    updateRideStatus,
    getEarningsHistory,
    updateDriverProfile,
    getAvailableRides
};
