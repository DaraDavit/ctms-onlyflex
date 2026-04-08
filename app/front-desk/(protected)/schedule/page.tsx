"use client";

import { useState, useEffect, useCallback } from "react";
import { Film, Clock, MapPin, Users, Calendar } from "lucide-react";

interface Showtime {
  id: string;
  startTime: string;
  endTime: string;
  basePrice: string;
  status: string;
  hall: {
    id: string;
    name: string;
    capacity: number;
  };
  movie: {
    id: string;
    title: string;
    posterUrl: string | null;
    duration: number | null;
  };
  _count: {
    tickets: number;
  };
}

export default function FrontDeskSchedulePage() {
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  const fetchShowtimes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/front-desk/schedule?date=${selectedDate}`);
      if (response.ok) {
        const data = await response.json();
        setShowtimes(data.showtimes || []);
      }
    } catch (err) {
      console.error("Error fetching schedule:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchShowtimes();
  }, [fetchShowtimes]);

  const getAvailableSeats = (showtime: Showtime) => {
    return showtime.hall.capacity - showtime._count.tickets;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  const getDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        date: date.toISOString().split("T")[0],
        label: i === 0 ? "Today" : date.toLocaleDateString("en-US", { weekday: "short", day: "numeric" }),
      });
    }
    return dates;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Movie Schedule
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            View showtimes and availability
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {getDates().map((d) => (
            <button
              key={d.date}
              onClick={() => setSelectedDate(d.date)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedDate === d.date
                  ? "bg-red-600 text-white"
                  : "bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-zinc-500">Loading schedule...</div>
      ) : showtimes.length === 0 ? (
        <div className="text-center py-12">
          <Film className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
          <p className="text-zinc-500">No showtimes scheduled for this date</p>
        </div>
      ) : (
        <div className="space-y-4">
          {showtimes.map((showtime) => {
            const availableSeats = getAvailableSeats(showtime);
            const isSoldOut = availableSeats <= 0;
            const isAlmostFull = availableSeats < 10;

            return (
              <div
                key={showtime.id}
                className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-24 h-36 bg-zinc-100 dark:bg-zinc-700 rounded-lg overflow-hidden flex-shrink-0">
                    {showtime.movie.posterUrl ? (
                      <img
                        src={showtime.movie.posterUrl}
                        alt={showtime.movie.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film className="w-8 h-8 text-zinc-400" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                          {showtime.movie.title}
                        </h3>
                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(showtime.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            {" - "}
                            {new Date(showtime.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {showtime.hall.name}
                          </div>
                          {showtime.movie.duration && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {showtime.movie.duration} min
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                          ${parseFloat(showtime.basePrice).toFixed(2)}
                        </p>
                        <p className="text-xs text-zinc-500">from</p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-zinc-400" />
                        <span className="text-sm">
                          <span className={isSoldOut ? "text-red-600" : isAlmostFull ? "text-yellow-600" : "text-zinc-600 dark:text-zinc-400"}>
                            {availableSeats} seats available
                          </span>
                          {" / "}
                          <span className="text-zinc-500">{showtime.hall.capacity} total</span>
                        </span>
                      </div>

                      {showtime.status === "ACTIVE" && !isSoldOut && (
                        <a
                          href={`/front-desk/bookings/new?showtimeId=${showtime.id}`}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors text-sm"
                        >
                          Book Now
                        </a>
                      )}
                      {isSoldOut && (
                        <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-700 text-zinc-500 rounded-lg text-sm">
                          Sold Out
                        </span>
                      )}
                      {showtime.status === "CANCELLED" && (
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm">
                          Cancelled
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}