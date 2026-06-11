import CalendarDays from "./icons/clock-icon";
import MessageCircle from "./icons/message-circle-icon";
import Search from "./icons/magnifier-icon";
import Send from "./icons/send-icon";
import Upload from "./icons/upload-icon";
import X from "./icons/x-icon";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";

import { CONTENT_API_BASE, uploadImageAsset } from "../content/client";
import type { FeedbackSubmission, PlazaSoulItem } from "../content/types";
import { useAuth } from "../contexts/AuthContext";
import { cn } from "../lib/utils";
import { AuthModal } from "./AuthModal";

type PanelMode = "upload" | "feedback" | null;

type BangumiOption = {
  id: string;
  title: string;
  originalTitle?: string;
  year?: string;
  posterUrl?: string;
  url?: string;
};

type UploadDraft = {
  localId: string;
  fileName: string;
  mediaAssetId: string;
  imageUrl: string;
  author: string;
  sourceAnimeTitle: string;
  sourceAnimeId?: string;
  sourceAnimeUrl?: string;
  creationDate: string;
};

type FeedbackIssue = {
  id: string;
  label: string;
  category: FeedbackSubmission["category"];
};

const acceptedImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);
const uploadMaxBytes = 15 * 1024 * 1024;

const feedbackIssues: FeedbackIssue[] = [
  { id: "image_error", label: "图片错误", category: "content" },
  { id: "author_info", label: "作者信息", category: "content" },
  { id: "tag_issue", label: "标签问题", category: "other" },
  { id: "copyright", label: "侵权/版权", category: "copyright" },
  { id: "other", label: "其他", category: "other" }
];

function formatDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function weekFromDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map((part) => Number(part));
  const date = new Date(year, (month || 1) - 1, day || 1);
  const start = new Date(year, 0, 1);
  const diffDays = Math.floor((date.getTime() - start.getTime()) / 86400000);
  return Math.max(1, Math.floor(diffDays / 7) + 1);
}

function fileError(files: File[]) {
  const invalid = files.filter((file) => !acceptedImageTypes.has(file.type));
  if (invalid.length) return `不支持的图片格式：${invalid.map((file) => file.name).join("、")}`;

  const oversized = files.filter((file) => file.size > uploadMaxBytes);
  if (oversized.length) return `图片过大：${oversized.map((file) => `${file.name} ${(file.size / 1024 / 1024).toFixed(1)}MB`).join("、")}，单张限制 15MB`;
  return "";
}

