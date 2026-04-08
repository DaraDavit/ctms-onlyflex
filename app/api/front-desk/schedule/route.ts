import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// GET /api/front-desk/schedule - Get showtimes for front desk
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "FRONT_DESK") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const showtimes = await prisma.showtime.findMany({
      where: {
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: "ACTIVE",
      },
      include: {
        hall: {
          select: {
            id: true,
            name: true,
            capacity: true,
          },
        },
        movie: {
          select: {
            id: true,
            title: true,
            posterUrl: true,
            duration: true,
          },
        },
        _count: {
          select: {
            tickets: true,
          },
        },
      },
      orderBy: { startTime: "asc" },
    });

    return NextResponse.json({ showtimes });
  } catch (error) {
    console.error("Error fetching schedule:", error);
    return NextResponse.json(
      { error: "Failed to fetch schedule" },
      { status: 500 }
    );
  }
}