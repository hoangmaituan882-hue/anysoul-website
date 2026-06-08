import { cn } from "../lib/utils";
import { MessageSquare, Heart, Share2, Users, Monitor, Bot } from "lucide-react";
import React from "react";
import { FollowCursorCard } from "./FollowCursorCard";
import { useThemeLanguage } from "../contexts/ThemeLanguageContext";

// Mocks
const ScenarioWebCompanion = () => (
    <div className="flex flex-col h-[260px] bg-background border-b border-border overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-2">
            <div className="size-6 bg-primary/20 rounded-full border border-primary/30"></div>
            <div className="text-xs font-semibold text-foreground">Philosophy Daily</div>
        </div>
        <div className="p-4 flex-1">
            <p className="text-xs text-muted-foreground mb-4">"The only true wisdom is in knowing you know nothing." - Socrates</p>
            <div className="flex gap-4 opacity-50 mb-4 scale-75 origin-left text-muted-foreground">
                <MessageSquare className="size-4" />
                <Heart className="size-4" />
                <Share2 className="size-4" />
            </div>
            
            <div className="bg-secondary p-3 rounded-xl border border-border shadow-sm flex gap-3">
               <div className="size-6 rounded-full bg-primary shrink-0 flex items-center justify-center"><Bot className="size-3 text-white" /></div>
               <div className="text-xs text-secondary-foreground">
                  <span className="font-semibold text-primary">AnySoul:</span> That's a classic paradox! Socrates is acknowledging his limits...
               </div>
            </div>
        </div>
    </div>
);

