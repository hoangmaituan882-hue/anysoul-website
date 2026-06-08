import { cn } from "../lib/utils";
import { Zap, Shield, Blocks, Cpu, Database, BarChart3, MessageSquare } from "lucide-react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useRef, useState } from "react";
import { useThemeLanguage } from "../contexts/ThemeLanguageContext";

import { FollowCursorCard } from "./FollowCursorCard";

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 20 } }
};

export function FeaturesBento() {
  const { t } = useThemeLanguage();

  const features = [
    {
      title: t("fb.1.t"),
      description: t("fb.1.d"),
      icon: Zap,
      className: "md:col-span-2",
      visual: (
        <div className="flex h-full w-full items-center justify-center bg-secondary/50">
          <div className="relative">
             <Zap className="size-16 text-primary" strokeWidth={1} />
          </div>
        </div>
      ),
    },
    {
      title: t("fb.2.t"),
      description: t("fb.2.d"),
      icon: Shield,
      className: "md:col-span-1",
      visual: (
         <div className="flex h-full w-full p-6 border-b border-border bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:[radial-gradient(#333_1px,transparent_1px)]">
            <div className="flex flex-col gap-3 w-full mt-auto">
               <div className="h-1.5 w-full rounded-full bg-primary/20 overflow-hidden"><div className="h-full w-[100%] rounded-full bg-primary" /></div>
               <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden"><div className="h-full w-[80%] rounded-full bg-neutral-400" /></div>
               <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden"><div className="h-full w-[40%] rounded-full bg-neutral-300" /></div>
            </div>
         </div>
      ),
    },
    {
      title: t("fb.3.t"),
      description: t("fb.3.d"),
      icon: Blocks,
      className: "md:col-span-1",
      visual: (
         <div className="flex flex-col p-6 h-full w-full bg-secondary/30 items-center justify-center">
            <div className="flex -space-x-3">
               {[1,2,3].map((i) => (
                  <div key={i} className="size-12 rounded-xl bg-card border border-border shadow-sm flex items-center justify-center ring-2 ring-background z-10 transition-transform hover:-translate-y-1">
                     <div className="size-5 rounded bg-primary/10 border border-primary/20" />
                  </div>
               ))}
            </div>
         </div>
      ),
    },
    {
      title: t("fb.4.t"),
      description: t("fb.4.d"),
      icon: Cpu,
      className: "md:col-span-1",
      visual: (
         <div className="relative h-full w-full overflow-hidden bg-[#fafafa] dark:bg-background">
            <div className="absolute right-0 top-0 size-64 bg-primary/5 rounded-full blur-[80px]" />
            <div className="p-4 md:p-8 flex items-center justify-center gap-3 md:gap-6 h-full">
              <div className="p-3 md:p-4 rounded-2xl border-2 border-border shadow-[0_2px_10px_rgb(0,0,0,0.02)] bg-card group hover:border-primary/50 transition-colors">
                 <Database className="size-5 md:size-6 text-muted-foreground group-hover:text-primary transition-colors" strokeWidth={1} />
              </div>
              <div className="flex-1 max-w-[60px] md:max-w-[100px] h-px bg-border/80 relative">
                 <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border border-border bg-card px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[8px] md:text-[10px] uppercase font-bold tracking-widest text-muted-foreground shadow-sm">Process</div>
              </div>
              <div className="p-3 md:p-4 rounded-2xl bg-primary text-primary-foreground shadow-[0_4px_20px_rgb(134,158,113,0.3)] transition-transform hover:-translate-y-1">
                 <BarChart3 className="size-5 md:size-6" strokeWidth={1.5} />
              </div>
            </div>
         </div>
      ),
    },
  ];

  return (
    <section id="features" className="py-32 md:py-48 px-4 w-full max-w-7xl mx-auto">
      <div className="mb-20 text-center">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-foreground">
          {t("fb.title")}<span className="text-muted-foreground font-normal">{t("fb.title2")}</span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          {t("fb.subtitle")}
        </p>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {features.map((feature, i) => (
          <FollowCursorCard 
            key={i} 
            className={feature.className}
            variants={itemVariants}
          >
            <div className="h-[280px] border-b border-border overflow-hidden relative">
              {feature.visual}
            </div>
            <div className="p-8 flex flex-col gap-3 flex-1">
              <div className="flex items-center gap-3 mb-1">
                <feature.icon className="size-5 text-primary" strokeWidth={1.5} />
                <h3 className="font-semibold text-lg text-foreground">{feature.title}</h3>
              </div>
              <p className="text-[15px] leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          </FollowCursorCard>
        ))}
      </motion.div>
    </section>
  );
}
