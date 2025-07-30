import { Types } from "mongoose";

export enum RideStatus {
    REQUESTED = "requested",
    ACCEPTED = "accepted",
    PICKED_UP = "picked_up",
    IN_TRANSIT = "in_transit",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
}

export interface IRide {
    rider: Types.ObjectId;
    driver?: Types.ObjectId;
    pickupLocation: {
        lat: number;
        lng: number;
        address?: string;
    };
    destinationLocation: {
        lat: number;
        lng: number;
        address?: string;
    };
    status: RideStatus;
    timestamps?: {
        requested?: Date;
        accepted?: Date;
        picked_up?: Date;
        in_transit?: Date;
        completed?: Date;
        cancelled?: Date;
    };
    amount?: number;
}
