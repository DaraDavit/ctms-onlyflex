import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const hall = await prisma.hall.create({
    data: {
      name: "Hall 1",
      capacity: 80,
      hallType: "STANDARD",
      columns: 10,
      isActive: true,
      rowConfigs: [
        { startRow: "A", endRow: "F", seatType: "REGULAR" },
        { startRow: "G", endRow: "H", seatType: "VIP" }
      ]
    }
  });
  console.log("Created hall:", hall.id);
  console.log("rowConfigs:", JSON.stringify(hall.rowConfigs));
  await prisma.$disconnect();
}

main();
