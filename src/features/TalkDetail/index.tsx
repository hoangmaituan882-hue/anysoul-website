import { useState, useRef, useEffect } from "react";
import { 
  ChevronLeft, Play, Users, MessageCircle, Eye, Tag, Sparkles, Clock, 
  Calendar, Heart, Share2, FileText, Search, Zap, List, Settings,
  RefreshCw, Info, Edit3, UploadCloud
} from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../../lib/utils";
import { WaveScrollbar } from "./WaveScrollbar";
import { FeedbackModal } from "./FeedbackModal";

export function TalkDetail({ talk, onBack, t }: { talk: any, onBack: () => void, t: any }) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDiffModal, setShowDiffModal] = useState(false);
  const [submitState, setSubmitState] = useState<'diff' | 'loading' | 'success'>('diff');
  const [editsRecord, setEditsRecord] = useState<Record<string, { old: any; new: any }>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editViewers, setEditViewers] = useState("");
  const [editDanmaku, setEditDanmaku] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editAnimeMentions, setEditAnimeMentions] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editSummaryText, setEditSummaryText] = useState("");
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  if (!talk) return null;

  const transcriptData = talk.transcript || [
    { time: "00:00", speaker: "主持人：", text: "大家晚上好，欢迎来到本周的杂谈回，今天我们也是请到了两边非常重量级的嘉宾..." },
    { time: "05:30", speaker: "嘉宾1：", text: "哈哈，其实也没有那么夸张啦，不过这季的新番确实有很多值得吐槽的地方。" }
  ];

  const matchedIndices = transcriptData.map((d: any, i: number) => (searchQuery && d.text.toLowerCase().includes(searchQuery.toLowerCase())) ? i : -1).filter((i: number) => i !== -1);
  
  useEffect(() => {
    if (matchedIndices.length > 0 && transcriptRef.current) {
        const matches = transcriptRef.current.querySelectorAll('.transcript-item');
        if (matches[matchedIndices[0]]) {
           matches[matchedIndices[0]].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-primary/20">
      
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/40 px-4 md:px-8 h-16 flex items-center justify-between">
         <button 
           onClick={onBack}
           className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-all group px-3 py-1.5 rounded-full hover:bg-muted"
         >
            <ChevronLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
            返回列表
         </button>
         
         <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsFavorited(!isFavorited)}
              className={cn("w-9 h-9 rounded-full flex items-center justify-center transition-all", isFavorited ? "bg-pink-500/10 text-pink-500" : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground")}
            >
              <Heart className="size-4" fill={isFavorited ? "currentColor" : "none"} />
            </button>
            <button className="w-9 h-9 bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground rounded-full flex items-center justify-center transition-all">
              <Share2 className="size-4" />
            </button>
            <button className="w-9 h-9 bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground rounded-full flex items-center justify-center transition-all ml-2" title="内容设置">
              <Settings className="size-4" />
            </button>
         </div>
      </header>

      <div className="flex-1 max-w-[1400px] w-full mx-auto p-4 md:p-8 lg:p-12 flex flex-col xl:flex-row gap-8 lg:gap-12">
        
        <div className="flex-1 flex flex-col min-w-0">
           
           <motion.div 
             initial={{ opacity: 0, scale: 0.98, y: 20 }}
             animate={{ opacity: 1, scale: 1, y: 0 }}
             transition={{ duration: 0.5, ease: "easeOut" }}
             className="w-full aspect-video rounded-[2rem] md:rounded-[3rem] overflow-hidden relative shadow-2xl bg-muted group"
           >
             {talk.cover ? (
               <img src={talk.cover} alt={talk.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
             ) : (
               <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500/20 to-purple-600/20">
                 <Play className="size-20 opacity-20" />
               </div>
             )}
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
             
             <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-white/90 text-xs font-bold border border-white/20 uppercase tracking-wider">
                      {talk.cat}
                    </span>
                    <span className="flex items-center gap-1.5 text-white/80 text-sm font-semibold">
                      <Clock className="size-4" /> {talk.min} {t("talks.min" as any)}
                    </span>
                  </div>
                  {isEditMode ? (
                    <input 
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="text-3xl md:text-5xl font-black text-white leading-tight drop-shadow-md max-w-3xl bg-black/20 border border-white/30 rounded-xl px-4 py-2 outline-none focus:bg-black/40 transition-all w-full"
                    />
                  ) : (
                    <h1 className="text-3xl md:text-5xl font-black text-white leading-tight drop-shadow-md max-w-3xl">
                      {talk.title}
                    </h1>
                  )}
                </div>
                
                <a 
                  href={talk.biliUrl || "https://t.bilibili.com/"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 bg-[#fb7299] hover:bg-[#fc8bab] text-white px-8 py-4 rounded-2xl font-bold md:text-lg flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-xl hover:shadow-[#fb7299]/20"
                >
                  <Play className="size-5" fill="currentColor" /> 前往观看
                </a>
             </div>
           </motion.div>

           <div>
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 md:mt-12">
               <div className="bg-card border border-border/50 rounded-2xl p-5 md:p-6 flex flex-col items-center justify-center text-center shadow-sm">
                 <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mb-3">
                   <Eye className="size-5" />
                 </div>
                  {isEditMode ? (
                    <input type="text" value={editViewers} onChange={(e) => setEditViewers(e.target.value)} className="w-24 text-2xl font-black text-center bg-muted/50 border border-border/50 rounded outline-none focus:ring-2 focus:ring-primary/50" />
                 ) : (
                   <span className="text-2xl font-black">{talk.viewers?.toLocaleString() || '1,245'}</span>
                 )}
                 <span className="text-xs text-muted-foreground font-bold mt-1 uppercase tracking-wider">观看人数</span>
               </div>
               <div className="bg-card border border-border/50 rounded-2xl p-5 md:p-6 flex flex-col items-center justify-center text-center shadow-sm">
                 <div className="w-10 h-10 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mb-3">
                   <MessageCircle className="size-5" />
                 </div>
                  {isEditMode ? (
                    <input type="text" value={editDanmaku} onChange={(e) => setEditDanmaku(e.target.value)} className="w-24 text-2xl font-black text-center bg-muted/50 border border-border/50 rounded outline-none focus:ring-2 focus:ring-primary/50" />
                 ) : (
                   <span className="text-2xl font-black">{talk.danmaku?.toLocaleString() || '856'}</span>
                 )}
                 <span className="text-xs text-muted-foreground font-bold mt-1 uppercase tracking-wider">互动弹幕</span>
               </div>
               <div className="bg-card border border-border/50 rounded-2xl p-5 md:p-6 flex flex-col items-center justify-center text-center shadow-sm">
                 <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center mb-3">
                   <Calendar className="size-5" />
                 </div>
                  {isEditMode ? (
                    <input type="text" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="w-28 text-xl font-bold mt-1 text-center bg-muted/50 border border-border/50 rounded outline-none focus:ring-2 focus:ring-primary/50" />
                 ) : (
                   <span className="text-xl font-bold mt-1">{talk.date}</span>
                 )}
                 <span className="text-xs text-muted-foreground font-bold mt-1 uppercase tracking-wider">直播日期</span>
               </div>
               <div className="bg-card border border-border/50 rounded-2xl p-5 md:p-6 flex flex-col items-center justify-center text-center shadow-sm">
                 <div className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center mb-3">
                   <Tag className="size-5" />
                 </div>
                  {isEditMode ? (
                    <div className="flex items-center gap-1">
                      <input type="text" value={editAnimeMentions} onChange={(e) => setEditAnimeMentions(e.target.value)} className="w-16 text-2xl font-black text-center bg-muted/50 border border-border/50 rounded outline-none focus:ring-2 focus:ring-primary/50" />
                     <span className="text-sm font-bold text-muted-foreground">部</span>
                   </div>
                 ) : (
                   <span className="text-2xl font-black">{talk.animeMentions || '5'} <span className="text-sm font-bold text-muted-foreground">部</span></span>
                 )}
                 <span className="text-xs text-muted-foreground font-bold mt-1 uppercase tracking-wider">动画提及</span>
               </div>
             </div>
             <div className="flex items-center justify-end gap-1.5 mt-3 text-xs text-muted-foreground font-medium">
               <Info className="size-3.5" />
               数据统计更新于 {talk.dataUpdated || '昨天 23:59'}
             </div>
           </div>

           <div className="mt-8 md:mt-12 space-y-8">
             <div className="prose prose-neutral dark:prose-invert max-w-none">
               <h3 className="text-xl font-bold flex items-center gap-2 text-foreground mb-4">
                 <FileText className="size-5 text-primary" /> 本期简述
               </h3>
                {isEditMode ? (
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                   className="w-full text-base text-foreground leading-relaxed p-4 bg-muted/50 border border-border/50 rounded-xl outline-none focus:ring-2 focus:ring-primary/50 min-h-[120px]"
                 />
               ) : (
                 <p className="text-base text-muted-foreground leading-relaxed text-balance">
                   {talk.desc}
                 </p>
               )}
             </div>

             <div className="bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/20 rounded-[2rem] p-6 md:p-8">
               <div className="flex items-center justify-between gap-4 mb-4">
                 <h3 className="text-xl font-bold flex items-center gap-2 text-indigo-900 dark:text-indigo-200">
                   <Sparkles className="size-5 text-indigo-500" /> AI 智能总结
                 </h3>
                 <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-xs font-bold shrink-0">
                    <RefreshCw className="size-3" />
                    总结更新于 {talk.summaryUpdated || '今天 10:30'}
                 </div>
               </div>
                {isEditMode ? (
                  <textarea
                    value={editSummaryText}
                    onChange={(e) => setEditSummaryText(e.target.value)}
                   className="w-full text-indigo-900 dark:text-indigo-200 leading-relaxed p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/50 min-h-[100px] mb-6"
                 />
               ) : (
                 <p className="text-indigo-900/80 dark:text-indigo-200/80 leading-relaxed mb-6">
                   {talk.summaryText || "本次直播深入探讨了当季热门动画的表现，并结合弹幕互动分享了许多幕后趣闻和主观评测。"}
                 </p>
               )}
               {talk.summaryBullets && talk.summaryBullets.length > 0 && (
                 <ul className="space-y-3">
                   {talk.summaryBullets.map((bullet: string, i: number) => (
                     <li key={i} className="flex gap-3 text-indigo-900/80 dark:text-indigo-200/80">
                       <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-2" />
                       {isEditMode ? (
                         <input type="text" defaultValue={bullet} className="flex-1 bg-indigo-500/10 border border-indigo-500/20 rounded md:px-2 py-0.5 outline-none focus:ring-2 focus:ring-indigo-500/50" />
                       ) : (
                         <span className="leading-relaxed">{bullet}</span>
                       )}
                     </li>
                   ))}
                 </ul>
               )}
             </div>

             {talk.highlights && talk.highlights.length > 0 && (
               <div>
                 <h3 className="text-xl font-bold flex items-center gap-2 text-foreground mb-6">
                   <Zap className="size-5 text-orange-500" /> 高光时刻
                 </h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   {talk.highlights.map((hl: any, i: number) => (
                     <div key={i} className="bg-card border border-border/50 p-5 rounded-2xl hover:shadow-md transition-shadow group cursor-pointer flex flex-col gap-2">
                       {isEditMode ? (
                         <>
                           <input type="text" defaultValue={hl.time} className="inline-block bg-orange-500/10 text-orange-600 dark:text-orange-400 font-mono font-bold px-2 py-1 rounded text-sm outline-none focus:ring-2 focus:ring-orange-500/50 w-24" />
                           <textarea defaultValue={hl.desc} className="w-full text-sm font-medium leading-relaxed bg-muted/30 border border-border/30 rounded p-2 outline-none focus:ring-2 focus:ring-primary/40 min-h-[60px]" />
                         </>
                       ) : (
                         <>
                           <span className="inline-block bg-orange-500/10 text-orange-600 dark:text-orange-400 font-mono font-bold px-2 py-1 rounded text-sm mb-3 group-hover:bg-orange-500/20 transition-colors w-fit">
                             {hl.time}
                           </span>
                           <p className="text-sm font-medium leading-relaxed group-hover:text-foreground transition-colors">{hl.desc}</p>
                         </>
                       )}
                     </div>
                   ))}
                 </div>
               </div>
             )}
           </div>

        </div>

        <div className="xl:w-[420px] 2xl:w-[480px] shrink-0 flex flex-col gap-6 md:gap-8 mt-12 xl:mt-0">
          
          {talk.imgs && talk.imgs.length > 0 && (
            <div className="bg-card border border-border/50 rounded-[2rem] p-6 shadow-sm">
              <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
                <Users className="size-5 text-blue-500" /> 参与嘉宾
              </h3>
              <div className="flex flex-col gap-4">
                 {talk.imgs.map((img: string, idx: number) => (
                   <div key={idx} className="flex items-center gap-4 bg-muted/50 p-3 rounded-2xl border border-border/30">
                     <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-background shadow-sm shrink-0">
                       <img src={img} className="w-full h-full object-cover" />
                     </div>
                     <div>
                       <div className="font-bold text-sm">特邀嘉宾 {idx + 1}</div>
                       <div className="text-xs text-muted-foreground">知名动漫UP主 / 资深漫评人</div>
                     </div>
                   </div>
                 ))}
              </div>
            </div>
          )}

          <div className="bg-card border border-border/50 rounded-[2rem] shadow-sm flex flex-col flex-1 min-h-[500px]">
             <div className="p-6 border-b border-border/50">
               <div className="flex items-center justify-between mb-4">
                 <h3 className="text-lg font-bold flex items-center gap-2">
                   <List className="size-5 text-primary" /> 智能视频文字稿
                 </h3>
                 <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground text-xs font-bold transition-all shadow-sm border border-border/50 group">
                   <UploadCloud className="size-3.5 group-hover:-translate-y-0.5 transition-transform" />
                   上传文字稿
                 </button>
               </div>
               <div className="relative">
                 <input 
                   type="text" 
                   placeholder="搜索逐字稿内容..."
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="w-full pl-10 pr-4 py-3 bg-muted/50 border border-border/50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/60"
                 />
                 <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
               </div>
             </div>
             
             <div className="flex flex-1 overflow-hidden p-6 gap-4">
               <div 
                 ref={transcriptRef} 
                 className="flex-1 overflow-y-auto space-y-4 pr-2" 
                 style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
               >
                  {transcriptData.map((item: any, idx: number) => {
                    const isMatch = matchedIndices.includes(idx);
                    return (
                      <div key={idx} className={cn(
                        "transcript-item p-4 rounded-2xl transition-colors", 
                        isMatch ? "bg-orange-500/10 border border-orange-500/20" : "hover:bg-muted/30 border border-transparent"
                      )}>
                        <div className="flex gap-2 items-center mb-1.5">
                          <span className={cn("text-xs font-mono font-bold px-1.5 py-0.5 rounded", isMatch ? "bg-orange-500 text-white" : "bg-muted text-muted-foreground")}>
                            {item.time}
                          </span>
                          <span className="text-sm font-bold">{item.speaker}</span>
                        </div>
                        <p className={cn("text-sm leading-relaxed", isMatch ? "text-foreground" : "text-muted-foreground")}>
                          {searchQuery && isMatch ? (
                            <span>
                              {item.text.split(new RegExp(`(${searchQuery})`, 'gi')).map((part: string, i: number) => 
                                part.toLowerCase() === searchQuery.toLowerCase() ? <mark key={i} className="bg-orange-500/30 text-foreground font-bold rounded-sm px-0.5">{part}</mark> : part
                              )}
                            </span>
                          ) : item.text}
                        </p>
                      </div>
                    );
                  })}
               </div>
               
               <WaveScrollbar scrollRef={transcriptRef} matchedIndices={matchedIndices} totalItems={transcriptData.length} />
             </div>
          </div>

        </div>
      </div>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn("fixed bottom-6 right-6 z-50 flex items-center gap-2 shadow-lg px-4 py-3 rounded-full font-bold text-sm tracking-wide border transition-all", 
          isEditMode ? "bg-orange-600 text-white border-orange-500/20 hover:shadow-orange-500/20" : "bg-primary text-primary-foreground border-primary-foreground/20 hover:shadow-xl")}
        onClick={() => {
           if (isEditMode) {
              const edits: Record<string, { old: any; new: any }> = {};
              const viewersNum = Number(editViewers.replace(/,/g, ""));
              if (!Number.isNaN(viewersNum) && viewersNum !== talk.viewers) edits.viewers = { old: talk.viewers, new: viewersNum };
              const danmakuNum = Number(editDanmaku.replace(/,/g, ""));
              if (!Number.isNaN(danmakuNum) && danmakuNum !== talk.danmaku) edits.danmaku = { old: talk.danmaku, new: danmakuNum };
              if (editDate && editDate !== talk.date) edits.date = { old: talk.date, new: editDate };
              const animeNum = Number(editAnimeMentions);
              if (!Number.isNaN(animeNum) && animeNum !== talk.animeMentions) edits.animeMentions = { old: talk.animeMentions, new: animeNum };
              if (editDesc !== talk.desc) edits.desc = { old: talk.desc, new: editDesc };
              if (editSummaryText !== (talk.summaryText || "")) edits.summaryText = { old: talk.summaryText, new: editSummaryText };
              if (editTitle !== talk.title) edits.title = { old: talk.title, new: editTitle };
              setEditsRecord(edits);
              setSubmitState('diff');
              setShowDiffModal(true);
           } else {
              setEditTitle(talk.title || "");
              setEditViewers(String(talk.viewers || ""));
              setEditDanmaku(String(talk.danmaku || ""));
              setEditDate(talk.date || "");
              setEditAnimeMentions(String(talk.animeMentions || ""));
              setEditDesc(talk.desc || "");
              setEditSummaryText(talk.summaryText || "");
              setIsEditMode(true);
           }
        }}
        title={isEditMode ? "上传补充内容" : "提供反馈或补充"}
      >
        {isEditMode ? (
          <>
            <UploadCloud className="size-4" />
            上传补充
          </>
        ) : (
          <>
            <Edit3 className="size-4" />
            反馈与补充
          </>
        )}
      </motion.button>

      <FeedbackModal 
        isOpen={showDiffModal}
        onClose={() => setShowDiffModal(false)}
        submitState={submitState}
        setSubmitState={setSubmitState}
        onFinish={() => {
          setShowDiffModal(false);
          setIsEditMode(false);
        }}
        talk={talk}
        edits={editsRecord}
      />
    </div>
  );
}
