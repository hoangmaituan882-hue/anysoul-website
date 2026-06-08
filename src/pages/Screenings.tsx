import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import { useState, useRef, useEffect, useMemo, type UIEvent } from "react";
import { ChevronLeft, ChevronRight, Play, Star, AlertTriangle, MonitorPlay, Clock, History, Film, Activity, Users, ListTodo, Plus, CheckCircle2, ThumbsUp, X, Mail, Database, Search, Shuffle } from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { appendLocalSourceSubmission, CONTENT_API_BASE } from "../content/client";
import { useAuth } from "../contexts/AuthContext";
import { useContent } from "../content/useContent";
import {
  defaultScreeningLibrary,
} from "../content/defaults/screeningLibrary";
import {
  defaultScreeningsAnime,
  defaultScreeningsClassics,
  defaultScreeningsNext,
  defaultScreeningsSchedule,
  defaultScreeningSourceSubmissions,
  defaultScreeningsTodo
} from "../content/defaults/screenings";
import type {
  ScreeningAnimeContent,
  ScreeningClassicsContent,
  ScreeningLibraryContent,
  ScreeningMovie,
  ScreeningNextContent,
  ScreeningScheduleContent,
  ScreeningSourceItem,
  ScreeningSourceSubmission,
  ScreeningSourceSubmissionsContent,
  ScreeningWeek,
  ScreeningTodoContent
} from "../content/types";

function TypewriterEffect({ texts }: { texts: string[] }) {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer: any;

    const fullText = texts[currentTextIndex];

    if (isDeleting) {
      if (displayedText === '') {
        setIsDeleting(false);
        setCurrentTextIndex((prev) => (prev + 1) % texts.length);
      } else {
        timer = setTimeout(() => {
          setDisplayedText(prev => prev.slice(0, -1));
        }, 50);
      }
    } else {
      if (displayedText === fullText) {
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 3000);
      } else {
        timer = setTimeout(() => {
          setDisplayedText(fullText.slice(0, displayedText.length + 1));
        }, 100);
      }
    }

    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, currentTextIndex, texts]);

  return (
    <span className="inline-block relative text-left">
      <span>{displayedText}</span>
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.4, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
        className="w-[2px] h-[1em] bg-blue-500 inline-block align-middle ml-0.5 relative -top-[1px]"
      />
    </span>
  );
}

type ScreeningRecord = {
  movie: ScreeningMovie;
  week?: ScreeningWeek;
  source?: ScreeningSourceItem;
};

const movieRecordKey = (movie: ScreeningMovie) => movie.libraryId || movie.id || movie.title;

function parseTime(value?: string) {
  if (!value) return undefined;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : undefined;
}

function formatMovieList(movies: ScreeningMovie[]) {
  if (movies.length === 0) return "等待从片源库排片";
  return movies.map((movie) => `《${movie.title}》`).join(" 与 ");
}

function formatCountdown(startsAt?: string) {
  const target = parseTime(startsAt);
  if (!target) return "时间待定";

  const diff = target - Date.now();
  if (diff <= 0) return "正在放映 / 待归档";

  const totalHours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days} 天 ${hours} 小时`;
  if (hours > 0) return `${hours} 小时 ${minutes} 分钟`;
  return `${Math.max(minutes, 1)} 分钟`;
}

function formatDistanceFromNow(startsAt?: string) {
  const target = parseTime(startsAt);
  if (!target) return "暂无归档";

  const diff = Date.now() - target;
  if (diff < 0) return "即将开始";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "今天";
  if (days < 31) return `${days} 天前`;

  const months = Math.floor(days / 30);
  return `${months} 个月前`;
}

function formatDateLabel(value?: string) {
  const time = parseTime(value);
  if (!time) return value || "待补";
  const date = new Date(time);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function sourcePlaybackDate(item: ScreeningSourceItem) {
  return item.lastWatchedAt || item.addedAt;
}

function sourceSortTime(item: ScreeningSourceItem) {
  return parseTime(sourcePlaybackDate(item)) || parseTime(item.addedAt) || 0;
}

function sourceTimingLabel(item: ScreeningSourceItem) {
  return `上映 ${item.year || "待补"} · 播放 ${formatDateLabel(sourcePlaybackDate(item))}`;
}

function defaultFanshiReview(item: ScreeningSourceItem) {
  if (item.fanshiReview) return item.fanshiReview;
  if (item.category === "bad") return "泛式评价：适合当作反面案例一起吐槽，重点看它怎么把好点子拍歪。";
  if (item.category === "anime") return "泛式评价：动画片源优先看演出、节奏和弹幕讨论密度。";
  if (item.category === "good" || item.category === "classic") return "泛式评价：放映会适合复盘结构、表演和名场面，属于可以沉淀进片单的作品。";
  return "泛式评价：资料仍可继续补完，欢迎补充播放入口、版本说明或吐槽点。";
}

function buildScreeningRecords(schedule: ScreeningScheduleContent, library: ScreeningLibraryContent) {
  const sourceById = new Map(library.items.map((item) => [item.id, item]));
  const sourceByTitle = new Map(library.items.map((item) => [item.title.trim().toLowerCase(), item]));
  const records = new Map<string, ScreeningRecord>();

  for (const week of schedule.weeks) {
    if (week.status !== "ended") continue;

    for (const movie of week.movies) {
      const source = sourceById.get(movie.libraryId || movie.id) || sourceByTitle.get(movie.title.trim().toLowerCase());
      records.set(movieRecordKey(movie), { movie: source ? { ...movie, ...source, type: source.category } : movie, week, source });
    }
  }

  for (const source of library.items) {
    if (source.status !== "watched") continue;

    const key = source.id;
    if (records.has(key)) continue;

    records.set(key, {
      movie: {
        id: source.id,
        libraryId: source.id,
        type: source.category,
        title: source.title,
        originalTitle: source.originalTitle,
        year: source.year,
        duration: source.duration,
        rating: source.rating,
        posterUrl: source.posterUrl,
        description: source.description,
        sourceUrl: source.sourceUrl,
        tags: source.tags,
        note: source.sourceNote
      },
      source
    });
  }

  return Array.from(records.values());
}

function buildMonthlyActivity(weeks: ScreeningWeek[]) {
  const byMonth = new Map<string, { key: string; label: string; good: number; bad: number; anime: number; other: number; viewers: number }>();

  for (const week of weeks) {
    if (week.status !== "ended") continue;
    const time = parseTime(week.startsAt || week.date);
    const date = time ? new Date(time) : undefined;
    const key = date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}` : week.date.slice(0, 7);
    const label = date ? `${String(date.getFullYear()).slice(2)}.${date.getMonth() + 1}月` : week.date.slice(0, 7);
    const bucket = byMonth.get(key) || { key, label, good: 0, bad: 0, anime: 0, other: 0, viewers: 0 };

    for (const movie of week.movies) {
      if (movie.type === "bad") bucket.bad += 1;
      else if (movie.type === "anime") bucket.anime += 1;
      else if (movie.type === "good" || movie.type === "classic") bucket.good += 1;
      else bucket.other += 1;
    }

    bucket.viewers += week.viewerCount || 0;
    byMonth.set(key, bucket);
  }

  return Array.from(byMonth.values()).sort((a, b) => a.key.localeCompare(b.key)).slice(-6);
}

