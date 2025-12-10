import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma.service";
import {
  CreateProductDto,
  ProductAttributeInput,
} from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { Response } from "express";

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  // ------------------------------------------------------------
  // FORMAT PRODUCT — CLEAN UI FRIENDLY FORMAT
  // ------------------------------------------------------------
  private formatProduct(p: any) {
    if (!p) return null;

    return {
      id: p.id,
      name: p.product_name,
      sku: p.sku,
      qty: p.qty,
      rate: p.rate,

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

      extra: p.extra || {},

      attributes: p.attributes.map((attr) => ({
        id: attr.attribute_id,
        name: attr.attribute.attribute_name,
        type: attr.attribute.input_type,
        dataType: attr.attribute.data_type,
        required: attr.attribute.is_required,

        // final clean value
        value:
          attr.value_json !== null
            ? attr.value_json // JSON / Range
            : attr.attribute.data_type === "number"
            ? Number(attr.value_text)
            : attr.attribute.data_type === "boolean"
            ? attr.value_text === "true"
            : attr.value_text,
      })),
    };
  }

  // ------------------------------------------------------------
  // CREATE PRODUCT
  // ------------------------------------------------------------
  async create(data: CreateProductDto) {
    const { attributes, ...productData } = data as any;
    const created = await this.prisma.product_master.create({
      data: productData,
    });

    if (attributes?.length) {
      await Promise.all(
        attributes.map((a: ProductAttributeInput) =>
          this.prisma.product_attribute_values.create({
            data: {
              product_id: created.id,
              attribute_id: a.attribute_id,
              value_id: a.value_id || null,
              value_text: a.value_text || null,
              value_json: a.value_json || null,
            },
          })
        )
      );
    }

    return this.findOne(created.id);
  }

  // ------------------------------------------------------------
  // FIND ALL PRODUCTS + CLEAN FORMAT
  // ------------------------------------------------------------
  async findAll(query: any) {
    const {
      page = 1,
      limit = 20,
      brand_id,
      generic_id,
      category_id,
      group_id,
      search,
      attributes,
    } = query;

    const where: any = {};

    if (brand_id) where.brand_id = Number(brand_id);
    if (generic_id) where.generic_id = Number(generic_id);
    if (group_id)
      where.generic = { ...(where.generic || {}), group_id: Number(group_id) };
    if (category_id)
      where.generic = {
        ...(where.generic || {}),
        category_id: Number(category_id),
      };
    if (search) where.product_name = { contains: search, mode: "insensitive" };

    // Attribute filters
    if (attributes) {
      let attrs;
      try {
        attrs =
          typeof attributes === "string" ? JSON.parse(attributes) : attributes;
      } catch {
        attrs = null;
      }

      if (Array.isArray(attrs) && attrs.length) {
        where.AND = attrs.map((a) => ({
          attributes: {
            some: Object.fromEntries(
              Object.entries(a).map(([k, v]) => [
                k,
                typeof v === "string" ? { contains: v } : v,
              ])
            ),
          },
        }));
      }
    }

    const total = await this.prisma.product_master.count({ where });

    const data = await this.prisma.product_master.findMany({
      where,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      include: {
        brand: true,
        generic: {
          include: { group: true, category: true },
        },
        attributes: {
          include: { attribute: true },
        },
      },
      orderBy: { id: "desc" },
    });

    const formatted = data.map((p) => this.formatProduct(p));

    return {
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
      data: formatted,
    };
  }

  // ------------------------------------------------------------
  // FIND ONE PRODUCT + CLEAN FORMAT
  // ------------------------------------------------------------
  async findOne(id: number) {
    const p = await this.prisma.product_master.findUnique({
      where: { id },
      include: {
        brand: true,
        generic: {
          include: {
            group: true,
            category: true,
          },
        },
        attributes: {
          include: { attribute: true },
        },
      },
    });

    if (!p) throw new NotFoundException("Product not found");
    return this.formatProduct(p);
  }

  // ------------------------------------------------------------
  // UPDATE PRODUCT
  // ------------------------------------------------------------
  async update(id: number, data: UpdateProductDto) {
    await this.findOne(id);

    const { attributes, ...productData } = data as any;

    await this.prisma.product_master.update({
      where: { id },
      data: productData,
    });

    if (attributes) {
      await this.prisma.product_attribute_values.deleteMany({
        where: { product_id: id },
      });

      await Promise.all(
        (attributes as ProductAttributeInput[]).map((a) =>
          this.prisma.product_attribute_values.create({
            data: {
              product_id: id,
              attribute_id: a.attribute_id,
              value_id: a.value_id || null,
              value_text: a.value_text || null,
              value_json: a.value_json || null,
            },
          })
        )
      );
    }

    return this.findOne(id);
  }

  // ------------------------------------------------------------
  // DELETE PRODUCT
  // ------------------------------------------------------------
  async remove(id: number) {
    await this.findOne(id);

    await this.prisma.product_attribute_values.deleteMany({
      where: { product_id: id },
    });

    return this.prisma.product_master.delete({ where: { id } });
  }

  // ------------------------------------------------------------
  // EXPORT CSV
  // ------------------------------------------------------------
  async export(res: Response, query: any) {
    const result = await this.findAll({ ...query, page: 1, limit: 10000 });
    const products = result.data;

    const headers = [
      "id",
      "product_name",
      "brand",
      "generic",
      "qty",
      "rate",
      "sku",
      "extra",
    ];

    const rows = products.map((p) =>
      [
        p.id,
        `"${(p.name || "").replace(/"/g, '""')}"`,
        `"${(p.brand?.name || "").replace(/"/g, '""')}"`,
        `"${(p.generic?.name || "").replace(/"/g, '""')}"`,
        p.qty ?? "",
        p.rate ?? "",
        p.sku ? `"${p.sku.replace(/"/g, '""')}"` : "",
        p.extra ? `"${JSON.stringify(p.extra).replace(/"/g, '""')}"` : "",
      ].join(",")
    );

    const csv = [headers.join(","), ...rows].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="products.csv"');
    res.send(csv);
  }
}
