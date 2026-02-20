/**
 * Unit tests for seat-logic.ts
 * 
 * To run these tests, install a test framework:
 * npm install --save-dev vitest
 * npm install --save-dev @types/node
 * 
 * Then run: npx vitest
 */

import { describe, it, expect } from 'vitest';
import {
  calculateTotalCapacity,
  preventSingleGap,
  getRowLabel,
  rowToIndex,
  createLoveseatPair,
  convertLoveseatToRegular,
  validateSeatConfiguration,
  assignSeatNumbers,
  generateOptimalGrid,
  getSeatDisplayLabel
} from './seat-logic';
import { Seat } from '@/types/seat';

describe('calculateTotalCapacity', () => {
  it('counts regular seats as 1 unit', () => {
    const seats: Seat[] = [
      { id: '1', hallId: 'hall1', row: 'A', column: 0, seatNumber: 1, seatType: 'REGULAR', status: 'AVAILABLE', linkedSeatId: null },
      { id: '2', hallId: 'hall1', row: 'A', column: 1, seatNumber: 2, seatType: 'REGULAR', status: 'AVAILABLE', linkedSeatId: null }
    ];
    
    const result = calculateTotalCapacity(seats);
    expect(result.capacityUsed).toBe(2);
    expect(result.regular).toBe(2);
    expect(result.totalActive).toBe(2);
  });

  it('counts VIP seats as 1 unit', () => {
    const seats: Seat[] = [
      { id: '1', hallId: 'hall1', row: 'A', column: 0, seatNumber: 1, seatType: 'VIP', status: 'AVAILABLE', linkedSeatId: null },
      { id: '2', hallId: 'hall1', row: 'A', column: 1, seatNumber: 2, seatType: 'VIP', status: 'AVAILABLE', linkedSeatId: null }
    ];
    
    const result = calculateTotalCapacity(seats);
    expect(result.capacityUsed).toBe(2);
    expect(result.vip).toBe(2);
  });

  it('counts loveseats as 2 units (LEFT only, RIGHT is hidden)', () => {
    const seats: Seat[] = [
      { id: '1', hallId: 'hall1', row: 'A', column: 0, seatNumber: 1, seatType: 'LOVESEAT_LEFT', status: 'AVAILABLE', linkedSeatId: '2' },
      { id: '2', hallId: 'hall1', row: 'A', column: 1, seatNumber: 2, seatType: 'LOVESEAT_RIGHT', status: 'AVAILABLE', linkedSeatId: '1' }
    ];
    
    const result = calculateTotalCapacity(seats);
    expect(result.capacityUsed).toBe(2);
    expect(result.loveseats).toBe(1);
    expect(result.loveseatUnits).toBe(2);
    expect(result.totalActive).toBe(1); // Only LEFT counts as active seat
  });

  it('excludes inactive seats from capacity', () => {
    const seats: Seat[] = [
      { id: '1', hallId: 'hall1', row: 'A', column: 0, seatNumber: 1, seatType: 'REGULAR', status: 'AVAILABLE', linkedSeatId: null },
      { id: '2', hallId: 'hall1', row: 'A', column: 1, seatNumber: null, seatType: 'REGULAR', status: 'INACTIVE', linkedSeatId: null },
      { id: '3', hallId: 'hall1', row: 'A', column: 2, seatNumber: 2, seatType: 'REGULAR', status: 'AVAILABLE', linkedSeatId: null }
    ];
    
    const result = calculateTotalCapacity(seats);
    expect(result.capacityUsed).toBe(2);
    expect(result.inactive).toBe(1);
    expect(result.totalActive).toBe(2);
  });

  it('handles mixed seat types correctly', () => {
    const seats: Seat[] = [
      { id: '1', hallId: 'hall1', row: 'A', column: 0, seatNumber: 1, seatType: 'REGULAR', status: 'AVAILABLE', linkedSeatId: null },
      { id: '2', hallId: 'hall1', row: 'A', column: 1, seatNumber: 2, seatType: 'VIP', status: 'AVAILABLE', linkedSeatId: null },
      { id: '3', hallId: 'hall1', row: 'A', column: 2, seatNumber: 3, seatType: 'LOVESEAT_LEFT', status: 'AVAILABLE', linkedSeatId: '4' },
      { id: '4', hallId: 'hall1', row: 'A', column: 3, seatNumber: 4, seatType: 'LOVESEAT_RIGHT', status: 'AVAILABLE', linkedSeatId: '3' },
      { id: '5', hallId: 'hall1', row: 'A', column: 4, seatNumber: null, seatType: 'REGULAR', status: 'INACTIVE', linkedSeatId: null }
    ];
    
    const result = calculateTotalCapacity(seats);
    expect(result.capacityUsed).toBe(4); // 1 + 1 + 2 + 0
    expect(result.regular).toBe(1);
    expect(result.vip).toBe(1);
    expect(result.loveseats).toBe(1);
    expect(result.inactive).toBe(1);
  });
});

