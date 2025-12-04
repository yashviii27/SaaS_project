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

  async create(data: CreateProductDto) {
    const { attributes, ...productData } = data as any;
    const created = await this.prisma.product_master.create({
      data: productData,
    });
    if (attributes && attributes.length) {
      const createOps = attributes.map((a: ProductAttributeInput) =>
        this.prisma.product_attribute_values.create({
          data: {
            product_id: created.id,
            attribute_id: a.attribute_id,
            value_id: a.value_id || null,
            value_text: a.value_text || null,
            value_json: a.value_json || null,
          },
        })
      );
      await Promise.all(createOps);
    }
    return this.findOne(created.id);
  }

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
      where.generic = { ...where.generic, group_id: Number(group_id) };
    if (category_id)
      where.generic = { ...where.generic, category_id: Number(category_id) };
    if (search) where.product_name = { contains: search, mode: "insensitive" };

    // attribute filters: attributes expected as JSON string: [{"attribute_id":1,"value_text":"32"}]
    if (attributes) {
      let attrs;
      try {
        attrs =
          typeof attributes === "string" ? JSON.parse(attributes) : attributes;
      } catch (e) {
        attrs = null;
      }
      if (Array.isArray(attrs) && attrs.length) {
        // build AND over attributes using some
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
        generic: true,
        attributes: { include: { attribute: true } },
      },
      orderBy: { id: "desc" },
    });

    return {
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
      data,
    };
  }

  async findOne(id: number) {
    const p = await this.prisma.product_master.findUnique({
      where: { id },
      include: {
        brand: true,
        generic: true,
        attributes: { include: { attribute: true } },
      },
    });
    if (!p) throw new NotFoundException("Product not found");
    return p;
  }

  async update(id: number, data: UpdateProductDto) {
    await this.findOne(id);
    const { attributes, ...productData } = data as any;
    const updated = await this.prisma.product_master.update({
      where: { id },
      data: productData,
    });
    // handle attributes if provided (simple strategy: remove existing and re-create provided)
    if (attributes) {
      await this.prisma.product_attribute_values.deleteMany({
        where: { product_id: id },
      });
      const createOps = (attributes as ProductAttributeInput[]).map((a) =>
        this.prisma.product_attribute_values.create({
          data: {
            product_id: id,
            attribute_id: a.attribute_id,
            value_id: a.value_id || null,
            value_text: a.value_text || null,
            value_json: a.value_json || null,
          },
        })
      );
      await Promise.all(createOps);
    }
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    // cascade delete attributes then product
    await this.prisma.product_attribute_values.deleteMany({
      where: { product_id: id },
    });
    return this.prisma.product_master.delete({ where: { id } });
  }

  // Export CSV (simple)
  async export(res: Response, query: any) {
    const result = await this.findAll({ ...query, page: 1, limit: 10000 });
    const products = result.data;
    // build CSV header
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
        `"${(p.product_name || "").replace(/"/g, '""')}"`,
        `"${(p.brand?.brand_name || "").replace(/"/g, '""')}"`,
        `"${(p.generic?.generic_name || "").replace(/"/g, '""')}"`,
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
