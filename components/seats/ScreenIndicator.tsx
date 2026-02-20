'use client';

import React from 'react';

interface ScreenIndicatorProps {
  hallName?: string;
}

export function ScreenIndicator({ hallName }: ScreenIndicatorProps) {
  return (
    <div className="relative mb-12">
      {/* Glow effect behind screen */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/20 via-purple-500/10 to-transparent blur-3xl transform scale-150" />
      
      {/* Screen container */}
      <div className="relative flex flex-col items-center">
        {/* Screen frame */}
        <div 
          className="relative w-full max-w-4xl h-16 md:h-20"
          style={{
            background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
            borderRadius: '50% / 100%',
            borderBottomLeftRadius: '50% 100%',
            borderBottomRightRadius: '50% 100%',
            boxShadow: `
              inset 0 -4px 20px rgba(0, 0, 0, 0.5),
              0 10px 40px rgba(59, 130, 246, 0.3),
              0 0 60px rgba(59, 130, 246, 0.1)
            `,
          }}
        >
          {/* Screen content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="flex items-center gap-3 justify-center">
                <span className="text-2xl">🎬</span>
                <span className="text-slate-300 font-bold tracking-widest text-sm md:text-base uppercase">
                  {hallName || 'Screen'}
                </span>
                <span className="text-2xl">🎬</span>
              </div>
            </div>
          </div>
          
          {/* Top highlight line */}
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.5), transparent)',
            }}
          />
        </div>
        
        {/* Screen base/stand */}
        <div className="w-32 h-2 bg-gradient-to-b from-slate-700 to-slate-800 rounded-b-lg mt-1" />
        
        {/* Distance indicator */}
        <div className="mt-4 flex items-center gap-2 text-slate-500 text-xs">
          <span>↑</span>
          <span>Front of Hall</span>
          <span>↑</span>
        </div>
      </div>
    </div>
  );
}