describe('preventSingleGap', () => {
  it('allows booking when neighbors are available', () => {
    const seats: Seat[] = [
      { id: '1', hallId: 'hall1', row: 'A', column: 0, seatNumber: 1, seatType: 'REGULAR', status: 'AVAILABLE', linkedSeatId: null },
      { id: '2', hallId: 'hall1', row: 'A', column: 1, seatNumber: 2, seatType: 'REGULAR', status: 'AVAILABLE', linkedSeatId: null },
      { id: '3', hallId: 'hall1', row: 'A', column: 2, seatNumber: 3, seatType: 'REGULAR', status: 'AVAILABLE', linkedSeatId: null }
    ];
    
    const result = preventSingleGap(seats, '2');
    expect(result.isValid).toBe(true);
  });

  it('prevents booking that would isolate left neighbor', () => {
    const seats: Seat[] = [
      { id: '1', hallId: 'hall1', row: 'A', column: 0, seatNumber: 1, seatType: 'REGULAR', status: 'AVAILABLE', linkedSeatId: null },
      { id: '2', hallId: 'hall1', row: 'A', column: 1, seatNumber: 2, seatType: 'REGULAR', status: 'AVAILABLE', linkedSeatId: null },
      { id: '3', hallId: 'hall1', row: 'A', column: 2, seatNumber: 3, seatType: 'REGULAR', status: 'BOOKED', linkedSeatId: null }
    ];
    
    const result = preventSingleGap(seats, '2');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('isolate');
  });

  it('prevents booking that would isolate right neighbor', () => {
    const seats: Seat[] = [
      { id: '1', hallId: 'hall1', row: 'A', column: 0, seatNumber: 1, seatType: 'REGULAR', status: 'BOOKED', linkedSeatId: null },
      { id: '2', hallId: 'hall1', row: 'A', column: 1, seatNumber: 2, seatType: 'REGULAR', status: 'AVAILABLE', linkedSeatId: null },
      { id: '3', hallId: 'hall1', row: 'A', column: 2, seatNumber: 3, seatType: 'REGULAR', status: 'AVAILABLE', linkedSeatId: null }
    ];
    
    const result = preventSingleGap(seats, '2');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('isolate');
  });

  it('allows booking at row boundary (no neighbor to isolate)', () => {
    const seats: Seat[] = [
      { id: '1', hallId: 'hall1', row: 'A', column: 0, seatNumber: 1, seatType: 'REGULAR', status: 'BOOKED', linkedSeatId: null },
      { id: '2', hallId: 'hall1', row: 'A', column: 1, seatNumber: 2, seatType: 'REGULAR', status: 'AVAILABLE', linkedSeatId: null }
    ];
    
    const result = preventSingleGap(seats, '2');
    expect(result.isValid).toBe(true);
  });
});

describe('row labeling', () => {
  it('generates A-Z for rows 0-25', () => {
    expect(getRowLabel(0)).toBe('A');
    expect(getRowLabel(1)).toBe('B');
    expect(getRowLabel(25)).toBe('Z');
  });

  it('generates AA, AB, AC after Z', () => {
    expect(getRowLabel(26)).toBe('AA');
    expect(getRowLabel(27)).toBe('AB');
    expect(getRowLabel(51)).toBe('AZ');
    expect(getRowLabel(52)).toBe('BA');
    expect(getRowLabel(701)).toBe('ZZ');
    expect(getRowLabel(702)).toBe('AAA');
  });

  it('converts labels back to indices', () => {
    expect(rowToIndex('A')).toBe(0);
    expect(rowToIndex('B')).toBe(1);
    expect(rowToIndex('Z')).toBe(25);
    expect(rowToIndex('AA')).toBe(26);
    expect(rowToIndex('AB')).toBe(27);
    expect(rowToIndex('AZ')).toBe(51);
    expect(rowToIndex('BA')).toBe(52);
    expect(rowToIndex('ZZ')).toBe(701);
    expect(rowToIndex('AAA')).toBe(702);
  });

  it('round-trip conversion is consistent', () => {
    for (let i = 0; i < 1000; i++) {
      const label = getRowLabel(i);
      const backToIndex = rowToIndex(label);
      expect(backToIndex).toBe(i);
    }
  });
});

