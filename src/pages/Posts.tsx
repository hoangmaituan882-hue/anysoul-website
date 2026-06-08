import { Fragment, useEffect, useMemo, useState } from "react";
import { ArrowLeft, CalendarDays, FileText, Loader2, Lock, MessageCircle, RefreshCw, Search, Send, Tag, UserRound } from "lucide-react";
import { AuthModal } from "../components/AuthModal";
import { CONTENT_API_BASE, createPostComment, fetchPostComments, fetchPublicPost, fetchPublicPosts } from "../content/client";
import type { PostCommentRecord, PublicPostDetail, PublicPostSummary } from "../content/types";
import { useAuth } from "../contexts/AuthContext";
import { cn } from "../lib/utils";

type BlogComment = Pick<PostCommentRecord, "id" | "postSlug" | "authorId" | "authorName" | "content" | "createdAt">;

type LocalBlogComment = {
  id: string;
  postSlug: string;
  authorId?: string;
  authorName: string;
  content: string;
  createdAt: string;
};

const LOCAL_COMMENTS_KEY = "anysoul-post-comments";

const testBlog: PublicPostDetail = {
  id: "test-owner-blog-2026-06",
  authorId: "site-owner",
  authorName: "站主",
  title: "把网站变成自己的长期记忆库",
  slug: "site-owner-memory-blog",
  summary: "这是一篇用于测试文章详情页的站主博客，记录为什么要把站点从展示页升级成长期可维护的个人内容系统。",
  coverUrl: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1400&q=80",
  tags: ["站主博客", "网站日志", "产品记录", "测试文章"],
  publishedAt: "2026-06-08T08:30:00.000Z",
  createdAt: "2026-06-08T08:00:00.000Z",
  updatedAt: "2026-06-08T08:30:00.000Z",
  content: `# 把网站变成自己的长期记忆库

这个站点一开始更像一个展示橱窗：有首页、有图库、有放映会、有一些功能入口。但如果它只停留在展示层，就很容易变成一次性页面。真正能让网站持续长大的，是稳定记录站主自己的想法、改动、观察和判断。

## 为什么文章区只保留站主发布

文章区不是论坛，也不是开放投稿墙。它更适合承担“站主手记”的角色：

- 记录网站功能为什么这样设计
- 总结每次更新背后的取舍
- 沉淀放映、图库、项目和生活里的长期观察
- 给访客一个理解站点气质的入口

普通用户仍然可以参与，但参与方式应该更轻：阅读、反馈、评论。这样内容主线更清晰，也更容易维护质量。

## 评论区的定位

评论区不是让用户重新写一篇文章，而是让他们在具体文章下留下问题、补充和反馈。站主可以根据评论继续迭代文章，也可以把高质量讨论变成下一篇博客的素材。

## 接下来想做的事

后续文章页可以继续增强几个方向：更好的目录、更清晰的系列归档、更有辨识度的封面风格，以及把评论从本地体验升级为服务端持久化。

这篇测试博客的作用，就是验证列表、详情、封面、标签、正文排版和评论区域是否形成完整闭环。`
};

const fallbackPosts: PublicPostDetail[] = [testBlog];

const defaultComments: BlogComment[] = [
  {
    id: "default-comment-1",
    postSlug: testBlog.slug,
    authorName: "测试读者",
    content: "这个方向很清楚：文章由站主维护，用户只在评论区反馈，整体会更像个人博客。",
    createdAt: "2026-06-08T09:10:00.000Z"
  },
  {
    id: "default-comment-2",
    postSlug: testBlog.slug,
    authorName: "本地演示用户",
    content: "详情页布局比单纯列表更适合沉淀长期内容，后续可以加目录和系列归档。",
    createdAt: "2026-06-08T09:28:00.000Z"
  }
];

