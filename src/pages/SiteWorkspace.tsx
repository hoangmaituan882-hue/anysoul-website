import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  Clapperboard,
  Clock,
  Database,
  ExternalLink,
  Film,
  Gamepad2,
  Image,
  Loader2,
  Megaphone,
  MessageCircle,
  Newspaper,
  Search,
  ShieldCheck,
  Sparkles,
  Tag,
  UserRound,
  Video,
  X
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { fetchMyWatchedSources, fetchPublicPost, fetchPublicPosts } from "../content/client";
import { defaultGamingMain } from "../content/defaults/gaming";
import { defaultPlazaContent } from "../content/defaults/plaza";
import { defaultScreeningLibrary } from "../content/defaults/screeningLibrary";
import { defaultScreeningsNext, defaultScreeningsSchedule } from "../content/defaults/screenings";
import { defaultSiteAnnouncements } from "../content/defaults/siteAnnouncements";
import { defaultTalksContent } from "../content/defaults/talks";
import { useContent } from "../content/useContent";
import type {
  GamingLibraryItem,
  GamingMainContent,
  PlazaContent,
  PlazaSoulItem,
  PublicPostDetail,
  PublicPostSummary,
  ScreeningLibraryContent,
  ScreeningNextContent,
  ScreeningScheduleContent,
  ScreeningWeek,
  SiteAnnouncementItem,
  SiteAnnouncementsContent,
  SiteWorkspaceEvent,
  TalkItem,
  TalksContent
} from "../content/types";
import { useAuth } from "../contexts/AuthContext";
import { cn } from "../lib/utils";

type WorkspaceEventType = SiteWorkspaceEvent["type"];
type FeedGroup = "live" | "upcoming" | "recent" | "older";
type TypeFilter = "all" | WorkspaceEventType;
type TimeFilter = "week" | "30d" | "all";

type SiteFeedEvent = SiteWorkspaceEvent & {
  sortAt?: string;
  group: FeedGroup;
  statusLabel: string;
  relativeTime: string;
  detailTitle: string;
  detailBody: string;
  coverImage?: string;
  source?:
    | { kind: "announcement"; item: SiteAnnouncementItem }
    | { kind: "talk"; item: TalkItem }
    | { kind: "screeningNext"; item: ScreeningNextContent }
    | { kind: "screeningWeek"; item: ScreeningWeek }
    | { kind: "game"; item: GamingLibraryItem }
    | { kind: "plaza"; item: PlazaSoulItem }
    | { kind: "post"; item: PublicPostSummary };
};