describe('createLoveseatPair', () => {
  it('creates loveseat pair when valid', () => {
    const leftSeat: Seat = { id: '1', hallId: 'hall1', row: 'A', column: 0, seatNumber: 1, seatType: 'REGULAR', status: 'AVAILABLE', linkedSeatId: null };
    const rightSeat: Seat = { id: '2', hallId: 'hall1', row: 'A', column: 1, seatNumber: 2, seatType: 'REGULAR', status: 'AVAILABLE', linkedSeatId: null };
    const seats: Seat[] = [leftSeat, rightSeat];
    
    const result = createLoveseatPair(leftSeat, seats, 10);
    expect(result).not.toBeNull();
    expect(result!.left.seatType).toBe('LOVESEAT_LEFT');
    expect(result!.left.linkedSeatId).toBe('2');
    expect(result!.right.seatType).toBe('LOVESEAT_RIGHT');
    expect(result!.right.linkedSeatId).toBe('1');
  });

  it('returns null at row boundary', () => {
    const leftSeat: Seat = { id: '1', hallId: 'hall1', row: 'A', column: 9, seatNumber: 10, seatType: 'REGULAR', status: 'AVAILABLE', linkedSeatId: null };
    const seats: Seat[] = [leftSeat];
    
    const result = createLoveseatPair(leftSeat, seats, 10);
    expect(result).toBeNull();
  });

  it('returns null if right seat is inactive', () => {
    const leftSeat: Seat = { id: '1', hallId: 'hall1', row: 'A', column: 0, seatNumber: 1, seatType: 'REGULAR', status: 'AVAILABLE', linkedSeatId: null };
    const rightSeat: Seat = { id: '2', hallId: 'hall1', row: 'A', column: 1, seatNumber: null, seatType: 'REGULAR', status: 'INACTIVE', linkedSeatId: null };
    const seats: Seat[] = [leftSeat, rightSeat];
    
    const result = createLoveseatPair(leftSeat, seats, 10);
    expect(result).toBeNull();
  });

  it('returns null if right seat is already a loveseat', () => {
    const leftSeat: Seat = { id: '1', hallId: 'hall1', row: 'A', column: 0, seatNumber: 1, seatType: 'REGULAR', status: 'AVAILABLE', linkedSeatId: null };
    const rightSeat: Seat = { id: '2', hallId: 'hall1', row: 'A', column: 1, seatNumber: 2, seatType: 'LOVESEAT_LEFT', status: 'AVAILABLE', linkedSeatId: '3' };
    const seats: Seat[] = [leftSeat, rightSeat];
    
    const result = createLoveseatPair(leftSeat, seats, 10);
    expect(result).toBeNull();
  });
});

describe('convertLoveseatToRegular', () => {
  it('converts both seats to regular when deleting left', () => {
    const seats: Seat[] = [
      { id: '1', hallId: 'hall1', row: 'A', column: 0, seatNumber: 1, seatType: 'LOVESEAT_LEFT', status: 'AVAILABLE', linkedSeatId: '2' },
      { id: '2', hallId: 'hall1', row: 'A', column: 1, seatNumber: 2, seatType: 'LOVESEAT_RIGHT', status: 'AVAILABLE', linkedSeatId: '1' }
    ];
    
    const result = convertLoveseatToRegular(seats[0], seats);
    expect(result[0].seatType).toBe('REGULAR');
    expect(result[0].linkedSeatId).toBeNull();
    expect(result[1].seatType).toBe('REGULAR');
    expect(result[1].linkedSeatId).toBeNull();
  });

  it('converts both seats to regular when deleting right', () => {
    const seats: Seat[] = [
      { id: '1', hallId: 'hall1', row: 'A', column: 0, seatNumber: 1, seatType: 'LOVESEAT_LEFT', status: 'AVAILABLE', linkedSeatId: '2' },
      { id: '2', hallId: 'hall1', row: 'A', column: 1, seatNumber: 2, seatType: 'LOVESEAT_RIGHT', status: 'AVAILABLE', linkedSeatId: '1' }
    ];
    
    const result = convertLoveseatToRegular(seats[1], seats);
    expect(result[0].seatType).toBe('REGULAR');
    expect(result[0].linkedSeatId).toBeNull();
    expect(result[1].seatType).toBe('REGULAR');
    expect(result[1].linkedSeatId).toBeNull();
  });
});

