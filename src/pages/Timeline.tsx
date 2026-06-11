import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArchiveTimeline, type ArchiveTimelinePost } from "../components/ui/timeline/ArchiveTimeline";
import { Sparkles, Calendar, Rocket, Clock, CheckCircle, Circle } from "lucide-react";
import { cn } from "../lib/utils";
import { useContent } from "../content/useContent";
import { defaultTimelinePlans } from "../content/defaults/timeline";
import type { TimelinePlanItem, TimelinePlansContent } from "../content/types";

const siteUpdates: ArchiveTimelinePost[] = [
  { id: "upd-01", date: "2026-06-11 23:52", title: "新增游戏录像管理后台控制", tags: ["游戏", "后台"], category: "功能" },
  { id: "upd-02", date: "2026-06-11 23:32", title: "重构时间线页面为网站更新记录与未来计划系统", tags: ["网站", "时间线"], category: "重构" },
  { id: "upd-03", date: "2026-06-11 23:08", title: "更新杂谈卡片设计以匹配参考样式", tags: ["杂谈", "UI"], category: "优化" },
  { id: "upd-04", date: "2026-06-11 23:06", title: "修复游戏页面录像分类辅助函数", tags: ["游戏", "修复"], category: "修复" },
  { id: "upd-05", date: "2026-06-11 23:02", title: "用真实近期杂谈替换预告排期", tags: ["杂谈", "UI"], category: "优化" },
  { id: "upd-06", date: "2026-06-11 22:47", title: "新增游戏录像库展示游戏记录", tags: ["游戏", "页面"], category: "功能" },
  { id: "upd-07", date: "2026-06-11 22:37", title: "新增时间线页面并修复杂谈详情全页渲染", tags: ["网站", "UI"], category: "功能" },
  { id: "upd-08", date: "2026-06-11 22:25", title: "从外部仓库集成 TalkDetail 页面与时间线组件", tags: ["杂谈", "组件"], category: "功能" },
  { id: "upd-09", date: "2026-06-11 22:06", title: "新增图库点赞与浏览统计服务端持久化", tags: ["图库", "互动"], category: "功能" },
  { id: "upd-10", date: "2026-06-11 21:51", title: "图库瀑布流按图片原始比例自适应排列", tags: ["图库", "UI"], category: "优化" },
  { id: "upd-11", date: "2026-06-11 21:47", title: "新增图库图片懒加载与首屏高优先级加载", tags: ["图库", "性能"], category: "优化" },
  { id: "upd-12", date: "2026-06-11 21:37", title: "将图库审核并入审核队列并展示缩略图", tags: ["图库", "后台"], category: "重构" },
  { id: "upd-13", date: "2026-06-11 21:10", title: "优化图库图片加载并新增灯箱预览与审核集成", tags: ["图库", "后台"], category: "优化" },
  { id: "upd-14", date: "2026-06-11 20:30", title: "修复图库文件选择上传反馈问题", tags: ["图库", "修复"], category: "修复" },
  { id: "upd-15", date: "2026-06-11 20:23", title: "修复图库上传过期演示认证问题", tags: ["图库", "修复"], category: "修复" },
  { id: "upd-16", date: "2026-06-11 20:11", title: "新增图库用户投稿与反馈功能", tags: ["图库", "社区"], category: "功能" },
  { id: "upd-17", date: "2026-06-11 16:58", title: "修复动画图标悬停崩溃问题", tags: ["UI", "修复"], category: "修复" },
  { id: "upd-18", date: "2026-06-11 16:53", title: "增强杂谈内容数据规范化处理", tags: ["杂谈", "架构"], category: "重构" },
  { id: "upd-19", date: "2026-06-11 16:42", title: "修复杂谈页面异常内容导致崩溃的问题", tags: ["杂谈", "修复"], category: "修复" },
  { id: "upd-20", date: "2026-06-11 16:34", title: "新增杂谈默认录像封面图", tags: ["杂谈", "资源"], category: "功能" },
  { id: "upd-21", date: "2026-06-11 15:39", title: "优化图标动画支持父级悬停触发并更新导航图标", tags: ["UI", "图标"], category: "优化" },
  { id: "upd-22", date: "2026-06-11 15:29", title: "将图标库替换为自定义动画图标组件", tags: ["UI", "图标"], category: "重构" },
  { id: "upd-23", date: "2026-06-11 14:56", title: "修复选项胶囊样式问题并替换剩余原生选择器", tags: ["UI", "组件"], category: "修复" },
  { id: "upd-24", date: "2026-06-11 14:39", title: "用自定义胶囊组件替换原生选择器改善交互体验", tags: ["UI", "组件"], category: "重构" },
  { id: "upd-25", date: "2026-06-10 22:21", title: "新增公开站点工作台供访客查看公告和动态", tags: ["工作台", "页面"], category: "功能" },
  { id: "upd-26", date: "2026-06-10 21:55", title: "修复图片上传格式检测问题", tags: ["图片", "修复"], category: "修复" },
  { id: "upd-27", date: "2026-06-10 21:12", title: "重构杂谈详情数据结构与编辑器", tags: ["杂谈", "架构"], category: "重构" },
  { id: "upd-28", date: "2026-06-10 20:25", title: "修复图库每周图片上传触发问题", tags: ["图库", "修复"], category: "修复" },
  { id: "upd-29", date: "2026-06-10 19:59", title: "重构服务端将配置、存储与路由从主文件分离", tags: ["服务端", "架构"], category: "重构" },
  { id: "upd-30", date: "2026-06-10 19:39", title: "修复审核时通过 SSE 广播实时刷新前台内容", tags: ["服务端", "审核"], category: "修复" },
  { id: "upd-31", date: "2026-06-10 19:32", title: "统一片源库状态文案并增强审核回写与去重逻辑", tags: ["放映", "审核"], category: "重构" },
  { id: "upd-32", date: "2026-06-10 19:22", title: "强化杂谈系统类型并将硬编码日期数据动态化", tags: ["杂谈", "架构"], category: "重构" },
  { id: "upd-33", date: "2026-06-10 19:16", title: "统一图库数据类型并完成多项健壮性修复", tags: ["图库", "架构"], category: "重构" },
  { id: "upd-34", date: "2026-06-10 18:37", title: "新增杂谈录像 JSON 批量导入脚本", tags: ["杂谈", "工具"], category: "功能" },
  { id: "upd-35", date: "2026-06-10 18:11", title: "优化移动端导航体验并清理冗余播放器组件", tags: ["移动端", "UI"], category: "重构" },
  { id: "upd-36", date: "2026-06-10 17:50", title: "图片系统全面优化：懒加载、错误兜底、缩略图生成", tags: ["图片", "性能"], category: "优化" },
  { id: "upd-37", date: "2026-06-10 15:40", title: "支持通过环境变量配置 TMDB API 基础地址", tags: ["放映", "配置"], category: "功能" },
  { id: "upd-38", date: "2026-06-10 15:27", title: "新增 TMDB 刮削诊断功能用于排查放映元数据问题", tags: ["放映", "TMDB"], category: "功能" },
  { id: "upd-39", date: "2026-06-10 15:17", title: "增强放映元数据提供器使其支持多数据源聚合", tags: ["放映", "TMDB"], category: "优化" },
  { id: "upd-40", date: "2026-06-10 14:34", title: "新增 TMDB 元数据补全功能自动填充放映信息", tags: ["放映", "TMDB"], category: "功能" },
  { id: "upd-41", date: "2026-06-10 14:11", title: "模块化拆分反馈渠道与待办事项处理逻辑", tags: ["反馈", "架构"], category: "重构" },
  { id: "upd-42", date: "2026-06-10 13:41", title: "新增独立游戏库页面展示游戏记录", tags: ["游戏", "页面"], category: "功能" },
  { id: "upd-43", date: "2026-06-10 13:04", title: "优化游戏页面将其改造为观影记录库", tags: ["游戏", "架构"], category: "重构" },
  { id: "upd-44", date: "2026-06-10 02:08", title: "在工作台标签栏中展示游戏栏目入口", tags: ["工作台", "UI"], category: "功能" },
  { id: "upd-45", date: "2026-06-10 01:44", title: "将游戏页面改为内容系统驱动使数据可动态配置", tags: ["游戏", "内容"], category: "重构" },
  { id: "upd-46", date: "2026-06-10 00:19", title: "从 Git 提交历史自动生成更新记录文档", tags: ["工具", "文档"], category: "功能" },
  { id: "upd-47", date: "2026-06-09 23:43", title: "优化工作台待办事项与放映控制面板交互", tags: ["工作台", "UI"], category: "优化" },
  { id: "upd-48", date: "2026-06-09 23:33", title: "改善杂谈归档列表的筛选与排序体验", tags: ["杂谈", "UI"], category: "优化" },
  { id: "upd-49", date: "2026-06-09 23:02", title: "优化工作台图库编辑器功能与交互", tags: ["图库", "后台"], category: "优化" },
  { id: "upd-50", date: "2026-06-09 22:27", title: "新增杂谈管理后台控制功能与归档数据", tags: ["杂谈", "后台"], category: "功能" },
  { id: "upd-51", date: "2026-06-09 19:12", title: "恢复原始杂谈页面界面布局", tags: ["杂谈", "UI"], category: "修复" },
  { id: "upd-52", date: "2026-06-09 18:57", title: "新增杂谈页面并重建关于页面设计", tags: ["杂谈", "页面"], category: "功能" },
  { id: "upd-53", date: "2026-06-09 18:15", title: "基于真实数据动态生成放映库各类视图", tags: ["放映", "数据"], category: "功能" },
  { id: "upd-54", date: "2026-06-09 17:17", title: "简化放映内容发布工作流程", tags: ["放映", "后台"], category: "优化" },
  { id: "upd-55", date: "2026-06-09 16:39", title: "新增用户账户设置页面支持修改密码和用户名", tags: ["用户", "设置"], category: "功能" },
  { id: "upd-56", date: "2026-06-09 15:26", title: "优化图库图片发布流程使操作更简洁", tags: ["图库", "后台"], category: "优化" },
  { id: "upd-57", date: "2026-06-09 14:50", title: "更新首页功能特性宣传文案", tags: ["首页", "内容"], category: "优化" },
  { id: "upd-58", date: "2026-06-09 14:26", title: "添加网站 ICP 备案号链接", tags: ["网站", "合规"], category: "功能" },
  { id: "upd-59", date: "2026-06-09 12:35", title: "修复生产环境下所有者账户 ID 配置错误", tags: ["配置", "修复"], category: "修复" },
  { id: "upd-60", date: "2026-06-08 16:48", title: "预设本地 PostgreSQL 数据库生产环境配置", tags: ["部署", "配置"], category: "功能" },
  { id: "upd-61", date: "2026-06-08 16:39", title: "在生产环境配置模板中使用本地文件存储", tags: ["部署", "配置"], category: "功能" },
  { id: "upd-62", date: "2026-06-08 16:15", title: "完成生产环境域名与部署配置", tags: ["部署", "配置"], category: "功能" },
  { id: "upd-63", date: "2026-06-08 16:03", title: "项目初始化并建立基础代码仓库", tags: ["项目", "初始化"], category: "功能" },
  { id: "upd-64", date: "2026-06-08 16:02", title: "建立项目工程基线与构建体系", tags: ["项目", "构建"], category: "功能" }
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
