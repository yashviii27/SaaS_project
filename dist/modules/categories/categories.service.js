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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
let CategoriesService = class CategoriesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const exists = await this.prisma.category_master.findFirst({
            where: { category_name: data.category_name },
        });
        if (exists) {
            throw new common_1.BadRequestException("Category name already exists");
        }
        return this.prisma.category_master.create({
            data: {
                category_name: data.category_name,
            },
        });
    }
    async findAll(params) {
        const { page = 1, limit = 20, search } = params;
        const where = {};
        if (search) {
            where.category_name = { contains: search, mode: "insensitive" };
        }
        const total = await this.prisma.category_master.count({ where });
        const data = await this.prisma.category_master.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { id: "asc" },
        });
        return {
            meta: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
            data,
        };
    }
    async findOne(id) {
        const cat = await this.prisma.category_master.findUnique({
            where: { id },
        });
        if (!cat) {
            throw new common_1.NotFoundException("Category not found");
        }
        return cat;
    }
    async update(id, data) {
        await this.findOne(id);
        if (data.category_name) {
            const exists = await this.prisma.category_master.findFirst({
                where: {
                    category_name: data.category_name,
                    NOT: { id },
                },
            });
            if (exists) {
                throw new common_1.BadRequestException("Category name already exists");
            }
        }
        return this.prisma.category_master.update({
            where: { id },
            data: {
                category_name: data.category_name,
            },
        });
    }
    async remove(id) {
        await this.findOne(id);
        const linkedGenerics = await this.prisma.generic_master.count({
            where: { category_id: id },
        });
        if (linkedGenerics > 0) {
            throw new common_1.BadRequestException("Category cannot be deleted because it is used in generic records.");
        }
        return this.prisma.category_master.delete({
            where: { id },
        });
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map