describe('validateSeatConfiguration', () => {
  it('passes validation for valid configuration', () => {
    const seats: Seat[] = [
      { id: '1', hallId: 'hall1', row: 'A', column: 0, seatNumber: 1, seatType: 'REGULAR', status: 'AVAILABLE', linkedSeatId: null },
      { id: '2', hallId: 'hall1', row: 'A', column: 1, seatNumber: 2, seatType: 'REGULAR', status: 'AVAILABLE', linkedSeatId: null }
    ];
    
    const result = validateSeatConfiguration(seats, 10, 10);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.capacityUsed).toBe(2);
  });

  it('fails when capacity is exceeded', () => {
    const seats: Seat[] = [
      { id: '1', hallId: 'hall1', row: 'A', column: 0, seatNumber: 1, seatType: 'REGULAR', status: 'AVAILABLE', linkedSeatId: null },
      { id: '2', hallId: 'hall1', row: 'A', column: 1, seatNumber: 2, seatType: 'REGULAR', status: 'AVAILABLE', linkedSeatId: null },
      { id: '3', hallId: 'hall1', row: 'A', column: 2, seatNumber: 3, seatType: 'REGULAR', status: 'AVAILABLE', linkedSeatId: null }
    ];
    
    const result = validateSeatConfiguration(seats, 2, 10);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.type === 'CAPACITY_EXCEEDED')).toBe(true);
  });

  it('detects orphaned loveseats', () => {
    const seats: Seat[] = [
      { id: '1', hallId: 'hall1', row: 'A', column: 0, seatNumber: 1, seatType: 'LOVESEAT_LEFT', status: 'AVAILABLE', linkedSeatId: '999' },
      { id: '2', hallId: 'hall1', row: 'A', column: 1, seatNumber: 2, seatType: 'REGULAR', status: 'AVAILABLE', linkedSeatId: null }
    ];
    
    const result = validateSeatConfiguration(seats, 10, 10);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.type === 'ORPHANED_LOVESEAT')).toBe(true);
  });

  it('detects loveseat at row boundary', () => {
    const seats: Seat[] = [
      { id: '1', hallId: 'hall1', row: 'A', column: 9, seatNumber: 10, seatType: 'LOVESEAT_LEFT', status: 'AVAILABLE', linkedSeatId: '2' },
      { id: '2', hallId: 'hall1', row: 'A', column: 10, seatNumber: 11, seatType: 'LOVESEAT_RIGHT', status: 'AVAILABLE', linkedSeatId: '1' }
    ];
    
    const result = validateSeatConfiguration(seats, 10, 10);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.type === 'INVALID_LOVESEAT_PLACEMENT')).toBe(true);
  });
});

describe('assignSeatNumbers', () => {
  it('assigns sequential numbers, skipping inactive', () => {
    const seats: Seat[] = [
      { id: '1', hallId: 'hall1', row: 'A', column: 0, seatNumber: null, seatType: 'REGULAR', status: 'AVAILABLE', linkedSeatId: null },
      { id: '2', hallId: 'hall1', row: 'A', column: 1, seatNumber: null, seatType: 'REGULAR', status: 'AVAILABLE', linkedSeatId: null },
      { id: '3', hallId: 'hall1', row: 'A', column: 2, seatNumber: null, seatType: 'REGULAR', status: 'INACTIVE', linkedSeatId: null },
      { id: '4', hallId: 'hall1', row: 'A', column: 3, seatNumber: null, seatType: 'REGULAR', status: 'AVAILABLE', linkedSeatId: null }
    ];
    
    const result = assignSeatNumbers(seats);
    expect(result[0].seatNumber).toBe(1);
    expect(result[1].seatNumber).toBe(2);
    expect(result[2].seatNumber).toBeNull(); // Inactive
    expect(result[3].seatNumber).toBe(3);
  });

  it('handles multiple rows', () => {
    const seats: Seat[] = [
      { id: '1', hallId: 'hall1', row: 'A', column: 0, seatNumber: null, seatType: 'REGULAR', status: 'AVAILABLE', linkedSeatId: null },
      { id: '2', hallId: 'hall1', row: 'B', column: 0, seatNumber: null, seatType: 'REGULAR', status: 'AVAILABLE', linkedSeatId: null }
    ];
    
    const result = assignSeatNumbers(seats);
    expect(result[0].seatNumber).toBe(1); // Row A
    expect(result[1].seatNumber).toBe(1); // Row B restarts at 1
  });
});

