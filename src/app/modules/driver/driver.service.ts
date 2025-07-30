import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { driverModel } from "./driver.model";
import { rideModel } from "../ride/ride.model";
import { RideStatus } from "../ride/ride.interface";
import { DriverApprovalStatus } from "./driver.interface";
import mongoose from "mongoose";

// update driver profile service
const updateDriverProfile = async (driverId: string,
    vehicleInfo: {
        make: string;
        model: string;
        year: number;
        licensePlate: string;
    }) => {
    const { make, model, year, licensePlate } = vehicleInfo;

    // basic validation for driver approval (like vehicle information must be provided)
    if (!make || !model || !year || !licensePlate) {
        throw new AppError(httpStatus.BAD_REQUEST, "All vehicle information fields are required.");
    }

    const driver = await driverModel.findById(driverId);
    if (!driver) {
        throw new AppError(httpStatus.NOT_FOUND, "Driver not found");
    }

    driver.vehicleInfo = { make, model, year, licensePlate };
    driver.approvalStatus = DriverApprovalStatus.APPROVED;

    await driver.save();

    return driver;
};

// set availability status service
const updateAvailability = async (driverId: string, isOnline: boolean) => {
    const driver = await driverModel.findById(driverId);
    if (!driver) throw new AppError(httpStatus.NOT_FOUND, "Driver not found");

    if (driver.approvalStatus !== DriverApprovalStatus.APPROVED) {
        throw new AppError(httpStatus.FORBIDDEN, "Driver not approved");
    }

    driver.isOnline = isOnline;
    await driver.save();

    return driver;
};

// accept or reject a ride
const respondToRideRequest = async (
    driverId: string,
    rideId: string,
    action: "accept" | "reject"
) => {
    const driver = await driverModel.findById(driverId);
    if (!driver) {
        throw new AppError(httpStatus.NOT_FOUND, "Driver not found");
    }

    // must be online
    if (!driver.isOnline) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            "You must be online to respond to ride requests"
        );
    }

    // already on another ride
    if (driver.onRide) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            "You are already on a ride. Complete it before accepting a new one."
        );
    }

    const ride = await rideModel.findById(rideId);
    if (!ride) {
        throw new AppError(httpStatus.NOT_FOUND, "Ride not found");
    }

    if (ride.status !== RideStatus.REQUESTED) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Ride has already been accepted or cancelled"
        );
    }

    if (action === "reject") {
        ride.status = RideStatus.CANCELLED;
        ride.timestamps = { ...ride.timestamps, cancelled: new Date() };
    } else {
        ride.driver = new mongoose.Types.ObjectId(driverId);
        ride.status = RideStatus.ACCEPTED;
        ride.timestamps = { ...ride.timestamps, accepted: new Date() };

        // assign ride and mark driver as on ride
        driver.currentRideId = ride._id;
        driver.onRide = true;
        await driver.save();
    }

    await ride.save();
    return ride;
};


// update ride status (picked_up, in_transit, completed)
const updateRideStatus = async (
    driverId: string,
    rideId: string,
    status: RideStatus,
    amount?: number
) => {
    const ride = await rideModel.findById(rideId);
    if (!ride) throw new AppError(httpStatus.NOT_FOUND, "Ride not found");

    if (ride.driver?.toString() !== driverId) {
        throw new AppError(httpStatus.FORBIDDEN, "You are not assigned to this ride");
    }

    // define allowed status transitions
    const allowedTransitions: Record<RideStatus, RideStatus[]> = {
        [RideStatus.ACCEPTED]: [RideStatus.PICKED_UP],
        [RideStatus.PICKED_UP]: [RideStatus.IN_TRANSIT],
        [RideStatus.IN_TRANSIT]: [RideStatus.COMPLETED],
        [RideStatus.REQUESTED]: [],
        [RideStatus.CANCELLED]: [],
        [RideStatus.COMPLETED]: [],
    };

    const validNextStatuses = allowedTransitions[ride.status];
    if (!validNextStatuses.includes(status)) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            `Invalid status transition from '${ride.status}' to '${status}'`
        );
    }

    const driver = await driverModel.findById(driverId);
    if (!driver) throw new AppError(httpStatus.NOT_FOUND, "Driver not found");

    // handle ride completion logic
    if (status === RideStatus.COMPLETED) {
        if (typeof amount !== "number" || amount <= 0) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                "Valid amount must be provided to complete the ride"
            );
        }

        ride.amount = amount;
        ride.timestamps = { ...ride.timestamps, completed: new Date() };

        driver.currentRideId = undefined;
        driver.onRide = false;
        driver.earningsHistory?.push({
            rideId: ride._id,
            amount,
            completedAt: new Date(),
        });

        await driver.save();
    } else {
        // intermediate status (picked_up, in_transit)
        ride.timestamps = { ...ride.timestamps, [status]: new Date() };
    }

    ride.status = status;
    await ride.save();

    return ride;
};


// get all available rides information
const getAvailableRides = async () => {
    const rides = await rideModel.find({ status: RideStatus.REQUESTED });

    const totalRequestedRides = await rideModel.countDocuments({ status: RideStatus.REQUESTED });

    return {
        data: rides,
        meta: {
            total: totalRequestedRides,
        }
    };
};

// get driver earnings history service
const getEarningsHistory = async (driverId: string) => {
    const driver = await driverModel.findById(driverId).select("earningsHistory");
    if (!driver) throw new AppError(httpStatus.NOT_FOUND, "Driver not found");

    return driver.earningsHistory || [];
};

export const driverServices = {
    updateAvailability,
    respondToRideRequest,
    updateRideStatus,
    getEarningsHistory,
    updateDriverProfile,
    getAvailableRides
};