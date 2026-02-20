import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// GET /api/admin/halls/[id] - Get single hall
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const hall = await prisma.hall.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            showtimes: true,
            seats: true,
          },
        },
      },
    });

    if (!hall) {
      return NextResponse.json({ error: "Hall not found" }, { status: 404 });
    }

    return NextResponse.json({ hall });
  } catch (error) {
    console.error("Error fetching hall:", error);
    return NextResponse.json(
      { error: "Failed to fetch hall" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/halls/[id] - Update hall
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, hallType, capacity, isActive } = body;

    // Check if hall exists
    const existingHall = await prisma.hall.findUnique({
      where: { id },
    });

    if (!existingHall) {
      return NextResponse.json({ error: "Hall not found" }, { status: 404 });
    }

    // Validation
    if (name !== undefined && !name.trim()) {
      return NextResponse.json(
        { error: "Hall name is required" },
        { status: 400 }
      );
    }

    if (capacity !== undefined && capacity < 1) {
      return NextResponse.json(
        { error: "Valid capacity is required" },
        { status: 400 }
      );
    }

    // Check for duplicate name (excluding current hall)
    if (name && name !== existingHall.name) {
      const duplicateHall = await prisma.hall.findFirst({
        where: { name: { equals: name.trim(), mode: "insensitive" } },
      });

      if (duplicateHall) {
        return NextResponse.json(
          { error: "A hall with this name already exists" },
          { status: 400 }
        );
      }
    }

    const hall = await prisma.hall.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(hallType && { hallType }),
        ...(capacity && { capacity: parseInt(capacity) }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        _count: {
          select: {
            showtimes: true,
            seats: true,
          },
        },
      },
    });

    return NextResponse.json({ hall });
  } catch (error) {
    console.error("Error updating hall:", error);
    return NextResponse.json(
      { error: "Failed to update hall" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/halls/[id] - Delete hall
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if hall exists
    const existingHall = await prisma.hall.findUnique({
      where: { id },
      include: {
        _count: {
          select: { showtimes: true, seats: true },
        },
      },
    });

    if (!existingHall) {
      return NextResponse.json({ error: "Hall not found" }, { status: 404 });
    }

    // Check for existing showtimes
    if (existingHall._count.showtimes > 0) {
      return NextResponse.json(
        { 
          error: "Cannot delete hall with scheduled showtimes. Please remove all showtimes first." 
        },
        { status: 400 }
      );
    }

    // Delete seats first, then delete hall (in transaction)
    await prisma.$transaction([
      prisma.seat.deleteMany({ where: { hallId: id } }),
      prisma.hall.delete({ where: { id } })
    ]);

    return NextResponse.json({ 
      success: true,
      deletedSeats: existingHall._count.seats,
      message: `Hall "${existingHall.name}" and ${existingHall._count.seats} seats deleted successfully`
    });
  } catch (error) {
    console.error("Error deleting hall:", error);
    return NextResponse.json(
      { error: "Failed to delete hall" },
      { status: 500 }
    );
  }
}
