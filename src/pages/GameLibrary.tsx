import ArrowDownUp from "../components/icons/dots-vertical-icon";
import ArrowUpRight from "../components/icons/external-link-icon";
import Calendar from "../components/icons/clock-icon";
import Clock from "../components/icons/clock-icon";
import Eye from "../components/icons/eye-icon";
import ExternalLink from "../components/icons/external-link-icon";
import Filter from "../components/icons/filter-icon";
import Gamepad2 from "../components/icons/gamepad-icon";
import LinkIcon from "../components/icons/link-icon";
import MessageCircle from "../components/icons/message-circle-icon";
import Search from "../components/icons/magnifier-icon";
import Star from "../components/icons/star-icon";
import Tag from "../components/icons/hashtag-icon";
import X from "../components/icons/x-icon";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { AnimatePresence, motion } from "motion/react";
import { defaultGamingMain } from "../content/defaults/gaming";
import type { GamingLibraryItem, GamingMainContent, GamingPlayRecord } from "../content/types";
import { useContent } from "../content/useContent";
import { cn } from "../lib/utils";

type GameFilter = {
  kind: "all" | "status" | "tag" | "category" | "platform";
  value: string;
};

const statusLabels: Record<GamingLibraryItem["status"], string> = {
  playing: "正在记录",
  planned: "待玩",
  finished: "已通关",
  paused: "暂停",
  archived: "已归档"
};

const statusTones: Record<GamingLibraryItem["status"], string> = {
  playing: "bg-lime-100 text-lime-700 dark:bg-lime-950 dark:text-lime-300",
  planned: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  finished: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  paused: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  archived: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
};

function normalizeGamingContent(content: GamingMainContent): GamingMainContent {
  const library = content.library?.length ? content.library : defaultGamingMain.library || [];
  return { ...defaultGamingMain, ...content, library };
}

function parseInitialFilter(route: string): GameFilter {
  const query = route.includes("?") ? route.slice(route.indexOf("?") + 1) : "";
  const params = new URLSearchParams(query);
  if (params.get("status")) return { kind: "status", value: params.get("status") || "" };
  if (params.get("tag")) return { kind: "tag", value: params.get("tag") || "" };
  if (params.get("category")) return { kind: "category", value: params.get("category") || "" };
  if (params.get("platform")) return { kind: "platform", value: params.get("platform") || "" };
  return { kind: "all", value: "全部" };
}

function isLinkedGame(game: GamingLibraryItem) {
  const tags = game.tags || [];
  if (tags.some((tag) => tag === "联动游戏")) return true;
  return [game.genre, game.mode, ...tags].filter(Boolean).join(" ").includes("联动")
    || [game.genre, game.mode, ...tags].filter(Boolean).join(" ").includes("联机")
    || [game.genre, game.mode, ...tags].filter(Boolean).join(" ").includes("合作");
}

function getGameImage(game: GamingLibraryItem) {
  return game.heroImage || game.coverUrl || defaultGamingMain.streamImage;
}

