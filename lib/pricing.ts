export type SeatType = "REGULAR" | "VIP" | "TWINSEAT";

export interface ShowtimePricing {
  basePrice: number;
  weekendMultiplier: number;
  vipMultiplier: number;
  twinseatMultiplier: number;
  isWeekend: boolean;
}

export function calculateTicketPrice(
  pricing: ShowtimePricing,
  seatType: SeatType
): number {
  let price = pricing.basePrice * pricing.weekendMultiplier;

  switch (seatType) {
    case "VIP":
      price *= pricing.vipMultiplier;
      break;
    case "TWINSEAT":
      price *= pricing.twinseatMultiplier;
      break;
    case "REGULAR":
    default:
      break;
  }

  return Math.round(price * 100) / 100;
}

export function calculateAllSeatPrices(pricing: ShowtimePricing): {
  regular: number;
  vip: number;
  twinseat: number;
} {
  return {
    regular: calculateTicketPrice(pricing, "REGULAR"),
    vip: calculateTicketPrice(pricing, "VIP"),
    twinseat: calculateTicketPrice(pricing, "TWINSEAT"),
  };
}

export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}
