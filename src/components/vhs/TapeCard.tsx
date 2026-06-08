import React, { useState } from 'react';
import { motion, PanInfo } from 'motion/react';
import { Tape } from '../../data/tapes';
import { BlackCassette } from './BlackCassette';

interface TapeCardProps {
  tape: Tape;
  isActive: boolean;
  onDropOnSlot: (tape: Tape) => void;
}

export function TapeCard({ tape, isActive, onDropOnSlot }: TapeCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    setIsHovered(false);
    
    // Check if dropped near the VHS slot
    const slot = document.getElementById('vhs-slot');
    if (slot) {
      const rect = slot.getBoundingClientRect();
      const dropX = info.point.x;
      const dropY = info.point.y;
      
      const paddingX = 80;
      const paddingY = 80;
      
      if (
        dropX > rect.left - paddingX &&
        dropX < rect.right + paddingX &&
        dropY > rect.top - paddingY &&
        dropY < rect.bottom + paddingY
      ) {
        onDropOnSlot(tape);
      }
    }
  };

  if (isActive) return null;

  return (
    <div 
      className="relative w-32 sm:w-36 aspect-[4/5] flex-shrink-0 z-30"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => !isDragging && setIsHovered(false)}
    >
      {/* Invisible expanded hit area to maintain hover state when cassette drops down */}
      <div className="absolute inset-x-0 top-0 -bottom-24 z-0 pointer-events-auto" />

      {/* Colorful Sleeve (Covers the cassette) */}
      <div 
        className="absolute inset-0 w-full h-full rounded-xl shadow-[0_5px_15px_rgba(0,0,0,0.3)] p-3 flex flex-col justify-between pointer-events-none z-20 border-[0.5px] border-white/20"
        style={{ backgroundColor: tape.color, color: tape.textColor }}
      >
        {/* Top-right cutout notch */}
        <div className="absolute top-2 right-2 w-6 h-2 bg-black/15 rounded-full shadow-inner" />

        {/* Top Row: Brand & VHS Pill */}
        <div className="flex justify-between items-start pt-2">
           <div className="font-black tracking-tighter text-base sm:text-lg leading-none">{tape.brand}</div>
           <div className="text-[8px] font-bold border border-current rounded-full px-1.5 py-0.5 leading-none uppercase">VHS</div>
        </div>
        
        {/* Middle: Type Text */}
        <div className="text-[8px] font-bold leading-tight opacity-80 whitespace-pre-line mt-1">
          {tape.typeText}
        </div>

        {/* Large Year */}
        <div className="text-3xl sm:text-4xl font-black tracking-tighter mt-1 mb-1">
          {tape.year}
        </div>

        {/* White Box for Label */}
        <div className="w-full bg-white rounded flex items-center justify-center p-1.5 relative shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] mb-1">
           <span className="font-['Caveat',cursive] text-black/80 font-bold text-base sm:text-lg tracking-tight leading-none truncate pt-0.5">{tape.label}</span>
        </div>

        {/* Bottom fine print */}
        <div className="text-[5px] sm:text-[6px] font-bold opacity-60 mt-auto flex justify-between items-center w-full uppercase tracking-widest">
           <span>Standard</span>
           <div className="flex gap-[2px]">
             <span className="w-1 h-1 bg-current opacity-50 rounded-full" />
             <span className="w-1 h-1 bg-current opacity-50 rounded-full" />
             <span className="w-1 h-1 bg-current opacity-50 rounded-full" />
           </div>
           <span>Hi-Fi</span>
        </div>
      </div>

      {/* Draggable Black Cassette */}
      <motion.div
        drag
        dragSnapToOrigin
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        animate={{
          y: isHovered && !isDragging ? 90 : 0,
          scale: isDragging ? 1.25 : 1, // scales up when dragging
        }}
        style={{
          zIndex: isDragging ? 50 : 10,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={`absolute inset-x-[6%] inset-y-[2%] w-[88%] h-[96%] cursor-grab active:cursor-grabbing ${isDragging ? '' : 'pointer-events-auto'}`}
      >
         <BlackCassette tape={tape} />
      </motion.div>
    </div>
  );
}
