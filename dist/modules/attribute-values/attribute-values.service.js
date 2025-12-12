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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttributeValuesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
let AttributeValuesService = class AttributeValuesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.attribute_values_master.create({ data });
    }
    async findAll(params) {
        const { attribute_id, page = 1, limit = 100 } = params;
        const where = {};
        if (attribute_id)
            where.attribute_id = attribute_id;
        const total = await this.prisma.attribute_values_master.count({ where });
        const data = await this.prisma.attribute_values_master.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { id: "asc" },
        });
        return {
            meta: { total, page, limit, pages: Math.ceil(total / limit) },
            data,
        };
    }
    async findOne(id) {
        const item = await this.prisma.attribute_values_master.findUnique({
            where: { id },
        });
        if (!item)
            throw new common_1.NotFoundException("Attribute value not found");
        return item;
    }
    async update(id, data) {
        await this.findOne(id);
        return this.prisma.attribute_values_master.update({ where: { id }, data });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.attribute_values_master.delete({ where: { id } });
    }
};
exports.AttributeValuesService = AttributeValuesService;
exports.AttributeValuesService = AttributeValuesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AttributeValuesService);
//# sourceMappingURL=attribute-values.service.js.map