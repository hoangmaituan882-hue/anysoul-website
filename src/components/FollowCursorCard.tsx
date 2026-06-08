import { cn } from "../lib/utils";
import { motion, useMotionValue, useSpring, Variants } from "motion/react";
import React, { useRef, useState } from "react";

interface FollowCursorCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  cursorText?: string;
  variants?: Variants;
  key?: React.Key;
}

export function FollowCursorCard({ 
  children, 
  className, 
  cursorText = "探索详情 →", 
  variants 
}: FollowCursorCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - 50); 
    mouseY.set(e.clientY - rect.top - 20); 
  };

  return (
    <motion.div
       ref={containerRef}
       onMouseEnter={() => setIsHovered(true)}
       onMouseLeave={() => setIsHovered(false)}
       onMouseMove={handleMouseMove}
       variants={variants}
       className={cn(
         "relative overflow-hidden flex flex-col rounded-2xl bg-card border-[4px] border-[#E5E5E5] shadow-[0_4px_20px_rgb(0,0,0,0.03)] transition-all duration-500 hover:border-[#b4c053] hover:shadow-[0_0_15px_rgba(180,192,83,0.3)] hover:-translate-y-1 group hover:cursor-none",
         className
       )}
    >
       {/* Background Mask */}
       <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none" />

       {/* Custom Cursor */}
       <motion.div
         style={{ x: cursorX, y: cursorY }}
         initial={{ opacity: 0, scale: 0.5 }}
         animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.5 }}
         transition={{ duration: 0.2 }}
         className="absolute top-0 left-0 z-50 pointer-events-none rounded-full bg-primary px-4 py-2 flex items-center justify-center text-primary-foreground font-medium text-[13px] shadow-[0_0_20px_rgba(134,158,113,0.3)] whitespace-nowrap"
       >
         {cursorText}
       </motion.div>

       {/* Content */}
       <div className="relative z-0 h-full flex flex-col">
         {children}
       </div>
    </motion.div>
  );
}