const typeMeta: Record<WorkspaceEventType, { label: string; icon: typeof Bell; href: string; tone: string }> = {
  announcement: { label: "公告", icon: Megaphone, href: "#site-workspace", tone: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300" },
  talk: { label: "杂谈", icon: Video, href: "#talks", tone: "border-pink-500/20 bg-pink-500/10 text-pink-700 dark:text-pink-300" },
  screening: { label: "放映", icon: Film, href: "#screenings", tone: "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300" },
  game: { label: "游戏", icon: Gamepad2, href: "#games", tone: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" },
  plaza: { label: "图库", icon: Image, href: "#plaza", tone: "border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300" },
  post: { label: "文章", icon: Newspaper, href: "#posts", tone: "border-orange-500/20 bg-orange-500/10 text-orange-700 dark:text-orange-300" }
};

const typeFilters: Array<{ value: TypeFilter; label: string }> = [
  { value: "all", label: "全部" },
  { value: "talk", label: "杂谈" },
  { value: "screening", label: "放映" },
  { value: "game", label: "游戏" },
  { value: "plaza", label: "图库" },
  { value: "post", label: "文章" },
  { value: "announcement", label: "公告" }
];

const timeFilters: Array<{ value: TimeFilter; label: string }> = [
  { value: "week", label: "本周" },
  { value: "30d", label: "近 30 天" },
  { value: "all", label: "全部" }
];

const groupLabels: Record<FeedGroup, string> = {
  live: "进行中",
  upcoming: "即将开始",
  recent: "最近更新",
  older: "更早记录"
};

const weekDayLabels = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

function normalizeDate(value?: string) {
  if (!value) return undefined;
  const dateKey = value.match(/\d{4}-\d{2}-\d{2}/)?.[0];
  if (dateKey) return dateKey;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString().slice(0, 10);
}

function parseDateKey(dateKey?: string) {
  if (!dateKey) return null;
  const [year, month, day] = String(dateKey || "").split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function timestamp(value?: string) {
  if (!value) return undefined;
  const parsed = new Date(value).getTime();
  if (Number.isFinite(parsed)) return parsed;
  const date = parseDateKey(normalizeDate(value));
  return date ? date.getTime() : undefined;
}

function formatDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function startOfMondayWeek(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + diff);
  return next;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(date.getDate() + days);
  return next;
}

function weekLabel(startKey: string) {
  const start = parseDateKey(startKey) || new Date();
  const end = addDays(start, 6);
  return `${start.getMonth() + 1}/${start.getDate()}-${end.getMonth() + 1}/${end.getDate()}`;
}

function isAnnouncementActive(item: SiteAnnouncementItem, now = new Date()) {
  const start = item.startsAt ? new Date(item.startsAt).getTime() : Number.NEGATIVE_INFINITY;
  const end = item.endsAt ? new Date(item.endsAt).getTime() : Number.POSITIVE_INFINITY;
  const current = now.getTime();
  return (Number.isNaN(start) || start <= current) && (Number.isNaN(end) || end >= current);
}

function normalizeTalks(value: TalksContent): TalksContent {
  return {
    ...defaultTalksContent,
    ...(value || {}),
    archive: Array.isArray(value?.archive) ? value.archive : defaultTalksContent.archive,
    upcoming: Array.isArray(value?.upcoming) ? value.upcoming : defaultTalksContent.upcoming
  };
}

function normalizeGaming(value: GamingMainContent): GamingMainContent {
  return {
    ...defaultGamingMain,
    ...(value || {}),
    library: Array.isArray(value?.library) ? value.library : defaultGamingMain.library,
    exploreItems: Array.isArray(value?.exploreItems) ? value.exploreItems : defaultGamingMain.exploreItems
  };
}

function normalizePlaza(value: PlazaContent): PlazaContent {
  return {
    ...defaultPlazaContent,
    ...(value || {}),
    souls: Array.isArray(value?.souls) ? value.souls : defaultPlazaContent.souls
  };
}

function normalizeAnnouncements(value: SiteAnnouncementsContent): SiteAnnouncementsContent {
  return { items: Array.isArray(value?.items) ? value.items : defaultSiteAnnouncements.items };
}

function relativeTime(value: string | undefined, now: Date) {
  const time = timestamp(value);
  if (!time) return "时间待补";
  const diff = time - now.getTime();
  const abs = Math.abs(diff);
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (abs < minute) return diff >= 0 ? "马上" : "刚刚";
  if (abs < hour) return `${Math.max(1, Math.round(abs / minute))} 分钟${diff >= 0 ? "后" : "前"}`;
  if (abs < day) return `${Math.round(abs / hour)} 小时${diff >= 0 ? "后" : "前"}`;
  return `${Math.round(abs / day)} 天${diff >= 0 ? "后" : "前"}`;
}

function eventSearchText(event: SiteFeedEvent) {
  return [
    event.title,
    event.description,
    event.detailTitle,
    event.detailBody,
    event.date,
    event.statusLabel,
    event.relativeTime,
    ...event.tags,
    typeMeta[event.type].label
  ].join(" ").toLowerCase();
}

function groupFromTime(value: string | undefined, now: Date, forcedLive = false): FeedGroup {
  if (forcedLive) return "live";
  const time = timestamp(value);
  if (!time) return "older";
  const diff = time - now.getTime();
  if (diff > 0 && diff <= 7 * 24 * 60 * 60 * 1000) return "upcoming";
  if (Math.abs(diff) <= 7 * 24 * 60 * 60 * 1000) return "recent";
  return "older";
}

function statusLabelForEvent(type: WorkspaceEventType, value: string | undefined, now: Date, explicit?: string, forcedLive = false) {
  if (forcedLive) return "进行中";
  if (explicit) return explicit;
  const time = timestamp(value);
  if (!time) return "待补日期";
  return time > now.getTime() ? "即将开始" : type === "announcement" ? "已发布" : "已更新";
}

function makeFeedEvent(input: Omit<SiteFeedEvent, "group" | "statusLabel" | "relativeTime" | "detailTitle" | "detailBody"> & {
  explicitStatus?: string;
  forcedLive?: boolean;
  detailTitle?: string;
  detailBody?: string;
}, now: Date): SiteFeedEvent {
  const sortAt = input.sortAt || input.date;
  return {
    ...input,
    sortAt,
    group: groupFromTime(sortAt, now, input.forcedLive),
    statusLabel: statusLabelForEvent(input.type, sortAt, now, input.explicitStatus, input.forcedLive),
    relativeTime: relativeTime(sortAt, now),
    detailTitle: input.detailTitle || input.title,
    detailBody: input.detailBody || input.description
  };
}

function firstDefined<T>(...items: Array<T | undefined | null>) {
  return items.find((item): item is T => item !== undefined && item !== null);
}

export function SiteWorkspace() {
  const { user, canEditWorkspace, authFetch } = useAuth();
  const announcements = normalizeAnnouncements(useContent<SiteAnnouncementsContent>("site.announcements", defaultSiteAnnouncements));
  const talks = normalizeTalks(useContent<TalksContent>("talks.main", defaultTalksContent));
  const screeningsNext = useContent<ScreeningNextContent>("screenings.next", defaultScreeningsNext);
  const screeningsSchedule = useContent<ScreeningScheduleContent>("screenings.schedule", defaultScreeningsSchedule);
  const screeningsLibrary = useContent<ScreeningLibraryContent>("screenings.library", defaultScreeningLibrary);
  const gaming = normalizeGaming(useContent<GamingMainContent>("gaming.main", defaultGamingMain));
  const plaza = normalizePlaza(useContent<PlazaContent>("plaza.main", defaultPlazaContent));
  const [posts, setPosts] = useState<PublicPostSummary[]>([]);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("week");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedWeekStart, setSelectedWeekStart] = useState(() => formatDateKey(startOfMondayWeek(new Date())));
  const [now, setNow] = useState(() => new Date());
  const [watchedSources, setWatchedSources] = useState<Array<{ sourceId: string; sourceTitle: string; watchedAt: string }>>([]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchPublicPosts()
      .then((result) => {
        if (!cancelled) setPosts(result.posts || []);
      })
      .catch(() => {
        if (!cancelled) setPosts([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setWatchedSources([]);
      return;
    }

    let cancelled = false;
    fetchMyWatchedSources(authFetch)
      .then((result) => {
        if (!cancelled) setWatchedSources(result.items || []);
      })
      .catch(() => {
        if (!cancelled) setWatchedSources([]);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const activeAnnouncements = useMemo(
    () => announcements.items.filter((item) => isAnnouncementActive(item, now)).sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned))),
    [announcements.items, now]
  );

  const events = useMemo<SiteFeedEvent[]>(() => {
    const next: SiteFeedEvent[] = [];

    for (const item of activeAnnouncements) {
      next.push(makeFeedEvent({
        id: item.id,
        type: "announcement",
        title: item.title,
        description: item.body,
        date: normalizeDate(item.startsAt),
        sortAt: item.startsAt,
        href: item.href || "#site-workspace",
        tags: item.tags || [],
        pinned: item.pinned,
        explicitStatus: item.pinned ? "置顶公告" : item.level === "urgent" ? "重要公告" : "公告",
        detailTitle: item.title,
        detailBody: item.body,
        source: { kind: "announcement", item }
      }, now));
    }

    const liveTalk = talks.archive.find((item) => item.id === talks.liveTalkId) || talks.live || talks.archive[0];
    if (liveTalk) {
      next.push(makeFeedEvent({
        id: `talk-live-${liveTalk.id}`,
        type: "talk",
        title: liveTalk.title,
        description: liveTalk.summary || liveTalk.subtitle || "杂谈回录像已归档。",
        date: normalizeDate(liveTalk.date),
        sortAt: liveTalk.date,
        href: "#talks",
        tags: liveTalk.tags || [],
        coverImage: liveTalk.coverUrl,
        explicitStatus: liveTalk.status === "live" ? "直播中" : liveTalk.status === "scheduled" ? "预告" : "最新杂谈",
        forcedLive: liveTalk.status === "live",
        detailTitle: liveTalk.subtitle || liveTalk.title,
        detailBody: liveTalk.summary || liveTalk.watchAdvice || liveTalk.subtitle || "打开杂谈页查看完整回放、高光和逐字稿。",
        source: { kind: "talk", item: liveTalk }
      }, now));
    }

    for (const talk of talks.archive.slice(0, 12)) {
      next.push(makeFeedEvent({
        id: `talk-${talk.id}`,
        type: "talk",
        title: talk.title,
        description: talk.summary || talk.subtitle || "杂谈回录像。",
        date: normalizeDate(talk.date),
        sortAt: talk.date,
        href: "#talks",
        tags: talk.tags || [],
        coverImage: talk.coverUrl,
        explicitStatus: talk.status === "live" ? "直播中" : talk.status === "scheduled" ? "预告" : "已归档",
        forcedLive: talk.status === "live",
        detailTitle: talk.subtitle || talk.title,
        detailBody: talk.summary || talk.watchAdvice || talk.subtitle || "打开杂谈页查看完整回放、高光和逐字稿。",
        source: { kind: "talk", item: talk }
      }, now));
    }

    if (screeningsNext?.movies?.length) {
      next.push(makeFeedEvent({
        id: "screenings-next",
        type: "screening",
        title: screeningsNext.title || "下次放映会",
        description: screeningsNext.movies.map((movie) => movie.title).join(" / ") || screeningsNext.theme,
        date: normalizeDate(screeningsNext.startsAt),
        sortAt: screeningsNext.startsAt,
        href: "#screenings",
        tags: [screeningsNext.statusText, screeningsNext.theme].filter(Boolean),
        coverImage: screeningsNext.coverUrl || screeningsNext.movies.find((movie) => movie.posterUrl)?.posterUrl,
        explicitStatus: screeningsNext.statusText || "预告",
        forcedLive: screeningsNext.status === "live",
        detailTitle: screeningsNext.theme || screeningsNext.title,
        detailBody: screeningsNext.description || screeningsNext.movies.map((movie) => movie.description || movie.title).join(" / "),
        source: { kind: "screeningNext", item: screeningsNext }
      }, now));
    }

    const nextScreeningDate = normalizeDate(screeningsNext?.startsAt);
    for (const week of screeningsSchedule.weeks.slice(-16)) {
      const weekDate = normalizeDate(week.startsAt || week.date || week.archivedAt);
      if (nextScreeningDate && weekDate === nextScreeningDate && week.title === screeningsNext?.title) continue;
      next.push(makeFeedEvent({
        id: `screening-${week.id}`,
        type: "screening",
        title: week.title,
        description: week.movies?.map((movie) => movie.title).join(" / ") || week.theme || week.notes || "放映会记录。",
        date: weekDate,
        sortAt: week.startsAt || week.date || week.archivedAt,
        href: "#screenings",
        tags: [week.statusText, week.theme || ""].filter(Boolean),
        coverImage: week.movies?.find((movie) => movie.posterUrl)?.posterUrl,
        explicitStatus: week.statusText || (week.status === "ended" ? "已归档" : "排期"),
        forcedLive: week.status === "live",
        detailTitle: week.theme || week.title,
        detailBody: week.notes || week.movies?.map((movie) => movie.description || movie.title).join(" / ") || "打开放映页查看片单、历史和片源库。",
        source: { kind: "screeningWeek", item: week }
      }, now));
    }

    for (const game of (gaming.library || []).slice(0, 16)) {
      const record = [...(game.playRecords || [])].sort((a, b) => String(b.date).localeCompare(String(a.date)))[0];
      next.push(makeFeedEvent({
        id: `game-${game.id}`,
        type: "game",
        title: game.title,
        description: record?.note || game.description || "游戏回记录。",
        date: normalizeDate(record?.date || game.lastPlayedAt),
        sortAt: record?.date || game.lastPlayedAt,
        href: "#game-library",
        tags: [game.status, game.platform, game.genre, ...game.tags].filter(Boolean),
        coverImage: game.heroImage || game.coverUrl,
        explicitStatus: game.status === "playing" ? "正在记录" : game.status === "planned" ? "待玩" : game.status === "finished" ? "已通关" : "已更新",
        detailTitle: game.subtitle || game.title,
        detailBody: game.review || game.description || record?.note || "打开游戏库查看游玩记录和相关链接。",
        source: { kind: "game", item: game }
      }, now));
    }

    for (const soul of plaza.souls.filter((item) => item.visibility === "visible").slice(0, 16)) {
      next.push(makeFeedEvent({
        id: `plaza-${soul.id}`,
        type: "plaza",
        title: soul.name,
        description: soul.desc || `${soul.author} 的图库作品。`,
        date: normalizeDate(soul.importDate || soul.createdAt),
        sortAt: soul.importDate || soul.createdAt,
        href: "#plaza",
        tags: soul.tags || [],
        explicitStatus: soul.featured ? "精选作品" : "图库更新",
        detailTitle: soul.seriesName || soul.name,
        detailBody: soul.desc || `${soul.author} 的图库作品，打开图库查看完整展示。`,
        source: { kind: "plaza", item: soul }
      }, now));
    }

    for (const post of posts.slice(0, 10)) {
      next.push(makeFeedEvent({
        id: `post-${post.id}`,
        type: "post",
        title: post.title,
        description: post.summary || "文章记录已发布。",
        date: normalizeDate(post.publishedAt || post.createdAt),
        sortAt: post.publishedAt || post.createdAt,
        href: `#posts/${encodeURIComponent(post.slug)}`,
        tags: post.tags || [],
        coverImage: post.coverUrl,
        explicitStatus: "已发布",
        detailTitle: post.title,
        detailBody: post.summary || "展开后会加载文章正文摘要，或进入文章页阅读完整内容。",
        source: { kind: "post", item: post }
      }, now));
    }

    return next
      .filter((event, index, list) => list.findIndex((item) => item.id === event.id) === index)
      .sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) || (timestamp(b.sortAt) || 0) - (timestamp(a.sortAt) || 0));
  }, [activeAnnouncements, gaming.library, plaza.souls, posts, screeningsNext, screeningsSchedule.weeks, talks, now]);

  const selectedEvent = events.find((event) => event.id === selectedEventId) || null;

  const weekStarts = useMemo(() => {
    const current = startOfMondayWeek(now);
    const keys = new Set([
      formatDateKey(addDays(current, -7)),
      formatDateKey(current),
      formatDateKey(addDays(current, 7))
    ]);
    for (const event of events) {
      const parsed = parseDateKey(event.date);
      if (parsed) keys.add(formatDateKey(startOfMondayWeek(parsed)));
    }
    return Array.from(keys).sort();
  }, [events, now]);

  const selectedWeekEvents = useMemo(() => {
    const start = parseDateKey(selectedWeekStart) || startOfMondayWeek(now);
    return weekDayLabels.map((weekday, index) => {
      const date = formatDateKey(addDays(start, index));
      const items = events.filter((event) => event.date === date && ["talk", "screening", "game", "announcement"].includes(event.type));
      return { date, weekday, items, emptyLabel: index >= 5 ? "休息" as const : "暂无消息" as const };
    });
  }, [events, selectedWeekStart, now]);

  const filteredEvents = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    const weekStart = startOfMondayWeek(now).getTime();
    const weekEnd = addDays(startOfMondayWeek(now), 7).getTime();
    const monthAgo = now.getTime() - 30 * 24 * 60 * 60 * 1000;
    return events.filter((event) => {
      const eventTime = timestamp(event.sortAt);
      if (typeFilter !== "all" && event.type !== typeFilter) return false;
      if (timeFilter === "week" && (!eventTime || eventTime < weekStart || eventTime >= weekEnd)) return false;
      if (timeFilter === "30d" && (!eventTime || eventTime < monthAgo)) return false;
      if (keyword && !eventSearchText(event).includes(keyword)) return false;
      return true;
    });
  }, [events, now, query, timeFilter, typeFilter]);

  const groupedEvents = useMemo(() => {
    const groups: Record<FeedGroup, SiteFeedEvent[]> = { live: [], upcoming: [], recent: [], older: [] };
    for (const event of filteredEvents) groups[event.group].push(event);
    return groups;
  }, [filteredEvents]);

  const currentEvents = events.filter((event) => event.group === "live" || event.group === "upcoming" || event.pinned).slice(0, 8);
  const notificationEvents = events
    .filter((event) => event.pinned || event.group === "live" || event.group === "upcoming")
    .slice(0, 8);

  const stats = [
    { label: "杂谈录像", value: talks.archive.length, href: "#talks", icon: Video },
    { label: "片源库", value: screeningsLibrary.items.length, href: "#screenings", icon: Clapperboard },
    { label: "游戏库", value: gaming.library?.length || 0, href: "#game-library", icon: Gamepad2 },
    { label: "图库作品", value: plaza.souls.filter((item) => item.visibility === "visible").length, href: "#plaza", icon: Image },
    { label: "文章", value: posts.length, href: "#posts", icon: Newspaper }
  ];

  const jumpLinks = [
    { label: "杂谈录像库", href: "#talks", icon: Video },
    { label: "放映会片源库", href: "#screenings", icon: Film },
    { label: "游戏库", href: "#game-library", icon: Gamepad2 },
    { label: "图库", href: "#plaza", icon: Image },
    { label: "文章", href: "#posts", icon: Newspaper },
    { label: "意见反馈", href: "#about", icon: MessageCircle },
    { label: "更新记录", href: "#changelog", icon: Activity }
  ];

  const featuredCards = [
    {
      title: "现在最值得看",
      desc: firstDefined(currentEvents.find((event) => event.type !== "announcement")?.title, talks.archive[0]?.title, "暂无杂谈"),
      event: currentEvents.find((event) => event.type !== "announcement") || events[0]
    },
    {
      title: "下次放映",
      desc: screeningsNext.movies?.map((movie) => movie.title).join(" / ") || "待补充",
      event: events.find((event) => event.id === "screenings-next")
    },
    {
      title: "正在记录",
      desc: (gaming.library || []).find((game) => game.status === "playing")?.title || gaming.currentGameTitle || "暂无游戏记录",
      event: events.find((event) => event.type === "game")
    }
  ];

  const roleLabel = user?.role === "owner" ? "站主" : user?.role === "admin" ? "管理员" : user ? "普通用户" : "访客";
  const latestWatched = watchedSources[0];

  function openEvent(event: SiteFeedEvent) {
    setSelectedEventId(event.id);
    const parsed = parseDateKey(event.date);
    if (parsed) setSelectedWeekStart(formatDateKey(startOfMondayWeek(parsed)));
  }

  return (
    <div className="min-h-screen overflow-y-auto bg-[#fbfaf8] px-3 py-3 text-foreground dark:bg-zinc-950 md:px-4 md:py-4">
      <div className="mx-auto grid max-w-[1500px] gap-3 lg:h-[calc(100vh-32px)] lg:grid-cols-[35%_1fr] lg:overflow-hidden">
        <section className="grid gap-3 lg:grid-rows-[42%_1fr] lg:overflow-hidden">
          <Panel title="当前动态" icon={Megaphone} count={currentEvents.length}>
            <div className="space-y-2">
              {currentEvents.length ? currentEvents.map((event) => <div key={event.id}><EventRow event={event} onOpen={openEvent} /></div>) : <EmptyState text="当前暂无正在发生或即将开始的动态。" />}
            </div>
          </Panel>

          <Panel title="通知与提醒" icon={Bell} count={notificationEvents.length}>
            <div className="space-y-2">
              {notificationEvents.length ? notificationEvents.map((event) => <div key={`notice-${event.id}`}><EventRow event={event} compact onOpen={openEvent} /></div>) : <EmptyState text="本周暂无通知。" />}
            </div>
          </Panel>
        </section>

        <section className="grid gap-3 lg:grid-rows-[58%_1fr] lg:overflow-hidden">
          <Panel
            title="全站动态流"
            icon={Database}
            count={filteredEvents.length}
            actions={canEditWorkspace ? <a href="#workspace" className="rounded-full bg-[#abc378] px-3 py-1.5 text-xs font-black text-[#1a1a1a]">进入管理后台</a> : <span className="rounded-full bg-muted px-3 py-1.5 text-xs font-black text-muted-foreground">{roleLabel}</span>}
          >
            <div className="space-y-4">
              <IdentityStrip
                roleLabel={roleLabel}
                userName={user?.name}
                canEditWorkspace={canEditWorkspace}
                watchedCount={watchedSources.length}
                latestWatched={latestWatched?.sourceTitle}
              />

              <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
                {stats.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a key={item.label} href={item.href} className="rounded-2xl border border-border bg-background p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-muted-foreground">{item.label}</span>
                        <Icon className="size-4 text-primary" />
                      </div>
                      <div className="mt-2 text-3xl font-black tracking-tight">{item.value}</div>
                    </a>
                  );
                })}
              </div>

              <div className="grid gap-2 md:grid-cols-3">
                {featuredCards.map((card) => (
                  <div key={card.title}><FeatureCard title={card.title} desc={card.desc} event={card.event} onOpen={openEvent} /></div>
                ))}
              </div>

              <div className="grid gap-2 rounded-2xl border border-border bg-background p-3">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="搜索杂谈、电影动画、游戏、图库、文章..."
                    className="h-10 w-full rounded-xl border border-border bg-card pl-10 pr-3 text-sm font-bold outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                  />
                </div>
                <FilterBar
                  typeFilter={typeFilter}
                  timeFilter={timeFilter}
                  onTypeFilter={setTypeFilter}
                  onTimeFilter={setTimeFilter}
                />
              </div>

              <div className="space-y-3">
                {(["live", "upcoming", "recent", "older"] as FeedGroup[]).map((group) => {
                  const items = groupedEvents[group];
                  if (!items.length) return null;
                  return (
                    <div key={group}>
                      <div className="mb-2 flex items-center justify-between">
                        <div className="text-xs font-black text-muted-foreground">{groupLabels[group]}</div>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-black text-muted-foreground">{items.length}</span>
                      </div>
                      <div className="grid gap-2 md:grid-cols-2">
                        {items.map((event) => <div key={`feed-${event.id}`}><EventRow event={event} compact onOpen={openEvent} /></div>)}
                      </div>
                    </div>
                  );
                })}
                {!filteredEvents.length ? <EmptyState text="没有匹配的动态，换一个类型、时间或关键词试试。" /> : null}
              </div>

              <div className="flex flex-wrap gap-2">
                {jumpLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a key={item.label} href={item.href} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-2 text-xs font-black transition-colors hover:border-primary/40 hover:text-primary">
                      <Icon className="size-3.5" /> {item.label}
                    </a>
                  );
                })}
              </div>
            </div>
          </Panel>

          <Panel title="本周时间表" icon={CalendarDays} actions={<span className="text-xs font-black text-muted-foreground">{weekLabel(selectedWeekStart)}</span>}>
            <div className="space-y-4">
              <div className="grid gap-2 md:grid-cols-7">
                {selectedWeekEvents.map((day) => (
                  <div key={day.date} className={cn("min-h-[150px] rounded-2xl border bg-background p-3 transition-colors", selectedEvent?.date === day.date ? "border-primary/50 bg-primary/5" : "border-border")}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-black text-muted-foreground">{day.weekday}</div>
                        <div className="text-sm font-black">{day.date.slice(5)}</div>
                      </div>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-black text-muted-foreground">{day.items.length}</span>
                    </div>
                    <div className="mt-3 space-y-2">
                      {day.items.length ? day.items.map((event) => <div key={`${day.date}-${event.id}`}><ScheduleChip event={event} active={selectedEventId === event.id} onOpen={openEvent} /></div>) : (
                        <div className="rounded-xl border border-dashed border-border bg-muted/30 px-3 py-5 text-center text-xs font-bold text-muted-foreground">{day.emptyLabel}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="overflow-x-auto rounded-2xl border border-border bg-background p-2">
                <div className="flex min-w-max items-center gap-2">
                  {weekStarts.map((weekStart) => {
                    const active = weekStart === selectedWeekStart;
                    const count = events.filter((event) => {
                      const parsed = parseDateKey(event.date);
                      return parsed && formatDateKey(startOfMondayWeek(parsed)) === weekStart;
                    }).length;
                    return (
                      <button
                        key={weekStart}
                        type="button"
                        onClick={() => setSelectedWeekStart(weekStart)}
                        className={cn("relative rounded-xl border px-4 py-2 text-left transition-colors", active ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted")}
                      >
                        <div className="text-xs font-black">{weekLabel(weekStart)}</div>
                        <div className="mt-0.5 text-[11px] font-bold text-muted-foreground">{count ? `${count} 条动态` : "空周目"}</div>
                        {active ? <motion.div layoutId="site-week-rail" className="absolute inset-x-3 -bottom-0.5 h-1 rounded-full bg-primary" /> : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </Panel>
        </section>
      </div>

      <EventDrawer event={selectedEvent} onClose={() => setSelectedEventId(null)} />
    </div>
  );
}

function Panel({ title, icon: Icon, count, actions, children }: { title: string; icon: typeof Bell; count?: number; actions?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex min-h-[320px] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm dark:border-zinc-800 dark:bg-zinc-950/90 lg:min-h-0">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/20 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <Icon className="size-4 text-primary" />
          <h2 className="truncate text-sm font-black tracking-tight">{title}</h2>
          {typeof count === "number" ? <span className="rounded-full bg-background px-2 py-0.5 text-[11px] font-black text-muted-foreground">{count}</span> : null}
        </div>
        {actions}
      </div>
      <div className="flex-1 overflow-y-auto p-3">{children}</div>
    </div>
  );
}

function IdentityStrip({
  roleLabel,
  userName,
  canEditWorkspace,
  watchedCount,
  latestWatched
}: {
  roleLabel: string;
  userName?: string;
  canEditWorkspace: boolean;
  watchedCount: number;
  latestWatched?: string;
}) {
  return (
    <div className="grid gap-2 rounded-2xl border border-border bg-background p-3 md:grid-cols-[1fr_auto] md:items-center">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {userName ? <UserRound className="size-5" /> : <Sparkles className="size-5" />}
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-black">{userName ? `${userName} · ${roleLabel}` : "访客模式 · 公开总览"}</div>
          <div className="truncate text-xs font-bold text-muted-foreground">
            {userName ? `已看片源 ${watchedCount} 条${latestWatched ? ` · 最近看过 ${latestWatched}` : ""}` : "登录后会显示轻量个人状态，公开动态仍然完整可见。"}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <a href="#about" className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-black hover:bg-muted"><MessageCircle className="size-3.5" /> 反馈</a>
        <a href="#screenings" className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-black hover:bg-muted"><CheckCircle2 className="size-3.5" /> 放映记录</a>
        {canEditWorkspace ? <a href="#workspace" className="inline-flex items-center gap-1.5 rounded-xl bg-[#abc378] px-3 py-2 text-xs font-black text-[#1a1a1a]"><ShieldCheck className="size-3.5" /> 后台</a> : null}
      </div>
    </div>
  );
}

function FilterBar({
  typeFilter,
  timeFilter,
  onTypeFilter,
  onTimeFilter
}: {
  typeFilter: TypeFilter;
  timeFilter: TimeFilter;
  onTypeFilter: (value: TypeFilter) => void;
  onTimeFilter: (value: TimeFilter) => void;
}) {
  return (
    <div className="grid gap-2">
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {typeFilters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => onTypeFilter(filter.value)}
            className={cn("shrink-0 rounded-full border px-3 py-1.5 text-xs font-black transition-colors", typeFilter === filter.value ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:text-foreground")}
          >
            {filter.label}
          </button>
        ))}
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {timeFilters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => onTimeFilter(filter.value)}
            className={cn("shrink-0 rounded-full border px-3 py-1.5 text-xs font-black transition-colors", timeFilter === filter.value ? "border-foreground bg-foreground text-background" : "border-border bg-card text-muted-foreground hover:text-foreground")}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function EventRow({ event, compact = false, onOpen }: { event: SiteFeedEvent; compact?: boolean; onOpen: (event: SiteFeedEvent) => void }) {
  const meta = typeMeta[event.type];
  const Icon = meta.icon;
  return (
    <button type="button" onClick={() => onOpen(event)} className="block w-full rounded-2xl border border-border bg-background p-3 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm">
      <div className="flex items-start gap-3">
        <div className={cn("rounded-xl border p-2", meta.tone)}><Icon className="size-4" /></div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-black">{event.title}</span>
            {event.pinned ? <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-black text-primary">置顶</span> : null}
          </div>
          <p className={cn("mt-1 text-xs font-medium leading-relaxed text-muted-foreground", compact && "line-clamp-1")}>{event.description}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-black text-muted-foreground">{meta.label}</span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-black text-muted-foreground">{event.statusLabel}</span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-black text-muted-foreground">{event.relativeTime}</span>
            {event.tags.slice(0, compact ? 2 : 3).map((tag) => <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-black text-muted-foreground">{tag}</span>)}
          </div>
        </div>
        <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground" />
      </div>
    </button>
  );
}

function ScheduleChip({ event, active, onOpen }: { event: SiteFeedEvent; active: boolean; onOpen: (event: SiteFeedEvent) => void }) {
  const meta = typeMeta[event.type];
  return (
    <button type="button" onClick={() => onOpen(event)} className={cn("block w-full rounded-xl border px-2.5 py-2 text-left text-xs font-bold transition-colors hover:bg-muted", meta.tone, active && "ring-2 ring-primary/30")}>
      <div className="line-clamp-1">{meta.label} / {event.title}</div>
    </button>
  );
}

function FeatureCard({ title, desc, event, onOpen }: { title: string; desc: string; event?: SiteFeedEvent; onOpen: (event: SiteFeedEvent) => void }) {
  return (
    <button type="button" disabled={!event} onClick={() => event && onOpen(event)} className="rounded-2xl border border-border bg-background p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 disabled:cursor-default disabled:opacity-70">
      <div className="flex items-center gap-2 text-xs font-black text-primary"><Sparkles className="size-3.5" /> {title}</div>
      <div className="mt-2 line-clamp-2 text-sm font-bold leading-relaxed text-foreground">{desc}</div>
    </button>
  );
}

function EventDrawer({ event, onClose }: { event: SiteFeedEvent | null; onClose: () => void }) {
  const [postDetail, setPostDetail] = useState<PublicPostDetail | null>(null);
  const [postStatus, setPostStatus] = useState("");

  useEffect(() => {
    setPostDetail(null);
    setPostStatus("");
    if (event?.source?.kind !== "post") return;
    let cancelled = false;
    setPostStatus("正在加载文章详情...");
    fetchPublicPost(event.source.item.slug)
      .then((result) => {
        if (!cancelled) {
          setPostDetail(result.post);
          setPostStatus("文章详情已加载。");
        }
      })
      .catch((error) => {
        if (!cancelled) setPostStatus(error instanceof Error ? error.message : "文章详情暂时不可用。");
      });
    return () => {
      cancelled = true;
    };
  }, [event?.id]);

  return (
    <AnimatePresence>
      {event ? (
        <div className="fixed inset-0 z-[80]">
          <motion.button
            type="button"
            aria-label="关闭动态详情"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 cursor-default bg-black/25 backdrop-blur-[2px]"
          />
          <motion.aside
            initial={{ x: 420, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 420, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-y-0 right-0 flex w-full max-w-lg flex-col border-l border-border bg-background shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border p-5">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs font-black text-primary">
                  <Tag className="size-3.5" /> {typeMeta[event.type].label} / {event.statusLabel}
                </div>
                <h3 className="mt-1 truncate text-xl font-black">{event.title}</h3>
              </div>
              <button type="button" onClick={onClose} className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-card hover:bg-muted">
                <X className="size-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {event.coverImage ? (
                <div className="mb-5 aspect-video overflow-hidden rounded-2xl border border-border bg-muted">
                  <img src={event.coverImage} alt={event.title} className="size-full object-cover" />
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-3">
                <InfoCard icon={<Clock className="size-3.5" />} label="时间" value={event.date || "待补"} />
                <InfoCard icon={<Activity className="size-3.5" />} label="状态" value={event.relativeTime} />
              </div>

              <section className="mt-5 rounded-2xl border border-border bg-card p-4">
                <h4 className="text-sm font-black">{event.detailTitle}</h4>
                <p className="mt-2 whitespace-pre-wrap text-sm font-medium leading-7 text-muted-foreground">{postDetail?.summary || event.detailBody}</p>
              </section>

              <DetailPayload event={event} postDetail={postDetail} postStatus={postStatus} />

              <div className="mt-5 flex flex-wrap gap-2">
                {event.tags.map((tag) => <span key={tag} className="rounded-full border border-border bg-card px-3 py-1 text-xs font-black text-muted-foreground">{tag}</span>)}
              </div>
            </div>

            <div className="border-t border-border p-4">
              <a href={event.href || typeMeta[event.type].href} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-black text-primary-foreground transition-colors hover:bg-primary/90">
                进入原栏目 <ExternalLink className="size-4" />
              </a>
            </div>
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

function DetailPayload({ event, postDetail, postStatus }: { event: SiteFeedEvent; postDetail: PublicPostDetail | null; postStatus: string }) {
  const source = event.source;
  if (!source) return null;

  if (source.kind === "talk") {
    const talk = source.item;
    return (
      <section className="mt-5 space-y-3">
        <InfoGrid items={[
          ["主持", talk.host || "待补"],
          ["时长", talk.duration || "待补"],
          ["观看", `${talk.viewers || 0}`],
          ["弹幕", `${talk.danmaku || 0}`]
        ]} />
        {(talk.highlights || []).slice(0, 4).map((item) => (
          <div key={`${item.time}-${item.desc}`} className="rounded-2xl border border-border bg-card px-4 py-3 text-sm">
            <span className="font-black text-primary">{item.time}</span>
            <span className="ml-2 font-medium text-muted-foreground">{item.desc}</span>
          </div>
        ))}
      </section>
    );
  }

  if (source.kind === "screeningNext") {
    return <MovieList movies={source.item.movies.map((movie) => ({ title: movie.title, desc: movie.description || movie.note || movie.originalTitle || "" }))} />;
  }

  if (source.kind === "screeningWeek") {
    return (
      <section className="mt-5 space-y-3">
        <MovieList movies={(source.item.movies || []).map((movie) => ({ title: movie.title, desc: movie.description || movie.note || movie.originalTitle || "" }))} />
        <InfoGrid items={[
          ["状态", source.item.statusText || source.item.status],
          ["观影", `${source.item.viewerCount || 0}`],
          ["讨论", `${source.item.discussionCount || 0}`]
        ]} />
      </section>
    );
  }

  if (source.kind === "game") {
    const records = [...(source.item.playRecords || [])].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
    return (
      <section className="mt-5 space-y-3">
        <InfoGrid items={[
          ["平台", source.item.platform],
          ["类型", source.item.genre],
          ["状态", source.item.status],
          ["评分", source.item.rating || "待评"]
        ]} />
        {records.map((record, index) => (
          <div key={`${record.date}-${index}`} className="rounded-2xl border border-border bg-card px-4 py-3 text-sm">
            <span className="font-black">{record.date}</span>
            <span className="ml-2 text-muted-foreground">{record.durationHours || 0}h / {record.note || "暂无备注"}</span>
          </div>
        ))}
      </section>
    );
  }

  if (source.kind === "plaza") {
    return (
      <section className="mt-5">
        <InfoGrid items={[
          ["作者", source.item.author],
          ["浏览", `${source.item.views || 0}`],
          ["喜欢", `${source.item.likes || 0}`],
          ["批次", source.item.seriesName || "未分组"]
        ]} />
      </section>
    );
  }

  if (source.kind === "post") {
    return (
      <section className="mt-5 rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 text-xs font-black text-muted-foreground">
          {!postDetail && postStatus === "正在加载文章详情..." ? <Loader2 className="size-3.5 animate-spin" /> : <Newspaper className="size-3.5" />}
          {postStatus || "文章摘要"}
        </div>
        {postDetail ? <p className="mt-3 line-clamp-6 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">{postDetail.content}</p> : null}
      </section>
    );
  }

  if (source.kind === "announcement") {
    return (
      <section className="mt-5">
        <InfoGrid items={[
          ["等级", source.item.level],
          ["开始", source.item.startsAt ? normalizeDate(source.item.startsAt) || source.item.startsAt : "未设"],
          ["结束", source.item.endsAt ? normalizeDate(source.item.endsAt) || source.item.endsAt : "未设"]
        ]} />
      </section>
    );
  }

  return null;
}

function MovieList({ movies }: { movies: Array<{ title: string; desc: string }> }) {
  if (!movies.length) return <EmptyState text="暂无片单。" />;
  return (
    <section className="mt-5 space-y-2">
      {movies.map((movie) => (
        <div key={movie.title} className="rounded-2xl border border-border bg-card px-4 py-3">
          <div className="text-sm font-black">{movie.title}</div>
          {movie.desc ? <p className="mt-1 line-clamp-2 text-xs font-medium leading-6 text-muted-foreground">{movie.desc}</p> : null}
        </div>
      ))}
    </section>
  );
}

function InfoGrid({ items }: { items: Array<[string, string]> }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map(([label, value]) => <div key={label}><InfoCard icon={<Database className="size-3.5" />} label={label} value={value} /></div>)}
    </div>
  );
}

function InfoCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{icon} {label}</span>
      <span className="line-clamp-1 text-sm font-black">{value}</span>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-border bg-background px-4 py-8 text-center text-sm font-bold text-muted-foreground">{text}</div>;
}
