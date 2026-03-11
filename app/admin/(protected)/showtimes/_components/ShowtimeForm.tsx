"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

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

interface ShowtimeFormData {
  movieId: string;
  hallId: string;
  startTime: string;
  basePrice: string;
  weekendMultiplier: string;
  status: string;
}

interface ShowtimeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ShowtimeFormData) => void;
  showtime?: {
    id: string;
    movieId: string;
    hallId: string;
    startTime: string;
    basePrice: string;
    weekendMultiplier: string;
    status: string;
    movie?: Movie;
    hall?: Hall;
    bookingCount?: number;
  } | null;
  isLoading: boolean;
}

const initialFormData: ShowtimeFormData = {
  movieId: "",
  hallId: "",
  startTime: "",
  basePrice: "12.00",
  weekendMultiplier: "1.0",
  status: "ACTIVE",
};

const showtimeStatuses = [
  { value: "ACTIVE", label: "Active" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "SOLD_OUT", label: "Sold Out" },
];

function formatDateTimeForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function getWeekendMultiplier(dateStr: string): number {
  if (!dateStr) return 1.0;
  const date = new Date(dateStr);
  const dayOfWeek = date.getDay();
  return dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0 ? 1.3 : 1.0;
}

export default function ShowtimeForm({
  isOpen,
  onClose,
  onSubmit,
  showtime,
  isLoading,
}: ShowtimeFormProps) {
  const [formData, setFormData] = useState<ShowtimeFormData>(initialFormData);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [error, setError] = useState("");

  const fetchMovies = useCallback(async () => {
    try {
      setIsLoadingData(true);
      const response = await fetch("/api/admin/movies?status=RELEASED&limit=100");
      if (response.ok) {
        const data = await response.json();
        setMovies(data.movies || []);
      }
    } catch (err) {
      console.error("Error fetching movies:", err);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  const fetchHalls = useCallback(async () => {
    try {
      setIsLoadingData(true);
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
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    fetchMovies();
    fetchHalls();

    if (showtime) {
      setFormData({
        movieId: showtime.movieId || "",
        hallId: showtime.hallId || "",
        startTime: showtime.startTime
          ? formatDateTimeForInput(new Date(showtime.startTime))
          : "",
        basePrice: showtime.basePrice || "12.00",
        weekendMultiplier: showtime.weekendMultiplier || "1.0",
        status: showtime.status || "ACTIVE",
      });

      if (showtime.movie) {
        setSelectedMovie(showtime.movie as Movie);
      }
    } else {
      setFormData(initialFormData);
      setSelectedMovie(null);
    }
  }, [showtime, isOpen, fetchMovies, fetchHalls]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };

      if (name === "startTime") {
        next.weekendMultiplier = getWeekendMultiplier(value).toString();
      }

      return next;
    });

    if (name === "movieId") {
      const movie = movies.find((m) => m.id === value);
      setSelectedMovie(movie || null);
    }
  };

  const getEndTime = (): string => {
    if (!formData.startTime || !selectedMovie?.duration) return "--:--";
    const start = new Date(formData.startTime);
    const duration = selectedMovie.duration;
    const end = new Date(start.getTime() + duration * 60000);
    return end.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const isWeekend = (): boolean => {
    if (!formData.startTime) return false;
    const date = new Date(formData.startTime);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.movieId || !formData.hallId || !formData.startTime) {
      setError("Please fill in all required fields");
      return;
    }

    if (!selectedMovie?.duration) {
      setError("Please select a movie with a valid duration");
      return;
    }

    setError("");
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-8 py-5 border-b flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              {showtime ? "Edit Showtime" : "Schedule Showtime"}
            </h3>
            <p className="text-sm text-slate-500 mt-0.5 font-medium">
              Set up movie screening schedule
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 text-slate-600 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6 bg-white">
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-800 text-sm font-semibold rounded-r-lg">
              {error}
            </div>
          )}

          {isLoadingData ? (
            <div className="py-12 text-center text-slate-900 font-bold">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mb-2"></div>
              <p>Loading movies and halls...</p>
            </div>
          ) : (
            <>
              {/* Movie Selection */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">
                    Movie <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="movieId"
                    value={formData.movieId}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  >
                    <option value="" className="text-slate-400">Select a movie...</option>
                    {movies.map((movie) => (
                      <option key={movie.id} value={movie.id} className="text-slate-900">
                        {movie.title} {movie.duration ? ` (${movie.duration} min)` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedMovie && (
                  <div className="flex items-center gap-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                    {selectedMovie.posterUrl ? (
                      <Image
                        src={selectedMovie.posterUrl}
                        alt={selectedMovie.title}
                        width={48}
                        height={72}
                        className="object-cover rounded-lg shadow-sm"
                        unoptimized
                      />
                    ) : (
                      <div className="w-12 h-16 bg-indigo-200 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                        </svg>
                      </div>
                    )}
                    <div>
                      <p className="text-base font-extrabold text-indigo-950">{selectedMovie.title}</p>
                      <p className="text-sm font-bold text-indigo-600">Duration: {selectedMovie.duration || 0} minutes</p>
                    </div>
                  </div>
                )}

                {/* Hall Selection */}
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">
                    Hall <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="hallId"
                    value={formData.hallId}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  >
                    <option value="" className="text-slate-400">Select a hall...</option>
                    {halls.map((hall) => (
                      <option key={hall.id} value={hall.id} className="text-slate-900">
                        {hall.name} (Capacity: {hall.capacity})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Timing */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">
                    Date & Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">End Time</label>
                  <div className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center">
                    {selectedMovie?.duration ? getEndTime() : "Select a movie"}
                  </div>
                </div>
              </div>

              {formData.startTime && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className={`px-2.5 py-1 text-xs font-black uppercase tracking-tight rounded-md shadow-sm ${
                    isWeekend() ? "bg-orange-600 text-white" : "bg-indigo-600 text-white"
                  }`}>
                    {isWeekend() ? "Weekend" : "Weekday"}
                  </span>
                  <span className="text-sm text-slate-700 font-bold">
                    {isWeekend() ? "Weekend pricing logic active" : "Standard weekday rate active"}
                  </span>
                </div>
              )}

              {/* Pricing */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">Base Price ($)</label>
                  <input
                    type="number"
                    name="basePrice"
                    step="0.01"
                    min="0"
                    value={formData.basePrice}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">Multiplier</label>
                  <input
                    type="number"
                    name="weekendMultiplier"
                    step="0.1"
                    min="1"
                    max="3"
                    value={formData.weekendMultiplier}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                >
                  {showtimeStatuses.map((s) => (
                    <option key={s.value} value={s.value} className="text-slate-900">{s.label}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Footer Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-black text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-wider"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || isLoadingData}
              className="px-10 py-3 bg-indigo-600 text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-200"
            >
              {isLoading ? "Saving..." : showtime ? "Update Showtime" : "Schedule Showtime"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}