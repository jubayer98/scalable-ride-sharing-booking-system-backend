import { JwtPayload } from "jsonwebtoken";

// use global interface for using user information through out global scope
declare global {
  namespace Express {
    interface Request {
      user: JwtPayload & {
        userId: string;
        role: string;
      };
    }
  }
}
