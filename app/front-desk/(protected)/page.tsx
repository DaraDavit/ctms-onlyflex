"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Ticket, 
  CalendarDays, 
  Search, 
  Plus,
  Clock,
  Users,
  Film
} from "lucide-react";

interface QuickStat {
  label: string;
  value: string;
  icon: React.ReactNode;
  change?: string;
}

export default function FrontDeskDashboard() {
  const [showBookingForm, setShowBookingForm] = useState(false);

  const stats: QuickStat[] = [
    {
      label: "Today's Bookings",
      value: "24",
      icon: <Ticket className="w-5 h-5" />,
      change: "+12%"
    },
    {
      label: "Available Seats",
      value: "156",
      icon: <Users className="w-5 h-5" />,
    },
    {
      label: "Active Showtimes",
      value: "8",
      icon: <Clock className="w-5 h-5" />,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Front Desk Dashboard
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Welcome back! What would you like to do today?
          </p>
        </div>
        <button
          onClick={() => setShowBookingForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Booking
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-zinc-800 rounded-xl p-6 border border-zinc-200 dark:border-zinc-700"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 bg-zinc-100 dark:bg-zinc-700 rounded-lg text-zinc-600 dark:text-zinc-300">
                {stat.icon}
              </div>
              {stat.change && (
                <span className="text-sm font-medium text-emerald-600">
                  {stat.change}
                </span>
              )}
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {stat.value}
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 border border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Quick Actions
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/front-desk/bookings"
              className="p-4 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors text-center"
            >
              <Search className="w-6 h-6 mx-auto mb-2 text-zinc-600 dark:text-zinc-400" />
              <p className="font-medium text-zinc-900 dark:text-zinc-100">View Bookings</p>
              <p className="text-xs text-zinc-500">Search existing bookings</p>
            </Link>
            <Link
              href="/front-desk/schedule"
              className="p-4 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors text-center"
            >
              <CalendarDays className="w-6 h-6 mx-auto mb-2 text-zinc-600 dark:text-zinc-400" />
              <p className="font-medium text-zinc-900 dark:text-zinc-100">Schedule</p>
              <p className="text-xs text-zinc-500">View movie schedule</p>
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 border border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Today's Showtimes
            </h2>
            <Link
              href="/front-desk/schedule"
              className="text-sm text-red-600 hover:text-red-700"
            >
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {[
              { movie: "Avengers: Endgame", time: "10:30 AM", hall: "Hall A", seats: 24 },
              { movie: "Inception", time: "1:00 PM", hall: "Hall B", seats: 45 },
              { movie: "The Dark Knight", time: "4:30 PM", hall: "Hall A", seats: 12 },
            ].map((showtime, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Film className="w-5 h-5 text-zinc-400" />
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      {showtime.movie}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {showtime.hall}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">
                    {showtime.time}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {showtime.seats} seats left
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showBookingForm && (
        <FrontDeskBookingModal onClose={() => setShowBookingForm(false)} />
      )}
    </div>
  );
}

function FrontDeskBookingModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            New Booking
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg"
          >
            ×
          </button>
        </div>
        <div className="p-4">
          <p className="text-zinc-500 dark:text-zinc-400">
            Use the dedicated booking interface to create new bookings.
          </p>
          <div className="mt-4 flex gap-4">
            <a
              href="/front-desk/bookings/new"
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Create Booking
            </a>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}