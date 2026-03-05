'use client';

import React, { memo, useState, useCallback } from 'react';
import { Seat } from '@/types/seat';
import { SeatCell } from './SeatCell';
import { ScreenIndicator } from './ScreenIndicator';
import { SeatTooltip } from './SeatTooltip';

interface SeatGridProps {
  seats: Seat[];
  columns: number;
  selectedSeats: Set<string>;
  viewMode: 'admin' | 'preview';
  hallName?: string;
  isDragging: boolean;
  onSeatClick: (seat: Seat, event: React.MouseEvent) => void;
  onMouseDown: (seat: Seat) => void;
  onMouseEnter: (seat: Seat) => void;
  onMouseUp: () => void;
  onContextMenu: (seat: Seat, event: React.MouseEvent) => void;
}

// Calculate aisle positions based on total columns
const getAisleColumns = (totalColumns: number): number[] => {
  if (totalColumns <= 5) return [];
  if (totalColumns <= 8) return [2];
  if (totalColumns <= 12) return [2, 8];
  // For larger halls, add aisles every 6-8 seats
  const aisles: number[] = [2];
  for (let i = 8; i < totalColumns - 2; i += 6) {
    aisles.push(i);
  }
  return aisles;
};

export function SeatGrid({
  seats,
  columns,
  selectedSeats,
  viewMode,
  hallName,
  isDragging,
  onSeatClick,
  onMouseDown,
  onMouseEnter,
  onMouseUp,
  onContextMenu
}: SeatGridProps) {
  const [tooltipState, setTooltipState] = useState<{
    seat: Seat | null;
    position: { x: number; y: number };
    visible: boolean;
  }>({
    seat: null,
    position: { x: 0, y: 0 },
    visible: false
  });

  // Group seats by row
  const seatsByRow = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {} as Record<string, Seat[]>);

  // Sort rows (A, B, C... AA, AB, etc.)
  const sortedRows = Object.keys(seatsByRow).sort((a, b) => {
    const idxA = a.split('').reduce((acc, char) => acc * 26 + (char.charCodeAt(0) - 65), 0);
    const idxB = b.split('').reduce((acc, char) => acc * 26 + (char.charCodeAt(0) - 65), 0);
    return idxA - idxB;
  });

  const aisleColumns = getAisleColumns(columns);

  const handleMouseMove = useCallback((e: React.MouseEvent, seat: Seat) => {
    setTooltipState({
      seat,
      position: { x: e.clientX, y: e.clientY },
      visible: true
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTooltipState(prev => ({ ...prev, visible: false }));
  }, []);

  return (
    <div className="relative">
      {/* Screen Indicator */}
      <ScreenIndicator hallName={hallName} />

      {/* Main Grid Container */}
      <div className='flex flex-col items-center '> 
        <div className="space-y-3">
          {sortedRows.map((row) => {
            const rowSeats = seatsByRow[row].sort((a, b) => a.column - b.column);
            
            return (
              <div 
                key={row} 
                className="flex items-center gap-2 group"
                onMouseLeave={handleMouseLeave}
              >
                {/* Left Row Label */}
                <div className="w-6 shrink-0 flex items-center justify-center">
                  <span className="text-slate-400 font-bold text-sm">
                    {row}
                  </span>
                </div>

                {/* Seats with Aisles */}
                <div className="flex items-center gap-1">
                  {rowSeats.map((seat, index) => (
                    <React.Fragment key={seat.id}>
                      <SeatCell
                        seat={seat}
                        isSelected={selectedSeats.has(seat.id)}
                        viewMode={viewMode}
                        onClick={(e) => onSeatClick(seat, e)}
                        onMouseDown={() => onMouseDown(seat)}
                        onMouseEnter={() => onMouseEnter(seat)}
                        onMouseUp={onMouseUp}
                        onContextMenu={(e) => onContextMenu(seat, e)}
                        onMouseMove={(e) => handleMouseMove(e, seat)}
                      />
                      {/* Aisle gap after certain columns */}
                      {aisleColumns.includes(index + 1) && index < rowSeats.length - 1 && (
                        <div className="w-4" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Exit Indicators */}
      <div className="mt-6 flex justify-between items-center px-4">
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <span>←</span>
          <span>EXIT</span>
        </div>
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <span>EXIT</span>
          <span>→</span>
        </div>
      </div>

      {/* Tooltip */}
      {tooltipState.seat && (
        <SeatTooltip
          seat={tooltipState.seat}
          viewMode={viewMode}
          position={tooltipState.position}
          visible={tooltipState.visible}
        />
      )}

      {/* Legend */}
      <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-blue-500 border border-blue-600" />
          <span className="text-slate-400">Regular</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-amber-500 border border-amber-600" />
          <span className="text-slate-400">VIP</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-5 rounded bg-red-500 border border-red-600" />
          <span className="text-slate-400">Twinseat</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-slate-700" />
          <span className="text-slate-400">Aisle</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-red-500/60 border border-red-600 flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <span className="text-slate-400">Booked</span>
        </div>
      </div>
    </div>
  );
}
