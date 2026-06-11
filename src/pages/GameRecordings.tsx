import ArrowDownUp from "../components/icons/dots-vertical-icon";
import ArrowUpRight from "../components/icons/external-link-icon";
import Clock from "../components/icons/clock-icon";
import Eye from "../components/icons/eye-icon";
import Filter from "../components/icons/filter-icon";
import Gamepad2 from "../components/icons/gamepad-icon";
import MessageCircle from "../components/icons/message-circle-icon";
import Play from "../components/icons/player-icon";
import Search from "../components/icons/magnifier-icon";
import Sparkles from "../components/icons/sparkles-icon";
import Tag from "../components/icons/hashtag-icon";
import X from "../components/icons/x-icon";
import { useEffect, useMemo, useState } from "react";

import { AnimatePresence, motion } from "motion/react";
import { defaultGamingMain } from "../content/defaults/gaming";
import type { GamingLibraryItem, GamingMainContent, GamingRecordingChapter, GamingRecordingItem } from "../content/types";
import { useContent } from "../content/useContent";
import { cn } from "../lib/utils";

type RecordingFilter = {
  kind: "all" | "year" | "tag" | "game";
  value: string;
};

function normalizeGamingContent(content: GamingMainContent): GamingMainContent {
  const library = content.library?.length ? content.library : defaultGamingMain.library || [];
  const recordings = content.recordings?.length ? content.recordings : deriveRecordingsFromLibrary(library);
  return { ...defaultGamingMain, ...content, library, recordings };
}

function getGameImage(game?: GamingLibraryItem) {
  return game?.heroImage || game?.coverUrl || defaultGamingMain.streamImage;
}

function formatDuration(value: string) {
  const text = String(value || "").trim();
  if (!text) return "待记录";
  const parts = text.split(":").map((part) => Number(part));
  if (parts.length === 3 && parts.every(Number.isFinite)) {
    const [hours, minutes] = parts;
    return `${hours}h ${String(minutes).padStart(2, "0")}m`;
  }
  if (parts.length === 2 && parts.every(Number.isFinite)) {
    const [minutes, seconds] = parts;
    return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
  }
  return text;
}

function durationScore(value: string) {
  const text = String(value || "");
  const parts = text.split(":").map((part) => Number(part));
  if (parts.length === 3 && parts.every(Number.isFinite)) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2 && parts.every(Number.isFinite)) return parts[0] * 60 + parts[1];
  const hour = text.match(/(\d+(?:\.\d+)?)\s*(?:h|小时|时)/i);
  const minute = text.match(/(\d+(?:\.\d+)?)\s*(?:m|分钟|分)/i);
  if (hour || minute) return Number(hour?.[1] || 0) * 3600 + Number(minute?.[1] || 0) * 60;
  const number = text.match(/\d+(?:\.\d+)?/);
  return number ? Number(number[0]) * 3600 : 0;
}

function getRecordingCover(recording: GamingRecordingItem, library: GamingLibraryItem[]) {
  const game = recording.gameId ? library.find((item) => item.id === recording.gameId) : undefined;
  return recording.coverUrl || getGameImage(game);
}

function deriveRecordingsFromLibrary(library: GamingLibraryItem[]): GamingRecordingItem[] {
  return library.flatMap((game) => (game.playRecords || []).map((record, index) => {
    const title = record.note ? `${game.title}：${record.note}` : `${game.title} 游戏回放`;
    const chapters: GamingRecordingChapter[] = [
      { time: "00:00", title: "开场与目标确认", description: `${game.title} 本次记录开始。` },
      { time: "00:30", title: record.note || "游玩记录", description: game.description },
      { time: "END", title: "本次记录收束", description: "整理下一次可继续推进的内容。" }
    ];
    return {
      id: `recording-${game.id}-${record.date || index}`,
      title,
      gameId: game.id,
      gameTitle: game.title,
      date: record.date,
      duration: record.durationHours ? `${record.durationHours}h` : "待记录",
      coverUrl: getGameImage(game),
      host: "AnySoul",
      videoUrl: record.href || game.videoUrl || game.streamUrl,
      videoProvider: record.href || game.videoUrl || game.streamUrl ? "bilibili" : undefined,
      tags: Array.from(new Set([game.genre, game.platform.split("/")[0].trim(), ...(game.tags || [])].filter(Boolean))),
      summary: record.note ? `${record.note}。${game.review || game.description}` : game.review || game.description,
      highlights: [record.note || "游玩进度记录", game.genre, game.status === "playing" ? "当前主线记录" : "归档回放"].filter(Boolean),
      chapters,
      viewers: Math.max(120, 520 - index * 45),
      danmaku: Math.max(12, 86 - index * 10),
      isFeatured: index === 0 && game.status === "playing"
    };
  })).sort((a, b) => b.date.localeCompare(a.date));
}

