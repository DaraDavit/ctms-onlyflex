import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const movies = await prisma.movie.findMany({
    select: {
      id: true,
      title: true,
      status: true,
    },
  });

  console.log("Total movies found:", movies.length);
  movies.forEach((m) => {
    console.log(`- [${m.status}] ${m.title} (${m.id})`);
  });

  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
