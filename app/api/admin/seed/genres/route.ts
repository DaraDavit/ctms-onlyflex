import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DEFAULT_GENRES = [
  { name: "Action", slug: "action" },
  { name: "Adventure", slug: "adventure" },
  { name: "Animation", slug: "animation" },
  { name: "Comedy", slug: "comedy" },
  { name: "Crime", slug: "crime" },
  { name: "Documentary", slug: "documentary" },
  { name: "Drama", slug: "drama" },
  { name: "Family", slug: "family" },
  { name: "Fantasy", slug: "fantasy" },
  { name: "Horror", slug: "horror" },
  { name: "Musical", slug: "musical" },
  { name: "Mystery", slug: "mystery" },
  { name: "Romance", slug: "romance" },
  { name: "Sci-Fi", slug: "sci-fi" },
  { name: "Thriller", slug: "thriller" },
  { name: "War", slug: "war" },
  { name: "Western", slug: "western" },
];

// POST /api/admin/seed/genres - Seed default genres
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check which genres already exist
    const existingGenres = await prisma.genre.findMany({
      select: { slug: true },
    });

    const existingSlugs = new Set(existingGenres.map((g) => g.slug));

    // Filter out genres that already exist
    const genresToCreate = DEFAULT_GENRES.filter(
      (genre) => !existingSlugs.has(genre.slug)
    );

    if (genresToCreate.length === 0) {
      return NextResponse.json(
        {
          message: "All default genres already exist",
          totalGenres: existingGenres.length,
          created: 0,
        },
        { status: 200 }
      );
    }

    // Create missing genres
    const createdGenres = await prisma.genre.createMany({
      data: genresToCreate,
      skipDuplicates: true,
    });

    // Fetch all genres to return
    const allGenres = await prisma.genre.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json(
      {
        message: `Successfully created ${createdGenres.count} genres`,
        totalGenres: allGenres.length,
        created: createdGenres.count,
        genres: allGenres,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error seeding genres:", error);
    return NextResponse.json(
      { error: "Failed to seed genres" },
      { status: 500 }
    );
  }
}

// GET /api/admin/seed/genres - Check if genres exist
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const genreCount = await prisma.genre.count();

    return NextResponse.json({
      hasGenres: genreCount > 0,
      count: genreCount,
      totalDefault: DEFAULT_GENRES.length,
    });
  } catch (error) {
    console.error("Error checking genres:", error);
    return NextResponse.json(
      { error: "Failed to check genres" },
      { status: 500 }
    );
  }
}
