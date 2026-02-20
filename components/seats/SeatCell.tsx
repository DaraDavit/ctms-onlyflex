'use client';

import React, { memo } from 'react';
import { Seat, SeatStatus } from '@/types/seat';

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
  // Skip rendering RIGHT side (spanned by LEFT)
  if (seat.seatType === 'LOVESEAT_RIGHT') return null;

  const isLoveseat = seat.seatType === 'LOVESEAT_LEFT';
  const colSpan = isLoveseat ? 2 : 1;

  // Get base colors based on seat type and status
  const getSeatStyles = () => {
    const baseClasses = 'relative rounded-lg transition-all duration-200 ease-out select-none overflow-hidden';
    
    if (seat.status === 'INACTIVE') {
      return `${baseClasses} bg-slate-800/50 border-2 border-slate-700/50 cursor-default`;
    }

    if (seat.status === 'BOOKED') {
      return `${baseClasses} bg-red-500/80 border-2 border-red-600 cursor-not-allowed opacity-80`;
    }

    if (seat.status === 'BLOCKED') {
      return `${baseClasses} bg-orange-500/80 border-2 border-orange-600 cursor-not-allowed`;
    }

    // Active seats with 3D effect
    let bgClass = '';
    let borderClass = '';
    let shadowClass = '';

    switch (seat.seatType) {
      case 'VIP':
        bgClass = 'bg-gradient-to-b from-violet-500 to-violet-600';
        borderClass = 'border-violet-400';
        shadowClass = 'shadow-[0_4px_0_rgb(109,40,217),0_6px_12px_rgba(109,40,217,0.4)]';
        break;
      case 'LOVESEAT_LEFT':
        bgClass = 'bg-gradient-to-b from-pink-500 to-pink-600';
        borderClass = 'border-pink-400';
        shadowClass = 'shadow-[0_4px_0_rgb(190,24,93),0_6px_12px_rgba(190,24,93,0.4)]';
        break;
      default: // REGULAR
        bgClass = 'bg-gradient-to-b from-emerald-500 to-emerald-600';
        borderClass = 'border-emerald-400';
        shadowClass = 'shadow-[0_4px_0_rgb(4,120,87),0_6px_12px_rgba(4,120,87,0.4)]';
    }

    const hoverClass = !isSelected 
      ? 'hover:translate-y-[-2px] hover:shadow-[0_6px_0_rgb(0,0,0,0.2),0_8px_16px_rgba(0,0,0,0.3)]' 
      : '';
    
    const activeClass = 'active:translate-y-[2px] active:shadow-[0_2px_0_rgb(0,0,0,0.2)]';

    return `${baseClasses} ${bgClass} ${borderClass} ${shadowClass} ${hoverClass} ${activeClass} border-2 cursor-pointer`;
  };

  // Get content based on view mode
  const getSeatContent = () => {
    if (seat.status === 'INACTIVE') {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-slate-600" />
        </div>
      );
    }

    if (seat.status === 'BOOKED') {
      return (
        <div className="w-full h-full flex items-center justify-center text-white">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
      );
    }

    const icon = {
      'VIP': '👑',
      'LOVESEAT_LEFT': '💕',
      'LOVESEAT_RIGHT': '',
      'REGULAR': ''
    }[seat.seatType];

    const label = viewMode === 'admin' 
      ? `${seat.row}-${seat.column}`
      : seat.seatNumber 
        ? isLoveseat 
          ? `${seat.seatNumber}-${seat.seatNumber + 1}`
          : seat.seatNumber
        : '';

    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-white">
        {icon && <span className="text-sm leading-none mb-0.5">{icon}</span>}
        <span className={`font-bold leading-none ${isLoveseat ? 'text-sm' : 'text-xs'}`}>
          {label}
        </span>
      </div>
    );
  };

  return (
    <div
      className={`
        ${colSpan === 2 ? 'col-span-2' : ''}
        h-11 md:h-12
        ${getSeatStyles()}
        ${isSelected ? 'ring-4 ring-blue-400 ring-offset-2 ring-offset-slate-900 scale-105 z-10' : ''}
      `}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onMouseUp={onMouseUp}
      onContextMenu={onContextMenu}
      onMouseMove={onMouseMove}
    >
      {/* Inner highlight for 3D effect */}
      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-md pointer-events-none" />
      
      {/* Content */}
      <div className="relative w-full h-full">
        {getSeatContent()}
      </div>
      
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </div>
  );
});
