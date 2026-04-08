import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { Prisma, PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function parseDecimal(value: unknown): Prisma.Decimal | null {
  if (value === undefined || value === null || value === "") return null;
  try {
    return new Prisma.Decimal(value as string | number | Prisma.Decimal);
  } catch {
    return null;
  }
}

// GET /api/front-desk/bookings - List bookings for front desk
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "FRONT_DESK") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const limit = Math.max(parseInt(searchParams.get("limit") || "10", 10), 1);

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { id: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (status) {
      where.bookingStatus = status;
    }

    const skip = (page - 1) * limit;

    const [bookings, totalCount] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          showtime: {
            select: {
              id: true,
              startTime: true,
              endTime: true,
              hall: {
                select: {
                  name: true,
                },
              },
              movie: {
                select: {
                  id: true,
                  title: true,
                  posterUrl: true,
                },
              },
            },
          },
          payment: {
            select: {
              paymentMethod: true,
              status: true,
            },
          },
          tickets: {
            select: {
              id: true,
              ticketType: true,
              finalPrice: true,
              seat: {
                select: {
                  row: true,
                  seatNumber: true,
                  column: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    return NextResponse.json({
      bookings,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

// POST /api/front-desk/bookings - Create new booking
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "FRONT_DESK") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      showtimeId,
      seatIds,
      paymentMethod,
      ticketType = "ADULT",
    } = body;

    if (!customerName || !customerEmail || !showtimeId || !seatIds || seatIds.length === 0) {
      return NextResponse.json(
        { error: "customerName, customerEmail, showtimeId, and seatIds are required" },
        { status: 400 }
      );
    }

    if (!["CASH", "CARD"].includes(paymentMethod)) {
      return NextResponse.json(
        { error: "paymentMethod must be CASH or CARD" },
        { status: 400 }
      );
    }

    // Find or create customer user
    let user = await prisma.user.findUnique({
      where: { email: customerEmail },
    });

    if (!user) {
      const hashedPassword = await bcrypt.hash("temp-" + Math.random().toString(36).slice(-8), 10);
      user = await prisma.user.create({
        data: {
          email: customerEmail,
          name: customerName,
          phone: customerPhone || null,
          password: hashedPassword,
          role: "USER",
        },
      });
    }

    // Get showtime details
    const showtime = await prisma.showtime.findUnique({
      where: { id: showtimeId },
      include: {
        hall: true,
      },
    });

    if (!showtime) {
      return NextResponse.json({ error: "Showtime not found" }, { status: 404 });
    }

    // Check if seats are available
    const existingTickets = await prisma.ticket.findMany({
      where: {
        showtimeId,
        seatId: { in: seatIds },
      },
    });

    if (existingTickets.length > 0) {
      return NextResponse.json(
        { error: "One or more seats are already booked" },
        { status: 400 }
      );
    }

    // Get seats for pricing
    const seats = await prisma.seat.findMany({
      where: { id: { in: seatIds } },
    });

    // Calculate prices
    let subtotal = 0;
    const ticketData = seats.map((seat) => {
      let price = Number(showtime.basePrice);
      if (seat.seatType === "VIP") price *= Number(showtime.vipMultiplier);
      if (seat.seatType === "TWINSEAT") price *= Number(showtime.twinseatMultiplier);
      
      // Apply membership discount if user is member
      let discount = 0;
      if (user.membershipTier === "MEMBER") {
        discount = price * 0.3;
      }

      subtotal += price;

      return {
        bookingId: "", // Will be set after booking creation
        showtimeId,
        seatId: seat.id,
        ticketType: ticketType as "ADULT" | "CHILD" | "STUDENT" | "SENIOR",
        originalPrice: price,
        discountAmount: discount,
        finalPrice: price - discount,
        status: "CONFIRMED" as const,
      };
    });

    const totalDiscount = ticketData.reduce((sum, t) => sum + Number(t.discountAmount), 0);
    const finalAmount = subtotal - totalDiscount;

    // Create booking with tickets and payment in transaction
    const booking = await prisma.$transaction(async (tx) => {
      const newBooking = await tx.booking.create({
        data: {
          userId: user.id,
          showtimeId,
          subtotal: new Prisma.Decimal(subtotal),
          totalDiscount: new Prisma.Decimal(totalDiscount),
          finalAmount: new Prisma.Decimal(finalAmount),
          bookingStatus: "CONFIRMED",
        },
      });

      // Create tickets
      await tx.ticket.createMany({
        data: ticketData.map((t) => ({
          ...t,
          bookingId: newBooking.id,
        })),
      });

      // Create payment
      await tx.payment.create({
        data: {
          bookingId: newBooking.id,
          amount: new Prisma.Decimal(finalAmount),
          paymentMethod: paymentMethod as "CASH" | "CARD",
          status: "COMPLETED",
          paidAt: new Date(),
        },
      });

      return newBooking;
    });

    // Return full booking details
    const fullBooking = await prisma.booking.findUnique({
      where: { id: booking.id },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
        showtime: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
            hall: { select: { name: true } },
            movie: { select: { id: true, title: true } },
          },
        },
        payment: true,
        tickets: {
          include: {
            seat: { select: { row: true, seatNumber: true } },
          },
        },
      },
    });

    return NextResponse.json(fullBooking, { status: 201 });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}