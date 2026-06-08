import React from 'react';

export function HorizontalCassette({ tape, className = "" }: { tape: { label: string, color?: string, textColor?: string }, className?: string }) {
  return (
    <div className={`w-full aspect-[1.8] bg-[#1a1a1a] rounded-t-md rounded-b-[4px] border-[1.5px] border-[#333] shadow-[0_15px_30px_rgba(0,0,0,0.5),inset_0_2px_10px_rgba(255,255,255,0.05)] flex flex-col items-center relative overflow-hidden ${className}`}>
      
      {/* Top ridges */}
      <div className="absolute top-0 inset-x-4 h-3 flex items-center justify-between pointer-events-none">
          <div className="w-16 h-[2px] bg-black/80 rounded-full shadow-[0_1px_0_rgba(255,255,255,0.1)]"></div>
          <div className="w-16 h-[2px] bg-black/80 rounded-full shadow-[0_1px_0_rgba(255,255,255,0.1)]"></div>
      </div>

      <div className="w-full mt-4 border-b-2 border-[#111] shadow-[0_2px_4px_rgba(0,0,0,0.5)] bg-[#1e1e1e] pb-6 flex flex-col justify-center items-center relative z-10">
         {/* Label Area */}
         <div className="w-[70%] h-14 bg-white rounded-sm p-1 shadow-inner relative mt-2 flex items-center border-[2px] border-black/20"
              style={{ backgroundColor: tape.color || '#fff', color: tape.textColor || '#000' }}>
             <div className="w-full h-full border border-black/10 flex items-center justify-center px-3 bg-white/80">
                <span className="font-['Caveat',cursive] text-lg sm:text-xl font-bold truncate tracking-tight">{tape.label}</span>
             </div>
             <div className="absolute left-2 top-2 w-2 h-2 rounded-full border border-black/20" />
             <div className="absolute right-2 top-2 w-2 h-2 rounded-full border border-black/20" />
         </div>

         {/* Window with spools */}
         <div className="absolute -bottom-8 w-[50%] h-16 bg-[#0a0a0a] rounded-lg border-2 border-[#2a2a2a] shadow-[inset_0_4px_10px_rgba(0,0,0,0.8)] flex justify-between items-center px-2">
            {/* Left Spool */}
            <div className="w-10 h-10 rounded-full border-2 border-[#333] bg-[#111] flex items-center justify-center relative shadow-[0_0_10px_rgba(0,0,0,0.5)]">
               <div className="w-8 h-8 rounded-full border-[1.5px] border-[#444] border-dashed animate-[spin_4s_linear_infinite]" />
               <div className="absolute inset-0 m-auto w-3 h-3 rounded-full bg-white/20" />
               <div className="absolute inset-0 m-auto w-1.5 h-1.5 rounded-full bg-black/80" />
            </div>

            {/* Right Spool */}
            <div className="w-10 h-10 rounded-full border-2 border-[#333] bg-[#111] flex items-center justify-center relative shadow-[0_0_10px_rgba(0,0,0,0.5)]">
               <div className="w-8 h-8 rounded-full border-[1.5px] border-[#444] border-dashed animate-[spin_4s_linear_infinite]" />
               <div className="absolute inset-0 m-auto w-3 h-3 rounded-full bg-white/20" />
               <div className="absolute inset-0 m-auto w-1.5 h-1.5 rounded-full bg-black/80" />
            </div>

            {/* Tape between spools */}
            <div className="absolute inset-x-10 top-1/2 -translate-y-1/2 h-[2px] bg-white/5 shadow-[0_0_2px_rgba(255,255,255,0.2)]"></div>
         </div>
      </div>

      {/* Bottom details */}
      <div className="w-full mt-auto mb-2 flex justify-between px-6 items-end">
          <div className="w-3 h-3 rounded-full bg-[#111] border border-[#2a2a2a] shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]"></div>
          <div className="w-20 h-1 bg-[#111] rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,1)]"></div>
          <div className="w-3 h-3 rounded-full bg-[#111] border border-[#2a2a2a] shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]"></div>
      </div>

    </div>
  );
}
