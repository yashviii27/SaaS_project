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
exports.BrandsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
const common_2 = require("@nestjs/common");
let BrandsService = class BrandsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const exists = await this.prisma.brand_master.findFirst({
            where: { brand_name: data.brand_name },
        });
        if (exists) {
            throw new common_2.BadRequestException("Brand name already exists");
        }
        return this.prisma.brand_master.create({ data });
    }
    async findAll(params) {
        const { page = 1, limit = 20, search } = params;
        const where = search
            ? { brand_name: { contains: search, mode: "insensitive" } }
            : {};
        const total = await this.prisma.brand_master.count({ where });
        const data = await this.prisma.brand_master.findMany({
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
        const brand = await this.prisma.brand_master.findUnique({ where: { id } });
        if (!brand)
            throw new common_1.NotFoundException("Brand not found");
        return brand;
    }
    async update(id, data) {
        await this.findOne(id);
        if (data.brand_name) {
            const exists = await this.prisma.brand_master.findFirst({
                where: {
                    brand_name: data.brand_name,
                    NOT: { id },
                },
            });
            if (exists) {
                throw new common_2.BadRequestException("Brand name already exists");
            }
        }
        return this.prisma.brand_master.update({ where: { id }, data });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.brand_master.delete({ where: { id } });
    }
};
exports.BrandsService = BrandsService;
exports.BrandsService = BrandsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BrandsService);
//# sourceMappingURL=brands.service.js.map