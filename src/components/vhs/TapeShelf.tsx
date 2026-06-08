import React from 'react';
import { Tape } from '../../data/tapes';
import { TapeCard } from './TapeCard';

interface TapeShelfProps {
  tapes: Tape[];
  activeTapeId: string;
  onDropOnSlot: (tape: Tape) => void;
}

export function TapeShelf({ tapes, activeTapeId, onDropOnSlot }: TapeShelfProps) {
  return (
    <div className="flex justify-center items-center gap-4 sm:gap-8 flex-wrap w-full max-w-4xl mx-auto pb-8 z-30 relative">
      {tapes.map(tape => (
        <React.Fragment key={tape.id}>
           <TapeCard 
             tape={tape} 
             isActive={tape.id === activeTapeId} 
             onDropOnSlot={onDropOnSlot} 
           />
        </React.Fragment>
      ))}
    </div>
  );
}
