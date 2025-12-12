"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiKeyMiddleware = void 0;
const common_1 = require("@nestjs/common");
let ApiKeyMiddleware = class ApiKeyMiddleware {
    use(req, res, next) {
        if (req.method === "OPTIONS") {
            return next();
        }
        const key = req.headers["x-api-key"];
        if (!key) {
            throw new common_1.UnauthorizedException("Missing x-api-key header.");
        }
        if (key.startsWith("ADMIN_")) {
            req.role = "admin";
        }
        else if (key.startsWith("USER_")) {
            req.role = "user";
        }
        else {
            if (key === process.env.ADMIN_API_KEY) {
                req.role = "admin";
            }
            else if (key === process.env.USER_API_KEY) {
                req.role = "user";
            }
            else {
                throw new common_1.UnauthorizedException("Invalid x-api-key");
            }
        }
        next();
    }
};
exports.ApiKeyMiddleware = ApiKeyMiddleware;
exports.ApiKeyMiddleware = ApiKeyMiddleware = __decorate([
    (0, common_1.Injectable)()
], ApiKeyMiddleware);
//# sourceMappingURL=api-key.middleware.js.map