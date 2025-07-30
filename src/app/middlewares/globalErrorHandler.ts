/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { envVariables } from "../config/env";
import AppError from "../errorHelpers/AppError";

// handling global error through out global scope of the application
export const globalErrorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {

    let statusCode = 500;
    let message = "Internal server error";

    if (error instanceof AppError) {
        statusCode = error.statusCode
        message = error.message
    } else if (error instanceof Error) {
        statusCode = 500;
        message = error.message;
    }

    res.status(statusCode).json({
        success: false,
        message,
        error,
        stack: envVariables.NODE_ENV === 'development' ? error.stack : null,
    });
}