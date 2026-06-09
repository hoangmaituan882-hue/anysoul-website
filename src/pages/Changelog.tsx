import { useRef, useState } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Sparkles, X } from "lucide-react";
import { cn } from "../lib/utils";
import { changelogRoadmap, changelogUpdates, type GeneratedChangelogItem, type GeneratedRoadmapNode } from "../generated/changelog";

export function Changelog() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedCards, setSelectedCards] = useState<GeneratedRoadmapNode["cards"] | null>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      const targetScroll = scrollContainerRef.current.scrollLeft + (direction === "left" ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: targetScroll,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="py-20 md:py-32 w-full overflow-x-hidden relative">
      {/* Modal for viewing all features */}
      {selectedCards && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={() => setSelectedCards(null)}>
          <div className="bg-background border border-border rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">{selectedCards.length} 项更新</h3>
              <button onClick={() => setSelectedCards(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              {selectedCards.map((card, idx) => (
                <div key={idx} className="bg-card border border-border rounded-xl p-4 flex flex-col gap-2">
                  <span className="inline-flex w-fit items-center gap-1 text-[11px] font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full">
                     <Sparkles className="w-3 h-3" />
                     {card.type}
                  </span>
                  <h4 className="text-sm font-semibold text-foreground">{card.title}</h4>
                  {card.description && <p className="text-xs text-muted-foreground leading-relaxed">{card.description}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">更新路线图</h1>
          <p className="text-lg text-muted-foreground">基于 AnySoul 仓库提交历史自动生成的真实更新记录。</p>
        </div>

        {/* Roadmap Visualization */}
        <div className="relative w-full mb-32 group/roadmap">
          {/* Scroll Buttons */}
          <button 
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center bg-background/80 hover:bg-background border border-border rounded-full shadow-sm backdrop-blur transition-all disabled:opacity-0"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          
          <button 
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center bg-background/80 hover:bg-background border border-border rounded-full shadow-sm backdrop-blur transition-all disabled:opacity-0"
          >
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>

          {/* Scroll Container */}
          <div 
            ref={scrollContainerRef}
            className="relative flex items-center overflow-hidden scroll-smooth py-[420px] px-12"
          >
            {/* Horizontal Line */}
            <div className="absolute top-1/2 left-0 right-0 h-px bg-border/80 -translate-y-1/2 z-0 min-w-[150vw]" />

            <div className="flex gap-40 items-center relative z-10 w-max min-w-full justify-between">
              {changelogRoadmap.map((node, idx) => (
                <div key={idx} className="relative flex flex-col items-center shrink-0 w-8">
                  {/* Cards Container (Top) */}
                  {node.cardsPosition === "top" && (
                    <div className="absolute bottom-[36px] flex flex-col gap-3 items-center w-[280px]">
                      {/* Connector Line */}
                      <div className="absolute -bottom-[20px] w-px h-[20px] bg-border/50" />
                      
                      {node.cards.slice(0, 3).map((card, cIndex) => (
                        <div key={cIndex} className="w-full bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full">
                              <Sparkles className="w-3 h-3" />
                              {card.type}
                            </span>
                          </div>
                          <h4 className="text-sm font-semibold text-foreground">{card.title}</h4>
                          {card.description && (
                            <p className="text-xs text-muted-foreground leading-relaxed">{card.description}</p>
                          )}
                        </div>
                      ))}
                      
                      {node.cards.length > 3 && (
                        <button 
                          onClick={() => setSelectedCards(node.cards)}
                          className="w-full mt-1 py-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground border border-dashed border-border rounded-lg transition-colors flex items-center justify-center gap-1"
                        >
                          查看全部 {node.cards.length} 项
                        </button>
                      )}
                    </div>
                  )}

                  {/* Node */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10">
                      <div className="w-6 h-6 rounded-full bg-background flex items-center justify-center shadow-sm">
                        <div className={cn("w-3 h-3 rounded-full", node.status === "published" ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-600")} />
                      </div>
                    </div>
                    
                    <div className="absolute top-[40px] flex flex-col items-center whitespace-nowrap z-20">
                      <span className="text-lg font-bold text-foreground mb-1.5">{node.version}</span>
                      <span className="text-[13px] text-muted-foreground mb-3">{node.subtitle}</span>
                      <span className="text-xs font-medium text-foreground/70 px-4 py-1.5 bg-background rounded-full border border-border/80 shadow-sm">
                        {node.statusText}
                      </span>
                    </div>
                  </div>

                  {/* Cards Container (Bottom) */}
                  {node.cardsPosition === "bottom" && (
                    <div className="absolute top-[148px] flex flex-col gap-3 items-center w-[280px]">
                      {/* Connector Line */}
                      <div className="absolute -top-[20px] w-px h-[20px] bg-border/50" />
                      
                      {node.cards.slice(0, 3).map((card, cIndex) => (
                        <div key={cIndex} className="w-full bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-2 relative z-10">
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full">
                              <Sparkles className="w-3 h-3" />
                              {card.type}
                            </span>
                          </div>
                          <h4 className="text-sm font-semibold text-foreground">{card.title}</h4>
                          {card.description && (
                            <p className="text-xs text-muted-foreground leading-relaxed">{card.description}</p>
                          )}
                        </div>
                      ))}
                      
                      {node.cards.length > 3 && (
                        <button 
                          onClick={() => setSelectedCards(node.cards)}
                          className="w-full mt-1 py-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground border border-dashed border-border rounded-lg transition-colors flex items-center justify-center gap-1 z-10"
                        >
                          查看全部 {node.cards.length} 项
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 w-full">
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">更新日志</h2>
          <p className="text-lg text-muted-foreground">查看 AnySoul 最新的真实提交、改进和修复。</p>
        </div>

        <div className="space-y-16">
        {changelogUpdates.map((update, idx) => (
          <motion.div 
            key={update.hash}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="flex flex-col md:flex-row gap-6 md:gap-12 relative"
          >
            {/* Timeline line */}
            <div className="hidden md:block absolute left-[140px] top-6 bottom-[-64px] w-px bg-border" />
            
            <div className="md:w-[140px] shrink-0 pt-1 relative">
              <time className="block text-sm font-medium text-muted-foreground mb-2">{update.date}</time>
              <div className="inline-flex items-center justify-center rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground relative z-10 w-fit">
                {update.version}
              </div>
            </div>

            <div className="flex-1 pb-4">
              <h2 className="text-2xl font-bold tracking-tight text-foreground break-words mb-3">
                {update.version} - {update.title}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {update.description}
              </p>

              <div className="space-y-4">
                {update.items.map((item: GeneratedChangelogItem, i: number) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className={cn(
                      "inline-flex h-6 shrink-0 items-center rounded-full border px-2 text-[11px] font-medium mt-0.5",
                      item.color, "border-transparent"
                    )}>
                      {item.type}
                    </span>
                    <span className="text-sm font-medium text-foreground leading-relaxed">
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      </div>
    </div>
  );
}
