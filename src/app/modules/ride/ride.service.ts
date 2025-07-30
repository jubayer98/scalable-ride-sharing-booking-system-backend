import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { rideModel } from "./ride.model";
import { RideStatus } from "./ride.interface";

// requested ride service by providing pickup/destination location and latitude and longitude
const requestRide = async (
  riderId: string,
  {
    pickupLocation,
    destinationLocation,
  }: {
    pickupLocation: { lat: number; lng: number; address?: string };
    destinationLocation: { lat: number; lng: number; address?: string };
  }
) => {

  const existingRide = await rideModel.findOne({
    rider: riderId,
    status: { $in: [RideStatus.REQUESTED, RideStatus.ACCEPTED, RideStatus.PICKED_UP, RideStatus.IN_TRANSIT] },
  });
  if (existingRide) {
    throw new AppError(httpStatus.BAD_REQUEST, "You already have an active ride");
  }

  const ride = await rideModel.create({
    rider: riderId,
    pickupLocation,
    destinationLocation,
    status: RideStatus.REQUESTED,
    timestamps: {
      requested: new Date(),
    },
  });

  return ride;
};

// cancel the requested ride service by rider
const cancelRide = async (riderId: string, rideId: string) => {
  const ride = await rideModel.findById(rideId);
  if (!ride) throw new AppError(httpStatus.NOT_FOUND, "Ride not found");

  if (ride.rider.toString() !== riderId)
    throw new AppError(httpStatus.FORBIDDEN, "Unauthorized");

  if (ride.status !== RideStatus.REQUESTED)
    throw new AppError(httpStatus.BAD_REQUEST, "You can only cancel the requested ride");

  ride.status = RideStatus.CANCELLED;
  ride.timestamps = { ...ride.timestamps, cancelled: new Date() };
  await ride.save();

  return ride;
};

// get all the ride history by the rider
const getRideHistory = async (riderId: string) => {
  return rideModel.find({ rider: riderId }).sort({ createdAt: -1 });
};

export const riderServices = {
  requestRide,
  cancelRide,
  getRideHistory,
};
