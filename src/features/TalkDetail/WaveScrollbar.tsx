import type { PointerEvent, RefObject } from "react";
import { useState, useRef, useEffect } from "react";
import { cn } from "../../lib/utils";

export function WaveScrollbar({
  scrollRef,
  matchedIndices,
  totalItems,
}: {
  scrollRef: RefObject<HTMLDivElement>;
  matchedIndices: number[];
  totalItems: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number>(-1);
  const [progressIndex, setProgressIndex] = useState(0);
  const barsCount = 40;

  const updateScroll = (ratio: number) => {
    if (scrollRef.current) {
      const maxScroll = scrollRef.current.scrollHeight - scrollRef.current.clientHeight;
      if (maxScroll <= 0) return;
      scrollRef.current.scrollTo({
        top: ratio * maxScroll,
        behavior: 'smooth'
      });
    }
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    const ratio = x / rect.height;
    const index = Math.floor(ratio * (barsCount - 1));
    setHoverIndex(index);
    if (e.buttons > 0) updateScroll(ratio);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        const maxScroll = scrollHeight - clientHeight;
        if (maxScroll <= 0) {
           setProgressIndex(0); return;
        }
        const ratio = scrollTop / maxScroll;
        setProgressIndex(Math.max(0, Math.min(barsCount - 1, Math.round(ratio * (barsCount - 1)))));
      }
    };
    handleScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", handleScroll, { passive: true });
      window.addEventListener("resize", handleScroll);
    }
    return () => {
      if (el) el.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [scrollRef, barsCount]);

  const matchSet = new Set(matchedIndices.map(idx => {
    if (totalItems <= 1) return 0;
    const ratio = idx / (totalItems - 1);
    return Math.floor(ratio * (barsCount - 1));
  }));
  
  const hasMatches = matchedIndices.length > 0;

  return (
    <div 
      ref={trackRef}
      className="w-8 flex flex-col items-center justify-between py-2 cursor-pointer touch-none bg-muted/20 rounded-full h-full border border-border/50"
      onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); handlePointerMove(e); }}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setHoverIndex(-1)}
      onPointerUp={(e) => e.currentTarget.releasePointerCapture(e.pointerId)}
    >
      {Array.from({ length: barsCount }).map((_, i) => {
        const dist = hoverIndex !== -1 ? Math.abs(hoverIndex - i) : Math.abs(progressIndex - i);
        let w = 8;
        let opacity = 0.3;
        let color = "bg-primary";
        let scale = 1;
        
        if (dist === 0) { w = 24; opacity = 1; color = "bg-primary" }
        else if (dist === 1) { w = 18; opacity = 0.8; }
        else if (dist === 2) { w = 12; opacity = 0.6; }
        else if (dist === 3) { w = 10; opacity = 0.4; }

        if (hasMatches && matchSet.has(i)) {
           color = "bg-orange-500";
           opacity = 1;
           scale = 1.3;
           if (w < 12) w = 16;
        }

        return (
          <div key={i} className="flex justify-center items-center w-full h-full pointer-events-none">
            <div 
              style={{ width: `${w}px`, opacity, transform: `scale(${scale})` }}
              className={cn("h-1.5 rounded-full transition-all duration-300 ease-out", color)}
            />
          </div>
        );
      })}
    </div>
  );
}
