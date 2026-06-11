import GraduationCap from "../components/icons/user-icon";
import History from "../components/icons/history-circle-icon";
import MessageSquareText from "../components/icons/message-circle-icon";
import Search from "../components/icons/magnifier-icon";
import ShieldAlert from "../components/icons/shield-check";
import Sparkles from "../components/icons/sparkles-icon";
import Wrench from "../components/icons/gear-icon";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { FeedbackChannelForm } from "../components/FeedbackChannelForm";
import { cn } from "../lib/utils";

const aboutData = [
  {
    id: "source",
    number: "01",
    title: "数据 来源",
    shortTitle: "数据来源",
    icon: Search,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    summary: "站内资料主要整理自公开网络平台和站主手动归档记录。",
    body: "本网站涉及的片源、图片说明、文章和放映会信息，均用于个人学习、记录、整理和展示。公开来源会尽量保留出处线索；如有缺失或需要修正，可以通过意见通道反馈。"
  },
  {
    id: "thesis",
    number: "02",
    title: "毕业 设计",
    shortTitle: "毕业设计",
    icon: GraduationCap,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    summary: "这是一个围绕个人内容站、后台管理和部署实践展开的项目。",
    body: "项目把首页、放映会、图库、文章、用户系统、服务器监控和工作台整合在同一套网站里，用真实部署流程验证前后端协作、内容管理和生产环境维护。"
  },
  {
    id: "craft",
    number: "03",
    title: "古法 匠人",
    shortTitle: "古法匠人",
    icon: Wrench,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    summary: "页面和功能由 AI 辅助生成，再持续手工调整、验证和部署。",
    body: "它不是一次性生成的展示稿，而是边使用边修补的个人站：每一次上传失败、部署报错、交互不顺手，都会变成下一轮优化的输入。"
  },
  {
    id: "disclaimer",
    number: "04",
    title: "免责 声明",
    shortTitle: "免责声明",
    icon: ShieldAlert,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    summary: "网站内容仅供学习、交流、记录与娱乐，不用于商业用途。",
    body: "如果页面中的文字、图片、链接或描述涉及版权、名誉、出处标注等问题，请通过意见通道联系。核实后会尽快修正、隐藏或删除相关内容。"
  },
  {
    id: "feedback",
    number: "05",
    title: "意见 反馈",
    shortTitle: "意见通道",
    icon: MessageSquareText,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    summary: "访客和登录用户都可以提交修正、版权、Bug 或功能建议。",
    body: "提交后会进入工作台待办。内容服务暂时不可用时，也会先保存到本地待办队列，方便后续处理。"
  },
  {
    id: "changelog",
    number: "06",
    title: "更新 记录",
    shortTitle: "更新记录",
    icon: History,
    color: "text-sky-500",
    bg: "bg-sky-500/10",
    summary: "查看网站每次功能调整、部署修复和后台优化的更新履历。",
    body: "更新记录页会沉淀近期网站迭代，包括首页文案、放映会、杂谈回、图库、用户系统、监控和部署相关改动，方便回看每一轮做了什么。"
  }
];

export function About() {
  const [activeIdx, setActiveIdx] = useState(0);

  const active = aboutData[activeIdx];
  const ActiveIcon = active.icon;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 sm:px-6">
      <section className="relative min-h-[72vh] overflow-hidden rounded-[2rem] border border-border bg-[#fbf5ea] p-5 dark:bg-zinc-950 sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-6 top-4 text-[18vw] font-black leading-none tracking-tighter text-foreground/[0.035] sm:text-[150px]">ABOUT</div>
          <div className="absolute -right-28 top-10 h-72 w-72 rounded-full bg-[#a4c639]/20 blur-3xl" />
          <div className="absolute -bottom-28 left-1/4 h-80 w-80 rounded-full bg-rose-400/20 blur-3xl" />
        </div>

        <div className="relative grid min-h-[620px] gap-6 lg:grid-cols-[360px_1fr]">
          <aside className="flex flex-col justify-between gap-6 rounded-[1.5rem] border border-white/70 bg-background/70 p-4 shadow-sm backdrop-blur dark:border-zinc-800">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-black text-primary">
                <Sparkles className="size-3.5" /> linzesss.icu
              </div>
              <h1 className="mt-5 text-4xl font-black tracking-tight text-foreground sm:text-5xl">关于这个站点</h1>
              <p className="mt-4 text-sm font-medium leading-relaxed text-muted-foreground">
                一个把放映会、图库、文章、投稿、后台监控和部署实践串在一起的个人内容站。
              </p>
            </div>

            <div className="space-y-2">
              {aboutData.map((item, index) => {
                const Icon = item.icon;
                const isActive = index === activeIdx;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveIdx(index)}
                    className={cn(
                      "group flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-all",
                      isActive ? "border-primary/30 bg-primary/10 shadow-sm" : "border-transparent bg-card/60 hover:bg-muted/60"
                    )}
                  >
                    <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", item.bg, item.color)}>
                      <Icon className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-black text-muted-foreground">{item.number}</div>
                      <div className="truncate text-sm font-black text-foreground">{item.shortTitle}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <main className="relative overflow-hidden rounded-[1.75rem] border border-border bg-background shadow-sm">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.28 }}
                className="flex min-h-full flex-col p-5 sm:p-8 lg:p-10"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-black uppercase tracking-[0.35em] text-muted-foreground">{active.number}</div>
                    <h2 className="mt-3 max-w-3xl text-5xl font-black leading-none tracking-tight text-foreground sm:text-7xl">{active.title}</h2>
                  </div>
                  <div className={cn("flex size-16 items-center justify-center rounded-[1.5rem]", active.bg, active.color)}>
                    <ActiveIcon className="size-8" />
                  </div>
                </div>

                <p className="mt-8 max-w-2xl text-xl font-black leading-snug text-foreground">{active.summary}</p>
                <p className="mt-4 max-w-3xl text-sm font-medium leading-7 text-muted-foreground sm:text-base">{active.body}</p>

                {active.id === "feedback" ? (
                  <FeedbackChannelForm source="about" />
                ) : active.id === "changelog" ? (
                  <div className="mt-auto pt-10">
                    <a href="#changelog" className="inline-flex items-center gap-2 rounded-2xl bg-foreground px-5 py-3 text-sm font-black text-background shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]">
                      <History className="size-4" /> 进入更新记录
                    </a>
                  </div>
                ) : (
                  <div className="mt-auto grid gap-3 pt-10 sm:grid-cols-3">
                    {[
                      ["内容", "放映会 / 图库 / 文章"],
                      ["管理", "工作台 / 待办 / 监控"],
                      ["部署", "本地存储 / PostgreSQL / PM2"]
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-2xl border border-border bg-card p-4">
                        <div className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
                        <div className="mt-2 text-sm font-black text-foreground">{value}</div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </section>
    </div>
  );
}
