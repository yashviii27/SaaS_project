import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const key =
      (req.headers["x-api-key"] as string) || process.env.ADMIN_API_KEY; // allow fallback to env key for dev
    if (!key) {
      throw new UnauthorizedException("Missing x-api-key header.");
    }
    // Basic validation: ADMIN_ or USER_ prefix
    if (key.startsWith("ADMIN_")) {
      (req as any).role = "admin";
      (req as any).apiKey = key;
    } else if (key.startsWith("USER_")) {
      (req as any).role = "user";
      (req as any).apiKey = key;
    } else {
      // allow env fallback: if env ADMIN key equals provided key, mark admin
      const adminEnv = process.env.ADMIN_API_KEY;
      const userEnv = process.env.USER_API_KEY;
      if (key === adminEnv) {
        (req as any).role = "admin";
        (req as any).apiKey = key;
      } else if (key === userEnv) {
        (req as any).role = "user";
        (req as any).apiKey = key;
      } else {
        throw new UnauthorizedException("Invalid x-api-key");
      }
    }
    next();
  }
}
