import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { PrismaClient, Prisma } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { generateSeatsFromRowConfigs, validateRowConfigs, RowConfig } from "@/lib/hall-utils";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// GET /api/admin/halls - List all halls with counts
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "all";

    const where: Prisma.HallWhereInput = {};
    
    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }
    
    if (type !== "all") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      where.hallType = type.toUpperCase() as any;
    }

    const halls = await prisma.hall.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            showtimes: true,
            seats: true,
          },
        },
      },
    });

    return NextResponse.json({ halls });
  } catch (error) {
    console.error("Error fetching halls:", error);
    return NextResponse.json(
      { error: "Failed to fetch halls" },
      { status: 500 }
    );
  }
}

// POST /api/admin/halls - Create new hall with seats
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, hallType, rows, columns, isActive, rowConfigs } = body;

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Hall name is required" },
        { status: 400 }
      );
    }

    if (!rows || rows < 1) {
      return NextResponse.json(
        { error: "Valid number of rows is required" },
        { status: 400 }
      );
    }

    if (!columns || columns < 1) {
      return NextResponse.json(
        { error: "Valid number of columns is required" },
        { status: 400 }
      );
    }

    // Validate row configs
    if (rowConfigs && rowConfigs.length > 0) {
      const validationError = validateRowConfigs(rowConfigs as RowConfig[], rows);
      if (validationError) {
        return NextResponse.json({ error: validationError }, { status: 400 });
      }
    }

    // Check for duplicate name
    const existingHall = await prisma.hall.findFirst({
      where: { name: { equals: name.trim(), mode: "insensitive" } },
    });

    if (existingHall) {
      return NextResponse.json(
        { error: "A hall with this name already exists" },
        { status: 400 }
      );
    }

    const capacity = rows * columns;

    // Create hall and seats in a transaction
    const hall = await prisma.$transaction(async (tx) => {
      const newHall = await tx.hall.create({
        data: {
          name: name.trim(),
          hallType: hallType || "STANDARD",
          capacity,
          columns,
          isActive: isActive !== undefined ? isActive : true,
          isPublished: false,
          version: 1,
        },
      });

      // Generate seats based on row configs
      const defaultRowConfigs: RowConfig[] = rowConfigs && rowConfigs.length > 0
        ? rowConfigs as RowConfig[]
        : [{ startRow: "A", endRow: getRowLabel(rows - 1), seatType: "REGULAR" }];

      const seats = generateSeatsFromRowConfigs(rows, columns, defaultRowConfigs, newHall.id);

      await tx.seat.createMany({
        data: seats,
      });

      return tx.hall.findUnique({
        where: { id: newHall.id },
        include: {
          _count: {
            select: {
              showtimes: true,
              seats: true,
            },
          },
        },
      });
    });

    return NextResponse.json({ hall }, { status: 201 });
  } catch (error) {
    console.error("Error creating hall:", error);
    return NextResponse.json(
      { error: "Failed to create hall" },
      { status: 500 }
    );
  }
}

function getRowLabel(index: number): string {
  if (index < 0) return '';
  let label = '';
  let n = index;
  do {
    label = String.fromCharCode(65 + (n % 26)) + label;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return label;
}
