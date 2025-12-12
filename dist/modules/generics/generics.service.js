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
exports.GenericsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
let GenericsService = class GenericsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    formatGenericResponse(generic) {
        return {
            id: generic.id,
            name: generic.generic_name,
            group: generic.group
                ? {
                    id: generic.group.id,
                    name: generic.group.group_name,
                }
                : null,
            category: generic.category
                ? {
                    id: generic.category.id,
                    name: generic.category.category_name,
                }
                : null,
            description: generic.description ?? null,
            attributes: generic.attributes.map((attr) => {
                return {
                    id: attr.id,
                    name: attr.attribute_name,
                    type: attr.input_type,
                    dataType: attr.data_type,
                    required: attr.is_required,
                    extra: attr.extra ?? null,
                };
            }),
        };
    }
    async createGeneric(data) {
        const { generic_name, category_id, group_id, attributes } = data;
        if (!generic_name)
            throw new common_1.BadRequestException("generic_name is required");
        if (!group_id)
            throw new common_1.BadRequestException("group_id is required");
        if (!category_id)
            throw new common_1.BadRequestException("category_id is required");
        if (!Array.isArray(attributes))
            throw new common_1.BadRequestException("attributes must be an array");
        const allowedInputTypes = ["open", "dropdown"];
        for (const attr of attributes) {
            if (!allowedInputTypes.includes(attr.input_type)) {
                throw new common_1.BadRequestException(`Invalid input_type '${attr.input_type}'. Allowed: open, dropdown`);
            }
        }
        const generic = await this.prisma.generic_master.create({
            data: {
                generic_name,
                group: { connect: { id: Number(group_id) } },
                category: { connect: { id: Number(category_id) } },
            },
        });
        for (const attr of attributes) {
            const createdAttr = await this.prisma.attribute_master.create({
                data: {
                    generic_id: generic.id,
                    attribute_name: attr.attribute_name,
                    input_type: attr.input_type,
                    data_type: attr.data_type,
                    is_required: attr.is_required,
                },
            });
            const saveValue = async (val) => {
                await this.prisma.attribute_values_master.create({
                    data: {
                        attribute_id: createdAttr.id,
                        value: val,
                    },
                });
            };
            if (attr.input_type === "dropdown") {
                const finalValues = [];
                for (const v of attr.values) {
                    let parsedValue = v.value;
                    try {
                        parsedValue = JSON.parse(v.value);
                    }
                    catch {
                        if (v.value === "true")
                            parsedValue = true;
                        else if (v.value === "false")
                            parsedValue = false;
                        else if (!isNaN(v.value))
                            parsedValue = Number(v.value);
                    }
                    await saveValue(parsedValue);
                    finalValues.push(parsedValue);
                }
                await this.prisma.attribute_master.update({
                    where: { id: createdAttr.id },
                    data: { extra: { options: finalValues } },
                });
            }
            if (attr.input_type === "open" && attr.default) {
                await saveValue(attr.default);
            }
            if (attr.data_type === "number" && attr.numberType === "single") {
                if (attr.default != null) {
                    await saveValue(Number(attr.default));
                }
                await this.prisma.attribute_master.update({
                    where: { id: createdAttr.id },
                    data: { extra: { type: "single" } },
                });
            }
            if (attr.data_type === "number" && attr.numberType === "range") {
                const rangeObj = { min: attr.min ?? null, max: attr.max ?? null };
                await saveValue(rangeObj);
                await this.prisma.attribute_master.update({
                    where: { id: createdAttr.id },
                    data: {
                        extra: {
                            type: "range",
                            ...rangeObj,
                        },
                    },
                });
            }
            if (attr.data_type === "boolean") {
                await saveValue(true);
                await saveValue(false);
                await this.prisma.attribute_master.update({
                    where: { id: createdAttr.id },
                    data: {
                        extra: { type: "boolean" },
                    },
                });
            }
            if (attr.data_type === "date") {
                const format = attr.format ?? "YYYY-MM-DD";
                await saveValue({ format });
                await this.prisma.attribute_master.update({
                    where: { id: createdAttr.id },
                    data: { extra: { format } },
                });
            }
        }
        return {
            success: true,
            message: "Generic created successfully",
            generic_id: generic.id,
        };
    }
    async findAll(params) {
        const { page = 1, limit = 20, search, category_id } = params;
        const where = {};
        if (search) {
            where.generic_name = { contains: search, mode: "insensitive" };
        }
        if (category_id) {
            where.category_id = Number(category_id);
        }
        const total = await this.prisma.generic_master.count({ where });
        const data = await this.prisma.generic_master.findMany({
            where,
            skip: (page - 1) * limit,
            take: Number(limit),
            include: {
                attributes: true,
                category: true,
                group: true,
            },
            orderBy: { id: "asc" },
        });
        const formatted = data.map((item) => this.formatGenericResponse(item));
        return {
            pagination: { total, page, limit, pages: Math.ceil(total / limit) },
            data: formatted,
        };
    }
    async findOne(id) {
        const item = await this.prisma.generic_master.findUnique({
            where: { id },
            include: {
                attributes: true,
                group: true,
                category: true,
            },
        });
        if (!item)
            throw new common_1.NotFoundException("Generic not found");
        return this.formatGenericResponse(item);
    }
    async update(id, data) {
        await this.findOne(id);
        return this.prisma.generic_master.update({
            where: { id },
            data: {
                generic_name: data.generic_name,
                category: { connect: { id: Number(data.category_id) } },
            },
        });
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.attribute_master.deleteMany({
            where: { generic_id: id },
        });
        return this.prisma.generic_master.delete({
            where: { id },
        });
    }
};
exports.GenericsService = GenericsService;
exports.GenericsService = GenericsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GenericsService);
//# sourceMappingURL=generics.service.js.map