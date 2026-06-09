import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Archive, ArrowDownUp, ArrowUpRight, Bot, Calendar, Clock, Eye, FileDown, Filter, Heart, MessageCircle, Play, Search, Sparkles, Tag } from "lucide-react";
import { TalkModal } from "../components/TalkModal";
import { TopicsModal } from "../components/TopicsModal";
import { defaultTalksContent } from "../content/defaults/talks";
import { useContent } from "../content/useContent";
import type { TalkItem, TalksContent } from "../content/types";
import { useThemeLanguage } from "../contexts/ThemeLanguageContext";
import { cn } from "../lib/utils";

type ArchiveSort = "new" | "hot";

function normalizeTalksContent(value: TalksContent): TalksContent {
  return {
    ...defaultTalksContent,
    ...value,
    hero: { ...defaultTalksContent.hero, ...(value.hero || {}) },
    live: { ...defaultTalksContent.live, ...(value.live || {}) },
    upcoming: Array.isArray(value.upcoming) ? value.upcoming : defaultTalksContent.upcoming,
    weekly: Array.isArray(value.weekly) ? value.weekly : defaultTalksContent.weekly,
    archive: Array.isArray(value.archive) ? value.archive : defaultTalksContent.archive,
    recentUpdates: Array.isArray(value.recentUpdates) ? value.recentUpdates : defaultTalksContent.recentUpdates,
    topArticles: Array.isArray(value.topArticles) ? value.topArticles : defaultTalksContent.topArticles,
    newUploads: Array.isArray(value.newUploads) ? value.newUploads : defaultTalksContent.newUploads,
    topics: Array.isArray(value.topics) ? value.topics : defaultTalksContent.topics
  };
}

export function Talks() {
  const { t } = useThemeLanguage();
  const content = normalizeTalksContent(useContent<TalksContent>("talks.main", defaultTalksContent));
  const [selectedTalk, setSelectedTalk] = useState<TalkItem | null>(null);
  const [showAllArchive, setShowAllArchive] = useState(false);
  const [showTopics, setShowTopics] = useState(false);
  const [query, setQuery] = useState("");
  const [tagFilter, setTagFilter] = useState("all");
  const [sortBy, setSortBy] = useState<ArchiveSort>("new");

  const allTags = useMemo(() => {
    return Array.from(new Set(content.archive.flatMap((talk) => talk.tags))).sort((a, b) => a.localeCompare(b));
  }, [content.archive]);

  const filteredArchive = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return [...content.archive]
      .filter((talk) => tagFilter === "all" || talk.tags.includes(tagFilter))
      .filter((talk) => !keyword || `${talk.title} ${talk.subtitle} ${talk.summary} ${talk.tags.join(" ")}`.toLowerCase().includes(keyword))
      .sort((a, b) => {
        if (sortBy === "hot") return (b.viewers + b.danmaku + b.likes) - (a.viewers + a.danmaku + a.likes);
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
  }, [content.archive, query, sortBy, tagFilter]);

  const previewArchive = showAllArchive ? filteredArchive : filteredArchive.slice(0, 4);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 sm:px-6">
      <section className="relative overflow-hidden rounded-[2rem] border border-border bg-[#fbf5ea] px-5 py-8 dark:bg-zinc-950 sm:px-8 lg:px-10">
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <div className="absolute -right-24 top-12 h-72 w-72 rounded-full bg-[#a4c639]/20 blur-3xl" />
          <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-rose-400/20 blur-3xl" />
        </div>
        <div className="relative grid gap-8 lg:grid-cols-[1fr_460px] lg:items-end">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs font-black uppercase tracking-[0.22em] text-muted-foreground backdrop-blur">
              <Sparkles className="size-3.5 text-primary" /> {content.hero.eyebrow || t("talks.eyebrow")}
            </div>
            <h1 className="text-5xl font-black tracking-tight text-foreground sm:text-7xl">{content.hero.title || t("talks.title")}</h1>
            <p className="mt-5 max-w-2xl text-base font-medium leading-relaxed text-muted-foreground sm:text-lg">{content.hero.subtitle || t("talks.subtitle")}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button onClick={() => setSelectedTalk(content.live)} className="inline-flex h-12 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-black text-background transition-opacity hover:opacity-90">
                <Play className="size-4 fill-current" /> {t("talks.open")}
              </button>
              <button onClick={() => setShowTopics(true)} className="inline-flex h-12 items-center gap-2 rounded-full border border-border bg-background/80 px-5 text-sm font-black text-foreground transition-colors hover:bg-muted">
                <Tag className="size-4" /> 主题索引
              </button>
            </div>
          </div>

          <motion.button
            type="button"
            onClick={() => setSelectedTalk(content.live)}
            whileHover={{ y: -4 }}
            className="group relative overflow-hidden rounded-[2rem] border border-white/50 bg-background text-left shadow-xl dark:border-zinc-800"
          >
            <div className="relative h-64 overflow-hidden">
              <img src={content.live.coverUrl} alt={content.live.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-red-500 px-3 py-1 text-xs font-black text-white shadow-lg">
                <span className="size-2 rounded-full bg-white" /> {t("talks.livenow")}
              </div>
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <h2 className="text-2xl font-black leading-tight">{content.live.title}</h2>
                <p className="mt-2 line-clamp-2 text-sm font-medium text-white/80">{content.live.subtitle}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 p-4">
              <MiniMetric icon={<Eye className="size-4" />} value={content.live.viewers.toLocaleString()} label="观看" />
              <MiniMetric icon={<MessageCircle className="size-4" />} value={content.live.danmaku.toLocaleString()} label="弹幕" />
              <MiniMetric icon={<Heart className="size-4" />} value={content.live.likes.toLocaleString()} label="喜欢" />
            </div>
          </motion.button>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Panel title={t("talks.thisweek")} icon={<Calendar className="size-5 text-primary" />}>
            <div className="grid gap-3 md:grid-cols-3">
              {content.weekly.map((item) => (
                <div key={item.id} className="rounded-3xl border border-border bg-card p-5">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">{item.date}</span>
                    <span className="text-xs font-black text-muted-foreground">{item.time}</span>
                  </div>
                  <h3 className="text-lg font-black">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.topic}</p>
                  <TagList tags={item.tags} className="mt-4" />
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="近期计划" icon={<Clock className="size-5 text-orange-500" />}>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {content.upcoming.map((item) => (
                <div key={item.id} className="min-w-[260px] rounded-3xl border border-border bg-card p-5">
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">{item.date} · {item.time}</div>
                  <h3 className="mt-3 text-lg font-black">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.topic}</p>
                  <TagList tags={item.tags} className="mt-4" />
                </div>
              ))}
            </div>
          </Panel>

          <Panel
            title={t("talks.archive")}
            icon={<Archive className="size-5 text-pink-500" />}
            action={(
              <button onClick={() => setShowAllArchive((value) => !value)} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-black transition-colors hover:bg-muted">
                <FileDown className="size-3.5" /> {showAllArchive ? "收起" : t("talks.showall")}
              </button>
            )}
          >
            <div className="mb-5 grid gap-3 md:grid-cols-[1fr_auto_auto]">
              <label className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索杂谈标题、摘要或标签" className="h-11 w-full rounded-full border border-border bg-card pl-9 pr-4 text-sm font-bold outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15" />
              </label>
              <select value={tagFilter} onChange={(event) => setTagFilter(event.target.value)} className="h-11 rounded-full border border-border bg-card px-4 text-sm font-bold outline-none focus:border-primary/50">
                <option value="all">全部标签</option>
                {allTags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
              </select>
              <button onClick={() => setSortBy((value) => value === "new" ? "hot" : "new")} className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-black hover:bg-muted">
                <ArrowDownUp className="size-4" /> {sortBy === "new" ? "最新" : "热度"}
              </button>
            </div>

            <motion.div layout className="grid gap-4 md:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {previewArchive.map((talk) => (
                  <ArchiveCard key={talk.id} talk={talk} onOpen={() => setSelectedTalk(talk)} />
                ))}
              </AnimatePresence>
            </motion.div>
          </Panel>
        </div>

        <aside className="space-y-5">
          <SidebarBlock title={t("talks.recent")} items={content.recentUpdates} icon={<Bot className="size-4 text-blue-500" />} />
          <SidebarBlock title={t("talks.top")} items={content.topArticles} icon={<ArrowUpRight className="size-4 text-rose-500" />} />
          <SidebarBlock title={t("talks.new")} items={content.newUploads} icon={<Filter className="size-4 text-emerald-500" />} />
        </aside>
      </section>

      <TalkModal talk={selectedTalk} onClose={() => setSelectedTalk(null)} />
      <TopicsModal open={showTopics} topics={content.topics} updates={content.recentUpdates} onClose={() => setShowTopics(false)} />
    </div>
  );
}