function routePostSlug(route: string) {
  if (!route.startsWith("#posts/")) return "";
  return decodeURIComponent(route.replace(/^#posts\/?/, ""));
}

function formatDate(value?: string) {
  if (!value) return "未发布";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("zh-CN", { year: "numeric", month: "short", day: "numeric" });
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function postSummary(post: PublicPostDetail): PublicPostSummary {
  const { content: _content, ...summary } = post;
  return summary;
}

function fallbackSummaries(params: { tag?: string; q?: string } = {}) {
  const query = params.q?.trim().toLowerCase() || "";
  return fallbackPosts
    .filter((post) => !params.tag || post.tags.includes(params.tag))
    .filter((post) => !query || [post.title, post.summary || "", post.content, post.tags.join(" ")].join(" ").toLowerCase().includes(query))
    .map(postSummary);
}

function fallbackTags() {
  return Array.from(new Set(fallbackPosts.flatMap((post) => post.tags)));
}

function readLocalComments() {
  try {
    const parsed = JSON.parse(localStorage.getItem(LOCAL_COMMENTS_KEY) || "[]") as LocalBlogComment[];
    return parsed.filter((comment) => comment.id && comment.postSlug && comment.content.trim());
  } catch {
    return [] as LocalBlogComment[];
  }
}

function writeLocalComments(comments: LocalBlogComment[]) {
  localStorage.setItem(LOCAL_COMMENTS_KEY, JSON.stringify(comments.slice(0, 500)));
}

function MarkdownLite({ content }: { content: string }) {
  const blocks = content.trim().split(/\n{2,}/).filter(Boolean);

  if (!blocks.length) {
    return <p className="text-muted-foreground">这篇文章暂时没有正文。</p>;
  }

  return (
    <div className="space-y-6">
      {blocks.map((block, index) => {
        const text = block.trim();
        if (text.startsWith("### ")) return <h3 key={index} className="pt-2 text-xl font-black text-foreground">{text.slice(4)}</h3>;
        if (text.startsWith("## ")) return <h2 key={index} className="pt-3 text-2xl font-black tracking-tight text-foreground">{text.slice(3)}</h2>;
        if (text.startsWith("# ")) return <h1 key={index} className="text-3xl font-black tracking-tight text-foreground">{text.slice(2)}</h1>;
        if (text.split("\n").every((line) => line.trim().startsWith("- "))) {
          return (
            <ul key={index} className="space-y-2 rounded-2xl border border-border bg-muted/20 p-5 pl-9 text-[15px] leading-8 text-foreground/85">
              {text.split("\n").map((line, itemIndex) => <li key={itemIndex} className="list-disc">{line.trim().slice(2)}</li>)}
            </ul>
          );
        }
        return <p key={index} className="whitespace-pre-wrap text-[16px] leading-9 text-foreground/85">{text}</p>;
      })}
    </div>
  );
}

function PostCard({ post, featured = false }: { post: PublicPostSummary; featured?: boolean }) {
  return (
    <a
      href={`#posts/${encodeURIComponent(post.slug)}`}
      className={cn(
        "group overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-xl",
        featured ? "grid lg:grid-cols-[1.05fr_0.95fr]" : "grid sm:grid-cols-[220px_1fr]"
      )}
    >
      <div className={cn("relative overflow-hidden bg-muted", featured ? "min-h-[260px] lg:min-h-full" : "min-h-[190px]") }>
        {post.coverUrl ? (
          <img src={post.coverUrl} alt={post.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(244,114,182,0.25),transparent_28%),linear-gradient(135deg,#eef2d9,#f5d0d8_55%,#dbeafe)] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(244,114,182,0.18),transparent_28%),linear-gradient(135deg,#1f2937,#4c1d2f_55%,#164e63)]" />
        )}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/45 to-transparent" />
      </div>
      <div className={cn("flex min-w-0 flex-col justify-between p-5", featured && "lg:p-8")}>
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-bold text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1"><CalendarDays className="size-3.5" /> {formatDate(post.publishedAt || post.createdAt)}</span>
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1"><UserRound className="size-3.5" /> {post.authorName || "站主"}</span>
          </div>
          <h2 className={cn("font-black leading-tight tracking-tight text-foreground group-hover:text-primary", featured ? "text-3xl sm:text-4xl" : "text-2xl")}>{post.title}</h2>
          <p className={cn("mt-3 leading-7 text-muted-foreground", featured ? "text-base" : "line-clamp-3 text-sm")}>{post.summary || "站主暂时没有填写摘要，打开文章查看完整内容。"}</p>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {post.tags.slice(0, 5).map((tag) => (
            <span key={tag} className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-bold text-muted-foreground">{tag}</span>
          ))}
        </div>
      </div>
    </a>
  );
}

function CommentPanel({ post }: { post: PublicPostDetail }) {
  const { user, authFetch } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [localComments, setLocalComments] = useState<BlogComment[]>([]);
  const [remoteComments, setRemoteComments] = useState<BlogComment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState("登录后可以参与这篇文章的评论。");

  useEffect(() => {
    setLocalComments(readLocalComments().filter((comment) => comment.postSlug === post.slug));
    setRemoteComments([]);
    setCommentText("");
    setStatus("登录后可以参与这篇文章的评论。");
    fetchPostComments(post.slug)
      .then((data) => setRemoteComments(data.comments))
      .catch(() => setStatus("评论服务暂不可用，当前使用本地演示评论。"));
  }, [post.slug]);

  const comments = useMemo(() => {
    const seeded = post.slug === testBlog.slug && remoteComments.length === 0 ? defaultComments : [];
    const uniqueComments = new Map([...remoteComments, ...localComments, ...seeded].map((comment) => [comment.id, comment]));
    return Array.from(uniqueComments.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [localComments, remoteComments, post.slug]);

  async function submitComment() {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    const content = commentText.trim();
    if (content.length < 2) {
      setStatus("评论至少需要 2 个字。");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createPostComment(authFetch, post.slug, content);
      setRemoteComments((current) => [result.comment, ...current]);
      setCommentText("");
      setStatus("评论已发布。");
      return;
    } catch (error) {
      setStatus(error instanceof Error ? `${error.message}，已保存到本地演示评论。` : "评论服务不可用，已保存到本地演示评论。");
    } finally {
      setIsSubmitting(false);
    }

    const comment: LocalBlogComment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      postSlug: post.slug,
      authorId: user.id,
      authorName: user.name,
      content: content.slice(0, 800),
      createdAt: new Date().toISOString()
    };
    const nextAllComments = [comment, ...readLocalComments()];
    writeLocalComments(nextAllComments);
    setLocalComments((current) => [comment, ...current]);
    setCommentText("");
  }

  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-sm lg:p-6">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-black text-foreground"><MessageCircle className="size-5 text-primary" /> 评论</h2>
          <p className="mt-1 text-sm text-muted-foreground">用户不能在这里发文章，只能围绕站主博客留言讨论。</p>
        </div>
        <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-black text-muted-foreground">{comments.length} 条评论</span>
      </div>

      <div className="rounded-2xl border border-border bg-background p-3">
        <textarea
          value={commentText}
          onChange={(event) => setCommentText(event.target.value)}
          rows={4}
          className="w-full resize-none bg-transparent px-1 py-1 text-sm leading-7 outline-none placeholder:text-muted-foreground/70"
          placeholder={user ? "写下你的评论，最多 800 字" : "登录后可以评论这篇站主博客"}
        />
        <div className="mt-3 flex flex-col gap-3 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs font-bold text-muted-foreground">{user ? `当前身份：${user.name}` : status}</div>
          <button onClick={() => { void submitComment(); }} disabled={isSubmitting} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-black text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50">
            {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : !user ? <Lock className="size-4" /> : <Send className="size-4" />} {!user ? "登录后评论" : isSubmitting ? "发布中..." : "发布评论"}
          </button>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="rounded-2xl border border-border bg-background p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex items-center gap-2 text-sm font-black text-foreground"><UserRound className="size-4 text-primary" /> {comment.authorName}</div>
              <div className="text-xs font-bold text-muted-foreground">{formatDateTime(comment.createdAt)}</div>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-foreground/80">{comment.content}</p>
          </div>
        ))}
        {!comments.length ? <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm font-bold text-muted-foreground">还没有评论，登录后留下第一条反馈。</div> : null}
      </div>

      <div className="mt-3 text-xs font-bold text-muted-foreground">{status}</div>
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </section>
  );
}

export function Posts({ route }: { route: string }) {
  const slug = routePostSlug(route);
  const [posts, setPosts] = useState<PublicPostSummary[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState("");
  const [query, setQuery] = useState("");
  const [detail, setDetail] = useState<PublicPostDetail | null>(null);
  const [status, setStatus] = useState("正在加载站主博客...");
  const [isLoading, setIsLoading] = useState(true);

  const topTags = useMemo(() => tags.slice(0, 14), [tags]);
  const featuredPost = posts[0];
  const restPosts = posts.slice(1);

  async function loadList() {
    setIsLoading(true);
    setStatus("正在加载站主博客...");
    try {
      const data = await fetchPublicPosts({ tag: selectedTag, q: query });
      const fallback = fallbackSummaries({ tag: selectedTag, q: query });
      const visiblePosts = data.posts.length ? data.posts : fallback;
      const visibleTags = data.tags.length ? data.tags : fallbackTags();
      setPosts(visiblePosts);
      setTags(visibleTags);
      setStatus(visiblePosts.length ? `已加载 ${visiblePosts.length} 篇站主博客。` : "暂时没有匹配的站主博客。");
    } catch (error) {
      const fallback = fallbackSummaries({ tag: selectedTag, q: query });
      setPosts(fallback);
      setTags(fallbackTags());
      setStatus(error instanceof TypeError ? `无法连接内容服务，已展示本地测试博客：${CONTENT_API_BASE}` : "已展示本地测试博客。");
    } finally {
      setIsLoading(false);
    }
  }

  async function loadDetail() {
    if (!slug) return;
    const localPost = fallbackPosts.find((post) => post.slug === slug);
    setIsLoading(true);
    setDetail(null);
    setStatus("正在加载博客详情...");
    try {
      const data = await fetchPublicPost(slug);
      setDetail(data.post);
      setStatus("博客详情已加载。");
    } catch (error) {
      setDetail(localPost || null);
      setStatus(localPost ? "已展示本地测试博客详情。" : error instanceof Error ? error.message : "文章不存在或尚未发布。");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (slug) {
      void loadDetail();
      return;
    }
    setDetail(null);
    void loadList();
  }, [slug]);

  useEffect(() => {
    if (!slug) void loadList();
  }, [selectedTag]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pb-16 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm">
        <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_340px] lg:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(244,114,182,0.18),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.16),transparent_30%)]" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1.5 text-xs font-black text-muted-foreground shadow-sm backdrop-blur">
              <FileText className="size-3.5 text-primary" /> 站主博客
            </div>
            <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight tracking-tight text-foreground sm:text-6xl">只保留站主写作，把讨论留给评论区</h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground">这里是站主自己的博客和网站日志。普通用户不再投稿发文，只能在每篇文章详情页登录后评论，内容主线更集中，也更容易长期维护。</p>
          </div>
          <div className="relative rounded-3xl border border-border bg-background/85 p-5 shadow-sm backdrop-blur">
            <div className="text-sm font-black text-foreground">阅读规则</div>
            <div className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
              <div className="rounded-2xl bg-muted/30 p-3"><span className="font-black text-foreground">站主</span>：在工作台创建、编辑、发布博客。</div>
              <div className="rounded-2xl bg-muted/30 p-3"><span className="font-black text-foreground">用户</span>：阅读文章，在详情页评论反馈。</div>
              <a href={`#posts/${testBlog.slug}`} className="inline-flex w-full items-center justify-center rounded-2xl bg-primary px-4 py-3 text-sm font-black text-primary-foreground transition-colors hover:bg-primary/90">打开测试博客详情</a>
            </div>
          </div>
        </div>
      </section>

      {slug ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          <article className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm">
            <div className="border-b border-border p-5 sm:p-8">
              <a href="#posts" className="mb-6 inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm font-bold text-muted-foreground hover:bg-muted hover:text-foreground">
                <ArrowLeft className="size-4" /> 返回博客列表
              </a>
              {isLoading ? (
                <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground"><Loader2 className="size-4 animate-spin" /> {status}</div>
              ) : detail ? (
                <>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-muted-foreground">
                    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1"><CalendarDays className="size-3.5" /> {formatDate(detail.publishedAt || detail.createdAt)}</span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1"><UserRound className="size-3.5" /> {detail.authorName || "站主"}</span>
                  </div>
                  <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight text-foreground sm:text-6xl">{detail.title}</h1>
                  {detail.summary ? <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">{detail.summary}</p> : null}
                  <div className="mt-6 flex flex-wrap gap-2">
                    {detail.tags.map((tag) => <span key={tag} className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-bold text-muted-foreground">{tag}</span>)}
                  </div>
                </>
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center text-sm font-bold text-muted-foreground">{status}</div>
              )}
            </div>
            {detail?.coverUrl ? <img src={detail.coverUrl} alt={detail.title} className="h-[300px] w-full object-cover sm:h-[420px]" /> : null}
            {detail ? (
              <div className="p-6 sm:p-10">
                <MarkdownLite content={detail.content} />
              </div>
            ) : null}
          </article>

          <aside className="space-y-5 lg:sticky lg:top-24">
            <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
              <div className="text-sm font-black text-foreground">博客说明</div>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">文章只由站主在后台发布。用户侧不再提供写文章入口，详情页保留评论作为反馈渠道。</p>
            </div>
            {detail ? <CommentPanel post={detail} /> : null}
          </aside>
        </div>
      ) : (
        <section className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-black text-foreground">搜索博客</h2>
                <button onClick={loadList} className="rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground"><RefreshCw className={cn("size-4", isLoading && "animate-spin")} /></button>
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-3">
                <Search className="size-4 text-muted-foreground" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => event.key === "Enter" && loadList()} className="h-11 min-w-0 flex-1 bg-transparent text-sm font-bold outline-none" placeholder="搜索标题、内容" />
              </div>
              <button onClick={loadList} className="mt-3 w-full rounded-2xl bg-foreground px-3 py-2.5 text-sm font-black text-background hover:opacity-90">搜索</button>
            </div>
            <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-black text-foreground"><Tag className="size-4 text-primary" /> 标签</h2>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setSelectedTag("")} className={cn("rounded-full border px-3 py-1.5 text-xs font-bold", !selectedTag ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground hover:text-foreground")}>全部</button>
                {topTags.map((tag) => (
                  <button key={tag} onClick={() => setSelectedTag(tag)} className={cn("rounded-full border px-3 py-1.5 text-xs font-bold", selectedTag === tag ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground hover:text-foreground")}>{tag}</button>
                ))}
              </div>
            </div>
          </aside>

          <div className="space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-bold text-muted-foreground">{status}</div>
              {isLoading ? <Loader2 className="size-4 animate-spin text-muted-foreground" /> : null}
            </div>
            {featuredPost ? <PostCard post={featuredPost} featured /> : null}
            <div className="grid gap-5">
              {restPosts.map((post) => (
                <Fragment key={post.id}>
                  <PostCard post={post} />
                </Fragment>
              ))}
            </div>
            {!posts.length && !isLoading ? (
              <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
                <FileText className="mx-auto size-10 text-muted-foreground" />
                <div className="mt-3 text-sm font-black text-foreground">暂无站主博客</div>
                <p className="mt-1 text-sm text-muted-foreground">站主在工作台发布后会显示在这里，用户侧只保留评论能力。</p>
              </div>
            ) : null}
          </div>
        </section>
      )}
    </div>
  );
}
