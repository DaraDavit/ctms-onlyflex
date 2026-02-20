"use client";

import { useState, useEffect } from "react";

interface SeatGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (config: SeatGenerationConfig, mode: "add" | "regenerate") => void;
  hallCapacity: number;
  isLoading: boolean;
  mode: "add" | "regenerate";
}

interface SeatGenerationConfig {
  rows: number;
  seatsPerRow: number;
  startingRow: string;
  defaultSeatType: string;
}

const seatTypes = [
  { value: "REGULAR", label: "Regular", color: "bg-green-100" },
  { value: "VIP", label: "VIP", color: "bg-purple-100" },
  { value: "LOVESEAT", label: "Loveseat", color: "bg-rose-100" },
];

export default function SeatGeneratorModal({
  isOpen,
  onClose,
  onGenerate,
  hallCapacity,
  isLoading,
  mode,
}: SeatGeneratorModalProps) {
  const [config, setConfig] = useState<SeatGenerationConfig>({
    rows: 10,
    seatsPerRow: 15,
    startingRow: "A",
    defaultSeatType: "REGULAR",
  });
  const [error, setError] = useState("");

  // Reset config when modal opens
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isOpen) {
      // Suggest reasonable defaults based on capacity
      const suggestedRows = Math.ceil(Math.sqrt(hallCapacity));
      const suggestedSeatsPerRow = Math.ceil(hallCapacity / suggestedRows);
      
      setConfig({
        rows: Math.min(suggestedRows, 20),
        seatsPerRow: Math.min(suggestedSeatsPerRow, 25),
        startingRow: "A",
        defaultSeatType: "REGULAR",
      });
      setError("");
    }
  }, [isOpen, hallCapacity]);

  const handleChange = (
    field: keyof SeatGenerationConfig,
    value: string | number
  ) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (config.rows < 1 || config.rows > 50) {
      setError("Rows must be between 1 and 50");
      return;
    }
    
    if (config.seatsPerRow < 1 || config.seatsPerRow > 50) {
      setError("Seats per row must be between 1 and 50");
      return;
    }
    
    const totalSeats = config.rows * config.seatsPerRow;
    if (totalSeats > 1000) {
      setError("Maximum 1000 seats allowed per generation");
      return;
    }
    
    if (!config.startingRow || config.startingRow.length > 2) {
      setError("Starting row must be 1-2 characters (e.g., A, 1, AA)");
      return;
    }

    onGenerate(config, mode);
  };

  // Generate preview grid
  const generatePreview = () => {
    const preview = [];
    const maxPreviewRows = Math.min(config.rows, 5);
    const maxPreviewSeats = Math.min(config.seatsPerRow, 10);
    
    for (let r = 0; r < maxPreviewRows; r++) {
      let rowLabel: string;
      if (config.startingRow.match(/^[A-Za-z]$/)) {
        const startCharCode = config.startingRow.toUpperCase().charCodeAt(0);
        rowLabel = String.fromCharCode(startCharCode + r);
      } else {
        const startNum = parseInt(config.startingRow) || 1;
        rowLabel = String(startNum + r);
      }
      
      preview.push({
        row: rowLabel,
        seats: Array.from({ length: maxPreviewSeats }, (_, i) => i + 1),
      });
    }
    
    return preview;
  };

  const totalSeats = config.rows * config.seatsPerRow;
  const selectedSeatType = seatTypes.find((t) => t.value === config.defaultSeatType);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 text-black bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-6 py-4 border-b flex justify-between items-center ${mode === "regenerate" ? "bg-amber-50" : "bg-slate-50"}`}>
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              {mode === "regenerate" ? "Regenerate Seat Layout" : "Add More Seats"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {mode === "regenerate" 
                ? "Replace all existing seats with a new layout" 
                : "Add new seats to the existing layout"}
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

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-lg">
                {error}
              </div>
            )}

            {/* Configuration Form */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  Number of Rows
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={config.rows}
                  onChange={(e) => handleChange("rows", parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  Seats per Row
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={config.seatsPerRow}
                  onChange={(e) => handleChange("seatsPerRow", parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  Starting Row
                </label>
                <input
                  type="text"
                  maxLength={2}
                  value={config.startingRow}
                  onChange={(e) => handleChange("startingRow", e.target.value.toUpperCase())}
                  placeholder="A or 1"
                  className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all uppercase"
                />
                <p className="text-xs text-gray-500">
                  Use letters (A, B...) or numbers (1, 2...)
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  Default Seat Type
                </label>
                <select
                  value={config.defaultSeatType}
                  onChange={(e) => handleChange("defaultSeatType", e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                >
                  {seatTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-indigo-700">
                    Total Seats to Generate
                  </p>
                  <p className="text-3xl font-bold text-indigo-900 mt-1">
                    {totalSeats.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-indigo-600">
                    Layout: {config.rows} rows × {config.seatsPerRow} seats
                  </p>
                  <p className="text-xs text-indigo-600 mt-1">
                    Starting: Row {config.startingRow}
                  </p>
                  <p className="text-xs text-indigo-600 mt-1">
                    Type: {selectedSeatType?.label}
                  </p>
                </div>
              </div>
            </div>

            {/* Capacity Warning */}
            {totalSeats !== hallCapacity && (
              <div className={`p-4 rounded-lg text-sm border ${
                totalSeats > hallCapacity 
                  ? "bg-red-50 border-red-200 text-red-700" 
                  : "bg-yellow-50 border-yellow-200 text-yellow-700"
              }`}>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>
                    {totalSeats > hallCapacity 
                      ? `Over capacity: Generating ${totalSeats} seats but hall capacity is ${hallCapacity} (${totalSeats - hallCapacity} extra)`
                      : `Under capacity: Generating ${totalSeats} seats but hall capacity is ${hallCapacity} (${hallCapacity - totalSeats} short)`
                    }
                  </span>
                </div>
              </div>
            )}

            {/* Preview */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-slate-700">Preview</h4>
                {config.rows > 5 || config.seatsPerRow > 10 ? (
                  <span className="text-xs text-gray-500">
                    Showing first {Math.min(config.rows, 5)} rows × {Math.min(config.seatsPerRow, 10)} seats
                  </span>
                ) : null}
              </div>
              
              <div className="bg-slate-50 rounded-xl p-4 border overflow-x-auto">
                <div className="flex justify-center mb-4">
                  <div className="bg-gray-800 text-white px-6 py-1.5 rounded text-xs font-medium">
                    SCREEN
                  </div>
                </div>
                
                <div className="space-y-2">
                  {generatePreview().map((row) => (
                    <div key={row.row} className="flex items-center gap-2">
                      <span className="w-6 text-center font-bold text-gray-500 text-xs">
                        {row.row}
                      </span>
                      <div className="flex-1 flex justify-center gap-1">
                        {row.seats.map((seatNum) => (
                          <div
                            key={seatNum}
                            className={`w-6 h-6 rounded border-2 text-[10px] flex items-center justify-center ${selectedSeatType?.color || "bg-gray-100"} border-gray-300`}
                          >
                            {seatNum}
                          </div>
                        ))}
                        {config.seatsPerRow > 10 && (
                          <span className="text-xs text-gray-400 self-center ml-1">
                            +{config.seatsPerRow - 10} more
                          </span>
                        )}
                      </div>
                      <span className="w-6 text-center font-bold text-gray-500 text-xs">
                        {row.row}
                      </span>
                    </div>
                  ))}
                  {config.rows > 5 && (
                    <div className="text-center text-xs text-gray-400 py-2">
                      + {config.rows - 5} more rows
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t flex justify-end gap-4 ${mode === "regenerate" ? "bg-amber-50" : "bg-slate-50"}`}>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`px-8 py-2.5 rounded-xl font-bold text-sm disabled:opacity-50 transition-all shadow-lg ${
              mode === "regenerate"
                ? "bg-amber-500 text-white hover:bg-amber-600 shadow-amber-200"
                : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200"
            }`}
          >
            {isLoading
              ? mode === "regenerate" ? "Replacing..." : "Generating..."
              : mode === "regenerate"
                ? `Replace with ${totalSeats.toLocaleString()} Seats`
                : `Generate ${totalSeats.toLocaleString()} Seats`}
          </button>
        </div>
      </div>
    </div>
  );
}
