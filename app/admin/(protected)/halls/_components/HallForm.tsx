"use client";

import { SeatGrid } from "@/components/seats/SeatGrid";
import { Seat, SeatType, SeatStatus } from "@/types/seat";
import { useState, useMemo, useEffect } from "react";
import {
  RowConfig,
  getRowOptions,
  seatTypeOptions,
  hallTypeOptions,
  validateRowConfigs,
} from "@/lib/hall-utils";
import { getRowLabel } from "@/lib/seat-logic";

interface HallFormData {
  name: string;
  hallType: string;
  rows: number;
  columns: number;
  isActive: boolean;
  rowConfigs: RowConfig[];
}

interface Hall {
  id: string;
  name: string;
  hallType: string;
  capacity: number;
  rows: number;
  columns: number;
  isActive: boolean;
    seats?: Array<{
    id: string;
    row: string;
    column: number;
    seatNumber: number | null;
    seatType: string;
    status: string;
  }>;
  rowConfigs?: Array<{
    startRow: string;
    endRow: string;
    seatType: string;
  }>;
}

interface HallFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: HallFormData) => void;
  hall?: Hall | null;
  isLoading: boolean;
}

const initialFormData: HallFormData = {
  name: "",
  hallType: "STANDARD",
  rows: 8,
  columns: 10,
  isActive: true,
  rowConfigs: [{ startRow: "A", endRow: "H", seatType: "REGULAR" }],
};

