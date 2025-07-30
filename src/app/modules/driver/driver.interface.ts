import { Types } from "mongoose";
import { IUser, Role } from "../user/user.interface";

export enum DriverApprovalStatus {
    PENDING = "pending",
    APPROVED = "approved",
    SUSPENDED = "suspended",
}

export interface IVehicle {
    make: string;
    model: string;
    year: number;
    licensePlate: string;
}

export interface IEarningsRecord {
    rideId: Types.ObjectId;
    amount: number;
    completedAt: Date;
}

export interface IDriver extends IUser {
    role: Role.DRIVER;
    approvalStatus: DriverApprovalStatus;
    onRide: boolean;
    isOnline: boolean;
    vehicleInfo: IVehicle;
    currentRideId?: Types.ObjectId;
    earningsHistory?: IEarningsRecord[];
}