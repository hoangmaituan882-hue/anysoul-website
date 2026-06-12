import GraduationCap from "../components/icons/user-icon";
import History from "../components/icons/history-circle-icon";
import MessageSquareText from "../components/icons/message-circle-icon";
import Search from "../components/icons/magnifier-icon";
import ShieldAlert from "../components/icons/shield-check";
import Sparkles from "../components/icons/sparkles-icon";
import Wrench from "../components/icons/gear-icon";
import ArrowUpRight from "../components/icons/external-link-icon";
import { Github } from "lucide-react";
import { motion } from "motion/react";

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
  },
  {
    id: "github",
    number: "07",
    title: "开源 仓库",
    shortTitle: "GitHub",
    icon: Github,
    color: "text-zinc-500",
    bg: "bg-zinc-500/10",
    summary: "本项目已在 GitHub 完全开源，欢迎交流与 Star ⭐️",
    body: "如果你对本站的开发架构、UI 交互或实现细节感兴趣，可以访问代码仓库。也欢迎提交 Issue 或 PR 共同完善！"
  }
];

export function About() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 md:py-12">
      <div className="mb-8 md:mb-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 shadow-sm md:px-4 md:py-1.5">
          <Sparkles className="size-3.5 text-primary md:size-4" />
          <span className="text-xs font-black tracking-widest text-muted-foreground md:text-sm">ABOUT</span>
        </div>
        <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl md:mt-6 md:text-6xl lg:text-7xl">关于本站</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:mt-6 md:text-lg">
          一个把放映会、图库、文章、投稿、后台监控和部署实践串在一起的个人内容站。
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
        
        {/* Card 1: 数据来源 - Spans 2 cols, 1 row */}
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.5, delay:0}} className="group relative col-span-1 flex flex-col justify-between overflow-hidden rounded-[2rem] border border-border bg-card p-6 shadow-sm transition hover:shadow-lg md:col-span-2 md:p-8">
           <div className="absolute -right-10 -top-10 size-40 rounded-full bg-blue-500/10 blur-3xl transition-colors group-hover:bg-blue-500/20" />
           <div className="relative z-10 flex items-center justify-between">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500 backdrop-blur">
                <Search className="size-6" />
              </div>
              <span className="text-sm font-black text-muted-foreground">01</span>
           </div>
           <div className="relative z-10 mt-8 md:mt-16">
              <h2 className="text-2xl font-black tracking-tight sm:text-3xl md:text-4xl">数据来源</h2>
              <p className="mt-3 text-lg font-bold text-foreground">{aboutData[0].summary}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{aboutData[0].body}</p>
           </div>
        </motion.div>

        {/* Card 2: 毕业设计 - Spans 2 cols */}
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.5, delay:0.1}} className="group relative col-span-1 flex flex-col justify-between overflow-hidden rounded-[2rem] border border-border bg-card p-6 shadow-sm transition hover:shadow-lg md:col-span-2 md:p-8">
           <div className="absolute -right-10 -top-10 size-40 rounded-full bg-emerald-500/10 blur-3xl transition-colors group-hover:bg-emerald-500/20" />
           <div className="relative z-10 flex items-center justify-between">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 backdrop-blur">
                <GraduationCap className="size-6" />
              </div>
              <span className="text-sm font-black text-muted-foreground">02</span>
           </div>
           <div className="relative z-10 mt-8 md:mt-16">
              <h2 className="text-2xl font-black tracking-tight sm:text-3xl md:text-4xl">毕业设计</h2>
              <p className="mt-3 text-lg font-bold text-foreground">{aboutData[1].summary}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{aboutData[1].body}</p>
           </div>
        </motion.div>

        {/* Card 3: 古法匠人 - Spans 1 col */}
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.5, delay:0.2}} className="group relative col-span-1 flex flex-col overflow-hidden rounded-[2rem] border border-border bg-card p-6 shadow-sm transition hover:shadow-lg lg:col-span-1">
           <div className="absolute -left-10 -top-10 size-32 rounded-full bg-amber-500/10 blur-3xl transition-colors group-hover:bg-amber-500/20" />
           <div className="relative z-10 mb-6 flex items-center justify-between">
              <div className="flex size-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 backdrop-blur">
                <Wrench className="size-5" />
              </div>
              <span className="text-sm font-black text-muted-foreground">03</span>
           </div>
           <h3 className="relative z-10 text-xl font-black tracking-tight">古法匠人</h3>
           <p className="relative z-10 mt-2 text-sm font-bold text-foreground">{aboutData[2].summary}</p>
           <p className="relative z-10 mt-1 text-xs leading-relaxed text-muted-foreground">{aboutData[2].body}</p>
        </motion.div>

        {/* Card 4: 免责声明 - Spans 1 col */}
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.5, delay:0.3}} className="group relative col-span-1 flex flex-col overflow-hidden rounded-[2rem] border border-border bg-card p-6 shadow-sm transition hover:shadow-lg lg:col-span-1">
           <div className="absolute -left-10 -bottom-10 size-32 rounded-full bg-rose-500/10 blur-3xl transition-colors group-hover:bg-rose-500/20" />
           <div className="relative z-10 mb-6 flex items-center justify-between">
              <div className="flex size-12 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 backdrop-blur">
                <ShieldAlert className="size-5" />
              </div>
              <span className="text-sm font-black text-muted-foreground">04</span>
           </div>
           <h3 className="relative z-10 text-xl font-black tracking-tight">免责声明</h3>
           <p className="relative z-10 mt-2 text-sm font-bold text-foreground">{aboutData[3].summary}</p>
           <p className="relative z-10 mt-1 text-xs leading-relaxed text-muted-foreground">{aboutData[3].body}</p>
        </motion.div>

        {/* Card 5: 意见反馈 - Spans 2 cols */}
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.5, delay:0.4}} className="group relative col-span-1 flex flex-col overflow-hidden rounded-[2rem] border border-border bg-card p-6 shadow-sm transition hover:shadow-lg md:col-span-2 md:row-span-2 md:p-8">
           <div className="absolute -right-10 -bottom-10 size-64 rounded-full bg-violet-500/10 blur-3xl transition-colors group-hover:bg-violet-500/20" />
           <div className="relative z-10 flex flex-col md:flex-row md:items-start md:justify-between">
             <div>
               <div className="flex size-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-500 backdrop-blur">
                  <MessageSquareText className="size-6" />
               </div>
               <h2 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl">意见反馈</h2>
               <p className="mt-2 text-sm font-bold text-foreground">{aboutData[4].summary}</p>
               <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">{aboutData[4].body}</p>
             </div>
             <span className="absolute right-0 top-0 text-sm font-black text-muted-foreground md:relative">05</span>
           </div>
           <div className="relative z-10 mt-8 flex-1 rounded-2xl bg-background/50 p-4 border border-border/50">
             <FeedbackChannelForm source="about" />
           </div>
        </motion.div>

        {/* Card 6: 更新记录 - Spans 2 cols */}
        <motion.a href="#changelog" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.5, delay:0.5}} className="group relative col-span-1 flex flex-col overflow-hidden rounded-[2rem] border border-border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg lg:col-span-2 md:p-8">
           <div className="absolute -right-10 -top-10 size-40 rounded-full bg-sky-500/10 blur-3xl transition-colors group-hover:bg-sky-500/20" />
           <div className="relative z-10 flex items-center justify-between">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-500 backdrop-blur group-hover:scale-110 transition-transform">
                <History className="size-6" />
              </div>
              <ArrowUpRight className="size-6 text-muted-foreground opacity-50 transition-all group-hover:text-sky-500 group-hover:opacity-100" />
           </div>
           <div className="relative z-10 mt-8">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black tracking-tight sm:text-3xl">更新记录</h2>
                <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-xs font-black text-sky-500">06</span>
              </div>
              <p className="mt-3 text-lg font-bold text-foreground">{aboutData[5].summary}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{aboutData[5].body}</p>
           </div>
        </motion.a>

        {/* Card 7: GitHub 开源仓库 - Spans full width on large, 2 cols on medium */}
        <motion.a href="https://github.com/hoangmaituan882-hue/anysoul-website" target="_blank" rel="noopener noreferrer" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.5, delay:0.6}} className="group relative col-span-1 flex flex-col md:flex-row md:items-center justify-between overflow-hidden rounded-[2rem] border border-border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg md:col-span-2 lg:col-span-4 md:p-8">
           <div className="absolute right-0 top-0 size-64 rounded-full bg-zinc-500/10 blur-3xl transition-colors group-hover:bg-zinc-500/20" />
           <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6 w-full">
              <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-zinc-500/10 text-zinc-500 backdrop-blur group-hover:scale-110 transition-transform">
                <Github className="size-8" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-black tracking-tight sm:text-3xl">开源仓库</h2>
                  <span className="rounded-full bg-zinc-500/10 px-2 py-0.5 text-xs font-black text-zinc-500">07</span>
                </div>
                <p className="mt-3 text-lg font-bold text-foreground">{aboutData[6].summary}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground max-w-3xl">{aboutData[6].body}</p>
              </div>
              <div className="mt-6 md:mt-0 md:flex shrink-0 items-center justify-center self-start md:self-center">
                 <div className="flex items-center gap-2 rounded-full bg-zinc-100 dark:bg-zinc-800/50 px-4 py-2 text-sm font-bold text-zinc-600 dark:text-zinc-300 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-800 transition-colors">
                   View on GitHub <ArrowUpRight className="size-4" />
                 </div>
              </div>
           </div>
        </motion.a>

      </div>
    </div>
  );
}
