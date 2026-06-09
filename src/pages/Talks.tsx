import React, { useRef, useState, useEffect, useMemo } from "react";
import { useThemeLanguage } from "../contexts/ThemeLanguageContext";
import { Play, FileText, ArrowUpRight, Search, FileDown, Plus, Calendar, Folder, Archive, X, Clock, Users, Heart, Bot, Tag, List, MessageSquare, Sparkles, Filter, Eye, MessageCircle, ArrowDownUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import { TalkModal } from "../components/TalkModal";
import { TopicsModal } from "../components/TopicsModal";

function WaveScrollbar({ scrollRef, schedules }: { scrollRef: React.RefObject<HTMLDivElement>, schedules?: any[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number>(-1);
  const [progressIndex, setProgressIndex] = useState(0);
  const barsCount = 40;

  const updateScroll = (ratio: number) => {
    if (scrollRef.current) {
      const maxScroll = scrollRef.current.scrollWidth - scrollRef.current.clientWidth;
      if (maxScroll <= 0) return;
      
      const targetLeft = ratio * maxScroll;
      
      // Use smooth scrolling
      scrollRef.current.scrollTo({
        left: targetLeft,
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
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        const maxScroll = scrollWidth - clientWidth;
        if (maxScroll <= 0) {
           setProgressIndex(0);
           return;
        }
        const ratio = scrollLeft / maxScroll;
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

  return (
    <div className="w-full mt-2">
      <div 
        ref={trackRef}
        className="flex items-end justify-between w-full h-12 py-2 cursor-pointer touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        {Array.from({ length: barsCount }).map((_, i) => {
          const dist = hoverIndex !== -1 ? Math.abs(hoverIndex - i) : Math.abs(progressIndex - i);
          let h = 8;
          let opacity = 0.3;
          
          if (dist === 0) { h = 32; opacity = 1; }
          else if (dist === 1) { h = 24; opacity = 0.8; }
          else if (dist === 2) { h = 16; opacity = 0.6; }
          else if (dist === 3) { h = 12; opacity = 0.4; }

          return (
            <div key={i} className="flex flex-col justify-end items-center w-full h-full pointer-events-none">
              <div 
                style={{ height: `${h}px`, opacity }}
                className="w-1.5 sm:w-2 bg-[#a4c639] rounded-full transition-all duration-300 ease-out"
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between items-center px-1 mt-1 text-[10px] md:text-xs font-medium text-muted-foreground/60 font-mono">
        {schedules && schedules.length > 0 ? (
           <>
             <span>{schedules[0]?.date || '2026.06.06'}</span>
             <span>{schedules[Math.floor(schedules.length / 2)]?.date || '2026.03.21'}</span>
             <span>{schedules[schedules.length - 1]?.date || '2026.01.03'}</span>
           </>
        ) : (
           <>
             <span>2026.06.06</span>
             <span>2026.03.21</span>
             <span>2026.01.03</span>
           </>
        )}
      </div>
    </div>
  );
}



export function Talks() {
  const { t } = useThemeLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedTalk, setSelectedTalk] = useState<any | null>(null);
  const [showAllArchive, setShowAllArchive] = useState(false);
  const [showTopicsModal, setShowTopicsModal] = useState(false);
  const [activeTopicId, setActiveTopicId] = useState<string | undefined>(undefined);
  const [archiveSortBy, setArchiveSortBy] = useState<'dateDesc' | 'dateAsc' | 'mentions' | 'viewers' | 'danmaku'>('dateDesc');
  const [archiveFilter, setArchiveFilter] = useState<string>('全部');

  useEffect(() => {
    if (showAllArchive) {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  }, [showAllArchive, archiveFilter]);

  const archiveData = useMemo(() => {
    return Array.from({ length: 48 }).map((_, i) => {
      const year = 2026 - Math.floor(i / 15);
      const month = Math.floor(Math.random() * 12) + 1;
      const day = Math.floor(Math.random() * 28) + 1;
      const d = new Date(year, month - 1, day);
      const timestamp = d.getTime();
      const hasAiSummary = Math.random() > 0.4;
      const cat = ["杂谈", "特殊", "精选"][i % 3];
      const isLiked = Math.random() > 0.7; // add mock liked status
      return {
        id: i,
        timestamp,
        date: `${year}.${month.toString().padStart(2, '0')}.${day.toString().padStart(2, '0')}`,
        day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()],
        cat,
        isLiked,
        title: `过往杂谈回 - 第 ${100 - i} 期`,
        desc: "这是过去的一期精彩回顾录像，点击查看详细的 AI 总结与时间轴高光点以及精华弹幕。",
        min: Math.floor(Math.random() * 60 + 60),
        color: ["pink", "yellow", "blue"][i % 3],
        cover: `https://images.unsplash.com/photo-${1605810230434 - i * 1000}?auto=format&fit=crop&w=500&q=60&sig=${i}`,
        imgs: [
          "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=100&h=100&fit=crop"
        ],
        hasAiSummary,
        viewers: Math.floor(Math.random() * 8000 + 1000),
        danmaku: Math.floor(Math.random() * 5000 + 500),
        animeMentions: Math.floor(Math.random() * 15 + 1),
        summaryText: "本次杂谈主要回顾了近期的业界动态，主持人与嘉宾深入探讨了新番的制作质量和叙事节奏。讨论了各种热门话题与未来的看点。",
        summaryBullets: [
          "前30分钟：开场白与近期生活琐事分享",
          "30-60分钟：霸权候补动画的优缺点分析",
          "最后阶段：观众QA问答互动与下放企划预告"
        ],
        transcript: [
          { time: "00:00", speaker: "主持人：", text: `这是第 ${100 - i} 期的开场白，欢迎大家的到来。` },
          { time: "05:30", speaker: "嘉宾1：", text: "这一期的内容非常有趣，我有很多想跟观众分享的。" },
          { time: "15:10", speaker: "主持人：", text: "没错，请大家多多发弹幕和我们互动！" }
        ],
        animes: ["葬送的芙莉莲", "咒术回战", "迷宫饭", "绝区零"].slice(0, Math.floor(Math.random() * 4 + 1)),
        highlights: [
          { time: "12:45", desc: "嘉宾犀利吐槽主角的降智行为，弹幕沸腾。" },
          { time: "34:20", desc: "关于经费都去哪了的深度行业探讨。" }
        ],
        comments: [
          "深有同感！前面的确有点拖沓，但后面真的很神！",
          "嘉宾太敢说了，这真的是可以免费听的吗哈哈哈哈",
          "这一期学到了很多东西！"
        ]
      };
    });
  }, []);

  const filteredArchiveData = useMemo(() => {
    let list = archiveData;
    if (archiveFilter !== '全部') {
      if (archiveFilter === 'AI总结') list = list.filter(item => item.hasAiSummary);
      else if (archiveFilter === '精选系列') list = list.filter(item => item.cat === '精选');
      else if (archiveFilter === '特殊回') list = list.filter(item => item.cat === '特殊');
      else if (archiveFilter === 'liked') list = list.filter(item => item.isLiked);
      else if (archiveFilter === 'history') list = list.filter(item => parseInt(item.date.substring(0, 4)) <= 2024);
      else list = list.filter(item => item.date.startsWith(archiveFilter));
    }

    return [...list].sort((a, b) => {
      if (archiveSortBy === 'dateDesc') return b.timestamp - a.timestamp;
      if (archiveSortBy === 'dateAsc') return a.timestamp - b.timestamp;
      if (archiveSortBy === 'mentions') return b.animeMentions - a.animeMentions;
      if (archiveSortBy === 'viewers') return b.viewers - a.viewers;
      if (archiveSortBy === 'danmaku') return b.danmaku - a.danmaku;
      return 0;
    });
  }, [archiveData, archiveFilter, archiveSortBy]);

  const latestYearTalks = useMemo(() => {
    return [...archiveData]
      .filter(item => item.date.startsWith("2026"))
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [archiveData]);

  const topTalks = useMemo(() => {
    return [...latestYearTalks].sort((a, b) => b.viewers - a.viewers).slice(0, 3);
  }, [latestYearTalks]);

  const liveTalkData = latestYearTalks[0] || archiveData[0];
  const schedules = latestYearTalks.slice(1);

  if (showAllArchive) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12 animate-in fade-in duration-700 bg-background text-foreground">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
          <div className="flex items-center gap-4 shrink-0">
            <button 
              onClick={() => setShowAllArchive(false)}
              className="w-10 h-10 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors"
            >
              <ArrowUpRight className="size-5 transform rotate-[-135deg]" />
            </button>
            <h1 className="text-2xl md:text-3xl font-bold">{t("talks.archive" as any)}</h1>
          </div>

          <div className="flex flex-col gap-3 overflow-x-auto pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
             <div className="flex items-center gap-2">
               <button onClick={() => setArchiveFilter('全部')} className={cn("flex items-center gap-1.5 px-4 py-2 font-bold text-sm rounded-full shrink-0 transition-colors", archiveFilter === '全部' ? "bg-foreground text-background shadow-sm" : "bg-[#fcf8f3] dark:bg-[#2d2822] border border-[#f5eade] dark:border-[#3a332a] text-muted-foreground hover:text-foreground")}>
                 <Filter className="size-4" /> 全部 {archiveData.length}
               </button>
               {[{label: "2026", filterValue: "2026"}, {label: "2025", filterValue: "2025"}, {label: "我喜欢的", filterValue: "liked"}, {label: "历史", filterValue: "history"}, {label: "精选系列", filterValue: "精选系列"}, {label: "特殊回", filterValue: "特殊回"}, {label: "AI总结", filterValue: "AI总结"}].map(f => (
                 <button key={f.filterValue} onClick={() => setArchiveFilter(f.filterValue)} className={cn("px-4 py-2 hover:bg-muted font-semibold text-[13px] md:text-sm rounded-full transition-colors shrink-0", archiveFilter === f.filterValue ? "bg-pink-100 text-pink-700 dark:bg-pink-900/60 dark:text-pink-300 shadow-sm" : "bg-[#fcf8f3] dark:bg-[#2d2822] border border-[#f5eade] dark:border-[#3a332a] text-muted-foreground")}>
                   {f.label}
                 </button>
               ))}
             </div>
             <div className="flex items-center gap-2 text-xs md:text-sm">
               <span className="text-muted-foreground font-semibold flex items-center gap-1"><ArrowDownUp className="size-3.5" /> 排序方式:</span>
               {[
                 { id: 'dateDesc', label: '时间倒序' },
                 { id: 'dateAsc', label: '时间正序' },
                 { id: 'mentions', label: '最多动画提及' },
                 { id: 'viewers', label: '最多观看人数' },
                 { id: 'danmaku', label: '最多弹幕数' }
               ].map(s => (
                 <button key={s.id} onClick={() => setArchiveSortBy(s.id as any)} className={cn("px-3 py-1.5 rounded-full transition-colors font-medium shrink-0", archiveSortBy === s.id ? "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300" : "hover:bg-muted text-muted-foreground")}>
                   {s.label}
                 </button>
               ))}
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredArchiveData.map((item) => (
            <div 
              key={item.id}
              onClick={() => setSelectedTalk(item)}
              className="group flex flex-col bg-[#fcf8f3] dark:bg-[#2d2822] rounded-3xl overflow-hidden border border-[#f5eade] dark:border-[#3a332a] cursor-pointer hover:shadow-md transition-all duration-300"
            >
              <div className="relative w-full aspect-video bg-muted overflow-hidden">
                <img 
                   src={item.cover}
                   alt={item.title} 
                   className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                   onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=500&q=60" }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/40 transition-colors">
                   <div className="w-12 h-12 bg-white/90 backdrop-blur-sm shadow-xl rounded-full flex items-center justify-center text-pink-500 scale-95 opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all">
                      <Play className="size-5 ml-1" fill="currentColor" strokeWidth={1} />
                   </div>
                </div>
                {item.hasAiSummary && (
                  <div className="absolute top-2 left-2 bg-indigo-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                    <Sparkles className="size-3" /> AI 总结
                  </div>
                )}
                <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                   <Clock className="size-3" /> {item.min} {t("talks.min")}
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className={cn("inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md", item.color === "pink" ? "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300" : item.color === "yellow" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/60 dark:text-yellow-400" : "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300")}>
                    {item.cat}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-semibold">{item.date}</span>
                </div>
                <h3 className="text-[15px] font-bold leading-tight mb-2 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors line-clamp-2">{item.title}</h3>
                
                <div className="mt-auto grid grid-cols-3 gap-2 pt-3 border-t border-[#f5eade] dark:border-[#3a332a]">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground mb-0.5 flex items-center gap-1"><Eye className="size-3" /> 观看</span>
                    <span className="text-xs font-bold font-mono">{item.viewers.toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col border-l border-[#f5eade] dark:border-[#3a332a] pl-2">
                    <span className="text-[10px] text-muted-foreground mb-0.5 flex items-center gap-1"><MessageCircle className="size-3" /> 弹幕</span>
                    <span className="text-xs font-bold font-mono">{item.danmaku.toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col border-l border-[#f5eade] dark:border-[#3a332a] pl-2">
                    <span className="text-[10px] text-muted-foreground mb-0.5 flex items-center gap-1"><Tag className="size-3" /> 提及</span>
                    <span className="text-xs font-bold font-mono">{item.animeMentions}部</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <TalkModal talk={selectedTalk} onClose={() => setSelectedTalk(null)} t={t} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12 animate-in fade-in duration-700 bg-background text-foreground">
      
      {/* Top Search & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div className="flex-1 max-w-2xl">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            {t("talks.title")}
          </h1>
          <p className="text-muted-foreground text-[15px] md:text-[16px] max-w-3xl leading-relaxed">
            {t("talks.subtitle")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Live Now */}
          <section>
            <h2 className="text-xl font-bold mb-4">{t("talks.livenow")}</h2>
            
            <div 
              onClick={() => setSelectedTalk(liveTalkData)}
              className="group flex flex-col md:flex-row bg-[#fcf8f3] dark:bg-[#2d2822] rounded-[2rem] overflow-hidden border border-[#f5eade] dark:border-[#3a332a] p-5 gap-6 cursor-pointer hover:shadow-md transition-shadow relative"
            >
              {/* Video Thumbnail */}
              <div className="relative w-full md:w-[60%] aspect-video bg-muted rounded-2xl overflow-hidden shadow-sm shrink-0">
                <img 
                   src={liveTalkData.cover}
                   alt="Live preview" 
                   className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Overlay play button */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
                   <div className="w-14 h-14 bg-white/90 backdrop-blur-sm shadow-xl rounded-full flex items-center justify-center text-pink-500 scale-95 group-hover:scale-105 transition-transform">
                      <Play className="size-6 ml-1" fill="currentColor" strokeWidth={1} />
                   </div>
                </div>
                {/* Live Badge */}
                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                   <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                   {t("talks.live.time")}
                </div>
              </div>
              
              {/* Live Info */}
              <div className="flex-1 flex flex-col pt-2 pb-2 pr-2">
                 <div className="mb-4">
                    <span className="inline-block bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300 text-[11px] font-bold px-2 py-0.5 rounded-md mb-3">
                       {liveTalkData.cat}
                    </span>
                    <h3 className="text-xl font-bold leading-tight mb-2 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">{liveTalkData.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                       {liveTalkData.desc}
                    </p>
                 </div>
                 
                 <div className="mt-auto pt-4 flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {liveTalkData.imgs.map((img, i) => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-[#fcf8f3] dark:border-[#2d2822] overflow-hidden">
                          <img src={img} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                    <div className="text-xs font-semibold text-muted-foreground bg-black/5 dark:bg-white/10 px-2.5 py-1 rounded-full">
                       {liveTalkData.min} {t("talks.min")}
                    </div>
                 </div>
              </div>
            </div>
          </section>

          {/* Upcoming Schedule */}
          <section className="pt-4">
            <div 
              ref={scrollRef}
              className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {schedules.map((sch, i) => (
                <div key={i} className="w-[calc(100%-1.5rem)] sm:w-[calc(50%-12px)] md:w-[calc(100%/3-16px)] flex-none snap-start space-y-4">
                  <div className="flex items-center justify-between text-sm font-bold">
                    <span>{sch.date}</span>
                    <span className="bg-black text-white dark:bg-white dark:text-black w-6 h-6 flex items-center justify-center rounded-full text-xs">{sch.day}</span>
                  </div>
                  <div 
                    onClick={() => setSelectedTalk(sch)}
                    className={cn(
                    "bg-[#fcf8f3] dark:bg-[#2d2822] border border-[#f5eade] dark:border-[#3a332a] p-5 rounded-3xl flex flex-col h-[320px] relative cursor-pointer hover:shadow-md transition-shadow",
                    sch.cover ? "" : "h-[320px]"
                  )}>
                     <div className="mb-4">
                       <span className={cn(
                          "inline-block text-[11px] font-bold px-2 py-0.5 rounded-md mb-3",
                          sch.color === "pink" ? "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300" :
                          sch.color === "yellow" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/60 dark:text-yellow-400" :
                          sch.color === "blue" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300" :
                          "bg-green-100 text-green-700 dark:bg-green-900/60 dark:text-green-300"
                       )}>
                         {sch.cat}
                       </span>
                       <h4 className="font-bold text-[15px] leading-tight mb-2">{sch.title}</h4>
                       <p className="text-[13px] text-muted-foreground line-clamp-3">
                         {sch.desc}
                       </p>
                     </div>
                     <div className={cn("text-xs font-semibold text-muted-foreground mt-auto pt-4 relative z-10", sch.cover ? "pb-[80px]" : "mb-8")}>
                       {sch.min} {t("talks.min")}
                     </div>
                     
                     {sch.cover ? (
                       <div className="absolute bottom-0 left-0 right-0 h-28 rounded-b-3xl overflow-hidden mt-4">
                           <img src={sch.cover} className="w-full h-full object-cover" />
                       </div>
                     ) : (
                       <div className="absolute bottom-4 left-5 right-5 flex justify-between items-center z-10">
                         <div className="flex -space-x-2">
                           {sch.imgs?.map((img, idx) => (
                             <div key={idx} className="w-8 h-8 rounded-full border-2 border-[#fcf8f3] dark:border-[#2d2822] overflow-hidden bg-muted">
                                <img src={img} className="w-full h-full object-cover" />
                             </div>
                           ))}
                         </div>
                       </div>
                     )}

                     <div className={cn("absolute bottom-4 right-5 z-20 flex", sch.cover ? "" : "bottom-4 right-5")}>
                       <button className="w-8 h-8 bg-pink-200 dark:bg-pink-900 text-pink-700 dark:text-pink-300 rounded-full flex items-center justify-center hover:bg-pink-300 transition-colors shadow-sm">
                         <Plus className="size-4" strokeWidth={3} />
                       </button>
                     </div>
                  </div>
                </div>
              ))}
            </div>
            
            <WaveScrollbar scrollRef={scrollRef} schedules={schedules} />
          </section>

          {/* This Week's Schedule */}
          <section className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-[#f5eade] dark:border-[#3a332a]">
            <div className="flex items-center gap-2.5 md:gap-3 mb-4 md:mb-6">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-pink-100 dark:bg-pink-900/40 flex items-center justify-center text-pink-600 dark:text-pink-400">
                <Calendar className="size-4 md:size-5" />
              </div>
              <h3 className="text-lg md:text-xl font-bold">{t("talks.thisweek")}</h3>
            </div>
            
            <div className="flex overflow-x-auto pb-4 pt-1 -mx-4 px-4 snap-x snap-mandatory gap-2.5 md:gap-3 md:grid md:grid-cols-4 lg:grid-cols-7 md:overflow-visible md:p-0 md:mx-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                // Determine if today is the iterated day (1 for Monday, etc)
                const isToday = new Date().getDay() === (day === 7 ? 0 : day);
                return (
                  <div key={day} className={cn(
                    "flex flex-col p-3 md:p-4 rounded-2xl md:rounded-3xl border transition-all duration-300 w-[140px] md:w-auto shrink-0 snap-center md:snap-align-none",
                    isToday 
                      ? "bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800 shadow-sm ring-1 ring-pink-500/20 md:-translate-y-1" 
                      : "bg-[#fcf8f3] dark:bg-[#2d2822] border-[#f5eade] dark:border-[#3a332a] hover:border-pink-200 dark:hover:border-pink-800"
                  )}>
                    <div className="flex items-center justify-between mb-2 md:mb-3">
                      <div className={cn(
                        "text-xs md:text-sm font-bold",
                        isToday ? "text-pink-600 dark:text-pink-400" : "text-muted-foreground"
                      )}>
                        {t(`talks.plan.d${day}`)}
                      </div>
                      {isToday && (
                         <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-pink-500 animate-pulse" />
                      )}
                    </div>
                    <div className="flex-1">
                       <h4 className="font-bold text-[13px] md:text-[14px] leading-tight mb-1 md:mb-1.5">
                         {t(`talks.plan.d${day}.title`)}
                       </h4>
                       <p className="text-[11px] md:text-[12px] text-muted-foreground flex items-center gap-1 md:gap-1.5 break-words">
                         {t(`talks.plan.d${day}.desc`)}
                       </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Past Talks Archive */}
          <section className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-[#f5eade] dark:border-[#3a332a]">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex items-center gap-2.5 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Archive className="size-4 md:size-5" />
                </div>
                <h3 className="text-lg md:text-xl font-bold">{t("talks.archive" as any)}</h3>
              </div>
              <button 
                onClick={() => setShowAllArchive(true)}
                className="text-[12px] md:text-[13px] font-medium text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                 {t("talks.showall")} <ArrowUpRight className="size-3" />
              </button>
            </div>
            
            <div className="flex overflow-x-auto pb-4 pt-1 -mx-4 px-4 snap-x snap-mandatory gap-2.5 md:gap-3 md:grid md:grid-cols-4 lg:grid-cols-5 md:overflow-visible md:p-0 md:mx-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {[
                { title: "2026", label: "2026年杂谈回", filterValue: "2026", count: archiveData.filter(item => item.date.startsWith("2026")).length, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
                { title: "2025", label: "2025年杂谈回", filterValue: "2025", count: archiveData.filter(item => item.date.startsWith("2025")).length, color: "text-cyan-500", bg: "bg-cyan-50 dark:bg-cyan-500/10" },
                { title: "喜欢", label: "我喜欢的", filterValue: "liked", count: archiveData.filter(item => item.isLiked).length, color: "text-red-500", bg: "bg-red-50 dark:bg-red-500/10" },
                { title: "历史", label: "2024年及以前", filterValue: "history", count: archiveData.filter(item => parseInt(item.date.substring(0, 4)) <= 2024).length, color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-500/10" },
                { title: "精选", label: "历史精选杂谈", filterValue: "精选系列", count: archiveData.filter(item => item.cat === '精选').length, color: "text-pink-500", bg: "bg-pink-50 dark:bg-pink-500/10" },
              ].map((folder, idx) => (
                 <div 
                   key={idx} 
                   onClick={() => {
                     setArchiveFilter(folder.filterValue);
                     setShowAllArchive(true);
                   }}
                   className="group relative bg-[#fcf8f3] dark:bg-[#2d2822] border border-[#f5eade] dark:border-[#3a332a] p-3 md:p-4 rounded-2xl md:rounded-3xl hover:shadow-md transition-all cursor-pointer w-[140px] md:w-auto shrink-0 snap-center md:snap-align-none"
                 >
                    <div className={cn("w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-4 transition-transform group-hover:scale-105", folder.bg, folder.color)}>
                       <Folder className="absolute size-6 md:size-8 shrink-0 opacity-20" fill="currentColor" strokeWidth={1} />
                       <span className="relative z-10 font-bold text-[11px] md:text-[13px]">{folder.title}</span>
                    </div>
                    <h4 className="font-bold text-[13px] md:text-[14px] mb-1 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors line-clamp-1">
                       {folder.label}
                    </h4>
                    <span className="text-[11px] md:text-[12px] text-muted-foreground flex items-center gap-1 md:gap-1.5 font-semibold">
                      <Play className="size-2.5 md:size-3" /> {folder.count} 期 <ArrowUpRight className="size-3.5 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                    </span>
                 </div>
              ))}
            </div>
          </section>

        </div>

        {/* Sidebar */}
        <div className="space-y-8">
           
           {/* Recent field updates */}
           <section>
              <div className="flex items-center justify-between mb-4">
                 <h2 className="text-xl font-bold">{t("talks.recent")}</h2>
                 <button onClick={() => { setActiveTopicId(undefined); setShowTopicsModal(true); }} className="text-[13px] font-medium text-muted-foreground hover:text-foreground">
                    {t("talks.showall")}
                 </button>
              </div>

              <div className="space-y-3">
                 {/* Card 1 */}
                 <div onClick={() => { setActiveTopicId("upd1"); setShowTopicsModal(true); }} className="bg-[#f0ece5] dark:bg-[#282725] p-5 rounded-3xl cursor-pointer hover:bg-[#e8e4dc] dark:hover:bg-[#32302e] transition-colors relative">
                    <div className="flex items-start gap-4 mb-4">
                       <div className="bg-yellow-400 w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-black shadow-sm transform -rotate-6">
                         <FileText className="size-5" />
                       </div>
                       <h4 className="font-bold text-[15px] leading-tight mt-1">{t("talks.upd1.title")}</h4>
                    </div>
                    
                    <div className="text-[13px] text-muted-foreground mb-4 font-medium">
                       {t("talks.upd1.date")}
                    </div>
                    <p className="text-[13px] text-muted-foreground mb-6 line-clamp-3">
                       {t("talks.upd1.desc")}
                    </p>
                    <div className="flex items-center justify-center gap-2 border-t border-black/5 dark:border-white/5 pt-4 text-[14px] font-bold group">
                       {t("talks.open")} <ArrowUpRight className="size-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                 </div>

                 {/* Card 2 */}
                 <div onClick={() => { setActiveTopicId("upd2"); setShowTopicsModal(true); }} className="bg-[#f0ece5] dark:bg-[#282725] p-5 rounded-3xl cursor-pointer hover:bg-[#e8e4dc] dark:hover:bg-[#32302e] transition-colors relative overflow-hidden">
                    <div className="flex items-start gap-4 mb-4">
                       <div className="bg-[#d2e0f5] text-blue-700 w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm relative z-10">
                         <div className="bg-white rounded-md p-1"><FileText className="size-4" /></div>
                       </div>
                       <h4 className="font-bold text-[15px] leading-tight mt-1 relative z-10">{t("talks.upd2.title")}</h4>
                    </div>
                    {/* decorative background star pattern */}
                    <div className="absolute right-[-20px] top-4 text-blue-200 dark:text-blue-900/30 opacity-50 z-0 pointer-events-none">
                       <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" />
                       </svg>
                    </div>
                    
                    <div className="text-[13px] text-muted-foreground mb-4 font-medium relative z-10">
                       {t("talks.upd2.date")}
                    </div>
                    <p className="text-[13px] text-muted-foreground mb-6 line-clamp-3 relative z-10">
                       {t("talks.upd2.desc")}
                    </p>
                    <div className="flex items-center justify-center gap-2 border-t border-black/5 dark:border-white/5 pt-4 text-[14px] font-bold group relative z-10">
                       {t("talks.open")} <ArrowUpRight className="size-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                 </div>
              </div>
           </section>

           {/* Top articles */}
           <section>
              <h2 className="text-xl font-bold mb-4 mt-6">{t("talks.top")}</h2>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                 {topTalks.map((talk) => (
                   <div 
                     key={talk.id} 
                     onClick={() => setSelectedTalk(talk)}
                     className="bg-[#f0ece5] dark:bg-[#282725] rounded-3xl overflow-hidden h-[180px] relative group cursor-pointer hover:shadow-md transition-all"
                   >
                      <img src={talk.cover} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10 group-hover:bg-black/40 transition-colors" />
                      <div className="absolute inset-x-0 bottom-0 p-3 flex flex-col justify-end z-10">
                        <div className="flex items-center gap-1.5 mb-1.5 transform translate-y-1 group-hover:translate-y-0 transition-transform">
                          <span className={cn("text-background text-[9px] font-bold px-1.5 py-0.5 rounded-sm", talk.color === 'pink' ? 'bg-pink-500' : talk.color === 'yellow' ? 'bg-yellow-500' : 'bg-blue-500')}>{talk.cat}</span>
                          <span className="text-white/80 text-[10px] font-semibold flex items-center gap-0.5"><Eye className="size-3" /> {talk.viewers}</span>
                        </div>
                        <h4 className="text-white font-bold leading-tight text-[13px] line-clamp-2 shadow-sm">{talk.title}</h4>
                      </div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 shadow-xl">
                         <Play className="size-4 ml-0.5 text-white" fill="currentColor" />
                      </div>
                   </div>
                 ))}
              </div>
           </section>

           {/* New uploads */}
           <section>
              <h2 className="text-xl font-bold mb-4 mt-6">{t("talks.new")}</h2>
              <div className="space-y-4">
                 
                 <div className="flex items-center gap-4 group cursor-pointer">
                    <div className="w-10 h-10 bg-black text-white dark:bg-white dark:text-black rounded-full flex items-center justify-center flex-shrink-0">
                       <span className="text-[10px] font-bold">PDF</span>
                    </div>
                    <span className="font-semibold text-sm flex-1 group-hover:text-primary transition-colors">{t("talks.file1")}</span>
                    <div className="flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                      <Search className="size-4" />
                      <FileDown className="size-4" />
                    </div>
                 </div>

                 <div className="flex items-center gap-4 group cursor-pointer">
                    <div className="w-10 h-10 bg-black text-white dark:bg-white dark:text-black rounded-full flex items-center justify-center flex-shrink-0">
                       <span className="text-[10px] font-bold">ZIP</span>
                    </div>
                    <span className="font-semibold text-sm flex-1 group-hover:text-primary transition-colors">{t("talks.file2")}</span>
                    <div className="flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                      <Search className="size-4" />
                      <FileDown className="size-4" />
                    </div>
                 </div>

              </div>
           </section>

        </div>
      </div>
      
      <TalkModal talk={selectedTalk} onClose={() => setSelectedTalk(null)} t={t} />
      <TopicsModal isOpen={showTopicsModal} onClose={() => setShowTopicsModal(false)} t={t} initialTopicId={activeTopicId} />
      
    </div>
  );
}
