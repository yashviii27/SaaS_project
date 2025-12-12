"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttributeValuesController = void 0;
const common_1 = require("@nestjs/common");
const express_1 = require("express");
const attribute_values_service_1 = require("./attribute-values.service");
const create_attribute_value_dto_1 = require("./dto/create-attribute-value.dto");
const update_attribute_value_dto_1 = require("./dto/update-attribute-value.dto");
let AttributeValuesController = class AttributeValuesController {
    constructor(service) {
        this.service = service;
    }
    async create(req, dto) {
        if (req.role !== "admin")
            throw new common_1.ForbiddenException("Admin only");
        return this.service.create(dto);
    }
    async findAll(attribute_id, page, limit) {
        return this.service.findAll({
            attribute_id: attribute_id ? Number(attribute_id) : undefined,
            page: Number(page) || 1,
            limit: Number(limit) || 100,
        });
    }
    async findOne(id) {
        return this.service.findOne(Number(id));
    }
    async update(req, id, dto) {
        if (req.role !== "admin")
            throw new common_1.ForbiddenException("Admin only");
        return this.service.update(Number(id), dto);
    }
    async remove(req, id) {
        if (req.role !== "admin")
            throw new common_1.ForbiddenException("Admin only");
        return this.service.remove(Number(id));
    }
};
exports.AttributeValuesController = AttributeValuesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_a = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _a : Object, create_attribute_value_dto_1.CreateAttributeValueDto]),
    __metadata("design:returntype", Promise)
], AttributeValuesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)("attribute_id")),
    __param(1, (0, common_1.Query)("page")),
    __param(2, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number]),
    __metadata("design:returntype", Promise)
], AttributeValuesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AttributeValuesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(":id"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _b : Object, String, update_attribute_value_dto_1.UpdateAttributeValueDto]),
    __metadata("design:returntype", Promise)
], AttributeValuesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(":id"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _c : Object, String]),
    __metadata("design:returntype", Promise)
], AttributeValuesController.prototype, "remove", null);
exports.AttributeValuesController = AttributeValuesController = __decorate([
    (0, common_1.Controller)("attribute-values"),
    __metadata("design:paramtypes", [attribute_values_service_1.AttributeValuesService])
], AttributeValuesController);
//# sourceMappingURL=attribute-values.controller.js.map