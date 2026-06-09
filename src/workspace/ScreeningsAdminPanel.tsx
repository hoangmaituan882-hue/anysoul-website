import { useEffect, useMemo, useState } from "react";
import { Bot, CalendarClock, CheckCircle2, Database, Film, KeyRound, Plus, RefreshCw, Rocket, Save, Search, Settings, Sparkles, Trash2, X } from "lucide-react";
import { CONTENT_API_BASE, fetchPublishedContent } from "../content/client";
import { useAuth } from "../contexts/AuthContext";
import { defaultScreeningLibrary } from "../content/defaults/screeningLibrary";
import { defaultScreeningSourceSubmissions, defaultScreeningsNext, defaultScreeningsSchedule } from "../content/defaults/screenings";
import type { AdminContentEntry, ScreeningLibraryContent, ScreeningMovie, ScreeningNextContent, ScreeningScheduleContent, ScreeningSourceItem, ScreeningSourceSubmission, ScreeningSourceSubmissionsContent, ScreeningWeek } from "../content/types";
import { cn } from "../lib/utils";
import { DateTimePicker } from "../components/DateTimePicker";
import { ImageUploadField } from "../components/ImageUploadField";

type AdminContentResponse = { entries: AdminContentEntry[] };
type MediaScrapeCandidate = ScreeningSourceItem & {
  provider: "tmdb" | "bilibili" | "bangumi" | "jikan" | "wiki" | "local";
  confidence: number;
};
type MediaSearchResponse = {
  candidates: MediaScrapeCandidate[];
  providerStatus: {
    tmdbConfigured: boolean;
    bangumiApiBase?: string;
    bangumiImageBase?: string;
    redirectPlaybackOnly: boolean;
  };
};
type MediaScraperSettings = {
  tmdbApiKey: string;
  bangumiApiBase: string;
  bangumiImageBase: string;
};
type MediaSettingsResponse = { settings: MediaScraperSettings };
type MediaAiSuggestion = {
  id: string;
  title: string;
  patch: Partial<ScreeningSourceItem>;
  confidence: number;
  reason: string;
  risks: string[];
  sourceProviders: string[];
};
type MediaAiCompleteResponse = {
  suggestions: MediaAiSuggestion[];
  skipped: number;
  warnings: string[];
  error?: string;
};
type ContentBatchOperation = {
  key: string;
  payload: unknown;
  publish?: boolean;
  message?: string;
  expectedVersion?: number;
  expectedUpdatedAt?: string;
};
type ContentEntryMeta = Pick<AdminContentEntry, "version" | "updatedAt">;

const SCREENINGS_NEXT_KEY = "screenings.next";
const SCREENINGS_LIBRARY_KEY = "screenings.library";
const SCREENINGS_SOURCE_SUBMISSIONS_KEY = "screenings.sourceSubmissions";
const SCREENINGS_SCHEDULE_KEY = "screenings.schedule";

const movieTypes: Array<{ value: ScreeningMovie["type"]; label: string; tone: string }> = [
  { value: "good", label: "经典好片", tone: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  { value: "bad", label: "绝世烂片", tone: "bg-rose-500/10 text-rose-600 border-rose-500/20" },
  { value: "anime", label: "动画", tone: "bg-sky-500/10 text-sky-600 border-sky-500/20" },
  { value: "topic", label: "主题片", tone: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  { value: "classic", label: "往期经典", tone: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  { value: "other", label: "其他", tone: "bg-muted text-muted-foreground border-border" }
];

function Field({ label, value, onChange, type = "text", placeholder }: { label: string; value: string | number; onChange: (value: string) => void; type?: string; placeholder?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12px] font-bold text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-xl border border-border bg-card px-3 text-sm font-medium outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
      />
    </label>
  );
}

function TextAreaField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12px] font-bold text-muted-foreground">{label}</span>
      <textarea
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        className="resize-none rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium leading-relaxed outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
      />
    </label>
  );
}

function normalizeNext(value: unknown): ScreeningNextContent {
  const next = value as Partial<ScreeningNextContent> | null;

  return {
    ...defaultScreeningsNext,
    ...(next || {}),
    movies: Array.isArray(next?.movies) ? next.movies : defaultScreeningsNext.movies
  };
}

function normalizeLibrary(value: unknown): ScreeningLibraryContent {
  const library = value as Partial<ScreeningLibraryContent> | null;

  return {
    ...defaultScreeningLibrary,
    ...(library || {}),
    items: Array.isArray(library?.items) ? library.items : defaultScreeningLibrary.items,
    tags: Array.isArray(library?.tags) ? library.tags : defaultScreeningLibrary.tags
  };
}

function normalizeSourceSubmissions(value: unknown): ScreeningSourceSubmissionsContent {
  const content = value as Partial<ScreeningSourceSubmissionsContent> | null;
  return { items: Array.isArray(content?.items) ? content.items : defaultScreeningSourceSubmissions.items };
}

function normalizeSchedule(value: unknown): ScreeningScheduleContent {
  const schedule = value as Partial<ScreeningScheduleContent> | null;

  return {
    ...defaultScreeningsSchedule,
    ...(schedule || {}),
    cycle: {
      ...defaultScreeningsSchedule.cycle,
      ...(schedule?.cycle || {})
    },
    weeks: Array.isArray(schedule?.weeks) ? schedule.weeks : defaultScreeningsSchedule.weeks
  };
}

function formatStartsAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || "待定";

  return new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function sourceDateValue(item: ScreeningSourceItem) {
  return item.lastWatchedAt || item.addedAt;
}

function sourceDateTime(item: ScreeningSourceItem) {
  const time = new Date(sourceDateValue(item)).getTime();
  return Number.isFinite(time) ? time : 0;
}

function movieTypeMeta(type: ScreeningMovie["type"]) {
  return movieTypes.find((item) => item.value === type) || movieTypes[movieTypes.length - 1];
}

