import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArchiveTimeline, type ArchiveTimelinePost } from "../components/ui/timeline/ArchiveTimeline";
import { Sparkles, Calendar, Rocket, Clock, CheckCircle, Circle } from "lucide-react";
import { cn } from "../lib/utils";
import { useContent } from "../content/useContent";
import { defaultTimelinePlans } from "../content/defaults/timeline";
import type { TimelinePlanItem, TimelinePlansContent } from "../content/types";

const siteUpdates: ArchiveTimelinePost[] = [
  { id: "upd-01", date: "2026-06-11", title: "网站时间线页面上线 + 未来计划系统", tags: ["网站", "时间线"], category: "功能" },
  { id: "upd-02", date: "2026-06-11", title: "图库瀑布流自适应 + 懒加载 + 点赞浏览系统", tags: ["图库", "性能"], category: "功能" },
  { id: "upd-03", date: "2026-06-10", title: "图库审核并入审核队列 + 图片放大预览/下载", tags: ["图库", "审核"], category: "功能" },
  { id: "upd-04", date: "2026-06-09", title: "图片缩略图响应式加载优化", tags: ["图片", "性能"], category: "优化" },
  { id: "upd-05", date: "2026-06-09", title: "杂谈详情页 TalkDetail 重构", tags: ["杂谈", "UI"], category: "重构" },
  { id: "upd-06", date: "2026-06-08", title: "用户投稿与反馈功能上线", tags: ["图库", "社区"], category: "功能" },
  { id: "upd-07", date: "2026-06-07", title: "站点工作台与审核系统完善", tags: ["后台", "审核"], category: "功能" },
  { id: "upd-08", date: "2026-06-05", title: "图库类型统一 + 数据标准化", tags: ["图库", "架构"], category: "重构" },
  { id: "upd-09", date: "2026-06-03", title: "图片系统优化: 懒加载/缩略图/错误兜底", tags: ["图片", "性能"], category: "优化" },
  { id: "upd-10", date: "2026-06-01", title: "杂谈录像 JSON 批量导入脚本", tags: ["杂谈", "工具"], category: "功能" },
  { id: "upd-11", date: "2026-05-28", title: "移动端导航优化 + VHS 磁带播放器清理", tags: ["移动端", "UI"], category: "重构" },
  { id: "upd-12", date: "2026-05-25", title: "TMDB 元数据完善与刮削诊断", tags: ["放映", "TMDB"], category: "优化" },
  { id: "upd-13", date: "2026-05-20", title: "游戏库独立页面上线", tags: ["游戏", "页面"], category: "功能" },
  { id: "upd-14", date: "2026-05-15", title: "反馈渠道模块化 + 待办系统", tags: ["反馈", "架构"], category: "重构" },
  { id: "upd-15", date: "2026-05-10", title: "服务端配置/路由/存储解耦 (Phase 1)", tags: ["服务端", "架构"], category: "重构" },
  { id: "upd-16", date: "2026-05-05", title: "Lucide React 图标全面替换", tags: ["UI", "图标"], category: "重构" },
  { id: "upd-17", date: "2026-04-28", title: "OptionCapsule 组件统一替换原生选择器", tags: ["UI", "组件"], category: "重构" },
  { id: "upd-18", date: "2026-04-20", title: "公开站点工作台上线", tags: ["工作台", "页面"], category: "功能" }
];

const planStatusConfig: Record<string, { icon: typeof Circle; label: string; color: string }> = {
  "planned": { icon: Circle, label: "计划中", color: "text-slate-500" },
  "in-progress": { icon: Clock, label: "进行中", color: "text-amber-500" },
  "completed": { icon: CheckCircle, label: "已完成", color: "text-emerald-500" }
};

function PlanCard({ plan }: { plan: TimelinePlanItem }) {
  const config = planStatusConfig[plan.status] || planStatusConfig.planned;
  const Icon = config.icon;

  return (
    <div className={cn(
      "bg-card border rounded-2xl p-5 shadow-sm transition-all hover:shadow-md",
      plan.status === "completed" && "opacity-60"
    )}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-base font-bold text-foreground leading-tight">{plan.title}</h3>
        <span className={cn("inline-flex items-center gap-1 shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-black", config.color)}>
          <Icon className="size-3" />
          {config.label}
        </span>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed mb-3">{plan.description}</p>
      {plan.targetDate && (
        <div className="text-[10px] font-bold text-muted-foreground flex items-center gap-1 mb-2">
          <Calendar className="size-3" /> 目标时间：{plan.targetDate}
        </div>
      )}
      {plan.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {plan.tags.map(tag => (
            <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function Timeline() {
  const [tab, setTab] = useState<"updates" | "plans">("updates");
  const plansContent = useContent<TimelinePlansContent>("timeline.plans", defaultTimelinePlans);
  const plans: TimelinePlanItem[] = Array.isArray(plansContent.plans) ? plansContent.plans : defaultTimelinePlans.plans;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12 animate-in fade-in duration-700">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-black text-muted-foreground mb-4">
          <Calendar className="size-3.5 text-primary" /> 网站时间线
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground mb-4">
          网站演进
        </h1>
        <p className="text-muted-foreground text-base md:text-lg max-w-2xl leading-relaxed">
          记录每一次功能迭代、性能优化和设计调整。
          <Sparkles className="inline size-4 text-primary ml-1 mb-0.5" />
        </p>
      </motion.div>

      <div className="flex rounded-xl border border-border bg-muted/50 p-0.5 w-fit mb-8">
        {[
          { id: "updates" as const, label: "更新记录", icon: Clock },
          { id: "plans" as const, label: "未来计划", icon: Rocket }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              "relative z-10 flex items-center gap-1.5 h-8 rounded-lg px-3 text-xs font-bold transition-colors",
              tab === id ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab === id && <motion.div layoutId="timelineTab" className="absolute inset-0 rounded-lg bg-background shadow-sm" transition={{ type: "spring", stiffness: 400, damping: 25 }} />}
            <Icon className="relative size-3.5" />
            <span className="relative">{label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === "updates" ? (
          <motion.div
            key="updates"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-4 text-xs font-bold text-muted-foreground">{siteUpdates.length} 条更新记录</div>
            <ArchiveTimeline posts={siteUpdates} categories={["全部", "功能", "优化", "重构"]} />
          </motion.div>
        ) : (
          <motion.div
            key="plans"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-4 text-xs font-bold text-muted-foreground">{plans.length} 项计划</div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {plans.map((p) => (
                <PlanCard plan={p} />
              ))}
            </div>
            {plans.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <Rocket className="mx-auto size-10 opacity-20 mb-3" />
                <p className="text-sm font-bold">暂无未来计划</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
