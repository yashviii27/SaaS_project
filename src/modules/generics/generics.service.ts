import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma.service";

@Injectable()
export class GenericsService {
  constructor(private prisma: PrismaService) {}

  // ------------------------------------------------------------
  // CREATE GENERIC + ATTRIBUTES + VALUES
  // ------------------------------------------------------------
  async createGeneric(data: any) {
    const { generic_name, category_id, attributes } = data;

    if (!generic_name) throw new BadRequestException("generic_name is required");
    if (!category_id) throw new BadRequestException("category_id is required");
    if (!Array.isArray(attributes)) throw new BadRequestException("attributes must be an array");

    // 1️⃣ Create Generic (Correct Relational Syntax)
    // const generic = await this.prisma.generic_master.create({
    //   data: {
    //     generic_name: generic_name,
    //     category: {
    //       connect: { id: Number(category_id) }
    //     }
    //   }
    // });


    const generic = await this.prisma.generic_master.create({
  data: {
    generic_name: String(generic_name),

    // ⭐ REQUIRED by Prisma model
    group: {
      connect: { id: Number(data.group_id) }
    },

    // ⭐ REQUIRED by Prisma model
    category: {
      connect: { id: Number(category_id) }
    }
  }
});


    // 2️⃣ Create Attributes & Values
    for (const attr of attributes) {
      const attribute = await this.prisma.attribute_master.create({
        data: {
          generic_id: generic.id,
          attribute_name: attr.attribute_name,
          input_type: attr.input_type,
          data_type: attr.data_type,
          is_required: Boolean(attr.is_required),
        }
      });

      // Add attribute values (dropdown options)
      if (Array.isArray(attr.values) && attr.values.length > 0) {
        await this.prisma.attribute_values_master.createMany({
          data: attr.values.map(val => ({
            attribute_id: attribute.id,
            value: String(val)
          }))
        });
      }
    }

    return {
      success: true,
      message: "Generic created successfully with attributes & values",
      generic_id: generic.id
    };
  }

  // ------------------------------------------------------------
  // FIND ALL
  // ------------------------------------------------------------
  async findAll(params: any) {
    const { page = 1, limit = 20, search, category_id } = params;

    const where: any = {};

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
        attributes: {
          include: { values: true }
        },
        category: true,
      },
      orderBy: { id: "asc" },
    });

    return {
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
      data,
    };
  }

  // ------------------------------------------------------------
  // FIND ONE
  // ------------------------------------------------------------
  async findOne(id: number) {
    const item = await this.prisma.generic_master.findUnique({
      where: { id },
      include: {
        attributes: { include: { values: true } },
        category: true,
      },
    });

    if (!item) throw new NotFoundException("Generic not found");

    return item;
  }

  // ------------------------------------------------------------
  // UPDATE
  // ------------------------------------------------------------
  async update(id: number, data: any) {
    await this.findOne(id);

    return this.prisma.generic_master.update({
      where: { id },
      data: {
        generic_name: data.generic_name,
        category: {
          connect: { id: Number(data.category_id) }
        }
      }
    });
  }

  // ------------------------------------------------------------
  // DELETE
  // ------------------------------------------------------------
  async remove(id: number) {
    await this.findOne(id);

    // Delete attributes + values
    const attrs = await this.prisma.attribute_master.findMany({
      where: { generic_id: id },
    });

    for (const attr of attrs) {
      await this.prisma.attribute_values_master.deleteMany({
        where: { attribute_id: attr.id },
      });
    }

    await this.prisma.attribute_master.deleteMany({
      where: { generic_id: id }
    });

    return this.prisma.generic_master.delete({ where: { id } });
  }
}
