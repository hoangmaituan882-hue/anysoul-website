import ArrowRight from "./icons/right-chevron";

import { motion, useScroll, useTransform } from "motion/react";
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
  
  const { scrollY } = useScroll();
  const bgOpacity = useTransform(scrollY, [0, 150], [0, 1]);
  
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
      {/* Scroll-triggered Background Image */}
      <motion.div 
        className="absolute inset-0 z-0 overflow-hidden rounded-[2rem] md:rounded-[3rem]"
        style={{ opacity: bgOpacity }}
      >
        <div className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center bg-fixed" />
        <div className="absolute inset-0 bg-background/60 dark:bg-background/80" />
      </motion.div>

      <div className="relative z-10 flex flex-col items-center text-center w-full max-w-4xl mx-auto space-y-4 mt-8 mb-20">
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 2.8, ease: "easeOut" }}
          className="relative z-20 mt-12 mb-2"
        >
          <a
            href="#screenings"
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
          className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-tight relative z-10 whitespace-nowrap"
          initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.6, delay: 2.2, ease: "easeOut" }}
        >
          {hero.titlePrefix}
        </motion.h1>

        <div className="relative flex justify-center items-center -mt-2 md:-mt-6 w-full h-[80px] md:h-[110px]">
          {/* Cursive Background Text */}
          <motion.div 
            className="absolute -z-10 h-full w-[min(92vw,620px)] flex items-center justify-center pointer-events-none opacity-80 mix-blend-multiply dark:mix-blend-screen md:w-[900px]"
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
            <svg viewBox="0 0 900 400" className="w-full max-w-none md:w-[110%] h-auto" strokeLinecap="round" strokeLinejoin="round" fill="none">
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
            className="text-[clamp(1.75rem,8.5vw,3rem)] sm:text-5xl md:text-7xl font-bold tracking-tight z-10 drop-shadow-sm whitespace-nowrap"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 2.4, ease: "easeOut" }}
          >
            <span className="text-[#a4c639]">{hero.highlight1}</span>
            <span className="text-[#ea4c89]">{hero.highlight2}</span>
          </motion.h2>
        </div>

        <motion.p 
          className="text-lg md:text-xl text-foreground font-medium pt-2 pb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 2.6, ease: "easeOut" }}
        >
          {hero.subtitle}
        </motion.p>
      </div>
    </section>
  );
}
