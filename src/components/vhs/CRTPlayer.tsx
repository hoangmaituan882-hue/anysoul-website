import React, { useRef, useEffect } from 'react';
import { Tape } from '../../data/tapes';
import { ScreenEffects } from './ScreenEffects';

interface CRTPlayerProps {
  activeTape: Tape | null;
  isChanging: boolean;
  showColorBars: boolean;
}

export function CRTPlayer({ activeTape, isChanging, showColorBars }: CRTPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && !isChanging && !showColorBars && activeTape) {
       // Only try to play if the video is ready; otherwise rely on autoPlay
       const promise = videoRef.current.play();
       if (promise !== undefined) {
         promise.catch(e => {
           // Silently ignore or warn. autoPlay attribute will handle it when loaded.
           console.warn("Video play promise rejected:", e.message);
         });
       }
    }
  }, [activeTape, isChanging, showColorBars]);

  return (
    <div className="relative w-full max-w-[480px] mx-auto bg-[#313134] rounded-[3rem] p-5 sm:p-7 pb-8 shadow-[0_30px_60px_rgba(0,0,0,0.15),inset_0_2px_10px_rgba(255,255,255,0.1),inset_0_-10px_20px_rgba(0,0,0,0.4)] flex flex-col z-20">
       
       {/* TV Screen Outer Bezel */}
       <div className="bg-[#1f1f21] p-4 sm:p-5 rounded-[2.5rem] shadow-[inset_0_5px_20px_rgba(0,0,0,0.5)]">
           
           {/* Screen Container */}
           <div className="relative w-full aspect-[4/3] bg-black rounded-[1.5rem] overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,1)] flex items-center justify-center crt-flicker">
              
              {(showColorBars || isChanging || !activeTape) ? (
                <div className="w-full h-full flex flex-col pointer-events-none select-none">
                   <div className="flex-1 flex w-full">
                     <div className="flex-1 bg-[#cfcfcf]"></div>
                     <div className="flex-1 bg-[#cece00]"></div>
                     <div className="flex-1 bg-[#00cece]"></div>
                     <div className="flex-1 bg-[#00ce00]"></div>
                     <div className="flex-1 bg-[#ce00ce]"></div>
                     <div className="flex-1 bg-[#ce0000]"></div>
                     <div className="flex-1 bg-[#0000ce]"></div>
                   </div>
                   <div className="h-[20%] flex w-full">
                     <div className="w-1/6 bg-[#0000ce]"></div>
                     <div className="w-1/6 bg-black"></div>
                     <div className="w-1/6 bg-[#ce00ce]"></div>
                     <div className="w-1/6 bg-black"></div>
                     <div className="w-1/6 bg-[#00cece]"></div>
                     <div className="w-1/6 bg-black"></div>
                   </div>
                   {/* Centered Text */}
                   <div className="absolute inset-0 flex items-center justify-center z-10 opacity-80">
                     <span className="bg-black text-white font-mono text-sm sm:text-base px-3 py-1 tracking-widest">- SMPTE -</span>
                   </div>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  src={activeTape.videoUrl}
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              )}

              <ScreenEffects isChanging={isChanging} />
           </div>
       </div>

       {/* Controls Area (Under the screen) */}
       <div className="mt-8 px-4 flex flex-col items-center gap-6 relative">
          
          {/* Tape Slot */}
          <div id="vhs-slot" className="w-[65%] h-3.5 bg-[#141415] rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,1),0_1px_1px_rgba(255,255,255,0.05)] relative flex items-center justify-center">
             <div className="w-[96%] h-[2px] bg-black/80 rounded-full"></div>
          </div>

          {/* Bottom Row: Buttons and Knob */}
          <div className="flex justify-between w-full items-center px-1 sm:px-3 mt-1 sm:mt-2">
             {/* Left Buttons */}
             <div className="flex gap-2.5 sm:gap-4">
                <div className="w-7 h-5 sm:w-8 sm:h-6 rounded-full bg-[#3f3f42] shadow-[0_3px_5px_rgba(0,0,0,0.5),inset_0_2px_2px_rgba(255,255,255,0.1)] border border-black/50"></div>
                <div className="w-7 h-5 sm:w-8 sm:h-6 rounded-full bg-[#3f3f42] shadow-[0_3px_5px_rgba(0,0,0,0.5),inset_0_2px_2px_rgba(255,255,255,0.1)] border border-black/50"></div>
                <div className="w-7 h-5 sm:w-8 sm:h-6 rounded-full bg-[#3f3f42] shadow-[0_3px_5px_rgba(0,0,0,0.5),inset_0_2px_2px_rgba(255,255,255,0.1)] border border-black/50"></div>
             </div>

             {/* Right: LED and Knob */}
             <div className="flex items-center gap-4 sm:gap-6">
                {/* Status LED */}
                <div className={`w-2.5 h-2.5 rounded-full z-10 ${(!showColorBars && !isChanging) ? 'bg-[#ff2288] shadow-[0_0_12px_#ff2288]' : 'bg-red-900 shadow-inner'} transition-all duration-300 border border-black/50`}></div>
                
                {/* Knob */}
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#2a2a2d] shadow-[0_4px_8px_rgba(0,0,0,0.6),inset_0_2px_4px_rgba(255,255,255,0.1)] border border-black flex items-center justify-center">
                   <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#1e1e20] shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] relative">
                      <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-2.5 bg-[#444] rounded-full"></div>
                   </div>
                </div>
             </div>
          </div>
       </div>

    </div>
  );
}
