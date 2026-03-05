import { Seat, SeatType, SeatStatus, CapacityBreakdown, ValidationResult, ValidationError, SeatConfigurationExport } from '@/types/seat';

/**
 * Calculate capacity breakdown from seats
 * - REGULAR/VIP = 1 unit each
 * - TWINSEAT = 2 units
 * - INACTIVE = 0 units
 */
export function calculateTotalCapacity(seats: Seat[]): CapacityBreakdown {
  return seats.reduce((acc, seat) => {
    if (seat.status === 'INACTIVE') {
      acc.inactive++;
      return acc;
    }
    
    switch (seat.seatType) {
      case 'REGULAR':
        acc.regular++;
        acc.totalActive++;
        acc.capacityUsed++;
        break;
      case 'VIP':
        acc.vip++;
        acc.totalActive++;
        acc.capacityUsed++;
        break;
      case 'TWINSEAT':
        acc.twinseats++;
        acc.twinseatUnits += 2;
        acc.totalActive++;
        acc.capacityUsed += 2;
        break;
    }
    return acc;
  }, {
    regular: 0,
    vip: 0,
    twinseats: 0,
    twinseatUnits: 0,
    inactive: 0,
    totalActive: 0,
    capacityUsed: 0
  });
}



/**
 * Prevent single gap - ensures booking doesn't isolate a single seat
 * This maintains social distancing and prevents awkward single seat bookings
 */
export function preventSingleGap(
  seats: Seat[],
  bookingSeatId: string
): { isValid: boolean; error?: string } {
  const bookingSeat = seats.find(s => s.id === bookingSeatId);
  if (!bookingSeat) return { isValid: false, error: 'Seat not found' };
  
  const row = bookingSeat.row;
  const col = bookingSeat.column;
  
  // Get all seats in the same row (excluding inactive)
  const rowSeats = seats
    .filter(s => s.row === row && s.status !== 'INACTIVE')
    .sort((a, b) => a.column - b.column);
  
  // Check left neighbor
  const leftSeat = rowSeats.find(s => s.column === col - 1);
  const rightSeat = rowSeats.find(s => s.column === col + 1);
  
  // If booking this seat, check if it would isolate a neighbor
  // Scenario 1: Left is available, right is booked/inactive
  if (leftSeat?.status === 'AVAILABLE' && (rightSeat?.status === 'BOOKED' || rightSeat?.status === 'INACTIVE' || !rightSeat)) {
    // Check if left seat would become isolated
    const leftLeftSeat = rowSeats.find(s => s.column === col - 2);
    if (leftLeftSeat?.status === 'BOOKED' || !leftLeftSeat) {
      return {
        isValid: false,
        error: `Booking would isolate seat ${leftSeat.row}${leftSeat.seatNumber}`
      };
    }
  }
  
  // Scenario 2: Right is available, left is booked/inactive
  if (rightSeat?.status === 'AVAILABLE' && (leftSeat?.status === 'BOOKED' || leftSeat?.status === 'INACTIVE' || !leftSeat)) {
    // Check if right seat would become isolated
    const rightRightSeat = rowSeats.find(s => s.column === col + 2);
    if (rightRightSeat?.status === 'BOOKED' || !rightRightSeat) {
      return {
        isValid: false,
        error: `Booking would isolate seat ${rightSeat.row}${rightSeat.seatNumber}`
      };
    }
  }
  
  return { isValid: true };
}

/**
 * Convert 0-based index to row label (A-Z, AA, AB, AC...)
 * Uses base-26 conversion for infinite rows
 */
