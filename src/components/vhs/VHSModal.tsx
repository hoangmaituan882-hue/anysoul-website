import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { tapes, Tape } from '../../data/tapes';
import { CRTPlayer } from './CRTPlayer';
import { TapeShelf } from './TapeShelf';
import { BlackCassette } from './BlackCassette';
import { HorizontalCassette } from './HorizontalCassette';

interface VHSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VHSModal({ isOpen, onClose }: VHSModalProps) {
  const [activeTape, setActiveTape] = useState<Tape | null>(null);
  const [isChanging, setIsChanging] = useState(false);
  const [insertingTape, setInsertingTape] = useState<Tape | null>(null);
  const [slotRect, setSlotRect] = useState<DOMRect | null>(null);

  const handleDropOnSlot = (tape: Tape) => {
    if (activeTape?.id === tape.id || isChanging) return;
    
    setInsertingTape(tape);
    setActiveTape(tape); 

    const slot = document.getElementById('vhs-slot');
    if (slot) {
      setSlotRect(slot.getBoundingClientRect());
    }
    
    // Play insert animation, then trigger static, then play
    setTimeout(() => {
      setIsChanging(true);
      setInsertingTape(null);

      setTimeout(() => {
        setIsChanging(false);
      }, 800); // 800ms of static before playing
    }, 600); // Duration of the physical insertion animation
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 sm:p-6 md:p-10 hide-scrollbar overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 cursor-pointer"
            style={{ background: 'radial-gradient(circle at center, #ffffff 0%, #e8e8ea 100%)' }}
          />

          <button 
            onClick={onClose}
            className="fixed top-6 right-6 p-3 rounded-full hover:bg-black/5 text-black/40 hover:text-black/80 transition-colors z-[110] cursor-pointer"
            title="Close player"
          >
             <X className="size-8" />
          </button>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="relative w-full max-w-5xl flex flex-col gap-14 sm:gap-20 z-10 my-auto items-center"
          >
             {/* TV Player Container */}
             <div className="relative w-full z-20">
                <CRTPlayer activeTape={activeTape} isChanging={isChanging} showColorBars={activeTape === null && !insertingTape} />
             </div>

             {/* Tape Shelf Area */}
             <div className="w-full relative z-30 px-4 mt-8">
               <TapeShelf 
                 tapes={tapes} 
                 activeTapeId={activeTape?.id || ''} 
                 onDropOnSlot={handleDropOnSlot} 
               />
             </div>
          </motion.div>

          {/* Inserting Tape Animation */}
          <AnimatePresence>
            {insertingTape && slotRect && (
              <div
                 className="fixed z-[1000] pointer-events-none overflow-hidden"
                 style={{ 
                   top: slotRect.top - 240, 
                   left: slotRect.left + 8, // slight margin
                   width: slotRect.width - 16, // fit exactly within slot width
                   height: 242 // +2px into the slot so it fully clips
                 }}
              >
                 <motion.div
                    key={`insert-${insertingTape.id}`}
                    initial={{ y: 20, opacity: 0, scale: 0.9, rotateX: 15 }} 
                    animate={{ y: 245, opacity: 1, scale: 1, rotateX: 0 }}
                    transition={{ 
                      y: { duration: 0.6, ease: "easeIn" },
                      opacity: { duration: 0.2 },
                      rotateX: { duration: 0.6 }
                    }} 
                    className="w-full flex items-start justify-center perspective-[800px]"
                 >
                    <HorizontalCassette tape={insertingTape} />
                 </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
}