function Panel({ title, icon, action, children }: { title: string; icon: ReactNode; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-[2rem] border border-border bg-background p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="flex items-center gap-2 text-xl font-black tracking-tight">{icon}{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function ArchiveCard({ talk, onOpen }: { key?: string; talk: TalkItem; onOpen: () => void }) {
  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      onClick={onOpen}
      className="group overflow-hidden rounded-3xl border border-border bg-card text-left transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        <img src={talk.coverUrl} alt={talk.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <div className="mb-2 text-xs font-black text-white/70">{talk.date} · {talk.duration}</div>
          <h3 className="line-clamp-2 text-lg font-black leading-tight text-white">{talk.title}</h3>
        </div>
      </div>
      <div className="p-4">
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{talk.summary}</p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <TagList tags={talk.tags.slice(0, 3)} />
          <span className="shrink-0 text-xs font-black text-muted-foreground">{talk.viewers.toLocaleString()} views</span>
        </div>
      </div>
    </motion.button>
  );
}

function SidebarBlock({ title, items, icon }: { title: string; items: Array<{ id: string; title: string; description: string; href?: string; date?: string; tags?: string[] }>; icon: ReactNode }) {
  return (
    <section className="rounded-[2rem] border border-border bg-background p-5 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 text-base font-black">{icon}{title}</h2>
      <div className="space-y-3">
        {items.map((item) => {
          const content = (
            <div className="rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-muted/30">
              <div className="mb-1 text-xs font-black text-muted-foreground">{item.date || item.tags?.[0] || "站内"}</div>
              <h3 className="text-sm font-black">{item.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
            </div>
          );
          return item.href ? <a key={item.id} href={item.href}>{content}</a> : <div key={item.id}>{content}</div>;
        })}
      </div>
    </section>
  );
}

function MiniMetric({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-muted/50 p-3">
      <div className="mb-1 flex items-center gap-1.5 text-xs font-bold text-muted-foreground">{icon}{label}</div>
      <div className="text-lg font-black">{value}</div>
    </div>
  );
}

function TagList({ tags, className }: { tags: string[]; className?: string }) {
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {tags.map((tag) => <span key={tag} className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-bold text-muted-foreground">{tag}</span>)}
    </div>
  );
}