function BangumiSearchCapsule({
  selectedTitle,
  disabled,
  onSelect
}: {
  selectedTitle: string;
  disabled?: boolean;
  onSelect: (option: BangumiOption) => void;
}) {
  const { authFetch } = useAuth();
  const [query, setQuery] = useState(selectedTitle);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [status, setStatus] = useState("");
  const [options, setOptions] = useState<BangumiOption[]>([]);

  useEffect(() => {
    setQuery(selectedTitle);
  }, [selectedTitle]);

  useEffect(() => {
    if (!isOpen || query.trim().length < 2 || disabled) {
      setOptions([]);
      setStatus("");
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsSearching(true);
      setStatus("");
      try {
        const response = await authFetch(`${CONTENT_API_BASE}/api/me/bangumi/search?q=${encodeURIComponent(query.trim())}`, {
          signal: controller.signal
        });
        if (!response.ok) throw new Error(`Bangumi 搜索失败：HTTP ${response.status}`);
        const data = await response.json() as { items?: BangumiOption[] };
        const nextOptions = Array.isArray(data.items) ? data.items : [];
        setOptions(nextOptions);
        setStatus(nextOptions.length ? "" : "没有找到匹配动画");
      } catch (error) {
        if (controller.signal.aborted) return;
        setOptions([]);
        setStatus(error instanceof Error ? error.message : "Bangumi 搜索失败");
      } finally {
        if (!controller.signal.aborted) setIsSearching(false);
      }
    }, 320);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [disabled, isOpen, query]);

  return (
    <div className="relative min-w-[220px] flex-1">
      <div className="flex h-10 items-center gap-2 rounded-full border border-border bg-background px-3 text-xs font-bold transition-colors focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/15">
        <Search className="size-3.5 shrink-0 text-primary" />
        <input
          value={query}
          disabled={disabled}
          onFocus={() => setIsOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          placeholder="搜索动画"
          className="min-w-0 flex-1 bg-transparent text-xs font-bold text-foreground outline-none placeholder:text-muted-foreground"
        />
        {isSearching && <span className="size-2 shrink-0 animate-pulse rounded-full bg-primary" />}
      </div>
      <AnimatePresence>
        {isOpen && (options.length > 0 || status) && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            className="absolute left-0 right-0 top-11 z-20 overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
          >
            {options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  onSelect(option);
                  setQuery(option.title);
                  setIsOpen(false);
                }}
                className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-muted"
              >
                <div className="size-10 shrink-0 overflow-hidden rounded-xl bg-muted">
                  {option.posterUrl ? <img src={option.posterUrl} alt={option.title} className="size-full object-cover" /> : null}
                </div>
                <div className="min-w-0">
                  <div className="line-clamp-1 text-xs font-black text-foreground">{option.title}</div>
                  <div className="line-clamp-1 text-[11px] font-bold text-muted-foreground">{option.year || option.originalTitle || "Bangumi"}</div>
                </div>
              </button>
            ))}
            {status && <div className="px-3 py-2 text-xs font-bold text-muted-foreground">{status}</div>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function PlazaContributionPanel({ visibleSouls }: { visibleSouls: PlazaSoulItem[] }) {
  const { user, authFetch, isLoading } = useAuth();
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const feedbackInputRef = useRef<HTMLInputElement | null>(null);
  const [mode, setMode] = useState<PanelMode>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [uploadDrafts, setUploadDrafts] = useState<UploadDraft[]>([]);
  const [uploadStatus, setUploadStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmittingUpload, setIsSubmittingUpload] = useState(false);
  const [feedbackIssue, setFeedbackIssue] = useState(feedbackIssues[0].id);
  const [feedbackItemId, setFeedbackItemId] = useState("");
  const [feedbackContent, setFeedbackContent] = useState("");
  const [feedbackScreenshots, setFeedbackScreenshots] = useState<string[]>([]);
  const [feedbackStatus, setFeedbackStatus] = useState("");
  const [isUploadingFeedback, setIsUploadingFeedback] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const todayKey = useMemo(() => formatDateKey(), []);
  const batchWeek = useMemo(() => weekFromDateKey(todayKey), [todayKey]);
  const selectedFeedbackIssue = feedbackIssues.find((issue) => issue.id === feedbackIssue) || feedbackIssues[0];
  const selectedFeedbackItem = visibleSouls.find((item) => item.id === feedbackItemId);

  const requireUser = () => {
    if (isLoading) {
      setUploadStatus("正在确认登录状态，请稍后再选择图片");
      setFeedbackStatus("正在确认登录状态，请稍后再提交反馈");
      return false;
    }
    if (user) return true;
    setIsAuthOpen(true);
    return false;
  };

  const openMode = (nextMode: Exclude<PanelMode, null>) => {
    if (!requireUser()) return;
    setMode((current) => current === nextMode ? null : nextMode);
  };

  const updateUploadDraft = (localId: string, patch: Partial<UploadDraft>) => {
    setUploadDrafts((current) => current.map((item) => item.localId === localId ? { ...item, ...patch } : item));
  };

  const removeUploadDraft = (localId: string) => {
    setUploadDrafts((current) => current.filter((item) => item.localId !== localId));
  };

  const handleUploadFiles = async (files?: FileList | null) => {
    if (uploadInputRef.current) uploadInputRef.current.value = "";
    if (!requireUser()) return;

    const selectedFiles = Array.from(files || []);
    if (!selectedFiles.length) return;
    const validationError = fileError(selectedFiles);
    if (validationError) {
      setUploadStatus(validationError);
      return;
    }

    setIsUploading(true);
    setUploadStatus(`正在上传 ${selectedFiles.length} 张图片...`);
    try {
      const uploaded: UploadDraft[] = [];
      for (const file of selectedFiles) {
        const result = await uploadImageAsset(authFetch, file, { scope: "plaza-submission" });
        uploaded.push({
          localId: `${result.asset.id}-${Math.random().toString(36).slice(2, 6)}`,
          fileName: file.name,
          mediaAssetId: result.asset.id,
          imageUrl: result.asset.url,
          author: user?.name || "",
          sourceAnimeTitle: "",
          creationDate: todayKey
        });
      }
      setUploadDrafts((current) => [...current, ...uploaded]);
      setUploadStatus(`已导入 ${uploaded.length} 张图片，继续填写每张图的信息`);
    } catch (error) {
      setUploadStatus(error instanceof Error ? error.message : "上传失败");
    } finally {
      setIsUploading(false);
    }
  };

  const submitUploadDrafts = async () => {
    if (!requireUser()) return;
    if (!uploadDrafts.length) {
      setUploadStatus("请先上传图片");
      return;
    }
    const incomplete = uploadDrafts.find((item) => !item.author.trim() || !item.sourceAnimeTitle.trim());
    if (incomplete) {
      setUploadStatus("请为每张图填写作者和来源动画");
      return;
    }

    setIsSubmittingUpload(true);
    setUploadStatus("正在提交到后台审核...");
    try {
      const response = await authFetch(`${CONTENT_API_BASE}/api/me/plaza/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchDate: todayKey,
          items: uploadDrafts.map((item) => ({
            mediaAssetId: item.mediaAssetId,
            imageUrl: item.imageUrl,
            author: item.author,
            sourceAnimeTitle: item.sourceAnimeTitle,
            sourceAnimeId: item.sourceAnimeId,
            sourceAnimeUrl: item.sourceAnimeUrl,
            creationDate: item.creationDate
          }))
        })
      });
      const data = await response.json().catch(() => ({})) as { error?: string; items?: PlazaSoulItem[] };
      if (!response.ok) throw new Error(data.error || `提交失败：HTTP ${response.status}`);
      setUploadDrafts([]);
      setUploadStatus(`已提交 ${data.items?.length || 0} 张图片，等待管理员审核`);
    } catch (error) {
      setUploadStatus(error instanceof Error ? error.message : "提交失败");
    } finally {
      setIsSubmittingUpload(false);
    }
  };

  const handleFeedbackFiles = async (files?: FileList | null) => {
    if (feedbackInputRef.current) feedbackInputRef.current.value = "";
    if (!requireUser()) return;

    const selectedFiles = Array.from(files || []);
    if (!selectedFiles.length) return;
    const validationError = fileError(selectedFiles);
    if (validationError) {
      setFeedbackStatus(validationError);
      return;
    }

    setIsUploadingFeedback(true);
    setFeedbackStatus(`正在上传 ${selectedFiles.length} 张截图...`);
    try {
      const urls: string[] = [];
      for (const file of selectedFiles) {
        const result = await uploadImageAsset(authFetch, file, { scope: "plaza-feedback" });
        urls.push(result.asset.url);
      }
      setFeedbackScreenshots((current) => [...current, ...urls]);
      setFeedbackStatus(`已添加 ${urls.length} 张截图`);
    } catch (error) {
      setFeedbackStatus(error instanceof Error ? error.message : "截图上传失败");
    } finally {
      setIsUploadingFeedback(false);
    }
  };

  const submitFeedback = async () => {
    if (!requireUser()) return;
    if (feedbackContent.trim().length < 6) {
      setFeedbackStatus("请填写更具体的反馈内容");
      return;
    }

    setIsSubmittingFeedback(true);
    setFeedbackStatus("正在提交反馈...");
    try {
      const response = await authFetch(`${CONTENT_API_BASE}/api/public/feedback-submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: selectedFeedbackIssue.category,
          title: selectedFeedbackItem ? `图库反馈：${selectedFeedbackIssue.label} - ${selectedFeedbackItem.name}` : `图库反馈：${selectedFeedbackIssue.label}`,
          content: feedbackContent,
          submitter: user?.name,
          submitterRole: user?.role || "user",
          source: "plaza",
          imageUrls: feedbackScreenshots,
          metadata: {
            issueType: selectedFeedbackIssue.id,
            issueLabel: selectedFeedbackIssue.label,
            plazaItemId: selectedFeedbackItem?.id || "",
            plazaItemTitle: selectedFeedbackItem?.name || ""
          }
        })
      });
      const data = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) throw new Error(data.error || `反馈提交失败：HTTP ${response.status}`);
      setFeedbackContent("");
      setFeedbackItemId("");
      setFeedbackScreenshots([]);
      setFeedbackIssue(feedbackIssues[0].id);
      setFeedbackStatus("反馈已提交，等待后台处理");
    } catch (error) {
      setFeedbackStatus(error instanceof Error ? error.message : "反馈提交失败");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  return (
    <div className="mb-6 space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => openMode("upload")}
          className={cn("inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-black transition-colors", mode === "upload" ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:text-foreground")}
        >
          <Upload className="size-4" /> 我想补充图片
        </button>
        <button
          type="button"
          onClick={() => openMode("feedback")}
          className={cn("inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-black transition-colors", mode === "feedback" ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:text-foreground")}
        >
          <MessageCircle className="size-4" /> 我想反馈
        </button>
      </div>

      <AnimatePresence initial={false}>
        {mode === "upload" && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, height: 0, y: -8 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -8 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="overflow-visible rounded-2xl border border-border bg-card p-4 shadow-sm"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-black text-foreground">补充图库图片</h2>
                <p className="mt-1 text-sm font-bold text-muted-foreground">上传后先进入后台审核，通过后才会展示在图库里。</p>
              </div>
              <button
                type="button"
                disabled={isUploading || isSubmittingUpload}
                onClick={() => uploadInputRef.current?.click()}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-black text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                <Upload className="size-4" /> {isUploading ? "上传中..." : "上传单张或多张"}
              </button>
              <input ref={uploadInputRef} type="file" className="hidden" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" multiple onChange={(event) => void handleUploadFiles(event.currentTarget.files)} />
            </div>

            {uploadDrafts.length > 1 && (
              <div className="mt-4 rounded-2xl border border-border bg-background p-3">
                <div className="flex flex-wrap items-center gap-2 text-xs font-black text-muted-foreground">
                  <CalendarDays className="size-4 text-primary" />
                  <span>本次上传周卡片</span>
                  <span className="rounded-full bg-primary/10 px-2 py-1 text-primary">{todayKey}</span>
                  <span className="rounded-full bg-muted px-2 py-1">第 {batchWeek} 周</span>
                  <span className="rounded-full bg-muted px-2 py-1">{uploadDrafts.length} 张</span>
                </div>
              </div>
            )}

            {uploadDrafts.length > 0 && (
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                {uploadDrafts.map((item, index) => (
                  <div key={item.localId} className="overflow-visible rounded-2xl border border-border bg-background p-3">
                    <div className="flex gap-3">
                      <div className="aspect-[4/5] w-28 shrink-0 overflow-hidden rounded-xl bg-muted">
                        <img src={item.imageUrl} alt={item.fileName} className="size-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="line-clamp-1 text-sm font-black text-foreground">{item.sourceAnimeTitle || `待填写图片 ${index + 1}`}</div>
                            <div className="line-clamp-1 text-xs font-bold text-muted-foreground">{item.fileName}</div>
                          </div>
                          <button type="button" onClick={() => removeUploadDraft(item.localId)} className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted hover:text-foreground">
                            <X className="size-3.5" />
                          </button>
                        </div>
                        <input
                          value={item.author}
                          onChange={(event) => updateUploadDraft(item.localId, { author: event.target.value })}
                          placeholder="作者名字"
                          className="h-10 w-full rounded-full border border-border bg-card px-3 text-xs font-bold outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                        />
                        <BangumiSearchCapsule
                          selectedTitle={item.sourceAnimeTitle}
                          disabled={isSubmittingUpload}
                          onSelect={(option) => updateUploadDraft(item.localId, {
                            sourceAnimeTitle: option.title,
                            sourceAnimeId: option.id,
                            sourceAnimeUrl: option.url
                          })}
                        />
                        <input
                          type="date"
                          value={item.creationDate}
                          onChange={(event) => updateUploadDraft(item.localId, { creationDate: event.target.value })}
                          className="h-10 w-full rounded-full border border-border bg-card px-3 text-xs font-bold outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs font-bold text-muted-foreground">{uploadStatus || "图片可以批量导入，每张图单独选择来源动画。"}</div>
              <button
                type="button"
                disabled={isUploading || isSubmittingUpload || uploadDrafts.length === 0}
                onClick={() => void submitUploadDrafts()}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-foreground px-4 text-sm font-black text-background shadow-sm transition-colors hover:opacity-90 disabled:opacity-50"
              >
                <Send className="size-4" /> {isSubmittingUpload ? "提交中..." : "提交审核"}
              </button>
            </div>
          </motion.div>
        )}

        {mode === "feedback" && (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, height: 0, y: -8 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -8 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm"
          >
            <div className="flex flex-col gap-3">
              <div>
                <h2 className="text-lg font-black text-foreground">图库反馈</h2>
                <p className="mt-1 text-sm font-bold text-muted-foreground">反馈会进入后台队列，站主处理后更新图库信息。</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {feedbackIssues.map((issue) => (
                  <button
                    key={issue.id}
                    type="button"
                    onClick={() => setFeedbackIssue(issue.id)}
                    className={cn("rounded-full border px-3 py-1.5 text-xs font-black transition-colors", feedbackIssue === issue.id ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground hover:text-foreground")}
                  >
                    {issue.label}
                  </button>
                ))}
              </div>

              <select
                value={feedbackItemId}
                onChange={(event) => setFeedbackItemId(event.target.value)}
                className="h-11 rounded-xl border border-border bg-background px-3 text-sm font-bold outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
              >
                <option value="">关联图库图片（可选）</option>
                {visibleSouls.map((item) => <option key={item.id} value={item.id}>{item.name} / {item.author}</option>)}
              </select>

              <textarea
                value={feedbackContent}
                onChange={(event) => setFeedbackContent(event.target.value)}
                rows={4}
                placeholder="写下你发现的问题或想补充的信息"
                className="resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm font-bold outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
              />

              {feedbackScreenshots.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {feedbackScreenshots.map((url) => (
                    <div key={url} className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
                      <img src={url} alt="反馈截图" className="size-full object-cover" />
                      <button type="button" onClick={() => setFeedbackScreenshots((current) => current.filter((item) => item !== url))} className="absolute right-1 top-1 inline-flex size-6 items-center justify-center rounded-full bg-background/90 text-muted-foreground hover:text-foreground">
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs font-bold text-muted-foreground">{feedbackStatus || "可附加截图，帮助后台快速定位问题。"}</div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={isUploadingFeedback || isSubmittingFeedback}
                    onClick={() => feedbackInputRef.current?.click()}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-black text-foreground hover:bg-muted disabled:opacity-50"
                  >
                    <Upload className="size-4" /> {isUploadingFeedback ? "上传中..." : "上传截图"}
                  </button>
                  <button
                    type="button"
                    disabled={isUploadingFeedback || isSubmittingFeedback}
                    onClick={() => void submitFeedback()}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-foreground px-4 text-sm font-black text-background shadow-sm hover:opacity-90 disabled:opacity-50"
                  >
                    <Send className="size-4" /> {isSubmittingFeedback ? "提交中..." : "提交反馈"}
                  </button>
                </div>
                <input ref={feedbackInputRef} type="file" className="hidden" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" multiple onChange={(event) => void handleFeedbackFiles(event.currentTarget.files)} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}
