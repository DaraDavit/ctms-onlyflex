import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type MovieRatingBadgeProps = {
  averageRating?: number | null;
  reviewCount?: number | null;
  className?: string;
};

export default function MovieRatingBadge({
  averageRating,
  reviewCount,
  className = "",
}: MovieRatingBadgeProps) {
  if (averageRating == null || !reviewCount || reviewCount <= 0) {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-1.5 text-sm", className)}>
      <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
      <span className="font-semibold text-yellow-400">{averageRating}</span>
      <span className="text-zinc-400">
        ({reviewCount} review{reviewCount === 1 ? "" : "s"})
      </span>
    </div>
  );
}
