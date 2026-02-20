'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { SeatGrid } from '@/components/seats/SeatGrid';
import { CapacityStatusBar } from '@/components/seats/CapacityStatusBar';
import { useSeatGrid } from '@/hooks/useSeatGrid';
import { Seat } from '@/types/seat';
import SeatGeneratorModal from './_components/SeatGeneratorModal';
import SeatEditModal from './_components/SeatEditModal';

interface Hall {
  id: string;
  name: string;
  capacity: number;
  columns: number;
  isPublished: boolean;
  version: number;
}

export default function HallSeatsPage() {
  const params = useParams();
  const hallId = params.id as string;

  const [hall, setHall] = useState<Hall | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Modal states
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [generatorMode, setGeneratorMode] = useState<"add" | "regenerate">("regenerate");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);

  // Initialize seat grid hook
  const {
    seats,
    selectedSeats,
    viewMode,
    isDragging,
    capacityBreakdown,
    isOverCapacity,
    validation,
    canUndo,
    canRedo,
    setSeats,
    setViewMode,
    undo,
    redo,
    toggleSeatSelection,
    selectRange,
    clearSelection,
    updateSeat,
    bulkUpdateSeats,
    startDrag,
    dragOver,
    endDrag,
    createLoveseat,
    deleteLoveseat
  } = useSeatGrid(hallId, hall?.capacity || 0, hall?.columns || 10, []);

  // Fetch hall and seats data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/halls/${hallId}/seats`);
      const data = await response.json();

      if (response.ok) {
        setHall(data.hall);
        const typedSeats: Seat[] = data.seats.map((s: any) => ({
          id: s.id,
          hallId: s.hallId,
          row: s.row,
          column: s.column,
          seatNumber: s.seatNumber,
          seatType: s.seatType,
          status: s.status,
          linkedSeatId: s.linkedSeatId
        }));
        setSeats(typedSeats);
      } else {
        setError(data.error || 'Failed to fetch seats');
      }
    } catch {
      setError('Failed to fetch seats');
    } finally {
      setIsLoading(false);
    }
  }, [hallId, setSeats]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-clear success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Handle save
  const handleSave = async () => {
    if (!hall || isOverCapacity || validation.errors.length > 0) return;

    setIsSaving(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/halls/${hallId}/seats`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seats,
          version: hall.version
        })
      });

      const data = await response.json();

      if (response.ok) {
        setHall(data.hall);
        setSuccessMessage('Changes saved successfully');
      } else {
        if (response.status === 409) {
          setError('Conflict: Another user has modified this hall. Please refresh.');
        } else {
          setError(data.error || 'Failed to save changes');
        }
      }
    } catch {
      setError('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle generate grid
  interface SeatGenerationConfig {
    rows: number;
    seatsPerRow: number;
    startingRow: string;
    defaultSeatType: string;
  }

  const handleGenerate = async (config: SeatGenerationConfig, mode: "add" | "regenerate") => {
    if (!hall) return;

    setIsSaving(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/halls/${hallId}/seats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          columns: config.seatsPerRow, 
          rows: config.rows,
          startingRow: config.startingRow,
          defaultSeatType: config.defaultSeatType,
          mode,
          replace: mode === 'regenerate'
        })
      });

      const data = await response.json();

      if (response.ok) {
        setHall(data.hall);
        const typedSeats: Seat[] = data.seats.map((s: any) => ({
          id: s.id,
          hallId: s.hallId,
          row: s.row,
          column: s.column,
          seatNumber: s.seatNumber,
          seatType: s.seatType,
          status: s.status,
          linkedSeatId: s.linkedSeatId
        }));
        setSeats(typedSeats);
        setIsGeneratorOpen(false);
        setSuccessMessage(data.message || `Generated ${data.generated} seats`);
      } else {
        setError(data.error || 'Failed to generate seats');
      }
    } catch {
      setError('Failed to generate seats');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle seat click
  const handleSeatClick = useCallback((seat: Seat, event: React.MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
      toggleSeatSelection(seat.id);
    } else if (event.shiftKey && selectedSeats.size > 0) {
      // Shift+click: select range from last selected
      const lastSelected = Array.from(selectedSeats).pop();
      if (lastSelected) {
        const lastSeat = seats.find(s => s.id === lastSelected);
        if (lastSeat) {
          selectRange(lastSeat, seat);
        }
      }
    } else {
      // Single click: select only this seat
      clearSelection();
      toggleSeatSelection(seat.id);
    }
  }, [toggleSeatSelection, selectRange, clearSelection, selectedSeats, seats]);

  // Handle double click (edit)
  const handleSeatDoubleClick = useCallback((seat: Seat) => {
    setSelectedSeat(seat);
    setIsEditModalOpen(true);
  }, []);

  // Handle context menu (right click)
  const handleContextMenu = useCallback((seat: Seat, event: React.MouseEvent) => {
    event.preventDefault();
    // Toggle between AVAILABLE and INACTIVE
    if (seat.status === 'INACTIVE') {
      updateSeat(seat.id, { status: 'AVAILABLE' });
    } else {
      updateSeat(seat.id, { status: 'INACTIVE' });
    }
  }, [updateSeat]);

  // Bulk actions
  const handleBulkTypeChange = (type: Seat['seatType']) => {
    const selectedIds = Array.from(selectedSeats);
    bulkUpdateSeats(selectedIds, { seatType: type });
    setSuccessMessage(`Changed ${selectedIds.length} seats to ${type}`);
  };

  const handleBulkToggleActive = () => {
    const selectedIds = Array.from(selectedSeats);
    const firstSeat = seats.find(s => s.id === selectedIds[0]);
    const newStatus = firstSeat?.status === 'INACTIVE' ? 'AVAILABLE' : 'INACTIVE';
    bulkUpdateSeats(selectedIds, { status: newStatus });
    setSuccessMessage(`Toggled status for ${selectedIds.length} seats`);
  };

  const handleBulkDelete = () => {
    if (!confirm(`Delete ${selectedSeats.size} selected seats?`)) return;
    const selectedIds = Array.from(selectedSeats);
    // Mark as INACTIVE instead of deleting
    bulkUpdateSeats(selectedIds, { status: 'INACTIVE' });
    setSuccessMessage(`Marked ${selectedIds.length} seats as inactive`);
  };

  // Handle loveseat conversion
  const handleLoveseatClick = () => {
    if (selectedSeats.size !== 2) {
      alert('Please select exactly 2 adjacent seats to convert to a loveseat');
      return;
    }
    
    const selectedArray = Array.from(selectedSeats);
    const seat1 = seats.find(s => s.id === selectedArray[0]);
    const seat2 = seats.find(s => s.id === selectedArray[1]);
    
    if (!seat1 || !seat2) return;
    
    if (seat1.row !== seat2.row) {
      alert('Seats must be in the same row');
      return;
    }
    
    // Determine left seat (lower column)
    const leftSeatId = seat1.column < seat2.column ? seat1.id : seat2.id;
    
    if (!createLoveseat(leftSeatId, hall?.columns || 10)) {
      alert('Cannot create loveseat: seats must be adjacent and not at row boundary');
    } else {
      setSuccessMessage('Created loveseat');
    }
  };

  // Edit modal handlers
  interface ModalSeat {
    id: string;
    row: string;
    number: number;
    seatType: Seat['seatType'];
    isActive: boolean;
  }

  const handleUpdateSeat = (seatId: string, updates: Partial<ModalSeat>) => {
    // Transform ModalSeat updates back to shared Seat type
    const transformedUpdates: Partial<Seat> = {};
    
    if (updates.seatType !== undefined) {
      transformedUpdates.seatType = updates.seatType;
    }
    
    if (updates.isActive !== undefined) {
      transformedUpdates.status = updates.isActive ? 'AVAILABLE' : 'INACTIVE';
    }
    
    updateSeat(seatId, transformedUpdates);
    setIsEditModalOpen(false);
    setSelectedSeat(null);
    setSuccessMessage('Seat updated');
  };

  const handleDeleteSeat = (seatId: string) => {
    deleteLoveseat(seatId);
    setIsEditModalOpen(false);
    setSelectedSeat(null);
    setSuccessMessage('Loveseat converted to regular seats');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!hall) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">Hall not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 overflow-x-hidden">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link
                href="/admin/halls"
                className="flex items-center text-sm text-slate-400 hover:text-white mr-4 transition-colors"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Halls
              </Link>
              <div className="border-l border-slate-700 pl-4">
                <h1 className="text-xl font-bold text-white">{hall.name}</h1>
                <p className="text-sm text-slate-400">Seat Configuration</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {(error || successMessage) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 space-y-2">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm">
              {successMessage}
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {seats.length === 0 ? (
          // Empty state
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800 p-8 text-center">
            <div className="text-6xl mb-4">🪑</div>
            <h3 className="text-lg font-semibold text-white mb-2">No Seats Configured</h3>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              This hall doesn&apos;t have any seats configured yet. Generate an optimal grid layout.
            </p>
            <button
              onClick={() => {
                setGeneratorMode("regenerate");
                setIsGeneratorOpen(true);
              }}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Generate Grid
            </button>
          </div>
        ) : (
          <>
            {/* Capacity Status Bar */}
            <div className="mb-6">
              <CapacityStatusBar
                breakdown={capacityBreakdown}
                capacity={hall.capacity}
                isOverCapacity={isOverCapacity}
                validationErrors={validation.errors}
                canUndo={canUndo}
                canRedo={canRedo}
                viewMode={viewMode}
                onUndo={undo}
                onRedo={redo}
                onViewModeChange={setViewMode}
                onSave={handleSave}
                isSaving={isSaving}
              />
            </div>

            {/* Actions Bar */}
            <div className="flex justify-end mb-6">
              <button
                onClick={() => {
                  setGeneratorMode("regenerate");
                  setIsGeneratorOpen(true);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={hall.isPublished}
              >
                🔄 Regenerate Grid
              </button>
            </div>

            {/* Seat Grid */}
            <SeatGrid
              seats={seats}
              columns={hall.columns}
              selectedSeats={selectedSeats}
              viewMode={viewMode}
              hallName={hall.name}
              isDragging={isDragging}
              onSeatClick={handleSeatClick}
              onMouseDown={startDrag}
              onMouseEnter={dragOver}
              onMouseUp={endDrag}
              onContextMenu={handleContextMenu}
            />

            {/* Instructions */}
            <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="text-sm font-semibold text-blue-300">How to Edit</h4>
                  <p className="text-sm text-blue-200/80 mt-1">
                    <strong>Click</strong> to select • <strong>Ctrl+Click</strong> for multi-select •
                    <strong> Shift+Click</strong> for range • <strong>Right-click</strong> to toggle Active/Inactive •
                    <strong> Drag</strong> to select area • Mark seats as <strong>Inactive</strong> to create aisles
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedSeats.size > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
          <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700 px-6 py-4 flex items-center gap-4">
            <div className="flex items-center gap-2 border-r border-slate-700 pr-4">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              <span className="font-bold text-white">{selectedSeats.size}</span>
              <span className="text-sm text-slate-400">selected</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkTypeChange('REGULAR')}
                className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-sm font-medium hover:bg-emerald-500/30 transition-colors"
              >
                Regular
              </button>
              <button
                onClick={() => handleBulkTypeChange('VIP')}
                className="px-3 py-1.5 bg-violet-500/20 text-violet-400 border border-violet-500/30 rounded-lg text-sm font-medium hover:bg-violet-500/30 transition-colors"
              >
                VIP
              </button>
              <button
                onClick={handleLoveseatClick}
                disabled={selectedSeats.size !== 2}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedSeats.size === 2
                    ? 'bg-pink-500 text-white hover:bg-pink-600 shadow-lg shadow-pink-500/25'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                ♥ Loveseat
              </button>
            </div>

            <div className="border-l border-slate-700 pl-4 flex items-center gap-2">
              <button
                onClick={handleBulkToggleActive}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="Toggle Active/Inactive"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </button>
              <button
                onClick={handleBulkDelete}
                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Mark as Inactive"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            <button
              onClick={clearSelection}
              className="px-3 py-1.5 text-sm text-slate-400 hover:text-white transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {isGeneratorOpen && (
        <SeatGeneratorModal
          isOpen={isGeneratorOpen}
          onClose={() => setIsGeneratorOpen(false)}
          onGenerate={handleGenerate}
          hallCapacity={hall.capacity}
          isLoading={isSaving}
          mode={generatorMode}
        />
      )}

      {isEditModalOpen && selectedSeat && (
        <SeatEditModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedSeat(null);
          }}
          seat={selectedSeat}
          onSave={handleUpdateSeat}
          onDelete={handleDeleteSeat}
          isLoading={isSaving}
        />
      )}
    </div>
  );
}
