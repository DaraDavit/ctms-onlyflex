"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Filter, Eye, Printer, X, Film, Calendar, Clock, User, Ticket } from "lucide-react";

interface Booking {
  id: string;
  createdAt: string;
  bookingStatus: string;
  finalAmount: string;
  user: {
    name: string | null;
    email: string;
    phone: string | null;
  };
  showtime: {
    id: string;
    startTime: string;
    hall: {
      name: string;
    };
    movie: {
      title: string;
      posterUrl: string | null;
    };
  };
  tickets: {
    id: string;
    seat: {
      row: string;
      seatNumber: number;
    };
    ticketType: string;
    finalPrice: string;
  }[];
  payment: {
    paymentMethod: string;
    status: string;
  } | null;
}

export default function FrontDeskBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(searchTerm && { search: searchTerm }),
      });
      const response = await fetch(`/api/front-desk/bookings?${params}`);
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handlePrintReceipt = (booking: Booking) => {
    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Receipt - ${booking.id.slice(-6)}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; max-width: 350px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px dashed #333; padding-bottom: 20px; margin-bottom: 20px; }
            .title { font-size: 24px; font-weight: bold; }
            .subtitle { color: #666; font-size: 12px; }
            .row { display: flex; justify-content: space-between; margin: 10px 0; }
            .label { color: #666; font-size: 12px; }
            .value { font-weight: bold; font-size: 14px; }
            .seats { display: flex; flex-wrap: wrap; gap: 5px; margin: 10px 0; }
            .seat { background: #f0f0f0; padding: 3px 8px; border-radius: 4px; font-size: 12px; }
            .total { font-size: 20px; font-weight: bold; text-align: center; margin: 20px 0; border-top: 2px dashed #333; padding-top: 20px; }
            .footer { text-align: center; font-size: 10px; color: #666; margin-top: 30px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">CINEMA TICKETS</div>
            <div class="subtitle">Booking Receipt</div>
          </div>
          <div class="row">
            <span class="label">Ref Number</span>
            <span class="value">${booking.id.slice(-6).toUpperCase()}</span>
          </div>
          <div class="row">
            <span class="label">Movie</span>
            <span class="value">${booking.showtime.movie.title}</span>
          </div>
          <div class="row">
            <span class="label">Date</span>
            <span class="value">${new Date(booking.showtime.startTime).toLocaleDateString()}</span>
          </div>
          <div class="row">
            <span class="label">Time</span>
            <span class="value">${new Date(booking.showtime.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
          <div class="row">
            <span class="label">Hall</span>
            <span class="value">${booking.showtime.hall.name}</span>
          </div>
          <div class="row">
            <span class="label">Customer</span>
            <span class="value">${booking.user.name || booking.user.email}</span>
          </div>
          <div class="label">Seats</div>
          <div class="seats">
            ${booking.tickets.map(t => `<span class="seat">${t.seat.row}${t.seat.seatNumber}</span>`).join("")}
          </div>
          <div class="total">$${parseFloat(booking.finalAmount).toFixed(2)}</div>
          <div class="row">
            <span class="label">Payment</span>
            <span class="value">${booking.payment?.paymentMethod || "N/A"}</span>
          </div>
          <div class="row">
            <span class="label">Status</span>
            <span class="value">${booking.bookingStatus}</span>
          </div>
          <div class="footer">
            Thank you for your purchase!<br/>
            Please arrive 15 minutes before showtime
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Bookings
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Search and manage bookings
          </p>
        </div>
        <a
          href="/front-desk/bookings/new"
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
        >
          <Ticket className="w-5 h-5" />
          New Booking
        </a>
      </div>

      <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-700">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search by booking ID, customer name or email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50 dark:bg-zinc-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">Ref</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">Movie</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">Showtime</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">Seats</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-zinc-500">
                    Loading...
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-zinc-500">
                    No bookings found
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/50">
                    <td className="px-4 py-3 text-sm font-mono text-zinc-900 dark:text-zinc-100">
                      {booking.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100">
                      {booking.showtime.movie.title}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100">
                      <div>{new Date(booking.showtime.startTime).toLocaleDateString()}</div>
                      <div className="text-zinc-500 text-xs">
                        {new Date(booking.showtime.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100">
                      <div>{booking.user.name || "-"}</div>
                      <div className="text-zinc-500 text-xs">{booking.user.email}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100">
                      {booking.tickets.map((t) => `${t.seat.row}${t.seat.seatNumber}`).join(", ")}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      ${parseFloat(booking.finalAmount).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          booking.bookingStatus === "CONFIRMED"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : booking.bookingStatus === "PENDING"
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                            : "bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300"
                        }`}
                      >
                        {booking.bookingStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                        </button>
                        <button
                          onClick={() => handlePrintReceipt(booking)}
                          className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg"
                          title="Print Receipt"
                        >
                          <Printer className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-700 flex justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-zinc-300 dark:border-zinc-600 rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-zinc-600 dark:text-zinc-400">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 border border-zinc-300 dark:border-zinc-600 rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-700 flex items-center justify-between sticky top-0 bg-white dark:bg-zinc-800">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Booking Details
              </h2>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-zinc-500 uppercase">Reference</p>
                  <p className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                    {selectedBooking.id.slice(-6).toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase">Status</p>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      selectedBooking.bookingStatus === "CONFIRMED"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {selectedBooking.bookingStatus}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <Film className="w-5 h-5 text-zinc-400" />
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      {selectedBooking.showtime.movie.title}
                    </p>
                    <p className="text-sm text-zinc-500">
                      {selectedBooking.showtime.hall.name}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-zinc-500">Date</p>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      {new Date(selectedBooking.showtime.startTime).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-zinc-500">Time</p>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      {new Date(selectedBooking.showtime.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs text-zinc-500 uppercase mb-2">Customer</p>
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-zinc-400" />
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      {selectedBooking.user.name || "N/A"}
                    </p>
                    <p className="text-sm text-zinc-500">{selectedBooking.user.email}</p>
                    {selectedBooking.user.phone && (
                      <p className="text-sm text-zinc-500">{selectedBooking.user.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs text-zinc-500 uppercase mb-2">Seats</p>
                <div className="flex flex-wrap gap-2">
                  {selectedBooking.tickets.map((ticket) => (
                    <span
                      key={ticket.id}
                      className="px-3 py-1 bg-zinc-100 dark:bg-zinc-700 rounded-lg text-sm font-medium"
                    >
                      {ticket.seat.row}{ticket.seat.seatNumber} ({ticket.ticketType})
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-zinc-200 dark:border-zinc-700">
                <div>
                  <p className="text-xs text-zinc-500">Total Amount</p>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    ${parseFloat(selectedBooking.finalAmount).toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-500">
                    {selectedBooking.payment?.paymentMethod || "N/A"}
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {selectedBooking.payment?.status || "No payment"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handlePrintReceipt(selectedBooking)}
                className="w-full py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-medium hover:opacity-90 flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}