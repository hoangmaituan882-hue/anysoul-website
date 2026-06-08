import { useEffect, useMemo, useState } from "react";
import { Archive, CheckCircle2, EyeOff, FileText, Loader2, Plus, RefreshCw, RotateCcw, Save, Search, Send, Tag } from "lucide-react";
import { CONTENT_API_BASE } from "../content/client";
import type { PostRecord, PostStatus, PostVisibility } from "../content/types";
import { ImageUploadField } from "../components/ImageUploadField";
import { useAuth } from "../contexts/AuthContext";
import { cn } from "../lib/utils";

type PostAdminDraft = {
  id?: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverUrl: string;
  tagsText: string;
  visibility: PostVisibility;
};

const emptyDraft: PostAdminDraft = {
  title: "",
  slug: "",
  summary: "",
  content: "",
  coverUrl: "",
  tagsText: "",
  visibility: "public"
};

const statusLabels: Record<PostStatus | "all", string> = {
  all: "全部",
  draft: "草稿",
  pending: "待审核",
  published: "已发布",
  hidden: "已隐藏",
  rejected: "已退回",
  archived: "已归档"
};

const statusClassNames: Record<PostStatus, string> = {
  draft: "border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300",
  pending: "border-amber-300 bg-amber-100 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
  published: "border-emerald-300 bg-emerald-100 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
  hidden: "border-sky-300 bg-sky-100 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300",
  rejected: "border-rose-300 bg-rose-100 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300",
  archived: "border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
};

function formatDate(value?: string) {
  if (!value) return "暂无";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function parseTags(value: string) {
  return Array.from(new Set(value.split(/[,，\n]/).map((tag) => tag.trim()).filter(Boolean))).slice(0, 12);
}

function postToDraft(post: PostRecord): PostAdminDraft {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    summary: post.summary || "",
    content: post.content,
    coverUrl: post.coverUrl || "",
    tagsText: post.tags.join("，"),
    visibility: post.visibility
  };
}

async function readAdminJsonError(response: Response, fallback: string) {
  const data = await response.json().catch(() => ({})) as { error?: string };
  return data.error || fallback;
}