function buildCurrentMonthActivity(weeks: ScreeningWeek[]) {
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthWeeks = weeks
    .filter((week) => week.status === "ended")
    .filter((week) => {
      const time = parseTime(week.startsAt || week.date);
      const date = time ? new Date(time) : undefined;
      const key = date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}` : week.date.slice(0, 7);
      return key === monthKey;
    })
    .sort((a, b) => (parseTime(a.startsAt || a.date) || 0) - (parseTime(b.startsAt || b.date) || 0));

  return {
    key: monthKey,
    label: `${now.getFullYear()} 年 ${now.getMonth() + 1} 月`,
    weeks: monthWeeks,
    screeningCount: monthWeeks.length,
    movieCount: monthWeeks.reduce((sum, week) => sum + week.movies.length, 0),
    discussionCount: monthWeeks.reduce((sum, week) => sum + (week.discussionCount || 0), 0),
    recordUrlCount: monthWeeks.filter((week) => week.recordUrl || week.movies.some((movie) => movie.sourceUrl)).length,
    latestTitle: monthWeeks[monthWeeks.length - 1]?.title || "本月暂无已归档放映"
  };
}

function categoryBadgeClass(category?: string) {
  if (category === "bad") return "border-rose-500/20 bg-rose-500/10 text-rose-600";
  if (category === "anime") return "border-sky-500/20 bg-sky-500/10 text-sky-600";
  if (category === "topic") return "border-violet-500/20 bg-violet-500/10 text-violet-600";
  if (category === "classic" || category === "good") return "border-emerald-500/20 bg-emerald-500/10 text-emerald-600";
  return "border-border bg-muted text-muted-foreground";
}

function statusBadgeClass(status?: string) {
  if (status === "available") return "border-primary/20 bg-primary/10 text-primary";
  if (status === "planned") return "border-blue-500/20 bg-blue-500/10 text-blue-600";
  if (status === "watched") return "border-emerald-500/20 bg-emerald-500/10 text-emerald-600";
  if (status === "hidden" || status === "rejected") return "border-rose-500/20 bg-rose-500/10 text-rose-600";
  return "border-border bg-muted text-muted-foreground";
}

function priorityBadgeClass(priority?: string) {
  if (priority === "high") return "border-rose-500/20 bg-rose-500/10 text-rose-600";
  if (priority === "low") return "border-zinc-500/20 bg-zinc-500/10 text-zinc-500";
  return "border-blue-500/20 bg-blue-500/10 text-blue-600";
}

export function Screenings() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedWeek, setSelectedWeek] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useLocalStorage<'all' | 'todo' | 'history'>('screenings-activeTab', 'all');
  const [todoSort, setTodoSort] = useLocalStorage<'hot' | 'new'>('screenings-todoSort', 'hot');
  const [isNominateModalOpen, setIsNominateModalOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [libraryQuery, setLibraryQuery] = useState("");
  const [libraryCategoryFilter, setLibraryCategoryFilter] = useState("all");
  const [libraryStatusFilter, setLibraryStatusFilter] = useState("all");
  const [libraryTypeFilter, setLibraryTypeFilter] = useState("all");
  const [libraryPriorityFilter, setLibraryPriorityFilter] = useState("all");
  const [librarySpecialFilter, setLibrarySpecialFilter] = useState("all");
  const [isLibraryOverviewCollapsed, setIsLibraryOverviewCollapsed] = useState(false);
  const [isLibraryCompact, setIsLibraryCompact] = useState(false);
  const [libraryViewMode, setLibraryViewMode] = useLocalStorage<"cards" | "masonry" | "timeline">("screenings-library-view-mode", "cards");
  const [masonryPostersOnly, setMasonryPostersOnly] = useLocalStorage("screenings-masonry-posters-only", false);
  const [selectedLibraryItem, setSelectedLibraryItem] = useState<ScreeningSourceItem | null>(null);
  const [sourceSubmissionField, setSourceSubmissionField] = useState<ScreeningSourceSubmission["field"]>("other");
  const [sourceSubmissionContent, setSourceSubmissionContent] = useState("");
  const [sourceSubmissionContact, setSourceSubmissionContact] = useState("");
  const [sourceSubmissionStatus, setSourceSubmissionStatus] = useState("");
  const [watchedStatus, setWatchedStatus] = useState("");
  const [localWatchedSourceIds, setLocalWatchedSourceIds] = useLocalStorage<string[]>("screenings-local-watched-source-ids", []);
  const [syncedWatchedSourceIds, setSyncedWatchedSourceIds] = useState<string[]>([]);
  const [showTierList, setShowTierList] = useLocalStorage('screenings-showTierList', true);
  const [showTimeline, setShowTimeline] = useLocalStorage('screenings-showTimeline', true);
  const [showHistory, setShowHistory] = useLocalStorage('screenings-showHistory', true);
  const nextScreening = useContent<ScreeningNextContent>("screenings.next", defaultScreeningsNext);
  const scheduleContent = useContent<ScreeningScheduleContent>("screenings.schedule", defaultScreeningsSchedule);
  const todoContent = useContent<ScreeningTodoContent>("screenings.todo", defaultScreeningsTodo);
  const classicsContent = useContent<ScreeningClassicsContent>("screenings.classics", defaultScreeningsClassics);
  const animeContent = useContent<ScreeningAnimeContent>("screenings.anime", defaultScreeningsAnime);
  const libraryContent = useContent<ScreeningLibraryContent>("screenings.library", defaultScreeningLibrary);
  const sourceSubmissionsContent = useContent<ScreeningSourceSubmissionsContent>("screenings.sourceSubmissions", defaultScreeningSourceSubmissions);
  const { user, authFetch } = useAuth();
  const screeningsData = scheduleContent.weeks;
  const historyScreenings = classicsContent.timeline;
  const todoMovies = todoContent.items;
  const tierListData = animeContent.tierList;
  const historyMovies = animeContent.historyMovies;
  const archivedWeeks = useMemo(
    () => scheduleContent.weeks
      .filter((week) => week.status === "ended" && week.movies.length > 0)
      .sort((a, b) => (parseTime(a.startsAt || a.date) || 0) - (parseTime(b.startsAt || b.date) || 0)),
    [scheduleContent.weeks]
  );
  const screeningRecords = useMemo(
    () => buildScreeningRecords(scheduleContent, libraryContent),
    [scheduleContent, libraryContent]
  );
  const lastScreening = archivedWeeks[archivedWeeks.length - 1];
  const monthlyActivity = useMemo(() => buildMonthlyActivity(scheduleContent.weeks), [scheduleContent.weeks]);
  const currentMonthActivity = useMemo(() => buildCurrentMonthActivity(scheduleContent.weeks), [scheduleContent.weeks]);
  const automatedStats = useMemo(() => {
    const totalMovies = screeningRecords.length;
    const goodMovies = screeningRecords.filter(({ movie }) => movie.type === "good" || movie.type === "classic").length;
    const badMovies = screeningRecords.filter(({ movie }) => movie.type === "bad").length;
    const animeMovies = screeningRecords.filter(({ movie }) => movie.type === "anime").length;
    const topBadMovie = [...screeningRecords]
      .filter(({ movie }) => movie.type === "bad" && typeof movie.rating === "number")
      .sort((a, b) => (a.movie.rating || 0) - (b.movie.rating || 0))[0];
    const totalViewers = archivedWeeks.reduce((sum, week) => sum + (week.viewerCount || 0), 0);
    const totalDiscussions = archivedWeeks.reduce((sum, week) => sum + (week.discussionCount || 0), 0);
    const recordUrlCount = archivedWeeks.filter((week) => week.recordUrl || week.movies.some((movie) => movie.sourceUrl)).length;
    const hasViewerRecords = totalViewers > 0;
    const lastHasViewerRecord = Boolean((lastScreening?.viewerCount || 0) > 0 || (lastScreening?.discussionCount || 0) > 0);

    return {
      nextCountdownLabel: formatCountdown(nextScreening.startsAt),
      nextMovieSummary: formatMovieList(nextScreening.movies),
      lastScreeningLabel: formatDistanceFromNow(lastScreening?.startsAt || lastScreening?.date),
      lastMovieSummary: lastScreening ? formatMovieList(lastScreening.movies) : "暂无已归档放映",
      lastViewerCount: lastScreening?.viewerCount || 0,
      lastDiscussionCount: lastScreening?.discussionCount || 0,
      lastRecordLabel: lastHasViewerRecord
        ? `${(lastScreening?.viewerCount || 0).toLocaleString()} 人观看记录 · ${(lastScreening?.discussionCount || 0).toLocaleString()} 条讨论`
        : `${lastScreening?.movies.length || 0} 部片源 · ${lastScreening?.recordUrl || lastScreening?.movies.some((movie) => movie.sourceUrl) ? "含录播入口" : "待补录播"}`,
      archivedWeeks: archivedWeeks.length,
      totalMovies,
      goodMovies,
      badMovies,
      animeMovies,
      totalViewers,
      totalDiscussions,
      recordUrlCount,
      totalRecordLabel: hasViewerRecords
        ? `${totalViewers.toLocaleString()} 人观看记录 · ${totalDiscussions.toLocaleString()} 条讨论`
        : `${archivedWeeks.length.toLocaleString()} 场真实归档 · ${recordUrlCount.toLocaleString()} 场含录播`,
      topBadMovie
    };
  }, [archivedWeeks, lastScreening, nextScreening.movies, nextScreening.startsAt, screeningRecords]);
  const maxMonthlyActivity = Math.max(...monthlyActivity.map((item) => item.good + item.bad + item.anime + item.other), 1);
  const libraryStats = {
    total: libraryContent.items.length,
    available: libraryContent.items.filter((item) => item.status === "available").length,
    watched: libraryContent.items.filter((item) => item.status === "watched").length,
    anime: libraryContent.items.filter((item) => item.type === "anime" || item.category === "anime").length,
    classic: libraryContent.items.filter((item) => item.category === "classic" || item.category === "good").length,
    bad: libraryContent.items.filter((item) => item.category === "bad").length,
    playable: libraryContent.items.filter((item) => item.sourceUrl).length
  };
  const libraryPreviewItems = [...libraryContent.items]
    .sort((a, b) => sourceSortTime(b) - sourceSortTime(a))
    .slice(0, 4);
  const isRecentlyAdded = (addedAt: string) => {
    const added = new Date(addedAt).getTime();
    return Number.isFinite(added) && Date.now() - added <= 7 * 24 * 60 * 60 * 1000;
  };
  const myWatchedSourceIds = new Set([...localWatchedSourceIds, ...syncedWatchedSourceIds]);
  const libraryInsights = {
    total: libraryContent.items.length,
    available: libraryContent.items.filter((item) => item.status === "available").length,
    planned: libraryContent.items.filter((item) => item.status === "planned").length,
    watched: libraryContent.items.filter((item) => item.status === "watched").length,
    anime: libraryContent.items.filter((item) => item.type === "anime" || item.category === "anime").length,
    movie: libraryContent.items.filter((item) => item.type === "movie").length,
    bad: libraryContent.items.filter((item) => item.category === "bad").length,
    classic: libraryContent.items.filter((item) => item.category === "classic" || item.category === "good").length,
    topic: libraryContent.items.filter((item) => item.category === "topic").length,
    highPriority: libraryContent.items.filter((item) => item.priority === "high").length,
    missingPoster: libraryContent.items.filter((item) => !item.posterUrl).length,
    missingSource: libraryContent.items.filter((item) => !item.sourceUrl).length,
    recentlyAdded: libraryContent.items.filter((item) => isRecentlyAdded(item.addedAt)).length,
    myWatched: libraryContent.items.filter((item) => myWatchedSourceIds.has(item.id)).length
  };
  const categoryLabels: Record<string, string> = { all: "全部分类", good: "经典好片", bad: "绝世烂片", classic: "往期经典", anime: "动画", topic: "主题片", other: "其他" };
  const statusLabels: Record<string, string> = { all: "全部状态", available: "可排播", planned: "已计划", watched: "已看", hidden: "隐藏", rejected: "拒绝" };
  const typeLabels: Record<string, string> = { all: "全部类型", movie: "电影", anime: "动画", ova: "OVA", series: "剧集", short: "短片", other: "其他" };
  const priorityLabels: Record<string, string> = { all: "全部优先级", low: "低优先级", normal: "普通优先级", high: "高优先级" };
  const specialLabels: Record<string, string> = { all: "全部", missingPoster: "缺海报", missingSource: "缺片源", recentlyAdded: "最近入库", myWatched: "我看过" };
  const isBilibiliSource = (sourceUrl?: string) => Boolean(sourceUrl && (sourceUrl.includes("bilibili.com") || sourceUrl.includes("b23.tv")));
  const getSourceLabel = (sourceUrl?: string) => isBilibiliSource(sourceUrl) ? "Bilibili 录播" : "播放链接";
  const resetLibraryFilters = () => {
    setLibraryQuery("");
    setLibraryCategoryFilter("all");
    setLibraryStatusFilter("all");
    setLibraryTypeFilter("all");
    setLibraryPriorityFilter("all");
    setLibrarySpecialFilter("all");
  };
  const applyLibraryFilter = (patch: { category?: string; status?: string; type?: string; priority?: string; special?: string; reset?: boolean }) => {
    if (patch.reset) resetLibraryFilters();
    if (patch.category) setLibraryCategoryFilter(patch.category);
    if (patch.status) setLibraryStatusFilter(patch.status);
    if (patch.type) setLibraryTypeFilter(patch.type);
    if (patch.priority) setLibraryPriorityFilter(patch.priority);
    if (patch.special) setLibrarySpecialFilter(patch.special);
    setIsLibraryOpen(true);
  };
  const approvedSubmissionsBySource = useMemo(() => {
    const map = new Map<string, ScreeningSourceSubmission[]>();
    for (const item of sourceSubmissionsContent.items.filter((submission) => submission.status === "approved")) {
      map.set(item.sourceId, [...(map.get(item.sourceId) || []), item]);
    }
    return map;
  }, [sourceSubmissionsContent.items]);
  const filteredLibraryItems = libraryContent.items.filter((item) => {
    const query = libraryQuery.trim().toLowerCase();
    const matchesQuery = !query || [item.title, item.originalTitle, item.description, item.sourceUrl, item.sourceNote, item.type, item.category, item.status, ...item.tags]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query));
    const matchesCategory = libraryCategoryFilter === "all" || item.category === libraryCategoryFilter;
    const matchesStatus = libraryStatusFilter === "all" || item.status === libraryStatusFilter;
    const matchesType = libraryTypeFilter === "all" || item.type === libraryTypeFilter;
    const matchesPriority = libraryPriorityFilter === "all" || item.priority === libraryPriorityFilter;
    const matchesSpecial = librarySpecialFilter === "all" ||
      (librarySpecialFilter === "missingPoster" && !item.posterUrl) ||
      (librarySpecialFilter === "missingSource" && !item.sourceUrl) ||
      (librarySpecialFilter === "recentlyAdded" && isRecentlyAdded(item.addedAt)) ||
      (librarySpecialFilter === "myWatched" && myWatchedSourceIds.has(item.id));
    return matchesQuery && matchesCategory && matchesStatus && matchesType && matchesPriority && matchesSpecial;
  }).sort((a, b) => sourceSortTime(b) - sourceSortTime(a) || a.title.localeCompare(b.title));
  const activeLibraryFilters = [
    libraryQuery && `搜索：${libraryQuery}`,
    libraryCategoryFilter !== "all" && categoryLabels[libraryCategoryFilter],
    libraryStatusFilter !== "all" && statusLabels[libraryStatusFilter],
    libraryTypeFilter !== "all" && typeLabels[libraryTypeFilter],
    libraryPriorityFilter !== "all" && priorityLabels[libraryPriorityFilter],
    librarySpecialFilter !== "all" && specialLabels[librarySpecialFilter]
  ].filter(Boolean);
  const categoryQuickFilters = [
    { key: "all", label: "全部", count: libraryInsights.total },
    { key: "good", label: "经典好片", count: libraryContent.items.filter((item) => item.category === "good").length },
    { key: "classic", label: "往期经典", count: libraryContent.items.filter((item) => item.category === "classic").length },
    { key: "bad", label: "绝世烂片", count: libraryInsights.bad },
    { key: "anime", label: "动画", count: libraryInsights.anime },
    { key: "topic", label: "主题片", count: libraryInsights.topic },
    { key: "other", label: "其他", count: libraryContent.items.filter((item) => item.category === "other").length }
  ];
  const libraryViewOptions: Array<{ key: "cards" | "masonry" | "timeline"; label: string; desc: string }> = [
    { key: "cards", label: "信息卡", desc: "筛选和资料最全" },
    { key: "masonry", label: "海报瀑布流", desc: "像图库一样看封面" },
    { key: "timeline", label: "放映时间轴", desc: "按时间纵列查看" }
  ];
  const libraryTimelineItems = [...filteredLibraryItems].sort((a, b) => sourceSortTime(b) - sourceSortTime(a) || a.title.localeCompare(b.title));
  const randomLibraryItem = () => {
    const candidates = libraryContent.items.filter((item) => item.status === "available");
    if (candidates.length === 0) return;
    const item = candidates[Math.floor(Math.random() * candidates.length)];
    setLibraryQuery(item.title);
    setLibraryCategoryFilter("all");
    setLibraryStatusFilter("all");
    setLibraryTypeFilter("all");
    setLibraryPriorityFilter("all");
    setLibrarySpecialFilter("all");
    setIsLibraryOpen(true);
  };

  const handleLibraryScroll = (event: UIEvent<HTMLDivElement>) => {
    const scrollTop = event.currentTarget.scrollTop;

    setIsLibraryOverviewCollapsed((collapsed) => {
      if (!collapsed && scrollTop > 140) return true;
      if (collapsed && scrollTop < 64) return false;
      return collapsed;
    });
  };

  useEffect(() => {
    const updateCompactMode = () => setIsLibraryCompact(window.innerWidth < 768);
    updateCompactMode();
    window.addEventListener("resize", updateCompactMode);
    return () => window.removeEventListener("resize", updateCompactMode);
  }, []);

  useEffect(() => {
    if (isLibraryOpen) setIsLibraryOverviewCollapsed(isLibraryCompact);
    if (!isLibraryOpen) setSelectedLibraryItem(null);
  }, [isLibraryOpen, isLibraryCompact]);

  useEffect(() => {
    setSourceSubmissionField("other");
    setSourceSubmissionContent("");
    setSourceSubmissionContact("");
    setSourceSubmissionStatus("");
    setWatchedStatus("");
  }, [selectedLibraryItem?.id]);

  useEffect(() => {
    if (!user) {
      setSyncedWatchedSourceIds([]);
      return;
    }

    authFetch(`${CONTENT_API_BASE}/api/me/watched-sources`)
      .then((response) => response.json())
      .then((data: { items?: Array<{ sourceId: string }> }) => setSyncedWatchedSourceIds((data.items || []).map((item) => item.sourceId)))
      .catch(() => setSyncedWatchedSourceIds([]));
  }, [user?.id]);

  async function markSourceWatched(item: ScreeningSourceItem) {
    setLocalWatchedSourceIds((current) => Array.from(new Set([item.id, ...current])));
    setWatchedStatus(user ? "正在同步看过记录..." : "已记录在本机。登录后可同步到账号。 ");

    if (!user) return;

    try {
      const response = await authFetch(`${CONTENT_API_BASE}/api/me/watched-sources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceId: item.id, sourceTitle: item.title })
      });
      if (!response.ok) throw new Error("同步失败");
      setSyncedWatchedSourceIds((current) => Array.from(new Set([item.id, ...current])));
      setWatchedStatus("已同步到你的账号看过记录");
    } catch (error) {
      setWatchedStatus(error instanceof Error ? error.message : "同步失败，已先保存在本机");
    }
  }

  async function submitSourceSupplement() {
    if (!selectedLibraryItem || sourceSubmissionContent.trim().length < 4) {
      setSourceSubmissionStatus("请先填写至少 4 个字的补充信息");
      return;
    }

    setSourceSubmissionStatus("正在提交补充信息...");

    try {
      const response = await fetch(`${CONTENT_API_BASE}/api/public/screenings/source-submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceId: selectedLibraryItem.id,
          sourceTitle: selectedLibraryItem.title,
          field: sourceSubmissionField,
          content: sourceSubmissionContent,
          contact: sourceSubmissionContact,
          submitter: user?.name || "游客"
        })
      });

      if (!response.ok) throw new Error("提交失败");
      setSourceSubmissionContent("");
      setSourceSubmissionContact("");
      setSourceSubmissionStatus("已提交，站主会在后台工作台审核同意或拒绝");
    } catch (error) {
      const localSubmission: ScreeningSourceSubmission = {
        id: `local-source-submission-${Date.now()}`,
        sourceId: selectedLibraryItem.id,
        sourceTitle: selectedLibraryItem.title,
        field: sourceSubmissionField,
        content: sourceSubmissionContent,
        contact: sourceSubmissionContact || undefined,
        submitter: user?.name || "游客",
        status: "pending",
        createdAt: new Date().toISOString()
      };
      appendLocalSourceSubmission(localSubmission);
      setSourceSubmissionContent("");
      setSourceSubmissionContact("");
      setSourceSubmissionStatus("内容服务暂不可用，已先保存到本地工作台待办");
    }
  }

  const sortedTodoMovies = [...todoMovies].sort((a, b) => {
    if (todoSort === 'hot') {
      return b.votes - a.votes;
    } else {
      const getDays = (str: string) => {
        if (str.includes('天前')) return parseInt(str);
        if (str.includes('周前')) return parseInt(str) * 7;
        return 100;
      };
      return getDays(a.added) - getDays(b.added);
    }
  });

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", handleWheel);
    };
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      const targetScroll = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="py-20 md:py-32 w-full overflow-x-hidden relative min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Bento Box Top Area */}
        <div className="flex flex-col lg:flex-row gap-8 mb-24">
          {/* Left Column */}
          <div className="flex-1 flex flex-col">
            {/* Title area */}
            <div className="mb-8">
                <h1 className="text-5xl md:text-6xl font-bold tracking-tighter text-foreground mb-6">
                  周末放映会
                </h1>

                {/* Filter Pills */}
                <div className="flex flex-wrap gap-2 md:gap-3">
                  <button
                    onClick={() => setActiveTab('all')}
                    className={cn(
                      "font-medium px-5 py-2 rounded-full text-sm inline-flex items-center gap-2 transition-colors",
                      activeTab === 'all'
                        ? "bg-foreground text-background"
                        : "bg-muted text-foreground/80 hover:text-foreground border border-border/40 hover:bg-black/5 dark:hover:bg-white/5"
                    )}
                  >
                    <MonitorPlay className="w-4 h-4" /> 全部情报
                  </button>
                  <button className="bg-muted text-foreground/80 hover:text-foreground font-medium px-5 py-2 rounded-full text-sm inline-flex items-center gap-2 border border-border/40 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <Film className="w-4 h-4" /> 经典好片
                  </button>
                  <button className="bg-muted text-foreground/80 hover:text-foreground font-medium px-5 py-2 rounded-full text-sm inline-flex items-center gap-2 border border-border/40 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <AlertTriangle className="w-4 h-4" /> 绝世烂片
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={cn(
                      "font-medium px-5 py-2 rounded-full text-sm inline-flex items-center gap-2 transition-colors",
                      activeTab === 'history'
                        ? "bg-foreground text-background"
                        : "bg-muted text-foreground/80 hover:text-foreground border border-border/40 hover:bg-black/5 dark:hover:bg-white/5"
                    )}
                  >
                    <History className="w-4 h-4" /> 动画放映
                  </button>
                  <button
                    onClick={() => setActiveTab('todo')}
                    className={cn(
                      "font-medium px-5 py-2 rounded-full text-sm inline-flex items-center gap-2 transition-colors",
                      activeTab === 'todo'
                        ? "bg-foreground text-background"
                        : "bg-muted text-foreground/80 hover:text-foreground border border-border/40 hover:bg-black/5 dark:hover:bg-white/5"
                    )}
                  >
                    <ListTodo className="w-4 h-4" /> 待定观影
                  </button>
                </div>
            </div>

            {activeTab === 'all' && (
              <>
                <div className="mb-4">
                    <h3 className="text-[15px] font-medium text-muted-foreground">自动记录情报</h3>
                </div>

                {/* Grid Area */}
                <motion.div
                  variants={{
                    show: { transition: { staggerChildren: 0.1 } }
                  }}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full"
                >
                {/* Card 1 */}
                <motion.div
                  variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="bg-[#fad4d4]/60 dark:bg-rose-950/40 border border-[#f5baba]/60 dark:border-rose-900/30 rounded-3xl p-6 flex flex-col shadow-sm cursor-pointer relative overflow-hidden group/box"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 opacity-0 group-hover/box:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  <div className="flex items-center justify-between mb-4 relative z-10">
                      <span className="flex items-center gap-2 text-sm font-semibold text-rose-700 dark:text-rose-400 group-hover/box:text-rose-600 transition-colors"><Clock className="w-4 h-4" /> 下次放映倒计时</span>
                      <span className="text-[11px] bg-white/70 dark:bg-black/20 text-rose-600 dark:text-rose-400 font-medium px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm"><Star className="w-3 h-3 fill-current" /> {nextScreening.statusText}</span>
                  </div>
                  <div className="my-2 relative z-10">
                    <h4 className="text-2xl font-bold text-foreground">{automatedStats.nextCountdownLabel}</h4>
                    <p className="text-sm font-medium text-foreground/70 mt-1.5 line-clamp-1">{automatedStats.nextMovieSummary}</p>
                    <p className="text-xs text-foreground/50 mt-1">{nextScreening.movies.length} 部已绑定片源 · {nextScreening.startsAt}</p>
                  </div>
                  <div className="mt-auto flex justify-end relative z-10">
                      <div className="flex -space-x-2">
                        <div className="w-7 h-7 rounded-full bg-zinc-200 border-2 border-[#fad4d4]/80 dark:border-rose-950" />
                        <div className="w-7 h-7 rounded-full bg-zinc-300 border-2 border-[#fad4d4]/80 dark:border-rose-950" />
                        <div className="w-7 h-7 rounded-full bg-zinc-400 border-2 border-[#fad4d4]/80 dark:border-rose-950 flex items-center justify-center text-[10px] text-white">...</div>
                      </div>
                  </div>
                </motion.div>

                {/* Card 2 */}
                <motion.div
                  variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="bg-[#fde6b3]/50 dark:bg-amber-950/40 border border-[#fbcd82]/50 dark:border-amber-900/30 rounded-3xl p-6 flex flex-col shadow-sm cursor-pointer relative overflow-hidden group/box"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 opacity-0 group-hover/box:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  <div className="flex items-center justify-between mb-4 relative z-10">
                      <span className="flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-400 group-hover/box:text-amber-600 transition-colors"><History className="w-4 h-4" /> 距离上次放映</span>
                      <span className="text-[11px] bg-white/70 dark:bg-black/20 text-amber-600 dark:text-amber-400 font-medium px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm"><Star className="w-3 h-3 fill-current" /> {lastScreening?.statusText || "暂无"}</span>
                  </div>
                  <div className="my-2 relative z-10">
                    <h4 className="text-2xl font-bold text-foreground">{automatedStats.lastScreeningLabel}</h4>
                    <p className="text-sm font-medium text-foreground/70 mt-1.5 line-clamp-1">{automatedStats.lastMovieSummary}</p>
                    <p className="text-xs text-foreground/50 mt-1">{automatedStats.lastRecordLabel}</p>
                  </div>
                  <div className="mt-auto flex justify-end relative z-10">
                      <div className="flex -space-x-2">
                        <div className="w-7 h-7 rounded-full bg-zinc-200 border-2 border-[#fde6b3]/80 dark:border-amber-950" />
                        <div className="w-7 h-7 rounded-full bg-zinc-300 border-2 border-[#fde6b3]/80 dark:border-amber-950" />
                      </div>
                  </div>
                </motion.div>

                {/* Card 3 */}
                <motion.div
                  variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="bg-[#e0e7ff]/70 dark:bg-indigo-950/40 border border-[#c7d2fe]/70 dark:border-indigo-900/30 rounded-3xl p-6 flex flex-col shadow-sm cursor-pointer relative overflow-hidden group/box"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 opacity-0 group-hover/box:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  <div className="flex items-center justify-between mb-4 relative z-10">
                      <span className="flex items-center gap-2 text-sm font-semibold text-indigo-700 dark:text-indigo-400 group-hover/box:text-indigo-600 transition-colors"><MonitorPlay className="w-4 h-4" /> 累计放映</span>
                      <span className="text-[11px] bg-white/70 dark:bg-black/20 text-indigo-600 dark:text-indigo-400 font-medium px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm"><Star className="w-3 h-3 fill-current" /> {automatedStats.archivedWeeks} 场</span>
                  </div>
                  <div className="my-2 relative z-10">
                    <h4 className="text-2xl font-bold text-foreground">{automatedStats.totalMovies} 部作品</h4>
                    <p className="text-sm font-medium text-foreground/70 mt-1.5 line-clamp-1">经典/好片 {automatedStats.goodMovies} 部 · 动画 {automatedStats.animeMovies} 部 · 反面案例 {automatedStats.badMovies} 部</p>
                    <p className="text-xs text-foreground/50 mt-1">{automatedStats.totalRecordLabel} · {libraryStats.playable} 条播放链接</p>
                  </div>
                  <div className="mt-auto flex justify-end relative z-10">
                      <div className="flex -space-x-2">
                        <div className="w-7 h-7 rounded-full bg-zinc-200 border-2 border-[#e0e7ff]/80 dark:border-indigo-950" />
                        <div className="w-7 h-7 rounded-full bg-zinc-300 border-2 border-[#e0e7ff]/80 dark:border-indigo-950" />
                        <div className="w-7 h-7 rounded-full bg-zinc-400 border-2 border-[#e0e7ff]/80 dark:border-indigo-950 flex items-center justify-center text-[10px] text-white">...</div>
                      </div>
                  </div>
                </motion.div>

                {/* Card 4 */}
                <motion.div
                  variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="bg-[#d1fae5]/50 dark:bg-emerald-950/40 border border-[#a7f3d0]/50 dark:border-emerald-900/30 rounded-3xl p-6 flex flex-col shadow-sm cursor-pointer relative overflow-hidden group/box"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 opacity-0 group-hover/box:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  <div className="flex items-center justify-between mb-4 relative z-10">
                      <span className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400 group-hover/box:text-emerald-600 transition-colors"><Star className="w-4 h-4" /> 最低评分记录</span>
                      <span className="text-[11px] bg-white/70 dark:bg-black/20 text-emerald-600 dark:text-emerald-400 font-medium px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm"><Star className="w-3 h-3 fill-current" /> 自动</span>
                  </div>
                  <div className="my-2 relative z-10">
                    <h4 className="text-2xl font-bold text-foreground">{automatedStats.topBadMovie?.movie.title || "暂无反面案例"}</h4>
                    <p className="text-sm font-medium text-foreground/70 mt-1.5 line-clamp-1">评分 {automatedStats.topBadMovie?.movie.rating ?? "-"} · {automatedStats.topBadMovie?.week?.title || "来自片源库"}</p>
                    <p className="text-xs text-foreground/50 mt-1">{automatedStats.badMovies} 部反面案例已进入记录</p>
                  </div>
                  <div className="mt-auto flex justify-end relative z-10">
                      <div className="flex -space-x-2">
                        <div className="w-7 h-7 rounded-full bg-zinc-200 border-2 border-[#d1fae5]/80 dark:border-emerald-950" />
                      </div>
                  </div>
                </motion.div>
            </motion.div>
              </>
            )}

            {activeTab === 'todo' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex-1 flex flex-col h-full"
              >
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-[15px] font-medium text-muted-foreground inline-flex items-center gap-2">观众提名待定池</h3>
                    <div className="flex items-center gap-3">
                        <div className="flex rounded-md border bg-muted/50 p-0.5">
                            <button onClick={() => setTodoSort('hot')} className={cn("px-2.5 py-1 text-xs font-medium rounded-sm transition-colors", todoSort === 'hot' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}>最热</button>
                            <button onClick={() => setTodoSort('new')} className={cn("px-2.5 py-1 text-xs font-medium rounded-sm transition-colors", todoSort === 'new' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}>最新</button>
                        </div>
                        <button onClick={() => setIsNominateModalOpen(true)} className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
                          <Plus className="w-3.5 h-3.5" /> 提名新电影
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-3 h-full pb-2">
                  {sortedTodoMovies.map((todo, idx) => (
                    <motion.div
                      key={todo.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={cn(
                        "p-4 rounded-3xl border flex items-center gap-4 group/todo cursor-pointer transition-all",
                        todo.status === 'urgent'
                          ? "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50 hover:bg-rose-100/50 dark:hover:bg-rose-950/40"
                          : "bg-background border-border/80 hover:border-blue-500/30 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 shadow-sm hover:shadow-md"
                      )}
                    >
                      {/* Checkbox circle mock */}
                      <div className="shrink-0 w-6 h-6 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center group-hover/todo:border-blue-500/50 transition-colors">
                         <div className="w-2.5 h-2.5 rounded-full bg-blue-500 opacity-0 group-hover/todo:opacity-50 transition-opacity" />
                      </div>

                      <div className="flex-1 min-w-0 py-0.5">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={cn("text-[15px] font-bold truncate", todo.status === 'urgent' ? "text-rose-700 dark:text-rose-400" : "text-foreground")}>
                            {todo.title}
                          </h4>
                          {todo.status === 'urgent' && (
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-100 dark:bg-rose-900/50 px-2 py-0.5 rounded-full whitespace-nowrap">呼声极高</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{todo.reason}</p>
                      </div>

                      <div className="shrink-0 flex flex-col items-end justify-center gap-1.5 ml-2">
                        <div className="text-[10px] font-medium text-muted-foreground bg-muted/80 px-2 py-0.5 rounded-md">{todo.added}</div>
                        <div className="inline-flex items-center gap-1 text-[11px] font-bold text-foreground/60 group-hover/todo:text-blue-600 dark:group-hover/todo:text-blue-400">
                          <ThumbsUp className="w-3 h-3" /> {todo.votes}
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Empty completion slot */}
                  <div className="p-4 rounded-3xl border-2 border-dashed border-border/60 flex items-center justify-center text-muted-foreground/60 text-sm font-medium gap-2 mt-2 h-[72px] hover:border-border transition-colors hover:text-muted-foreground cursor-pointer">
                    <CheckCircle2 className="w-4 h-4" /> 查看另外 12 部已播出的影片
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex-1 flex flex-col h-full"
              >
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-[15px] font-medium text-muted-foreground inline-flex items-center gap-2">时光机动画放映</h3>
                </div>

                <div className="flex flex-col gap-3 h-full pb-2">
                  {historyMovies.map((history, idx) => (
                    <motion.div
                      key={history.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-4 rounded-3xl border flex items-center gap-4 group/history cursor-pointer transition-all bg-background border-border/80 hover:border-blue-500/30 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 shadow-sm hover:shadow-md"
                    >
                      <div className="shrink-0 w-6 h-6 rounded-full border border-blue-500/30 bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                         <CheckCircle2 className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0 py-0.5">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-[15px] font-bold truncate text-foreground">
                            {history.title}
                          </h4>
                        </div>
                        <p className="text-[13px] text-muted-foreground truncate">{history.reason}</p>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0 pl-2">
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-muted/60 rounded-full">
                           <Users className="w-3 h-3 text-muted-foreground/70" />
                           <span className="text-[11px] font-semibold text-muted-foreground">{history.viewers}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground/60 font-medium px-1.5">{history.date}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column / Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="w-full lg:w-[380px] shrink-0 flex flex-col mt-8 lg:mt-0"
          >
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-[#f8f5ee] dark:bg-[#1a1917] border border-[#e8dfce] dark:border-[#38332c] rounded-[2rem] p-6 lg:p-8 flex-1 flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] relative overflow-hidden group/sidebar"
            >
                {/* Ambient glow */}
                <div className="absolute -top-32 -left-32 w-64 h-64 bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-[64px] pointer-events-none group-hover/sidebar:bg-amber-500/20 transition-colors duration-1000" />
                <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-[64px] pointer-events-none group-hover/sidebar:bg-blue-500/20 transition-colors duration-1000" />

                {/* Header info */}
                <div className="flex justify-between items-start mb-6 w-full relative z-10">
                   <MonitorPlay className="w-5 h-5 text-foreground/60" />
                   <button className="hover:bg-black/5 dark:hover:bg-white/5 p-2 rounded-full transition-colors -m-2">
                     <svg className="w-5 h-5 text-foreground/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                   </button>
                </div>

                {/* Profile part */}
                <div className="flex flex-col items-center mb-6 relative z-10">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-white dark:bg-zinc-800 border-2 border-white shadow-md mb-4 group-hover/sidebar:scale-105 transition-transform duration-500">
                    <img src="https://api.dicebear.com/7.x/notionists/svg?seed=fanshi123" alt="Fanshi" className="w-full h-full object-cover scale-110" />
                  </div>
                  <h3 className="font-bold text-xl text-foreground mb-1 group-hover/sidebar:text-blue-600 dark:group-hover/sidebar:text-blue-400 transition-colors">泛式放映厅</h3>
                  <p className="text-[13px] text-muted-foreground text-center font-medium">每个周末与你相约吐槽烂片感受神作</p>
                </div>

                {/* Typewriter AI Effect */}
                <div className="bg-background/90 dark:bg-black/40 rounded-full px-5 py-2 border border-border/60 text-[11px] font-bold text-muted-foreground flex items-center justify-center gap-3 mb-8 w-max mx-auto shadow-sm backdrop-blur-md relative z-10 hover:border-blue-500/30 transition-colors cursor-default">
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </div>
                  <TypewriterEffect texts={[
                    "AI 正在分析本周排播数据...",
                    `${automatedStats.nextMovieSummary} 已绑定`,
                    `已归档 ${automatedStats.archivedWeeks} 场周末放映`,
                    `片源库当前 ${libraryStats.total} 部作品`
                  ]} />
                </div>

                {/* Info Pills */}
                <div className="bg-white/80 dark:bg-black/20 rounded-2xl p-4 mb-8 relative z-10 flex items-center justify-between border border-border/40 shadow-sm backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-full">
                       <Users className="w-4 h-4 text-foreground/70" />
                    </div>
                    <div>
                       <div className="text-sm font-bold text-foreground">{automatedStats.archivedWeeks}</div>
                       <div className="text-[11px] text-muted-foreground font-medium">已归档场次</div>
                    </div>
                  </div>
                  <div className="flex -space-x-1.5">
                    <div className="w-7 h-7 rounded-full border-2 border-white dark:border-[#2a2825] bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-800">A</div>
                    <div className="w-7 h-7 rounded-full border-2 border-white dark:border-[#2a2825] bg-pink-100 flex items-center justify-center text-[10px] font-bold text-pink-800">B</div>
                    <div className="w-7 h-7 rounded-full border-2 border-white dark:border-[#2a2825] bg-yellow-100 flex flex-col items-center justify-center text-[10px] font-bold text-foreground/60">
                       <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>

                {/* Chart Activity */}
                <div className="relative z-10 flex-1 flex flex-col justify-end">
                  <div className="flex items-center justify-between mb-4">
                      <div>
                         <span className="text-xs font-semibold text-muted-foreground block mb-1">本月真实放映记录</span>
                         <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xl font-bold">{currentMonthActivity.screeningCount.toLocaleString()}<span className="text-sm font-normal text-muted-foreground ml-0.5">场</span></span>
                            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded whitespace-nowrap">{currentMonthActivity.movieCount} 部片源</span>
                            <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded whitespace-nowrap">{currentMonthActivity.discussionCount.toLocaleString()} 条杂谈</span>
                            <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded whitespace-nowrap">{currentMonthActivity.recordUrlCount} 录播</span>
                         </div>
                         <div className="mt-1 max-w-[240px] truncate text-[11px] font-bold text-muted-foreground">{currentMonthActivity.label} · {currentMonthActivity.latestTitle}</div>
                      </div>
                      <span className="text-[10px] font-medium bg-white dark:bg-black/20 px-2.5 py-1.5 rounded-full border border-border/50 text-foreground/70 shadow-sm">自动</span>
                  </div>

                  {/* Histogram generated from archived schedule records */}
                  <div className="flex items-end justify-between h-[100px] gap-2 mt-auto">
                      {(monthlyActivity.length > 0 ? monthlyActivity : [{ label: "暂无", good: 0, bad: 0, anime: 0, other: 0, viewers: 0 }]).map((bucket) => {
                        const total = bucket.good + bucket.bad + bucket.anime + bucket.other;
                        const scale = Math.max(total / maxMonthlyActivity, 0.08);
                        return (
                          <div key={bucket.label} className="w-full h-full flex flex-col justify-end gap-0.5 group" title={`${bucket.label}: ${total} 部`}>
                            {bucket.good > 0 && <div className="w-full bg-[#86efac]/80 dark:bg-emerald-500/60 rounded-t-lg transition-transform group-hover:-translate-y-1" style={{ height: `${Math.max(18, 70 * scale * (bucket.good / Math.max(total, 1)))}%` }} />}
                            {bucket.anime > 0 && <div className="w-full bg-[#93c5fd]/80 dark:bg-blue-500/60 transition-transform group-hover:-translate-y-1" style={{ height: `${Math.max(14, 70 * scale * (bucket.anime / Math.max(total, 1)))}%` }} />}
                            {bucket.bad > 0 && <div className="w-full bg-[#fca5a5]/80 dark:bg-red-500/60 transition-transform group-hover:-translate-y-1" style={{ height: `${Math.max(14, 70 * scale * (bucket.bad / Math.max(total, 1)))}%` }} />}
                            {bucket.other > 0 && <div className="w-full bg-[#c4b5fd]/80 dark:bg-indigo-500/60 rounded-b-md transition-transform group-hover:-translate-y-1" style={{ height: `${Math.max(12, 70 * scale * (bucket.other / Math.max(total, 1)))}%` }} />}
                            {total === 0 && <div className="w-full bg-muted rounded-md h-[8%]" />}
                          </div>
                        );
                      })}
                  </div>
                  <div className="flex justify-between mt-3 px-1">
                      {(monthlyActivity.length > 0 ? monthlyActivity : [{ label: "暂无" }]).map((bucket, index, list) => (
                        <span key={bucket.label} className={cn("text-[10px] w-full text-center", index === list.length - 1 ? "font-bold text-background bg-foreground px-1.5 py-0.5 rounded-full tracking-tighter -mx-1" : "font-medium text-muted-foreground")}>{bucket.label}</span>
                      ))}
                  </div>
                </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Timeline Header */}
        <div className="mb-12 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground flex items-center gap-2">
              排播周期轴
            </h2>
            <div className="flex bg-muted p-1 rounded-full border border-border">
              <button
                onClick={() => setShowTimeline(true)}
                className={cn("px-4 py-1.5 rounded-full text-sm font-medium transition-all", showTimeline ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
              >
                显示
              </button>
              <button
                onClick={() => setShowTimeline(false)}
                className={cn("px-4 py-1.5 rounded-full text-sm font-medium transition-all", !showTimeline ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
              >
                隐藏
              </button>
            </div>
          </div>
          {showTimeline && (
            <div className="flex gap-2">
              <button
                onClick={() => scroll('left')}
                className="w-10 h-10 flex items-center justify-center bg-background hover:bg-muted border border-border/60 rounded-full shadow-sm transition-all"
              >
                <ChevronLeft className="w-4 h-4 text-foreground/80" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="w-10 h-10 flex items-center justify-center bg-background hover:bg-muted border border-border/60 rounded-full shadow-sm transition-all"
              >
                <ChevronRight className="w-4 h-4 text-foreground/80" />
              </button>
            </div>
          )}
        </div>

        {/* Timeline Visualization */}
        <AnimatePresence>
          {showTimeline && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="relative w-full mb-32 group/roadmap overflow-hidden"
            >
          {/* Scroll Container */}
          <div
            ref={scrollContainerRef}
            className="relative flex items-center overflow-x-auto no-scrollbar scroll-smooth py-64 px-4 md:px-12"
            style={{ WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)' }}
          >
            {/* Horizontal Line Background */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border/50 -translate-y-1/2 z-0 min-w-max w-full">
               <div className="h-full bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-border/50 w-full" />
            </div>

            <div className="flex gap-40 md:gap-56 items-center relative z-10 w-max min-w-full px-12">
              {screeningsData.map((node, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true, margin: "0px" }}
                  transition={{ duration: 0.5, delay: idx * 0.1, type: "spring", stiffness: 100 }}
                  className="relative flex flex-col items-center shrink-0 w-8"
                >
                  {/* Good Movie */}
                  {node.movies.filter(m => m.type === 'good').map((movie, cIndex) => (
                    <motion.div
                      key={`good-${cIndex}`}
                      whileHover={{ y: -8, scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="absolute bottom-[64px] flex flex-col gap-4 items-center w-[260px] md:w-[300px]"
                    >
                      <div className="absolute -bottom-[28px] w-px h-[28px] bg-gradient-to-b from-transparent to-emerald-500/50" />
                      <div className="w-full bg-background border border-border/80 rounded-2xl p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(16,185,129,0.15)] hover:border-emerald-500/30 transition-all flex flex-col gap-3 relative z-10 overflow-hidden group/card cursor-pointer">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 px-2.5 py-1 rounded-full">
                            <Star className="w-3 h-3 fill-current" />
                            经典好片
                          </span>
                          <span className="text-xs font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">{movie.rating} 分</span>
                        </div>
                        <h4 className="text-base font-bold text-foreground group-hover/card:text-emerald-500 transition-colors">{movie.title}</h4>
                        {movie.description && (
                          <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-2">{movie.description}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}

                  {/* Node Dot & Title */}
                  <div className="relative z-10 flex flex-col items-center group/node">
                    <div className={cn("w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-500 shadow-xl",
                      node.status === 'live' ? "bg-red-500/10 shadow-red-500/20 group-hover/node:scale-110" :
                      node.status === 'ended' ? "bg-zinc-100 dark:bg-zinc-800 shadow-black/5" :
                      "bg-blue-500/10 shadow-blue-500/20 group-hover/node:scale-110")}>
                      <div className="w-6 h-6 rounded-full bg-background border border-border/80 flex items-center justify-center shadow-inner relative">
                        <div className={cn("w-2.5 h-2.5 rounded-full transition-colors duration-300",
                          node.status === 'live' ? "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]" :
                          node.status === 'ended' ? "bg-zinc-300 dark:bg-zinc-600" :
                          "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]")} />
                        {node.status === 'live' && (
                          <div className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping opacity-50" />
                        )}
                      </div>
                    </div>

                    <div className="absolute top-[60px] flex flex-col items-center whitespace-nowrap z-20 transition-transform duration-300 group-hover/node:translate-y-1">
                      <span className={cn("text-lg font-bold mb-1 transition-colors duration-300",
                        node.status === 'live' ? "text-red-500" :
                        node.status === 'ended' ? "text-foreground/80" : "text-blue-500"
                      )}>{node.title}</span>
                      <span className="text-[11px] font-bold text-muted-foreground mb-3 tracking-widest uppercase bg-muted/50 px-2 py-0.5 rounded-sm">{node.date}</span>
                      <span className={cn("text-[10px] font-black px-3 py-1.5 rounded-full tracking-widest uppercase transition-all duration-300 shadow-sm",
                        node.status === 'live' ? "bg-red-500 border border-red-400 text-white shadow-red-500/30 group-hover/node:shadow-red-500/50" :
                        node.status === 'planned' ? "bg-blue-50 dark:bg-blue-900/30 border border-blue-500/30 text-blue-600 dark:text-blue-400" :
                        "bg-muted border border-border/50 text-muted-foreground")}>
                        {node.status === 'live' ? (
                           <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 animate-pulse" /> {node.statusText}</span>
                        ) : node.statusText}
                      </span>
                    </div>
                  </div>

                  {/* Bad Movie */}
                  {node.movies.filter(m => m.type === 'bad').map((movie, cIndex) => (
                    <motion.div
                      key={`bad-${cIndex}`}
                      whileHover={{ y: 8, scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="absolute top-[176px] flex flex-col gap-4 items-center w-[260px] md:w-[300px]"
                    >
                      <div className="absolute -top-[28px] w-px h-[28px] bg-gradient-to-t from-transparent to-rose-500/50" />
                      <div className="w-full bg-background border border-border/80 rounded-2xl p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(225,29,72,0.15)] hover:border-rose-500/30 transition-all flex flex-col gap-3 relative z-10 overflow-hidden group/card cursor-pointer">
                        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent pointer-events-none opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-rose-600 bg-rose-50 dark:bg-rose-900/30 dark:text-rose-400 px-2.5 py-1 rounded-full">
                            <AlertTriangle className="w-3 h-3" />
                            绝世烂片
                          </span>
                          <span className="text-xs font-black text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full">{movie.rating} 分</span>
                        </div>
                        <h4 className="text-base font-bold text-foreground group-hover/card:text-rose-500 transition-colors">{movie.title}</h4>
                        {movie.description && (
                          <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-2">{movie.description}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}

                  {/* Empty state indication */}
                  {node.movies.length === 0 && (
                     <motion.div
                       initial={{ opacity: 0 }}
                       whileInView={{ opacity: 0.6 }}
                       className="absolute top-[176px] flex flex-col gap-4 items-center w-[200px]"
                     >
                        <div className="absolute -top-[28px] w-px h-[28px] bg-gradient-to-t from-transparent to-border/50" />
                        <div className="w-full border-2 border-dashed border-border/50 bg-muted/20 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
                           <span className="text-sm font-medium text-muted-foreground tracking-widest">排期空缺</span>
                        </div>
                     </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
        )}
        </AnimatePresence>

        {/* Source Library Entry */}
        <section className="w-full max-w-7xl mx-auto mb-32 relative z-20">
          <div className="relative overflow-hidden rounded-[2rem] border border-border bg-background p-6 shadow-sm md:p-8">
            <div className="absolute -right-24 -top-24 size-72 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -bottom-28 left-1/4 size-64 rounded-full bg-sky-500/10 blur-3xl" />
            <div className="relative grid gap-6 lg:grid-cols-[1.05fr_0.75fr_1fr] lg:items-stretch">
              <div className="flex flex-col justify-between gap-6">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-black tracking-widest text-primary">
                    <Database className="size-3.5" /> SOURCE LIBRARY
                  </span>
                  <h2 className="mt-4 text-3xl font-black tracking-tight text-foreground md:text-4xl">{libraryContent.title}</h2>
                  <p className="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground md:text-base">{libraryContent.description} 这里是排播主数据源，Bilibili 录播链接可在后台手动维护并直接跳转。</p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <label className="flex h-12 flex-1 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-medium text-muted-foreground shadow-sm">
                    <Search className="size-4" />
                    <input className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground" placeholder="搜索片名 / 标签 / 类型" value={libraryQuery} onChange={(event) => setLibraryQuery(event.target.value)} onFocus={() => setIsLibraryOpen(true)} />
                  </label>
                  <button onClick={() => setIsLibraryOpen(true)} className="inline-flex h-12 items-center justify-center rounded-full bg-foreground px-5 text-sm font-bold text-background shadow-sm transition-transform hover:scale-[1.02]">
                    打开片源库
                  </button>
                  <button onClick={randomLibraryItem} className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-bold text-foreground shadow-sm transition-colors hover:bg-muted">
                    <Shuffle className="size-4" /> 随机抽片
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  ["全部片源", libraryStats.total],
                  ["已看", libraryStats.watched],
                  ["动画", libraryStats.anime],
                  ["经典好片", libraryStats.classic],
                  ["绝世烂片", libraryStats.bad],
                  ["可跳转播放", libraryStats.playable]
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm backdrop-blur">
                    <div className="text-2xl font-black text-foreground">{value}</div>
                    <div className="mt-1 text-xs font-bold text-muted-foreground">{label}</div>
                  </div>
                ))}
              </div>

              <div className="rounded-3xl border border-border/70 bg-card/80 p-4 shadow-sm backdrop-blur">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-black text-foreground">最近入库 / 高优先级</h3>
                  <span className="text-xs font-bold text-muted-foreground">{libraryContent.tags.slice(0, 3).join(" / ")}</span>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  {libraryPreviewItems.map((item) => (
                    <div key={item.id} className="group/library flex gap-3 rounded-2xl border border-border/60 bg-background p-3 transition-colors hover:border-primary/30">
                      <div className="h-20 w-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                        {item.posterUrl ? <img src={item.posterUrl} alt={item.title} className="h-full w-full object-cover transition-transform group-hover/library:scale-105" /> : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-black text-foreground">{item.title}</div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">{item.status === "available" ? "可排播" : item.status === "watched" ? "已看" : "已计划"}</span>
                          {item.rating ? <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600">{item.rating} 分</span> : null}
                        </div>
                        <p className="mt-2 line-clamp-2 text-xs font-medium leading-relaxed text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <AnimatePresence>
          {isLibraryOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-0 backdrop-blur-sm md:p-4">
              <motion.div initial={{ opacity: 0, scale: 0.98, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 16 }} transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }} className="relative flex h-dvh w-full max-w-6xl flex-col overflow-hidden border border-border bg-background shadow-2xl md:h-[min(92vh,820px)] md:rounded-[2rem]">
                <div className="shrink-0 flex items-start justify-between gap-3 border-b border-border p-3 md:p-5">
                  <div>
                    <span className="text-xs font-black tracking-widest text-primary">SOURCE LIBRARY</span>
                    <h3 className="mt-1 text-xl font-black text-foreground md:text-2xl">全量电影动画片源库</h3>
                    <p className="mt-1 hidden text-sm text-muted-foreground sm:block">搜索、筛选并查看所有候选片源；已配置 Bilibili 录播的条目可直接外跳播放。</p>
                  </div>
                  <button onClick={() => setIsLibraryOpen(false)} className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted md:size-10">
                    <X className="size-5" />
                  </button>
                </div>

                <div className="shrink-0 flex items-center justify-between gap-3 border-b border-border bg-card/40 px-3 py-2 md:hidden">
                  <div className="text-xs font-black text-muted-foreground">筛选结果：{filteredLibraryItems.length} / {libraryContent.items.length}</div>
                  <button onClick={() => setIsLibraryOverviewCollapsed((collapsed) => !collapsed)} className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-black text-foreground">
                    {isLibraryOverviewCollapsed ? "展开概览" : "收起概览"}
                  </button>
                </div>

                <motion.div
                  animate={isLibraryOverviewCollapsed ? "collapsed" : "expanded"}
                  variants={{
                    expanded: {
                      maxHeight: isLibraryCompact ? 270 : 420,
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      paddingTop: isLibraryCompact ? 10 : 16,
                      paddingBottom: isLibraryCompact ? 10 : 16
                    },
                    collapsed: {
                      maxHeight: 0,
                      opacity: 0,
                      y: -6,
                      scale: 0.99,
                      paddingTop: 0,
                      paddingBottom: 0
                    }
                  }}
                  transition={{
                    duration: isLibraryOverviewCollapsed ? 0.18 : 0.24,
                    ease: isLibraryOverviewCollapsed ? [0.4, 0, 0.2, 1] : [0.16, 1, 0.3, 1]
                  }}
                  className={cn("shrink-0 overflow-hidden border-b border-border px-3 will-change-[max-height,opacity,transform] md:px-5", isLibraryOverviewCollapsed && "pointer-events-none border-transparent")}
                >
                  <motion.div
                    variants={{
                      expanded: { opacity: 1, y: 0, transition: { delay: 0.06, duration: 0.24 } },
                      collapsed: { opacity: 0, y: -6, transition: { duration: 0.12 } }
                    }}
                    className="max-h-[250px] overflow-y-auto pr-1 md:max-h-[360px] lg:max-h-none lg:overflow-visible lg:pr-0"
                  >
                    <div className="mb-3 flex items-center justify-between gap-3 md:mb-4">
                      <div>
                        <h4 className="text-sm font-black text-foreground">片源库概览</h4>
                        <p className="hidden text-xs font-bold text-muted-foreground sm:block">点击统计卡或分布条可以直接筛选片源。</p>
                      </div>
                      <button onClick={resetLibraryFilters} className="w-fit rounded-full border border-border bg-card px-3 py-1.5 text-xs font-black text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">清空筛选</button>
                    </div>

                    <div className="grid gap-3 lg:grid-cols-[1.05fr_0.9fr_0.9fr]">
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      {[
                        { label: "全部片源", value: libraryInsights.total, desc: "完整候选库", onClick: () => applyLibraryFilter({ reset: true }), active: activeLibraryFilters.length === 0 },
                        { label: "可排播", value: libraryInsights.available, desc: "可直接加入排期", onClick: () => applyLibraryFilter({ status: "available" }), active: libraryStatusFilter === "available" },
                        { label: "已看", value: libraryInsights.watched, desc: "历史沉淀", onClick: () => applyLibraryFilter({ status: "watched" }), active: libraryStatusFilter === "watched" },
                        { label: "高优先级", value: libraryInsights.highPriority, desc: "优先安排", onClick: () => applyLibraryFilter({ priority: "high" }), active: libraryPriorityFilter === "high" }
                      ].map((item) => (
                        <button key={item.label} onClick={item.onClick} className={cn("rounded-2xl border p-3 text-left shadow-sm transition-all hover:-translate-y-0.5 sm:rounded-3xl sm:p-4", item.active ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-foreground hover:bg-muted")}>
                          <div className="text-xl font-black sm:text-3xl">{item.value}</div>
                          <div className="mt-0.5 text-xs font-black sm:mt-1 sm:text-sm">{item.label}</div>
                          <div className="mt-1 hidden text-[11px] font-bold text-muted-foreground sm:block">{item.desc}</div>
                        </button>
                      ))}
                    </div>

                    <div className="rounded-3xl border border-border bg-card p-3 shadow-sm sm:p-4">
                      <div className="mb-3 text-sm font-black text-foreground">分类分布</div>
                      <div className="space-y-3">
                        {[
                          { key: "classic", label: "经典好片", value: libraryInsights.classic, color: "bg-emerald-500" },
                          { key: "bad", label: "绝世烂片", value: libraryInsights.bad, color: "bg-rose-500" },
                          { key: "anime", label: "动画", value: libraryInsights.anime, color: "bg-sky-500" },
                          { key: "topic", label: "主题片", value: libraryInsights.topic, color: "bg-purple-500" }
                        ].map((item) => {
                          const percent = libraryInsights.total > 0 ? Math.max(6, Math.round((item.value / libraryInsights.total) * 100)) : 0;
                          return (
                            <button key={item.key} onClick={() => applyLibraryFilter({ category: item.key })} className="grid w-full grid-cols-[70px_1fr_28px] items-center gap-2 text-left text-xs font-black text-muted-foreground transition-colors hover:text-foreground">
                              <span>{item.label}</span>
                              <span className="h-2 overflow-hidden rounded-full bg-muted"><span className={cn("block h-full rounded-full", item.color)} style={{ width: `${percent}%` }} /></span>
                              <span className="text-right">{item.value}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="rounded-3xl border border-border bg-card p-3 shadow-sm sm:p-4">
                      <div className="mb-3 text-sm font-black text-foreground">状态与运营入口</div>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: "已计划", value: libraryInsights.planned, onClick: () => applyLibraryFilter({ status: "planned" }) },
                          { label: "电影", value: libraryInsights.movie, onClick: () => applyLibraryFilter({ type: "movie" }) },
                          { label: "缺海报", value: libraryInsights.missingPoster, onClick: () => applyLibraryFilter({ special: "missingPoster" }) },
                          { label: "缺片源", value: libraryInsights.missingSource, onClick: () => applyLibraryFilter({ special: "missingSource" }) },
                          { label: "最近入库", value: libraryInsights.recentlyAdded, onClick: () => applyLibraryFilter({ special: "recentlyAdded" }) },
                          { label: "我看过", value: libraryInsights.myWatched, onClick: () => applyLibraryFilter({ special: "myWatched" }) },
                          { label: "随机可排播", value: libraryInsights.available, onClick: randomLibraryItem }
                        ].map((item) => (
                          <button key={item.label} onClick={item.onClick} className="rounded-2xl border border-border bg-background p-2.5 text-left transition-colors hover:border-primary/40 hover:bg-primary/5 sm:p-3">
                            <div className="text-xl font-black text-foreground">{item.value}</div>
                            <div className="text-[11px] font-bold text-muted-foreground">{item.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                    </div>
                  </motion.div>
                </motion.div>

                <div className="shrink-0 grid grid-cols-2 gap-2 border-b border-border p-3 md:grid-cols-[1fr_150px_150px_140px_150px] md:gap-3 md:p-5">
                  <label className="col-span-2 flex h-10 items-center gap-2 rounded-2xl border border-border bg-card px-3 text-sm font-medium text-muted-foreground md:col-span-1 md:h-11">
                    <Search className="size-4" />
                    <input value={libraryQuery} onChange={(event) => setLibraryQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent outline-none" placeholder="搜索片名 / 标签" />
                  </label>
                  <select value={libraryCategoryFilter} onChange={(event) => setLibraryCategoryFilter(event.target.value)} className="h-10 min-w-0 rounded-2xl border border-border bg-card px-3 text-xs font-bold outline-none md:h-11 md:text-sm">
                    <option value="all">全部分类</option>
                    <option value="good">经典好片</option>
                    <option value="bad">绝世烂片</option>
                    <option value="classic">往期经典</option>
                    <option value="anime">动画</option>
                    <option value="topic">主题片</option>
                    <option value="other">其他</option>
                  </select>
                  <select value={libraryStatusFilter} onChange={(event) => setLibraryStatusFilter(event.target.value)} className="h-10 min-w-0 rounded-2xl border border-border bg-card px-3 text-xs font-bold outline-none md:h-11 md:text-sm">
                    <option value="all">全部状态</option>
                    <option value="available">可排播</option>
                    <option value="planned">已计划</option>
                    <option value="watched">已看</option>
                    <option value="hidden">隐藏</option>
                    <option value="rejected">拒绝</option>
                  </select>
                  <select value={libraryTypeFilter} onChange={(event) => setLibraryTypeFilter(event.target.value)} className="h-10 min-w-0 rounded-2xl border border-border bg-card px-3 text-xs font-bold outline-none md:h-11 md:text-sm">
                    <option value="all">全部类型</option>
                    <option value="movie">电影</option>
                    <option value="anime">动画</option>
                    <option value="ova">OVA</option>
                    <option value="series">剧集</option>
                    <option value="short">短片</option>
                    <option value="other">其他</option>
                  </select>
                  <select value={libraryPriorityFilter} onChange={(event) => setLibraryPriorityFilter(event.target.value)} className="h-10 min-w-0 rounded-2xl border border-border bg-card px-3 text-xs font-bold outline-none md:h-11 md:text-sm">
                    <option value="all">全部优先级</option>
                    <option value="high">高优先级</option>
                    <option value="normal">普通优先级</option>
                    <option value="low">低优先级</option>
                  </select>
                </div>

                <div className="shrink-0 space-y-3 border-b border-border bg-background px-3 py-3 md:px-5">
                  <div className="flex flex-wrap items-center gap-2">
                    {categoryQuickFilters.map((item) => (
                      <button
                        key={item.key}
                        onClick={() => item.key === "all" ? applyLibraryFilter({ reset: true }) : applyLibraryFilter({ category: item.key })}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-black transition-colors",
                          libraryCategoryFilter === item.key || (item.key === "all" && activeLibraryFilters.length === 0)
                            ? categoryBadgeClass(item.key)
                            : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <span>{item.label}</span>
                        <span className="rounded-full bg-background/70 px-1.5 py-0.5 text-[10px]">{item.count}</span>
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs font-bold text-muted-foreground">选择片源库视图</div>
                    <div className="flex flex-wrap items-center gap-2">
                      {libraryViewMode === "masonry" && (
                        <button
                          type="button"
                          onClick={() => setMasonryPostersOnly((value) => !value)}
                          className={cn(
                            "rounded-2xl border px-3 py-2 text-xs font-black transition-colors",
                            masonryPostersOnly ? "border-primary/20 bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                        >
                          {masonryPostersOnly ? "显示下方信息" : "只显示海报"}
                        </button>
                      )}
                      <div className="flex rounded-2xl border border-border bg-card p-1">
                        {libraryViewOptions.map((item) => (
                          <button
                            key={item.key}
                            onClick={() => setLibraryViewMode(item.key)}
                            title={item.desc}
                            className={cn(
                              "rounded-xl px-3 py-1.5 text-xs font-black transition-colors",
                              libraryViewMode === item.key ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div onScroll={handleLibraryScroll} className="min-h-0 flex-1 overflow-y-auto p-3 md:p-5">
                  <div className="mb-3 hidden flex-col gap-3 md:mb-4 md:flex md:flex-row md:items-center md:justify-between">
                    <div className="text-sm font-bold text-muted-foreground">筛选结果：{filteredLibraryItems.length} / {libraryContent.items.length}</div>
                    {activeLibraryFilters.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2">
                        {activeLibraryFilters.map((filter) => <span key={filter} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">{filter}</span>)}
                        <button onClick={resetLibraryFilters} className="rounded-full border border-border px-3 py-1 text-xs font-black text-muted-foreground hover:bg-muted">清空</button>
                      </div>
                    )}
                  </div>
                  {libraryViewMode === "cards" && (
                  <div className="grid grid-cols-1 gap-3 md:gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {filteredLibraryItems.map((item) => (
                      <article key={item.id} role="button" tabIndex={0} onClick={() => setSelectedLibraryItem(item)} onKeyDown={(event) => event.key === "Enter" && setSelectedLibraryItem(item)} className="cursor-pointer overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md md:rounded-3xl">
                        <div className="flex gap-3 p-3 md:gap-4 md:p-4">
                          <div className="h-28 w-20 shrink-0 overflow-hidden rounded-xl bg-muted md:h-32 md:w-24 md:rounded-2xl">
                            {item.posterUrl ? <img src={item.posterUrl} alt={item.title} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center px-2 text-center text-[10px] font-black text-muted-foreground">缺海报</div>}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap gap-1.5">
                              <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-black", statusBadgeClass(item.status))}>{statusLabels[item.status] || item.status}</span>
                              <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-black", categoryBadgeClass(item.category))}>{categoryLabels[item.category] || item.category}</span>
                              <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-black", priorityBadgeClass(item.priority))}>{priorityLabels[item.priority] || item.priority}</span>
                              {myWatchedSourceIds.has(item.id) ? <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-black text-emerald-600">我看过</span> : null}
                            </div>
                            <h4 className="mt-1.5 truncate text-base font-black text-foreground md:mt-2 md:text-lg">{item.title}</h4>
                            {item.originalTitle ? <p className="truncate text-xs font-bold text-muted-foreground">{item.originalTitle}</p> : null}
                            <div className="mt-1.5 flex flex-wrap gap-2 text-[11px] font-black text-muted-foreground md:mt-2">
                              <span>{typeLabels[item.type] || item.type}</span>
                              {item.year ? <span>{item.year}</span> : null}
                              {item.duration ? <span>{item.duration}</span> : null}
                              {item.rating ? <span className="text-amber-600">{item.rating} 分</span> : <span>未评分</span>}
                            </div>
                            <div className="mt-1 text-[11px] font-black text-blue-600">{sourceTimingLabel(item)}</div>
                            <p className="mt-1.5 line-clamp-2 text-xs font-medium leading-relaxed text-muted-foreground md:mt-2 md:line-clamp-3">{item.description}</p>
                            <div className="mt-2 hidden flex-wrap gap-1.5 sm:flex md:mt-3">
                              {item.tags.slice(0, 4).map((tag) => <span key={tag} className={cn("rounded-full border px-2 py-0.5 text-[10px] font-bold", categoryBadgeClass(item.category))}>{tag}</span>)}
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-border/70 pt-2 text-[11px] font-bold text-muted-foreground md:mt-3 md:pt-3">
                              <span>播放 {formatDateLabel(sourcePlaybackDate(item))}</span>
                              <span className={item.sourceUrl ? "text-emerald-600" : "text-rose-500"}>{item.sourceUrl ? getSourceLabel(item.sourceUrl) : "缺录播链接"}</span>
                            </div>
                            {item.sourceUrl ? (
                              <a href={item.sourceUrl} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()} className="mt-2 inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-black text-emerald-600 transition-colors hover:bg-emerald-500/15 md:mt-3">
                                跳转{getSourceLabel(item.sourceUrl)}
                              </a>
                            ) : null}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                  )}

                  {libraryViewMode === "masonry" && (
                    <div className="columns-2 gap-3 md:columns-3 md:gap-4 xl:columns-4">
                      {filteredLibraryItems.map((item) => (
                        <article
                          key={item.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => setSelectedLibraryItem(item)}
                          onKeyDown={(event) => event.key === "Enter" && setSelectedLibraryItem(item)}
                          className="mb-3 inline-block w-full break-inside-avoid cursor-pointer overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md md:mb-4 md:rounded-3xl"
                        >
                          <div className="relative min-h-52 overflow-hidden bg-muted">
                            {item.posterUrl ? (
                              <img src={item.posterUrl} alt={item.title} className="h-auto w-full transition-transform duration-500 hover:scale-105" loading="lazy" />
                            ) : (
                              <div className="flex h-52 w-full items-center justify-center px-4 text-center text-sm font-black text-muted-foreground">缺海报</div>
                            )}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent p-3 text-white">
                              <div className="flex flex-wrap gap-1.5">
                                <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-black backdrop-blur", categoryBadgeClass(item.category))}>{categoryLabels[item.category] || item.category}</span>
                                <span className="rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-black backdrop-blur">{item.rating ? `${item.rating} 分` : "未评分"}</span>
                              </div>
                              <h4 className="mt-2 line-clamp-2 text-sm font-black leading-tight md:text-base">{item.title}</h4>
                            </div>
                          </div>
                          {!masonryPostersOnly && (
                            <div className="space-y-2 p-3">
                              <div className="flex flex-wrap gap-1.5">
                                <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-black", statusBadgeClass(item.status))}>{statusLabels[item.status] || item.status}</span>
                                <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-black", priorityBadgeClass(item.priority))}>{priorityLabels[item.priority]}</span>
                              </div>
                              <div className="text-[11px] font-black text-blue-600">{formatDateLabel(sourcePlaybackDate(item))}</div>
                              <div className="flex flex-wrap gap-1.5">
                                {item.tags.slice(0, 3).map((tag) => <span key={tag} className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-bold text-muted-foreground">{tag}</span>)}
                              </div>
                            </div>
                          )}
                        </article>
                      ))}
                    </div>
                  )}

                  {libraryViewMode === "timeline" && (
                    <div className="relative space-y-3 pl-4 md:pl-8">
                      <div className="absolute bottom-3 left-1.5 top-3 w-px bg-border md:left-3" />
                      {libraryTimelineItems.map((item) => (
                        <article key={item.id} className="relative grid gap-2 md:grid-cols-[128px_1fr] md:gap-4">
                          <div className="relative z-10 flex items-center md:justify-end">
                            <span className="absolute -left-[21px] size-3 rounded-full border-2 border-background bg-primary md:-left-[29px]" />
                            <time className="inline-flex rounded-full border border-border bg-card px-3 py-1.5 text-xs font-black text-foreground shadow-sm">
                              {formatDateLabel(sourcePlaybackDate(item))}
                            </time>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedLibraryItem(item)}
                            className="group flex min-w-0 flex-col gap-2 rounded-2xl border border-border bg-card p-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-muted/40 md:rounded-3xl md:p-4"
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="truncate rounded-full bg-foreground px-3 py-1.5 text-sm font-black text-background md:text-base">{item.title}</span>
                              {item.originalTitle ? <span className="truncate text-xs font-bold text-muted-foreground">{item.originalTitle}</span> : null}
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-black", statusBadgeClass(item.status))}>{statusLabels[item.status] || item.status}</span>
                              <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-black", categoryBadgeClass(item.category))}>{categoryLabels[item.category] || item.category}</span>
                              <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-black text-muted-foreground">{typeLabels[item.type] || item.type}</span>
                              {item.sourceUrl ? <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-black text-emerald-600">有录播</span> : <span className="rounded-full border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 text-[10px] font-black text-rose-600">缺录播</span>}
                              {myWatchedSourceIds.has(item.id) ? <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-black text-emerald-600">我看过</span> : null}
                            </div>
                            <p className="line-clamp-2 text-xs font-medium leading-relaxed text-muted-foreground">{item.description}</p>
                          </button>
                        </article>
                      ))}
                    </div>
                  )}
                </div>

                <AnimatePresence>
                  {selectedLibraryItem && (
                    <>
                    <motion.button
                      type="button"
                      aria-label="关闭片源详情"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setSelectedLibraryItem(null)}
                      className="absolute inset-0 z-10 cursor-default bg-black/5"
                    />
                    <motion.aside
                      initial={{ x: 360, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 360, opacity: 0 }}
                      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute inset-y-0 right-0 z-20 flex w-full max-w-md flex-col border-l border-border bg-background shadow-2xl"
                    >
                      <div className="flex items-center justify-between border-b border-border p-5">
                        <div>
                          <span className="text-xs font-black tracking-widest text-primary">SOURCE DETAIL</span>
                          <h4 className="mt-1 text-xl font-black text-foreground">片源详情</h4>
                        </div>
                        <button onClick={() => setSelectedLibraryItem(null)} className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted">
                          <X className="size-5" />
                        </button>
                      </div>

                      <div className="overflow-y-auto p-5">
                        <div className="grid grid-cols-[120px_1fr] gap-4">
                          <div className="aspect-[2/3] overflow-hidden rounded-2xl bg-muted">
                            {selectedLibraryItem.posterUrl ? <img src={selectedLibraryItem.posterUrl} alt={selectedLibraryItem.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs font-black text-muted-foreground">缺海报</div>}
                          </div>
                          <div className="min-w-0">
                            <h5 className="text-2xl font-black leading-tight text-foreground">{selectedLibraryItem.title}</h5>
                            {selectedLibraryItem.originalTitle ? <p className="mt-1 text-xs font-bold text-muted-foreground">{selectedLibraryItem.originalTitle}</p> : null}
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-black", statusBadgeClass(selectedLibraryItem.status))}>{statusLabels[selectedLibraryItem.status] || selectedLibraryItem.status}</span>
                              <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-black", categoryBadgeClass(selectedLibraryItem.category))}>{categoryLabels[selectedLibraryItem.category] || selectedLibraryItem.category}</span>
                              <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-black text-blue-600">{typeLabels[selectedLibraryItem.type] || selectedLibraryItem.type}</span>
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-bold text-muted-foreground">
                              <span>{selectedLibraryItem.year || "年份待补"}</span>
                              <span>{selectedLibraryItem.duration || "时长待补"}</span>
                              <span>{selectedLibraryItem.rating ? `${selectedLibraryItem.rating} 分` : "未评分"}</span>
                              <span>{priorityLabels[selectedLibraryItem.priority]}</span>
                            </div>
                            <div className="mt-3 rounded-xl bg-blue-500/10 px-3 py-2 text-xs font-black text-blue-600">{sourceTimingLabel(selectedLibraryItem)}</div>
                          </div>
                        </div>

                        <div className="mt-5 rounded-2xl border border-border bg-card p-4">
                          <div className="text-xs font-black text-muted-foreground">简介</div>
                          <p className="mt-2 text-sm font-medium leading-relaxed text-foreground/80">{selectedLibraryItem.description}</p>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {selectedLibraryItem.tags.map((tag) => <span key={tag} className={cn("rounded-full border px-3 py-1 text-xs font-bold", categoryBadgeClass(selectedLibraryItem.category))}>{tag}</span>)}
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3">
                          <div className="rounded-2xl border border-border bg-card p-4">
                            <div className="truncate text-sm font-black text-foreground">{selectedLibraryItem.year || "待补"}</div>
                            <div className="text-xs font-bold text-muted-foreground">上映时间</div>
                          </div>
                          <div className="rounded-2xl border border-border bg-card p-4">
                            <div className="truncate text-sm font-black text-foreground">{formatDateLabel(sourcePlaybackDate(selectedLibraryItem))}</div>
                            <div className="text-xs font-bold text-muted-foreground">播放时间</div>
                          </div>
                        </div>

                        <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/10 p-4">
                          <div className="text-xs font-black text-primary">泛式评价</div>
                          <p className="mt-2 text-sm font-bold leading-relaxed text-foreground/80">{defaultFanshiReview(selectedLibraryItem)}</p>
                        </div>

                        {(approvedSubmissionsBySource.get(selectedLibraryItem.id) || []).length > 0 && (
                          <div className="mt-5 rounded-2xl border border-border bg-card p-4">
                            <div className="text-xs font-black text-muted-foreground">已采纳补充</div>
                            <div className="mt-3 space-y-2">
                              {(approvedSubmissionsBySource.get(selectedLibraryItem.id) || []).map((submission) => (
                                <div key={submission.id} className="rounded-xl bg-background px-3 py-2 text-xs font-bold text-foreground/80">
                                  {submission.content}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mt-5 space-y-2">
                          {selectedLibraryItem.sourceNote ? (
                            <div className="rounded-2xl border border-border bg-card px-4 py-3">
                              <div className="text-xs font-black text-muted-foreground">播放备注</div>
                              <div className="mt-1 text-sm font-bold text-foreground/80">{selectedLibraryItem.sourceNote}</div>
                            </div>
                          ) : null}
                          {selectedLibraryItem.sourceUrl ? (
                            <a href={selectedLibraryItem.sourceUrl} target="_blank" rel="noreferrer" className="block rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-black text-emerald-600 transition-colors hover:bg-emerald-500/15">
                              跳转{getSourceLabel(selectedLibraryItem.sourceUrl)}{isBilibiliSource(selectedLibraryItem.sourceUrl) ? "（B 站外链）" : ""}
                            </a>
                          ) : (
                            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm font-black text-rose-600">缺少 Bilibili 录播/播放链接</div>
                          )}
                          <button onClick={() => navigator.clipboard?.writeText(selectedLibraryItem.title)} className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm font-black text-foreground transition-colors hover:bg-muted">复制片名</button>
                          <button onClick={() => markSourceWatched(selectedLibraryItem)} className={cn("w-full rounded-2xl border px-4 py-3 text-sm font-black transition-colors", myWatchedSourceIds.has(selectedLibraryItem.id) ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/15" : "border-blue-500/20 bg-blue-500/10 text-blue-600 hover:bg-blue-500/15")}>
                            {myWatchedSourceIds.has(selectedLibraryItem.id) ? "已记录我看过" : "记录我看过"}
                          </button>
                          {watchedStatus ? <div className="text-xs font-bold text-muted-foreground">{watchedStatus}</div> : null}
                        </div>

                        <div className="mt-5 rounded-2xl border border-border bg-card p-4">
                          <div className="text-xs font-black text-muted-foreground">补充信息给站主</div>
                          <p className="mt-1 text-xs font-bold text-muted-foreground">可提交播放链接、备注、泛式评价补充或资料纠错。提交后进入后台审核，审核通过后才会公开。</p>
                          <select value={sourceSubmissionField} onChange={(event) => setSourceSubmissionField(event.target.value as ScreeningSourceSubmission["field"])} className="mt-3 h-10 w-full rounded-xl border border-border bg-background px-3 text-xs font-bold outline-none">
                            <option value="other">其他补充</option>
                            <option value="sourceUrl">播放链接</option>
                            <option value="sourceNote">播放备注</option>
                            <option value="description">简介纠错</option>
                            <option value="fanshiReview">泛式评价</option>
                          </select>
                          <textarea value={sourceSubmissionContent} onChange={(event) => setSourceSubmissionContent(event.target.value)} className="mt-3 min-h-24 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium outline-none focus:border-primary/50" placeholder="写下要补充的信息..." />
                          <input value={sourceSubmissionContact} onChange={(event) => setSourceSubmissionContact(event.target.value)} className="mt-2 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm font-medium outline-none focus:border-primary/50" placeholder="联系方式，可选" />
                          <button onClick={submitSourceSupplement} className="mt-3 w-full rounded-xl bg-foreground px-4 py-2.5 text-sm font-black text-background transition-colors hover:bg-foreground/90">提交给站主审核</button>
                          {sourceSubmissionStatus ? <div className="mt-2 text-xs font-bold text-muted-foreground">{sourceSubmissionStatus}</div> : null}
                        </div>
                      </div>
                    </motion.aside>
                    </>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tier List Section */}
        <div className="w-full max-w-7xl mx-auto mb-32 group/tierlist relative z-20">
          <div className="mb-12 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground flex items-center gap-2">
                放映会电影从夯到拉
              </h2>
            </div>
            <div className="flex bg-muted p-1 rounded-full border border-border">
              <button
                onClick={() => setShowTierList(true)}
                className={cn("px-4 py-1.5 rounded-full text-sm font-medium transition-all", showTierList ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
              >
                显示
              </button>
              <button
                onClick={() => setShowTierList(false)}
                className={cn("px-4 py-1.5 rounded-full text-sm font-medium transition-all", !showTierList ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
              >
                隐藏
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showTierList && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-col gap-3 p-2 sm:p-4 overflow-hidden"
              >
                {tierListData.map((row, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="flex flex-col sm:flex-row bg-background border border-border/80 rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className={cn("w-full sm:w-32 lg:w-40 shrink-0 flex flex-col justify-center items-center py-6 sm:py-8 px-2 shadow-[inset_-4px_0_12px_rgba(0,0,0,0.05)]", row.color)}>
                      <span className="text-3xl lg:text-4xl font-black tracking-tighter sm:[writing-mode:vertical-rl] text-center">{row.tier}</span>
                    </div>
                    <div className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-wrap gap-4 items-center content-start min-h-[140px] bg-muted/10">
                      {row.posters.map((url, j) => (
                        <motion.div
                          key={j}
                          whileHover={{ scale: 1.05, y: -4 }}
                          className="w-20 sm:w-24 lg:w-32 aspect-[2/3] rounded-lg overflow-hidden shadow-sm hover:shadow-xl border border-border/30 transition-all cursor-pointer relative group/poster"
                        >
                          <img src={url} alt="poster" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/0 group-hover/poster:bg-black/10 transition-colors pointer-events-none" />
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Classic Memory (Vertical Timeline) */}
        <div className="mt-32 mb-16">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">往期经典放映</h2>
            <div className="flex bg-muted p-1 rounded-full border border-border">
              <button
                onClick={() => setShowHistory(true)}
                className={cn("px-4 py-1.5 rounded-full text-sm font-medium transition-all", showHistory ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
              >
                显示
              </button>
              <button
                onClick={() => setShowHistory(false)}
                className={cn("px-4 py-1.5 rounded-full text-sm font-medium transition-all", !showHistory ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
              >
                隐藏
              </button>
            </div>
          </div>
          <p className="text-lg text-muted-foreground">那些年，我们一起看过的经典作品与难忘回忆。</p>
        </div>

        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full relative py-16 mb-32 overflow-hidden"
            >
              {/* Vertical Center Line */}
          <div className="absolute left-[20px] md:left-1/2 top-0 bottom-0 w-px bg-border md:-translate-x-1/2 z-0" />

          <div className="space-y-32 md:space-y-48">
             {historyScreenings.map((item, idx) => {
                const isEven = idx % 2 === 0;
                return (
                  <div key={item.id} className="relative flex flex-col md:flex-row items-center w-full group">
                    {/* Mobile Dot */}
                    <div className="absolute left-[20px] -translate-x-1/2 flex items-center justify-center top-0 md:hidden z-10 w-4 h-4 rounded-full bg-background border-2 border-primary" />

                    {/* Title Area */}
                    <div className={cn(
                      "w-full md:w-1/2 flex items-center hidden md:flex",
                      isEven ? "justify-end pr-12 text-right" : "justify-start pl-12 text-left order-last"
                    )}>
                      <h3 className="text-xl md:text-2xl font-medium tracking-wide text-foreground/80 md:group-hover:text-foreground transition-colors max-w-[300px]">
                        {item.title}
                      </h3>
                    </div>

                    {/* Content Area */}
                    <div className={cn(
                      "w-full md:w-1/2 flex flex-col relative pt-2 md:pt-0",
                      isEven ? "md:pl-12" : "md:pr-12"
                    )}>
                       {/* Mobile Title - visible only on mobile */}
                       <h3 className="text-xl font-medium text-foreground/80 mb-4 md:hidden ml-10">
                         {item.title}
                       </h3>

                       {/* Wrap Image + Content inside a fixed-width box for consistent inner alignment */}
                       <div className={cn(
                         "w-full max-w-[360px] md:max-w-[400px] relative ml-10 md:ml-0",
                         isEven ? "md:mr-auto" : "md:ml-auto" // Even -> right column, box hugs left (mr-auto). Odd -> left column, box hugs right (ml-auto).
                       )}>
                         {/* Image */}
                         <div className="relative aspect-[4/3] w-full rounded shadow-xl overflow-hidden bg-muted z-0">
                           <img src={item.image} alt={item.title} className="object-cover w-full h-full opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
                         </div>

                         {/* Year */}
                         <div className="absolute -bottom-4 md:-bottom-8 -left-4 md:-left-8 z-10 text-[64px] md:text-[96px] leading-none font-bold tracking-tighter text-foreground drop-shadow-[0_4px_8px_rgba(0,0,0,0.2)] dark:drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] select-none">
                           {item.year}
                         </div>

                         {/* Description */}
                         <p className="mt-12 md:mt-16 text-sm text-foreground/70 leading-loose text-left">
                           {item.description}
                         </p>
                       </div>
                    </div>
                  </div>
                )
             })}
          </div>
        </motion.div>
        )}
        </AnimatePresence>
      </div>



      {/* Nominate Modal */}
      <AnimatePresence>
        {isNominateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-background rounded-2xl p-6 shadow-xl w-full max-w-sm border"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">提名新电影</h3>
                <button onClick={() => setIsNominateModalOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-muted">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                想要提名新的影片加入待定池？或者发现图库资料有缺漏？<br className="my-1"/>
                请发送邮件给站主邮箱进行投稿补缺。
              </p>

              <div className="bg-muted/50 p-3 rounded-lg flex items-center justify-center gap-2 mb-6">
                 <Mail className="w-4 h-4 text-blue-500" />
                 <span className="font-mono text-sm font-semibold selection:bg-blue-200">22552255@qq.com</span>
              </div>

              <button onClick={() => setIsNominateModalOpen(false)} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 rounded-xl transition-colors">
                我知道了
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
