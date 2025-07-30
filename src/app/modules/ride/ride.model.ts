import { Schema, model } from "mongoose";
import { IRide, RideStatus } from "./ride.interface";

const locationSchema = new Schema({
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String },
}, { _id: false });

const rideSchema = new Schema<IRide>({
    rider: { type: Schema.Types.ObjectId, ref: "Rider", required: true },
    driver: { type: Schema.Types.ObjectId, ref: "Driver" },

    pickupLocation: { type: locationSchema, required: true },
    destinationLocation: { type: locationSchema, required: true },

    status: {
        type: String,
        enum: Object.values(RideStatus),
        default: RideStatus.REQUESTED,
    },

    timestamps: {
        requested: Date,
        accepted: Date,
        picked_up: Date,
        in_transit: Date,
        completed: Date,
        cancelled: Date,
    },
}, {
    timestamps: true,
    versionKey: false,
});

export const rideModel = model<IRide>("Ride", rideSchema);
