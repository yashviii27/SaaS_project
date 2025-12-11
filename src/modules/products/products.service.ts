import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma.service";
import { CreateProductDto } from "./dto/create-product.dto";
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

        value:
          attr.value_json !== null
            ? attr.value_json
            : attr.attribute.data_type === "number"
            ? Number(attr.value_text)
            : attr.attribute.data_type === "boolean"
            ? attr.value_text === "true"
            : attr.value_text,
      })),
    };
  }

  // ------------------------------------------------------------
  // NORMALIZE ATTRIBUTE VALUE
  // ------------------------------------------------------------
  private normalizeAttributeValue(value: any, meta: any) {
    // JSON / range
    if (meta.data_type === "number" && typeof value === "object") {
      return { value_id: null, value_text: null, value_json: value };
    }

    // dropdown → value_id
    if (meta.input_type === "dropdown") {
      return { value_id: Number(value), value_text: null, value_json: null };
    }

    // boolean
    if (meta.data_type === "boolean") {
      return {
        value_id: null,
        value_text: value ? "true" : "false",
        value_json: null,
      };
    }

    // number
    if (meta.data_type === "number") {
      return { value_id: null, value_text: String(value), value_json: null };
    }

    // date
    if (meta.data_type === "date") {
      return { value_id: null, value_text: value, value_json: null };
    }

    // default text
    return { value_id: null, value_text: String(value), value_json: null };
  }

  // ------------------------------------------------------------
  // CREATE PRODUCT
  // ------------------------------------------------------------
  async create(data: CreateProductDto) {
    const { attributes } = data;

    // Brand
    const brand = await this.prisma.brand_master.findFirst({
      where: { brand_name: data.brand },
    });
    if (!brand) throw new NotFoundException(`Brand '${data.brand}' not found`);

    // Generic
    const generic = await this.prisma.generic_master.findFirst({
      where: { generic_name: data.generic },
    });
    if (!generic)
      throw new NotFoundException(`Generic '${data.generic}' not found`);

    // Product create
    const created = await this.prisma.product_master.create({
      data: {
        product_name: data.product_name,
        brand_id: brand.id,
        generic_id: generic.id,
        qty: data.qty || 0,
        rate: data.rate || 0,
        sku: data.sku || null,
        extra: data.extra || null,
      },
    });

    // Create attributes
    if (attributes?.length) {
      for (const attr of attributes) {
        const meta = await this.prisma.attribute_master.findFirst({
          where: {
            generic_id: generic.id,
            attribute_name: attr.name,
          },
        });

        if (!meta)
          throw new NotFoundException(`Attribute '${attr.name}' not found`);

        const normalized = this.normalizeAttributeValue(attr.value, meta);

        await this.prisma.product_attribute_values.create({
          data: {
            product_id: created.id,
            attribute_id: meta.id,
            ...normalized,
          },
        });
      }
    }

    return this.findOne(created.id);
  }

  // ------------------------------------------------------------
  // FIND ALL
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

    if (search)
      where.product_name = { contains: search, mode: "insensitive" };

    // Attribute filter
    if (attributes) {
      let attrsParsed;
      try {
        attrsParsed =
          typeof attributes === "string" ? JSON.parse(attributes) : attributes;
      } catch {
        attrsParsed = null;
      }

      if (Array.isArray(attrsParsed) && attrsParsed.length) {
        where.AND = attrsParsed.map((a) => ({
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
        generic: { include: { group: true, category: true } },
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
      data: data.map((p) => this.formatProduct(p)),
    };
  }

  // ------------------------------------------------------------
  // FIND ONE
  // ------------------------------------------------------------
  async findOne(id: number) {
    const p = await this.prisma.product_master.findUnique({
      where: { id },
      include: {
        brand: true,
        generic: { include: { group: true, category: true } },
        attributes: { include: { attribute: true } },
      },
    });

    if (!p) throw new NotFoundException("Product not found");
    return this.formatProduct(p);
  }

  // ------------------------------------------------------------
  // UPDATE
  // ------------------------------------------------------------
  async update(id: number, data: UpdateProductDto) {
  await this.findOne(id);

  const { attributes, brand, generic, ...productData } = data;

  const updateData: any = { ...productData };

  // -------------------------------------------------------
  // 1️⃣ If brand name is sent → convert to brand_id
  // -------------------------------------------------------
  if (brand) {
    const brandRecord = await this.prisma.brand_master.findFirst({
      where: { brand_name: brand },
    });

    if (!brandRecord) {
      throw new NotFoundException(`Brand '${brand}' not found`);
    }

    updateData.brand_id = brandRecord.id;
  }

  // -------------------------------------------------------
  // 2️⃣ If generic name is sent → convert to generic_id
  // -------------------------------------------------------
  if (generic) {
    const genericRecord = await this.prisma.generic_master.findFirst({
      where: { generic_name: generic },
    });

    if (!genericRecord) {
      throw new NotFoundException(`Generic '${generic}' not found`);
    }

    updateData.generic_id = genericRecord.id;
  }

  // -------------------------------------------------------
  // 3️⃣ Update product without wrong fields
  // -------------------------------------------------------
  await this.prisma.product_master.update({
    where: { id },
    data: updateData,
  });

  // -------------------------------------------------------
  // 4️⃣ Update attributes using name/value logic
  // -------------------------------------------------------
  if (attributes?.length) {
    await this.prisma.product_attribute_values.deleteMany({
      where: { product_id: id },
    });

    // find product again to get generic_id
    const product = await this.prisma.product_master.findUnique({
      where: { id },
    });

    for (const attr of attributes) {
      const meta = await this.prisma.attribute_master.findFirst({
        where: {
          generic_id: product.generic_id,
          attribute_name: attr.name,
        },
      });

      if (!meta)
        throw new NotFoundException(
          `Attribute '${attr.name}' not found for this generic`
        );

      const normalized = this.normalizeAttributeValue(attr.value, meta);

      await this.prisma.product_attribute_values.create({
        data: {
          product_id: id,
          attribute_id: meta.id,
          ...normalized,
        },
      });
    }
  }

  return this.findOne(id);
}



  // ------------------------------------------------------------
  // DELETE
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
