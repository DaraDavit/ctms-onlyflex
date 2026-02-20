"use client";

interface Hall {
  id: string;
  name: string;
  hallType: string;
  capacity: number;
  _count: {
    seats: number;
    showtimes: number;
  };
}

interface HallDeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  hall: Hall | null;
  isLoading: boolean;
}

export default function HallDeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  hall,
  isLoading,
}: HallDeleteConfirmModalProps) {
  if (!isOpen || !hall) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b bg-red-50 flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
            <span className="text-xl">🗑️</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-red-900">
              Delete Hall?
            </h3>
            <p className="text-xs text-red-700">
              This action cannot be undone
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Hall Details */}
          <div className="bg-gray-50 rounded-xl p-4 border">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">🎬</span>
              <div>
                <h4 className="font-bold text-gray-900 text-lg">{hall.name}</h4>
                <p className="text-sm text-gray-600">
                  Type: {hall.hallType} | Capacity: {hall.capacity} seats
                </p>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-xl shrink-0">⚠️</span>
              <div>
                <h5 className="font-semibold text-amber-900 mb-2">
                  This will permanently delete:
                </h5>
                <ul className="space-y-1 text-sm text-amber-800">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                    {hall._count.seats} configured seats
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                    All seat layout data
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                    Hall configuration
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Cannot Undo Warning */}
          <div className="flex items-center gap-2 text-red-700 bg-red-50 rounded-lg p-3 border border-red-200">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-sm font-semibold">
              This action cannot be undone!
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-8 py-2.5 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 disabled:opacity-50 transition-all shadow-lg shadow-red-200"
          >
            {isLoading ? "Deleting..." : "Yes, Delete Hall"}
          </button>
        </div>
      </div>
    </div>
  );
}