function numberFromText(value?: string) {
  const match = `${value || ""}`.match(/\d+(\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function formatStatCount(value?: number) {
  const count = Number(value || 0);
  if (count >= 10000) return `${Math.round(count / 1000) / 10}万`;
  return count.toLocaleString();
}

function sortPlayRecords(records: GamingPlayRecord[]) {
  return [...records].sort((a, b) => b.date.localeCompare(a.date));
}

function matchesFilter(game: GamingLibraryItem, filter: GameFilter) {
  if (filter.kind === "all") return true;
  if (filter.kind === "status") return game.status === filter.value;
  if (filter.kind === "tag") return filter.value === "联动游戏" ? isLinkedGame(game) : game.tags.includes(filter.value);
  if (filter.kind === "category") return game.genre === filter.value;
  if (filter.kind === "platform") return game.platform.includes(filter.value);
  return true;
}

export function GameLibrary({ route }: { route: string }) {
  const content = normalizeGamingContent(useContent("gaming.main", defaultGamingMain));
  const library = content.library || [];
  const [filter, setFilter] = useState<GameFilter>(() => parseInitialFilter(route));
  const [sortBy, setSortBy] = useState<"recent" | "default" | "title" | "hours" | "rating">("recent");
  const [query, setQuery] = useState("");
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);

  useEffect(() => {
    setFilter(parseInitialFilter(route));
  }, [route]);

  const selectedGame = library.find((game) => game.id === selectedGameId) || null;
  const categories = Array.from(new Set(library.map((game) => game.genre).filter(Boolean))).slice(0, 8);
  const platforms = Array.from(new Set(library.map((game) => game.platform.split("/")[0].trim()).filter(Boolean))).slice(0, 6);
  const topTags = Array.from(new Set(library.flatMap((game) => game.tags || []))).slice(0, 10);

  const filteredGames = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    const items = library.filter((game) => matchesFilter(game, filter)).filter((game) => {
      if (!keyword) return true;
      return [game.title, game.subtitle, game.platform, game.genre, game.mode, game.status, ...(game.tags || [])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    });
    return [...items].sort((a, b) => {
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "hours") return numberFromText(b.totalHours) - numberFromText(a.totalHours);
      if (sortBy === "rating") return numberFromText(b.rating) - numberFromText(a.rating);
      if (sortBy === "recent") return (b.lastPlayedAt || "").localeCompare(a.lastPlayedAt || "");
      return library.indexOf(a) - library.indexOf(b);
    });
  }, [filter, library, query, sortBy]);

  const updateFilter = (next: GameFilter) => {
    setFilter(next);
    const suffix = next.kind === "all" ? "" : `?${next.kind === "category" ? "category" : next.kind}=${encodeURIComponent(next.value)}`;
    window.history.replaceState(null, "", `#game-library${suffix}`);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12 animate-in fade-in duration-700 bg-background text-foreground">
      <div className="mb-6 flex flex-col gap-5 md:mb-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <a href="#games" className="flex size-10 items-center justify-center rounded-full bg-muted/50 transition-colors hover:bg-muted">
              <ArrowUpRight className="size-5 rotate-[-135deg]" />
            </a>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-muted-foreground">Game Library</p>
              <h1 className="text-2xl font-black tracking-tight md:text-4xl">游戏库</h1>
            </div>
          </div>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索游戏、平台、标签..." className="h-11 w-full rounded-full border border-border bg-card pl-10 pr-4 text-sm font-bold outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/15" />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          <button onClick={() => updateFilter({ kind: "all", value: "全部" })} className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition", filter.kind === "all" ? "bg-foreground text-background shadow-sm" : "border border-[#f5eade] bg-[#fcf8f3] text-muted-foreground hover:text-foreground dark:border-[#3a332a] dark:bg-[#2d2822]")}>
            <Filter className="size-4" /> 全部 {library.length}
          </button>
          {(["planned", "playing", "finished", "paused", "archived"] as GamingLibraryItem["status"][]).map((status) => (
            <button key={status} onClick={() => updateFilter({ kind: "status", value: status })} className={cn("shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition", filter.kind === "status" && filter.value === status ? "bg-blue-100 text-blue-700 shadow-sm dark:bg-blue-900/60 dark:text-blue-300" : "border border-[#f5eade] bg-[#fcf8f3] text-muted-foreground hover:text-foreground dark:border-[#3a332a] dark:bg-[#2d2822]")}>
              {statusLabels[status]}
            </button>
          ))}
          <button onClick={() => updateFilter({ kind: "tag", value: "联动游戏" })} className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition", filter.kind === "tag" && filter.value === "联动游戏" ? "bg-pink-100 text-pink-700 shadow-sm dark:bg-pink-900/60 dark:text-pink-300" : "border border-[#f5eade] bg-[#fcf8f3] text-muted-foreground hover:text-foreground dark:border-[#3a332a] dark:bg-[#2d2822]")}>
            <LinkIcon className="size-4" /> 联动游戏
          </button>
          {categories.map((category) => (
            <button key={category} onClick={() => updateFilter({ kind: "category", value: category })} className={cn("shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition", filter.kind === "category" && filter.value === category ? "bg-lime-100 text-lime-700 shadow-sm dark:bg-lime-900/60 dark:text-lime-300" : "border border-[#f5eade] bg-[#fcf8f3] text-muted-foreground hover:text-foreground dark:border-[#3a332a] dark:bg-[#2d2822]")}>
              {category}
            </button>
          ))}
          {platforms.map((platform) => (
            <button key={platform} onClick={() => updateFilter({ kind: "platform", value: platform })} className={cn("shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition", filter.kind === "platform" && filter.value === platform ? "bg-violet-100 text-violet-700 shadow-sm dark:bg-violet-900/60 dark:text-violet-300" : "border border-[#f5eade] bg-[#fcf8f3] text-muted-foreground hover:text-foreground dark:border-[#3a332a] dark:bg-[#2d2822]")}>
              {platform}
            </button>
          ))}
          {topTags.filter((tag) => tag !== "联动游戏").slice(0, 6).map((tag) => (
            <button key={tag} onClick={() => updateFilter({ kind: "tag", value: tag })} className={cn("inline-flex shrink-0 items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold transition", filter.kind === "tag" && filter.value === tag ? "bg-amber-100 text-amber-700 shadow-sm dark:bg-amber-900/60 dark:text-amber-300" : "border border-[#f5eade] bg-[#fcf8f3] text-muted-foreground hover:text-foreground dark:border-[#3a332a] dark:bg-[#2d2822]")}>
              <Tag className="size-3.5" /> {tag}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto text-xs md:text-sm">
          <span className="flex shrink-0 items-center gap-1 font-semibold text-muted-foreground"><ArrowDownUp className="size-3.5" /> 排序方式:</span>
          {[
            { id: "recent", label: "最近记录" },
            { id: "default", label: "默认顺序" },
            { id: "title", label: "标题" },
            { id: "hours", label: "累计时长" },
            { id: "rating", label: "评分" }
          ].map((sort) => (
            <button key={sort.id} onClick={() => setSortBy(sort.id as typeof sortBy)} className={cn("shrink-0 rounded-full px-3 py-1.5 font-medium transition", sortBy === sort.id ? "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300" : "text-muted-foreground hover:bg-muted")}>
              {sort.label}
            </button>
          ))}
          <span className="ml-auto shrink-0 font-bold text-muted-foreground">{filteredGames.length} / {library.length}</span>
        </div>
      </div>

      {filteredGames.length ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
          {filteredGames.map((game) => (
            <button key={game.id} onClick={() => setSelectedGameId(game.id)} className="group flex flex-col overflow-hidden rounded-3xl border border-[#f5eade] bg-[#fcf8f3] text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-[#3a332a] dark:bg-[#2d2822]">
              <div className="relative aspect-video w-full overflow-hidden bg-muted">
                <img src={getGameImage(game)} alt={game.title} className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 transition-colors group-hover:bg-black/40">
                  <div className="flex size-12 scale-95 items-center justify-center rounded-full bg-white/90 text-lime-600 opacity-0 shadow-xl backdrop-blur-sm transition-all group-hover:scale-105 group-hover:opacity-100">
                    <Gamepad2 className="size-5" />
                  </div>
                </div>
                <div className={cn("absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-black shadow-sm", statusTones[game.status])}>{statusLabels[game.status]}</div>
                <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                  <Clock className="size-3" /> {game.status === "planned" ? "待玩" : game.lastPlayedAt || "待记录"}
                </div>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="rounded-md bg-lime-100 px-2 py-0.5 text-[10px] font-bold text-lime-700 dark:bg-lime-900/60 dark:text-lime-300">{game.genre}</span>
                  <span className="text-[10px] font-semibold text-muted-foreground">{game.platform}</span>
                </div>
                <h3 className="line-clamp-2 text-[15px] font-bold leading-tight transition-colors group-hover:text-lime-600 dark:group-hover:text-lime-400">{game.title}</h3>
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{game.description}</p>
                <div className="mt-auto grid grid-cols-3 gap-2 border-t border-[#f5eade] pt-3 text-[11px] font-bold text-muted-foreground dark:border-[#3a332a]">
                  <span>{game.totalHours || "0h"}</span>
                  <span>{game.rating || "待评分"}</span>
                  <span>{game.recordingCount ?? game.playRecords?.length ?? 0} 录像</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
          <p className="text-lg font-black">没有匹配的游戏</p>
          <p className="mt-2 text-sm text-muted-foreground">换一个筛选条件或返回游戏回查看当前展示。</p>
        </div>
      )}

      <AnimatePresence>
        {selectedGame && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setSelectedGameId(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
              <button onClick={() => setSelectedGameId(null)} className="absolute right-4 top-4 z-20 rounded-full bg-black/50 p-2 text-white backdrop-blur-md transition-colors hover:bg-black/70">
                <X className="size-4" />
              </button>
              <div className="flex-1 overflow-y-auto">
                <div className="relative h-60 w-full shrink-0 sm:h-80">
                  <img src={getGameImage(selectedGame)} alt={selectedGame.title} className="size-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-16 z-10">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-bold", statusTones[selectedGame.status])}>{statusLabels[selectedGame.status]}</span>
                      <span className="rounded-full bg-background/70 px-2.5 py-0.5 text-[11px] font-bold backdrop-blur">{selectedGame.genre}</span>
                    </div>
                    <h2 className="text-3xl font-black tracking-tight sm:text-5xl">{selectedGame.title}</h2>
                    {selectedGame.subtitle && <p className="mt-2 text-sm font-bold text-muted-foreground">{selectedGame.subtitle}</p>}
                  </div>
                </div>
                <div className="grid gap-6 p-5 lg:grid-cols-[1fr_320px]">
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                      <InfoCard icon={<Clock className="size-3.5" />} label="最近记录" value={selectedGame.status === "planned" ? "待玩" : selectedGame.lastPlayedAt || "待记录"} />
                      <InfoCard icon={<Calendar className="size-3.5" />} label="累计时长" value={selectedGame.totalHours || "0h"} />
                      <InfoCard icon={<Gamepad2 className="size-3.5" />} label="录像数" value={`${selectedGame.recordingCount ?? selectedGame.playRecords?.length ?? 0}`} />
                      <InfoCard icon={<Eye className="size-3.5" />} label="播放量" value={formatStatCount(selectedGame.totalViewers)} />
                      <InfoCard icon={<MessageCircle className="size-3.5" />} label="弹幕数" value={formatStatCount(selectedGame.totalDanmaku)} />
                      <InfoCard icon={<Star className="size-3.5" />} label="评分" value={selectedGame.rating || "待评分"} />
                      <InfoCard icon={<Gamepad2 className="size-3.5" />} label="平台" value={selectedGame.platform} />
                    </div>
                    <section className="rounded-2xl border border-border bg-muted/20 p-5">
                      <h3 className="font-black">关于这款游戏</h3>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{selectedGame.review || selectedGame.description}</p>
                    </section>
                    <section className="rounded-2xl border border-border bg-muted/20 p-5">
                      <h3 className="font-black">主播游玩时间轴</h3>
                      <div className="mt-4 space-y-4">
                        {sortPlayRecords(selectedGame.playRecords || []).length ? sortPlayRecords(selectedGame.playRecords || []).map((record, index) => (
                          <div key={`${record.date}-${index}`} className="relative pl-6">
                            <div className="absolute left-1 top-1.5 size-3 rounded-full border-2 border-lime-500 bg-card" />
                            {index < (selectedGame.playRecords || []).length - 1 && <div className="absolute bottom-[-18px] left-[9px] top-5 w-px bg-border" />}
                            <div className="rounded-2xl border border-border bg-card p-4">
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                  <div className="text-sm font-black">{record.date}</div>
                                  <div className="text-xs font-bold text-muted-foreground">{record.durationHours || 0}h · {record.note || "暂无备注"}</div>
                                </div>
                                {record.href && (
                                  <a href={record.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-lime-100 px-3 py-1.5 text-xs font-black text-lime-700 transition hover:bg-lime-200 dark:bg-lime-900/60 dark:text-lime-300">
                                    查看记录 <ExternalLink className="size-3.5" />
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        )) : (
                          <div className="rounded-2xl border border-dashed border-border bg-card p-5 text-sm font-bold text-muted-foreground">暂无游玩记录</div>
                        )}
                      </div>
                    </section>
                  </div>
                  <aside className="space-y-4">
                    <div className="rounded-2xl border border-border bg-muted/20 p-5">
                      <h3 className="font-black">标签</h3>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(selectedGame.tags || []).map((tag) => (
                          <button key={tag} onClick={() => updateFilter({ kind: "tag", value: tag })} className="rounded-full bg-card px-3 py-1 text-xs font-black text-muted-foreground hover:text-foreground">
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                    {(selectedGame.streamUrl || selectedGame.videoUrl) && (
                      <div className="rounded-2xl border border-border bg-muted/20 p-5">
                        <h3 className="font-black">相关链接</h3>
                        <div className="mt-3 flex flex-col gap-2">
                          {selectedGame.streamUrl && <a href={selectedGame.streamUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2 text-sm font-bold hover:bg-muted">直播记录 <ExternalLink className="size-4" /></a>}
                          {selectedGame.videoUrl && <a href={selectedGame.videoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2 text-sm font-bold hover:bg-muted">录像回放 <ExternalLink className="size-4" /></a>}
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

function InfoCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-muted/30 p-4">
      <span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{icon} {label}</span>
      <span className="line-clamp-1 text-lg font-black">{value}</span>
    </div>
  );
}
