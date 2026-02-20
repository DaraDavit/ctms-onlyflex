export type SeatType = 'REGULAR' | 'VIP' | 'LOVESEAT_LEFT' | 'LOVESEAT_RIGHT';

export type SeatStatus = 'AVAILABLE' | 'SELECTED' | 'BOOKED' | 'RESERVED' | 'INACTIVE' | 'BLOCKED';

export interface Seat {
  id: string;
  hallId: string;
  row: string;
  column: number;
  seatNumber: number | null;
  seatType: SeatType;
  status: SeatStatus;
  linkedSeatId: string | null;
}

export interface CapacityBreakdown {
  regular: number;
  vip: number;
  loveseats: number;
  loveseatUnits: number;
  inactive: number;
  totalActive: number;
  capacityUsed: number;
}

export interface ValidationError {
  type: 'CAPACITY_EXCEEDED' | 'ORPHANED_LOVESEAT' | 'BOUNDARY_VIOLATION' | 'INVALID_LOVESEAT_PLACEMENT';
  seatId?: string;
  row?: string;
  column?: number;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  capacityUsed: number;
  breakdown: CapacityBreakdown;
}

export interface SeatConfigurationExport {
  version: '1.0';
  hallName: string;
  capacity: number;
  columns: number;
  exportedAt: string;
  seats: {
    row: string;
    column: number;
    seatType: SeatType;
    status: SeatStatus;
  }[];
}
