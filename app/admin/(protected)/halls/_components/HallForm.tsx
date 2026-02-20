"use client";

import { useState, useEffect, useMemo } from "react";
import { RowConfig, getRowOptions, seatTypeOptions, hallTypeOptions, validateRowConfigs } from "@/lib/hall-utils";
import { getRowLabel } from "@/lib/seat-logic";

interface HallFormData {
  name: string;
  hallType: string;
  rows: number;
  columns: number;
  isActive: boolean;
  rowConfigs: RowConfig[];
}

interface HallFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: HallFormData) => void;
  hall?: Hall | null;
  isLoading: boolean;
}

interface Hall {
  id: string;
  name: string;
  hallType: string;
  capacity: number;
  rows: number;
  columns: number;
  isActive: boolean;
}

const initialFormData: HallFormData = {
  name: "",
  hallType: "STANDARD",
  rows: 8,
  columns: 10,
  isActive: true,
  rowConfigs: [{ startRow: "A", endRow: "H", seatType: "REGULAR" }],
};

const seatTypeColors: Record<string, string> = {
  REGULAR: "bg-slate-300",
  VIP: "bg-amber-400",
  LOVESEAT_LEFT: "bg-indigo-400",
  LOVESEAT_RIGHT: "bg-indigo-500",
};

