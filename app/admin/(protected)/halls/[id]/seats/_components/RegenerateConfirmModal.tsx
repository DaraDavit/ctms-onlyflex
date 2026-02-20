"use client";

interface RegenerateConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentSeatCount: number;
}

export default function RegenerateConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  currentSeatCount,
}: RegenerateConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b bg-amber-50 flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xl">⚠️</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-amber-900">
              Replace All Seats?
            </h3>
            <p className="text-xs text-amber-700">
              This action cannot be undone
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              This will permanently delete all{" "}
              <strong>{currentSeatCount}</strong> existing seats and create a
              completely new layout.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Current seats:</span>
              <span className="font-semibold text-gray-900">
                {currentSeatCount}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">After regeneration:</span>
              <span className="font-semibold text-amber-600">
                New layout (you will configure)
              </span>
            </div>
          </div>

          <p className="text-xs text-gray-500">
            All existing seat data including types and availability will be lost.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors shadow-sm"
          >
            Yes, Replace All
          </button>
        </div>
      </div>
    </div>
  );
}
