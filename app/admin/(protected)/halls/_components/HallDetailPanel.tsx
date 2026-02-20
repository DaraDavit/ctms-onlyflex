"use client";

import Link from "next/link";

interface Hall {
  id: string;
  name: string;
  hallType: string;
  capacity: number;
  rows: number;
  columns: number;
  isActive: boolean;
  createdAt: string;
  _count: {
    showtimes: number;
    seats: number;
  };
}

interface HallDetailPanelProps {
  hall: Hall | null;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
  isUpdating: boolean;
  isMobile?: boolean;
  onBackToList?: () => void;
}

const getHallTypeBadge = (type: string) => {
  const colors: Record<string, string> = {
    STANDARD: "bg-blue-100 text-blue-800 border-blue-200",
    VIP: "bg-purple-100 text-purple-800 border-purple-200",
    Regular: "bg-gray-100 text-gray-800 border-gray-200",
  };
  return colors[type] || colors.Regular;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function HallDetailPanel({
  hall,
  onEdit,
  onDelete,
  onToggleStatus,
  isUpdating,
  isMobile = false,
  onBackToList,
}: HallDetailPanelProps) {
  if (!hall) {
    return (
      <div className="h-full flex items-center justify-center p-8 text-gray-500">
        <div className="text-center">
          <span className="text-4xl mb-4 block">🎬</span>
          <p className="text-lg font-medium">Select a hall</p>
          <p className="text-sm mt-1">Choose a hall from the list to view details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b bg-white">
        {isMobile && onBackToList && (
          <button
            onClick={onBackToList}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to List
          </button>
        )}

        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{hall.name}</h2>
            <div className="flex items-center gap-3 mt-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getHallTypeBadge(
                  hall.hallType
                )}`}
              >
                {hall.hallType}
              </span>
              <span className="text-sm text-gray-500">
                Created {formatDate(hall.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Status Section */}
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Status</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {hall.isActive
                  ? "Hall is active and available for booking"
                  : "Hall is currently inactive"}
              </p>
            </div>
            <button
              onClick={onToggleStatus}
              disabled={isUpdating}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                hall.isActive ? "bg-indigo-600" : "bg-gray-200"
              } ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  hall.isActive ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-200 rounded-lg">
                <svg
                  className="w-5 h-5 text-blue-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-blue-600 uppercase">
                  Showtimes
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {hall._count.showtimes}
                </p>
              </div>
            </div>
            <p className="text-xs text-blue-700 mt-2">
              {hall._count.showtimes === 1 ? "Scheduled" : "Scheduled"}
            </p>
          </div>

          <div className="bg-linear-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-200 rounded-lg">
                <svg
                  className="w-5 h-5 text-green-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-green-600 uppercase">
                  Seats
                </p>
                <p className="text-2xl font-bold text-green-900">
                  {hall._count.seats}
                </p>
              </div>
            </div>
            <p className="text-xs text-green-700 mt-2">Configured</p>
          </div>
        </div>

        {/* Capacity Info */}
        <div className="bg-gray-50 rounded-xl p-4 border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Total Capacity
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {hall.capacity}
                  <span className="text-sm font-normal text-gray-500 ml-1">
                    seats
                  </span>
                </p>
              </div>
            </div>
            {hall._count.seats > 0 && hall._count.seats !== hall.capacity && (
              <div
                className={`text-xs px-2 py-1 rounded ${
                  hall._count.seats < hall.capacity
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {hall._count.seats < hall.capacity
                  ? `${hall.capacity - hall._count.seats} unconfigured`
                  : "Overconfigured"}
              </div>
            )}
          </div>
        </div>

        {/* Seat Configuration */}
        <div className="bg-white rounded-xl border p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Seat Configuration
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            Manage seat layout, types, and availability for this hall.
          </p>
          <Link
            href={`/admin/halls/${hall.id}/seats`}
            className="inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
            Configure Seats
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <button
            onClick={onEdit}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit
          </button>
          <button
            onClick={onDelete}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 hover:bg-red-50 transition-colors"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