export default function HallForm({
  isOpen,
  onClose,
  onSubmit,
  hall,
  isLoading,
}: HallFormProps) {
  const [formData, setFormData] = useState<HallFormData>(() => {
    if (hall) {
      const hallRowConfigs = hall.rowConfigs && hall.rowConfigs.length > 0
        ? hall.rowConfigs.map(rc => ({
            startRow: rc.startRow,
            endRow: rc.endRow,
            seatType: rc.seatType as "REGULAR" | "VIP" | "TWINSEAT"
          }))
        : [{ startRow: "A", endRow: getRowLabel((hall.rows || 8) - 1), seatType: "REGULAR" as const }];
      
      return {
        name: hall.name,
        hallType: hall.hallType,
        rows: hall.rows || 8,
        columns: hall.columns || 10,
        isActive: hall.isActive,
        rowConfigs: hallRowConfigs,
      };
    }
    return initialFormData;
  });
  const [error, setError] = useState("");

  // Sync form data when hall prop changes (for edit mode)
  useEffect(() => {
    if (hall) {
      const hallRowConfigs = hall.rowConfigs && hall.rowConfigs.length > 0
        ? hall.rowConfigs.map(rc => ({
            startRow: rc.startRow,
            endRow: rc.endRow,
            seatType: rc.seatType as "REGULAR" | "VIP" | "TWINSEAT"
          }))
        : [{ startRow: "A", endRow: getRowLabel((hall.rows || 8) - 1), seatType: "REGULAR" as const }];
      
      setFormData({
        name: hall.name,
        hallType: hall.hallType,
        rows: hall.rows || 8,
        columns: hall.columns || 10,
        isActive: hall.isActive,
        rowConfigs: hallRowConfigs,
      });
    } else {
      setFormData(initialFormData);
    }
  }, [hall]);

  const isEditMode = !!hall;
  const rowOptions = useMemo(() => getRowOptions(formData.rows), [formData.rows]);

  const handleClose = () => {
    setFormData(initialFormData);
    setError("");
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" 
        ? (e.target as HTMLInputElement).checked 
        : (name === "rows" || name === "columns") ? parseInt(value) || 0 : value,
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
    const lastEndIdx = lastConfig ? rowOptions.findIndex((o) => o.value === lastConfig.endRow) : 0;
    setFormData((prev) => ({
      ...prev,
      rowConfigs: [...prev.rowConfigs, { startRow: getRowLabel(lastEndIdx + 1), endRow: getRowLabel(lastEndIdx + 1), seatType: "REGULAR" }],
    }));
  };

  const getSeatsForGrid = (): Seat[] => {
    const rows = hall?.rows || formData.rows;
    const columns = hall?.columns || formData.columns;
    const seats: Seat[] = [];

    for (let rowIdx = 0; rowIdx < rows; rowIdx++) {
      const row = String.fromCharCode(65 + rowIdx);
      for (let col = 0; col < columns; col++) {
        let seatType: SeatType = "REGULAR";
        for (const config of formData.rowConfigs) {
          const startIdx = rowOptions.findIndex((o) => o.value === config.startRow);
          const endIdx = rowOptions.findIndex((o) => o.value === config.endRow);
          if (rowIdx >= startIdx && rowIdx <= endIdx) {
            seatType = config.seatType as SeatType;
            break;
          }
        }
        seats.push({
          id: hall ? `${hall.id}-${row}-${col}` : `preview-${row}-${col}`,
          hallId: hall?.id || "",
          row,
          column: col,
          number: col + 1,
          seatNumber: col + 1,
          seatType,
          status: "AVAILABLE",
        });
      }
    }
    return seats;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!formData.name.trim()) return setError("Hall name is required");
    const validationError = validateRowConfigs(formData.rowConfigs, formData.rows);
    if (validationError) return setError(validationError);
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 text-black bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={handleClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-8 py-5 border-b flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{isEditMode ? "Edit Hall" : "Create New Hall"}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Configure hall layout and seat types</p>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto scrollbar-hide">
          {error && <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-lg">{error}</div>}

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Hall Name</label>
                <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-xl outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Hall Type</label>
                  <select name="hallType" value={formData.hallType} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-xl bg-white outline-none">
                    {hallTypeOptions.map((type) => (<option key={type.value} value={type.value}>{type.label}</option>))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Status</label>
                  <div className="flex items-center h-10.5 px-4 border rounded-xl bg-slate-50">
                    <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange} className="w-5 h-5 text-indigo-600 rounded" />
                    <label htmlFor="isActive" className="text-sm text-slate-700 ml-3">Active</label>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-indigo-50 rounded-xl p-4 flex flex-col items-center justify-center text-center border border-indigo-100">
              <div className="text-4xl font-black text-indigo-600">{formData.rows * formData.columns}</div>
              <div className="text-sm font-bold text-indigo-400 mt-1 uppercase tracking-wider">Total Seats</div>
            </div>
          </div>

          <hr />

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Total Rows</label>
              <input type="number" name="rows" min={1} max={26} value={formData.rows} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Seats Per Row</label>
              <input type="number" name="columns" min={1} max={30} value={formData.columns} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl" />
            </div>
          </div>

          <div className="space-y-4">
             <h4 className="text-sm font-bold text-slate-700 border-b pb-2 uppercase tracking-wide">Seat Type Segments</h4>
             <div className="space-y-3">
               {formData.rowConfigs.map((config, index) => (
                 <div key={index} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                   <select value={config.startRow} onChange={(e) => handleRowConfigChange(index, "startRow", e.target.value)} className="px-2 py-1 border rounded-md text-sm">{rowOptions.slice(0, formData.rows).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
                   <span className="text-xs font-bold text-slate-500">to</span>
                   <select value={config.endRow} onChange={(e) => handleRowConfigChange(index, "endRow", e.target.value)} className="px-2 py-1 border rounded-md text-sm">{rowOptions.slice(0, formData.rows).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
                   <select value={config.seatType} onChange={(e) => handleRowConfigChange(index, "seatType", e.target.value)} className="ml-auto px-2 py-1 border rounded-md text-sm">{seatTypeOptions.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select>
                 </div>
               ))}
               <button type="button" onClick={addRowConfig} className="text-xs font-bold text-indigo-600 hover:underline">+ Add Segment</button>
             </div>
          </div>

          <div className="overflow-x-auto pb-4 scrollbar-hide -mx-2">
            <SeatGrid
              seats={getSeatsForGrid()}
              columns={hall?.columns || formData.columns}
              selectedSeats={new Set()}
              viewMode="admin"
              hallName={hall?.name || formData.name || "Preview"}
              isDragging={false}
              onSeatClick={() => {}}
              onMouseDown={() => {}}
              onMouseEnter={() => {}}
              onMouseUp={() => {}}
              onContextMenu={() => {}}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <button type="button" onClick={handleClose} className="px-6 py-2 text-sm font-bold text-slate-500">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-8 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-lg transition-all active:scale-95">
              {isLoading ? "Saving..." : isEditMode ? "Update Hall" : "Create Hall"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}