import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // --- Allow preflight requests ---
    if (req.method === "OPTIONS") {
      return next();
    }

    const key = req.headers["x-api-key"] as string;

    if (!key) {
      throw new UnauthorizedException("Missing x-api-key header.");
    }

    // Basic prefix rule
    if (key.startsWith("ADMIN_")) {
      (req as any).role = "admin";
    } else if (key.startsWith("USER_")) {
      (req as any).role = "user";
    } else {
      // Fallback to env vars
      if (key === process.env.ADMIN_API_KEY) {
        (req as any).role = "admin";
      } else if (key === process.env.USER_API_KEY) {
        (req as any).role = "user";
      } else {
        throw new UnauthorizedException("Invalid x-api-key");
      }
    }

    next();
  }
}
