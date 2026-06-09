import React, { useRef, useState, useEffect } from "react";
import { Play, FileText, Search, Users, Heart, Bot, Tag, List, MessageSquare, Sparkles, Clock, Eye, MessageCircle, ArrowDownUp, GripVertical, ChevronLeft, ChevronRight, X, Star, Zap, Quote, Lightbulb } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

function AccordionSection({ title, icon, defaultOpen = true, children, colorClass, bgClass, headerAddon, className }: any) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className={cn("overflow-hidden border border-border rounded-2xl md:rounded-[2rem] transition-colors", bgClass, className)}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex flex-wrap md:flex-nowrap items-center justify-between p-4 md:p-5 cursor-pointer gap-2"
      >
        <div className={cn("flex items-center gap-2", colorClass)}>
          {icon}
          <h3 className="font-bold text-sm md:text-base text-foreground">{title}</h3>
        </div>
        <div className="flex items-center gap-2 ml-auto">
            {headerAddon && <div onClick={(e) => e.stopPropagation()}>{headerAddon}</div>}
            <div className="w-8 h-8 rounded-full bg-background border border-border/50 flex shrink-0 items-center justify-center text-muted-foreground transition-transform">
               <ChevronRight className={cn("size-4 transition-transform", isOpen ? "-rotate-90" : "rotate-90")} />
            </div>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="px-4 md:px-5 pb-4 md:pb-5 pt-0">
               {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function TranscriptWaveScrollbar({
  scrollRef,
  matchedIndices,
  totalItems,
}: {
  scrollRef: React.RefObject<HTMLDivElement>;
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
      
      const targetTop = ratio * maxScroll;
      
      scrollRef.current.scrollTo({
        top: targetTop,
        behavior: 'smooth'
      });
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    handlePointerMove(e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const ratio = x / rect.width;
    const index = Math.floor(ratio * (barsCount - 1));
    
    setHoverIndex(index);
    updateScroll(ratio);
  };

  const handlePointerLeave = () => {
    setHoverIndex(-1);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        const maxScroll = scrollHeight - clientHeight;
        if (maxScroll <= 0) {
           setProgressIndex(0);
           return;
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
  
  const hasMatches = matchedIndices.length > 3;

  return (
    <div className="w-full mt-2">
      <div 
        ref={trackRef}
        className="flex items-end justify-between w-full h-10 py-1 cursor-pointer touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        {Array.from({ length: barsCount }).map((_, i) => {
          const dist = hoverIndex !== -1 ? Math.abs(hoverIndex - i) : Math.abs(progressIndex - i);
          let h = 8;
          let opacity = 0.3;
          let color = "bg-orange-500";
          let scale = 1;
          
          if (dist === 0) { h = 24; opacity = 1; }
          else if (dist === 1) { h = 18; opacity = 0.8; }
          else if (dist === 2) { h = 12; opacity = 0.6; }
          else if (dist === 3) { h = 10; opacity = 0.4; }

          if (hasMatches && matchSet.has(i)) {
             color = "bg-pink-500";
             opacity = 1;
             scale = 1.3;
             if (h < 12) h = 16;
          }

          return (
            <div key={i} className="flex flex-col justify-end items-center w-full h-full pointer-events-none">
              <div 
                style={{ height: `${h}px`, opacity, transform: `scale(${scale})`, transformOrigin: 'bottom' }}
                className={cn("w-1.5 sm:w-2 rounded-full transition-all duration-300 ease-out", color)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TalkModal({ talk, onClose, t }: { talk: any, onClose: () => void, t: any }) {
  const [searchQuery, setSearchQuery] = useState("");
  const transcriptRef = useRef<HTMLDivElement>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [selectedAnime, setSelectedAnime] = useState<string | null>(null);
  
  // Left panel resize state
  const [leftWidth, setLeftWidth] = useState(40); // percentage 0-100
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const isDragging = useRef(false);

  useEffect(() => {
    if (talk) {
      const dismissed = localStorage.getItem('talkModalDisclaimerDismissed');
      if (!dismissed) {
        setShowDisclaimer(true);
      }
    }
  }, [talk]);

  const transcriptData = talk?.transcript || [
    { time: "00:00", speaker: "主持人：", text: "大家晚上好，欢迎来到本周的杂谈回，今天我们也是请到了两边非常重量级的嘉宾..." },
    { time: "02:15", speaker: "嘉宾1：", text: "哈哈，其实也没有那么夸张啦，不过这季的新番确实有很多值得吐槽的地方。" },
    { time: "05:30", speaker: "主持人：", text: "对，尤其是那部话题作，前几集的制作和后几集简直就像是换了个团队，大家觉得呢？" }
  ];

  const matchedIndices = transcriptData.map((d, i) => (searchQuery && d.text.toLowerCase().includes(searchQuery.toLowerCase())) ? i : -1).filter(i => i !== -1);
  
  useEffect(() => {
    if (matchedIndices.length > 0 && transcriptRef.current) {
        const matches = transcriptRef.current.querySelectorAll('.transcript-item');
        if (matches[matchedIndices[0]]) {
           matches[matchedIndices[0]].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
  }, [searchQuery]);

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return;
    // We only resize on desktop where the flexDirection is row
    if (window.innerWidth < 768) return;

    // The modal's left boundary is required
    const modal = document.getElementById('talk-modal-container');
    if (!modal) return;
    const rect = modal.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(10, Math.min(x / rect.width * 100, 70)); // Limit between 10% and 70% width
    
    // Auto collapse if moved below 20%
    if (percentage < 15) {
      if (!isCollapsed) setIsCollapsed(true);
      setLeftWidth(0);
    } else {
      if (isCollapsed) setIsCollapsed(false);
      setLeftWidth(percentage);
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'auto';
  };

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
  };

  const toggleCollapse = () => {
    if (isCollapsed) {
      setIsCollapsed(false);
      setLeftWidth(40);
    } else {
      setIsCollapsed(true);
      setLeftWidth(0);
    }
  };

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  if (!talk) return null;
  
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" onClick={onClose}>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        />
        
        <motion.div
           id="talk-modal-container"
           initial={{ opacity: 0, y: 50, scale: 0.95 }}
           animate={{ opacity: 1, y: 0, scale: 1 }}
           exit={{ opacity: 0, y: 50, scale: 0.95 }}
           transition={{ type: "spring", duration: 0.5, bounce: 0 }}
           onClick={(e) => e.stopPropagation()}
           className="relative w-full max-w-6xl h-[90vh] sm:h-[85vh] bg-[#fcf8f3] dark:bg-[#2d2822] rounded-[2rem] shadow-2xl flex flex-col md:flex-row overflow-hidden border border-[#f5eade] dark:border-[#3a332a]"
         >
            <AnimatePresence>
              {showDisclaimer && (
                <div className="absolute inset-0 z-[70] flex items-center justify-center p-4 sm:p-6 bg-background/80 backdrop-blur-sm rounded-[2rem] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="relative w-full max-w-sm bg-[#fcf8f3] dark:bg-[#2d2822] border border-[#f5eade] dark:border-[#3a332a] p-6 md:p-8 rounded-[2rem] shadow-xl flex flex-col items-center text-center"
                  >
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-5">
                      <Bot className="size-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">AI 总结体验版</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                      本页面的视频总结、时间轴标注与弹幕精选均为 AI 自动生成，仅供娱乐与回顾参考。可能会出现理解偏差或事实性错误，欢迎反馈指正。
                    </p>
                    <button 
                      onClick={() => {
                        localStorage.setItem('talkModalDisclaimerDismissed', 'true');
                        setShowDisclaimer(false);
                      }}
                      className="w-full py-3.5 bg-foreground text-background rounded-full font-bold text-sm hover:opacity-90 transition-opacity shadow-sm flex items-center justify-center gap-2 group"
                    >
                      <Sparkles className="size-4 text-pink-500 group-hover:scale-110 transition-transform" /> 我已知晓并继续
                    </button>
                  </motion.div>
                </div>
              )}
              
              {selectedAnime && (
                <motion.div
                  initial={{ x: '100%', opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: '100%', opacity: 0 }}
                  transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                  className="absolute inset-0 z-[60] bg-[#fcf8f3] dark:bg-[#2d2822] flex flex-col md:flex-row overflow-hidden rounded-t-[2rem] sm:rounded-[2rem]"
                >
                  {/* Left Panel */}
                  <div className="flex flex-col w-full md:w-[40%] bg-transparent border-r border-[#f5eade] dark:border-[#3a332a] shrink-0 overflow-y-auto">
                      <div className="h-14 md:h-16 border-b border-[#f5eade] dark:border-[#3a332a] flex items-center px-4 shrink-0 bg-background/50 backdrop-blur-sm sticky top-0 z-10">
                         <button onClick={() => setSelectedAnime(null)} className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group">
                             <ChevronLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
                             杂谈回详细 / {selectedAnime}
                         </button>
                      </div>
                      
                      {/* Anime Cover & Info */}
                      <div className="w-full h-40 sm:h-56 md:h-64 overflow-hidden relative shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600 flex flex-col justify-end p-6">
                          <div className="absolute inset-0 bg-black/20" />
                          <h2 className="relative z-10 text-3xl font-black text-white/90 drop-shadow-md tracking-wider">
                            {selectedAnime}
                          </h2>
                          <div className="absolute inset-0 bg-gradient-to-t from-[#fcf8f3] dark:from-[#2d2822] to-transparent pointer-events-none opacity-50" />
                      </div>
                      
                      <div className="p-4 sm:p-6 md:p-8 flex flex-col flex-1">
                           <div className="flex flex-wrap items-center gap-2 mb-3">
                               <span className="inline-flex items-center text-[11px] md:text-[12px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                                 TV 动画
                               </span>
                               <span className="text-xs md:text-sm font-semibold text-muted-foreground">
                                 2024 年 • 12 集
                               </span>
                               <span className="ml-auto flex items-center gap-1 text-yellow-600 dark:text-yellow-500 font-bold text-sm">
                                 <Star className="size-4 fill-current" /> 9.2
                               </span>
                           </div>
                           <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
                              《{selectedAnime}》是一部备受好评的优秀作品，凭借精良的制作和引人深思的剧情赢得了广泛讨论。它不仅拥有出色的画风，对人物情感的刻画也入木三分，值得细细品味。
                           </p>
                           
                           <div className="flex flex-wrap gap-1.5 mt-auto">
                              {["动画", "奇幻", "剧情"].map((tag, idx) => (
                                <span key={idx} className="px-2.5 py-1 bg-muted rounded-md text-[10px] md:text-xs font-medium text-muted-foreground">
                                  {tag}
                                </span>
                              ))}
                           </div>
                      </div>
                  </div>
  
                  {/* Right Panel */}
                  <div className="flex flex-col flex-1 bg-background overflow-hidden relative">
                      <div className="h-14 md:h-16 border-b border-[#f5eade] dark:border-[#3a332a] flex items-center justify-between px-4 md:px-8 bg-background/50 backdrop-blur-sm sticky top-0 z-10 shrink-0">
                         <h3 className="font-bold text-lg">作品详情</h3>
                         <button 
                           onClick={() => setSelectedAnime(null)}
                           className="w-8 h-8 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground flex items-center justify-center transition-colors"
                         >
                           <X className="size-4" />
                         </button>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6">
                          <div className="bg-[#fcf8f3] dark:bg-[#2d2822] p-6 rounded-2xl border border-[#f5eade] dark:border-[#3a332a]">
                             <h4 className="font-bold mb-4 flex items-center gap-2"><FileText className="size-4 text-pink-500" /> 剧情简介</h4>
                             <p className="text-sm text-muted-foreground leading-relaxed">
                               故事围绕着主人公的成长与冒险展开。在一个充满奇幻色彩的世界中，主人公为了实现自己的目标、寻找失去的记忆或是拯救世界而踏上旅途。途中结识了性格各异的伙伴，并在经历了一次又一次的考验与战斗后，逐渐揭开了世界背后的真相。
                             </p>
                          </div>
                          
                          <div className="bg-[#fcf8f3] dark:bg-[#2d2822] p-6 rounded-2xl border border-[#f5eade] dark:border-[#3a332a]">
                             <h4 className="font-bold mb-4 flex items-center gap-2"><Users className="size-4 text-blue-500" /> 制作人员</h4>
                             <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                                 {['原作', '导演', '系列构成', '角色设计', '音乐', '动画制作'].map((role, i) => (
                                   <div key={i} className="flex flex-col">
                                      <span className="text-xs text-muted-foreground mb-1">{role}</span>
                                      <span className="text-sm font-semibold text-foreground">暂无数据</span>
                                   </div>
                                 ))}
                             </div>
                          </div>

                          <div className="bg-[#fcf8f3] dark:bg-[#2d2822] p-6 rounded-2xl border border-[#f5eade] dark:border-[#3a332a]">
                             <h4 className="font-bold mb-4 flex items-center gap-2"><MessageCircle className="size-4 text-green-500" /> 杂谈提及记录</h4>
                             
                             <div className="flex flex-wrap items-center gap-4 mb-6">
                               <div className="flex flex-col">
                                 <span className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider">提及次数</span>
                                 <span className="text-2xl font-black text-foreground">3 <span className="text-sm font-medium text-muted-foreground">次</span></span>
                               </div>
                               <div className="hidden sm:block w-px h-8 bg-border border-r border-[#f5eade] dark:border-[#3a332a]" />
                               <div className="flex flex-col">
                                 <span className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider">最近一次提及</span>
                                 <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-700 dark:text-green-400 rounded-full text-xs font-semibold cursor-pointer hover:bg-green-500/20 transition-colors border border-green-500/20">
                                   <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                   2024 年 5 月 12 日 杂谈回
                                 </div>
                               </div>
                             </div>

                             <div className="relative pl-5 space-y-6 before:absolute before:inset-y-2 before:left-[7px] before:w-[2px] before:bg-muted-foreground/20">
                               {[
                                 { date: "2024 年 5 月 12 日", title: "这季度的动画真是不错呢", desc: "在盘点四月新番时重点提及了该作的制作水平。" },
                                 { date: "2024 年 3 月 8 日", title: "最近看的一些老番推荐", desc: "观众提问环节顺带聊到了这部作品的优秀之处。" },
                                 { date: "2023 年 11 月 20 日", title: "深夜杂谈：那些让人落泪的结局", desc: "借着弹幕的话题，深入探讨了该作的结局设定。" },
                               ].map((record, i) => (
                                 <div key={i} className="relative">
                                   <div className="absolute -left-[26px] top-1.5 w-3 h-3 rounded-full bg-[#fcf8f3] dark:bg-[#2d2822] border-[3px] border-green-500 z-10" />
                                   <div className="flex flex-col">
                                      <span className="text-[10px] sm:text-xs text-muted-foreground font-medium mb-1">{record.date}</span>
                                      <span className="text-sm font-bold text-foreground mb-1 hover:text-pink-500 cursor-pointer transition-colors w-fit">{record.title}</span>
                                      <p className="text-xs sm:text-sm text-muted-foreground/80 leading-relaxed">{record.desc}</p>
                                   </div>
                                 </div>
                               ))}
                             </div>
                          </div>
                      </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          {/* Left / Top Header Info */}
          <div 
            className={cn(
              "flex flex-col shrink-0 border-b md:border-b-0 overflow-y-auto transition-all duration-300 ease-out",
              isCollapsed ? "h-16 md:h-full border-[#f5eade] dark:border-[#3a332a] bg-muted/20" : "h-[45vh] md:h-full bg-transparent"
            )}
            style={{ 
              width: window.innerWidth >= 768 ? (isCollapsed ? '48px' : `${leftWidth}%`) : '100%',
              minWidth: window.innerWidth >= 768 && !isCollapsed ? '250px' : '0'
            }}
          >
             {!isCollapsed ? (
               <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="flex flex-col flex-1 pb-16 md:pb-0 relative">
                  {/* Mobile collapse button */}
                  <div className="md:hidden absolute top-4 left-4 z-20">
                     <button 
                       onClick={toggleCollapse} 
                       className="w-8 h-8 rounded-full bg-background/80 backdrop-blur border border-border flex items-center justify-center text-foreground hover:bg-background transition-colors shadow-sm"
                     >
                       <ChevronLeft className="size-4 rotate-90" />
                     </button>
                  </div>
                  {talk.cover ? (
                    <div className="w-full h-40 sm:h-56 md:h-64 overflow-hidden relative shrink-0">
                       <img src={talk.cover} alt={talk.title} className="w-full h-full object-cover" />
                       <div className="absolute inset-0 bg-gradient-to-t from-[#fcf8f3] dark:from-[#2d2822] to-transparent pointer-events-none" />
                    </div>
                  ) : (
                    <div className="w-full h-28 sm:h-40 md:h-48 overflow-hidden relative shrink-0 bg-gradient-to-br from-muted/50 to-muted">
                       <div className="absolute inset-0 flex items-center justify-center opacity-10">
                         <Play className="size-16 md:size-20" />
                       </div>
                       <div className="absolute inset-0 bg-gradient-to-t from-[#fcf8f3] dark:from-[#2d2822] to-transparent pointer-events-none" />
                    </div>
                  )}
                  
                  <div className="p-4 sm:p-6 md:p-8 flex flex-col flex-1">
                     <div className="flex flex-wrap items-center gap-2 mb-3">
                         <span className={cn(
                            "inline-flex items-center text-[11px] md:text-[12px] font-bold px-2.5 py-0.5 rounded-full",
                            talk.color === "pink" ? "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300" :
                            talk.color === "yellow" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/60 dark:text-yellow-400" :
                            talk.color === "blue" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300" :
                            "bg-green-100 text-green-700 dark:bg-green-900/60 dark:text-green-300"
                         )}>
                           {talk.cat}
                         </span>
                         <span className="text-xs md:text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
                           <Clock className="size-3.5" /> {talk.date} ({talk.min} {t("talks.min" as any)})
                         </span>
                     </div>
                     
                     <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 leading-tight">{talk.title}</h2>
                     
                     <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4 md:mb-6">
                       {talk.desc}
                     </p>

                     <div className="grid grid-cols-3 gap-3 mb-6 bg-muted/30 p-3 md:p-4 rounded-xl md:rounded-2xl border border-border/50">
                       <div className="flex flex-col items-center justify-center text-center">
                         <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-1.5 md:mb-2">
                           <Eye className="size-4 md:size-5" />
                         </div>
                         <span className="text-[10px] md:text-xs text-muted-foreground font-medium mb-0.5">观看人数</span>
                         <span className="text-xs md:text-sm font-bold font-mono">{talk.viewers?.toLocaleString() || '1,245'}</span>
                       </div>
                       <div className="flex flex-col items-center justify-center text-center">
                         <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 flex items-center justify-center mb-1.5 md:mb-2">
                           <MessageCircle className="size-4 md:size-5" />
                         </div>
                         <span className="text-[10px] md:text-xs text-muted-foreground font-medium mb-0.5">互动弹幕</span>
                         <span className="text-xs md:text-sm font-bold font-mono">{talk.danmaku?.toLocaleString() || '856'}</span>
                       </div>
                       <div className="flex flex-col items-center justify-center text-center">
                         <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-1.5 md:mb-2">
                           <Tag className="size-4 md:size-5" />
                         </div>
                         <span className="text-[10px] md:text-xs text-muted-foreground font-medium mb-0.5">动画提及</span>
                         <span className="text-xs md:text-sm font-bold font-mono">{talk.animeMentions || '5'}部</span>
                       </div>
                     </div>
                     
                     {talk.imgs && talk.imgs.length > 0 && (
                        <div className="mb-4 md:mb-6 mt-auto">
                          <h3 className="text-xs md:text-sm font-bold text-foreground mb-2 flex items-center gap-1.5">
                            <Users className="size-3.5" /> 参与嘉宾
                          </h3>
                          <div className="flex flex-wrap gap-2">
                             {talk.imgs.map((img: string, idx: number) => (
                               <div key={idx} className="flex items-center gap-1.5 bg-background/50 border border-[#f5eade] dark:border-[#3a332a] p-1 md:p-1.5 pr-2 md:pr-3 rounded-full">
                                 <div className="w-6 h-6 md:w-8 md:h-8 rounded-full border border-[#fcf8f3] dark:border-[#2d2822] overflow-hidden bg-muted">
                                   <img src={img} className="w-full h-full object-cover" />
                                 </div>
                                 <span className="text-[10px] md:text-xs font-bold">嘉宾 {idx + 1}</span>
                               </div>
                             ))}
                          </div>
                        </div>
                     )}
                     
                     <div className="flex gap-2.5 pt-3 md:pt-4">
                       <a 
                         href={talk.biliUrl || "https://t.bilibili.com/"}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="flex-1 bg-[#fb7299] hover:bg-[#fc8bab] text-white py-2.5 md:py-3 rounded-xl font-bold text-xs sm:text-sm md:text-base flex items-center justify-center gap-1.5 md:gap-2 transition-colors shadow-sm"
                       >
                         <Play className="size-4 md:size-5" fill="currentColor" /> 前往 Bilibili 观看录播
                       </a>
                       <button 
                          onClick={() => {
                            setIsFavorited(!isFavorited);
                            setToastMsg(!isFavorited ? "收藏成功" : "已取消收藏");
                            setTimeout(() => setToastMsg(null), 2000);
                          }}
                          className="w-10 h-10 md:w-12 md:h-12 bg-background border border-[#f5eade] dark:border-[#3a332a] rounded-xl flex items-center justify-center hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors shrink-0 group relative"
                       >
                          <Heart className={cn("size-4 md:size-5 transition-colors", isFavorited ? "text-pink-500" : "text-muted-foreground group-hover:text-pink-500")} fill={isFavorited ? "currentColor" : "none"} />
                          <AnimatePresence>
                             {toastMsg && (
                                <motion.div 
                                  initial={{ opacity: 0, y: 10 }} 
                                  animate={{ opacity: 1, y: 0 }} 
                                  exit={{ opacity: 0, y: -10 }} 
                                  className="absolute -top-10 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs font-bold px-3 py-1.5 rounded whitespace-nowrap shadow-md pointer-events-none z-50"
                                >
                                  {toastMsg}
                                </motion.div>
                             )}
                          </AnimatePresence>
                       </button>
                     </div>
                  </div>
               </motion.div>
             ) : (
                <div className="h-full w-full flex md:flex-col items-center justify-between md:justify-start pt-0 md:pt-6 px-4 md:px-0 bg-muted/10 h-full">
                   <div className="hidden md:flex flex-col items-center gap-4">
                     <button onClick={toggleCollapse} className="w-8 h-8 flex items-center justify-center rounded-full bg-background border border-border shadow-sm hover:bg-muted transition-colors">
                       <ChevronRight className="size-4" />
                     </button>
                     <div className="[writing-mode:vertical-lr] text-sm font-bold text-muted-foreground tracking-widest mt-4">
                        视频详情
                     </div>
                   </div>
                   <div className="flex md:hidden items-center justify-between w-full">
                      <span className="text-sm font-bold flex items-center gap-2">
                        <Play className="size-4 text-blue-500" fill="currentColor" />
                        视频详情已收起
                      </span>
                      <button onClick={toggleCollapse} className="px-3 py-1 bg-foreground text-background rounded-full text-xs font-bold">
                        展开
                      </button>
                   </div>
                </div>
             )}
             
             {/* Mobile bottom absolute expand button when collapsed is not completely hidden, it acts as a thin bar, but on mobile it's an inline header. */}
          </div>

          {/* Resizer Handle (Desktop Only) */}
          <div 
             className="hidden md:flex w-2 relative flex-col items-center justify-center shrink-0 cursor-col-resize hover:bg-black/5 dark:hover:bg-white/5 transition-colors group z-10 border-r border-border/40"
             onMouseDown={startResize}
          >
             <div className="h-12 w-1 bg-muted-foreground/30 rounded-full group-hover:bg-pink-400 transition-colors" />
             <button 
               onClick={(e) => { e.stopPropagation(); toggleCollapse(); }}
               className="absolute top-1/2 -translate-y-1/2 -left-3.5 w-8 h-8 bg-background border hover:border-pink-200 dark:hover:border-pink-900/50 border-border rounded-full flex items-center justify-center shadow-md opacity-100 transition-all hover:scale-110 hover:text-pink-500 z-20"
             >
               {isCollapsed ? <ChevronRight className="size-4 ml-0.5" /> : <ChevronLeft className="size-4 mr-0.5" />}
             </button>
          </div>

          {/* Right AI Info */}
          <div 
             className="flex-1 p-4 sm:p-6 md:p-8 bg-background overflow-y-auto relative shrink-0 md:shrink"
             style={{ 
               width: window.innerWidth >= 768 ? (isCollapsed ? 'calc(100% - 48px)' : `${100 - leftWidth}%`) : '100%',
               minWidth: window.innerWidth >= 768 ? '30%' : '100%'
             }}
          >
             <button 
               onClick={onClose}
               className="absolute top-4 right-4 sm:top-6 sm:right-6 w-8 h-8 sm:w-10 sm:h-10 bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground rounded-full flex items-center justify-center transition-colors shadow-sm z-20"
             >
               <X className="size-4 sm:size-5" />
             </button>

             <div className="space-y-6 md:space-y-8 mt-6 sm:mt-0 relative max-w-3xl mx-auto">
               
               {/* 直播概要 */}
               <AccordionSection 
                 title="直播概要" 
                 icon={<Sparkles className="size-4 md:size-5" />}
                 colorClass="text-indigo-700 dark:text-indigo-400"
                 bgClass="bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/50 relative"
                 defaultOpen={true}
               >
                 <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
                 <div className="space-y-2.5 md:space-y-3 relative">
                   <p className="text-xs md:text-sm leading-relaxed text-indigo-950/80 dark:text-indigo-200/80">
                     {talk.summaryText || "本次直播深入探讨了当季热门动画的表现，并结合弹幕互动分享了许多幕后趣闻和主观评测。"}
                   </p>
                   {talk.summaryBullets && talk.summaryBullets.length > 0 && (
                     <ul className="text-xs md:text-sm space-y-1.5 md:space-y-2 text-indigo-950/80 dark:text-indigo-200/80 list-disc pl-4">
                       {talk.summaryBullets.map((bullet: string, i: number) => (
                         <li key={i}>{bullet}</li>
                       ))}
                     </ul>
                   )}
                 </div>
               </AccordionSection>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                 {/* 高光时刻速览 */}
                 <AccordionSection 
                   title="高光时刻速览" 
                   icon={<Zap className="size-4 md:size-5" />}
                   colorClass="text-orange-500"
                   bgClass="bg-muted/30"
                   defaultOpen={true}
                 >
                   <ul className="space-y-3 text-xs md:text-sm text-muted-foreground">
                     <li className="flex gap-2.5 items-start cursor-pointer hover:text-foreground transition-colors group">
                       <span className="text-orange-500 font-mono font-bold bg-orange-500/10 px-1.5 py-0.5 rounded text-[10px] mt-0.5 group-hover:bg-orange-500/20">15:20</span> 
                       <span className="leading-relaxed">主播激情吐槽作画崩坏瞬间</span>
                     </li>
                     <li className="flex gap-2.5 items-start cursor-pointer hover:text-foreground transition-colors group">
                       <span className="text-orange-500 font-mono font-bold bg-orange-500/10 px-1.5 py-0.5 rounded text-[10px] mt-0.5 group-hover:bg-orange-500/20">42:10</span> 
                       <span className="leading-relaxed">神仙弹幕引发全场爆笑</span>
                     </li>
                     <li className="flex gap-2.5 items-start cursor-pointer hover:text-foreground transition-colors group">
                       <span className="text-orange-500 font-mono font-bold bg-orange-500/10 px-1.5 py-0.5 rounded text-[10px] mt-0.5 group-hover:bg-orange-500/20">01:15:30</span> 
                       <span className="leading-relaxed">深度解析隐藏剧情线索与伏笔</span>
                     </li>
                   </ul>
                 </AccordionSection>

                 {/* 详细内容回顾 */}
                 <AccordionSection 
                   title="详细内容回顾" 
                   icon={<List className="size-4 md:size-5" />}
                   colorClass="text-blue-500"
                   bgClass="bg-muted/30"
                   defaultOpen={true}
                 >
                   <ul className="space-y-2 text-xs md:text-sm text-muted-foreground list-disc pl-4 marker:text-blue-500">
                     <li>开场闲聊与近期观影状态分享</li>
                     <li>热门新番前三集观感及评分盲猜</li>
                     <li>老番回顾：那些被埋没的冷门神作</li>
                     <li>观众提问环节解答</li>
                     <li>下期杂谈主题投票与预告</li>
                   </ul>
                 </AccordionSection>

                 {/* 精彩语录 */}
                 <AccordionSection 
                   title="精彩语录" 
                   icon={<Quote className="size-4 md:size-5" />}
                   colorClass="text-rose-500"
                   bgClass="bg-rose-50/50 dark:bg-rose-950/10 border-rose-100 dark:border-rose-900/50"
                   defaultOpen={true}
                 >
                   <div className="space-y-4">
                     <p className="text-xs md:text-sm text-rose-700/80 dark:text-rose-300 italic leading-relaxed relative">
                       <span className="text-2xl text-rose-300 dark:text-rose-700 absolute -top-1.5 -left-1 opacity-50 font-serif">"</span>
                       &nbsp;&nbsp;&nbsp;真正打动人心的从来不是华丽的特效，而是角色在那一瞬间闪耀的人性光辉啊。这才是本作最大的魅力所在！
                     </p>
                   </div>
                 </AccordionSection>
               </div>

               {/* 观看建议 */}
               <AccordionSection 
                 title="观看建议" 
                 icon={<Lightbulb className="size-4 md:size-5" />}
                 colorClass="text-yellow-600 dark:text-yellow-500"
                 bgClass="bg-[#fcf8f3] dark:bg-[#2d2822] border-[#f5eade] dark:border-[#3a332a]"
                 defaultOpen={true}
               >
                 <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                   本次杂谈部分内容包含严重剧透，建议先补完相关作品全集后再来观看本期回放。此外，由于后半段包含隐晦的神展开讨论，建议佩戴耳机获得最佳食用体验。祝大家观影愉快！
                 </p>
               </AccordionSection>

               {/* Video Transcript */}
               <AccordionSection 
                 title="视频文字稿" 
                 icon={<FileText className="size-4 md:size-5" />}
                 colorClass="text-orange-500"
                 bgClass="bg-muted/30"
                 defaultOpen={true}
                 headerAddon={
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="搜索逐字稿..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 pr-3 py-1.5 bg-background border border-border rounded-full text-xs outline-none focus:ring-2 focus:ring-orange-500/50 transition-all w-32 focus:w-48 placeholder:text-muted-foreground/60"
                      />
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                    </div>
                 }
               >
                 <div className="relative">
                   <div ref={transcriptRef} className="bg-background/80 border border-border p-3 md:p-4 rounded-2xl md:rounded-3xl max-h-[300px] md:max-h-[400px] overflow-y-auto text-xs md:text-sm text-muted-foreground leading-relaxed space-y-2 md:space-y-3" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                      {transcriptData.map((item, idx) => {
                        const isMatch = matchedIndices.includes(idx);
                        return (
                          <p key={idx} className={cn("transcript-item transition-colors", isMatch && "bg-orange-500/20 text-foreground p-1 rounded")}>
                            <span className="font-bold text-foreground mr-1.5">{item.time} {item.speaker}</span>
                            {searchQuery && isMatch ? (
                              <span>
                                {item.text.split(new RegExp(`(${searchQuery})`, 'gi')).map((part, i) => 
                                  part.toLowerCase() === searchQuery.toLowerCase() ? <mark key={i} className="bg-orange-500/40 text-foreground">{part}</mark> : part
                                )}
                              </span>
                            ) : item.text}
                          </p>
                        );
                      })}
                   </div>
                   <TranscriptWaveScrollbar scrollRef={transcriptRef} matchedIndices={matchedIndices} totalItems={transcriptData.length} />
                 </div>
               </AccordionSection>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                 {/* Mentioned Animes */}
                 <AccordionSection 
                   title="提到的话题 / 作品" 
                   icon={<Tag className="size-4 md:size-5" />}
                   colorClass="text-pink-500"
                   bgClass="bg-[#fcf8f3] dark:bg-[#2d2822] border-[#f5eade] dark:border-[#3a332a]"
                   defaultOpen={true}
                 >
                   <div className="flex flex-wrap gap-1.5 md:gap-2 mt-2">
                     {(talk.animes || ["暂无话题"]).map((anime: string, i: number) => (
                       <div 
                         key={i} 
                         onClick={() => anime !== "暂无话题" && setSelectedAnime(anime)}
                         className="inline-flex items-center gap-1 md:gap-1.5 px-2.5 py-1 md:px-3 md:py-1.5 bg-background border border-border rounded-full text-[11px] md:text-sm font-medium hover:bg-muted/80 cursor-pointer transition-colors"
                       >
                         <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-pink-500" />
                         {anime}
                       </div>
                     ))}
                   </div>
                 </AccordionSection>

                 {/* Segment Highlights */}
                 <AccordionSection 
                   title="时间轴高光点" 
                   icon={<List className="size-4 md:size-5" />}
                   colorClass="text-blue-500"
                   bgClass="bg-muted/30"
                   defaultOpen={true}
                 >
                   <div className="space-y-2 md:space-y-4 mt-2 max-h-[146px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border">
                     {(talk.highlights || []).map((highlight: any, i: number) => (
                       <div key={i} className="flex gap-2.5 md:gap-4 group cursor-pointer">
                         <div className="w-12 md:w-16 shrink-0 py-0.5 md:py-1 font-mono text-xs md:text-sm font-bold text-blue-600 dark:text-blue-400">
                           {highlight.time}
                         </div>
                         <div className="flex-1 bg-background p-2.5 md:p-3 rounded-2xl group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 border border-border group-hover:border-blue-200 dark:group-hover:border-blue-800 transition-colors">
                           <p className="text-xs md:text-sm font-medium">{highlight.desc}</p>
                         </div>
                       </div>
                     ))}
                   </div>
                 </AccordionSection>
               </div>
               
               {/* Comments Snippets */}
               <AccordionSection 
                 title="精选弹幕与留言" 
                 icon={<MessageSquare className="size-4 md:size-5" />}
                 colorClass="text-green-500"
                 bgClass="bg-muted/30"
                 defaultOpen={true}
               >
                 <div className="grid gap-2 md:gap-3 mt-2">
                   {(talk.comments || []).map((comment: string, i: number) => (
                     <div key={i} className="flex gap-2.5 md:gap-3 items-start">
                       <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-background border border-border shrink-0 flex items-center justify-center text-[10px] md:text-xs font-bold text-muted-foreground">
                         观众
                       </div>
                       <div className="bg-background border border-border p-2.5 md:p-3 rounded-xl md:rounded-2xl rounded-tl-none text-xs md:text-sm leading-relaxed">
                         {comment}
                       </div>
                     </div>
                   ))}
                 </div>
               </AccordionSection>
               
             </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