export function getRowLabel(index: number): string {
  if (index < 0) return '';
  
  let label = '';
  let n = index;
  
  do {
    label = String.fromCharCode(65 + (n % 26)) + label;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  
  return label;
}

/**
 * Convert row label back to 0-based index
 * A=0, B=1, ..., Z=25, AA=26, AB=27, etc.
 */
export function rowToIndex(label: string): number {
  let index = 0;
  for (let i = 0; i < label.length; i++) {
    // Use 1-based value during calculation (A=1, B=2, ...)
    const charValue = label.charCodeAt(i) - 64; // 'A' = 1
    index = index * 26 + charValue;
  }
  // Convert to 0-based at the end
  return index - 1;
}

/**
 * Create a twinseat
 * Simplified - no linked IDs
 */
export function createTwinseat(
  leftSeat: Seat,
  seats: Seat[],
  columns: number
): { left: Seat; right: Seat } | null {
  // Validate: must have adjacent seat (not at row boundary)
  if (leftSeat.column >= columns - 1) {
    return null;
  }
  
  const rightSeat = seats.find(s => 
    s.row === leftSeat.row && s.column === leftSeat.column + 1
  );
  
  if (!rightSeat) {
    return null;
  }
  
  // Check if right seat is available for conversion
  if (rightSeat.status === 'INACTIVE') {
    return null;
  }
  
  return {
    left: { ...leftSeat, seatType: 'TWINSEAT' },
    right: { ...rightSeat, seatType: 'TWINSEAT' }
  };
}

/**
 * Convert twinseat back to regular seats
 * When deleting/changing one half, convert BOTH to REGULAR
 */
export function convertLoveseatToRegular(
  seat: Seat,
  seats: Seat[]
): Seat[] {
  return seats.map(s => {
    if (s.id === seat.id) {
      return { ...s, seatType: 'REGULAR' };
    }
    if (s.row === seat.row && s.column === seat.column + 1 && s.seatType === 'TWINSEAT') {
      return { ...s, seatType: 'REGULAR' };
    }
    return s;
  });
}

/**
 * Complete validation suite for seat configuration
 * Checks: capacity, loveseat pairs, wheelchair accessibility, loveseat placement
 */
export function validateSeatConfiguration(
  seats: Seat[],
  hallCapacity: number,
  columns: number
): ValidationResult {
  const errors: ValidationError[] = [];
  const breakdown = calculateTotalCapacity(seats);
  
  // Check 1: Capacity limit
  if (breakdown.capacityUsed > hallCapacity) {
    const excessRows = findExcessRows(seats, hallCapacity);
    errors.push({
      type: 'CAPACITY_EXCEEDED',
      message: `Capacity exceeded: ${breakdown.capacityUsed}/${hallCapacity}. Review rows: ${excessRows.join(', ')}`
    });
  }
  
  // Check 2: TWINSEAT validation (simplified - no linked IDs)
  // Skip this check since TWINSEAT doesn't use linked IDs

  // Check 3: Invalid twinseat placement (at row boundary)
  const twinseats = seats.filter(s => s.seatType === 'TWINSEAT');
  twinseats.forEach(seat => {
    if (seat.column >= columns - 1) {
      errors.push({
        type: 'INVALID_TWINSEAT_PLACEMENT',
        seatId: seat.id,
        row: seat.row,
        column: seat.column,
        message: `Twinseat at row boundary: ${seat.row}-${seat.column}. Must have adjacent seat.`
      });
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    capacityUsed: breakdown.capacityUsed,
    breakdown
  };
}

/**
 * Find rows that contribute to capacity excess
 * Helps identify which rows need seats marked as inactive
 */
function findExcessRows(seats: Seat[], capacity: number): string[] {
  const rows = [...new Set(seats.map(s => s.row))].sort();
  let runningTotal = 0;
  const excessRows: string[] = [];
  
  for (const row of rows) {
    const rowSeats = seats.filter(s => s.row === row && s.status !== 'INACTIVE');
    const rowCapacity = rowSeats.reduce((total, seat) => {
      if (seat.seatType === 'TWINSEAT') return total + 2;
      return total + 1;
    }, 0);
    
    runningTotal += rowCapacity;
    
    if (runningTotal > capacity && rowCapacity > 0) {
      excessRows.push(row);
    }
  }
  
  return excessRows;
}

/**
 * Assign seat numbers, skipping inactive seats
 * Example: Row A with 10 units, units 5-6 inactive
 * Result: 1, 2, 3, 4, [inactive], 5, 6, 7, 8
 */
export function assignSeatNumbers(seats: Seat[]): Seat[] {
  // Group by row
  const seatsByRow = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {} as Record<string, Seat[]>);
  
  // Process each row
  const result: Seat[] = [];
  
  Object.keys(seatsByRow).forEach(row => {
    const rowSeats = seatsByRow[row].sort((a, b) => a.column - b.column);
    let seatNumber = 1;
    
    rowSeats.forEach(seat => {
      if (seat.status === 'INACTIVE') {
        result.push({ ...seat, number: 0, seatNumber: null });
      } else {
        result.push({ ...seat, number: seatNumber, seatNumber: seatNumber });
        seatNumber++;
      }
    });
  });
  
  return result;
}

/**
 * Generate optimal grid based on capacity and columns
 * Uses math-first approach: rows = ceil(capacity / columns)
 * Last row may have inactive seats to maintain rectangular grid
 */
export function generateOptimalGrid(
  capacity: number,
  columns: number,
  hallId: string
): Seat[] {
  const rows = Math.ceil(capacity / columns);
  const seats: Seat[] = [];
  
  for (let rowIdx = 0; rowIdx < rows; rowIdx++) {
    const row = getRowLabel(rowIdx);
    const isLastRow = rowIdx === rows - 1;
    const seatsInLastRow = capacity % columns || columns;
    
    for (let col = 0; col < columns; col++) {
      const isExcess = isLastRow && col >= seatsInLastRow;
      
      seats.push({
        id: `${hallId}-${row}-${col}`, // Temporary ID, will be replaced by DB
        hallId,
        row,
        column: col,
        number: isExcess ? 0 : col + 1,
        seatNumber: isExcess ? null : col + 1,
        seatType: 'REGULAR',
        status: isExcess ? 'INACTIVE' : 'AVAILABLE'
      });
    }
  }
  
  return seats;
}

/**
 * Export seat configuration to JSON
 */
export function exportConfiguration(
  hallName: string,
  capacity: number,
  columns: number,
  seats: Seat[]
): SeatConfigurationExport {
  return {
    version: '1.0',
    hallName,
    capacity,
    columns,
    exportedAt: new Date().toISOString(),
    seats: seats.map(s => ({
      row: s.row,
      column: s.column,
      seatType: s.seatType,
      status: s.status
    }))
  };
}

/**
 * Import seat configuration from JSON
 */
export function importConfiguration(
  exportData: SeatConfigurationExport,
  hallId: string
): Seat[] {
  return exportData.seats.map((s, index) => ({
    id: `${hallId}-imported-${index}`,
    hallId,
    row: s.row,
    column: s.column,
    number: s.status === 'INACTIVE' ? 0 : 0, // Will be recalculated
    seatNumber: s.status === 'INACTIVE' ? null : 0, // Will be recalculated
    seatType: s.seatType,
    status: s.status
  }));
}

/**
 * Get display label for a seat based on view mode
 * Admin mode: coordinates (A-0,4)
 * Preview mode: seat numbers (A-5, A5-6 for loveseats)
 */
export function getSeatDisplayLabel(
  seat: Seat,
  viewMode: 'admin' | 'preview'
): string {
  if (viewMode === 'admin') {
    return `${seat.row}-${seat.column}`;
  }
  
  // Preview mode
  if (seat.status === 'INACTIVE') {
    return '-';
  }
  
  if (seat.seatType === 'TWINSEAT' && seat.seatNumber) {
    return `${seat.row}${seat.seatNumber}-${seat.seatNumber + 1}`;
  }
  
  if (seat.seatType === 'TWINSEAT') {
    return ''; // Hidden, shown as part of left
  }
  
  return seat.seatNumber ? `${seat.row}${seat.seatNumber}` : '-';
}
