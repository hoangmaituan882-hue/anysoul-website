import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, FileText, Bell, Tag, ArrowRight } from "lucide-react";
import { cn } from "../lib/utils";

interface TopicsModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: (key: string) => string;
  initialTopicId?: string;
}

export function TopicsModal({ isOpen, onClose, t, initialTopicId }: TopicsModalProps) {
  // We use the two existing updates plus some mock ones to make a real list
  const topics = [
    {
      id: "upd1",
      title: t("talks.upd1.title") || "论异世界动画的十年变迁：从王道到反套路",
      date: t("talks.upd1.date") || "2024年4月22日",
      desc: t("talks.upd1.desc") || "我们回顾了过去十年的异世界题材动画...",
      content: t("talks.upd1.desc") + "\n\n从早期的王道冒险，逐渐演变成如今的各种反套路和搞笑番。在这十年间，业界不仅在作画和配乐上有了大幅提升，更在剧本打磨上做出了诸多尝试。我们详细盘点了近年来几部具有代表性的作品，并对异世界题材未来的发展趋势进行了展望。\n\n感谢大家一直以来的支持，下期我们会带来更多有趣的动画杂谈！",
      badges: ["盘点", "新内容"]
    },
    {
      id: "upd2",
      title: t("talks.upd2.title") || "下周直播时间临时调整公告",
      date: t("talks.upd2.date") || "2024年4月22日",
      desc: t("talks.upd2.desc") || "由于直播设备系统升级，下周的杂谈直播将暂时推迟...",
      content: t("talks.upd2.desc") + "\n\n本次设备升级主要更换了全新的麦克风和声卡，希望能给大家带来更棒的收音体验。另外，直播间的背景也会有小幅度的更新，敬请期待！大家如果有想看的动画推荐，也可以提前留言告诉我哦。",
      badges: ["公告", "日常"]
    },
    {
      id: "upd3",
      title: "五一假期特别企划预告",
      date: "2024年4月18日",
      desc: "五一假期期间将连播三天，陪大家一起重温那些经典的催泪神作。",
      content: "为了迎接即将到来的五一小长假，我们将举办连续三天的特别企划！这次的主题是「重温经典催泪神作」。\n\n在这三天里，我们将一起观看并讨论《CLANNAD》《四月是你的谎言》以及《未闻花名》等经典作品。届时还会有互动抽奖活动，准备了不少周边小礼物，请大家务必锁定直播间！\n\n具体的时间表会在随后公布在动态中。",
      badges: ["活动", "预告"]
    }
  ];

  const [activeTopicId, setActiveTopicId] = useState(initialTopicId || topics[0].id);

  // Update activeTopicId when modal opens with a new initialTopicId
  React.useEffect(() => {
    if (isOpen && initialTopicId) {
      setActiveTopicId(initialTopicId);
    }
  }, [isOpen, initialTopicId]);

  const activeTopic = topics.find(t => t.id === activeTopicId) || topics[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", bounce: 0, duration: 0.5 }}
            className="w-full max-w-5xl h-[85vh] sm:h-[80vh] bg-[#fcf8f3] dark:bg-[#2d2822] rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden border border-[#f5eade] dark:border-[#3a332a]"
          >
            {/* Left Sidebar ListView */}
            <div className="w-full md:w-[320px] lg:w-[380px] shrink-0 border-b md:border-b-0 md:border-r border-[#f5eade] dark:border-[#3a332a] bg-muted/20 flex flex-col h-[40vh] md:h-full">
               <div className="p-6 md:p-8 flex items-center gap-3 shrink-0">
                  <div className="w-10 h-10 rounded-2xl bg-yellow-400 text-black flex items-center justify-center flex-shrink-0 shadow-sm transform -rotate-6">
                     <Bell className="size-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{t("talks.recent") || "最近主题"}</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">产品更新、规则变更与重要通知</p>
                  </div>
                  {/* Mobile close button inside the sidebar header */}
                  <button 
                     onClick={onClose}
                     className="ml-auto md:hidden w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-foreground"
                  >
                     <X className="size-4" />
                  </button>
               </div>
               
               <div className="overflow-y-auto px-4 pb-6 md:px-6 md:pb-8 flex-1 space-y-3 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border">
                  {topics.map(topic => (
                     <div 
                        key={topic.id}
                        onClick={() => setActiveTopicId(topic.id)}
                        className={cn(
                           "p-4 md:p-5 rounded-2xl cursor-pointer transition-all border",
                           activeTopicId === topic.id
                            ? "bg-background border-border shadow-sm ring-1 ring-border/50"
                            : "bg-transparent border-transparent hover:bg-black/5 dark:hover:bg-white/5"
                        )}
                     >
                        <div className="flex flex-wrap gap-2 mb-2.5">
                           {topic.badges.map((b, i) => (
                             <span key={i} className={cn(
                               "text-[10px] px-2 py-0.5 rounded-full font-semibold",
                               i === 0 ? "bg-yellow-400 text-black" : "bg-muted text-muted-foreground"
                             )}>{b}</span>
                           ))}
                        </div>
                        <h4 className="font-bold text-[14px] md:text-[15px] leading-tight mb-2 text-foreground">{topic.title}</h4>
                        <p className="text-[12px] md:text-[13px] text-muted-foreground line-clamp-2 leading-relaxed mb-3">
                           {topic.desc}
                        </p>
                        <div className="text-[11px] text-muted-foreground/80 flex items-center gap-1.5 font-medium">
                           发布于 {topic.date}
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            {/* Right Side Detail View */}
            <div className="flex-1 flex flex-col h-[45vh] md:h-full bg-background relative relative">
               <div className="absolute top-4 right-4 md:top-6 md:right-6 z-10 hidden md:block">
                  <button 
                     onClick={onClose}
                     className="w-8 h-8 rounded-full bg-muted/80 hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors"
                  >
                     <X className="size-4" />
                  </button>
               </div>

               <div className="overflow-y-auto p-6 md:p-10 lg:p-12 flex-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border">
                  <div className="max-w-3xl border-b border-[#f5eade] dark:border-[#3a332a] pb-6 mb-6 md:pb-8 md:mb-8">
                     <div className="flex flex-wrap gap-2 mb-4 md:mb-6">
                        {activeTopic.badges.map((b, i) => (
                           <span key={i} className={cn(
                             "text-[11px] md:text-[12px] px-2.5 py-1 rounded-full font-bold flex items-center gap-1",
                             i === 0 ? "bg-[#d1ea41] text-[#2d3a08] dark:bg-[#c9e133] dark:text-[#1a2205]" : "bg-muted text-muted-foreground border border-border"
                           )}>
                             {i === 0 && <Bell className="size-3" />} {b}
                           </span>
                        ))}
                     </div>
                     
                     <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold leading-tight mb-4">
                        {activeTopic.title}
                     </h1>
                     
                     <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
                        {activeTopic.desc}
                     </p>

                     <div className="text-[12px] md:text-[13px] text-muted-foreground font-medium flex items-center gap-1.5">
                        <FileText className="size-3.5" /> 发布于 {activeTopic.date}
                     </div>
                  </div>

                  <div className="max-w-3xl prose prose-sm md:prose-base dark:prose-invert prose-p:text-muted-foreground prose-p:leading-8">
                     {activeTopic.content.split('\n\n').map((paragraph, idx) => (
                       <p key={idx}>{paragraph}</p>
                     ))}
                  </div>
               </div>

               {/* Bottom Sticky Action Bar */}
               <div className="p-4 md:p-6 border-t border-[#f5eade] dark:border-[#3a332a] bg-background flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
                  <p className="text-[12px] text-muted-foreground font-medium text-center sm:text-left">
                     即使你关闭弹窗，这些公告也会保留在这里供之后查看。
                  </p>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                     <button 
                       onClick={onClose}
                       className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl border border-border hover:bg-muted text-sm font-semibold transition-colors"
                     >
                       关闭
                     </button>
                     <button 
                       onClick={onClose}
                       className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-[#c5df33] hover:bg-[#b0c82a] text-[#28320a] text-sm font-semibold transition-colors shadow-sm"
                     >
                       本次不再弹出
                     </button>
                  </div>
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
