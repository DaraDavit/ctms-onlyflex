'use client';

import React, { memo } from 'react';

interface SeatSVGProps {
  color?: string;
  isSelected?: boolean;
  isBooked?: boolean;
  isBlocked?: boolean;
  size?: number;
}

export const SeatSVG = memo(function SeatSVG({
  color = '#3B82F6',
  isSelected = false,
  isBooked = false,
  isBlocked = false,
  size = 40,
}: SeatSVGProps) {
  const getFillColor = () => {
    if (isBooked || isBlocked) {
      return '#6B7280'; // Gray for booked/blocked
    }
    return color;
  };

  const getStrokeColor = () => {
    if (isSelected) {
      return '#FFFFFF'; // White ring when selected
    }
    if (isBooked || isBlocked) {
      return '#4B5563';
    }
    return color;
  };

  const fillColor = getFillColor();
  const strokeColor = getStrokeColor();
  const strokeWidth = isSelected ? 2 : 1.5;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={isSelected ? 'drop-shadow-lg' : ''}
    >
      {/* Left armrest/back */}
      <path
        d="M9 29H5C4.44772 29 4 28.5523 4 27V17C4 15.3432 5.34315 14 7 14H9C9 14 9 29 9 29Z"
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Right armrest/back */}
      <path
        d="M23 29H27C27.5523 29 28 28.5523 28 27V17C28 15.3432 26.6569 14 25 14H23C23 14 23 29 23 29Z"
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Seat cushion */}
      <rect
        x="7"
        y="18"
        width="18"
        height="8"
        rx="2"
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
      
      {/* Backrest */}
      <path
        d="M6 14V8C6 5.79086 7.79086 4 10 4H22C24.2091 4 26 5.79086 26 8V14"
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
});
