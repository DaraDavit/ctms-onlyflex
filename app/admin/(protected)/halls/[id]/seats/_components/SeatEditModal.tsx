"use client";

import { useState, useEffect } from "react";
import type { Seat, SeatType } from "@/types/seat";

// Extended interface for the modal's internal representation
interface ModalSeat {
  id: string;
  row: string;
  number: number;
  seatType: SeatType;
  isActive: boolean;
}

interface SeatEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  seat: Seat | null;
  onSave: (seatId: string, updates: Partial<ModalSeat>) => void;
  onDelete: (seatId: string) => void;
  isLoading: boolean;
}

const seatTypes = [
  { value: "REGULAR" as SeatType, label: "Regular", color: "bg-green-100", border: "border-green-300", text: "text-green-800" },
  { value: "VIP" as SeatType, label: "VIP", color: "bg-purple-100", border: "border-purple-300", text: "text-purple-800" },
  { value: "LOVESEAT_LEFT" as SeatType, label: "Loveseat", color: "bg-rose-100", border: "border-rose-300", text: "text-rose-800" },
];

export default function SeatEditModal({
  isOpen,
  onClose,
  seat,
  onSave,
  onDelete,
  isLoading,
}: SeatEditModalProps) {
  const [seatType, setSeatType] = useState<SeatType>("REGULAR");
  const [isActive, setIsActive] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Helper to convert shared Seat to modal representation
  const getModalSeat = (s: Seat | null): ModalSeat | null => {
    if (!s) return null;
    return {
      id: s.id,
      row: s.row,
      number: s.seatNumber ?? 0,
      seatType: s.seatType,
      isActive: s.status !== 'INACTIVE',
    };
  };

  // Sync state when seat changes (only when seat ID changes)
  useEffect(() => {
    if (seat) {
      setSeatType(seat.seatType);
      setIsActive(seat.status !== 'INACTIVE');
    }
  }, [seat?.id, seat?.seatType, seat?.status]);

  const handleSave = () => {
    if (!seat) return;
    onSave(seat.id, { seatType, isActive });
  };

  const handleDelete = () => {
    if (!seat) return;
    onDelete(seat.id);
    setShowDeleteConfirm(false);
  };

  const getSeatTypeStyle = (type: SeatType) => {
    const seatType = seatTypes.find((t) => t.value === type);
    return seatType || seatTypes[0];
  };

  const currentStyle = getSeatTypeStyle(seatType);
  const modalSeat = getModalSeat(seat);

  if (!isOpen || !seat || !modalSeat) return null;

  return (
    <div
      className="fixed inset-0 text-black bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b bg-slate-50 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Edit Seat {modalSeat.row}{modalSeat.number}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Modify seat type and availability
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm ? (
          <div className="p-6 space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">
                Delete Seat {modalSeat.row}{modalSeat.number}?
              </h4>
              <p className="text-sm text-gray-600">
                This seat will be permanently removed. This is typically used for creating aisles or walkway spaces.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? "Deleting..." : "Delete Seat"}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Preview */}
            <div className="px-6 pt-6">
              <div className="flex justify-center">
                <div
                  className={`w-20 h-20 rounded-xl border-2 ${currentStyle.color} ${currentStyle.border} flex flex-col items-center justify-center transition-all`}
                >
                  <span className="text-xs text-gray-600">{modalSeat.row}</span>
                  <span className="text-2xl font-bold text-gray-900">{modalSeat.number}</span>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="p-6 space-y-6">
              {/* Seat Type */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700">
                  Seat Type
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {seatTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setSeatType(type.value)}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        seatType === type.value
                          ? `${type.color} ${type.border} ${type.text} border-current`
                          : "bg-white border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded mx-auto mb-2 ${type.color} ${type.border} border-2`}
                      />
                      <span className={`text-sm font-medium ${seatType === type.value ? type.text : "text-gray-700"}`}>
                        {type.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Status */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700">
                  Availability
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsActive(true)}
                    className={`flex-1 p-3 rounded-xl border-2 text-center transition-all ${
                      isActive
                        ? "bg-green-50 border-green-500 text-green-700"
                        : "bg-white border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-green-500"></span>
                      <span className="text-sm font-medium">Active</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setIsActive(false)}
                    className={`flex-1 p-3 rounded-xl border-2 text-center transition-all ${
                      !isActive
                        ? "bg-gray-100 border-gray-500 text-gray-700"
                        : "bg-white border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-gray-400"></span>
                      <span className="text-sm font-medium">Inactive</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-slate-50 rounded-lg p-3 text-xs text-gray-600">
                <p className="font-medium mb-1">💡 Tip:</p>
                <p>
                  Use <strong>Inactive</strong> to temporarily disable a seat (e.g., for maintenance). 
                  Use <strong>Delete</strong> to permanently remove a seat for aisle/walkway creation.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <span className="flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
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
                </span>
              </button>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
