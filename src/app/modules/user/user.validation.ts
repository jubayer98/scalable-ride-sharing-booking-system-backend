import z from "zod";
import { IsActive, Role } from "./user.interface";

const emailValidation = z.string().regex(
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  "Invalid email format"
);

const passwordValidation = z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must include at least one uppercase letter")
    .regex(/[a-z]/, "Must include at least one lowercase letter")
    .regex(/[0-9]/, "Must include at least one number")
    .regex(/[^A-Za-z0-9]/, "Must include at least one special character");

export const createUserZodSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: emailValidation,
    password: passwordValidation,
    phone: z.string().optional()
});

export const updateUserZodSchema = z.object({
    name: z.string().min(1, "Name is required").optional(),
    email: emailValidation.optional(),
    password: passwordValidation.optional(),
    phone: z.string().optional(),
    role: z.enum(Object.values(Role) as [string]).optional(),
    isActive: z.enum(Object.values(IsActive) as [string]).optional(),
    isDeleted: z.boolean().optional(),
    isVerified: z.boolean().optional(),
});