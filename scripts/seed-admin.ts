import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seedAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: "admin@movietickets.com" },
    });

    if (existingAdmin) {
      console.log("Admin user already exists");
      console.log("Email: admin@movietickets.com");
      console.log("Password: admin123");
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash("admin123", 10);

    const admin = await prisma.user.create({
      data: {
        name: "System Administrator",
        email: "admin@movietickets.com",
        password: hashedPassword,
        role: "ADMIN",
        membershipTier: "NONE",
      },
    });

    console.log("✅ Admin user created successfully!");
    console.log("Email: admin@movietickets.com");
    console.log("Password: admin123");
    console.log("User ID:", admin.id);
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin();
