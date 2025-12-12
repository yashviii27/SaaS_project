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
exports.GroupsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
let GroupsService = class GroupsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const exist = await this.prisma.group_master.findFirst({
            where: { group_name: data.group_name },
        });
        if (exist) {
            throw new common_1.BadRequestException("Group name already exists");
        }
        return this.prisma.group_master.create({
            data: {
                group_name: data.group_name,
            },
        });
    }
    async findAll(params) {
        const { page = 1, limit = 20, search } = params;
        const where = search
            ? { group_name: { contains: search, mode: "insensitive" } }
            : {};
        const total = await this.prisma.group_master.count({ where });
        const data = await this.prisma.group_master.findMany({
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
        const group = await this.prisma.group_master.findUnique({
            where: { id },
        });
        if (!group) {
            throw new common_1.NotFoundException("Group not found");
        }
        return {
            id: group.id,
            group_name: group.group_name,
            created_at: group.created_at,
            updated_at: group.updated_at,
        };
    }
    async update(id, data) {
        await this.findOne(id);
        if (data.group_name) {
            const exists = await this.prisma.group_master.findFirst({
                where: {
                    group_name: data.group_name,
                    NOT: { id },
                },
            });
            if (exists) {
                throw new common_1.BadRequestException("Group name already exists");
            }
        }
        const cleanData = {};
        if (data.group_name)
            cleanData.group_name = data.group_name;
        return this.prisma.group_master.update({
            where: { id },
            data: cleanData,
        });
    }
    async remove(id) {
        const group = await this.prisma.group_master.findUnique({
            where: { id },
        });
        if (!group) {
            throw new common_1.NotFoundException("Group not found");
        }
        const genericsCount = await this.prisma.generic_master.count({
            where: { group_id: id },
        });
        if (genericsCount > 0) {
            throw new common_1.BadRequestException("Cannot delete group because it has related generics.");
        }
        return this.prisma.group_master.delete({
            where: { id },
        });
    }
};
exports.GroupsService = GroupsService;
exports.GroupsService = GroupsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GroupsService);
//# sourceMappingURL=groups.service.js.map