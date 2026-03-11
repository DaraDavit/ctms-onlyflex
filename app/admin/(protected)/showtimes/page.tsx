"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import ShowtimeForm from "./_components/ShowtimeForm";
import ShowtimeDeleteModal from "./_components/ShowtimeDeleteModal";

interface Movie {
  id: string;
  title: string;
  posterUrl: string | null;
  duration: number | null;
}

interface Hall {
  id: string;
  name: string;
  capacity?: number;
}

interface Showtime {
  id: string;
  movieId: string;
  hallId: string;
  startTime: string;
  endTime: string;
  basePrice: string;
  weekendMultiplier: string;
  isWeekend: boolean;
  status: string;
  movie: Movie;
  hall: Hall;
  bookingCount: number;
  ticketCount: number;
}

interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

const showtimeStatuses = [
  { value: "", label: "All Statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "SOLD_OUT", label: "Sold Out" },
  { value: "COMPLETED", label: "Completed" },
];

export default function ShowtimesPage() {
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState("");
  const [movieFilter, setMovieFilter] = useState("");
  const [hallFilter, setHallFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState("startTime");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingShowtime, setEditingShowtime] = useState<Showtime | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showtimeToDelete, setShowtimeToDelete] = useState<Showtime | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchMovies = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/movies?status=RELEASED&limit=100");
      if (response.ok) {
        const data = await response.json();
        setMovies(data.movies || []);
      }
    } catch (err) {
      console.error("Error fetching movies:", err);
    }
  }, []);

  const fetchHalls = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/halls");
      if (response.ok) {
        const data = await response.json();
        const publishedHalls = (data.halls || []).filter(
          (h: Hall & { isActive: boolean }) =>
            h.isActive
        );
        setHalls(publishedHalls);
      }
    } catch (err) {
      console.error("Error fetching halls:", err);
    }
  }, []);

  const fetchShowtimes = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy,
        sortOrder,
      });

      if (search) params.set("search", search);
      if (movieFilter) params.set("movieId", movieFilter);
      if (hallFilter) params.set("hallId", hallFilter);
      if (statusFilter) params.set("status", statusFilter);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);

      const response = await fetch(`/api/admin/showtimes?${params}`);
      const data = await response.json();

      if (response.ok) {
        setShowtimes(data.showtimes);
        setPagination(data.pagination);
      } else {
        setError(data.error || "Failed to fetch showtimes");
      }
    } catch {
      setError("Failed to fetch showtimes");
    } finally {
      setIsLoading(false);
    }
  }, [
    pagination.page,
    pagination.limit,
    search,
    movieFilter,
    hallFilter,
    statusFilter,
    dateFrom,
    dateTo,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    fetchShowtimes();
    fetchMovies();
    fetchHalls();
  }, [fetchShowtimes, fetchMovies, fetchHalls]);

  async function handleCreateShowtime(formData: {
    movieId: string;
    hallId: string;
    startTime: string;
    basePrice: string;
    weekendMultiplier: string;
    status: string;
  }) {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/showtimes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setIsFormOpen(false);
        fetchShowtimes();
      } else {
        alert(data.error || "Failed to create showtime");
      }
    } catch {
      alert("Failed to create showtime");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdateShowtime(formData: {
    movieId: string;
    hallId: string;
    startTime: string;
    basePrice: string;
    weekendMultiplier: string;
    status: string;
  }) {
    if (!editingShowtime) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/showtimes/${editingShowtime.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setIsFormOpen(false);
        setEditingShowtime(null);
        fetchShowtimes();
      } else {
        alert(data.error || "Failed to update showtime");
      }
    } catch {
      alert("Failed to update showtime");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteShowtime() {
    if (!showtimeToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/showtimes/${showtimeToDelete.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        setShowtimeToDelete(null);
        fetchShowtimes();
      } else {
        alert(data.error || "Failed to delete showtime");
      }
    } catch {
      alert("Failed to delete showtime");
    } finally {
      setIsDeleting(false);
    }
  }

  function handleEdit(showtime: Showtime) {
    setEditingShowtime(showtime);
    setIsFormOpen(true);
  }

  function handleAddNew() {
    setEditingShowtime(null);
    setIsFormOpen(true);
  }

  function handleCloseForm() {
    setIsFormOpen(false);
    setEditingShowtime(null);
  }

  function getStatusBadgeColor(status: string) {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-100 text-emerald-800 border border-emerald-200";
      case "CANCELLED":
        return "bg-rose-100 text-rose-800 border border-rose-200";
      case "SOLD_OUT":
        return "bg-amber-100 text-amber-800 border border-amber-200";
      case "COMPLETED":
        return "bg-slate-100 text-slate-600 border border-slate-200";
      default:
        return "bg-gray-100 text-gray-600 border border-gray-200";
    }
  }

  function formatPrice(price: string, multiplier: string): string {
    const base = parseFloat(price);
    const mult = parseFloat(multiplier);
    return `$${(base * mult).toFixed(2)}`;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Showtimes Management
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Manage and schedule movie screenings.</p>
        </div>
        <button
          onClick={handleAddNew}
          className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-5 py-2.5 rounded-lg font-semibold shadow-sm transition-all flex items-center space-x-2"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Schedule Showtime</span>
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
          <div className="lg:col-span-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Search
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Movie or hall..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Movie
            </label>
            <select
              value={movieFilter}
              onChange={(e) => setMovieFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
            >
              <option value="">All Movies</option>
              {movies.map((m) => (
                <option key={m.id} value={m.id} className="text-slate-900">{m.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Hall
            </label>
            <select
              value={hallFilter}
              onChange={(e) => setHallFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
            >
              <option value="">All Halls</option>
              {halls.map((h) => (
                <option key={h.id} value={h.id} className="text-slate-900">{h.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
            >
              {showtimeStatuses.map((s) => (
                <option key={s.value} value={s.value} className="text-slate-900">{s.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              From
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              To
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500/30 border-t-indigo-500 mb-4"></div>
            <p className="font-medium">Loading showtimes...</p>
          </div>
        ) : showtimes.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p className="text-lg font-bold text-slate-900">No showtimes found</p>
            <p className="text-slate-500">Schedule your first showtime to get started!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Movie</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Hall</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Date & Time</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Price</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Bookings</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {showtimes.map((showtime) => (
                  <tr key={showtime.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {showtime.movie.posterUrl && (
                          <div className="relative h-12 w-8 shrink-0 shadow-sm overflow-hidden rounded-md border border-slate-200 mr-4">
                            <Image
                              src={showtime.movie.posterUrl}
                              alt={showtime.movie.title}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-bold text-slate-900">{showtime.movie.title}</div>
                          <div className="text-xs text-slate-500 font-medium">{showtime.movie.duration} min</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                      {showtime.hall.name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900 font-bold">
                        {new Date(showtime.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-1 font-medium">
                        {new Date(showtime.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        {showtime.isWeekend && (
                          <span className="px-1.5 py-0.5 text-[10px] uppercase font-black bg-orange-100 text-orange-700 rounded-md">
                            Weekend
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">
                      {formatPrice(showtime.basePrice, showtime.weekendMultiplier)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-xs font-bold border border-slate-200">
                        {showtime.bookingCount} seats
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 inline-flex text-xs font-bold rounded-full ${getStatusBadgeColor(showtime.status)}`}>
                        {showtime.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      <button
                        onClick={() => handleEdit(showtime)}
                        className="text-indigo-600 hover:text-indigo-900 font-bold mr-4 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setShowtimeToDelete(showtime)}
                        className="text-rose-500 hover:text-rose-700 font-bold transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ShowtimeForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={editingShowtime ? handleUpdateShowtime : handleCreateShowtime}
        showtime={editingShowtime}
        isLoading={isSubmitting}
      />

      <ShowtimeDeleteModal
        isOpen={!!showtimeToDelete}
        onClose={() => setShowtimeToDelete(null)}
        onConfirm={handleDeleteShowtime}
        showtime={showtimeToDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}