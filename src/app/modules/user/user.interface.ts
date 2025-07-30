import { Types } from "mongoose";

export enum Role {
    DRIVER = "driver",
    RIDER = "rider",
    ADMIN = "admin",
}

export enum IsActive {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    BLOCKED = "BLOCKED",
}

export interface IUser {
    _id: Types.ObjectId;
    name: string;
    email: string;
    password: string;
    phone?: string;
    isDeleted?: boolean;
    isActive?: IsActive;
    isVerified?: boolean;
    role: Role;
}