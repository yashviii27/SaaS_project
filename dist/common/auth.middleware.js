"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMiddleware = void 0;
const common_1 = require("@nestjs/common");
let AuthMiddleware = class AuthMiddleware {
    use(req, res, next) {
        console.log("ADMIN RECEIVED:", req.headers["x-admin-key"]);
        console.log("USER RECEIVED:", req.headers["x-user-key"]);
        const adminKey = req.headers["x-admin-key"];
        const userKey = req.headers["x-user-key"];
        if (adminKey) {
            if (adminKey !== process.env.ADMIN_SECRET) {
                throw new common_1.UnauthorizedException("Invalid admin key");
            }
            req.role = "admin";
            return next();
        }
        if (userKey) {
            if (userKey !== process.env.USER_SECRET) {
                throw new common_1.UnauthorizedException("Invalid user key");
            }
            req.role = "user";
            return next();
        }
        throw new common_1.ForbiddenException("No valid credentials provided");
    }
};
exports.AuthMiddleware = AuthMiddleware;
exports.AuthMiddleware = AuthMiddleware = __decorate([
    (0, common_1.Injectable)()
], AuthMiddleware);
//# sourceMappingURL=auth.middleware.js.map