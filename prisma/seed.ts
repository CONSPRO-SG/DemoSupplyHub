import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@conspro.local" },
    update: {},
    create: {
      name: "Plant Admin",
      email: "admin@conspro.local",
      password: adminPassword
    }
  });

  const coolant = await prisma.consumable.upsert({
    where: { sku: "COOL-001" },
    update: {},
    create: {
      name: "Machine Coolant",
      sku: "COOL-001",
      unit: "L",
      minLevel: 100,
      quantity: 240,
      location: "Zone A"
    }
  });

  await prisma.stockMovement.create({
    data: {
      type: "IN",
      quantity: 240,
      note: "Initial stock",
      consumableId: coolant.id,
      userId: admin.id
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
