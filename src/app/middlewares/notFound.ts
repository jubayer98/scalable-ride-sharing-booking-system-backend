import { Request, Response } from 'express';
import httpStatus from 'http-status-codes';

// show the default error if the route is not defined in the index.ts
const notFound = (req: Request, res: Response) => {
    res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: 'Route not found',
    });
}

export default notFound;