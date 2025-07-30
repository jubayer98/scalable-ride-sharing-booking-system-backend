import AppError from "../../errorHelpers/AppError";
import { IsActive, IUser, Role } from "./user.interface";
import { userModel } from "./user.model";
import httpStatus from "http-status-codes";
import bcrypt from "bcryptjs";
import { envVariables } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";
import { driverModel } from "../driver/driver.model";
import { DriverApprovalStatus } from "../driver/driver.interface";

// create/register new user service
const createUser = async (payload: Partial<IUser>) => {
    const { email, password, ...rest } = payload;

    const isUserExist = await userModel.findOne({ email }).select("-password");

    if (isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "User already exists with this email");
    }

    const hashedPassword = await bcrypt.hash(password as string, parseInt(envVariables.BCRYPT_SALT_ROUNDS));

    const user = await userModel.create({
        email,
        password: hashedPassword,
        ...rest,
    })

    return user;
}

// update user service
const updateUser = async (userId: string, payload: Partial<IUser>, decodedToken: JwtPayload) => {
    const existingUser = await userModel.findById(userId).select("-password");
    if (!existingUser) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    const previousRole = existingUser.role;

    // only admins can update role
    if (payload.role && payload.role !== previousRole) {
        if (decodedToken.role !== Role.ADMIN) {
            throw new AppError(httpStatus.FORBIDDEN, "You are not allowed to update role");
        }

        if (payload.role === Role.DRIVER) {
            const existingDriver = await driverModel.findById(userId);
            if (!existingDriver) {
                await driverModel.create({
                    _id: existingUser._id,
                    name: existingUser.name,
                    email: existingUser.email,
                    phone: existingUser.phone,
                    password: existingUser.password,
                    role: Role.DRIVER,
                    isActive: existingUser.isActive,
                    isDeleted: existingUser.isDeleted,
                    isVerified: existingUser.isVerified,
                    approvalStatus: DriverApprovalStatus.PENDING,
                    isOnline: false,
                    vehicleInfo: {
                        make: "To be updated",
                        model: "To be updated",
                        year: 1900,
                        licensePlate: "To be updated",
                    },
                    earningsHistory: [],
                });
            }
        }

        if (previousRole === Role.DRIVER && payload.role === Role.RIDER) {
            await driverModel.findByIdAndDelete(userId);
        }
    }

    // only admins can update sensitive status fields
    const statusFields = ["isActive", "isDeleted", "isVerified"];
    const hasStatusFields = statusFields.some((field) => field in payload);
    if (hasStatusFields && decodedToken.role !== Role.ADMIN) {
        throw new AppError(httpStatus.FORBIDDEN, "You are not allowed to update user status");
    }

    // hash password if provided
    if (payload.password) {
        payload.password = await bcrypt.hash(
            payload.password,
            parseInt(envVariables.BCRYPT_SALT_ROUNDS)
        );
    }

    // check email uniqueness
    if (payload.email) {
        const existingEmailUser = await userModel.findOne({ email: payload.email });
        if (existingEmailUser && existingEmailUser._id.toString() !== userId) {
            throw new AppError(httpStatus.BAD_REQUEST, "Email already exists");
        }
    }

    // updates user document
    const updatedUser = await userModel.findByIdAndUpdate(userId, payload, {
        new: true,
        runValidators: true,
    });

    // driver-specific approval status logic
    if (existingUser.role === Role.DRIVER) {
        const driver = await driverModel.findById(userId);
        if (driver) {
            const effectiveIsActive = payload.isActive ?? existingUser.isActive;
            const effectiveIsDeleted = payload.isDeleted ?? existingUser.isDeleted;
            const effectiveIsVerified = payload.isVerified ?? existingUser.isVerified;

            // suspend
            if (
                effectiveIsActive === IsActive.INACTIVE ||
                effectiveIsDeleted === true ||
                effectiveIsVerified === false
            ) {
                driver.approvalStatus = DriverApprovalStatus.SUSPENDED;
                await driver.save();
            }

            // re-approve
            if (payload.isActive === IsActive.ACTIVE) {
                if (effectiveIsDeleted !== false || effectiveIsVerified !== true) {
                    throw new AppError(
                        httpStatus.BAD_REQUEST,
                        "Cannot activate user. To be ACTIVE, user must be VERIFIED and NOT DELETED."
                    );
                }
                driver.approvalStatus = DriverApprovalStatus.APPROVED;
                await driver.save();
            }
        }
    }

    return updatedUser;
};

// get all user information admins only
const getAllUsers = async () => {
    const users = await userModel.find().select("-password");;
    const totalUsers = await userModel.countDocuments();

    return {
        data: users,
        meta: {
            total: totalUsers,
        }
    };
}

// get the individual profile information (for any role)
const getMe = async (userId: string) => {
    const user = await userModel.findById(userId).select("-password");
    return {
        data: user
    }
};

// get the single user information admin only
const getSingleUser = async (id: string) => {
    const user = await userModel.findById(id).select("-password");
    return {
        data: user
    }
};

// report generation by admin only
const generateUserReport = async (role: Role) => {
    if (role !== Role.ADMIN) {
        throw new AppError(httpStatus.FORBIDDEN, "Only admin can generate user report");
    }

    const totalUsers = await userModel.countDocuments();
    const activeUsers = await userModel.countDocuments({ isActive: IsActive.ACTIVE });
    const blockedUsers = await userModel.countDocuments({ isActive: IsActive.BLOCKED });
    const deletedUsers = await userModel.countDocuments({ isDeleted: true });
    const verifiedUsers = await userModel.countDocuments({ isVerified: true });
    const unverifiedUsers = await userModel.countDocuments({ isVerified: false });

    return {
        totalUsers,
        activeUsers,
        blockedUsers,
        deletedUsers,
        verifiedUsers,
        unverifiedUsers,
    };
};

export const userServices = {
    createUser,
    updateUser,
    getSingleUser,
    getAllUsers,
    getMe,
    generateUserReport
}