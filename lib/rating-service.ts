import type { PrismaClient } from "@/app/generated/prisma/client";

export type MovieRatingSummary = {
  averageRating: number | null;
  reviewCount: number;
};

function roundToTwoDecimals(value: number) {
  return Number(value.toFixed(2));
}

function createEmptySummary(): MovieRatingSummary {
  return {
    averageRating: null,
    reviewCount: 0,
  };
}

export async function getMovieRatingSummary(
  prisma: PrismaClient,
  movieId: string,
): Promise<MovieRatingSummary> {
  const summaryMap = await getMovieRatingSummaries(prisma, [movieId]);
  return summaryMap.get(movieId) ?? createEmptySummary();
}

export async function getMovieRatingSummaries(
  prisma: PrismaClient,
  movieIds: string[],
): Promise<Map<string, MovieRatingSummary>> {
  const uniqueMovieIds = Array.from(new Set(movieIds.filter(Boolean)));

  if (uniqueMovieIds.length === 0) {
    return new Map();
  }

  const summaries = await prisma.review.groupBy({
    by: ["movieId"],
    where: {
      movieId: {
        in: uniqueMovieIds,
      },
    },
    _avg: {
      rating: true,
    },
    _count: {
      rating: true,
    },
  });

  const summaryMap = new Map<string, MovieRatingSummary>();

  uniqueMovieIds.forEach((movieId) => {
    summaryMap.set(movieId, createEmptySummary());
  });

  summaries.forEach((summary) => {
    summaryMap.set(summary.movieId, {
      averageRating:
        summary._count.rating > 0 && summary._avg.rating !== null
          ? roundToTwoDecimals(Number(summary._avg.rating))
          : null,
      reviewCount: summary._count.rating,
    });
  });

  return summaryMap;
}
