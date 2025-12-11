import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request & { role?: string }, res: Response, next: NextFunction) {

    console.log("ADMIN RECEIVED:", req.headers["x-admin-key"]);
    console.log("USER RECEIVED:", req.headers["x-user-key"]);

    const adminKey = req.headers["x-admin-key"];
    const userKey = req.headers["x-user-key"];

    if (adminKey) {
      if (adminKey !== process.env.ADMIN_SECRET) {
        throw new UnauthorizedException("Invalid admin key");
      }
      req.role = "admin";
      return next();
    }

    if (userKey) {
      if (userKey !== process.env.USER_SECRET) {
        throw new UnauthorizedException("Invalid user key");
      }
      req.role = "user";
      return next();
    }

    throw new ForbiddenException("No valid credentials provided");
  }
}
