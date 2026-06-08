import { cn } from "../lib/utils";
import { ArrowRight, Bot, Command, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useThemeLanguage } from "../contexts/ThemeLanguageContext";
import { useContent } from "../content/useContent";
import type { HomeHeroContent } from "../content/types";

export function Hero() {
  const { t } = useThemeLanguage();
  const hero = useContent<HomeHeroContent>("home.hero.main", {
    badge: t("hero.badge"),
    titlePrefix: t("hero.title.prefix"),
    highlight1: t("hero.title.highlight1"),
    highlight2: t("hero.title.highlight2"),
    subtitle: t("hero.subtitle"),
    browserTitle: t("hero.browser.title"),
    browserStatus1: t("hero.browser.status1"),
    browserStatus2: t("hero.browser.status2"),
    chatMsg1: t("hero.chat.msg1"),
    chatMsg2: t("hero.chat.msg2"),
    chatMsg3: t("hero.chat.msg3"),
    chatThinking: t("hero.chat.thinking"),
    eventsTitle: t("hero.events.title"),
    events: [t("hero.events.1"), t("hero.events.2"), t("hero.events.3")],
    activityTitle: t("hero.activity.title"),
    activityMemory: t("hero.activity.memory"),
    activityItem1: t("hero.activity.item1"),
    activityItem1Desc: t("hero.activity.item1.desc")
  });
  
  const draw = {
    hidden: (custom: { color: string }) => ({ pathLength: 0, opacity: 0, stroke: custom.color }),
    visible: (custom: { delay: number; dur?: number; color: string }) => ({
      pathLength: 1,
      opacity: 1,
      stroke: [custom.color, custom.color, "rgb(215, 214, 212)"],
      transition: {
        pathLength: { delay: custom.delay, type: "tween", ease: "easeInOut", duration: custom.dur || 0.6 },
        opacity: { delay: custom.delay, duration: 0.01 },
        stroke: { delay: 0, duration: 2.8, times: [0, 0.7, 1], ease: "easeInOut" }
      }
    })
  };

  const drawDot = {
    hidden: { scale: 0, opacity: 0, fill: "#abc378" },
    visible: (custom: { delay: number }) => ({
      scale: 1,
      opacity: 1,
      fill: ["#abc378", "#abc378", "rgb(215, 214, 212)"],
      transition: { 
        scale: { delay: custom.delay, type: "spring", stiffness: 400, damping: 15 },
        opacity: { delay: custom.delay, duration: 0.01 },
        fill: { delay: 0, duration: 2.8, times: [0, 0.7, 1], ease: "easeInOut" }
      }
    })
  };

  const paths = [
    { d: "M 80 260 Q 140 150 160 80 C 170 30 100 40 100 100 Q 100 190 200 230 C 250 250 200 300 150 290", delay: 0.1, dur: 0.4, color: "#abc378" },
    { d: "M 190 120 C 220 20 240 20 230 80 L 210 250 M 210 170 C 240 120 280 120 280 170 L 270 250 C 270 270 300 250 310 230", delay: 0.4, dur: 0.4, color: "#abc378" },
    { d: "M 310 170 C 310 200 300 250 310 250 C 330 250 340 230 350 220", delay: 0.7, dur: 0.2, color: "#abc378" },
    { d: "M 420 170 L 390 280 C 370 340 330 350 330 310 C 330 270 400 220 440 200", delay: 0.8, dur: 0.3, color: "#abc378" },
    { d: "M 460 170 C 460 200 450 250 460 250 C 480 250 490 230 500 220", delay: 1.0, dur: 0.2, color: "#abc378" },
    { d: "M 550 150 C 500 150 500 220 550 220 C 580 220 580 140 550 140 L 540 240 C 540 260 570 240 580 230", delay: 1.1, dur: 0.3, color: "#abc378" },
    { d: "M 600 160 L 590 250 M 590 180 C 620 140 650 140 650 180 L 640 250 C 640 270 670 250 680 230", delay: 1.3, dur: 0.4, color: "#abc378" }
  ];

  const dots = [
    { cx: 315, cy: 110, delay: 0.8 },
    { cx: 425, cy: 110, delay: 1.0 },
    { cx: 465, cy: 110, delay: 1.2 }
  ];

  const heart = { d: "M 780 150 C 780 110, 730 110, 730 150 C 730 210, 780 250, 780 250 C 780 250, 830 210, 830 150 C 830 110, 780 110, 780 150", delay: 1.7, dur: 0.5, color: "#f9a8d4" };

  return (
    <section className="relative min-h-[90vh] flex flex-col justify-center items-center py-20 px-4 md:px-8 max-w-7xl mx-auto w-full">
      <div className="relative z-10 flex flex-col items-center text-center w-full max-w-4xl mx-auto space-y-4 mt-8 mb-20">
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 2.8, ease: "easeOut" }}
          className="relative z-20 mt-12 mb-2"
        >
          <a
            href="#changelog"
            className="group relative inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 hover:bg-primary/10 backdrop-blur-md shadow-[0_0_20px_rgba(164,198,57,0.1)] hover:shadow-[0_0_25px_rgba(164,198,57,0.2)] transition-all cursor-pointer"
          >
            <div className="absolute inset-0 rounded-full border border-primary/40 animate-[ping_2.5s_ease-in-out_infinite] opacity-30 -z-10" />
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-500"></span>
            </span>
            <span className="text-[12px] font-semibold text-foreground transition-colors group-hover:text-primary">{hero.badge}</span>
            <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-primary transition-colors group-hover:translate-x-0.5" />
          </a>
        </motion.div>

        <motion.h1 
          className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-tight relative z-10"
          initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.6, delay: 2.2, ease: "easeOut" }}
        >
          {hero.titlePrefix}
        </motion.h1>

        <div className="relative flex justify-center items-center py-4 w-full h-[120px] md:h-[160px]">
          {/* Cursive Background Text */}
          <motion.div 
            className="absolute -z-10 w-[900px] h-full flex items-center justify-center pointer-events-none opacity-80 mix-blend-multiply dark:mix-blend-screen"
            style={{ transform: 'rotate(-4deg)' }}
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { filter: "drop-shadow(0px 0px 0px rgba(171,195,120,0))" },
              visible: {
                filter: [
                  "drop-shadow(0px 0px 0px rgba(171,195,120,0))",
                  "drop-shadow(0px 0px 8px rgba(171,195,120,0.4))",
                  "drop-shadow(0px 0px 1px rgba(171,195,120,0.1))"
                ],
                transition: { delay: 2.1, duration: 3.5, repeat: Infinity, ease: "easeInOut" }
              }
            }}
          >
            <svg viewBox="0 0 900 400" className="w-[140%] max-w-none md:w-[110%] h-auto" strokeLinecap="round" strokeLinejoin="round" fill="none">
              {paths.map((p, i) => (
                <motion.path 
                  key={`path-${i}`} 
                  d={p.d} 
                  strokeWidth="10" 
                  variants={draw} 
                  custom={{ delay: p.delay, dur: p.dur, color: p.color }} 
                />
              ))}
              {dots.map((dot, i) => (
                <motion.circle
                  key={`dot-${i}`}
                  cx={dot.cx}
                  cy={dot.cy}
                  r="6"
                  variants={drawDot}
                  custom={{ delay: dot.delay }}
                />
              ))}
              <motion.path 
                d={heart.d} 
                strokeWidth="8" 
                variants={draw} 
                custom={{ delay: heart.delay, dur: heart.dur, color: heart.color }} 
              />
            </svg>
          </motion.div>
          
          {/* Foreground Text */}
          <motion.h2 
            className="text-5xl md:text-7xl font-bold tracking-tight z-10 drop-shadow-sm"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 2.4, ease: "easeOut" }}
          >
            <span className="text-[#a4c639]">{hero.highlight1}</span>
            <span className="text-[#ea4c89]">{hero.highlight2}</span>
          </motion.h2>
        </div>

        <motion.p 
          className="text-lg md:text-xl text-foreground font-medium pt-8 pb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 2.6, ease: "easeOut" }}
        >
          {hero.subtitle}
        </motion.p>
      </div>

      {/* Mock Browser Window */}
      <div 
        className="relative z-10 w-full max-w-6xl mx-auto drop-shadow-2xl"
      >
        <div className="relative h-[600px] md:h-[650px] w-full overflow-hidden bg-[#f5f5f5] dark:bg-[#1a1a1a] border border-border/40 rounded-xl shadow-[0_8px_40px_rgb(0,0,0,0.08)] flex flex-col">
          {/* Browser Header */}
          <div className="flex h-12 items-center border-b border-border/40 bg-white dark:bg-[#222] px-4 gap-3 z-20 shrink-0">
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-[#ff5f56]" />
              <div className="size-3 rounded-full bg-[#ffbd2e]" />
              <div className="size-3 rounded-full bg-[#27c93f]" />
            </div>
            <div className="mx-auto flex items-center justify-center text-[13px] text-muted-foreground">
              {hero.browserTitle}
            </div>
            <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground mr-2">
              <div className="size-2 rounded-full bg-[#27c93f]" />
              {hero.browserStatus1}
            </div>
          </div>
          
          {/* Browser Content container (3 Columns) */}
          <div className="flex flex-col md:flex-row flex-1 p-4 gap-4 overflow-y-auto md:overflow-hidden">
            
            {/* Column 1: Chat Mock */}
            <div className="flex-[4] min-h-[350px] md:min-h-0 flex flex-col bg-white dark:bg-[#222] border border-border/40 rounded-xl overflow-hidden shadow-sm relative">
               <div className="h-12 border-b border-border/40 flex items-center justify-between px-4 shrink-0">
                 <div className="flex items-center gap-2">
                    <svg className="size-5" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="4" width="16" height="16" rx="4" fill="#a4c639" transform="rotate(-10 12 12)" />
                      <circle cx="11.5" cy="11.5" r="3.5" fill="#1a1a1a" />
                      <circle cx="11.5" cy="11.5" r="1.5" fill="#a4c639" />
                    </svg>
                    <span className="font-semibold text-sm">AnySoul</span>
                 </div>
                 <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className="size-1.5 rounded-full bg-[#27c93f]" /> {hero.browserStatus2}
                 </div>
               </div>
               
               <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
                 {/* User bubble */}
                 <div className="flex justify-end">
                   <div className="bg-[#cfdb7d] text-[#1a1a1a] p-3 px-4 rounded-2xl rounded-tr-sm text-[13px] max-w-[85%] shadow-sm">
                      {hero.chatMsg1}
                   </div>
                 </div>
                 
                 {/* Bot bubble */}
                 <div className="flex justify-start relative group">
                   <div className="bg-white dark:bg-[#333] border border-border/60 p-3 px-4 rounded-2xl rounded-tl-sm text-[13px] max-w-[90%] shadow-sm leading-relaxed">
                      {hero.chatMsg2}
                   </div>
                 </div>

                 {/* User bubble */}
                 <div className="flex justify-end">
                   <div className="bg-[#cfdb7d] text-[#1a1a1a] p-3 px-4 rounded-2xl rounded-tr-sm text-[13px] max-w-[85%] shadow-sm">
                      {hero.chatMsg3}
                   </div>
                 </div>

                 {/* Thinking state */}
                 <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2 px-1">
                    <span className="animate-spin duration-3000">↻</span> {hero.chatThinking}
                 </div>
               </div>

               {/* Left sidebar nav icons (overlay on left edge) */}
               <div className="absolute left-0 top-14 bottom-0 w-12 border-r border-border/40 bg-white/50 dark:bg-[#222]/50 backdrop-blur flex flex-col items-center py-4 gap-6 z-10">
                 <div className="size-8 rounded-full bg-[#e8f0d1] flex items-center justify-center">
                    <svg className="size-5" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="4" width="16" height="16" rx="4" fill="#a4c639" transform="rotate(-10 12 12)" />
                      <circle cx="11.5" cy="11.5" r="3.5" fill="#1a1a1a" />
                      <circle cx="11.5" cy="11.5" r="1.5" fill="#a4c639" />
                    </svg>
                 </div>
                 <div className="size-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-black/5 cursor-pointer transition-colors">
                    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                 </div>
                 <div className="size-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-black/5 cursor-pointer transition-colors">
                    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                 </div>
               </div>
               
               {/* Padding for left sidebar */}
               <style dangerouslySetInnerHTML={{__html: `
                 .flex-1.p-4 > div { margin-left: 2.5rem; }
               `}} />
            </div>

            {/* Column 2: Events */}
            <div className="flex-[3] min-h-[280px] md:min-h-0 flex flex-col gap-4">
              <div className="h-[280px] bg-white dark:bg-[#222] border border-border/40 rounded-xl overflow-hidden shadow-sm flex flex-col">
                <div className="h-10 border-b border-border/40 flex items-center px-4 shrink-0 text-sm font-semibold gap-1.5">
                  <span className="text-[16px]">⚡️</span> {hero.eventsTitle}
                </div>
                <div className="p-4 flex flex-col gap-3 text-[13px] text-muted-foreground/80">
                  <div className="flex items-center gap-2">
                    <div className="size-1 rounded-full bg-border" />
                    {hero.events[0]}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="size-1 rounded-full bg-border" />
                    {hero.events[1]}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="size-1 rounded-full bg-border" />
                    {hero.events[2]}
                  </div>
                </div>
              </div>
              <div className="flex-1 bg-white dark:bg-[#222] border border-border/40 rounded-xl overflow-hidden shadow-sm flex flex-col">
                {/* Empty bottom left block based on image */}
              </div>
            </div>

            {/* Column 3: Activity & Memory */}
            <div className="flex-[4] min-h-[200px] md:min-h-0 bg-white dark:bg-[#222] border border-border/40 rounded-xl overflow-hidden shadow-sm flex flex-col relative">
               <div className="h-10 border-b border-border/40 flex items-center px-4 shrink-0 text-[13px] gap-4">
                  <div className="font-semibold text-[#a4c639] h-full flex items-center border-b-2 border-[#a4c639] cursor-pointer">{hero.activityTitle}</div>
                  <div className="text-muted-foreground cursor-pointer hover:text-foreground">{hero.activityMemory}</div>
               </div>
               
               <div className="p-4 flex flex-col gap-3">
                 <div className="border border-border/40 rounded-lg p-3 flex items-start gap-3">
                   <div className="size-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                     <svg className="size-4 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                   </div>
                   <div className="flex flex-col gap-1">
                      <div className="text-[13px] font-medium">{hero.activityItem1}</div>
                      <div className="text-[12px] text-muted-foreground">{hero.activityItem1Desc}</div>
                   </div>
                 </div>
               </div>

               {/* Cute bear coming up from the bottom right */}
               <div className="absolute bottom-[-10px] right-2 transform translate-x-4 pointer-events-none opacity-90 transition-opacity">
                 <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                   {/* This is a simple approximation of the bear ears and head */}
                   <path d="M20 50 C20 30, 40 10, 60 10 C80 10, 100 30, 100 50 L100 90 L20 90 Z" fill="#d8cdba" stroke="#222" strokeWidth="3"/>
                   {/* Left Ear */}
                   <circle cx="30" cy="20" r="15" fill="#d8cdba" stroke="#222" strokeWidth="3" />
                   <circle cx="30" cy="20" r="8" fill="#e8ddd4" stroke="#222" strokeWidth="2" />
                   {/* Right Ear */}
                   <circle cx="90" cy="20" r="15" fill="#d8cdba" stroke="#222" strokeWidth="3" />
                   <circle cx="90" cy="20" r="8" fill="#e8ddd4" stroke="#222" strokeWidth="2" />
                   {/* Head overlay to cover ear bottoms */}
                   <path d="M20 50 C20 20, 100 20, 100 50 L100 90 L20 90 Z" fill="#d8cdba" stroke="#222" strokeWidth="3"/>
                 </svg>
               </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
