import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const dbUrl = process.env.DATABASE_URL?.replace("db:5432", "localhost:5432") 
  ?? "postgresql://postgres:admin123@localhost:5432/moviedb";
const pool = new Pool({ connectionString: dbUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const frontDeskEmail = process.env.FRONT_DESK_EMAIL;
const frontDeskPassword = process.env.FRONT_DESK_PASSWORD;

if (!frontDeskEmail || !frontDeskPassword) {
  console.error("❌ Missing required environment variables:");
  if (!frontDeskEmail) console.error("   FRONT_DESK_EMAIL is not set");
  if (!frontDeskPassword) console.error("   FRONT_DESK_PASSWORD is not set");
  console.error("\nPlease set these in your .env file.");
  process.exit(1);
}

async function seedFrontDesk() {
  try {
    const existingFrontDesk = await prisma.user.findUnique({
      where: { email: frontDeskEmail },
    });

    if (existingFrontDesk) {
      console.log("Front desk user already exists");
      console.log(`Email: ${frontDeskEmail}`);
      return;
    }

    const hashedPassword = await bcrypt.hash(frontDeskPassword, 10);

    const frontDesk = await prisma.user.create({
      data: {
        name: "Front Desk Staff",
        email: frontDeskEmail,
        password: hashedPassword,
        role: "FRONT_DESK",
        membershipTier: "NONE",
      },
    });

    console.log("✅ Front desk user created successfully!");
    console.log(`Email: ${frontDeskEmail}`);
    console.log(`User ID: ${frontDesk.id}`);
  } catch (error) {
    console.error("❌ Error creating front desk user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedFrontDesk();