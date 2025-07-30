import { Schema, model, Types } from "mongoose";
import { DriverApprovalStatus, IDriver } from "./driver.interface";

const vehicleSchema = new Schema({
    make: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    licensePlate: { type: String, required: true },
}, { _id: false });

const earningsRecordSchema = new Schema({
    rideId: { type: Types.ObjectId, ref: "Ride", required: true },
    amount: { type: Number, required: true },
    completedAt: { type: Date, required: true },
}, { _id: false });

const driverSchema = new Schema<IDriver>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },

    approvalStatus: {
        type: String,
        enum: Object.values(DriverApprovalStatus),
        default: DriverApprovalStatus.PENDING,
    },
    isOnline: { type: Boolean, default: false },
    onRide: { type: Boolean, default: false },
    vehicleInfo: { type: vehicleSchema },
    currentRideId: { type: Types.ObjectId, ref: "Ride" },
    earningsHistory: [earningsRecordSchema],

}, {
    timestamps: true,
    versionKey: false,
});

export const driverModel = model<IDriver>('Driver', driverSchema);
