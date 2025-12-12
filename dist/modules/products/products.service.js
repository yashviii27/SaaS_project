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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
let ProductsService = class ProductsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    formatProduct(p) {
        if (!p)
            return null;
        return {
            id: p.id,
            name: p.product_name,
            sku: p.sku,
            qty: p.qty,
            rate: p.rate,
            extra: p.extra || {},
            brand: p.brand ? { id: p.brand.id, name: p.brand.brand_name } : null,
            generic: p.generic
                ? { id: p.generic.id, name: p.generic.generic_name }
                : null,
            group: p.generic?.group
                ? { id: p.generic.group.id, name: p.generic.group.group_name }
                : null,
            category: p.generic?.category
                ? { id: p.generic.category.id, name: p.generic.category.category_name }
                : null,
            attributes: p.attributes.map((a) => ({
                id: a.attribute_id,
                name: a.attribute.attribute_name,
                type: a.attribute.input_type,
                dataType: a.attribute.data_type,
                required: a.attribute.is_required,
                value: a.value_json !== null
                    ? a.value_json
                    : a.value_text
                        ? a.value_text
                        : null,
            })),
        };
    }
    async create(data) {
        const { brand_id, generic_id, attributes } = data;
        const brand = await this.prisma.brand_master.findUnique({
            where: { id: brand_id },
        });
        if (!brand)
            throw new common_1.NotFoundException(`Brand with ID '${brand_id}' not found`);
        const generic = await this.prisma.generic_master.findUnique({
            where: { id: generic_id },
        });
        if (!generic)
            throw new common_1.NotFoundException(`Generic with ID '${generic_id}' not found`);
        const product = await this.prisma.product_master.create({
            data: {
                product_name: data.product_name,
                brand_id,
                generic_id,
                qty: data.qty ?? 0,
                rate: data.rate ?? 0,
                sku: data.sku ?? null,
                extra: data.extra ?? null,
            },
        });
        if (attributes?.length) {
            for (const attr of attributes) {
                const meta = await this.prisma.attribute_master.findUnique({
                    where: { id: attr.attribute_id },
                });
                if (!meta)
                    throw new common_1.NotFoundException(`Attribute ID '${attr.attribute_id}' not found`);
                if (meta.generic_id !== generic_id)
                    throw new common_1.BadRequestException(`Attribute '${attr.attribute_id}' does not belong to this generic`);
                await this.prisma.product_attribute_values.create({
                    data: {
                        product_id: product.id,
                        attribute_id: attr.attribute_id,
                        value_text: attr.value_text ?? null,
                        value_json: attr.value_json ?? null,
                        value_id: null,
                    },
                });
            }
        }
        return this.findOne(product.id);
    }
    async findAll(query) {
        const { page = 1, limit = 20, brand_id, generic_id, category_id, group_id, search, } = query;
        const where = {};
        if (brand_id)
            where.brand_id = Number(brand_id);
        if (generic_id)
            where.generic_id = Number(generic_id);
        if (group_id)
            where.generic = { ...(where.generic || {}), group_id: Number(group_id) };
        if (category_id)
            where.generic = {
                ...(where.generic || {}),
                category_id: Number(category_id),
            };
        if (search)
            where.product_name = {
                contains: search,
                mode: "insensitive",
            };
        const total = await this.prisma.product_master.count({ where });
        const rows = await this.prisma.product_master.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            include: {
                brand: true,
                generic: { include: { group: true, category: true } },
                attributes: { include: { attribute: true } },
            },
            orderBy: { id: "desc" },
        });
        return {
            meta: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
            data: rows.map((p) => this.formatProduct(p)),
        };
    }
    async findOne(id) {
        const p = await this.prisma.product_master.findUnique({
            where: { id },
            include: {
                brand: true,
                generic: { include: { group: true, category: true } },
                attributes: { include: { attribute: true } },
            },
        });
        if (!p)
            throw new common_1.NotFoundException("Product not found");
        return this.formatProduct(p);
    }
    async update(id, data) {
        await this.findOne(id);
        const updateData = {};
        if (data.product_name)
            updateData.product_name = data.product_name;
        if (data.qty !== undefined)
            updateData.qty = data.qty;
        if (data.rate !== undefined)
            updateData.rate = data.rate;
        if (data.sku !== undefined)
            updateData.sku = data.sku;
        if (data.extra !== undefined)
            updateData.extra = data.extra;
        if (data.brand_id) {
            const exists = await this.prisma.brand_master.findUnique({
                where: { id: data.brand_id },
            });
            if (!exists)
                throw new common_1.NotFoundException(`Brand ID '${data.brand_id}' not found`);
            updateData.brand_id = data.brand_id;
        }
        if (data.generic_id) {
            const exists = await this.prisma.generic_master.findUnique({
                where: { id: data.generic_id },
            });
            if (!exists)
                throw new common_1.NotFoundException(`Generic ID '${data.generic_id}' not found`);
            updateData.generic_id = data.generic_id;
        }
        await this.prisma.product_master.update({
            where: { id },
            data: updateData,
        });
        if (data.attributes?.length) {
            await this.prisma.product_attribute_values.deleteMany({
                where: { product_id: id },
            });
            for (const attr of data.attributes) {
                await this.prisma.product_attribute_values.create({
                    data: {
                        product_id: id,
                        attribute_id: attr.attribute_id,
                        value_text: attr.value_text ?? null,
                        value_json: attr.value_json ?? null,
                        value_id: null,
                    },
                });
            }
        }
        return this.findOne(id);
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.product_attribute_values.deleteMany({
            where: { product_id: id },
        });
        return this.prisma.product_master.delete({
            where: { id },
        });
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
//# sourceMappingURL=products.service.js.map