const ScenarioVtuber = () => (
    <div className="flex flex-col h-[260px] bg-[#0e0e10] border-b border-border overflow-hidden relative text-white">
        {/* Stream video area */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 to-black">
            <div className="absolute bottom-4 right-4 size-24 bg-pink-500/20 rounded-lg border border-pink-500/50 flex items-center justify-center backdrop-blur-md">
                <div className="size-16 bg-pink-400 rounded-full animate-[pulse_4s_ease-in-out_infinite] blur-sm"></div>
                <Users className="absolute text-white size-6" />
            </div>
        </div>
        {/* Chat sidebar mock */}
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-[#18181b] border-l border-white/10 p-2 flex flex-col gap-2 opacity-80">
            <div className="text-[8px]"><span className="text-red-400">User123:</span> Hello Miko!</div>
            <div className="text-[8px]"><span className="text-green-400">FanBoy:</span> Love the new outfit.</div>
            <div className="text-[8px] pr-2 bg-white/10 p-1 rounded border border-white/20"><span className="text-yellow-400">$5</span> Miko reacts to this!</div>
        </div>
    </div>
);

const ScenarioGroupChat = ({ title }: { title: string }) => (
    <div className="flex flex-col h-[260px] bg-background border-b border-border overflow-hidden">
        <div className="p-3 bg-secondary border-b border-border text-xs font-semibold text-center text-foreground">
            {title}
        </div>
        <div className="p-4 flex flex-col gap-3 flex-1 overflow-hidden">
            <div className="flex gap-2">
                <div className="size-6 bg-blue-100 rounded-full border border-blue-200"></div>
                <div className="bg-secondary p-2 rounded-lg text-[10px] max-w-[80%] text-foreground">Have you guys finished chapter 3?</div>
            </div>
            <div className="flex gap-2 flex-row-reverse">
                <div className="size-6 bg-green-100 rounded-full border border-green-200"></div>
                <div className="bg-primary text-primary-foreground p-2 rounded-lg text-[10px] max-w-[80%]">Yeah, the ending was crazy.</div>
            </div>
            <div className="flex gap-2">
                <div className="size-6 bg-primary/20 rounded-full border border-primary/30 flex items-center justify-center shrink-0"><Bot className="size-3 text-primary" /></div>
                <div className="bg-secondary p-2 rounded-lg text-[10px] max-w-[80%] text-foreground"><span className="font-semibold text-primary block mb-0.5">AnySoul</span> Absolutely! The plot twist really redefining the protagonist's motivation...</div>
            </div>
        </div>
    </div>
);

const ScenarioDesktopPet = () => (
    <div className="flex flex-col h-[260px] bg-gradient-to-br from-indigo-50/50 to-blue-50/50 border-b border-border overflow-hidden relative">
        {/* Desktop icons */}
        <div className="p-4 flex flex-col gap-4">
            <div className="size-10 bg-white/50 border border-white backdrop-blur-sm rounded-lg flex flex-col items-center justify-center gap-1 shadow-sm">
                <div className="w-4 h-3 bg-blue-400 rounded-sm"></div>
                <div className="w-6 h-1 bg-muted/50 rounded"></div>
            </div>
            <div className="size-10 bg-white/50 border border-white backdrop-blur-sm rounded-lg flex flex-col items-center justify-center gap-1 shadow-sm">
                <Monitor className="size-4 text-slate-400" />
                <div className="w-6 h-1 bg-muted/50 rounded"></div>
            </div>
        </div>
        
        {/* Pet */}
        <div className="absolute bottom-4 right-4 flex items-end gap-2">
            <div className="bg-white/80 backdrop-blur-md px-3 py-2 rounded-2xl rounded-br-sm border border-white shadow-sm text-[10px] text-foreground font-medium mb-4">
                You have 2 unread emails!
            </div>
            <div className="size-12 bg-primary/10 rounded-full border border-primary/30 animate-[bounce_3s_infinite] flex items-center justify-center shadow-[0_0_15px_rgba(134,158,113,0.3)]">
                <Bot className="size-6 text-primary" strokeWidth={1.5} />
            </div>
        </div>
    </div>
);

export function ScenariosMarquee() {
    const { t } = useThemeLanguage();

    const scenarios = [
      {
        title: t("scen.1.t"),
        desc: t("scen.1.d"),
        visual: <ScenarioWebCompanion />
      },
      {
        title: t("scen.2.t"),
        desc: t("scen.2.d"),
        visual: <ScenarioVtuber />
      },
      {
        title: t("scen.3.t"),
        desc: t("scen.3.d"),
        visual: <ScenarioGroupChat title={t("scen.r1")} />
      },
      {
        title: t("scen.4.t"),
        desc: t("scen.4.d"),
        visual: <ScenarioDesktopPet />
      }
    ];

    return (
        <section id="scenarios" className="py-32 md:py-48 overflow-hidden bg-[#fafafa] border-y border-border dark:bg-background">
            <div className="text-center mb-16 px-4">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-foreground">
                    {t("scen.title")}<span className="text-muted-foreground font-normal">{t("scen.title2")}</span>
                </h2>
                <p className="text-muted-foreground text-lg">{t("scen.subtitle")}</p>
            </div>
            
            <div className="relative flex w-full items-center">
                <div 
                    className="flex w-full overflow-hidden group/marquee" 
                    style={{ '--duration': '45s', '--gap': '1.5rem' } as React.CSSProperties}
                >
                    <div className="flex w-max animate-marquee flex-row gap-[var(--gap)] group-hover/marquee:[animation-play-state:paused] py-4 pr-[var(--gap)]">
                        {scenarios.concat(scenarios).map((scen, idx) => (
                            <FollowCursorCard key={idx} className="w-[320px] md:w-[400px] shrink-0">
                                <div className="h-[260px] border-b border-border overflow-hidden relative">
                                    {scen.visual}
                                </div>
                                <div className="p-6 bg-card flex-1">
                                    <h3 className="text-lg font-bold mb-2 text-foreground">{scen.title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{scen.desc}</p>
                                </div>
                            </FollowCursorCard>
                        ))}
                    </div>
                </div>

                {/* Edges mask */}
                <div className="pointer-events-none absolute inset-y-0 left-0 w-12 md:w-32 bg-gradient-to-r from-[#fafafa] dark:from-background to-transparent z-10" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-12 md:w-32 bg-gradient-to-l from-[#fafafa] dark:from-background to-transparent z-10" />
            </div>
        </section>
    )
}
