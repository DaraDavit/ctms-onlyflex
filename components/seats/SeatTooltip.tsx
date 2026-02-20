'use client';

import React from 'react';
import { Seat } from '@/types/seat';

interface SeatTooltipProps {
  seat: Seat;
  viewMode: 'admin' | 'preview';
  position: { x: number; y: number };
  visible: boolean;
}

export function SeatTooltip({ seat, viewMode, position, visible }: SeatTooltipProps) {
  if (!visible) return null;

  const getSeatTypeLabel = () => {
    switch (seat.seatType) {
      case 'REGULAR': return 'Regular Seat';
      case 'VIP': return 'VIP Seat';
      case 'LOVESEAT_LEFT': return 'Loveseat (Left)';
      case 'LOVESEAT_RIGHT': return 'Loveseat (Right)';
      default: return 'Seat';
    }
  };

  const getStatusLabel = () => {
    switch (seat.status) {
      case 'AVAILABLE': return 'Available';
      case 'SELECTED': return 'Selected';
      case 'BOOKED': return 'Booked';
      case 'RESERVED': return 'Reserved';
      case 'INACTIVE': return 'Inactive (Aisle)';
      case 'BLOCKED': return 'Blocked';
      default: return 'Unknown';
    }
  };

  const getStatusColor = () => {
    switch (seat.status) {
      case 'AVAILABLE': return 'text-green-600';
      case 'SELECTED': return 'text-blue-600';
      case 'BOOKED': return 'text-red-600';
      case 'RESERVED': return 'text-yellow-600';
      case 'INACTIVE': return 'text-gray-500';
      case 'BLOCKED': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div
      className="fixed z-50 pointer-events-none animate-fade-in"
      style={{
        left: position.x + 10,
        top: position.y - 60,
      }}
    >
      <div className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 backdrop-blur-sm bg-opacity-95 min-w-[180px]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg font-bold">
            {viewMode === 'admin' 
              ? `${seat.row}-${seat.column}`
              : seat.seatNumber 
                ? `${seat.row}${seat.seatNumber}${seat.seatType === 'LOVESEAT_LEFT' ? `-${seat.seatNumber + 1}` : ''}`
                : 'Inactive'
            }
          </span>
          {seat.seatType === 'VIP' && <span className="text-yellow-400">👑</span>}
          {seat.seatType === 'LOVESEAT_LEFT' && <span className="text-pink-400">💕</span>}
        </div>
        <div className="text-sm text-slate-300">{getSeatTypeLabel()}</div>
        <div className={`text-sm font-semibold ${getStatusColor()} mt-1`}>
          {getStatusLabel()}
        </div>
        {seat.seatType === 'LOVESEAT_LEFT' && (
          <div className="text-xs text-pink-400 mt-1">
            Occupies 2 seats
          </div>
        )}
      </div>
      {/* Arrow */}
      <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-slate-900" />
    </div>
  );
}