function SeatPreviewGrid({ rows, columns, rowConfigs, rowOptions }: {
  rows: number;
  columns: number;
  rowConfigs: RowConfig[];
  rowOptions: { value: string; label: string }[];
}) {
  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${columns}, minmax(24px, 32px))`,
    gap: "4px",
    justifyContent: "center",
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-full max-w-full overflow-x-auto py-2">
        <div style={gridStyle}>
          {Array.from({ length: rows * columns }).map((_, idx) => {
            const rowIdx = Math.floor(idx / columns);
            const matchingConfig = rowConfigs.find((config) => {
              const startIdx = rowOptions.findIndex(o => o.value === config.startRow);
              const endIdx = rowOptions.findIndex(o => o.value === config.endRow);
              return rowIdx >= startIdx && rowIdx <= endIdx;
            });
            const seatType = matchingConfig?.seatType || "REGULAR";
            const colorClass = seatTypeColors[seatType] || "bg-slate-300";

            return (
              <div
                key={idx}
                className={`w-6 h-6 sm:w-8 sm:h-8 ${colorClass} rounded-t-lg text-[8px] sm:text-[10px] flex items-center justify-center text-white font-bold`}
                title={seatType}
              >
                {rowIdx === 0 ? idx % columns + 1 : ""}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function HallForm({
  isOpen,
  onClose,
  onSubmit,
  hall,
  isLoading,
}: HallFormProps) {
  const [formData, setFormData] = useState<HallFormData>(initialFormData);
  const [error, setError] = useState("");

  const isEditMode = !!hall;
  const rowOptions = useMemo(() => getRowOptions(formData.rows), [formData.rows]);

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormData);
      setError("");
      return;
    }

    if (hall) {
      setFormData({
        name: hall.name,
        hallType: hall.hallType,
        rows: hall.rows || 8,
        columns: hall.columns || 10,
        isActive: hall.isActive,
        rowConfigs: [{ startRow: "A", endRow: getRowLabel((hall.rows || 8) - 1), seatType: "REGULAR" }],
      });
    } else {
      setFormData(initialFormData);
    }
  }, [hall, isOpen]);

  const handleClose = () => {
    setFormData(initialFormData);
    setError("");
    onClose();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : name === "rows" || name === "columns"
          ? parseInt(value) || 0
          : value,
    }));
  };

  const handleRowConfigChange = (index: number, field: keyof RowConfig, value: string) => {
    setFormData((prev) => {
      const newConfigs = [...prev.rowConfigs];
      newConfigs[index] = { ...newConfigs[index], [field]: value };
      return { ...prev, rowConfigs: newConfigs };
    });
  };

  const addRowConfig = () => {
    const lastConfig = formData.rowConfigs[formData.rowConfigs.length - 1];
    const lastEndIdx = lastConfig ? rowOptions.findIndex(o => o.value === lastConfig.endRow) : 0;
    const newStartRow = getRowLabel(lastEndIdx + 1);
    const newEndRow = getRowLabel(lastEndIdx + 1);
    
    setFormData((prev) => ({
      ...prev,
      rowConfigs: [
        ...prev.rowConfigs,
        { startRow: newStartRow, endRow: newEndRow, seatType: "REGULAR" },
      ],
    }));
  };

  const removeRowConfig = (index: number) => {
    if (formData.rowConfigs.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      rowConfigs: prev.rowConfigs.filter((_, i) => i !== index),
    }));
  };

  const seatCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (let rowIdx = 0; rowIdx < formData.rows; rowIdx++) {
      const matchingConfig = formData.rowConfigs.find((config) => {
        const startIdx = rowOptions.findIndex(o => o.value === config.startRow);
        const endIdx = rowOptions.findIndex(o => o.value === config.endRow);
        return rowIdx >= startIdx && rowIdx <= endIdx;
      });
      const seatType = matchingConfig?.seatType || "REGULAR";
      counts[seatType] = (counts[seatType] || 0) + formData.columns;
    }
    return counts;
  }, [formData.rows, formData.columns, formData.rowConfigs, rowOptions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Hall name is required");
      return;
    }

    if (formData.rows < 1) {
      setError("At least 1 row is required");
      return;
    }

    if (formData.columns < 1) {
      setError("At least 1 column is required");
      return;
    }

    const validationError = validateRowConfigs(formData.rowConfigs, formData.rows);
    if (validationError) {
      setError(validationError);
      return;
    }

    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 text-black bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 py-5 border-b flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              {isEditMode ? "Edit Hall" : "Create New Hall"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEditMode
                ? "Update hall details and configuration"
                : "Configure hall layout and seat types"}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-lg">
              {error}
            </div>
          )}

          {/* Hall Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Hall Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Hall 1, IMAX 1, VIP Room"
                  className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Hall Type</label>
                  <select
                    name="hallType"
                    value={formData.hallType}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  >
                    {hallTypeOptions.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Status</label>
                  <div className="flex items-center h-10.5 px-4 border rounded-xl bg-slate-50">
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 mr-3"
                    />
                    <label htmlFor="isActive" className="text-sm text-slate-700 cursor-pointer">
                      Active
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Capacity Preview */}
            <div className="bg-indigo-50 rounded-xl p-4 flex flex-col items-center justify-center text-center">
              <div className="text-4xl font-black text-indigo-600">
                {formData.rows * formData.columns}
              </div>
              <div className="text-sm font-bold text-indigo-400 mt-1">Total Seats</div>
              <div className="text-xs text-indigo-300 mt-2">
                {formData.rows} rows × {formData.columns} cols
              </div>
            </div>
          </div>

          {/* Layout Configuration */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-700 border-b pb-2">Layout Configuration</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Number of Rows</label>
                <input
                  type="number"
                  name="rows"
                  min={1}
                  max={26}
                  value={formData.rows}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Seats per Row</label>
                <input
                  type="number"
                  name="columns"
                  min={1}
                  max={30}
                  value={formData.columns}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Row Configuration */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-700 border-b pb-2">Seat Type Configuration</h4>
            <div className="space-y-3">
              {formData.rowConfigs.map((config, index) => (
                <div key={index} className="flex items-center gap-3 flex-wrap md:flex-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">Row</span>
                    <select
                      value={config.startRow}
                      onChange={(e) => handleRowConfigChange(index, "startRow", e.target.value)}
                      className="px-3 py-2 border rounded-lg text-sm bg-white"
                    >
                      {rowOptions.slice(0, formData.rows).map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <span className="text-xs font-bold text-slate-500">to</span>
                    <select
                      value={config.endRow}
                      onChange={(e) => handleRowConfigChange(index, "endRow", e.target.value)}
                      className="px-3 py-2 border rounded-lg text-sm bg-white"
                    >
                      {rowOptions.slice(0, formData.rows).map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">Type:</span>
                    <select
                      value={config.seatType}
                      onChange={(e) => handleRowConfigChange(index, "seatType", e.target.value)}
                      className="px-3 py-2 border rounded-lg text-sm bg-white"
                    >
                      {seatTypeOptions.map((type) => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  {formData.rowConfigs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRowConfig(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
            {formData.rowConfigs.length < 4 && (
              <button
                type="button"
                onClick={addRowConfig}
                className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Row Range
              </button>
            )}
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-700 border-b pb-2">Layout Preview</h4>
            <div className="bg-slate-50 rounded-xl p-4 overflow-auto">
              <SeatPreviewGrid 
                rows={formData.rows} 
                columns={formData.columns} 
                rowConfigs={formData.rowConfigs}
                rowOptions={rowOptions}
              />
            </div>
            <div className="flex flex-wrap gap-4 text-xs">
              {seatTypeOptions.filter(t => seatCounts[t.value] > 0).map(type => (
                <div key={type.value} className="flex items-center gap-1">
                  <span className={`w-3 h-3 rounded ${seatTypeColors[type.value]}`}></span>
                  <span className="text-slate-600">{type.label}: {seatCounts[type.value]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-200"
            >
              {isLoading
                ? "Creating..."
                : isEditMode
                ? "Update Hall"
                : "Create Hall with Seats"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
