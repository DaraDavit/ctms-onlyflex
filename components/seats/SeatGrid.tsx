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
      <div 
        className="relative bg-slate-900/30 rounded-2xl p-6 md:p-8 backdrop-blur-sm"
        style={{
          background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.6) 0%, rgba(15, 23, 42, 0.3) 100%)',
          boxShadow: 'inset 0 2px 20px rgba(0, 0, 0, 0.5), 0 4px 20px rgba(0, 0, 0, 0.3)'
        }}
      >
        {/* Grid */}
        <div className="space-y-3">
          {sortedRows.map((row, rowIndex) => {
            const rowSeats = seatsByRow[row].sort((a, b) => a.column - b.column);
            
            return (
              <div 
                key={row} 
                className="flex items-center gap-3 group"
                onMouseLeave={handleMouseLeave}
              >
                {/* Left Row Label */}
                <div className="w-10 shrink-0 flex items-center justify-center">
                  <span className="text-slate-400 font-bold text-sm md:text-base group-hover:text-white transition-colors">
                    {row}
                  </span>
                </div>

                {/* Seats Container */}
                <div 
                  className="flex-1 grid gap-2"
                  style={{ 
                    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                    gap: '8px'
                  }}
                >
                  {rowSeats.map(seat => (
                    <SeatCell
                      key={seat.id}
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
                  ))}
                </div>

                {/* Right Row Label */}
                <div className="w-10 shrink-0 flex items-center justify-center">
                  <span className="text-slate-400 font-bold text-sm md:text-base group-hover:text-white transition-colors">
                    {row}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Row number indicator (shows on hover) */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {sortedRows.map((row, i) => (
            <div 
              key={`indicator-${row}`} 
              className="w-1 h-8 bg-slate-700/50 rounded-full"
              style={{ opacity: 0.3 + (i / sortedRows.length) * 0.7 }}
            />
          ))}
        </div>
      </div>

      {/* Entrance indicator */}
      <div className="mt-8 flex justify-center">
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <div className="w-16 h-1 bg-slate-700 rounded-full" />
          <span>Entrance / Exit</span>
          <div className="w-16 h-1 bg-slate-700 rounded-full" />
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
          <div className="w-4 h-4 rounded bg-linear-to-b from-emerald-500 to-emerald-600 border border-emerald-400" />
          <span className="text-slate-400">Regular</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-linear-to-b from-violet-500 to-violet-600 border border-violet-400" />
          <span className="text-slate-400">VIP</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-4 rounded bg-linear-to-b from-pink-500 to-pink-600 border border-pink-400" />
          <span className="text-slate-400">Loveseat</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-slate-800/50 border-2 border-slate-700/50" />
          <span className="text-slate-400">Aisle</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500/80 border-2 border-red-600 flex items-center justify-center">
            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <span className="text-slate-400">Booked</span>
        </div>
      </div>
    </div>
  );
}
