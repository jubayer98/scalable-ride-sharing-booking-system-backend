import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { riderServices } from "./ride.service";
import { JwtPayload } from "jsonwebtoken";

// request a new ride
const requestRide = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;
    const ride = await riderServices.requestRide(user.userId, req.body);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        message: "Ride requested",
        success: true,
        data: ride,
    });
});

// cancel the requested ride
const cancelRide = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const result = await riderServices.cancelRide(user.userId, req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Ride cancelled",
    success: true,
    data: result,
  });
});

// get the ride history by the rider
const getRideHistory = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;
    const result = await riderServices.getRideHistory(user.userId);
    
    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: "Ride history fetched",
        success: true,
        data: result,
    });
});

export const riderControllers = {
    requestRide,
    cancelRide,
    getRideHistory,
};
