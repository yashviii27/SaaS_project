import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma.service";

@Injectable()
export class GenericsService {
  constructor(private prisma: PrismaService) {}

  // ------------------------------------------------------------
  // CREATE GENERIC + ATTRIBUTES + VALUES
  // ------------------------------------------------------------
  async createGeneric(data: any) {
    const { generic_name, category_id, group_id, attributes } = data;

    if (!generic_name) throw new BadRequestException("generic_name is required");
    if (!group_id) throw new BadRequestException("group_id is required");
    if (!category_id) throw new BadRequestException("category_id is required");
    if (!Array.isArray(attributes)) throw new BadRequestException("attributes must be an array");

    // Allowed input types
    const allowedInputTypes = ["open", "dropdown"];

    for (const attr of attributes) {
      if (!allowedInputTypes.includes(attr.input_type)) {
        throw new BadRequestException(
          `Invalid input_type '${attr.input_type}'. Allowed: open, dropdown`
        );
      }
    }

    // 1️⃣ Create Generic
    const generic = await this.prisma.generic_master.create({
      data: {
        generic_name: String(generic_name),
        group: { connect: { id: Number(group_id) } },
        category: { connect: { id: Number(category_id) } }
      }
    });

    // 2️⃣ Create Attributes + Values
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

      if (attr.input_type === "dropdown" && Array.isArray(attr.values)) {
        await this.prisma.attribute_values_master.createMany({
          data: attr.values.map((val) => ({
            attribute_id: attribute.id,
            value: String(val)
          }))
        });
      }
    }

    return {
      status: "success",
      message: "Generic created successfully",
      timestamp: new Date().toISOString(),
      generic_id: generic.id
    };
  }

  // ------------------------------------------------------------
  // FIND ALL (PROFESSIONAL FORMAT)
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
        attributes: { include: { values: true } },
        category: true,
        group: true
      },
      orderBy: { id: "asc" },
    });

    // ---------- FORMAT RESPONSE PROFESSIONALLY ----------
    const items = data.map((item) => ({
      id: item.id,
      name: item.generic_name,
      description: item.description,

      group: item.group
        ? { id: item.group.id, name: item.group.group_name }
        : null,

      category: item.category
        ? { id: item.category.id, name: item.category.category_name }
        : null,

      attributes: item.attributes.map((attr) => ({
        id: attr.id,
        name: attr.attribute_name,
        type: attr.input_type,
        required: attr.is_required,
        dataType: attr.data_type,
        options: attr.values.map((v) => ({
          id: v.id,
          label: v.value,
          value: v.value
        }))
      }))
    }));

    return {
      status: "success",
      message: "Generics fetched successfully",
      timestamp: new Date().toISOString(),

      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      },

      items
    };
  }

  // ------------------------------------------------------------
  // FIND ONE (PROFESSIONAL FORMAT)
  // ------------------------------------------------------------
  async findOne(id: number) {
    const item = await this.prisma.generic_master.findUnique({
      where: { id },
      include: {
        attributes: { include: { values: true } },
        category: true,
        group: true
      },
    });

    if (!item) throw new NotFoundException("Generic not found");

    return {
      status: "success",
      message: "Generic fetched successfully",
      timestamp: new Date().toISOString(),

      item: {
        id: item.id,
        name: item.generic_name,
        description: item.description,

        group: item.group
          ? { id: item.group.id, name: item.group.group_name }
          : null,

        category: item.category
          ? { id: item.category.id, name: item.category.category_name }
          : null,

        attributes: item.attributes.map((attr) => ({
          id: attr.id,
          name: attr.attribute_name,
          type: attr.input_type,
          required: attr.is_required,
          dataType: attr.data_type,
          options: attr.values.map((v) => ({
            id: v.id,
            label: v.value,
            value: v.value
          }))
        }))
      }
    };
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
        category: { connect: { id: Number(data.category_id) } }
      }
    });
  }

  // ------------------------------------------------------------
  // DELETE (with protection)
  // ------------------------------------------------------------
 async remove(id: number) {
  // 1️⃣ Check if generic exists
  await this.findOne(id);

  // 2️⃣ Fetch all attributes for this generic
  const attrs = await this.prisma.attribute_master.findMany({
    where: { generic_id: id },
  });

  // 3️⃣ Delete all attribute values
  for (const attr of attrs) {
    await this.prisma.attribute_values_master.deleteMany({
      where: { attribute_id: attr.id },
    });
  }

  // 4️⃣ Delete attributes of this generic
  await this.prisma.attribute_master.deleteMany({
    where: { generic_id: id },
  });

  // 5️⃣ Delete the generic itself
  return this.prisma.generic_master.delete({
    where: { id },
  });
}
}
