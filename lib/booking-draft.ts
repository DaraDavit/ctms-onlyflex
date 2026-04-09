export type BookingShowtimeDraft = {
  id: string;
  movieTitle: string;
  date: string;
  time: string;
  location: string;
  screen: string;
  type: string;
};

export type BookingCustomerDetailsDraft = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  sendConfirmationSms: boolean;
  sendConfirmationEmail: boolean;
  subscribeToPromotionalOffers: boolean;
};

export type BookingDraft = {
  showtimeKey: string;
  showtime: BookingShowtimeDraft;
  currentStep: number;
  selectedSeats: string[];
  customerDetails: BookingCustomerDetailsDraft;
  paymentMethod: string;
};

const BOOKING_DRAFT_KEY = "onlyflix:booking-draft";

export function getBookingShowtimeKey(showtime: BookingShowtimeDraft) {
  return showtime.id || [showtime.movieTitle, showtime.date, showtime.time, showtime.location, showtime.screen, showtime.type].join("|");
}

export function buildBookingCallbackUrl(pathname: string, searchParams: string) {
  return searchParams ? `${pathname}?${searchParams}` : pathname;
}

export function buildLoginRedirectUrl(callbackUrl: string) {
  return `/login?redirect=${encodeURIComponent(callbackUrl)}`;
}

export function buildRegisterRedirectUrl(callbackUrl: string) {
  return `/register?redirect=${encodeURIComponent(callbackUrl)}`;
}

export function loadBookingDraft(expectedShowtimeKey: string) {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(BOOKING_DRAFT_KEY);
    if (!raw) {
      return null;
    }

    const draft = JSON.parse(raw) as BookingDraft;
    if (!draft || draft.showtimeKey !== expectedShowtimeKey) {
      return null;
    }

    return draft;
  } catch {
    return null;
  }
}

export function saveBookingDraft(draft: BookingDraft) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(BOOKING_DRAFT_KEY, JSON.stringify(draft));
}

export function clearBookingDraft() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(BOOKING_DRAFT_KEY);
}
