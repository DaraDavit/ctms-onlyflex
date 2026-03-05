'use client';

import React, { memo } from 'react';
import { Seat } from '@/types/seat';

interface SeatCellProps {
  seat: Seat;
  isSelected: boolean;
  viewMode: 'admin' | 'preview';
  onClick: (e: React.MouseEvent) => void;
  onMouseDown: () => void;
  onMouseEnter: () => void;
  onMouseUp: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
}

const getSeatColor = (seatType: string, status: string): string => {
  if (status === 'INACTIVE') return 'bg-slate-700 border-slate-600';
  if (status === 'BOOKED') return 'bg-red-500 border-red-600';
  if (status === 'BLOCKED') return 'bg-orange-500 border-orange-600';
  
  switch (seatType) {
    case 'VIP':
      return 'bg-amber-500 border-amber-600';
    case 'TWINSEAT':
      return 'bg-red-500 border-red-600';
    default:
      return 'bg-blue-500 border-blue-600';
  }
};

export const SeatCell = memo(function SeatCell({
  seat,
  isSelected,
  viewMode,
  onClick,
  onMouseDown,
  onMouseEnter,
  onMouseUp,
  onContextMenu,
  onMouseMove
}: SeatCellProps) {
  if (seat.status === 'INACTIVE') return null;

  const isTwinseat = seat.seatType === 'TWINSEAT';
  const isDisabled = seat.status === 'BOOKED' || seat.status === 'BLOCKED';
  const colorClass = getSeatColor(seat.seatType, seat.status);
  const seatNumber = seat.seatNumber || seat.column + 1;
  const displayNumber = viewMode === 'admin' 
    ? `${seat.row}-${seat.column}` 
    : String(seatNumber).padStart(2, '0');

  return (
    <div
      className={`
        ${isTwinseat ? 'col-span-2' : ''}
        w-8 h-8 flex items-center justify-center
        ${colorClass}
        border rounded
        ${isSelected ? 'ring-2 ring-white ring-offset-1 ring-offset-slate-900' : ''}
        ${!isDisabled ? 'cursor-pointer hover:brightness-110 transition-all' : 'cursor-not-allowed opacity-60'}
        text-white text-xs font-medium
      `}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onMouseUp={onMouseUp}
      onContextMenu={onContextMenu}
      onMouseMove={onMouseMove}
    >
      {displayNumber}
    </div>
  );
});
