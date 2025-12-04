import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Groups
  const g1 = await prisma.group_master.create({
    data: { group_name: "Electronics" },
  });
  const g2 = await prisma.group_master.create({
    data: { group_name: "Appliances" },
  });

  // Categories
  const c1 = await prisma.category_master.create({
    data: { category_name: "TV", group_id: g1.id },
  });
  const c2 = await prisma.category_master.create({
    data: { category_name: "Refrigerator", group_id: g2.id },
  });

  // Generic
  const gen1 = await prisma.generic_master.create({
    data: {
      generic_name: "32 inch LED",
      group_id: g1.id,
      category_id: c1.id,
      description: "32 inch LED generic",
    },
  });

  // Brand
  const b1 = await prisma.brand_master.create({
    data: { brand_name: "LG", description: "LG Electronics" },
  });

  // Attribute for generic
  const attr1 = await prisma.attribute_master.create({
    data: {
      generic_id: gen1.id,
      attribute_name: "Screen Size",
      input_type: "dropdown",
      is_required: true,
      data_type: "string",
      extra: {},
    },
  });

  // attribute values
  const av1 = await prisma.attribute_values_master.create({
    data: { attribute_id: attr1.id, value: "32 inch", value_key: "32in" },
  });
  const av2 = await prisma.attribute_values_master.create({
    data: { attribute_id: attr1.id, value: "43 inch", value_key: "43in" },
  });

  // product
  const p1 = await prisma.product_master.create({
    data: {
      product_name: "LG 32LH",
      generic_id: gen1.id,
      brand_id: b1.id,
      qty: 20,
      rate: 25000,
      sku: "LG32-2025",
    },
  });

  // product attribute assign
  await prisma.product_attribute_values.create({
    data: { product_id: p1.id, attribute_id: attr1.id, value_id: av1.id },
  });

  console.log("Seed completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