function formatScheduleDateLabel(startsAt: string) {
  const date = new Date(startsAt);

  if (Number.isNaN(date.getTime())) return startsAt || "待定排期";

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function buildScheduleWeekFromNext(next: ScreeningNextContent): ScreeningWeek {
  const dateLabel = formatScheduleDateLabel(next.startsAt);

  return {
    id: `screening-${dateLabel}`,
    date: dateLabel,
    startsAt: next.startsAt,
    title: next.title || "下周放映会",
    theme: next.theme,
    status: next.status === "live" ? "live" : "preview",
    statusText: next.statusText || "预告",
    movies: next.movies.map((movie) => ({ ...movie })),
    notes: next.description || next.theme,
    viewerCount: next.reservationCount,
    discussionCount: next.discussionCount,
    recordUrl: next.streamUrl
  };
}

function sourceItemToMovie(item: ScreeningSourceItem): ScreeningMovie {
  return {
    id: item.id,
    libraryId: item.id,
    type: item.category,
    title: item.title,
    description: item.description,
    rating: item.rating,
    originalTitle: item.originalTitle,
    year: item.year,
    duration: item.duration,
    posterUrl: item.posterUrl,
    sourceUrl: item.sourceUrl,
    tags: item.tags,
    note: item.sourceNote
  };
}

function syncNextMoviesFromLibrary(next: ScreeningNextContent, library: ScreeningLibraryContent): ScreeningNextContent {
  const itemsById = new Map(library.items.map((item) => [item.id, item]));

  return {
    ...next,
    movies: next.movies.map((movie) => {
      const item = itemsById.get(movie.libraryId || movie.id);
      return item ? sourceItemToMovie(item) : movie;
    })
  };
}

function hasUnboundMovies(next: ScreeningNextContent) {
  return next.movies.some((movie) => !movie.libraryId);
}

type Fetcher = (input: string, init?: RequestInit) => Promise<Response>;

async function readAdminError(response: Response, fallback: string) {
  try {
    const data = await response.json() as { error?: string };
    return data.error ? `${fallback}：${response.status} ${data.error}` : `${fallback}：HTTP ${response.status}`;
  } catch {
    return `${fallback}：HTTP ${response.status}`;
  }
}

async function commitContentBatch(fetcher: Fetcher, operations: ContentBatchOperation[], message: string) {
  const response = await fetcher(`${CONTENT_API_BASE}/api/admin/content/batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ operations, message })
  });

  const data = await response.json().catch(() => ({})) as { entries?: AdminContentEntry[]; error?: string };
  if (!response.ok) throw new Error(data.error || await readAdminError(response, "批量内容操作失败"));
  return data.entries || [];
}

function sortScheduleWeeks(weeks: ScreeningWeek[]) {
  return [...weeks].sort((a, b) => {
    const aTime = new Date(a.startsAt || a.date).getTime();
    const bTime = new Date(b.startsAt || b.date).getTime();
    return Number.isFinite(aTime) && Number.isFinite(bTime) ? aTime - bTime : a.date.localeCompare(b.date);
  });
}

function dateKeyFromDate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function timeWithSeconds(value: string) {
  const time = value || "20:00";
  return time.length === 5 ? `${time}:00` : time;
}

function scheduleDateTime(dateKey: string, schedule: ScreeningScheduleContent) {
  return `${dateKey}T${timeWithSeconds(schedule.cycle.defaultTime)}${schedule.cycle.timezone || "+08:00"}`;
}

function nextSundayDateTime(schedule: ScreeningScheduleContent) {
  const now = new Date();
  const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
  const nextSunday = new Date(now);
  nextSunday.setDate(now.getDate() + daysUntilSunday);
  return scheduleDateTime(dateKeyFromDate(nextSunday), schedule);
}

function normalizeSourceItem(item: ScreeningSourceItem): ScreeningSourceItem {
  const today = dateKeyFromDate(new Date());
  return {
    ...item,
    title: item.title.trim() || "未命名片源",
    type: item.type || "movie",
    category: item.category || "other",
    description: item.description || "待补充简介。",
    tags: Array.from(new Set((item.tags || []).map((tag) => tag.trim()).filter(Boolean))),
    status: item.status || "available",
    priority: item.priority || "normal",
    timesWatched: Number.isFinite(item.timesWatched) ? item.timesWatched : 0,
    addedAt: item.addedAt || today
  };
}

function upsertLibrarySource(library: ScreeningLibraryContent, item: ScreeningSourceItem) {
  const source = normalizeSourceItem(item);
  const titleKey = source.title.trim().toLowerCase();
  const existingIndex = library.items.findIndex((candidate) => candidate.id === source.id || candidate.title.trim().toLowerCase() === titleKey);
  const exists = existingIndex >= 0;
  const items = exists
    ? library.items.map((candidate, index) => index === existingIndex ? normalizeSourceItem({ ...candidate, ...source, id: candidate.id }) : candidate)
    : [source, ...library.items];

  return {
    exists,
    source: exists ? items[existingIndex] : source,
    library: {
      ...library,
      tags: Array.from(new Set([...library.tags, ...source.tags])),
      items
    }
  };
}

function dedupeMovies(movies: ScreeningMovie[]) {
  const order: string[] = [];
  const byKey = new Map<string, ScreeningMovie>();

  movies.forEach((movie) => {
    const key = movie.libraryId || movie.id || movie.title.trim().toLowerCase();
    if (!byKey.has(key)) order.push(key);
    byKey.set(key, movie);
  });

  return order.map((key) => byKey.get(key)).filter((movie): movie is ScreeningMovie => Boolean(movie));
}

function buildNextWithMovie(current: ScreeningNextContent, source: ScreeningSourceItem, startsAt: string): ScreeningNextContent {
  const movie = sourceItemToMovie(source);
  return {
    ...current,
    title: current.title === "待补充" ? "下周放映会" : current.title || "下周放映会",
    theme: current.theme === "待补充" ? "" : current.theme,
    status: "preview",
    statusText: "预告",
    startsAt,
    movies: dedupeMovies([...current.movies, movie])
  };
}

function buildPendingNext(current: ScreeningNextContent, schedule: ScreeningScheduleContent): ScreeningNextContent {
  return {
    ...current,
    title: "下周放映会",
    theme: "待补充",
    status: "preview",
    statusText: "待补充",
    startsAt: current.startsAt || nextSundayDateTime(schedule),
    movies: []
  };
}

function buildArchivedWeekFromSource(source: ScreeningSourceItem, schedule: ScreeningScheduleContent, dateKey: string, existing?: ScreeningWeek): ScreeningWeek {
  const movie = sourceItemToMovie(source);
  const startsAt = existing?.startsAt || scheduleDateTime(dateKey, schedule);
  return {
    id: existing?.id || `screening-${dateKey}`,
    date: dateKey,
    startsAt,
    title: existing?.title || `${dateKey} 放映会`,
    theme: existing?.theme || "放映会归档",
    status: "ended",
    statusText: "已归档",
    movies: dedupeMovies([...(existing?.movies || []), movie]),
    notes: existing?.notes || source.description,
    viewerCount: existing?.viewerCount || 0,
    discussionCount: existing?.discussionCount || 0,
    recordUrl: existing?.recordUrl || source.sourceUrl,
    archivedAt: new Date().toISOString()
  };
}

export function ScreeningsAdminPanel({ readOnly = false }: { readOnly?: boolean }) {
  const { authFetch } = useAuth();
  const [activeMode, setActiveMode] = useState<"next" | "library">("next");
  const [next, setNext] = useState<ScreeningNextContent>(defaultScreeningsNext);
  const [library, setLibrary] = useState<ScreeningLibraryContent>(defaultScreeningLibrary);
  const [sourceSubmissions, setSourceSubmissions] = useState<ScreeningSourceSubmissionsContent>(defaultScreeningSourceSubmissions);
  const [schedule, setSchedule] = useState<ScreeningScheduleContent>(defaultScreeningsSchedule);
  const [status, setStatus] = useState("正在加载下周放映配置...");
  const [isSaving, setIsSaving] = useState(false);
  const [libraryQuery, setLibraryQuery] = useState("");
  const [libraryCategoryFilter, setLibraryCategoryFilter] = useState("all");
  const [libraryStatusFilter, setLibraryStatusFilter] = useState("all");
  const [showLibraryPicker, setShowLibraryPicker] = useState(false);
  const [scrapeQuery, setScrapeQuery] = useState("");
  const [scrapeSourceUrl, setScrapeSourceUrl] = useState("");
  const [scrapeMediaType, setScrapeMediaType] = useState<ScreeningSourceItem["type"] | "auto">("auto");
  const [scrapeResults, setScrapeResults] = useState<MediaScrapeCandidate[]>([]);
  const [isScraping, setIsScraping] = useState(false);
  const [showScraperSettings, setShowScraperSettings] = useState(false);
  const [scraperSettings, setScraperSettings] = useState<MediaScraperSettings>({
    tmdbApiKey: "",
    bangumiApiBase: "https://bgmapi.anibt.net",
    bangumiImageBase: "https://bgmimg.anibt.net"
  });
  const [aiSuggestions, setAiSuggestions] = useState<MediaAiSuggestion[]>([]);
  const [aiScanItems, setAiScanItems] = useState<ScreeningSourceItem[]>([]);
  const [isAiCompleting, setIsAiCompleting] = useState(false);
  const [scrapeFeedback, setScrapeFeedback] = useState<{ key: string; message: string } | null>(null);
  const [entryMeta, setEntryMeta] = useState<Record<string, ContentEntryMeta>>({});
  const [selectedCandidate, setSelectedCandidate] = useState<MediaScrapeCandidate | null>(null);
  const [candidateDraft, setCandidateDraft] = useState<ScreeningSourceItem | null>(null);
  const [archiveDate, setArchiveDate] = useState(dateKeyFromDate(new Date()));
  const [nextStartsAtDraft, setNextStartsAtDraft] = useState(() => nextSundayDateTime(defaultScreeningsSchedule));

  const hasNextMovies = next.movies.length > 0;
  const movieSummary = useMemo(
    () => hasNextMovies ? next.movies.map((movie) => `《${movie.title || "未命名"}》`).join(" + ") : "待补充",
    [hasNextMovies, next.movies]
  );

  const nextPreviewTitle = useMemo(
    () => hasNextMovies ? next.title || "下周放映会" : "待补充",
    [hasNextMovies, next.title]
  );

  const nextPreviewDescription = useMemo(
    () => hasNextMovies ? next.theme || next.description || "填写主题后，这里会成为前台的放映说明。" : "下周日片单待补充。",
    [hasNextMovies, next.description, next.theme]
  );

  const candidateFeedbackKey = useMemo(
    () => selectedCandidate ? `${selectedCandidate.provider}-${selectedCandidate.id}` : "",
    [selectedCandidate]
  );

  const filteredLibraryItems = useMemo(() => {
    return library.items.filter((item) => {
      const query = libraryQuery.trim().toLowerCase();
      const matchesQuery = !query || [item.title, item.originalTitle, item.description, item.type, item.category, item.status, ...item.tags]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
      const matchesCategory = libraryCategoryFilter === "all" || item.category === libraryCategoryFilter;
      const matchesStatus = libraryStatusFilter === "all" || item.status === libraryStatusFilter;
      return matchesQuery && matchesCategory && matchesStatus;
    }).sort((a, b) => sourceDateTime(b) - sourceDateTime(a) || a.title.localeCompare(b.title));
  }, [library.items, libraryQuery, libraryCategoryFilter, libraryStatusFilter]);

  const missingFieldItems = useMemo(() => {
    return library.items.filter((item) => !item.posterUrl || !item.description || item.description.length < 18 || item.tags.length === 0 || !item.year || item.rating === undefined || !item.sourceNote);
  }, [library.items]);

  const load = async () => {
    if (readOnly) {
      const data = await fetchPublishedContent([SCREENINGS_NEXT_KEY, SCREENINGS_LIBRARY_KEY, SCREENINGS_SOURCE_SUBMISSIONS_KEY, SCREENINGS_SCHEDULE_KEY]);
      setEntryMeta({});
      setNext(normalizeNext(data.content[SCREENINGS_NEXT_KEY]));
      setLibrary(normalizeLibrary(data.content[SCREENINGS_LIBRARY_KEY]));
      setSourceSubmissions(normalizeSourceSubmissions(data.content[SCREENINGS_SOURCE_SUBMISSIONS_KEY]));
      setSchedule(normalizeSchedule(data.content[SCREENINGS_SCHEDULE_KEY]));
      setStatus("只读模式已加载前台已发布的放映会内容，登录管理员后可编辑。");
      return;
    }

    const res = await authFetch(`${CONTENT_API_BASE}/api/admin/content`);
    if (!res.ok) throw new Error(await readAdminError(res, "放映会内容加载失败"));

    const data = await res.json() as AdminContentResponse;
    const trackedEntries = data.entries.filter((entry) => [SCREENINGS_NEXT_KEY, SCREENINGS_LIBRARY_KEY, SCREENINGS_SOURCE_SUBMISSIONS_KEY, SCREENINGS_SCHEDULE_KEY].includes(entry.key));
    const draft = data.entries.find((entry) => entry.key === SCREENINGS_NEXT_KEY)?.draft;
    const libraryDraft = data.entries.find((entry) => entry.key === SCREENINGS_LIBRARY_KEY)?.draft;
    const submissionsDraft = data.entries.find((entry) => entry.key === SCREENINGS_SOURCE_SUBMISSIONS_KEY)?.draft;
    const scheduleDraft = data.entries.find((entry) => entry.key === SCREENINGS_SCHEDULE_KEY)?.draft;
    setEntryMeta(Object.fromEntries(trackedEntries.map((entry) => [entry.key, { version: entry.version, updatedAt: entry.updatedAt }])));
    setNext(normalizeNext(draft));
    setLibrary(normalizeLibrary(libraryDraft));
    setSourceSubmissions(normalizeSourceSubmissions(submissionsDraft));
    setSchedule(normalizeSchedule(scheduleDraft));
    setStatus("已同步下周放映配置、片源库和排播周期");
  };

  const rememberEntryMeta = (entries: AdminContentEntry[]) => {
    if (!entries.length) return;
    setEntryMeta((current) => ({
      ...current,
      ...Object.fromEntries(entries.map((entry) => [entry.key, { version: entry.version, updatedAt: entry.updatedAt }]))
    }));
  };

  const withExpectedMeta = (operation: ContentBatchOperation): ContentBatchOperation => {
    const meta = entryMeta[operation.key];
    return meta ? { ...operation, expectedVersion: meta.version, expectedUpdatedAt: meta.updatedAt } : operation;
  };

  const commitScreeningBatch = async (operations: ContentBatchOperation[], message: string) => {
    const entries = await commitContentBatch(authFetch, operations.map(withExpectedMeta), message);
    rememberEntryMeta(entries);
    return entries;
  };

  const loadScraperSettings = async () => {
    const response = await authFetch(`${CONTENT_API_BASE}/api/admin/media/settings`);
    if (!response.ok) throw new Error("load scraper settings failed");

    const data = await response.json() as MediaSettingsResponse;
    setScraperSettings(data.settings);
  };

  useEffect(() => {
    load().catch((error) => setStatus(error instanceof TypeError ? "内容服务未启动，请运行 npm run server:dev" : error instanceof Error ? error.message : "放映会内容加载失败"));
    if (!readOnly) {
      loadScraperSettings().catch((error) => setStatus(error instanceof TypeError ? "内容服务未启动，请运行 npm run server:dev" : error instanceof Error ? error.message : "刮削设置加载失败"));
    }
  }, [readOnly]);

  const publishNextNow = async () => {
    if (readOnly) {
      setStatus("只读模式无法发布下周播放");
      return;
    }

    if (hasUnboundMovies(next)) {
      setStatus("下周播放存在未绑定片源库的条目，请先从片源库添加或补建片源");
      return;
    }

    setIsSaving(true);

    try {
      const sourceNext = next.movies.length > 0 ? next : buildPendingNext(next, schedule);
      const syncedNext = syncNextMoviesFromLibrary(sourceNext, library);
      setNext(syncedNext);
      await commitScreeningBatch([
        { key: SCREENINGS_NEXT_KEY, payload: syncedNext, publish: true, message: "Publish next screening movie" }
      ], "Publish next screening movie");

      setStatus(syncedNext.movies.length > 0 ? "下周播放已保存并发布到前台" : "下周播放已发布为待补充");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "发布失败，请检查内容服务");
    } finally {
      setIsSaving(false);
    }
  };

  const publishLibraryNow = async () => {
    if (readOnly) {
      setStatus("只读模式无法发布片源库");
      return;
    }

    setIsSaving(true);

    try {
      const syncedNext = syncNextMoviesFromLibrary(next, library);
      setNext(syncedNext);
      await commitScreeningBatch([
        { key: SCREENINGS_LIBRARY_KEY, payload: library, publish: true, message: "Publish screening source library" },
        { key: SCREENINGS_NEXT_KEY, payload: syncedNext, publish: true, message: "Sync next screening from source library" }
      ], "Publish screening source library and synced next screening");

      setStatus("片源库已保存并发布到前台，并同步已绑定的下周播放");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "片源库发布失败，请检查内容服务");
    } finally {
      setIsSaving(false);
    }
  };

  const updateMovie = (index: number, patch: Partial<ScreeningMovie>) => {
    if (readOnly) return;

    setNext((current) => ({
      ...current,
      movies: current.movies.map((movie, movieIndex) => movieIndex === index ? { ...movie, ...patch } : movie)
    }));
  };

  const createLibraryItemForNext = () => {
    if (readOnly) {
      setStatus("只读模式无法新增片源");
      return;
    }

    addLibraryItem();
    setActiveMode("library");
    setStatus("请先在片源库新增并维护片源，再加入下周播放，片源库会作为排播主数据源");
  };

  const removeMovie = (index: number) => {
    if (readOnly) return;

    setNext((current) => ({ ...current, movies: current.movies.filter((_, movieIndex) => movieIndex !== index) }));
  };

  const updateLibraryItem = (index: number, patch: Partial<ScreeningSourceItem>) => {
    if (readOnly) return;

    setLibrary((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item)
    }));
  };

  const addLibraryItem = () => {
    if (readOnly) {
      setStatus("只读模式无法新增片源");
      return;
    }

    setLibrary((current) => ({
      ...current,
      items: [
        {
          id: `source-${Date.now()}`,
          title: "新片源",
          type: "movie",
          category: "other",
          description: "填写简介、推荐理由或吐槽点。",
          tags: [],
          status: "available",
          priority: "normal",
          timesWatched: 0,
          addedAt: new Date().toISOString().slice(0, 10)
        },
        ...current.items
      ]
    }));
  };

  const scrapeMedia = async () => {
    if (readOnly) {
      setStatus("只读模式无法抓取元数据");
      return;
    }

    if (!scrapeQuery.trim() && !scrapeSourceUrl.trim()) {
      setStatus("请输入片名关键词或 Bilibili 播放链接后再抓取");
      return;
    }

    setIsScraping(true);
    setScrapeFeedback(null);
    setStatus("正在抓取/解析电影动漫元数据...");

    try {
      const response = await authFetch(`${CONTENT_API_BASE}/api/admin/media/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: scrapeQuery,
          sourceUrl: scrapeSourceUrl,
          mediaType: scrapeMediaType
        })
      });

      if (!response.ok) throw new Error("scrape failed");

      const data = await response.json() as MediaSearchResponse;
      setScrapeResults(data.candidates);
      const autoSources = Array.from(new Set(data.candidates.map((candidate) => candidate.provider.toUpperCase()))).join(" / ") || "LOCAL";
      setStatus(`已自动抓取 ${data.candidates.length} 条候选元数据，来源：${autoSources}${data.providerStatus.tmdbConfigured ? " / TMDB 已启用" : " / TMDB 未配置"}`);
    } catch {
      setStatus("元数据抓取失败，请检查内容服务或网络连接");
    } finally {
      setIsScraping(false);
    }
  };

  const saveScraperSettings = async () => {
    if (readOnly) {
      setStatus("只读模式无法保存刮削设置");
      return;
    }

    setIsSaving(true);

    try {
      const response = await authFetch(`${CONTENT_API_BASE}/api/admin/media/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scraperSettings)
      });

      if (!response.ok) throw new Error("save scraper settings failed");

      const data = await response.json() as MediaSettingsResponse;
      setScraperSettings(data.settings);
      setStatus("刮削设置已保存，后续搜索会自动使用新的 TMDB Key 和 Bangumi 反代");
    } catch {
      setStatus("刮削设置保存失败，请检查内容服务");
    } finally {
      setIsSaving(false);
    }
  };

  const requestAiCompletion = async (items: ScreeningSourceItem[], mode: "single" | "batch") => {
    if (readOnly) {
      setStatus("只读模式无法执行 AI 补全");
      return;
    }

    if (items.length === 0) {
      setStatus("没有需要 AI 补全的片源");
      return;
    }

    setIsAiCompleting(true);
    setStatus(mode === "single" ? `正在为《${items[0].title}》生成 AI 补全建议...` : `正在为 ${items.length} 个片源生成 AI 补全建议...`);

    try {
      const response = await authFetch(`${CONTENT_API_BASE}/api/admin/media/ai/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "single" ? { mode, item: items[0] } : { mode, items, limit: 8 })
      });

      const data = await response.json() as MediaAiCompleteResponse;
      if (!response.ok) throw new Error(data.error || "AI completion failed");

      setAiSuggestions(data.suggestions);
      setStatus(`已生成 ${data.suggestions.length} 条 AI 补全建议${data.skipped ? `，跳过 ${data.skipped} 条` : ""}`);
    } catch (error) {
      setStatus(error instanceof Error ? `AI 补全失败：${error.message}` : "AI 补全失败，请检查后端配置");
    } finally {
      setIsAiCompleting(false);
    }
  };

  const scanMissingFields = () => {
    const items = missingFieldItems.slice(0, 12);
    setAiScanItems(items);
    setStatus(items.length ? `已扫描到 ${missingFieldItems.length} 个缺项片源，本次预备处理 ${items.length} 个` : "未发现缺项片源");
  };

  const applyAiSuggestion = async (suggestion: MediaAiSuggestion) => {
    if (readOnly) {
      setStatus("只读模式无法应用 AI 建议");
      return;
    }

    setIsSaving(true);

    try {
      const nextLibrary: ScreeningLibraryContent = {
        ...library,
        tags: suggestion.patch.tags ? Array.from(new Set([...library.tags, ...suggestion.patch.tags])) : library.tags,
        items: library.items.map((item) => item.id === suggestion.id ? normalizeSourceItem({ ...item, ...suggestion.patch }) : item)
      };
      const syncedNext = syncNextMoviesFromLibrary(next, nextLibrary);
      await commitScreeningBatch([
        { key: SCREENINGS_LIBRARY_KEY, payload: nextLibrary, publish: true, message: "Apply AI source suggestion" },
        { key: SCREENINGS_NEXT_KEY, payload: syncedNext, publish: true, message: "Sync next screening after AI suggestion" }
      ], "Apply AI source suggestion and publish");
      setLibrary(nextLibrary);
      setNext(syncedNext);
      setAiSuggestions((current) => current.filter((item) => item.id !== suggestion.id));
      setStatus(`已把《${suggestion.title}》AI 建议应用并发布`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "AI 建议应用失败，请检查内容服务");
    } finally {
      setIsSaving(false);
    }
  };

  const openScrapedCandidate = (candidate: MediaScrapeCandidate) => {
    if (readOnly) {
      setStatus("只读模式无法写入片源库");
      return;
    }

    const { provider: _provider, confidence: _confidence, ...item } = candidate;
    setSelectedCandidate(candidate);
    setCandidateDraft(normalizeSourceItem(item));
    setArchiveDate(dateKeyFromDate(new Date()));
    setNextStartsAtDraft(nextSundayDateTime(schedule));
    setStatus(`正在确认《${candidate.title}》的片源信息`);
  };

  const closeCandidateModal = () => {
    setSelectedCandidate(null);
    setCandidateDraft(null);
  };

  const updateCandidateDraft = (patch: Partial<ScreeningSourceItem>) => {
    setCandidateDraft((current) => current ? normalizeSourceItem({ ...current, ...patch }) : current);
  };

  const addDraftToLibrary = async () => {
    if (readOnly) {
      setStatus("只读模式无法写入片源库");
      return;
    }

    if (!candidateDraft) return;

    const { exists, source, library: nextLibrary } = upsertLibrarySource(library, candidateDraft);
    const syncedNext = syncNextMoviesFromLibrary(next, nextLibrary);
    const message = exists ? `已更新《${source.title}》片源库并发布` : `已添加《${source.title}》到片源库并发布`;

    setIsSaving(true);
    setStatus(`正在发布《${source.title}》到片源库...`);

    try {
      await commitScreeningBatch([
        { key: SCREENINGS_LIBRARY_KEY, payload: nextLibrary, publish: true, message: exists ? "Update scraped source metadata" : "Add scraped source to library" },
        { key: SCREENINGS_NEXT_KEY, payload: syncedNext, publish: true, message: "Sync next screening after library metadata change" }
      ], exists ? "Update scraped source metadata and publish" : "Add scraped source to library and publish");
      setLibrary(nextLibrary);
      setNext(syncedNext);
      if (candidateFeedbackKey) setScrapeFeedback({ key: candidateFeedbackKey, message });
      setStatus(message);
      closeCandidateModal();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : `发布《${source.title}》失败，请确认内容服务已启动并且当前账号有后台权限`);
    } finally {
      setIsSaving(false);
    }
  };

  const archiveDraftToSchedule = async () => {
    if (readOnly) {
      setStatus("只读模式无法归档放映会影视");
      return;
    }

    if (!candidateDraft) return;

    const dateKey = archiveDate || dateKeyFromDate(new Date());
    const { source, library: sourceLibrary } = upsertLibrarySource(library, candidateDraft);
    const existingWeek = schedule.weeks.find((week) => week.date === dateKey || week.id === `screening-${dateKey}`);
    const archivedWeek = buildArchivedWeekFromSource(source, schedule, dateKey, existingWeek);
    const updatedSchedule: ScreeningScheduleContent = {
      ...schedule,
      weeks: sortScheduleWeeks([
        ...schedule.weeks.filter((week) => week.id !== archivedWeek.id && week.date !== dateKey),
        archivedWeek
      ])
    };
    const updatedLibrary: ScreeningLibraryContent = {
      ...sourceLibrary,
      items: sourceLibrary.items.map((item) => item.id === source.id ? {
        ...item,
        status: "watched",
        timesWatched: item.timesWatched + 1,
        lastWatchedAt: dateKey
      } : item)
    };
    const syncedNext = syncNextMoviesFromLibrary(next, updatedLibrary);

    setIsSaving(true);
    setStatus(`正在归档《${source.title}》到 ${dateKey} 放映会...`);

    try {
      await commitScreeningBatch([
        { key: SCREENINGS_LIBRARY_KEY, payload: updatedLibrary, publish: true, message: "Archive source and mark watched" },
        { key: SCREENINGS_SCHEDULE_KEY, payload: updatedSchedule, publish: true, message: "Archive movie into screening schedule" },
        { key: SCREENINGS_NEXT_KEY, payload: syncedNext, publish: true, message: "Sync next screening after archive" }
      ], "Archive movie into screening history and publish");
      setLibrary(updatedLibrary);
      setSchedule(updatedSchedule);
      setNext(syncedNext);
      if (candidateFeedbackKey) setScrapeFeedback({ key: candidateFeedbackKey, message: `已归档到 ${dateKey} 放映会` });
      setStatus(`已归档到 ${dateKey} 放映会`);
      closeCandidateModal();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "放映会影视归档失败，请检查内容服务");
    } finally {
      setIsSaving(false);
    }
  };

  const addDraftToNext = async () => {
    if (readOnly) {
      setStatus("只读模式无法加入下周放映");
      return;
    }

    if (!candidateDraft) return;

    const { source, library: sourceLibrary } = upsertLibrarySource(library, { ...candidateDraft, status: "planned" });
    const updatedLibrary: ScreeningLibraryContent = {
      ...sourceLibrary,
      items: sourceLibrary.items.map((item) => item.id === source.id && item.status === "available" ? { ...item, status: "planned" } : item)
    };
    const nextContent = buildNextWithMovie(next, source, nextStartsAtDraft || nextSundayDateTime(schedule));

    setIsSaving(true);
    setStatus(`正在把《${source.title}》加入下周放映并发布...`);

    try {
      await commitScreeningBatch([
        { key: SCREENINGS_LIBRARY_KEY, payload: updatedLibrary, publish: true, message: "Add source for next screening" },
        { key: SCREENINGS_NEXT_KEY, payload: nextContent, publish: true, message: "Add movie to next screening" }
      ], "Add movie to next screening and publish");
      setLibrary(updatedLibrary);
      setNext(nextContent);
      if (candidateFeedbackKey) setScrapeFeedback({ key: candidateFeedbackKey, message: "已加入下周放映并发布" });
      setStatus("已加入下周放映并发布");
      closeCandidateModal();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "加入下周放映失败，请检查内容服务");
    } finally {
      setIsSaving(false);
    }
  };

  const removeLibraryItem = (index: number) => {
    if (readOnly) return;

    setLibrary((current) => ({ ...current, items: current.items.filter((_, itemIndex) => itemIndex !== index) }));
  };

  const addLibraryItemToNext = async (item: ScreeningSourceItem) => {
    if (readOnly) {
      setStatus("只读模式无法加入下周播放");
      return;
    }

    const plannedLibrary: ScreeningLibraryContent = {
      ...library,
      items: library.items.map((source) => source.id === item.id && source.status === "available" ? { ...source, status: "planned" } : source)
    };
    const plannedSource = plannedLibrary.items.find((source) => source.id === item.id) || item;
    const nextContent = buildNextWithMovie(next, plannedSource, next.startsAt || nextSundayDateTime(schedule));

    setIsSaving(true);
    setStatus(`正在把《${item.title}》加入下周放映并发布...`);

    try {
      await commitScreeningBatch([
        { key: SCREENINGS_LIBRARY_KEY, payload: plannedLibrary, publish: true, message: "Mark selected source planned" },
        { key: SCREENINGS_NEXT_KEY, payload: nextContent, publish: true, message: "Add library source to next screening" }
      ], "Add library source to next screening and publish");
      setLibrary(plannedLibrary);
      setNext(nextContent);
      setShowLibraryPicker(false);
      setStatus(`已把《${item.title}》加入下周放映并发布`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "加入下周放映失败，请检查内容服务");
    } finally {
      setIsSaving(false);
    }
  };

  const reviewSourceSubmission = async (submission: ScreeningSourceSubmission, decision: "approved" | "rejected") => {
    if (readOnly) {
      setStatus("只读模式无法审核用户补充");
      return;
    }

    setIsSaving(true);
    setStatus(decision === "approved" ? `正在同意《${submission.sourceTitle}》的补充信息...` : `正在拒绝《${submission.sourceTitle}》的补充信息...`);

    try {
      const response = await authFetch(`${CONTENT_API_BASE}/api/admin/submissions/source/${submission.id}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, message: `Review source submission: ${decision}` })
      });
      const data = await response.json().catch(() => ({})) as { entry?: AdminContentEntry; error?: string };
      if (!response.ok || !data.entry) throw new Error(data.error || "review failed");
      const nextSubmissions = data.entry.draft as ScreeningSourceSubmissionsContent;
      setSourceSubmissions(nextSubmissions);
      setStatus(decision === "approved" ? `已同意《${submission.sourceTitle}》的补充信息，前台详情会显示已采纳补充` : `已拒绝《${submission.sourceTitle}》的补充信息`);
    } catch {
      setStatus("补充信息审核失败，请检查内容服务");
    } finally {
      setIsSaving(false);
    }
  };

  const publishNextToSchedule = async () => {
    if (readOnly) {
      setStatus("只读模式无法生成排播周");
      return;
    }

    if (hasUnboundMovies(next)) {
      setStatus("下周播放存在未绑定片源库的条目，无法生成排播周");
      return;
    }

    setIsSaving(true);

    try {
      const sourceNext = next.movies.length > 0 ? next : buildPendingNext(next, schedule);
      const syncedNext = syncNextMoviesFromLibrary(sourceNext, library);
      const week = buildScheduleWeekFromNext(syncedNext);
      const updatedSchedule: ScreeningScheduleContent = {
        ...schedule,
        weeks: sortScheduleWeeks([
          ...schedule.weeks.filter((item) => item.id !== week.id),
          week
        ])
      };
      const updatedLibrary: ScreeningLibraryContent = {
        ...library,
        items: library.items.map((item) => {
          const used = syncedNext.movies.some((movie) => movie.libraryId === item.id || movie.id === item.id);
          return used && item.status === "available" ? { ...item, status: "planned" } : item;
        })
      };

      setNext(syncedNext);
      setSchedule(updatedSchedule);
      setLibrary(updatedLibrary);

      await commitScreeningBatch([
        { key: SCREENINGS_NEXT_KEY, payload: syncedNext, publish: true, message: "Sync next screening from source library" },
        { key: SCREENINGS_SCHEDULE_KEY, payload: updatedSchedule, publish: true, message: "Generate schedule week from next screening" },
        { key: SCREENINGS_LIBRARY_KEY, payload: updatedLibrary, publish: true, message: "Mark scheduled screening sources as planned" }
      ], "Generate schedule week from next screening and mark sources planned");

      setStatus(syncedNext.movies.length > 0 ? `已生成排播周并发布：${week.title} / ${week.date}` : `已生成 ${week.date} 待补充排播并发布`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "生成排播周失败，请检查内容服务");
    } finally {
      setIsSaving(false);
    }
  };

  const archiveCurrentScreening = async () => {
    if (readOnly) {
      setStatus("只读模式无法归档放映");
      return;
    }

    if (next.movies.length === 0) {
      setStatus("下周播放清单为空，无法归档");
      return;
    }

    if (hasUnboundMovies(next)) {
      setStatus("下周播放存在未绑定片源库的条目，无法归档回写");
      return;
    }

    setIsSaving(true);

    try {
      const archivedAt = new Date().toISOString();
      const today = archivedAt.slice(0, 10);
      const syncedNext = syncNextMoviesFromLibrary(next, library);
      const week = buildScheduleWeekFromNext(syncedNext);
      const endedWeek: ScreeningWeek = {
        ...week,
        status: "ended",
        statusText: "已归档",
        viewerCount: syncedNext.reservationCount,
        discussionCount: syncedNext.discussionCount,
        recordUrl: syncedNext.streamUrl,
        archivedAt
      };
      const updatedSchedule: ScreeningScheduleContent = {
        ...schedule,
        weeks: sortScheduleWeeks([
          ...schedule.weeks.filter((item) => item.id !== endedWeek.id),
          endedWeek
        ])
      };
      const watchedIds = new Set<string>(
        syncedNext.movies.flatMap((movie) => [movie.id, movie.libraryId].filter((value): value is string => Boolean(value)))
      );
      const updatedLibrary: ScreeningLibraryContent = {
        ...library,
        items: library.items.map((item) => {
          if (!watchedIds.has(item.id)) return item;

          return {
            ...item,
            status: "watched",
            timesWatched: item.timesWatched + 1,
            lastWatchedAt: today
          };
        })
      };
      const endedNext: ScreeningNextContent = {
        ...syncedNext,
        status: "ended",
        statusText: "已结束"
      };

      setNext(endedNext);
      setSchedule(updatedSchedule);
      setLibrary(updatedLibrary);

      await commitScreeningBatch([
        { key: SCREENINGS_NEXT_KEY, payload: endedNext, publish: true, message: "Archive current screening" },
        { key: SCREENINGS_SCHEDULE_KEY, payload: updatedSchedule, publish: true, message: "Archive current screening schedule week" },
        { key: SCREENINGS_LIBRARY_KEY, payload: updatedLibrary, publish: true, message: "Mark screening sources as watched" }
      ], "Archive current screening and mark sources watched");

      setStatus(`已归档本场放映，并回写 ${watchedIds.size} 个片源`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "归档失败，请检查内容服务");
    } finally {
      setIsSaving(false);
    }
  };

  const libraryFilters = (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_160px_160px]">
      <label className="flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm font-medium text-muted-foreground">
        <Search className="size-4" />
        <input value={libraryQuery} onChange={(event) => setLibraryQuery(event.target.value)} placeholder="搜索片名、标签、简介" className="min-w-0 flex-1 bg-transparent outline-none" />
      </label>
      <select value={libraryCategoryFilter} onChange={(event) => setLibraryCategoryFilter(event.target.value)} className="h-10 rounded-xl border border-border bg-card px-3 text-sm font-bold outline-none">
        <option value="all">全部分类</option>
        {movieTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
      </select>
      <select value={libraryStatusFilter} onChange={(event) => setLibraryStatusFilter(event.target.value)} className="h-10 rounded-xl border border-border bg-card px-3 text-sm font-bold outline-none">
        <option value="all">全部状态</option>
        <option value="available">可排播</option>
        <option value="planned">已计划</option>
        <option value="watched">已看</option>
        <option value="hidden">隐藏</option>
        <option value="rejected">拒绝</option>
      </select>
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
            {activeMode === "next" ? <Film className="size-6 text-primary" /> : <Database className="size-6 text-primary" />} {activeMode === "next" ? "下周播放控制" : "片源库管理"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{activeMode === "next" ? "下周播放从片源库选择，发布、排播和归档都会重新同步片源库主数据。" : "统一维护候选电影、动画、烂片和经典片源，并手动填写 Bilibili 录播/播放跳转链接。"}</p>
          <div className="mt-3 flex w-fit rounded-2xl border border-border bg-muted p-1">
            <button onClick={() => setActiveMode("next")} className={cn("rounded-xl px-3 py-1.5 text-sm font-bold transition-colors", activeMode === "next" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>下周播放控制</button>
            <button onClick={() => setActiveMode("library")} className={cn("rounded-xl px-3 py-1.5 text-sm font-bold transition-colors", activeMode === "library" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>片源库管理</button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={load} className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm font-bold transition-colors hover:bg-muted">
            <RefreshCw className="size-4" /> 刷新
          </button>
        </div>
      </div>

      {activeMode === "library" ? (
        <div className="rounded-3xl border border-border bg-background p-5 shadow-sm">
          <div className="mb-5 overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
            <div className="relative grid gap-4 p-4 md:grid-cols-[1fr_1fr_150px_auto] md:items-end">
              <div className="absolute -right-16 -top-20 size-48 rounded-full bg-primary/10 blur-3xl" />
              <div className="relative md:col-span-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-black tracking-widest text-primary">
                      <Search className="size-3.5" /> SCRAPER WORKBENCH
                    </span>
                    <h3 className="mt-3 text-lg font-black text-foreground">电影 / 动漫资源抓取</h3>
                    <p className="mt-1 text-sm text-muted-foreground">输入片名或粘贴 Bilibili 录播链接，后端会解析播放跳转并生成可管理的片源元数据；前台只外跳 B 站播放。</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="rounded-2xl border border-border bg-background px-3 py-2 text-xs font-bold text-muted-foreground">
                      自动抓取：Bilibili / Bangumi / Jikan / TMDB
                    </div>
                    <button onClick={() => setShowScraperSettings((value) => !value)} className="inline-flex items-center gap-1.5 rounded-2xl border border-border bg-background px-3 py-2 text-xs font-black text-foreground transition-colors hover:bg-muted">
                      <Settings className="size-3.5" /> 刮削设置
                    </button>
                  </div>
                </div>
              </div>

              {showScraperSettings && (
                <div className="relative rounded-2xl border border-border bg-background/80 p-3 md:col-span-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-black text-foreground">
                    <KeyRound className="size-4 text-primary" /> API 与反代配置
                  </div>
                  <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
                    <Field label="TMDB API Key" type="password" value={scraperSettings.tmdbApiKey} onChange={(value) => setScraperSettings((current) => ({ ...current, tmdbApiKey: value }))} placeholder="Bearer Token，可留空" />
                    <Field label="Bangumi API 反代" value={scraperSettings.bangumiApiBase} onChange={(value) => setScraperSettings((current) => ({ ...current, bangumiApiBase: value }))} placeholder="https://bgmapi.anibt.net" />
                    <Field label="Bangumi 图片反代" value={scraperSettings.bangumiImageBase} onChange={(value) => setScraperSettings((current) => ({ ...current, bangumiImageBase: value }))} placeholder="https://bgmimg.anibt.net" />
                    <button disabled={isSaving} onClick={saveScraperSettings} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-4 text-sm font-black text-primary transition-colors hover:bg-primary/15 disabled:opacity-50">
                      <Save className="size-4" /> 保存设置
                    </button>
                  </div>
                  <p className="mt-2 text-xs font-medium text-muted-foreground">TMDB 用于电影/剧集海报简介增强；Bangumi 反代用于中文动漫搜索和封面加载。设置保存在本地内容服务，不会发布到前台。</p>
                </div>
              )}

              <Field label="搜索关键词" value={scrapeQuery} onChange={setScrapeQuery} placeholder="例如：变形金刚4 / 链锯人" />
              <Field label="Bilibili 录播链接" value={scrapeSourceUrl} onChange={setScrapeSourceUrl} placeholder="https://www.bilibili.com/video/..." />
              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-bold text-muted-foreground">媒体类型</span>
                <select value={scrapeMediaType} onChange={(event) => setScrapeMediaType(event.target.value as ScreeningSourceItem["type"] | "auto")} className="h-10 rounded-xl border border-border bg-card px-3 text-sm font-medium outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/15">
                  <option value="auto">自动识别</option>
                  {(["movie", "anime", "ova", "series", "short", "other"] as ScreeningSourceItem["type"][]).map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
              </label>
              <button onClick={scrapeMedia} disabled={isScraping} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-foreground px-4 text-sm font-bold text-background shadow-sm transition-colors hover:bg-foreground/90 disabled:opacity-50">
                <Search className={cn("size-4", isScraping && "animate-spin")} /> {isScraping ? "抓取中" : "搜索抓取"}
              </button>
            </div>

            {scrapeResults.length > 0 && (
              <div className="border-t border-border p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="text-sm font-black text-foreground">候选元数据</div>
                  <button onClick={() => setScrapeResults([])} className="text-xs font-bold text-muted-foreground hover:text-foreground">清空结果</button>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {scrapeResults.map((candidate) => {
                    const feedbackKey = `${candidate.provider}-${candidate.id}`;
                    const feedbackMessage = scrapeFeedback?.key === feedbackKey ? scrapeFeedback.message : "";

                    return (
                    <div key={feedbackKey} className="rounded-2xl border border-border bg-background p-3">
                      <div className="flex gap-3">
                        <div className="h-20 w-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                          {candidate.posterUrl ? <img src={candidate.posterUrl} alt={candidate.title} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center px-1 text-center text-[10px] font-black text-muted-foreground">自动源无海报</div>}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-black text-primary">{candidate.provider.toUpperCase()}</span>
                            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-black text-muted-foreground">{Math.round(candidate.confidence * 100)}% 匹配</span>
                            {candidate.sourceUrl ? <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-black text-emerald-600">B 站跳转</span> : null}
                          </div>
                          <div className="mt-1 truncate text-sm font-black text-foreground">{candidate.title}</div>
                          <div className="mt-1 text-xs font-bold text-muted-foreground">{candidate.year || "年份待补"} / {candidate.category}{candidate.rating ? ` / ${candidate.rating} 分` : ""}</div>
                          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{candidate.description}</p>
                        </div>
                      </div>
                      {feedbackMessage ? (
                        <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-black text-emerald-600">
                          <CheckCircle2 className="size-3.5" /> {feedbackMessage}
                        </div>
                      ) : null}
                      <button onClick={() => openScrapedCandidate(candidate)} disabled={isSaving} className={cn("mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-black transition-colors disabled:opacity-50", feedbackMessage ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/15" : "border-primary/20 bg-primary/10 text-primary hover:bg-primary/15")}>
                        {feedbackMessage ? <CheckCircle2 className="size-3.5" /> : <Plus className="size-3.5" />} {feedbackMessage || "查看并添加"}
                      </button>
                    </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="mb-5 rounded-3xl border border-border bg-card p-4 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-black tracking-widest text-primary">
                  <Bot className="size-3.5" /> AI COMPLETION
                </span>
                <h3 className="mt-3 text-lg font-black text-foreground">AI 片源补全</h3>
                <p className="mt-1 text-sm text-muted-foreground">仅后台使用。AI 会基于真实抓取源生成补丁预览，确认后直接写入片源库并发布。</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={scanMissingFields} className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm font-bold transition-colors hover:bg-muted">
                  <Search className="size-4" /> 扫描缺项
                </button>
                <button disabled={isAiCompleting || aiScanItems.length === 0} onClick={() => requestAiCompletion(aiScanItems, "batch")} className="inline-flex items-center gap-2 rounded-xl bg-foreground px-3 py-2 text-sm font-bold text-background transition-colors hover:bg-foreground/90 disabled:opacity-50">
                  <Sparkles className={cn("size-4", isAiCompleting && "animate-spin")} /> 批量生成建议
                </button>
              </div>
            </div>

            <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-border bg-background p-3">
                <div className="text-xl font-black text-foreground">{missingFieldItems.length}</div>
                <div className="text-xs font-bold text-muted-foreground">缺项片源</div>
              </div>
              <div className="rounded-2xl border border-border bg-background p-3">
                <div className="text-xl font-black text-foreground">{aiScanItems.length}</div>
                <div className="text-xs font-bold text-muted-foreground">本次扫描队列</div>
              </div>
              <div className="rounded-2xl border border-border bg-background p-3">
                <div className="text-xl font-black text-foreground">{aiSuggestions.length}</div>
                <div className="text-xs font-bold text-muted-foreground">待应用建议</div>
              </div>
            </div>

            {aiScanItems.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {aiScanItems.map((item) => <span key={item.id} className="rounded-full border border-border bg-background px-3 py-1 text-xs font-bold text-muted-foreground">{item.title}</span>)}
              </div>
            )}

            {aiSuggestions.length > 0 && (
              <div className="space-y-3">
                {aiSuggestions.map((suggestion) => (
                  <div key={suggestion.id} className="rounded-2xl border border-border bg-background p-3">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="text-sm font-black text-foreground">{suggestion.title}</div>
                        <div className="mt-1 text-xs font-bold text-muted-foreground">置信度 {Math.round(suggestion.confidence * 100)}% / 来源 {suggestion.sourceProviders.join("、") || "无"}</div>
                      </div>
                      <button onClick={() => applyAiSuggestion(suggestion)} className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-3 py-2 text-xs font-black text-primary transition-colors hover:bg-primary/15">
                        <CheckCircle2 className="size-3.5" /> 应用并发布
                      </button>
                    </div>
                    <p className="mb-2 text-xs font-medium leading-relaxed text-muted-foreground">{suggestion.reason}</p>
                    <div className="grid gap-2 md:grid-cols-2">
                      {Object.entries(suggestion.patch).map(([key, value]) => (
                        <div key={key} className="rounded-xl border border-border bg-card px-3 py-2">
                          <div className="text-[11px] font-black text-primary">{key}</div>
                          <div className="mt-1 line-clamp-3 text-xs font-medium text-foreground/80">{Array.isArray(value) ? value.join(", ") : String(value)}</div>
                        </div>
                      ))}
                    </div>
                    {suggestion.risks.length > 0 && <div className="mt-2 text-xs font-bold text-amber-600">风险提示：{suggestion.risks.join("；")}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-black text-foreground">全量片源</h3>
              <p className="text-sm text-muted-foreground">当前 {library.items.length} 个片源，片名、简介、海报、状态和播放链接会作为排播主数据。</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={publishLibraryNow} disabled={readOnly || isSaving} className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-3 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary/15 disabled:opacity-50">
                <Save className="size-4" /> 保存并发布片源库
              </button>
              <button onClick={addLibraryItem} className="inline-flex items-center gap-2 rounded-xl border border-dashed border-border bg-card px-3 py-2 text-sm font-bold text-primary transition-colors hover:bg-muted">
                <Plus className="size-4" /> 新增片源
              </button>
            </div>
          </div>

          <div className="mb-4 space-y-2">
            {libraryFilters}
            <div className="text-xs font-bold text-muted-foreground">筛选结果：{filteredLibraryItems.length} / {library.items.length}</div>
          </div>

          <div className="space-y-3">
            {filteredLibraryItems.map((item) => {
              const index = library.items.findIndex((candidate) => candidate.id === item.id);
              return (
              <div key={item.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-xl bg-foreground text-sm font-black text-background">{index + 1}</span>
                    <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">{item.status}</span>
                    <span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-bold text-muted-foreground">{item.priority}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                   <button onClick={() => addLibraryItemToNext(item)} disabled={isSaving} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-bold text-primary transition-colors hover:bg-primary/10 disabled:opacity-50">
                      <Plus className="size-3.5" /> 加入下周
                    </button>
                    <button disabled={isAiCompleting} onClick={() => requestAiCompletion([item], "single")} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-bold text-primary transition-colors hover:bg-primary/10 disabled:opacity-50">
                      <Sparkles className="size-3.5" /> AI 补全
                    </button>
                    <button onClick={() => removeLibraryItem(index)} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-bold text-red-500 transition-colors hover:bg-red-500/10">
                      <Trash2 className="size-3.5" /> 删除
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_120px_120px_140px]">
                  <Field label="片名" value={item.title} onChange={(value) => updateLibraryItem(index, { title: value })} />
                  <Field label="原名" value={item.originalTitle || ""} onChange={(value) => updateLibraryItem(index, { originalTitle: value })} />
                  <Field label="上映时间" value={item.year || ""} onChange={(value) => updateLibraryItem(index, { year: value })} />
                  <Field label="评分" type="number" value={item.rating || 0} onChange={(value) => updateLibraryItem(index, { rating: Number(value) })} />
                  <DateTimePicker label="播放时间" mode="date" value={item.lastWatchedAt || item.addedAt || ""} onChange={(value) => updateLibraryItem(index, { lastWatchedAt: value })} />
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-4">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[12px] font-bold text-muted-foreground">类型</span>
                    <select value={item.type} onChange={(event) => updateLibraryItem(index, { type: event.target.value as ScreeningSourceItem["type"] })} className="h-10 rounded-xl border border-border bg-card px-3 text-sm font-medium outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/15">
                      {(["movie", "anime", "ova", "series", "short", "other"] as ScreeningSourceItem["type"][]).map((value) => <option key={value} value={value}>{value}</option>)}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[12px] font-bold text-muted-foreground">分类</span>
                    <select value={item.category} onChange={(event) => updateLibraryItem(index, { category: event.target.value as ScreeningSourceItem["category"] })} className="h-10 rounded-xl border border-border bg-card px-3 text-sm font-medium outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/15">
                      {movieTypes.map((value) => <option key={value.value} value={value.value}>{value.label}</option>)}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[12px] font-bold text-muted-foreground">状态</span>
                    <select value={item.status} onChange={(event) => updateLibraryItem(index, { status: event.target.value as ScreeningSourceItem["status"] })} className="h-10 rounded-xl border border-border bg-card px-3 text-sm font-medium outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/15">
                      {(["available", "planned", "watched", "hidden", "rejected"] as ScreeningSourceItem["status"][]).map((value) => <option key={value} value={value}>{value}</option>)}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[12px] font-bold text-muted-foreground">优先级</span>
                    <select value={item.priority} onChange={(event) => updateLibraryItem(index, { priority: event.target.value as ScreeningSourceItem["priority"] })} className="h-10 rounded-xl border border-border bg-card px-3 text-sm font-medium outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/15">
                      {(["low", "normal", "high"] as ScreeningSourceItem["priority"][]).map((value) => <option key={value} value={value}>{value}</option>)}
                    </select>
                  </label>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                  <Field label="时长" value={item.duration || ""} onChange={(value) => updateLibraryItem(index, { duration: value })} />
                  <ImageUploadField label="海报" value={item.posterUrl || ""} onChange={(value) => updateLibraryItem(index, { posterUrl: value })} admin readOnly={readOnly} scope="screening-poster" compact />
                  <Field label="Bilibili 录播/播放链接" value={item.sourceUrl || ""} onChange={(value) => updateLibraryItem(index, { sourceUrl: value })} placeholder="https://www.bilibili.com/video/..." />
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <TextAreaField label="简介" value={item.description} onChange={(value) => updateLibraryItem(index, { description: value })} />
                  <TextAreaField label="标签，逗号分隔" value={item.tags.join(", ")} onChange={(value) => updateLibraryItem(index, { tags: value.split(",").map((tag) => tag.trim()).filter(Boolean) })} />
                  <TextAreaField label="播放备注" value={item.sourceNote || ""} onChange={(value) => updateLibraryItem(index, { sourceNote: value })} placeholder="例如：B 站录播 P2 / 正片从 05:30 开始" />
                  <TextAreaField label="泛式评价" value={item.fanshiReview || ""} onChange={(value) => updateLibraryItem(index, { fanshiReview: value })} placeholder="用于前台片源详情展示的站主评价" />
                </div>
              </div>
            );})}
          </div>
        </div>
      ) : (
      <>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <div className="relative min-h-[360px] bg-gradient-to-br from-rose-100 via-amber-50 to-sky-100 p-6 dark:from-rose-950/40 dark:via-amber-950/20 dark:to-sky-950/30">
            <div className="absolute -right-20 -top-20 size-56 rounded-full bg-white/50 blur-3xl dark:bg-white/10" />
            <div className="relative z-10 flex h-full min-h-[312px] flex-col">
              <div className="mb-5 flex items-center justify-between">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/60 px-3 py-1 text-xs font-bold text-rose-700 shadow-sm backdrop-blur dark:border-white/10 dark:bg-black/20 dark:text-rose-300">
                  <CalendarClock className="size-3.5" /> 下周预告
                </span>
                <span className="rounded-full border border-white/60 bg-white/60 px-3 py-1 text-xs font-bold text-foreground/70 shadow-sm backdrop-blur dark:border-white/10 dark:bg-black/20">
                  {next.reservationCount.toLocaleString()} 人预约
                </span>
              </div>

              <div className="mt-auto space-y-4">
                <div>
                  <p className="text-sm font-bold text-foreground/60">{formatStartsAt(next.startsAt)}</p>
                  <h3 className="mt-2 text-4xl font-black tracking-tight text-foreground">{nextPreviewTitle}</h3>
                  <p className="mt-3 max-w-xl text-sm font-medium leading-relaxed text-foreground/70">{nextPreviewDescription}</p>
                </div>

                <div className="rounded-2xl border border-white/60 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-black/20">
                  <div className="text-xs font-bold text-muted-foreground">本次播放</div>
                  <div className="mt-1 text-lg font-black text-foreground">{movieSummary}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-background p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="专场标题" value={next.title} onChange={(value) => setNext({ ...next, title: value })} placeholder="例如：动画专场" />
            <DateTimePicker label="开始时间" mode="datetime" value={next.startsAt} onChange={(value) => setNext({ ...next, startsAt: value })} placeholder="选择下周播放开始时间" />
            <Field label="预约人数" type="number" value={next.reservationCount} onChange={(value) => setNext({ ...next, reservationCount: Number(value) })} />
            <Field label="讨论记录数" type="number" value={next.discussionCount} onChange={(value) => setNext({ ...next, discussionCount: Number(value) })} />
            <Field label="直播/录播链接" value={next.streamUrl || ""} onChange={(value) => setNext({ ...next, streamUrl: value })} placeholder="https://..." />
            <Field label="状态文案" value={next.statusText} onChange={(value) => setNext({ ...next, statusText: value })} placeholder="预告 / 直播中 / 已结束" />
          </div>

          <div className="mt-4">
            <TextAreaField label="主题说明" value={next.theme} onChange={(value) => setNext({ ...next, theme: value })} placeholder="这次为什么播这些电影" />
          </div>
          <div className="mt-4 flex justify-end">
            <button onClick={publishNextNow} disabled={readOnly || isSaving} className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-3 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary/15 disabled:opacity-50">
              <Save className="size-4" /> 保存并发布下周放映
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-background p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-black text-foreground">电影清单</h3>
            <p className="text-sm text-muted-foreground">前台会按这里的顺序展示；每个条目必须绑定片源库，发布前会同步最新主数据。</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={publishNextToSchedule} disabled={readOnly || isSaving} className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-bold text-primary transition-colors hover:bg-muted disabled:opacity-50">
              <Rocket className="size-4" /> 生成排播周
            </button>
            <button onClick={archiveCurrentScreening} disabled={readOnly || isSaving} className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm font-bold text-emerald-600 transition-colors hover:bg-emerald-500/15 disabled:opacity-50">
              <CheckCircle2 className="size-4" /> 结束并归档
            </button>
            <button onClick={() => setShowLibraryPicker((value) => !value)} className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-bold text-primary transition-colors hover:bg-muted">
              <Database className="size-4" /> 从片源库添加
            </button>
            <button onClick={createLibraryItemForNext} className="inline-flex items-center gap-2 rounded-xl border border-dashed border-border bg-card px-3 py-2 text-sm font-bold text-primary transition-colors hover:bg-muted">
              <Plus className="size-4" /> 新增片源
            </button>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="text-xl font-black text-foreground">{schedule.weeks.length}</div>
            <div className="text-xs font-bold text-muted-foreground">排播周总数</div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="text-xl font-black text-foreground">{next.movies.length}</div>
            <div className="text-xs font-bold text-muted-foreground">本次播放片源</div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="text-xl font-black text-foreground">{next.movies.filter((movie) => !movie.libraryId).length}</div>
            <div className="text-xs font-bold text-muted-foreground">未绑定主库</div>
          </div>
        </div>

        {showLibraryPicker && (
          <div className="mb-4 rounded-2xl border border-border bg-card p-4">
            <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h4 className="text-sm font-black text-foreground">从片源库添加</h4>
                <p className="text-xs font-medium text-muted-foreground">选择片源后会生成下周播放快照，并保留 libraryId，后续发布会自动同步片源库最新信息。</p>
              </div>
              <button onClick={() => setShowLibraryPicker(false)} className="text-xs font-bold text-muted-foreground hover:text-foreground">收起</button>
            </div>
            {libraryFilters}
            <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              {filteredLibraryItems.slice(0, 8).map((item) => (
                <button key={item.id} onClick={() => addLibraryItemToNext(item)} disabled={isSaving} className="flex items-start gap-3 rounded-xl border border-border bg-background p-3 text-left transition-colors hover:border-primary/40 disabled:opacity-50">
                  <div className="h-16 w-11 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {item.posterUrl ? <img src={item.posterUrl} alt={item.title} className="h-full w-full object-cover" /> : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-black text-foreground">{item.title}</div>
                    <div className="mt-1 text-xs font-bold text-muted-foreground">{item.status} / {item.category}{item.rating ? ` / ${item.rating} 分` : ""}</div>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          {next.movies.map((movie, index) => {
            const meta = movieTypeMeta(movie.type);
            return (
              <div key={movie.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-xl bg-foreground text-sm font-black text-background">{index + 1}</span>
                    <span className={cn("rounded-full border px-2.5 py-1 text-xs font-bold", meta.tone)}>{meta.label}</span>
                  </div>
                  <button onClick={() => removeMovie(index)} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-bold text-red-500 transition-colors hover:bg-red-500/10">
                    <Trash2 className="size-3.5" /> 删除
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_150px_120px]">
                  <Field label="电影名" value={movie.title} onChange={(value) => updateMovie(index, { title: value })} />
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[12px] font-bold text-muted-foreground">分类</span>
                    <select
                      value={movie.type}
                      onChange={(event) => updateMovie(index, { type: event.target.value as ScreeningMovie["type"] })}
                      className="h-10 rounded-xl border border-border bg-card px-3 text-sm font-medium outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                    >
                      {movieTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                    </select>
                  </label>
                  <Field label="评分" type="number" value={movie.rating || 0} onChange={(value) => updateMovie(index, { rating: Number(value) })} />
                </div>

                <div className="mt-3">
                  <TextAreaField label="简介 / 推荐理由" value={movie.description} onChange={(value) => updateMovie(index, { description: value })} />
                </div>

                <div className="mt-3 rounded-2xl border border-border bg-background px-4 py-3 text-xs font-bold text-muted-foreground">
                  {movie.libraryId ? `已绑定片源库：${movie.libraryId}${movie.sourceUrl ? " / 已配置播放跳转" : " / 缺播放跳转"}` : "未绑定片源库：请删除后从片源库重新添加"}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      </>
      )}

      {candidateDraft && selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-border bg-background shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-background/95 px-5 py-4 backdrop-blur">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-black text-primary">{selectedCandidate.provider.toUpperCase()}</span>
                  <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-black text-muted-foreground">{Math.round(selectedCandidate.confidence * 100)}% 匹配</span>
                </div>
                <h3 className="mt-2 text-xl font-black text-foreground">确认影视信息</h3>
              </div>
              <button onClick={closeCandidateModal} className="inline-flex size-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <X className="size-4" />
              </button>
            </div>

            <div className="grid gap-5 p-5 lg:grid-cols-[220px_1fr]">
              <div className="space-y-3">
                <div className="overflow-hidden rounded-2xl border border-border bg-muted">
                  {candidateDraft.posterUrl ? <img src={candidateDraft.posterUrl} alt={candidateDraft.title} className="aspect-[2/3] w-full object-cover" /> : <div className="flex aspect-[2/3] items-center justify-center px-4 text-center text-sm font-black text-muted-foreground">暂无海报</div>}
                </div>
                <ImageUploadField label="海报" value={candidateDraft.posterUrl || ""} onChange={(value) => updateCandidateDraft({ posterUrl: value })} admin readOnly={readOnly} scope="screening-poster" compact />
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.2fr_1fr_120px_120px]">
                  <Field label="片名" value={candidateDraft.title} onChange={(value) => updateCandidateDraft({ title: value })} />
                  <Field label="原名" value={candidateDraft.originalTitle || ""} onChange={(value) => updateCandidateDraft({ originalTitle: value })} />
                  <Field label="年份" value={candidateDraft.year || ""} onChange={(value) => updateCandidateDraft({ year: value })} />
                  <Field label="评分" type="number" value={candidateDraft.rating || 0} onChange={(value) => updateCandidateDraft({ rating: value === "" ? undefined : Number(value) })} />
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[12px] font-bold text-muted-foreground">媒体类型</span>
                    <select value={candidateDraft.type} onChange={(event) => updateCandidateDraft({ type: event.target.value as ScreeningSourceItem["type"] })} className="h-10 rounded-xl border border-border bg-card px-3 text-sm font-medium outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/15">
                      {(["movie", "anime", "ova", "series", "short", "other"] as ScreeningSourceItem["type"][]).map((value) => <option key={value} value={value}>{value}</option>)}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[12px] font-bold text-muted-foreground">分类标签</span>
                    <select value={candidateDraft.category} onChange={(event) => updateCandidateDraft({ category: event.target.value as ScreeningSourceItem["category"] })} className="h-10 rounded-xl border border-border bg-card px-3 text-sm font-medium outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/15">
                      {movieTypes.map((value) => <option key={value.value} value={value.value}>{value.label}</option>)}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[12px] font-bold text-muted-foreground">片源状态</span>
                    <select value={candidateDraft.status} onChange={(event) => updateCandidateDraft({ status: event.target.value as ScreeningSourceItem["status"] })} className="h-10 rounded-xl border border-border bg-card px-3 text-sm font-medium outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/15">
                      {(["available", "planned", "watched", "hidden", "rejected"] as ScreeningSourceItem["status"][]).map((value) => <option key={value} value={value}>{value}</option>)}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[12px] font-bold text-muted-foreground">优先级</span>
                    <select value={candidateDraft.priority} onChange={(event) => updateCandidateDraft({ priority: event.target.value as ScreeningSourceItem["priority"] })} className="h-10 rounded-xl border border-border bg-card px-3 text-sm font-medium outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/15">
                      {(["low", "normal", "high"] as ScreeningSourceItem["priority"][]).map((value) => <option key={value} value={value}>{value}</option>)}
                    </select>
                  </label>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-[140px_1fr]">
                  <Field label="时长" value={candidateDraft.duration || ""} onChange={(value) => updateCandidateDraft({ duration: value })} />
                  <Field label="播放/录播链接" value={candidateDraft.sourceUrl || ""} onChange={(value) => updateCandidateDraft({ sourceUrl: value })} placeholder="https://www.bilibili.com/video/..." />
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <TextAreaField label="简介" value={candidateDraft.description} onChange={(value) => updateCandidateDraft({ description: value })} />
                  <TextAreaField label="标签，逗号分隔" value={candidateDraft.tags.join(", ")} onChange={(value) => updateCandidateDraft({ tags: value.split(",").map((tag) => tag.trim()).filter(Boolean) })} />
                  <TextAreaField label="播放备注" value={candidateDraft.sourceNote || ""} onChange={(value) => updateCandidateDraft({ sourceNote: value })} placeholder="例如 B 站录播 P2 / 正片从 05:30 开始" />
                  <TextAreaField label="站主评价" value={candidateDraft.fanshiReview || ""} onChange={(value) => updateCandidateDraft({ fanshiReview: value })} />
                </div>

                <div className="grid grid-cols-1 gap-3 rounded-2xl border border-border bg-card p-4 md:grid-cols-2">
                  <DateTimePicker label="放映会归档日期" mode="date" value={archiveDate} onChange={setArchiveDate} />
                  <DateTimePicker label="下周放映时间" mode="datetime" value={nextStartsAtDraft} onChange={setNextStartsAtDraft} />
                </div>

                <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                  <button onClick={addDraftToLibrary} disabled={isSaving} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-black text-foreground transition-colors hover:bg-muted disabled:opacity-50">
                    <Database className="size-4" /> 仅添加到片源库
                  </button>
                  <button onClick={archiveDraftToSchedule} disabled={isSaving} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm font-black text-emerald-600 transition-colors hover:bg-emerald-500/15 disabled:opacity-50">
                    <CheckCircle2 className="size-4" /> 放映会影视
                  </button>
                  <button onClick={addDraftToNext} disabled={isSaving} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-black text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50">
                    <CalendarClock className="size-4" /> 下周放映
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-muted/20 px-4 py-3 text-xs font-medium text-muted-foreground">{status}</div>
    </div>
  );
}
