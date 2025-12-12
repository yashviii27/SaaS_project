import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../common/prisma.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  // ------------------------------------------------------------
  // FORMAT PRODUCT
  // ------------------------------------------------------------
  private formatProduct(p: any) {
    if (!p) return null;

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
        value:
          a.value_json !== null
            ? a.value_json
            : a.value_text
            ? a.value_text
            : null,
      })),
    };
  }

  // ------------------------------------------------------------
  // CREATE PRODUCT
  // ------------------------------------------------------------
  async create(data: CreateProductDto) {
    const { brand_id, generic_id, attributes } = data;

    // Validate brand ID
    const brand = await this.prisma.brand_master.findUnique({
      where: { id: brand_id },
    });
    if (!brand)
      throw new NotFoundException(`Brand with ID '${brand_id}' not found`);

    // Validate generic ID
    const generic = await this.prisma.generic_master.findUnique({
      where: { id: generic_id },
    });
    if (!generic)
      throw new NotFoundException(`Generic with ID '${generic_id}' not found`);

    // Create basic product
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

    // Insert attributes
    if (attributes?.length) {
      for (const attr of attributes) {
        // Validate attribute
        const meta = await this.prisma.attribute_master.findUnique({
          where: { id: attr.attribute_id },
        });

        if (!meta)
          throw new NotFoundException(
            `Attribute ID '${attr.attribute_id}' not found`
          );

        if (meta.generic_id !== generic_id)
          throw new BadRequestException(
            `Attribute '${attr.attribute_id}' does not belong to this generic`
          );

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
  // UPDATE PRODUCT
  // ------------------------------------------------------------
  async update(id: number, data: UpdateProductDto) {
    await this.findOne(id);

    const updateData: any = {};

    if (data.product_name) updateData.product_name = data.product_name;
    if (data.qty !== undefined) updateData.qty = data.qty;
    if (data.rate !== undefined) updateData.rate = data.rate;
    if (data.sku !== undefined) updateData.sku = data.sku;
    if (data.extra !== undefined) updateData.extra = data.extra;

    // Update brand_id
    if (data.brand_id) {
      const exists = await this.prisma.brand_master.findUnique({
        where: { id: data.brand_id },
      });
      if (!exists)
        throw new NotFoundException(`Brand ID '${data.brand_id}' not found`);
      updateData.brand_id = data.brand_id;
    }

    // Update generic_id
    if (data.generic_id) {
      const exists = await this.prisma.generic_master.findUnique({
        where: { id: data.generic_id },
      });
      if (!exists)
        throw new NotFoundException(
          `Generic ID '${data.generic_id}' not found`
        );
      updateData.generic_id = data.generic_id;
    }

    // Update base product
    await this.prisma.product_master.update({
      where: { id },
      data: updateData,
    });

    // Update attributes
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

  // ------------------------------------------------------------
  // DELETE PRODUCT
  // ------------------------------------------------------------
  async remove(id: number) {
    await this.findOne(id);

    await this.prisma.product_attribute_values.deleteMany({
      where: { product_id: id },
    });

    return this.prisma.product_master.delete({
      where: { id },
    });
  }
}