function searchableText(recording: GamingRecordingItem) {
  return [
    recording.title,
    recording.gameTitle,
    recording.date,
    recording.duration,
    recording.summary,
    recording.host,
    ...(recording.tags || []),
    ...(recording.highlights || []),
    ...(recording.chapters || []).flatMap((chapter) => [chapter.time, chapter.title, chapter.description || ""])
  ].join(" ").toLowerCase();
}

function matchesFilter(recording: GamingRecordingItem, filter: RecordingFilter) {
  if (filter.kind === "all") return true;
  if (filter.kind === "year") return recording.date.startsWith(filter.value);
  if (filter.kind === "tag") return recording.tags.includes(filter.value);
  if (filter.kind === "game") return recording.gameId === filter.value || recording.gameTitle === filter.value;
  return true;
}

export function GameRecordings() {
  const content = normalizeGamingContent(useContent<GamingMainContent>("gaming.main", defaultGamingMain));
  const library = content.library || [];
  const recordings = content.recordings || [];
  const [filter, setFilter] = useState<RecordingFilter>({ kind: "all", value: "全部" });
  const [sortBy, setSortBy] = useState<"dateDesc" | "dateAsc" | "popular" | "duration">("dateDesc");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [filter.kind, filter.value]);

  const years = useMemo(() => Array.from(new Set(recordings.map((item) => item.date.slice(0, 4)).filter(Boolean))).sort((a, b) => b.localeCompare(a)), [recordings]);
  const topTags = useMemo(() => Array.from(new Set(recordings.flatMap((item) => item.tags || []))).slice(0, 10), [recordings]);
  const recordedGames = useMemo(() => {
    const ids = new Set(recordings.map((item) => item.gameId).filter(Boolean));
    return library.filter((game) => ids.has(game.id)).slice(0, 8);
  }, [library, recordings]);

  const filteredRecordings = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    const items = recordings
      .filter((recording) => matchesFilter(recording, filter))
      .filter((recording) => !keyword || searchableText(recording).includes(keyword));
    return [...items].sort((a, b) => {
      if (sortBy === "dateAsc") return a.date.localeCompare(b.date);
      if (sortBy === "popular") return (b.viewers + b.danmaku) - (a.viewers + a.danmaku);
      if (sortBy === "duration") return durationScore(b.duration) - durationScore(a.duration);
      return b.date.localeCompare(a.date);
    });
  }, [filter, query, recordings, sortBy]);

  const selectedRecording = recordings.find((item) => item.id === selectedId) || null;
  const featuredRecording = recordings.find((item) => item.isFeatured) || recordings[0];
  const totalDurationHours = Math.round(recordings.reduce((sum, item) => sum + durationScore(item.duration) / 3600, 0));

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 text-foreground sm:px-6 md:px-8 md:py-12">
      <div className="mb-6 flex flex-col gap-5 md:mb-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <a href="#games" className="flex size-10 items-center justify-center rounded-full bg-muted/50 transition-colors hover:bg-muted">
              <ArrowUpRight className="size-5 rotate-[-135deg]" />
            </a>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-muted-foreground">Game Recording Library</p>
              <h1 className="text-2xl font-black tracking-tight md:text-4xl">游戏录像库</h1>
            </div>
          </div>
          <label className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索录像、游戏、标签、摘要..." className="h-11 w-full rounded-full border border-border bg-card pl-10 pr-4 text-sm font-bold outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/15" />
          </label>
        </div>

        {featuredRecording ? (
          <button onClick={() => setSelectedId(featuredRecording.id)} className="group relative overflow-hidden rounded-[28px] border border-border bg-card text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <img src={getRecordingCover(featuredRecording, library)} alt={featuredRecording.title} className="absolute inset-0 size-full object-cover opacity-55 transition-transform duration-700 group-hover:scale-105 dark:opacity-35" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/20" />
            <div className="relative grid gap-5 p-5 md:grid-cols-[1fr_280px] md:p-7">
              <div className="flex min-h-[220px] flex-col justify-end">
                <div className="mb-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-500 px-3 py-1 text-xs font-black text-white shadow-sm">
                    <Sparkles className="size-3.5" /> 精选录像带
                  </span>
                  <span className="rounded-full bg-background/80 px-3 py-1 text-xs font-black text-muted-foreground backdrop-blur">{featuredRecording.date}</span>
                </div>
                <h2 className="max-w-2xl text-3xl font-black leading-tight tracking-tight md:text-5xl">{featuredRecording.title}</h2>
                <p className="mt-3 max-w-2xl text-sm font-bold leading-relaxed text-muted-foreground md:text-base">{featuredRecording.summary}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {featuredRecording.tags.slice(0, 5).map((tag) => <span key={tag} className="rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-black text-muted-foreground backdrop-blur">{tag}</span>)}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 self-end md:grid-cols-1">
                <Metric label="录像数" value={`${recordings.length}`} />
                <Metric label="总时长" value={`${totalDurationHours || 0}h`} />
                <Metric label="弹幕" value={featuredRecording.danmaku.toLocaleString()} />
              </div>
            </div>
          </button>
        ) : null}

        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          <button onClick={() => setFilter({ kind: "all", value: "全部" })} className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition", filter.kind === "all" ? "bg-foreground text-background shadow-sm" : "border border-border bg-card text-muted-foreground hover:text-foreground")}>
            <Filter className="size-4" /> 全部 {recordings.length}
          </button>
          {years.map((year) => (
            <button key={year} onClick={() => setFilter({ kind: "year", value: year })} className={cn("shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition", filter.kind === "year" && filter.value === year ? "bg-lime-100 text-lime-700 shadow-sm dark:bg-lime-900/60 dark:text-lime-300" : "border border-border bg-card text-muted-foreground hover:text-foreground")}>
              {year}
            </button>
          ))}
          {recordedGames.map((game) => (
            <button key={game.id} onClick={() => setFilter({ kind: "game", value: game.id })} className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition", filter.kind === "game" && filter.value === game.id ? "bg-blue-100 text-blue-700 shadow-sm dark:bg-blue-900/60 dark:text-blue-300" : "border border-border bg-card text-muted-foreground hover:text-foreground")}>
              <Gamepad2 className="size-4" /> {game.title}
            </button>
          ))}
          {topTags.map((tag) => (
            <button key={tag} onClick={() => setFilter({ kind: "tag", value: tag })} className={cn("inline-flex shrink-0 items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold transition", filter.kind === "tag" && filter.value === tag ? "bg-amber-100 text-amber-700 shadow-sm dark:bg-amber-900/60 dark:text-amber-300" : "border border-border bg-card text-muted-foreground hover:text-foreground")}>
              <Tag className="size-3.5" /> {tag}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto text-xs md:text-sm">
          <span className="flex shrink-0 items-center gap-1 font-semibold text-muted-foreground"><ArrowDownUp className="size-3.5" /> 排序方式:</span>
          {[
            { id: "dateDesc", label: "时间倒序" },
            { id: "dateAsc", label: "时间正序" },
            { id: "popular", label: "最热视频" },
            { id: "duration", label: "最长录像" }
          ].map((sort) => (
            <button key={sort.id} onClick={() => setSortBy(sort.id as typeof sortBy)} className={cn("shrink-0 rounded-full px-3 py-1.5 font-medium transition", sortBy === sort.id ? "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300" : "text-muted-foreground hover:bg-muted")}>
              {sort.label}
            </button>
          ))}
          <span className="ml-auto shrink-0 font-bold text-muted-foreground">{filteredRecordings.length} / {recordings.length}</span>
        </div>
      </div>

      {filteredRecordings.length ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredRecordings.map((recording) => (
            <button key={recording.id} onClick={() => setSelectedId(recording.id)} className="group flex overflow-hidden rounded-3xl border border-border bg-card text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex w-full flex-col">
                <div className="relative aspect-video overflow-hidden bg-muted">
                  <img src={getRecordingCover(recording, library)} alt={recording.title} className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 transition-colors group-hover:bg-black/40">
                    <div className="flex size-12 scale-95 items-center justify-center rounded-full bg-white/90 text-lime-600 opacity-0 shadow-xl backdrop-blur-sm transition-all group-hover:scale-105 group-hover:opacity-100">
                      <Play className="ml-0.5 size-5" />
                    </div>
                  </div>
                  {recording.isFeatured && <span className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-black text-white shadow-sm">精选</span>}
                  <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                    <Clock className="size-3" /> {formatDuration(recording.duration)}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="line-clamp-1 rounded-md bg-lime-100 px-2 py-0.5 text-[10px] font-bold text-lime-700 dark:bg-lime-900/60 dark:text-lime-300">{recording.gameTitle}</span>
                    <span className="shrink-0 text-[10px] font-semibold text-muted-foreground">{recording.date}</span>
                  </div>
                  <h3 className="line-clamp-2 text-[15px] font-black leading-tight transition-colors group-hover:text-lime-600 dark:group-hover:text-lime-400">{recording.title}</h3>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{recording.summary}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {recording.tags.slice(0, 3).map((tag) => <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">{tag}</span>)}
                  </div>
                  <div className="mt-auto grid grid-cols-3 gap-2 border-t border-border pt-3 text-[11px] font-bold text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Eye className="size-3" /> {recording.viewers.toLocaleString()}</span>
                    <span className="inline-flex items-center gap-1"><MessageCircle className="size-3" /> {recording.danmaku.toLocaleString()}</span>
                    <span>{recording.chapters.length} 节点</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
          <p className="text-lg font-black">没有匹配的游戏录像</p>
          <p className="mt-2 text-sm text-muted-foreground">换一个筛选条件，或返回游戏回查看当前游戏记录。</p>
        </div>
      )}

      <AnimatePresence>
        {selectedRecording && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setSelectedId(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
              <button onClick={() => setSelectedId(null)} className="absolute right-4 top-4 z-20 rounded-full bg-black/50 p-2 text-white backdrop-blur-md transition-colors hover:bg-black/70">
                <X className="size-4" />
              </button>
              <div className="flex-1 overflow-y-auto">
                <div className="relative h-64 w-full shrink-0 sm:h-80">
                  <img src={getRecordingCover(selectedRecording, library)} alt={selectedRecording.title} className="size-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-16 z-10">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-lime-100 px-2.5 py-0.5 text-[11px] font-bold text-lime-700 dark:bg-lime-900/60 dark:text-lime-300">{selectedRecording.gameTitle}</span>
                      <span className="rounded-full bg-background/70 px-2.5 py-0.5 text-[11px] font-bold backdrop-blur">{selectedRecording.date}</span>
                    </div>
                    <h2 className="text-3xl font-black tracking-tight sm:text-5xl">{selectedRecording.title}</h2>
                  </div>
                </div>
                <div className="grid gap-6 p-5 lg:grid-cols-[1fr_300px]">
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <Metric label="时长" value={formatDuration(selectedRecording.duration)} />
                      <Metric label="观看" value={selectedRecording.viewers.toLocaleString()} />
                      <Metric label="弹幕" value={selectedRecording.danmaku.toLocaleString()} />
                      <Metric label="主持" value={selectedRecording.host || "AnySoul"} />
                    </div>
                    <section className="rounded-2xl border border-border bg-muted/20 p-5">
                      <h3 className="font-black">录像摘要</h3>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{selectedRecording.summary}</p>
                    </section>
                    <section className="rounded-2xl border border-border bg-muted/20 p-5">
                      <h3 className="font-black">时间节点</h3>
                      <div className="mt-4 space-y-4">
                        {selectedRecording.chapters.map((chapter, index) => (
                          <div key={`${chapter.time}-${index}`} className="relative pl-6">
                            <div className="absolute left-1 top-1.5 size-3 rounded-full border-2 border-lime-500 bg-card" />
                            {index < selectedRecording.chapters.length - 1 && <div className="absolute bottom-[-18px] left-[9px] top-5 w-px bg-border" />}
                            <div className="rounded-2xl border border-border bg-card p-4">
                              <div className="text-xs font-black text-lime-600 dark:text-lime-300">{chapter.time}</div>
                              <div className="mt-1 text-sm font-black">{chapter.title}</div>
                              {chapter.description && <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{chapter.description}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                  <aside className="space-y-4">
                    <div className="rounded-2xl border border-border bg-muted/20 p-5">
                      <h3 className="font-black">高光</h3>
                      <div className="mt-3 space-y-2">
                        {selectedRecording.highlights.map((highlight) => <div key={highlight} className="rounded-xl bg-card px-3 py-2 text-xs font-bold text-muted-foreground">{highlight}</div>)}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-border bg-muted/20 p-5">
                      <h3 className="font-black">标签</h3>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {selectedRecording.tags.map((tag) => (
                          <button key={tag} onClick={() => setFilter({ kind: "tag", value: tag })} className="rounded-full bg-card px-3 py-1 text-xs font-black text-muted-foreground hover:text-foreground">
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                    {(selectedRecording.videoUrl || selectedRecording.sourceUrl) && (
                      <div className="rounded-2xl border border-border bg-muted/20 p-5">
                        <h3 className="font-black">播放入口</h3>
                        <div className="mt-3 flex flex-col gap-2">
                          {selectedRecording.videoUrl && <a href={selectedRecording.videoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2 text-sm font-bold hover:bg-muted">打开录像 <ArrowUpRight className="size-4" /></a>}
                          {selectedRecording.sourceUrl && <a href={selectedRecording.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2 text-sm font-bold hover:bg-muted">原始来源 <ArrowUpRight className="size-4" /></a>}
                        </div>
                      </div>
                    )}
                  </aside>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background/80 p-4">
      <div className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 line-clamp-1 text-lg font-black">{value}</div>
    </div>
  );
}