export function PostAdminPanel({ readOnly = false }: { readOnly?: boolean }) {
  const { authFetch } = useAuth();
  const [posts, setPosts] = useState<PostRecord[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState<PostAdminDraft>(emptyDraft);
  const [filter, setFilter] = useState<PostStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("正在加载文章...");
  const [isBusy, setIsBusy] = useState(false);

  const selectedPost = useMemo(() => posts.find((post) => post.id === selectedId), [posts, selectedId]);
  const counts = useMemo(() => posts.reduce<Record<PostStatus, number>>((acc, post) => {
    acc[post.status] += 1;
    return acc;
  }, { draft: 0, pending: 0, published: 0, hidden: 0, rejected: 0, archived: 0 }), [posts]);

  async function loadPosts(nextFilter = filter, nextQuery = query) {
    setIsBusy(true);
    setStatus("正在同步文章...");

    try {
      const search = new URLSearchParams();
      search.set("status", nextFilter);
      if (nextQuery.trim()) search.set("q", nextQuery.trim());
      const response = await authFetch(`${CONTENT_API_BASE}/api/admin/posts?${search.toString()}`);
      if (!response.ok) throw new Error(await readAdminJsonError(response, "文章加载失败"));
      const data = await response.json() as { posts: PostRecord[] };
      setPosts(data.posts);
      setStatus(`已同步 ${data.posts.length} 篇文章。`);
      const nextSelected = selectedId ? data.posts.find((post) => post.id === selectedId) : data.posts[0];
      if (nextSelected) {
        setSelectedId(nextSelected.id);
        setDraft(postToDraft(nextSelected));
      } else if (!selectedId) {
        setDraft(emptyDraft);
      }
    } catch (error) {
      setPosts([]);
      setStatus(error instanceof Error ? error.message : "文章加载失败");
    } finally {
      setIsBusy(false);
    }
  }

  useEffect(() => {
    void loadPosts();
  }, []);

  async function persist(nextStatus: PostStatus) {
    if (readOnly) {
      setStatus("只读模式无法修改文章");
      return;
    }

    setIsBusy(true);
    setStatus(`${statusLabels[nextStatus]}中...`);

    const payload = {
      title: draft.title,
      slug: draft.slug || undefined,
      summary: draft.summary || undefined,
      content: draft.content,
      coverUrl: draft.coverUrl || undefined,
      tags: parseTags(draft.tagsText),
      visibility: draft.visibility,
      status: nextStatus
    };

    try {
      const response = await authFetch(draft.id ? `${CONTENT_API_BASE}/api/admin/posts/${draft.id}` : `${CONTENT_API_BASE}/api/admin/posts`, {
        method: draft.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(await readAdminJsonError(response, "保存失败"));
      const data = await response.json() as { post: PostRecord };
      setSelectedId(data.post.id);
      setDraft(postToDraft(data.post));
      setStatus(`${statusLabels[data.post.status]}成功：${data.post.title}`);
      await loadPosts(filter, query);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "保存失败");
    } finally {
      setIsBusy(false);
    }
  }

  function startNewPost() {
    setSelectedId("");
    setDraft(emptyDraft);
    setStatus("正在创建新文章草稿。");
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground"><FileText className="size-6 text-primary" /> 文章系统</h2>
          <p className="mt-1 text-sm text-muted-foreground">管理博客、记录和用户投稿。发布后会出现在前台文章页，退回后作者可继续修改。</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={startNewPost} className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-bold hover:bg-muted">
            <Plus className="size-4" /> 新文章
          </button>
          <button onClick={() => loadPosts()} className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-bold hover:bg-muted">
            <RefreshCw className={cn("size-4", isBusy && "animate-spin")} /> 刷新
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
        {(["draft", "pending", "published", "hidden", "rejected", "archived"] as PostStatus[]).map((item) => (
          <button key={item} onClick={() => { setFilter(item); void loadPosts(item, query); }} className={cn("rounded-xl border p-3 text-left transition-colors", filter === item ? "border-primary/40 bg-primary/10" : "border-border bg-background hover:bg-muted/40")}>
            <div className="text-xs font-black text-muted-foreground">{statusLabels[item]}</div>
            <div className="mt-1 text-2xl font-black text-foreground">{counts[item]}</div>
          </button>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[320px_1fr]">
        <aside className="rounded-xl border border-border bg-background shadow-sm">
          <div className="border-b border-border p-3">
            <div className="flex gap-2">
              <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-border bg-card px-3">
                <Search className="size-4 text-muted-foreground" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => event.key === "Enter" && loadPosts(filter, query)} className="h-10 min-w-0 flex-1 bg-transparent text-sm font-bold outline-none" placeholder="搜索标题/作者" />
              </div>
              <button onClick={() => loadPosts(filter, query)} className="rounded-lg bg-foreground px-3 text-sm font-bold text-background">搜索</button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(["all", "pending", "published", "draft"] as Array<PostStatus | "all">).map((item) => (
                <button key={item} onClick={() => { setFilter(item); void loadPosts(item, query); }} className={cn("rounded-full border px-3 py-1 text-xs font-black", filter === item ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:text-foreground")}>{statusLabels[item]}</button>
              ))}
            </div>
          </div>

          <div className="max-h-[680px] space-y-1 overflow-y-auto p-2">
            {posts.map((post) => (
              <button key={post.id} onClick={() => { setSelectedId(post.id); setDraft(postToDraft(post)); }} className={cn("w-full rounded-lg border p-3 text-left transition-colors", selectedId === post.id ? "border-primary/40 bg-primary/10" : "border-transparent hover:bg-muted/50")}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-black text-foreground">{post.title}</div>
                    <div className="mt-1 truncate text-xs font-bold text-muted-foreground">{post.authorName || "未知作者"} · {formatDate(post.updatedAt)}</div>
                  </div>
                  <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-black", statusClassNames[post.status])}>{statusLabels[post.status]}</span>
                </div>
              </button>
            ))}
            {!posts.length ? <div className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm font-bold text-muted-foreground">暂无文章</div> : null}
          </div>
        </aside>

        <section className="rounded-xl border border-border bg-background shadow-sm">
          <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-sm font-black text-foreground">{draft.id ? "编辑文章" : "新建文章"}</div>
              <div className="mt-0.5 text-xs font-bold text-muted-foreground">{selectedPost ? `${statusLabels[selectedPost.status]} · ${selectedPost.slug}` : "保存后会自动生成唯一 slug"}</div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => persist("draft")} disabled={isBusy || readOnly} className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-black hover:bg-muted disabled:opacity-50">
                <Save className="size-4" /> 保存草稿
              </button>
              <button onClick={() => persist("published")} disabled={isBusy || readOnly} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-black text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                <Send className="size-4" /> 发布
              </button>
              <button onClick={() => persist("rejected")} disabled={isBusy || readOnly || !draft.id} className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-black text-rose-700 hover:bg-rose-100 disabled:opacity-50 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">
                <RotateCcw className="size-4" /> 退回
              </button>
              <button onClick={() => persist("hidden")} disabled={isBusy || readOnly || !draft.id} className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-black hover:bg-muted disabled:opacity-50">
                <EyeOff className="size-4" /> 隐藏
              </button>
            </div>
          </div>

          <fieldset disabled={readOnly || isBusy} className="space-y-4 p-4 disabled:opacity-70">
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1.5">
                <span className="text-xs font-black text-muted-foreground">标题</span>
                <input value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} className="h-11 w-full rounded-lg border border-border bg-card px-3 text-sm font-bold outline-none focus:border-primary/50" />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-black text-muted-foreground">Slug</span>
                <input value={draft.slug} onChange={(event) => setDraft((current) => ({ ...current, slug: event.target.value }))} className="h-11 w-full rounded-lg border border-border bg-card px-3 text-sm font-bold outline-none focus:border-primary/50" placeholder="留空自动生成" />
              </label>
            </div>

            <label className="space-y-1.5">
              <span className="text-xs font-black text-muted-foreground">摘要</span>
              <textarea value={draft.summary} onChange={(event) => setDraft((current) => ({ ...current, summary: event.target.value }))} rows={2} className="w-full resize-none rounded-lg border border-border bg-card px-3 py-2 text-sm leading-6 outline-none focus:border-primary/50" />
            </label>

            <div className="grid gap-3 md:grid-cols-[1fr_160px]">
              <ImageUploadField label="封面图片" value={draft.coverUrl} onChange={(value) => setDraft((current) => ({ ...current, coverUrl: value }))} admin readOnly={readOnly || isBusy} scope="post-cover" />
              <label className="space-y-1.5">
                <span className="text-xs font-black text-muted-foreground">可见性</span>
                <select value={draft.visibility} onChange={(event) => setDraft((current) => ({ ...current, visibility: event.target.value as PostVisibility }))} className="h-11 w-full rounded-lg border border-border bg-card px-3 text-sm font-bold outline-none focus:border-primary/50">
                  <option value="public">公开</option>
                  <option value="unlisted">不进列表</option>
                  <option value="private">私密</option>
                </select>
              </label>
            </div>

            <label className="space-y-1.5">
              <span className="flex items-center gap-1.5 text-xs font-black text-muted-foreground"><Tag className="size-3.5" /> 标签</span>
              <input value={draft.tagsText} onChange={(event) => setDraft((current) => ({ ...current, tagsText: event.target.value }))} className="h-11 w-full rounded-lg border border-border bg-card px-3 text-sm font-bold outline-none focus:border-primary/50" placeholder="用逗号分隔" />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-black text-muted-foreground">正文</span>
              <textarea value={draft.content} onChange={(event) => setDraft((current) => ({ ...current, content: event.target.value }))} rows={18} className="w-full resize-y rounded-lg border border-border bg-card px-3 py-3 text-sm leading-7 outline-none focus:border-primary/50" placeholder="支持简单 Markdown：# 标题、- 列表、空行分段" />
            </label>
          </fieldset>

          <div className="flex flex-col gap-2 border-t border-border bg-muted/20 px-4 py-3 text-xs font-bold text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span className="inline-flex items-center gap-2">{isBusy ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4 text-emerald-500" />} {status}</span>
            {selectedPost?.status === "published" ? (
              <a href={`#posts/${encodeURIComponent(selectedPost.slug)}`} className="inline-flex items-center gap-1.5 text-primary hover:underline">查看前台文章</a>
            ) : (
              <span className="inline-flex items-center gap-1.5"><Archive className="size-3.5" /> 修订会自动写入 post_revisions</span>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
