export type SeatType = 'REGULAR' | 'VIP' | 'TWINSEAT';

export type SeatStatus = 'AVAILABLE' | 'SELECTED' | 'BOOKED' | 'RESERVED' | 'INACTIVE' | 'BLOCKED';

export interface Seat {
  id: string;
  hallId: string;
  row: string;
  column: number;
  number: number;
  seatNumber: number | null;
  seatType: SeatType;
  status: SeatStatus;
}

export interface CapacityBreakdown {
  regular: number;
  vip: number;
  twinseats: number;
  twinseatUnits: number;
  inactive: number;
  totalActive: number;
  capacityUsed: number;
}

export interface ValidationError {
  type: 'CAPACITY_EXCEEDED' | 'ORPHANED_TWINSEAT' | 'BOUNDARY_VIOLATION' | 'INVALID_TWINSEAT_PLACEMENT';
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
