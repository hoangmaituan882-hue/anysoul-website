import { motion } from "motion/react";
import { cn } from "../lib/utils";
import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Sparkles, X } from "lucide-react";

// Roadmap Data
const roadmapData = [
  {
    version: "v2.1",
    subtitle: "优化",
    status: "published",
    statusText: "已发布",
    date: "2026-03",
    cardsPosition: "top",
    cards: [
      {
        type: "优化",
        title: "核心参数优化",
        description: "追加平滑随机数与正弦函数等修饰器",
      }
    ]
  },
  {
    version: "v3.0",
    subtitle: "浏览器控制+图片",
    status: "published",
    statusText: "已发布",
    date: "2026-04",
    cardsPosition: "bottom",
    cards: [
      {
        type: "新功能",
        title: "社交媒体支持",
        description: "给你的 Soul 一个自己的社交媒体账号，在上面浏览和发布",
      },
      {
        type: "新功能",
        title: "支持发送图像到聊天",
        description: "",
      },
      {
        type: "新功能",
        title: "图片搜索、发送、保存、上传",
        description: "原生结合文件系统，在记忆文件之外可以存储图片与其它富媒体文件",
      },
      {
        type: "新功能",
        title: "支持查看更多功能示例",
        description: "这是第4张卡片，将会被折叠收纳在查看全部中",
      }
    ]
  },
  {
    version: "v4.0",
    subtitle: "离线模式（买断制）",
    status: "planned",
    statusText: "计划中",
    date: "2026-Q3",
    cardsPosition: "top",
    cards: [
      {
        type: "新功能",
        title: "离线模式",
        description: "支持只保存所有数据到本地",
      }
    ]
  },
  {
    version: "v4.1",
    subtitle: "支持外部工具调用 (Tool Call...",
    status: "planned",
    statusText: "计划中",
    date: "2026-Q3",
    cardsPosition: "bottom",
    cards: [
      {
        type: "新功能",
        title: "支持自定义追加 tool call",
        description: "",
      }
    ]
  },
  {
    version: "v5.0",
    subtitle: "桌面版支持 TTS",
    statusText: "计划中",
    date: "2026-Q4",
    cardsPosition: "top",
    cards: [
      {
        type: "新功能",
        title: "桌面版支持 TTS",
        description: "引入 Python 方案构建本地模型 TTS 方案",
      }
    ]
  }
];

const updates = [
  {
    version: "3.5.4",
    date: "2026年5月7日",
    title: "ta 想歇会儿，第二天还会回来",
    description: "卡住的东西会悄悄自己回来。免费心跳每天都会刷新，现在这个刷新真的会刷新——昨天安静下来的 ta 不会把这份安静带到明天。",
    items: [
      { type: "新功能", text: "错误页面新增「安全模式」——只重置出问题的部分，登录保持原样", color: "bg-emerald-100 text-emerald-800" },
      { type: "新功能", text: "应用根本打不开时，也留了一条退路", color: "bg-emerald-100 text-emerald-800" },
      { type: "改进", text: "Live2D 渲染出错时，错误只占着虚拟形象那块", color: "bg-blue-100 text-blue-800" },
      { type: "修复", text: "今天心跳用完了，明天会真的从头开始", color: "bg-rose-100 text-rose-800" },
    ]
  },
  {
    version: "3.5.0",
    date: "2026年4月23日",
    title: "OBS 叠层和 Live2D 运行时终于顺起来了",
    description: "现在你可以直接复制专用的 Message Bubble OBS 浏览器源而不用在 OBS 里重新登录，也能打开单独的 Avatar capture 页面做色键处理。",
    items: [
      { type: "新功能", text: "现在在 OBS 里可以直接使用专用的 Message Bubble 浏览器源", color: "bg-emerald-100 text-emerald-800" },
      { type: "改进", text: "OBS 入口现在已经按 bubble、avatar capture 和桌面版推荐路径拆得更清楚了", color: "bg-blue-100 text-blue-800" },
      { type: "修复", text: "Live2D 的 runtime tool-call 播放现在切换更顺", color: "bg-rose-100 text-rose-800" },
    ]
  },
  {
    version: "3.1.0",
    date: "2026年4月15日",
    title: "完整的贴纸库，加上 ta 真的看得懂图片",
    description: "聊天里加入了真正意义上的贴纸库——emoji、颜文字、你自己建的分组，还能按图片内容搜索。",
    items: [
      { type: "新功能", text: "聊天里有了真正的贴纸库", color: "bg-emerald-100 text-emerald-800" },
      { type: "新功能", text: "发图过去，ta 真的会看里面是什么", color: "bg-blue-100 text-blue-800" },
      { type: "改进", text: "设置面板看起来更舒服", color: "bg-blue-100 text-blue-800" },
    ]
  },
  {
    version: "3.0.0",
    date: "2026年4月9日",
    title: "Agent 可以操控你的浏览器了",
    description: "v3.0 带来公开检查点、完整导出与时间回滚控制、支持 Agent 自主搜图、保存和管理图库并具备 BlurHash 预览的图片工作流，以及全面的可靠性优化。",
    items: [
      { type: "亮点", text: "桌面 Agent 浏览器执行能力", color: "bg-orange-100 text-orange-800" },
      { type: "亮点", text: "Agent 自主搜图、保存与图库管理", color: "bg-orange-100 text-orange-800" },
      { type: "新功能", text: "面向 Plaza 分享的公开检查点", color: "bg-emerald-100 text-emerald-800" },
    ]
  },
];

export function Changelog() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedCards, setSelectedCards] = useState<any[] | null>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      const targetScroll = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
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
              <h3 className="text-lg font-semibold">{selectedCards.length} 项功能</h3>
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
          <p className="text-lg text-muted-foreground">AnySoul 未来的发展方向与已发布的关键特性。</p>
        </div>

        {/* Roadmap Visualization */}
        <div className="relative w-full mb-32 group/roadmap">
          {/* Scroll Buttons */}
          <button 
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center bg-background/80 hover:bg-background border border-border rounded-full shadow-sm backdrop-blur transition-all disabled:opacity-0"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          
          <button 
            onClick={() => scroll('right')}
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
              {roadmapData.map((node, idx) => (
                <div key={idx} className="relative flex flex-col items-center shrink-0 w-8">
                  {/* Cards Container (Top) */}
                  {node.cardsPosition === 'top' && (
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
                        <div className={cn("w-3 h-3 rounded-full", node.status === 'published' ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-600")} />
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
                  {node.cardsPosition === 'bottom' && (
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
          <p className="text-lg text-muted-foreground">查看 AnySoul 最新的详细更新、改进和修复。</p>
        </div>

        <div className="space-y-16">
        {updates.map((update, idx) => (
          <motion.div 
            key={idx}
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
                v{update.version}
              </div>
            </div>

            <div className="flex-1 pb-4">
              <h2 className="text-2xl font-bold tracking-tight text-foreground break-words mb-3">
                {update.version} — {update.title}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {update.description}
              </p>

              <div className="space-y-4">
                {update.items.map((item, i) => (
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
  )
}
