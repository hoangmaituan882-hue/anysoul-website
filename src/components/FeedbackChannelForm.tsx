import { useState, type FormEvent } from "react";
import { ImagePlus, Send, X } from "lucide-react";
import { appendLocalFeedbackSubmission, CONTENT_API_BASE, uploadPublicImageAsset } from "../content/client";
import type { FeedbackSubmission } from "../content/types";
import { useAuth } from "../contexts/AuthContext";
import { cn } from "../lib/utils";

type FeedbackDraft = {
  category: FeedbackSubmission["category"];
  title: string;
  content: string;
  contact: string;
  imageUrls: string[];
};

type FeedbackChannelFormProps = {
  source?: NonNullable<FeedbackSubmission["source"]>;
  metadata?: Record<string, string>;
  initialTitle?: string;
  titlePlaceholder?: string;
  contentPlaceholder?: string;
  submitLabel?: string;
  compact?: boolean;
  onSubmitted?: (submission: FeedbackSubmission) => void;
};

const categoryOptions: Array<{ value: FeedbackSubmission["category"]; label: string }> = [
  { value: "content", label: "内容修正" },
  { value: "copyright", label: "版权/权益" },
  { value: "bug", label: "问题反馈" },
  { value: "feature", label: "功能建议" },
  { value: "other", label: "其他" }
];

function roleFromUser(role?: string): NonNullable<FeedbackSubmission["submitterRole"]> {
  if (role === "owner" || role === "admin" || role === "user") return role;
  return "visitor";
}

export function FeedbackChannelForm({
  source = "about",
  metadata,
  initialTitle = "",
  titlePlaceholder = "例如：某张图片来源需要补充说明",
  contentPlaceholder = "请写明页面位置、问题描述、希望如何处理。",
  submitLabel = "提交意见",
  compact = false,
  onSubmitted
}: FeedbackChannelFormProps) {
  const { user, authFetch } = useAuth();
  const [draft, setDraft] = useState<FeedbackDraft>({ category: "content", title: initialTitle, content: "", contact: "", imageUrls: [] });
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  async function uploadImage(file?: File) {
    if (!file) return;
    setIsUploading(true);
    setStatus("正在上传图片...");
    try {
      const result = await uploadPublicImageAsset(file, { scope: source === "screening_nomination" ? "feedback-nomination" : "feedback" });
      setDraft((current) => ({ ...current, imageUrls: [...current.imageUrls, result.asset.url].slice(0, 6) }));
      setStatus("图片已上传，可继续补充说明后提交。");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "图片上传失败");
    } finally {
      setIsUploading(false);
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setStatus("");

    if (!draft.title.trim() || draft.content.trim().length < 6) {
      setStatus("请填写标题，并至少写 6 个字的具体意见。");
      return;
    }

    const payload = {
      category: draft.category,
      title: draft.title.trim(),
      content: draft.content.trim(),
      contact: draft.contact.trim(),
      submitter: user?.name || "游客",
      submitterRole: roleFromUser(user?.role),
      source,
      imageUrls: draft.imageUrls,
      metadata
    };

    setIsSubmitting(true);
    try {
      const response = await authFetch(`${CONTENT_API_BASE}/api/public/feedback-submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json() as { submission?: FeedbackSubmission; error?: string; blocked?: boolean; blockedWord?: string };
      if (!response.ok || !data.submission) throw new Error(data.error || "提交失败");
      setDraft({ category: "content", title: initialTitle, content: "", contact: "", imageUrls: [] });
      if (data.blocked) {
        window.alert(`提交已被自动拒绝：命中违禁词「${data.blockedWord || "未知"}」。`);
        setStatus("提交已进入后台记录，但因违禁词被自动标记为已拒绝。");
      } else {
        setStatus("已提交到后台待办，管理员会在工作台审核处理。");
      }
      onSubmitted?.(data.submission);
    } catch (error) {
      const localSubmission: FeedbackSubmission = {
        id: `local-feedback-${Date.now()}`,
        category: payload.category,
        title: payload.title,
        content: payload.content,
        contact: payload.contact || undefined,
        submitter: payload.submitter,
        submitterRole: payload.submitterRole,
        source,
        imageUrls: payload.imageUrls,
        metadata,
        status: "pending",
        createdAt: new Date().toISOString()
      };
      appendLocalFeedbackSubmission(localSubmission);
      setDraft({ category: "content", title: initialTitle, content: "", contact: "", imageUrls: [] });
      setStatus(error instanceof Error ? `内容服务暂不可用，已保存到本地待办：${error.message}` : "内容服务暂不可用，已保存到本地待办。");
      onSubmitted?.(localSubmission);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className={cn("grid gap-3 rounded-[1.5rem] border border-border bg-card p-4 text-left sm:p-5", !compact && "mt-8")}>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[170px_1fr]">
        <label className="grid gap-1.5">
          <span className="text-xs font-bold text-muted-foreground">类型</span>
          <select value={draft.category} onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value as FeedbackSubmission["category"] }))} className="h-11 rounded-xl border border-border bg-background px-3 text-sm font-bold outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15">
            {categoryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label className="grid gap-1.5">
          <span className="text-xs font-bold text-muted-foreground">标题</span>
          <input value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} className="h-11 rounded-xl border border-border bg-background px-3 text-sm font-bold outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15" placeholder={titlePlaceholder} />
        </label>
      </div>

      <label className="grid gap-1.5">
        <span className="text-xs font-bold text-muted-foreground">详细描述</span>
        <textarea value={draft.content} onChange={(event) => setDraft((current) => ({ ...current, content: event.target.value }))} rows={compact ? 3 : 4} className="resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium leading-relaxed outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15" placeholder={contentPlaceholder} />
      </label>

      <div className="grid gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative inline-flex h-10 cursor-pointer items-center gap-2 overflow-hidden rounded-xl border border-border bg-background px-3 text-xs font-black text-muted-foreground transition-colors hover:bg-muted">
            <ImagePlus className="size-4" /> {isUploading ? "上传中..." : "上传图片"}
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" className="absolute inset-0 cursor-pointer opacity-0" disabled={isUploading || isSubmitting || draft.imageUrls.length >= 6} onChange={(event) => { void uploadImage(event.currentTarget.files?.[0]); event.currentTarget.value = ""; }} />
          </label>
          <span className="text-xs font-bold text-muted-foreground">最多 6 张，支持截图或参考图。</span>
        </div>
        {draft.imageUrls.length > 0 && (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {draft.imageUrls.map((url) => (
              <div key={url} className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-muted">
                <img src={url} alt="反馈图片" className="size-full object-cover" />
                <button type="button" onClick={() => setDraft((current) => ({ ...current, imageUrls: current.imageUrls.filter((item) => item !== url) }))} className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100">
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto] md:items-end">
        <label className="grid gap-1.5">
          <span className="text-xs font-bold text-muted-foreground">联系方式（可选）</span>
          <input value={draft.contact} onChange={(event) => setDraft((current) => ({ ...current, contact: event.target.value }))} className="h-11 rounded-xl border border-border bg-background px-3 text-sm font-medium outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15" placeholder="邮箱 / B站 / 其他联系方式" />
        </label>
        <button disabled={isSubmitting || isUploading} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50">
          <Send className="size-4" /> {isSubmitting ? "提交中..." : submitLabel}
        </button>
      </div>
      {status ? <div className="rounded-xl border border-border bg-background px-3 py-2 text-sm font-bold text-muted-foreground">{status}</div> : null}
    </form>
  );
}
