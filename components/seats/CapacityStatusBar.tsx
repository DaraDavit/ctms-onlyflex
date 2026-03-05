'use client';

import React from 'react';
import { CapacityBreakdown, ValidationError } from '@/types/seat';

interface CapacityStatusBarProps {
  breakdown: CapacityBreakdown;
  capacity: number;
  isOverCapacity: boolean;
  validationErrors: ValidationError[];
  canUndo: boolean;
  canRedo: boolean;
  viewMode: 'admin' | 'preview';
  onUndo: () => void;
  onRedo: () => void;
  onViewModeChange: (mode: 'admin' | 'preview') => void;
  onSave: () => void;
  isSaving?: boolean;
}

export function CapacityStatusBar({
  breakdown,
  capacity,
  isOverCapacity,
  validationErrors,
  canUndo,
  canRedo,
  viewMode,
  onUndo,
  onRedo,
  onViewModeChange,
  onSave,
  isSaving = false
}: CapacityStatusBarProps) {
  const percentage = Math.min((breakdown.capacityUsed / capacity) * 100, 100);
  
  const getStatusColor = () => {
    if (isOverCapacity) return 'from-red-500 to-red-600';
    if (breakdown.capacityUsed === capacity) return 'from-emerald-500 to-emerald-600';
    return 'from-blue-500 to-blue-600';
  };

  const getStatusText = () => {
    if (isOverCapacity) return { text: 'Over Capacity', icon: '⚠️', color: 'text-red-400' };
    if (breakdown.capacityUsed === capacity) return { text: 'Perfect', icon: '✓', color: 'text-emerald-400' };
    return { text: `${capacity - breakdown.capacityUsed} seats remaining`, icon: '', color: 'text-blue-400' };
  };

  const status = getStatusText();

  return (
    <div 
      className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/10"
      style={{
        background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.9) 100%)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Main Content Row */}
        <div className="flex flex-col lg:flex-row items-center gap-4">
          
          {/* Left: Controls */}
          <div className="flex items-center gap-3">
            {/* Undo/Redo */}
            <div className="flex items-center bg-slate-800/50 rounded-lg p-1 border border-slate-700/50">
              <button
                onClick={onUndo}
                disabled={!canUndo}
                className="px-3 py-1.5 text-sm font-medium rounded-md transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700/50 text-slate-300 hover:text-white"
                title="Undo (Ctrl+Z)"
              >
                <span className="mr-1">↶</span> Undo
              </button>
              <div className="w-px h-6 bg-slate-700/50" />
              <button
                onClick={onRedo}
                disabled={!canRedo}
                className="px-3 py-1.5 text-sm font-medium rounded-md transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700/50 text-slate-300 hover:text-white"
                title="Redo (Ctrl+Shift+Z)"
              >
                Redo <span className="ml-1">↷</span>
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-800/50 rounded-lg p-1 border border-slate-700/50">
              <button
                onClick={() => onViewModeChange('admin')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  viewMode === 'admin' 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                Admin
              </button>
              <button
                onClick={() => onViewModeChange('preview')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  viewMode === 'preview' 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                Preview
              </button>
            </div>
          </div>

          {/* Center: Capacity Progress */}
          <div className="flex-1 w-full lg:w-auto px-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-slate-300 text-sm font-medium">Capacity</span>
                <span className={`text-2xl font-bold ${status.color}`}>
                  {breakdown.capacityUsed}<span className="text-slate-500 text-lg">/{capacity}</span>
                </span>
                {status.icon && (
                  <span className="text-lg animate-pulse">{status.icon}</span>
                )}
              </div>
              <span className={`text-sm ${status.color}`}>{status.text}</span>
            </div>
            
            {/* Progress Bar */}
            <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
              <div 
                className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getStatusColor()} transition-all duration-500 ease-out rounded-full`}
                style={{ width: `${percentage}%` }}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </div>
              {isOverCapacity && (
                <div className="absolute inset-0 bg-red-500/30 animate-pulse rounded-full" />
              )}
            </div>
          </div>

          {/* Right: Stats & Save */}
          <div className="flex items-center gap-4">
            {/* Quick Stats */}
            <div className="hidden md:flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-slate-400">{breakdown.regular}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-violet-500" />
                <span className="text-slate-400">{breakdown.vip}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-pink-500" />
                <span className="text-slate-400">{breakdown.twinseats}×2</span>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={onSave}
              disabled={isOverCapacity || validationErrors.length > 0 || isSaving}
              className={`
                px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200
                ${isOverCapacity || validationErrors.length > 0
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 active:scale-95'
                }
              `}
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h4 className="font-semibold text-red-400 mb-2">Configuration Errors</h4>
                <ul className="space-y-1">
                  {validationErrors.slice(0, 3).map((error, index) => (
                    <li key={index} className="text-sm text-red-300/90 flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-red-400" />
                      {error.message}
                      {error.row && (
                        <span className="text-red-400/60 text-xs">({error.row})</span>
                      )}
                    </li>
                  ))}
                  {validationErrors.length > 3 && (
                    <li className="text-sm text-red-400/60">
                      ...and {validationErrors.length - 3} more errors
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
