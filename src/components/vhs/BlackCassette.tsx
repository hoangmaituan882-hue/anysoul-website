import React from 'react';

export function BlackCassette({ tape, className = "" }: { tape: { label: string }, className?: string }) {
  return (
    <div className={`w-full h-full bg-[#181818] rounded-md border-[1.5px] border-[#222] shadow-[0_10px_20px_rgba(0,0,0,0.4)] flex flex-col items-center ${className}`}>
         {/* Top ridges */}
         <div className="w-full h-3 border-b border-[#0a0a0a] flex justify-between px-2 items-center bg-[#111] rounded-t-md">
             <div className="w-3 h-0.5 bg-black rounded-full"></div>
             <div className="w-3 h-0.5 bg-black rounded-full"></div>
         </div>
         
         {/* Label Area */}
         <div className="mx-1 mt-2 w-[85%] bg-white h-7 rounded-[2px] p-0.5 shadow-inner relative z-10 pointer-events-none">
             <div className="w-full h-full border border-black/10 flex flex-col justify-center px-1">
                <span className="font-['Caveat',cursive] text-[10px] text-black font-bold truncate leading-none pt-0.5">{tape.label}</span>
                <div className="w-full h-px bg-black/10 mt-0.5" />
             </div>
         </div>

         {/* Spools Area */}
         <div className="mx-2 mb-1.5 mt-auto h-8 sm:h-9 w-[75%] bg-black rounded-sm border border-[#222] shadow-[inset_0_1px_5px_rgba(0,0,0,1)] flex justify-between items-center px-1 relative pointer-events-none">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center z-0">
               <div className="w-10 h-5 bg-white/5 rounded-full blur-[1px]"></div>
            </div>
            {/* Left Spool */}
            <div className="size-5 rounded-full border border-[#333] bg-[#111] flex items-center justify-center z-10">
               <div className="size-2 rounded-full bg-white/20 flex items-center justify-center">
                 <div className="size-1 rounded-full bg-black"></div>
               </div>
            </div>
            {/* Right Spool */}
            <div className="size-5 rounded-full border border-[#333] bg-[#111] flex items-center justify-center z-10">
               <div className="size-2 rounded-full bg-white/20 flex items-center justify-center">
                 <div className="size-1 rounded-full bg-black"></div>
               </div>
            </div>
         </div>
    </div>
  );
}
