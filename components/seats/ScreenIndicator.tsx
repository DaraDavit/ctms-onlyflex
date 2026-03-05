'use client';

interface ScreenIndicatorProps {
  hallName?: string;
}

export function ScreenIndicator({ hallName }: ScreenIndicatorProps) {
  return (
    <div className="relative mb-12">
      <div className="relative flex flex-col items-center">
        {/* Screen frame */}
        <div 
          className="relative w-full max-w-2xl h-12 md:h-18"
          style={{
            background : 'linear-gradient(60deg, #E11D48, #020617)',
            borderRadius: '0 0 9999px 9999px',
          }}
        >
          {/* Screen content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="flex items-center gap-3 justify-center">
                <span className="text-2xl">🎬</span>
                <span className="text-[#f6f6f6] font-bold tracking-widest text-sm md:text-base uppercase">
                  {hallName || 'Screen'}
                </span>
                <span className="text-2xl">🎬</span>
              </div>
            </div>
          </div>
          
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.5), transparent)',
            }}
          />
        </div>
        
        <div className="w-32 h-2 bg-linear-to-b from-slate-700 to-slate-800 rounded-b-lg mt-1" />
        <div className="mt-4 flex items-center gap-2 text-black text-xs">
          <span>↑</span>
          <span>Front of Hall</span>
          <span>↑</span>
        </div>
      </div>
    </div>
  );
}