describe('generateOptimalGrid', () => {
  it('generates grid with exact capacity', () => {
    const seats = generateOptimalGrid(10, 5, 'hall1');
    
    // Should have 2 rows (10 / 5 = 2)
    expect(seats.length).toBe(10);
    expect(seats.filter(s => s.row === 'A')).toHaveLength(5);
    expect(seats.filter(s => s.row === 'B')).toHaveLength(5);
  });

  it('marks excess seats as inactive in last row', () => {
    const seats = generateOptimalGrid(8, 5, 'hall1');
    
    // 8 capacity, 5 columns = 2 rows (5 + 3 active, 2 inactive)
    expect(seats.length).toBe(10); // 2 rows × 5 columns
    
    const rowA = seats.filter(s => s.row === 'A');
    const rowB = seats.filter(s => s.row === 'B');
    
    expect(rowA.every(s => s.status === 'AVAILABLE')).toBe(true);
    expect(rowB.filter(s => s.status === 'AVAILABLE')).toHaveLength(3);
    expect(rowB.filter(s => s.status === 'INACTIVE')).toHaveLength(2);
  });

  it('sets correct seat numbers', () => {
    const seats = generateOptimalGrid(8, 5, 'hall1');
    
    const rowA = seats.filter(s => s.row === 'A').sort((a, b) => a.column - b.column);
    expect(rowA[0].seatNumber).toBe(1);
    expect(rowA[4].seatNumber).toBe(5);
    
    const rowB = seats.filter(s => s.row === 'B').sort((a, b) => a.column - b.column);
    expect(rowB[0].seatNumber).toBe(1);
    expect(rowB[2].seatNumber).toBe(3);
    expect(rowB[3].seatNumber).toBeNull(); // Inactive
    expect(rowB[4].seatNumber).toBeNull(); // Inactive
  });
});

describe('getSeatDisplayLabel', () => {
  it('shows coordinates in admin mode', () => {
    const seat: Seat = { id: '1', hallId: 'hall1', row: 'A', column: 5, seatNumber: 6, seatType: 'REGULAR', status: 'AVAILABLE', linkedSeatId: null };
    
    expect(getSeatDisplayLabel(seat, 'admin')).toBe('A-5');
  });

  it('shows seat number in preview mode', () => {
    const seat: Seat = { id: '1', hallId: 'hall1', row: 'A', column: 5, seatNumber: 6, seatType: 'REGULAR', status: 'AVAILABLE', linkedSeatId: null };
    
    expect(getSeatDisplayLabel(seat, 'preview')).toBe('A6');
  });

  it('shows loveseat range in preview mode', () => {
    const seat: Seat = { id: '1', hallId: 'hall1', row: 'A', column: 5, seatNumber: 6, seatType: 'LOVESEAT_LEFT', status: 'AVAILABLE', linkedSeatId: '2' };
    
    expect(getSeatDisplayLabel(seat, 'preview')).toBe('A6-7');
  });

  it('shows dash for inactive seats', () => {
    const seat: Seat = { id: '1', hallId: 'hall1', row: 'A', column: 5, seatNumber: null, seatType: 'REGULAR', status: 'INACTIVE', linkedSeatId: null };
    
    expect(getSeatDisplayLabel(seat, 'preview')).toBe('-');
  });

  it('returns empty string for loveseat right (hidden)', () => {
    const seat: Seat = { id: '2', hallId: 'hall1', row: 'A', column: 6, seatNumber: 7, seatType: 'LOVESEAT_RIGHT', status: 'AVAILABLE', linkedSeatId: '1' };
    
    expect(getSeatDisplayLabel(seat, 'preview')).toBe('');
  });
});
