import { useState } from "react";
import type { FormEvent } from "react";
import { motion } from "motion/react";
import { ShieldAlert, Info, GraduationCap, Search, AlertCircle, Coffee, Send, MessageSquareText } from "lucide-react";
import { appendLocalFeedbackSubmission, CONTENT_API_BASE } from "../content/client";
import type { FeedbackSubmission } from "../content/types";
import { useAuth } from "../contexts/AuthContext";

export function About() {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState({ category: "content", title: "", content: "", contact: "" });
  const [feedbackStatus, setFeedbackStatus] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  async function submitFeedback(event: FormEvent) {
    event.preventDefault();
    setFeedbackStatus("");

    if (!feedback.title.trim() || feedback.content.trim().length < 6) {
      setFeedbackStatus("请填写标题，并至少写 6 个字的具体意见。");
      return;
    }

    setIsSubmittingFeedback(true);
    try {
      const response = await fetch(`${CONTENT_API_BASE}/api/public/feedback-submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...feedback,
          submitter: user?.name || "游客"
        })
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || "提交失败");
      setFeedback({ category: "content", title: "", content: "", contact: "" });
      setFeedbackStatus("已提交到后台待办，管理员会在工作台审核处理。");
    } catch (error) {
      const localSubmission: FeedbackSubmission = {
        id: `local-feedback-${Date.now()}`,
        category: feedback.category as FeedbackSubmission["category"],
        title: feedback.title,
        content: feedback.content,
        contact: feedback.contact || undefined,
        submitter: user?.name || "游客",
        status: "pending",
        createdAt: new Date().toISOString()
      };
      appendLocalFeedbackSubmission(localSubmission);
      setFeedback({ category: "content", title: "", content: "", contact: "" });
      setFeedbackStatus("内容服务暂不可用，已先保存到本地工作台待办。刷新工作台即可查看。");
    } finally {
      setIsSubmittingFeedback(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto w-full px-6 flex flex-col gap-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mt-8 space-y-4"
      >
        <div className="inline-flex items-center justify-center p-3 sm:p-4 bg-primary/10 rounded-full mb-2">
          <Info className="size-8 sm:size-10 text-primary" />
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
          关于本项目
        </h1>
        <p className="text-muted-foreground text-lg sm:text-xl font-medium tracking-wide">
          纯属图一乐 / Just for Fun
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Box 1: Info Source */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-card border border-border rounded-3xl p-8 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
             <Search className="size-32" />
          </div>
          <div className="size-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <Search className="size-6 text-blue-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground mb-2">数据来源</h3>
            <p className="text-muted-foreground leading-relaxed">
              本项目涉及到的人设、头像、事件记录等所有信息，<strong>全部来源于公开网络平台</strong>（如社交媒体、视频网站等）。不涉及任何私密数据获取。
            </p>
          </div>
        </motion.div>

        {/* Box 2: Graduation Project */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-card border border-border rounded-3xl p-8 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
             <GraduationCap className="size-32" />
          </div>
          <div className="size-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <GraduationCap className="size-6 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground mb-2">毕业设计</h3>
            <p className="text-muted-foreground leading-relaxed">
              这是作者的一项<strong>个人毕业设计作品</strong>。旨在探索前端技术与 AI 结合的可能性，通过构建一个具有交互性的界面来进行技术实践和验证。
            </p>
          </div>
        </motion.div>

        {/* Box 3: Handcrafted Platform */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-card border border-border rounded-3xl p-8 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group md:col-span-2"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
             <Coffee className="size-32" />
          </div>
          <div className="size-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
            <Coffee className="size-6 text-amber-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground mb-2">古法手搓匠人 AI</h3>
            <p className="text-muted-foreground leading-relaxed">
              本项目自诩为“<strong>古法手搓匠人 AI</strong>”。虽然利用了现代的 AI 技术进行辅助生成和构建，但背后蕴含着对每一个组件、每一处排版、每一次动画的“手工”调配与执着。它不仅仅是机器的产物，更是融合了开发者与 AI 协作心血的结晶。纯属图一乐，切勿过分当真。
            </p>
          </div>
        </motion.div>

        {/* Box 4: Disclaimer */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-card border border-border border-red-500/20 dark:border-red-500/20 rounded-3xl p-8 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group md:col-span-2 bg-red-500/5"
        >
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity pointer-events-none">
             <ShieldAlert className="size-32 text-red-500" />
          </div>
          <div className="flex items-center gap-3">
             <div className="size-10 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20 shrink-0">
               <AlertCircle className="size-5 text-red-500" />
             </div>
             <h3 className="text-lg font-bold text-foreground text-red-600 dark:text-red-400">免责声明</h3>
          </div>
          <div>
            <p className="text-muted-foreground leading-relaxed text-[15px]">
              本页面及应用仅供学习、交流与娱乐使用，不具有任何商业目的。提到的任何团体、个人、品牌等仅为展示功能需要，<strong>如同人作品一般</strong>。
              <br/><br/>
              如果本页面的任何内容（包括但不限于文字、图像、界面设计）让您感到不适，或者有<strong>侵犯到您的版权、名誉权等合法权益</strong>的情况，请立即联系作者，我们会查实后在<strong>第一时间进行清理和删除</strong>。非常感谢理解与包容！
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="bg-card border border-border rounded-3xl p-8 flex flex-col gap-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group md:col-span-2"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
            <MessageSquareText className="size-32" />
          </div>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
              <MessageSquareText className="size-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">意见通道</h3>
              <p className="text-sm font-medium text-muted-foreground">游客和用户都可以提交意见，内容会进入后台工作台待办卡片等待审核。</p>
            </div>
          </div>

          <form onSubmit={submitFeedback} className="relative z-10 grid gap-3 text-left">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[160px_1fr]">
              <label className="grid gap-1.5">
                <span className="text-xs font-bold text-muted-foreground">类型</span>
                <select value={feedback.category} onChange={(event) => setFeedback((current) => ({ ...current, category: event.target.value }))} className="h-11 rounded-xl border border-border bg-background px-3 text-sm font-bold outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15">
                  <option value="content">内容修正</option>
                  <option value="copyright">版权/权益</option>
                  <option value="bug">问题反馈</option>
                  <option value="feature">功能建议</option>
                  <option value="other">其他</option>
                </select>
              </label>
              <label className="grid gap-1.5">
                <span className="text-xs font-bold text-muted-foreground">标题</span>
                <input value={feedback.title} onChange={(event) => setFeedback((current) => ({ ...current, title: event.target.value }))} className="h-11 rounded-xl border border-border bg-background px-3 text-sm font-bold outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15" placeholder="例如：某张图片来源需要补充说明" />
              </label>
            </div>

            <label className="grid gap-1.5">
              <span className="text-xs font-bold text-muted-foreground">详细意见</span>
              <textarea value={feedback.content} onChange={(event) => setFeedback((current) => ({ ...current, content: event.target.value }))} rows={4} className="resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium leading-relaxed outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15" placeholder="请写明页面位置、问题描述、希望如何处理。" />
            </label>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto] md:items-end">
              <label className="grid gap-1.5">
                <span className="text-xs font-bold text-muted-foreground">联系方式（可选）</span>
                <input value={feedback.contact} onChange={(event) => setFeedback((current) => ({ ...current, contact: event.target.value }))} className="h-11 rounded-xl border border-border bg-background px-3 text-sm font-medium outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15" placeholder="邮箱 / B站 / 其他联系方式" />
              </label>
              <button disabled={isSubmittingFeedback} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50">
                <Send className="size-4" /> {isSubmittingFeedback ? "提交中..." : "提交意见"}
              </button>
            </div>
            {feedbackStatus ? <div className="rounded-xl border border-border bg-background px-3 py-2 text-sm font-bold text-muted-foreground">{feedbackStatus}</div> : null}
          </form>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex items-center justify-center text-sm font-mono text-muted-foreground/60 py-8 mb-8"
      >
        Designed with curiosity · 2026
      </motion.div>
    </div>
  );
}
