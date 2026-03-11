"use client";

interface ShowtimeDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  showtime: {
    id: string;
    movie?: { title: string };
    hall?: { name: string };
    startTime: string;
    bookingCount?: number;
  } | null;
  isLoading: boolean;
}

export default function ShowtimeDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  showtime,
  isLoading,
}: ShowtimeDeleteModalProps) {
  if (!isOpen || !showtime) return null;

  const hasBookings = showtime.bookingCount !== undefined && showtime.bookingCount > 0;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg leading-6 font-medium text-black mt-4">
            Delete Showtime
          </h3>
          <div className="mt-2 px-7 py-3">
            <p className="text-sm text-black">
              Are you sure you want to delete this showtime?
            </p>
            <div className="mt-2 text-left bg-gray-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-gray-700">
                {showtime.movie?.title}
              </p>
              <p className="text-sm text-gray-500">
                {showtime.hall?.name} -{" "}
                {new Date(showtime.startTime).toLocaleString()}
              </p>
            </div>
            {hasBookings && (
              <p className="text-sm text-red-600 mt-2">
                Warning: This showtime has {showtime.bookingCount} booking(s).
                You cannot delete a showtime with existing bookings.
              </p>
            )}
          </div>
          <div className="items-center px-4 py-3">
            <button
              onClick={onConfirm}
              disabled={hasBookings}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed sm:text-sm"
            >
              {isLoading ? "Deleting..." : "Delete"}
            </button>
            <button
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
