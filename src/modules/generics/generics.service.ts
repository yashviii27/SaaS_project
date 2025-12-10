import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../common/prisma.service";

@Injectable()
export class GenericsService {
  constructor(private prisma: PrismaService) {}

  // ------------------------------------------------------------
  // FORMAT RESPONSE — UI FRIENDLY
  // ------------------------------------------------------------
  private formatGenericResponse(generic: any) {
    return {
      id: generic.id,
      name: generic.generic_name,

      // Include both id + name for group
      group: generic.group
        ? {
            id: generic.group.id,
            name: generic.group.group_name,
          }
        : null,

      // Include both id + name for category
      category: generic.category
        ? {
            id: generic.category.id,
            name: generic.category.category_name,
          }
        : null,

      description: generic.description ?? null,

      attributes: generic.attributes.map((attr) => {
        const base = {
          id: attr.id,
          name: attr.attribute_name,
          type: attr.input_type,
          dataType: attr.data_type,
          required: attr.is_required,
        };

        if (attr.input_type === "dropdown") {
          return {
            ...base,
            extra: attr.extra ?? { options: [] },
          };
        }

        return { ...base, extra: null };
      }),
    };
  }

  // ------------------------------------------------------------
  // CREATE GENERIC
  // ------------------------------------------------------------
  async createGeneric(data: any) {
    const { generic_name, category_id, group_id, attributes } = data;

    if (!generic_name)
      throw new BadRequestException("generic_name is required");
    if (!group_id) throw new BadRequestException("group_id is required");
    if (!category_id) throw new BadRequestException("category_id is required");
    if (!Array.isArray(attributes))
      throw new BadRequestException("attributes must be an array");

    const allowedInputTypes = ["open", "dropdown"];

    for (const attr of attributes) {
      if (!allowedInputTypes.includes(attr.input_type)) {
        throw new BadRequestException(
          `Invalid input_type '${attr.input_type}'. Allowed: open, dropdown`
        );
      }
    }

    const generic = await this.prisma.generic_master.create({
      data: {
        generic_name,
        group: { connect: { id: Number(group_id) } },
        category: { connect: { id: Number(category_id) } },
      },
    });

    // Create attributes & dropdown options
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

      // Dropdown → convert values to typed options inside "extra"
      if (attr.input_type === "dropdown") {
        const options = attr.values.map((v) => {
          const raw = v.value;

          try {
            return JSON.parse(raw);
          } catch {
            if (raw === "true") return true;
            if (raw === "false") return false;
            if (!isNaN(raw) && raw.trim() !== "") return Number(raw);
            return raw;
          }
        });

        await this.prisma.attribute_master.update({
          where: { id: createdAttr.id },
          data: { extra: { options } },
        });
      }
    }

    return {
      success: true,
      message: "Generic created successfully",
      generic_id: generic.id,
    };
  }

  // ------------------------------------------------------------
  // FIND ALL GENERICS (UI FRIENDLY)
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

  // ------------------------------------------------------------
  // FIND ONE GENERIC (UI FRIENDLY)
  // ------------------------------------------------------------
  async findOne(id: number) {
    const item = await this.prisma.generic_master.findUnique({
      where: { id },
      include: {
        attributes: true,
        group: true,
        category: true,
      },
    });

    if (!item) throw new NotFoundException("Generic not found");

    return this.formatGenericResponse(item);
  }

  // ------------------------------------------------------------
  // UPDATE GENERIC
  // ------------------------------------------------------------
  async update(id: number, data: any) {
    await this.findOne(id);

    return this.prisma.generic_master.update({
      where: { id },
      data: {
        generic_name: data.generic_name,
        category: { connect: { id: Number(data.category_id) } },
      },
    });
  }

  // ------------------------------------------------------------
  // DELETE GENERIC (safe delete)
  // ------------------------------------------------------------
  async remove(id: number) {
    await this.findOne(id);

    // Delete only attributes — values stored inside "extra"
    await this.prisma.attribute_master.deleteMany({
      where: { generic_id: id },
    });

    return this.prisma.generic_master.delete({
      where: { id },
    });
  }
}
