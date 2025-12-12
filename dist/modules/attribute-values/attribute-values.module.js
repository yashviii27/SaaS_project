"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttributeValuesModule = void 0;
const common_1 = require("@nestjs/common");
const attribute_values_service_1 = require("./attribute-values.service");
const attribute_values_controller_1 = require("./attribute-values.controller");
const prisma_service_1 = require("../../common/prisma.service");
let AttributeValuesModule = class AttributeValuesModule {
};
exports.AttributeValuesModule = AttributeValuesModule;
exports.AttributeValuesModule = AttributeValuesModule = __decorate([
    (0, common_1.Module)({
        controllers: [attribute_values_controller_1.AttributeValuesController],
        providers: [attribute_values_service_1.AttributeValuesService, prisma_service_1.PrismaService],
        exports: [attribute_values_service_1.AttributeValuesService],
    })
], AttributeValuesModule);
//# sourceMappingURL=attribute-values.module.js.map