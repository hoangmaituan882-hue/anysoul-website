import express from "express";
import multer from "multer";
import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, rename, rm, statfs, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { Pool } from "pg";
import { generateThumbnails, getThumbnailUrls, detectBestFormat, thumbnailFilePathStatic } from "./image-store";
import { loadRuntimeConfig } from "./config/runtime";
import { broadcast } from "./store/content-events";
import { registerContentRoutes } from "./routes/content";
import { registerRealtimeRoute } from "./routes/realtime";
import { defaultHomeFaq, defaultHomeHero } from "../src/content/seeds/home";
import { defaultGamingMain } from "../src/content/seeds/gaming";
import { defaultTalksContent } from "../src/content/seeds/talks";
import { defaultPlazaContent } from "../src/content/seeds/plaza";
import { defaultTimelinePlans } from "../src/content/defaults/timeline";
import { defaultSiteAnnouncements } from "../src/content/seeds/siteAnnouncements";
import { defaultFeedbackSubmissions } from "../src/content/seeds/feedback";
import { defaultSiteAnalytics } from "../src/content/seeds/analytics";
import { defaultScreeningLibrary } from "../src/content/seeds/screeningLibrary";
import type { FeedbackSubmission, FeedbackSubmissionsContent, MediaAssetRecord, PlazaContent, PlazaSoulItem, PlazaVisibility, PostCommentRecord, PostRecord, PostStatus, PostVisibility, ScreeningLibraryContent, ScreeningMovie, ScreeningScheduleContent, ScreeningSourceItem, ScreeningSourceSubmission, ScreeningSourceSubmissionsContent, ScreeningTodoContent, ServerAlert, ServerMetricSample, ServerMonitoringSummary, SiteAnalyticsContent, SiteAnalyticsTrendPoint, TalkHighlightItem, TalkTranscriptItem } from "../src/content/types";
import {
  defaultScreeningsAnime,
  defaultScreeningsClassics,
  defaultScreeningsNext,
  defaultScreeningsSchedule,
  defaultScreeningSourceSubmissions,
  defaultScreeningsStats,
  defaultScreeningsTodo
} from "../src/content/seeds/screenings";

type ContentStatus = "draft" | "published";

type ContentEntry = {
  key: string;
  type: string;
  status: ContentStatus;
  draft: unknown;
  published: unknown;
  version: number;
  updatedAt: string;
  publishedAt: string;
};

type ContentStore = {
  siteVersion: number;
  entries: Record<string, ContentEntry>;
  events: Array<{
    id: string;
    type: string;
    keys: string[];
    version: number;
    message: string;
    actorId?: string;
    actorName?: string;
    actorRole?: UserRole;
    createdAt: string;
  }>;
};

type MediaScrapeRequest = {
  query?: string;
  sourceUrl?: string;
  mediaType?: ScreeningSourceItem["type"] | "auto";
  providers?: MediaScrapeProvider[];
};

type MediaScraperSettings = {
  tmdbApiKey: string;
  tmdbApiBase: string;
  bangumiApiBase: string;
  bangumiImageBase: string;
};

type MediaScrapeProvider = "tmdb" | "bilibili" | "bangumi" | "douban" | "jikan" | "wiki" | "local" | "posterdb";

type MediaScrapeCandidate = ScreeningSourceItem & {
  provider: MediaScrapeProvider;
  confidence: number;
  providerId?: string;
  aliases?: string[];
};

type MediaAiCompleteRequest = {
  item?: ScreeningSourceItem;
  items?: ScreeningSourceItem[];
  mode?: "single" | "batch";
  limit?: number;
};

type MediaMetadataCompleteRequest = {
  item?: ScreeningSourceItem;
  providers?: MediaScrapeProvider[];
  overwrite?: boolean;
};

type AiCoreSettings = {
  apiKey: string;
  baseUrl: string;
  model: string;
};

type UserRole = "owner" | "admin" | "user";
type UserStatus = "active" | "disabled";

type AuthUser = {
  id: string;
  uid?: number;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  passwordHash: string;
  passwordSalt: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
};

type PublicUser = Omit<AuthUser, "passwordHash" | "passwordSalt">;

type AuthSessionContext = { user: AuthUser };
type AuthenticatedRequest = express.Request & { authContext?: AuthSessionContext | null };

const AUTH_SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;
const AUTH_SESSION_RENEW_THRESHOLD_MS = 15 * 24 * 60 * 60 * 1000;

type MediaAiSuggestion = {
  id: string;
  title: string;
  patch: Partial<ScreeningSourceItem>;
  confidence: number;
  reason: string;
  risks: string[];
  sourceProviders: string[];
};

class TmdbRequestError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "TmdbRequestError";
    this.status = status;
  }
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const dataDir = path.join(projectRoot, "server", "data");
const storePath = path.join(dataDir, "content-store.json");
const schemaPath = path.join(projectRoot, "server", "schema.sql");
const mediaSettingsPath = path.join(dataDir, "media-scraper-settings.json");
const aiSettingsPath = path.join(dataDir, "ai-settings.json");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

function normalizedUrl(value: string, fallback: string) {
  return (value || fallback).trim().replace(/\/$/, "");
}

const runtimeConfig = loadRuntimeConfig();

const db = runtimeConfig.databaseUrl ? new Pool({ connectionString: runtimeConfig.databaseUrl }) : null;
const ownerAccountIds = runtimeConfig.ownerAccountIds;
const isProduction = runtimeConfig.nodeEnv === "production";
let storeWriteQueue = Promise.resolve();
let authDatabaseReady: Promise<void> | null = null;
let databaseSchemaReady: Promise<void> | null = null;
const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();
let requestMetrics = { requests: 0, errors: 0, totalResponseMs: 0 };
let previousCpuUsage = process.cpuUsage();
let previousCpuSampleAt = Date.now();
let consecutiveDbFailures = 0;
let consecutiveApiFailures = 0;
let lastMetricSample: ServerMetricSample | null = null;
let cleanupTimer: NodeJS.Timeout | null = null;
let sampleTimer: NodeJS.Timeout | null = null;

process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection", error);
});

const defaultMediaScraperSettings: MediaScraperSettings = {
  tmdbApiKey: runtimeConfig.tmdbApiKey,
  tmdbApiBase: runtimeConfig.tmdbApiBase,
  bangumiApiBase: runtimeConfig.bangumiApiBase,
  bangumiImageBase: runtimeConfig.bangumiImageBase
};

const defaultAiCoreSettings: AiCoreSettings = {
  apiKey: runtimeConfig.openAiApiKey,
  baseUrl: runtimeConfig.openAiBaseUrl,
  model: runtimeConfig.openAiModel
};

const defaultStore: ContentStore = {
  siteVersion: 1,
  entries: {
    "home.hero.main": {
      key: "home.hero.main",
      type: "home.hero",
      status: "published",
      version: 1,
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      draft: defaultHomeHero,
      published: defaultHomeHero
    },
    "home.faq.items": {
      key: "home.faq.items",
      type: "home.faq",
      status: "published",
      version: 1,
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      draft: defaultHomeFaq,
      published: defaultHomeFaq
    },
    "gaming.main": {
      key: "gaming.main",
      type: "gaming.main",
      status: "published",
      version: 1,
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      draft: defaultGamingMain,
      published: defaultGamingMain
    },
    "talks.main": {
      key: "talks.main",
      type: "talks.main",
      status: "published",
      version: 1,
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      draft: defaultTalksContent,
      published: defaultTalksContent
    },
    "site.announcements": {
      key: "site.announcements",
      type: "site.announcements",
      status: "published",
      version: 1,
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      draft: defaultSiteAnnouncements,
      published: defaultSiteAnnouncements
    },
    "screenings.next": {
      key: "screenings.next",
      type: "screenings.next",
      status: "published",
      version: 1,
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      draft: defaultScreeningsNext,
      published: defaultScreeningsNext
    },
    "screenings.todo": {
      key: "screenings.todo",
      type: "screenings.todo",
      status: "published",
      version: 1,
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      draft: defaultScreeningsTodo,
      published: defaultScreeningsTodo
    },
    "screenings.schedule": {
      key: "screenings.schedule",
      type: "screenings.schedule",
      status: "published",
      version: 1,
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      draft: defaultScreeningsSchedule,
      published: defaultScreeningsSchedule
    },
    "screenings.classics": {
      key: "screenings.classics",
      type: "screenings.classics",
      status: "published",
      version: 1,
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      draft: defaultScreeningsClassics,
      published: defaultScreeningsClassics
    },
    "screenings.anime": {
      key: "screenings.anime",
      type: "screenings.anime",
      status: "published",
      version: 1,
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      draft: defaultScreeningsAnime,
      published: defaultScreeningsAnime
    },
    "screenings.stats": {
      key: "screenings.stats",
      type: "screenings.stats",
      status: "published",
      version: 1,
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      draft: defaultScreeningsStats,
      published: defaultScreeningsStats
    },
    "screenings.library": {
      key: "screenings.library",
      type: "screenings.library",
      status: "published",
      version: 1,
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      draft: defaultScreeningLibrary,
      published: defaultScreeningLibrary
    },
    "screenings.sourceSubmissions": {
      key: "screenings.sourceSubmissions",
      type: "screenings.sourceSubmissions",
      status: "draft",
      version: 1,
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      draft: defaultScreeningSourceSubmissions,
      published: defaultScreeningSourceSubmissions
    },
    "plaza.main": {
      key: "plaza.main",
      type: "plaza.main",
      status: "published",
      version: 1,
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      draft: defaultPlazaContent,
      published: defaultPlazaContent
    },
    "feedback.submissions": {
      key: "feedback.submissions",
      type: "feedback.submissions",
      status: "draft",
      version: 1,
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      draft: defaultFeedbackSubmissions,
      published: defaultFeedbackSubmissions
    },
    "analytics.site": {
      key: "analytics.site",
      type: "analytics.site",
      status: "published",
      version: 1,
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      draft: defaultSiteAnalytics,
      published: defaultSiteAnalytics
    },
    "timeline.plans": {
      key: "timeline.plans",
      type: "timeline.plans",
      status: "published",
      version: 1,
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      draft: defaultTimelinePlans,
      published: defaultTimelinePlans
    }
  },
  events: []
};

function isCorruptText(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const questionMarks = (value.match(/\?/g) || []).length;
  return value.includes("�") || questionMarks >= Math.max(3, Math.floor(value.length / 3));
}

function hasCorruptText(value: unknown): boolean {
  if (isCorruptText(value)) return true;
  if (Array.isArray(value)) return value.some(hasCorruptText);
  if (value && typeof value === "object") return Object.values(value).some(hasCorruptText);
  return false;
}

function repairEntryIfCorrupt(store: ContentStore, key: string) {
  const current = store.entries[key];
  const fallback = defaultStore.entries[key];

  if (!current || !fallback) return false;

  if (!hasCorruptText(current.draft) && !hasCorruptText(current.published)) {
    return false;
  }

  store.entries[key] = {
    ...current,
    status: "published",
    draft: fallback.draft,
    published: fallback.published,
    version: current.version + 1,
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString()
  };
  return true;
}

function repairSubmissionAndTodoEntries(store: ContentStore) {
  let changed = false;
  for (const key of ["screenings.todo", "screenings.sourceSubmissions", "feedback.submissions"]) {
    changed = repairEntryIfCorrupt(store, key) || changed;
  }

  return changed;
}

const screeningDefaultKeys = [
  "screenings.next",
  "screenings.todo",
  "screenings.schedule",
  "screenings.classics",
  "screenings.anime",
  "screenings.stats",
  "screenings.library",
  "screenings.sourceSubmissions"
];

const screeningHistoryDefaultKeys = [
  "screenings.schedule",
  "screenings.classics",
  "screenings.anime",
  "screenings.stats",
  "screenings.library"
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function refreshEntryFromDefault(store: ContentStore, key: string) {
  const fallback = defaultStore.entries[key];
  if (!fallback) return false;

  const current = store.entries[key];
  const now = new Date().toISOString();
  const preserveCustomLibrary = key === "screenings.library" && current;
  const draft = preserveCustomLibrary ? mergeLibraryWithCurrentCustomItems(fallback.draft, current.draft) : fallback.draft;
  const published = preserveCustomLibrary ? mergeLibraryWithCurrentCustomItems(fallback.published, current.published) : fallback.published;

  store.entries[key] = {
    ...(current || fallback),
    key: fallback.key,
    type: fallback.type,
    status: "published",
    draft,
    published,
    version: (current?.version || fallback.version) + 1,
    updatedAt: now,
    publishedAt: now
  };

  return true;
}

function mergeLibraryWithCurrentCustomItems(fallbackValue: unknown, currentValue: unknown) {
  const fallback = normalizeLibraryContent(fallbackValue);
  const current = normalizeLibraryContent(currentValue);
  const fallbackIds = new Set(fallback.items.map((item) => item.id));
  const fallbackTitles = new Set(fallback.items.map((item) => item.title.trim().toLowerCase()));
  const customItems = current.items.filter((item) => {
    const title = item.title.trim().toLowerCase();
    return !fallbackIds.has(item.id) && !fallbackTitles.has(title);
  });

  return {
    ...fallback,
    tags: Array.from(new Set([...fallback.tags, ...current.tags, ...customItems.flatMap((item) => item.tags)])),
    items: [...customItems, ...fallback.items]
  };
}

function hasLegacyScreeningPlaceholders(store: ContentStore) {
  const next = store.entries["screenings.next"]?.published;
  const stats = store.entries["screenings.stats"]?.published;
  const anime = store.entries["screenings.anime"]?.published;
  const library = store.entries["screenings.library"]?.published;

  const nextMovies = isRecord(next) && Array.isArray(next.movies) ? next.movies : [];
  const legacyMovieTitles = new Set(["雷锋的故事", "逐梦演艺圈", "纯洁心灵·逐梦演艺圈"]);
  const legacyMovieIds = new Set(["leifeng-story", "chasing-dream", "spiritual-purity"]);
  const hasLegacyNextMovie = nextMovies.some((movie) => {
    if (!isRecord(movie)) return false;
    return legacyMovieTitles.has(String(movie.title || "")) || legacyMovieIds.has(String(movie.id || ""));
  });

  const hasLegacyStats = isRecord(stats) && stats.totalMovies === 128;
  const tierList = isRecord(anime) && Array.isArray(anime.tierList) ? anime.tierList : [];
  const hasLegacyPoster = tierList.some((row) => {
    if (!isRecord(row) || !Array.isArray(row.posters)) return false;
    return row.posters.some((poster) => String(poster).includes("picsum.photos"));
  });

  const libraryItems = isRecord(library) && Array.isArray(library.items) ? library.items : [];
  const hasLegacyLibrary = libraryItems.length === 1 && isRecord(libraryItems[0]) && libraryItems[0].id === "transformers-age-of-extinction-2026-05-24";

  return hasLegacyNextMovie || hasLegacyStats || hasLegacyPoster || hasLegacyLibrary;
}

function refreshLegacyScreeningDefaults(store: ContentStore) {
  if (!hasLegacyScreeningPlaceholders(store)) return false;

  let changed = false;
  for (const key of screeningDefaultKeys) {
    changed = refreshEntryFromDefault(store, key) || changed;
  }

  return changed;
}

function hasOutdatedScreeningHistoryDefaults(store: ContentStore) {
  const schedule = store.entries["screenings.schedule"]?.published;
  const library = store.entries["screenings.library"]?.published;
  const defaultSchedule = defaultStore.entries["screenings.schedule"]?.published;
  const defaultLibrary = defaultStore.entries["screenings.library"]?.published;

  const weeks = isRecord(schedule) && Array.isArray(schedule.weeks) ? schedule.weeks : [];
  const libraryItems = isRecord(library) && Array.isArray(library.items) ? library.items : [];
  const defaultWeeks = isRecord(defaultSchedule) && Array.isArray(defaultSchedule.weeks) ? defaultSchedule.weeks : [];
  const defaultLibraryItems = isRecord(defaultLibrary) && Array.isArray(defaultLibrary.items) ? defaultLibrary.items : [];
  const currentSourceHash = isRecord(schedule) && typeof schedule.sourceHash === "string" ? schedule.sourceHash : "";
  const defaultSourceHash = isRecord(defaultSchedule) && typeof defaultSchedule.sourceHash === "string" ? defaultSchedule.sourceHash : "";

  if (defaultWeeks.length < 20 || defaultLibraryItems.length < 50) return false;

  const hasImportedHistoryStart = weeks.some((week) => isRecord(week) && week.date === "2022-01-22");
  const hasImportedHistoryLatest = weeks.some((week) => isRecord(week) && week.date === "2026-05-24");

  return Boolean(defaultSourceHash && currentSourceHash !== defaultSourceHash) ||
    weeks.length < defaultWeeks.length ||
    libraryItems.length < defaultLibraryItems.length ||
    !hasImportedHistoryStart ||
    !hasImportedHistoryLatest;
}

function refreshImportedScreeningHistoryDefaults(store: ContentStore) {
  if (!hasOutdatedScreeningHistoryDefaults(store)) return false;

  let changed = false;
  for (const key of screeningHistoryDefaultKeys) {
    changed = refreshEntryFromDefault(store, key) || changed;
  }

  return changed;
}

function slugifyTitle(value: string) {
  const ascii = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (ascii) return ascii;

  let hash = 0;
  for (const char of value) {
    hash = ((hash << 5) - hash + char.charCodeAt(0)) | 0;
  }
  return `source-${Math.abs(hash)}`;
}

function normalizeBilibiliUrl(value?: string) {
  if (!value) return undefined;
  const match = value.match(/https?:\/\/(?:www\.)?bilibili\.com\/[^\s，。、《》)）]+/i);
  if (!match) return undefined;
  return match[0].replace(/&amp;/g, "&");
}

function extractTitle(value = "") {
  const bracketTitle = value.match(/《([^》]+)》/);
  if (bracketTitle?.[1]) return bracketTitle[1].trim();

  return value
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[（(][^)）]*[)）]/g, "")
    .replace(/^\d{4}[.\-/年]\d{1,2}(?:[.\-/月]\d{1,2}日?)?/, "")
    .trim();
}

function inferSourceType(title: string, requested?: MediaScrapeRequest["mediaType"]): ScreeningSourceItem["type"] {
  if (requested && requested !== "auto") return requested;
  if (/动画|动漫|剧场版|番|OVA|anime|碧蓝之海|迷家|链锯人|电锯人|咒术|鬼灭|进击|葬送|孤独摇滚|辉夜姬|白箱|甘城|路人女主|浪客剑心/i.test(title)) return "anime";
  return "movie";
}

function inferSourceCategory(title: string, rating?: number): ScreeningSourceItem["category"] {
  if (/动画|动漫|剧场版|番|OVA|碧蓝之海|迷家|链锯人|电锯人|咒术|鬼灭|进击|葬送|孤独摇滚|辉夜姬|白箱|甘城|路人女主|浪客剑心/i.test(title)) return "anime";
  if (rating !== undefined && rating >= 8) return "classic";
  if ((rating !== undefined && rating < 6) || /鲨|夺命|环大西洋|富春山居图|749局|蒸发太平洋|冰封|孤岛惊魂/i.test(title)) return "bad";
  return "good";
}

function parseRating(value = "") {
  const match = value.match(/[（(]([0-9](?:\.\d)?|10(?:\.0)?)分?[)）]/);
  return match ? Number(match[1]) : undefined;
}

function decodeHtml(value = "") {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function extractMetaContent(html: string, name: string) {
  const metaTags = html.match(/<meta\s+[^>]*>/gi) || [];

  for (const tag of metaTags) {
    const property = tag.match(/(?:property|name)=["']([^"']+)["']/i)?.[1];
    if (property !== name) continue;

    const content = tag.match(/content=["']([^"']+)["']/i)?.[1];
    if (content) return decodeHtml(content);
  }

  return undefined;
}

function cleanBilibiliTitle(value?: string) {
  if (!value) return undefined;
  return decodeHtml(value)
    .replace(/_哔哩哔哩_bilibili$/i, "")
    .replace(/ - 哔哩哔哩$/i, "")
    .replace(/^《([^》]+)》.*$/, "$1")
    .trim();
}

async function fetchText(url: string, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      }
    });
    if (!response.ok) return undefined;
    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

async function scrapeBilibiliCandidate(request: MediaScrapeRequest): Promise<MediaScrapeCandidate | undefined> {
  const sourceUrl = normalizeBilibiliUrl(request.sourceUrl || request.query);
  if (!sourceUrl) return undefined;

  const local = buildLocalCandidate(request);
  const html = await fetchText(sourceUrl).catch(() => undefined);
  if (!html) return { ...local, provider: "bilibili", confidence: 0.72 };

  const pageTitle = cleanBilibiliTitle(extractMetaContent(html, "og:title") || html.match(/<title>([^<]+)<\/title>/i)?.[1]);
  const title = extractTitle(request.query || "") || pageTitle || local.title;
  const rating = parseRating(request.query || "") || local.rating;
  const type = inferSourceType(title, request.mediaType);
  const category = inferSourceCategory(title, rating);
  const posterUrl = (extractMetaContent(html, "og:image") || local.posterUrl)?.replace(/^\/\//, "https://");
  const description = extractMetaContent(html, "og:description") || extractMetaContent(html, "description") || local.description;

  return {
    ...local,
    id: slugifyTitle(title + "-" + sourceUrl),
    title,
    type,
    category,
    rating,
    posterUrl,
    description,
    tags: Array.from(new Set([type === "anime" ? "动画" : "电影", "Bilibili", "自动抓取"])),
    sourceUrl,
    sourceNote: "已自动抓取 Bilibili 页面元数据，前台仅外跳播放。",
    provider: "bilibili",
    confidence: 0.9
  };
}

function buildLocalCandidate(request: MediaScrapeRequest): MediaScrapeCandidate {
  const raw = `${request.query || ""} ${request.sourceUrl || ""}`.trim();
  const title = extractTitle(raw) || "未命名片源";
  const rating = parseRating(raw);
  const sourceUrl = normalizeBilibiliUrl(request.sourceUrl || request.query);
  const type = inferSourceType(title, request.mediaType);
  const category = inferSourceCategory(title, rating);
  const today = new Date().toISOString().slice(0, 10);

  return {
    id: slugifyTitle(`${title}-${Date.now()}`),
    title,
    type,
    category,
    rating,
    description: sourceUrl
      ? `从 Bilibili 播放链接解析生成的${type === "anime" ? "动漫" : "电影"}片源。`
      : `从搜索关键词生成的${type === "anime" ? "动漫" : "电影"}片源，待补充播放链接。`,
    tags: Array.from(new Set([type === "anime" ? "动画" : "电影", "待整理", sourceUrl ? "Bilibili" : "元数据搜索"])),
    sourceUrl,
    sourceNote: sourceUrl ? "Bilibili 外跳播放链接，前台不内置播放器。" : undefined,
    status: "available",
    priority: category === "bad" || category === "classic" ? "high" : "normal",
    timesWatched: 0,
    addedAt: today,
    provider: sourceUrl ? "bilibili" : "local",
    confidence: sourceUrl ? 0.78 : 0.52
  };
}

function tmdbFetchOptions(url: URL, token: string): RequestInit {
  const headers: Record<string, string> = { Accept: "application/json" };

  // TMDB v3 API keys use the api_key query parameter; v4 read tokens use Bearer auth.
  if (token.startsWith("eyJ") || token.split(".").length >= 3) {
    headers.Authorization = `Bearer ${token}`;
  } else {
    url.searchParams.set("api_key", token);
  }

  return { headers };
}

const allMediaProviders: MediaScrapeProvider[] = ["tmdb", "bangumi", "douban", "bilibili", "jikan", "wiki", "local"];

function normalizeMediaProviders(value: unknown, fallback: MediaScrapeProvider[] = allMediaProviders) {
  if (!Array.isArray(value) || value.length === 0) return fallback;
  const providers = value
    .map((item) => String(item).trim().toLowerCase())
    .filter((item): item is MediaScrapeProvider => allMediaProviders.includes(item as MediaScrapeProvider));
  return providers.length ? Array.from(new Set(providers)) : fallback;
}

function providerEnabled(request: MediaScrapeRequest, provider: MediaScrapeProvider) {
  return normalizeMediaProviders(request.providers).includes(provider);
}

const RPDB_BASE = "https://openposterdb.com/t0-free-rpdb";
const RPDB_OPTIONS = "imageSize=large&ratings_limit=3&badge_shape=r";

function extractImdbId(text: string): string | undefined {
  const match = text.match(/\btt\d{5,10}\b/i);
  return match ? match[0] : undefined;
}

function extractTmdbMovieId(text: string): string | undefined {
  const match = text.match(/\bmovie-(\d+)\b/i) || text.match(/tmdb[=/](\d+)/i);
  return match ? match[1] : undefined;
}

function buildPosterDbUrl(idType: "imdb" | "tmdb", idValue: string) {
  return `${RPDB_BASE}/${idType}/poster-default/${idValue}.jpg?${RPDB_OPTIONS}`;
}

async function scrapePosterDbCandidates(request: MediaScrapeRequest): Promise<MediaScrapeCandidate[]> {
  const local = buildLocalCandidate(request);
  const raw = request.sourceUrl || request.query || "";

  const imdbId = extractImdbId(raw);
  if (imdbId) {
    return [{
      ...local,
      provider: "posterdb",
      confidence: 0.95,
      posterUrl: buildPosterDbUrl("imdb", imdbId),
      sourceUrl: `https://www.imdb.com/title/${imdbId}`
    }];
  }

  const tmdbId = extractTmdbMovieId(raw);
  if (tmdbId) {
    return [{
      ...local,
      provider: "posterdb",
      confidence: 0.95,
      posterUrl: buildPosterDbUrl("tmdb", `movie-${tmdbId}`),
    }];
  }

  return [];
}

async function fetchTmdbJson(pathname: string, settings: MediaScraperSettings, params: Record<string, string | undefined>) {
  const token = settings.tmdbApiKey || runtimeConfig.tmdbApiKey;
  if (!token) throw new TmdbRequestError("TMDB API Key 未配置");

  const apiBase = normalizedUrl(settings.tmdbApiBase || runtimeConfig.tmdbApiBase, runtimeConfig.tmdbApiBase);
  const url = new URL(`${apiBase}/${pathname.replace(/^\/+/, "")}`);
  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value);
  }

  let response: Response;
  try {
    response = await fetch(url, tmdbFetchOptions(url, token));
  } catch (error) {
    throw new TmdbRequestError(error instanceof Error ? `TMDB 网络请求失败：${error.message}` : "TMDB 网络请求失败");
  }
  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new TmdbRequestError(`TMDB 请求失败 ${response.status}${message ? `：${message.slice(0, 180)}` : ""}`, response.status);
  }
  return await response.json() as Record<string, unknown>;
}

function tmdbPosterUrl(value: unknown) {
  return typeof value === "string" && value ? `https://image.tmdb.org/t/p/w500${value}` : undefined;
}

function tmdbRuntimeLabel(endpoint: "movie" | "tv", details: Record<string, unknown> | undefined) {
  if (!details) return undefined;
  if (endpoint === "movie" && typeof details.runtime === "number" && details.runtime > 0) return `${details.runtime} 分钟`;
  const episodeRuntime = Array.isArray(details.episode_run_time) ? details.episode_run_time.find((value) => typeof value === "number" && value > 0) : undefined;
  if (typeof episodeRuntime === "number") return `单集 ${episodeRuntime} 分钟`;
  if (typeof details.number_of_episodes === "number" && details.number_of_episodes > 0) return `${details.number_of_episodes} 集`;
  return undefined;
}

function tmdbGenreTags(details: Record<string, unknown> | undefined) {
  const genres = Array.isArray(details?.genres) ? details?.genres : [];
  return genres
    .map((genre) => isRecord(genre) ? trimText(genre.name, 30) : "")
    .filter(Boolean)
    .slice(0, 4);
}


async function suggestEnglishMovieQueries(query: string) {
  const settings = await loadAiCoreSettings().catch(() => undefined);
  if (!settings?.apiKey || !hasCjkText(query)) return [];

  try {
    const response = await fetch(`${settings.baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${settings.apiKey}`
      },
      body: JSON.stringify({
        model: settings.model,
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "Return JSON only. Translate a Chinese movie title/search query into 1-3 likely English or original movie titles. No explanations." },
          { role: "user", content: JSON.stringify({ query, schema: { queries: ["English/original title"] } }) }
        ]
      })
    });
    if (!response.ok) return [];
    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const content = data.choices?.[0]?.message?.content || "";
    const parsed = JSON.parse(content.match(/\{[\s\S]*\}/)?.[0] || "{}") as { queries?: unknown };
    return Array.isArray(parsed.queries) ? parsed.queries.map((item) => trimText(item, 80)).filter(Boolean).slice(0, 3) : [];
  } catch {
    return [];
  }
}

async function searchTmdbEndpointCandidates(request: MediaScrapeRequest, settings: MediaScraperSettings, query: string, endpoint: "movie" | "tv", language: string): Promise<MediaScrapeCandidate[]> {
  const data = await fetchTmdbJson(`search/${endpoint}`, settings, {
    query,
    language,
    include_adult: "false"
  }) as { results?: Array<Record<string, unknown>> } | undefined;
  const sourceUrl = normalizeBilibiliUrl(request.sourceUrl || request.query);
  const today = new Date().toISOString().slice(0, 10);

  return (data?.results || []).slice(0, 6).map((item, index) => {
    const title = String(item.title || item.name || query);
    const originalTitle = String(item.original_title || item.original_name || "") || undefined;
    const releaseDate = String(item.release_date || item.first_air_date || "");
    const rating = typeof item.vote_average === "number" ? Number(item.vote_average.toFixed(1)) : undefined;
    const type = endpoint === "tv" ? inferSourceType(title, "series") : inferSourceType(title, request.mediaType);
    const category = endpoint === "tv" && type === "anime" ? "anime" : inferSourceCategory(title, rating);
    const posterUrl = tmdbPosterUrl(item.poster_path);
    const confidence = Math.max(
      titleMatchConfidence(query, title, 0.66),
      originalTitle ? titleMatchConfidence(query, originalTitle, 0.66) : 0.66,
      0.94 - index * 0.07 - (endpoint === "tv" ? 0.03 : 0)
    );

    return {
      id: slugifyTitle(`${title}-${releaseDate || item.id || index}`),
      providerId: item.id ? `tmdb_${endpoint}_${item.id}` : undefined,
      title,
      originalTitle,
      type,
      category,
      year: releaseDate ? releaseDate.slice(0, 4) : undefined,
      rating,
      posterUrl,
      description: String(item.overview || "从 TMDB 搜索结果抓取的元数据，播放仍通过 Bilibili 链接外跳。"),
      tags: Array.from(new Set([type === "anime" ? "动画" : endpoint === "tv" ? "剧集" : "电影", "TMDB", sourceUrl ? "Bilibili" : "待补链接"])),
      sourceUrl,
      sourceNote: sourceUrl ? "Bilibili 外跳播放链接，前台不内置播放器。" : "元数据来自 TMDB，播放链接待补。",
      status: "available" as const,
      priority: category === "classic" || category === "bad" ? "high" as const : "normal" as const,
      timesWatched: 0,
      addedAt: today,
      provider: "tmdb" as const,
      confidence,
      aliases: [originalTitle, title].filter((value): value is string => Boolean(value))
    };
  });
}

async function enrichTmdbCandidate(candidate: MediaScrapeCandidate, settings: MediaScraperSettings) {
  const match = candidate.providerId?.match(/^tmdb_(movie|tv)_(.+)$/);
  if (!match) return candidate;
  const endpoint = match[1] as "movie" | "tv";
  const id = match[2];
  const details = await fetchTmdbJson(`${endpoint}/${id}`, settings, { language: "zh-CN" }).catch(() => undefined);
  if (!details) return candidate;

  return {
    ...candidate,
    duration: candidate.duration || tmdbRuntimeLabel(endpoint, details),
    posterUrl: candidate.posterUrl || tmdbPosterUrl(details.poster_path),
    description: trimText(details.overview, 1400) || candidate.description,
    tags: Array.from(new Set([...candidate.tags, ...tmdbGenreTags(details)]))
  };
}

async function searchTmdbCandidatesEnhanced(request: MediaScrapeRequest, settings: MediaScraperSettings): Promise<MediaScrapeCandidate[]> {
  if (!settings.tmdbApiKey && !runtimeConfig.tmdbApiKey) return [];
  const query = extractTitle(request.query || "");
  if (!query) return [];

  const endpoints: Array<"movie" | "tv"> = request.mediaType === "movie"
    ? ["movie"]
    : request.mediaType === "anime" || request.mediaType === "ova" || request.mediaType === "series"
      ? ["tv"]
      : ["movie", "tv"];
  const querySet = new Set([query]);

  if (hasCjkText(query)) {
    const doubanAliases = await searchDoubanCandidates({ ...request, providers: ["douban"] }).catch(() => []);
    for (const candidate of doubanAliases.slice(0, 3)) {
      for (const alias of [candidate.originalTitle, ...(candidate.aliases || [])]) {
        if (alias) querySet.add(alias);
      }
    }
    for (const translated of await suggestEnglishMovieQueries(query)) querySet.add(translated);
  }

  const collected: MediaScrapeCandidate[] = [];
  const errors: string[] = [];
  for (const searchQuery of Array.from(querySet).slice(0, 6)) {
    for (const endpoint of endpoints) {
      for (const language of ["zh-CN", "en-US"]) {
        try {
          collected.push(...await searchTmdbEndpointCandidates(request, settings, searchQuery, endpoint, language));
        } catch (error) {
          errors.push(error instanceof Error ? error.message : "TMDB 搜索失败");
        }
      }
    }
  }

  if (collected.length === 0 && errors.length > 0) {
    throw new TmdbRequestError(Array.from(new Set(errors)).slice(0, 2).join("；"));
  }

  const byKey = new Map<string, MediaScrapeCandidate>();
  for (const candidate of collected) {
    const key = candidate.providerId || `${candidate.title}-${candidate.year || ""}`.toLowerCase();
    const existing = byKey.get(key);
    if (!existing || candidate.confidence > existing.confidence || (!existing.posterUrl && candidate.posterUrl)) byKey.set(key, candidate);
  }

  const enriched: MediaScrapeCandidate[] = [];
  for (const candidate of Array.from(byKey.values()).sort((a, b) => b.confidence - a.confidence).slice(0, 8)) {
    enriched.push(await enrichTmdbCandidate(candidate, settings).catch(() => candidate));
  }
  return enriched;
}

function shouldSearchAnimeMetadata(query: string, mediaType?: MediaScrapeRequest["mediaType"]) {
  return !mediaType || mediaType === "auto" || mediaType === "anime" || mediaType === "ova" || mediaType === "series" || inferSourceType(query, mediaType) === "anime";
}

function hasCjkText(value: string) {
  return /[\u3400-\u9fff]/.test(value);
}

function titleMatchConfidence(query: string, title: string, fallback: number) {
  const normalizedQuery = query.trim().toLowerCase();
  const normalizedTitle = title.trim().toLowerCase();

  if (!normalizedQuery || !normalizedTitle) return fallback;
  if (normalizedTitle === normalizedQuery) return 0.99;
  if (normalizedTitle.startsWith(normalizedQuery)) return Math.max(fallback, 0.95 - Math.min(0.16, (normalizedTitle.length - normalizedQuery.length) * 0.01));
  if (normalizedTitle.includes(normalizedQuery)) return Math.max(fallback, 0.9 - Math.min(0.18, (normalizedTitle.length - normalizedQuery.length) * 0.008));
  if (normalizedQuery.includes(normalizedTitle)) return Math.max(fallback, 0.86);

  return fallback;
}

function rewriteBangumiImageUrl(value: string | undefined, settings: MediaScraperSettings) {
  if (!value) return undefined;
  const normalized = value.replace(/^http:/, "https:");
  if (!settings.bangumiImageBase) return normalized;
  return normalized.replace(/^https:\/\/lain\.bgm\.tv/i, settings.bangumiImageBase.replace(/\/$/, ""));
}

async function searchBangumiCandidates(request: MediaScrapeRequest, settings: MediaScraperSettings): Promise<MediaScrapeCandidate[]> {
  const query = extractTitle(request.query || "");
  if (!query || !shouldSearchAnimeMetadata(query, request.mediaType)) return [];

  const sourceUrl = normalizeBilibiliUrl(request.sourceUrl || request.query);
  const bangumiApiBase = (settings.bangumiApiBase || defaultMediaScraperSettings.bangumiApiBase).replace(/\/$/, "");
  const url = new URL(`${bangumiApiBase}/search/subject/${encodeURIComponent(query)}`);
  url.searchParams.set("type", "2");
  url.searchParams.set("responseGroup", "large");
  url.searchParams.set("max_results", "6");

  const response = await fetch(url, {
    headers: {
      "User-Agent": "KiloScraper/1.0 (local metadata manager)",
      Accept: "application/json"
    }
  });

  if (!response.ok) return [];

  const data = await response.json() as { list?: Array<Record<string, unknown>> };
  const today = new Date().toISOString().slice(0, 10);

  return (data.list || []).slice(0, 6).map((item, index) => {
    const images = item.images as { large?: string; common?: string; medium?: string } | undefined;
    const ratingData = item.rating as { score?: number } | undefined;
    const title = String(item.name_cn || item.name || query);
    const subjectId = item.id === undefined || item.id === null ? "" : String(item.id);
    const originalTitle = String(item.name || "") || undefined;
    const airDate = String(item.air_date || "");
    const rating = typeof ratingData?.score === "number" ? Number(ratingData.score.toFixed(1)) : undefined;
    const posterUrl = images?.large || images?.common || images?.medium;
    const episodes = typeof item.eps === "number" ? item.eps : undefined;

    const confidence = Math.max(
      titleMatchConfidence(query, title, 0.72),
      originalTitle ? titleMatchConfidence(query, originalTitle, 0.72) : 0.72,
      0.94 - index * 0.06
    );

    return {
      id: slugifyTitle(`${title}-${airDate || index}`),
      providerId: subjectId ? `bangumi_${subjectId}` : undefined,
      title,
      originalTitle: originalTitle === title ? undefined : originalTitle,
      type: "anime" as const,
      category: "anime" as const,
      year: airDate && !airDate.startsWith("0000") ? airDate.slice(0, 4) : undefined,
      duration: episodes ? `${episodes} 集` : undefined,
      rating,
      posterUrl: rewriteBangumiImageUrl(posterUrl, settings),
      description: String(item.summary || "从 Bangumi 中文动漫资料库自动抓取的元数据，播放仍通过 Bilibili 链接外跳。"),
      tags: Array.from(new Set(["动画", "Bangumi", sourceUrl ? "Bilibili" : "待补链接"])),
      sourceUrl,
      sourceNote: sourceUrl ? "Bilibili 外跳播放链接，前台不内置播放器。" : undefined,
      status: "available" as const,
      priority: rating !== undefined && rating >= 8 ? "high" as const : "normal" as const,
      timesWatched: 0,
      addedAt: today,
      provider: "bangumi" as const,
      confidence
    };
  });
}

async function searchWikiCandidates(request: MediaScrapeRequest): Promise<MediaScrapeCandidate[]> {
  const query = extractTitle(request.query || "");
  if (!query) return [];

  const sourceUrl = normalizeBilibiliUrl(request.sourceUrl || request.query);
  const searchUrl = new URL("https://zh.wikipedia.org/w/api.php");
  searchUrl.searchParams.set("origin", "*");
  searchUrl.searchParams.set("action", "query");
  searchUrl.searchParams.set("format", "json");
  searchUrl.searchParams.set("generator", "search");
  searchUrl.searchParams.set("gsrsearch", query);
  searchUrl.searchParams.set("gsrlimit", "4");
  searchUrl.searchParams.set("prop", "pageimages|extracts");
  searchUrl.searchParams.set("piprop", "thumbnail");
  searchUrl.searchParams.set("pithumbsize", "420");
  searchUrl.searchParams.set("exintro", "1");
  searchUrl.searchParams.set("explaintext", "1");

  const response = await fetch(searchUrl, { headers: { Accept: "application/json" } });
  if (!response.ok) return [];

  const data = await response.json() as { query?: { pages?: Record<string, Record<string, unknown>> } };
  const pages = Object.values(data.query?.pages || {});
  const today = new Date().toISOString().slice(0, 10);

  return pages.slice(0, 4).map((page, index) => {
    const title = String(page.title || query);
    const thumbnail = page.thumbnail as { source?: string } | undefined;
    const type = inferSourceType(title, request.mediaType);
    const category = inferSourceCategory(title);

    return {
      id: slugifyTitle(`${title}-wiki-${index}`),
      title,
      type,
      category,
      posterUrl: thumbnail?.source,
      description: String(page.extract || "从中文维基百科自动抓取的条目摘要，播放仍通过 Bilibili 链接外跳。"),
      tags: Array.from(new Set([type === "anime" ? "动画" : "电影", "Wikipedia", sourceUrl ? "Bilibili" : "待补链接"])),
      sourceUrl,
      sourceNote: sourceUrl ? "Bilibili 外跳播放链接，前台不内置播放器。" : undefined,
      status: "available" as const,
      priority: "normal" as const,
      timesWatched: 0,
      addedAt: today,
      provider: "wiki" as const,
      confidence: Math.max(0.56, 0.74 - index * 0.06)
    };
  });
}

async function searchJikanCandidates(request: MediaScrapeRequest): Promise<MediaScrapeCandidate[]> {
  const query = extractTitle(request.query || "");
  if (!query || !shouldSearchAnimeMetadata(query, request.mediaType)) return [];
  if (hasCjkText(query)) return [];

  const sourceUrl = normalizeBilibiliUrl(request.sourceUrl || request.query);
  const url = new URL("https://api.jikan.moe/v4/anime");
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "6");
  url.searchParams.set("sfw", "true");

  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) return [];

  const data = await response.json() as { data?: Array<Record<string, unknown>> };
  const today = new Date().toISOString().slice(0, 10);

  return (data.data || []).slice(0, 6).map((item, index) => {
    const title = String(item.title_japanese || item.title || query);
    const originalTitle = String(item.title || "") || undefined;
    const year = typeof item.year === "number" ? String(item.year) : undefined;
    const rating = typeof item.score === "number" ? Number(item.score.toFixed(1)) : undefined;
    const images = item.images as { jpg?: { image_url?: string; large_image_url?: string } } | undefined;

    return {
      id: slugifyTitle(`${title}-${year || index}`),
      title,
      originalTitle: originalTitle === title ? undefined : originalTitle,
      type: "anime" as const,
      category: "anime" as const,
      year,
      rating,
      posterUrl: images?.jpg?.large_image_url || images?.jpg?.image_url,
      description: String(item.synopsis || "从 Jikan 动漫资料库自动抓取的动漫元数据，播放仍通过 Bilibili 链接外跳。"),
      tags: Array.from(new Set(["动画", "Jikan", sourceUrl ? "Bilibili" : "待补链接"])),
      sourceUrl,
      sourceNote: sourceUrl ? "Bilibili 外跳播放链接，前台不内置播放器。" : undefined,
      status: "available" as const,
      priority: rating !== undefined && rating >= 8 ? "high" as const : "normal" as const,
      timesWatched: 0,
      addedAt: today,
      provider: "jikan" as const,
      confidence: Math.max(0.66, 0.88 - index * 0.07)
    };
  });
}

function publicApiBaseUrl() {
  return (runtimeConfig.objectStoragePublicBaseUrl || runtimeConfig.corsOrigins[0] || `http://localhost:${runtimeConfig.port}`).replace(/\/$/, "");
}

function proxiedDoubanImageUrl(value?: string) {
  if (!value) return undefined;
  try {
    const url = new URL(value.replace(/^\/\//, "https://"));
    if (!/doubanio\.com$/i.test(url.hostname) && !/douban\.com$/i.test(url.hostname)) return value;
    return `${publicApiBaseUrl()}/api/public/image-proxy?url=${encodeURIComponent(url.toString())}`;
  } catch {
    return value;
  }
}

function extractFirstMatch(value: string, pattern: RegExp) {
  return decodeHtml(value.match(pattern)?.[1] || "").trim() || undefined;
}

function stripHtml(value = "") {
  return decodeHtml(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ")).trim();
}

function extractDoubanInfoValue(html: string, label: string) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return extractFirstMatch(html, new RegExp(`${escaped}:\\s*([^<\\n]+)`, "i"));
}

function doubanCandidateFromHtml(html: string, query: string, sourceUrl?: string): MediaScrapeCandidate | undefined {
  const subjectUrl = extractFirstMatch(html, /href=["'](https:\/\/movie\.douban\.com\/subject\/\d+\/?)["']/i) || sourceUrl;
  const subjectId = subjectUrl?.match(/subject\/(\d+)/)?.[1];
  const title = extractFirstMatch(html, /property=["']v:itemreviewed["'][^>]*>([^<]+)/i)
    || extractFirstMatch(html, /<title>([^<]+)/i)?.replace(/\(豆瓣\).*$/i, "").trim()
    || query;
  const originalTitle = extractDoubanInfoValue(html, "原名") || extractDoubanInfoValue(html, "又名")?.split("/")[0]?.trim();
  const aliases = [
    originalTitle,
    ...(extractDoubanInfoValue(html, "又名") || "").split("/").map((item) => item.trim())
  ].filter(Boolean);
  const year = extractFirstMatch(html, /<span class=["']year["']>\((\d{4})\)<\/span>/i) || extractFirstMatch(html, /(\d{4})/);
  const ratingRaw = extractFirstMatch(html, /rating_num[^>]*>([\d.]+)/i);
  const rating = ratingRaw ? Number(ratingRaw) : undefined;
  const poster = extractFirstMatch(html, /<img[^>]+src=["']([^"']+)["'][^>]*(?:rel=["']v:image["']|alt=)/i)
    || extractFirstMatch(html, /rel=["']v:image["'][^>]+src=["']([^"']+)["']/i);
  const summary = extractFirstMatch(html, /property=["']v:summary["'][^>]*>([\s\S]*?)<\/span>/i);
  const sourceNote = subjectUrl ? `豆瓣条目：${subjectUrl}` : "豆瓣公开页面抓取的中文兜底元数据。";
  const type = inferSourceType(title, "movie");
  const category = inferSourceCategory(title, rating);
  const today = new Date().toISOString().slice(0, 10);

  return {
    id: slugifyTitle(`${title}-${subjectId || year || Date.now()}`),
    providerId: subjectId ? `douban_${subjectId}` : undefined,
    title,
    originalTitle,
    type,
    category,
    year,
    rating,
    posterUrl: proxiedDoubanImageUrl(poster),
    description: summary ? stripHtml(summary) : "从豆瓣公开页面抓取的中文电影资料。",
    tags: Array.from(new Set(["电影", "豆瓣", "中文资料"])),
    sourceUrl,
    sourceNote,
    status: "available" as const,
    priority: rating !== undefined && rating >= 8 ? "high" as const : "normal" as const,
    timesWatched: 0,
    addedAt: today,
    provider: "douban" as const,
    confidence: Math.max(0.62, titleMatchConfidence(query, title, 0.72)),
    aliases: aliases.slice(0, 8)
  };
}

async function fetchDoubanSubjectCandidate(subjectUrl: string, query: string, sourceUrl?: string) {
  const html = await fetchText(subjectUrl, 9000).catch(() => undefined);
  return html ? doubanCandidateFromHtml(html, query, sourceUrl) : undefined;
}

async function searchDoubanCandidates(request: MediaScrapeRequest): Promise<MediaScrapeCandidate[]> {
  const query = extractTitle(request.query || "");
  if (!query || request.mediaType === "anime" || request.mediaType === "ova") return [];

  const searchUrl = new URL("https://www.douban.com/search");
  searchUrl.searchParams.set("cat", "1002");
  searchUrl.searchParams.set("q", query);
  const html = await fetchText(searchUrl.toString(), 9000).catch(() => undefined);
  if (!html) return [];

  const subjectUrls = Array.from(html.matchAll(/https:\/\/movie\.douban\.com\/subject\/\d+\/?/gi))
    .map((match) => match[0])
    .filter((value, index, array) => array.indexOf(value) === index)
    .slice(0, 5);

  const candidates: MediaScrapeCandidate[] = [];
  for (const subjectUrl of subjectUrls) {
    const candidate = await fetchDoubanSubjectCandidate(subjectUrl, query, normalizeBilibiliUrl(request.sourceUrl || request.query)).catch(() => undefined);
    if (candidate) candidates.push(candidate);
  }

  return candidates.sort((a, b) => b.confidence - a.confidence);
}

async function scrapeMediaCandidatesDetailed(request: MediaScrapeRequest) {
  const settings = await loadMediaScraperSettings();
  const local = buildLocalCandidate(request);
  const providers = normalizeMediaProviders(request.providers);
  const warnings: string[] = [];
  const bilibili = providerEnabled(request, "bilibili") ? await scrapeBilibiliCandidate(request).catch(() => undefined) : undefined;
  const posterdb = providerEnabled(request, "posterdb") ? (await scrapePosterDbCandidates(request)) : [];
  const tmdb = providerEnabled(request, "tmdb") ? await searchTmdbCandidatesEnhanced(request, settings).catch((error) => {
    warnings.push(error instanceof Error ? `TMDB 搜索失败：${error.message}` : "TMDB 搜索失败");
    return [];
  }) : [];
  const bangumi = providerEnabled(request, "bangumi") ? await searchBangumiCandidates(request, settings).catch((error) => {
    warnings.push(error instanceof Error ? `Bangumi 搜索失败：${error.message}` : "Bangumi 搜索失败");
    return [];
  }) : [];
  const douban = providerEnabled(request, "douban") ? await searchDoubanCandidates(request).catch((error) => {
    warnings.push(error instanceof Error ? `豆瓣搜索失败：${error.message}` : "豆瓣搜索失败");
    return [];
  }) : [];
  const jikan = providerEnabled(request, "jikan") ? await searchJikanCandidates(request).catch(() => []) : [];
  const wiki = providerEnabled(request, "wiki") ? await searchWikiCandidates(request).catch(() => []) : [];
  const byTitle = new Map<string, MediaScrapeCandidate>();

  const shouldAddLocal = providers.length === allMediaProviders.length || providers.includes("local");
  for (const candidate of [...posterdb, ...tmdb, ...bangumi, ...douban, ...jikan, ...wiki, ...(bilibili ? [bilibili] : []), ...(shouldAddLocal ? [local] : [])]) {
    const key = candidate.providerId || candidate.title.trim().toLowerCase();
    const existing = byTitle.get(key);
    if (!existing || candidate.confidence > existing.confidence || (!existing.posterUrl && candidate.posterUrl)) {
      byTitle.set(key, candidate);
    }
  }

  return { candidates: Array.from(byTitle.values()).sort((a, b) => b.confidence - a.confidence), warnings };
}

async function scrapeMediaCandidates(request: MediaScrapeRequest) {
  return (await scrapeMediaCandidatesDetailed(request)).candidates;
}

function needsAiCompletion(item: ScreeningSourceItem) {
  return !item.posterUrl || !item.description || item.description.length < 18 || item.tags.length === 0 || !item.year || item.rating === undefined || !item.sourceNote;
}

function compactCandidate(candidate: MediaScrapeCandidate) {
  return {
    provider: candidate.provider,
    title: candidate.title,
    originalTitle: candidate.originalTitle,
    type: candidate.type,
    category: candidate.category,
    year: candidate.year,
    duration: candidate.duration,
    rating: candidate.rating,
    posterUrl: candidate.posterUrl,
    description: candidate.description,
    tags: candidate.tags,
    sourceUrl: candidate.sourceUrl,
    sourceNote: candidate.sourceNote,
    confidence: candidate.confidence
  };
}

function safeJsonParse(value: string) {
  const fenced = value.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)?.[1];
  const raw = fenced || value;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error("AI response is not JSON");
  return JSON.parse(raw.slice(start, end + 1)) as Record<string, unknown>;
}

function sanitizeAiPatch(raw: unknown, item: ScreeningSourceItem, candidates: MediaScrapeCandidate[]): Partial<ScreeningSourceItem> {
  const input = isRecord(raw) ? raw : {};
  const allowedPosters = new Set(candidates.map((candidate) => candidate.posterUrl).filter((value): value is string => Boolean(value)));
  const patch: Partial<ScreeningSourceItem> = {};

  if (typeof input.originalTitle === "string" && input.originalTitle.trim()) patch.originalTitle = input.originalTitle.trim();
  if (typeof input.year === "string" && /^\d{4}$/.test(input.year.trim())) patch.year = input.year.trim();
  if (typeof input.duration === "string" && input.duration.trim()) patch.duration = input.duration.trim();
  if (typeof input.rating === "number" && input.rating >= 0 && input.rating <= 10) patch.rating = Number(input.rating.toFixed(1));
  if (typeof input.description === "string" && input.description.trim()) patch.description = input.description.trim();
  if (Array.isArray(input.tags)) patch.tags = input.tags.map((tag) => String(tag).trim()).filter(Boolean).slice(0, 8);
  if (typeof input.sourceNote === "string" && input.sourceNote.trim()) patch.sourceNote = input.sourceNote.trim();

  if (typeof input.type === "string" && ["movie", "anime", "ova", "series", "short", "other"].includes(input.type)) {
    patch.type = input.type as ScreeningSourceItem["type"];
  }
  if (typeof input.category === "string" && ["good", "bad", "classic", "anime", "topic", "other"].includes(input.category)) {
    patch.category = input.category as ScreeningSourceItem["category"];
  }

  if (typeof input.posterUrl === "string" && allowedPosters.has(input.posterUrl)) {
    patch.posterUrl = input.posterUrl;
  }

  if (patch.description === item.description) delete patch.description;
  if (patch.posterUrl === item.posterUrl) delete patch.posterUrl;
  if (patch.year === item.year) delete patch.year;
  if (patch.rating === item.rating) delete patch.rating;
  if (patch.sourceNote === item.sourceNote) delete patch.sourceNote;

  return patch;
}


function metadataPatchFromCandidates(item: ScreeningSourceItem, candidates: MediaScrapeCandidate[], overwrite = false) {
  const best = candidates.find((candidate) => candidate.provider !== "local") || candidates[0];
  if (!best) return {};
  const placeholderDescription = !item.description || item.description.length < 18 || item.description.includes("填写简介") || item.description.includes("待补");

  return sanitizeAiPatch({
    originalTitle: overwrite ? best.originalTitle || item.originalTitle : item.originalTitle || best.originalTitle,
    type: best.type,
    category: best.category,
    year: overwrite ? best.year || item.year : item.year || best.year,
    duration: overwrite ? best.duration || item.duration : item.duration || best.duration,
    rating: overwrite ? best.rating ?? item.rating : item.rating ?? best.rating,
    posterUrl: overwrite ? best.posterUrl || item.posterUrl : item.posterUrl || best.posterUrl,
    description: overwrite || placeholderDescription ? best.description : item.description,
    tags: Array.from(new Set([...item.tags, ...best.tags])),
    sourceNote: overwrite ? (item.sourceUrl ? `播放链接来自已配置的 Bilibili 外跳地址；元数据由 ${best.provider.toUpperCase()} 抓取源补全。` : best.sourceNote) : item.sourceNote || (item.sourceUrl ? "播放链接来自已配置的 Bilibili 外跳地址；元数据由 TMDB/Bangumi 等抓取源补全。" : best.sourceNote)
  }, item, candidates);
}

async function completeMediaMetadataItem(item: ScreeningSourceItem, providers?: MediaScrapeProvider[], overwrite = false): Promise<MediaAiSuggestion> {
  const candidates = await scrapeMediaCandidates({ query: item.title, sourceUrl: item.sourceUrl, mediaType: item.type, providers });
  const sourceProviders = Array.from(new Set(candidates.map((candidate) => candidate.provider)));
  const patch = metadataPatchFromCandidates(item, candidates, overwrite);
  const best = candidates.find((candidate) => candidate.provider !== "local") || candidates[0];
  const risks: string[] = [];

  if (!best || Object.keys(patch).length === 0) risks.push("没有找到可安全应用的自动补全字段");
  if (!patch.posterUrl && !item.posterUrl) risks.push("抓取源未提供可用海报");

  return {
    id: item.id,
    title: item.title,
    patch,
    confidence: best?.confidence || 0,
    reason: best ? `已根据 ${best.provider.toUpperCase()} 等真实抓取源生成元数据补全。` : "未找到匹配的元数据候选。",
    risks,
    sourceProviders
  };
}

async function callOpenAiForCompletion(item: ScreeningSourceItem, candidates: MediaScrapeCandidate[]) {
  const settings = await loadAiCoreSettings();
  const apiKey = settings.apiKey;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");

  const baseUrl = settings.baseUrl.replace(/\/$/, "");
  const model = settings.model;
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "你是放映会后台片源元数据清洗助手。只返回 JSON。不要编造 posterUrl；posterUrl 必须从候选中选择。不要修改播放链接。中文简介简洁准确。"
        },
        {
          role: "user",
          content: JSON.stringify({
            item,
            candidates: candidates.map(compactCandidate),
            schema: {
              patch: "Partial ScreeningSourceItem fields: originalTitle,type,category,year,duration,rating,posterUrl,description,tags,sourceNote",
              confidence: "0-1 number",
              reason: "Chinese reason",
              risks: "Chinese string array"
            }
          })
        }
      ]
    })
  });

  if (!response.ok) throw new Error(`OpenAI completion failed: ${response.status}`);
  const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenAI response is empty");
  return safeJsonParse(content);
}

async function completeMediaItem(item: ScreeningSourceItem): Promise<MediaAiSuggestion> {
  const candidates = await scrapeMediaCandidates({ query: item.title, sourceUrl: item.sourceUrl, mediaType: item.type });
  const sourceProviders = Array.from(new Set(candidates.map((candidate) => candidate.provider)));
  const risks: string[] = [];
  let aiPayload: Record<string, unknown> | undefined;

  try {
    aiPayload = await callOpenAiForCompletion(item, candidates);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "AI completion failed");
  }

  const patch = sanitizeAiPatch(aiPayload.patch, item, candidates);
  if (!patch.posterUrl && !item.posterUrl && candidates.every((candidate) => !candidate.posterUrl)) {
    risks.push("抓取源未提供可验证海报，AI 不会生成海报 URL");
  }
  if (Object.keys(patch).length === 0) risks.push("没有可安全应用的字段变更");

  return {
    id: item.id,
    title: item.title,
    patch,
    confidence: typeof aiPayload.confidence === "number" ? Math.max(0, Math.min(1, aiPayload.confidence)) : 0.5,
    reason: typeof aiPayload.reason === "string" ? aiPayload.reason : "AI 已根据抓取候选生成补全建议。",
    risks: [...risks, ...(Array.isArray(aiPayload.risks) ? aiPayload.risks.map(String) : [])],
    sourceProviders
  };
}

function cleanStringArray(value: unknown, limit: number, maxLength: number) {
  return Array.isArray(value)
    ? value.map((item) => trimText(item, maxLength)).filter(Boolean).slice(0, limit)
    : [];
}

function sanitizeTalkAiPayload(raw: unknown) {
  const input = isRecord(raw) ? raw : {};
  const highlights: TalkHighlightItem[] = Array.isArray(input.highlights)
    ? input.highlights.map((item) => {
      const record = isRecord(item) ? item : {};
      return {
        time: trimText(record.time, 24),
        desc: trimText(record.desc || record.description, 240)
      };
    }).filter((item) => item.time || item.desc).slice(0, 12)
    : [];

  const transcript: TalkTranscriptItem[] = Array.isArray(input.transcript)
    ? input.transcript.map((item) => {
      const record = isRecord(item) ? item : {};
      return {
        time: trimText(record.time, 24),
        speaker: trimText(record.speaker, 80) || "主持人：",
        text: trimText(record.text, 1200)
      };
    }).filter((item) => item.time || item.text).slice(0, 120)
    : [];

  return {
    summary: trimText(input.summary, 2400),
    summaryBullets: cleanStringArray(input.summaryBullets || input.bullets, 8, 240),
    highlights,
    transcript,
    tags: cleanStringArray(input.tags, 10, 40)
  };
}

async function summarizeTalkWithAi(request: { title: string; date?: string; text: string; videoUrl?: string }) {
  const settings = await loadAiCoreSettings();
  if (!settings.apiKey) throw new Error("OPENAI_API_KEY is not configured");

  const response = await fetch(`${settings.baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${settings.apiKey}`
    },
    body: JSON.stringify({
      model: settings.model,
      temperature: 0.25,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "你是个人站杂谈回录像整理助手。只返回 JSON。根据输入生成中文摘要、摘要要点、时间轴高光、可编辑逐字稿草稿和标签。不要编造无法从文本推断的事实。"
        },
        {
          role: "user",
          content: JSON.stringify({
            title: request.title,
            date: request.date,
            videoUrl: request.videoUrl,
            rawText: request.text,
            schema: {
              summary: "中文摘要，200-600字",
              summaryBullets: "中文要点数组，3-8条",
              highlights: "数组，每项 { time, desc }",
              transcript: "数组，每项 { time, speaker, text }，可从原文整理，不足时返回空数组",
              tags: "中文标签数组，3-10个"
            }
          })
        }
      ]
    })
  });

  if (!response.ok) throw new Error(`OpenAI summarize failed: ${response.status}`);
  const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenAI response is empty");
  return sanitizeTalkAiPayload(safeJsonParse(content));
}

function normalizeLibraryContent(value: unknown): ScreeningLibraryContent {
  const library = value as Partial<ScreeningLibraryContent> | null;

  return {
    ...defaultScreeningLibrary,
    ...(library || {}),
    items: Array.isArray(library?.items) ? library.items : [],
    tags: Array.isArray(library?.tags) ? library.tags : defaultScreeningLibrary.tags
  };
}

function toDateStamp(...candidates: Array<string | undefined>) {
  for (const candidate of candidates) {
    if (!candidate) continue;

    const directDate = candidate.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
    if (directDate) return directDate;

    const date = new Date(candidate);
    if (!Number.isNaN(date.getTime())) return date.toISOString().slice(0, 10);
  }

  return new Date().toISOString().slice(0, 10);
}

function movieToSourceItem(movie: ScreeningMovie, status: ScreeningSourceItem["status"], addedAt: string): ScreeningSourceItem {
  const isAnime = movie.type === "anime" || movie.tags?.some((tag) => tag.includes("动画") || tag.includes("宫崎骏") || tag.includes("新海诚"));

  return {
    id: movie.libraryId || movie.id || slugifyTitle(movie.title),
    title: movie.title,
    originalTitle: movie.originalTitle,
    type: isAnime ? "anime" : "movie",
    category: movie.type,
    year: movie.year,
    duration: movie.duration,
    rating: movie.rating,
    posterUrl: movie.posterUrl,
    description: movie.description || movie.note || "从现有放映数据自动同步入库。",
    tags: movie.tags || [],
    sourceUrl: movie.sourceUrl,
    sourceNote: movie.note,
    status,
    priority: movie.type === "bad" ? "high" : "normal",
    timesWatched: status === "watched" ? 1 : 0,
    addedAt,
    ...(status === "watched" ? { lastWatchedAt: addedAt } : {})
  };
}

function mergeLibraryItems(base: ScreeningLibraryContent, additions: ScreeningSourceItem[]) {
  const byId = new Map(base.items.map((item) => [item.id, item]));
  const byTitle = new Map(base.items.map((item) => [item.title.trim().toLowerCase(), item.id]));
  let changed = false;

  const statusPriority: Record<string, number> = { watched: 4, planned: 3, available: 2, hidden: 0, rejected: 0 };

  for (const item of additions) {
    const titleKey = item.title.trim().toLowerCase();
    const existingId = byId.has(item.id) ? item.id : byTitle.get(titleKey);

    if (existingId) {
      const existing = byId.get(existingId);
      if (!existing) continue;

      const patch: Partial<ScreeningSourceItem> = {};

      if (!existing.posterUrl && item.posterUrl) patch.posterUrl = item.posterUrl;
      if (!existing.sourceUrl && item.sourceUrl) patch.sourceUrl = item.sourceUrl;
      if (!existing.sourceNote && item.sourceNote) patch.sourceNote = item.sourceNote;
      if (!existing.originalTitle && item.originalTitle) patch.originalTitle = item.originalTitle;
      if (!existing.year && item.year) patch.year = item.year;
      if (!existing.duration && item.duration) patch.duration = item.duration;
      if ((!existing.rating || existing.rating === 0) && item.rating && item.rating > 0) patch.rating = item.rating;
      if ((!existing.description || existing.description.length < 10) && item.description && item.description.length >= 10) patch.description = item.description;
      if (existing.tags.length === 0 && item.tags.length > 0) patch.tags = item.tags;
      if (item.lastWatchedAt && (!existing.lastWatchedAt || item.lastWatchedAt > existing.lastWatchedAt)) patch.lastWatchedAt = item.lastWatchedAt;
      if (item.plannedAt && (!existing.plannedAt || item.plannedAt > existing.plannedAt)) patch.plannedAt = item.plannedAt;

      const existingPrio = statusPriority[existing.status] ?? 0;
      const itemPrio = statusPriority[item.status] ?? 0;
      if (itemPrio > existingPrio && existingPrio > 0) patch.status = item.status;

      if (item.timesWatched > (existing.timesWatched || 0)) patch.timesWatched = item.timesWatched;

      if (Object.keys(patch).length > 0) {
        byId.set(existingId, { ...existing, ...patch });
        changed = true;
      }
      continue;
    }

    byId.set(item.id, item);
    byTitle.set(titleKey, item.id);
    changed = true;
  }

  return {
    changed,
    library: {
      ...base,
      tags: Array.from(new Set([...base.tags, ...additions.flatMap((item) => item.tags)])),
      items: Array.from(byId.values())
    }
  };
}

function collectLibraryAdditions(store: ContentStore) {
  const additions: ScreeningSourceItem[] = [...defaultScreeningLibrary.items];
  const next = store.entries["screenings.next"]?.published as { startsAt?: string; movies?: ScreeningMovie[] } | undefined;
  const schedule = store.entries["screenings.schedule"]?.published as ScreeningScheduleContent | undefined;
  const todo = store.entries["screenings.todo"]?.published as ScreeningTodoContent | undefined;

  for (const movie of next?.movies || []) {
    additions.push(movieToSourceItem(movie, "planned", toDateStamp(next?.startsAt)));
  }

  for (const week of schedule?.weeks || []) {
    const watchedAt = toDateStamp(week.archivedAt, week.startsAt, week.date);
    for (const movie of week.movies || []) {
      additions.push(movieToSourceItem(movie, week.status === "ended" ? "watched" : week.status === "planned" ? "available" : "planned", watchedAt));
    }
  }

  for (const item of todo?.items || []) {
    additions.push({
      id: item.id || slugifyTitle(item.title),
      title: item.title,
      type: item.category === "anime" ? "anime" : "movie",
      category: item.category || "other",
      description: item.reason,
      tags: [item.category || "待定观影"].filter(Boolean),
      status: item.status === "watched" ? "watched" : item.status === "rejected" ? "rejected" : "available",
      priority: item.priority || (item.status === "urgent" ? "high" : "normal"),
      timesWatched: item.status === "watched" ? 1 : 0,
      addedAt: item.addedAt || "2026-06-06"
    });
  }

  return additions;
}

function syncScreeningLibrary(store: ContentStore) {
  const entry = store.entries["screenings.library"];
  if (!entry) return false;

  const additions = collectLibraryAdditions(store);
  const draftResult = mergeLibraryItems(normalizeLibraryContent(entry.draft), additions);
  const publishedResult = mergeLibraryItems(normalizeLibraryContent(entry.published), additions);

  if (!draftResult.changed && !publishedResult.changed) return false;

  const now = new Date().toISOString();
  entry.draft = draftResult.library;
  entry.published = publishedResult.library;
  entry.updatedAt = now;
  if (publishedResult.changed) entry.publishedAt = now;
  return true;
}

function toIsoString(value: unknown) {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string" && value.trim()) return value;
  return new Date().toISOString();
}

function rowToContentEntry(row: any): ContentEntry {
  return {
    key: row.key,
    type: row.type,
    status: row.status,
    draft: row.draft,
    published: row.published,
    version: Number(row.version || 1),
    updatedAt: toIsoString(row.updated_at),
    publishedAt: toIsoString(row.published_at)
  };
}

function rowToContentEvent(row: any): ContentStore["events"][number] {
  return {
    id: row.id,
    type: row.type,
    keys: Array.isArray(row.keys) ? row.keys : [],
    version: Number(row.version || 1),
    message: row.message || "",
    actorId: row.actor_id || undefined,
    actorName: row.actor_name || undefined,
    actorRole: row.actor_role || undefined,
    createdAt: toIsoString(row.created_at)
  };
}

function repairContentStore(existing: ContentStore) {
  let changed = false;

  for (const [key, entry] of Object.entries(defaultStore.entries)) {
    if (!existing.entries[key]) {
      existing.entries[key] = entry;
      changed = true;
    }
  }

  changed = repairEntryIfCorrupt(existing, "home.hero.main") || changed;
  changed = repairEntryIfCorrupt(existing, "home.faq.items") || changed;
  changed = repairSubmissionAndTodoEntries(existing) || changed;
  changed = refreshLegacyScreeningDefaults(existing) || changed;
  changed = refreshImportedScreeningHistoryDefaults(existing) || changed;
  changed = syncScreeningLibrary(existing) || changed;

  const sourceSubmissionEntry = existing.entries["screenings.sourceSubmissions"];
  if (sourceSubmissionEntry && normalizeSourceSubmissions(sourceSubmissionEntry.draft).items.length === 0) {
    sourceSubmissionEntry.draft = defaultScreeningSourceSubmissions;
    sourceSubmissionEntry.status = "draft";
    sourceSubmissionEntry.updatedAt = new Date().toISOString();
    changed = true;
  }

  const feedbackSubmissionEntry = existing.entries["feedback.submissions"];
  if (feedbackSubmissionEntry && normalizeFeedbackSubmissions(feedbackSubmissionEntry.draft).items.length === 0) {
    feedbackSubmissionEntry.draft = defaultFeedbackSubmissions;
    feedbackSubmissionEntry.status = "draft";
    feedbackSubmissionEntry.updatedAt = new Date().toISOString();
    changed = true;
  }

  return changed;
}

async function ensureDatabaseSchema() {
  if (!db) throw new Error("DATABASE_URL is required for database-backed content storage");
  if (databaseSchemaReady) return databaseSchemaReady;

  databaseSchemaReady = (async () => {
    const schema = await readFile(schemaPath, "utf8");
    await db.query(schema);
    await db.query("insert into content_meta (id, site_version) values ('main', $1) on conflict (id) do nothing", [defaultStore.siteVersion]);
  })();

  return databaseSchemaReady;
}

async function readSeedStoreFile() {
  try {
    const raw = await readFile(storePath, "utf8");
    if (!raw.trim()) return defaultStore;
    return JSON.parse(raw) as ContentStore;
  } catch {
    return defaultStore;
  }
}

async function readStoreDatabase(): Promise<ContentStore> {
  await ensureDatabaseSchema();
  const database = requireDatabase();
  const [metaResult, entriesResult, eventsResult] = await Promise.all([
    database.query("select site_version from content_meta where id = 'main' limit 1"),
    database.query("select * from content_entries order by key"),
    database.query("select * from content_events order by created_at desc limit 100")
  ]);

  return {
    siteVersion: Number(metaResult.rows[0]?.site_version || defaultStore.siteVersion),
    entries: Object.fromEntries(entriesResult.rows.map((row) => [row.key, rowToContentEntry(row)])),
    events: eventsResult.rows.map(rowToContentEvent)
  };
}

async function writeStoreDatabase(store: ContentStore) {
  await ensureDatabaseSchema();
  const database = requireDatabase();
  const client = await database.connect();

  try {
    await client.query("begin");
    await client.query(
      "insert into content_meta (id, site_version, updated_at) values ('main', $1, now()) on conflict (id) do update set site_version = excluded.site_version, updated_at = now()",
      [store.siteVersion]
    );

    for (const entry of Object.values(store.entries)) {
      await client.query(
        `insert into content_entries (key, type, status, draft, published, version, updated_at, published_at)
         values ($1,$2,$3,$4,$5,$6,$7,$8)
         on conflict (key) do update set
           type = excluded.type,
           status = excluded.status,
           draft = excluded.draft,
           published = excluded.published,
           version = excluded.version,
           updated_at = excluded.updated_at,
           published_at = excluded.published_at`,
        [entry.key, entry.type, entry.status, JSON.stringify(entry.draft), JSON.stringify(entry.published), entry.version, entry.updatedAt, entry.publishedAt]
      );
    }

    await client.query("delete from content_events");
    for (const event of store.events.slice(0, 100)) {
      await client.query(
        `insert into content_events (id, type, keys, version, message, actor_id, actor_name, actor_role, created_at)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         on conflict (id) do nothing`,
        [event.id, event.type, event.keys, event.version, event.message, event.actorId, event.actorName, event.actorRole, event.createdAt]
      );
    }

    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

async function ensureStore() {
  if (db) {
    await ensureDatabaseSchema();
    const database = requireDatabase();
    const countResult = await database.query("select count(*)::int as count from content_entries");

    if (Number(countResult.rows[0]?.count || 0) === 0) {
      const seedStore = await readSeedStoreFile();
      repairContentStore(seedStore);
      await writeStoreDatabase(seedStore);
      return;
    }

    const existing = await readStoreDatabase();
    if (repairContentStore(existing)) await writeStoreDatabase(existing);
    return;
  }

  await mkdir(dataDir, { recursive: true });

  try {
    const raw = await readFile(storePath, "utf8");
    const existing = JSON.parse(raw) as ContentStore;
    const changed = repairContentStore(existing);

    if (changed) {
      await saveStore(existing);
    }
  } catch {
    await saveStore(defaultStore);
  }
}

async function loadStore(): Promise<ContentStore> {
  await ensureStore();
  return db ? readStoreDatabase() : readStoreFile();
}

async function readStoreFile(): Promise<ContentStore> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const raw = await readFile(storePath, "utf8");
      if (!raw.trim()) throw new Error("Content store is empty");
      return JSON.parse(raw) as ContentStore;
    } catch (error) {
      if (attempt === 2) throw error;
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
  }

  return defaultStore;
}

async function writeStoreFile(store: ContentStore) {
  await mkdir(dataDir, { recursive: true });
  const serialized = `${JSON.stringify(store, null, 2)}\n`;
  const tempPath = `${storePath}.${process.pid}.${Date.now()}-${randomBytes(4).toString("hex")}.tmp`;
  await writeFile(tempPath, serialized, "utf8");
  await rename(tempPath, storePath);
}

async function saveStore(store: ContentStore) {
  storeWriteQueue = storeWriteQueue.catch(() => undefined).then(async () => {
    if (db) await writeStoreDatabase(store);
    else await writeStoreFile(store);
  });
  await storeWriteQueue;
}

async function mutateStore<T>(updater: (store: ContentStore) => T | Promise<T>) {
  await ensureStore();
  let result: T | undefined;

  storeWriteQueue = storeWriteQueue.catch(() => undefined).then(async () => {
    const store = db ? await readStoreDatabase() : await readStoreFile();
    result = await updater(store);
    if (db) await writeStoreDatabase(store);
    else await writeStoreFile(store);
  });

  await storeWriteQueue;
  return result as T;
}

async function loadMediaScraperSettings(): Promise<MediaScraperSettings> {
  await mkdir(dataDir, { recursive: true });

  try {
    const raw = await readFile(mediaSettingsPath, "utf8");
    const saved = JSON.parse(raw) as Partial<MediaScraperSettings>;

    return {
      ...defaultMediaScraperSettings,
      ...saved,
      tmdbApiKey: saved.tmdbApiKey || runtimeConfig.tmdbApiKey,
      tmdbApiBase: saved.tmdbApiBase || runtimeConfig.tmdbApiBase,
      bangumiApiBase: saved.bangumiApiBase || defaultMediaScraperSettings.bangumiApiBase,
      bangumiImageBase: saved.bangumiImageBase || defaultMediaScraperSettings.bangumiImageBase
    };
  } catch {
    await saveMediaScraperSettings(defaultMediaScraperSettings);
    return defaultMediaScraperSettings;
  }
}

async function saveMediaScraperSettings(settings: MediaScraperSettings) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(mediaSettingsPath, `${JSON.stringify(settings, null, 2)}\n`, "utf8");
}

async function loadAiCoreSettings(): Promise<AiCoreSettings> {
  await mkdir(dataDir, { recursive: true });

  try {
    const raw = await readFile(aiSettingsPath, "utf8");
    const saved = JSON.parse(raw) as Partial<AiCoreSettings>;

    return normalizeAiCoreSettings({
      ...defaultAiCoreSettings,
      ...saved,
      apiKey: saved.apiKey || runtimeConfig.openAiApiKey
    });
  } catch {
    await saveAiCoreSettings(defaultAiCoreSettings);
    return defaultAiCoreSettings;
  }
}

function normalizeAiCoreSettings(settings: Partial<AiCoreSettings>): AiCoreSettings {
  return {
    apiKey: typeof settings.apiKey === "string" ? settings.apiKey.trim() : "",
    baseUrl: typeof settings.baseUrl === "string" && settings.baseUrl.trim() ? settings.baseUrl.trim().replace(/\/$/, "") : defaultAiCoreSettings.baseUrl,
    model: typeof settings.model === "string" && settings.model.trim() ? settings.model.trim() : defaultAiCoreSettings.model
  };
}

async function saveAiCoreSettings(settings: AiCoreSettings) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(aiSettingsPath, `${JSON.stringify(settings, null, 2)}\n`, "utf8");
}

function maskSecret(value: string) {
  if (!value) return "";
  if (value.length <= 8) return "已配置";
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

function trimText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function normalizeSourceSubmissions(value: unknown): ScreeningSourceSubmissionsContent {
  const content = value as Partial<ScreeningSourceSubmissionsContent> | null;
  return { items: Array.isArray(content?.items) ? content.items : [] };
}

function normalizeFeedbackSubmissions(value: unknown): FeedbackSubmissionsContent {
  const content = value as Partial<FeedbackSubmissionsContent> | null;
  return { items: Array.isArray(content?.items) ? content.items : [] };
}

function normalizePlazaSoulItem(value: unknown, index: number): PlazaSoulItem {
  const item = value as Partial<PlazaSoulItem> | null;
  const visibility = ["visible", "hidden", "pending", "rejected"].includes(String(item?.visibility))
    ? item!.visibility as PlazaVisibility
    : "visible";

  return {
    id: trimText(item?.id, 140) || `plaza-${index}`,
    name: trimText(item?.name, 160) || "未命名作品",
    author: trimText(item?.author, 100),
    tags: cleanPostTags(item?.tags),
    likes: typeof item?.likes === "number" && Number.isFinite(item.likes) ? Math.max(0, item.likes) : 0,
    createdAt: trimText(item?.createdAt || item?.importDate, 40),
    views: typeof item?.views === "number" && Number.isFinite(item.views) ? Math.max(0, item.views) : 0,
    activeDaysAgo: typeof item?.activeDaysAgo === "number" && Number.isFinite(item.activeDaysAgo) ? item.activeDaysAgo : null,
    avatarSrc: trimText(item?.avatarSrc, 800),
    avatarInitials: trimText(item?.avatarInitials, 12) || trimText(item?.name, 160).slice(0, 1),
    bannerColor: trimText(item?.bannerColor, 120) || "from-primary/20 to-primary/10",
    featured: Boolean(item?.featured),
    visibility,
    desc: trimText(item?.desc, 1200),
    importBatchId: trimText(item?.importBatchId, 140) || undefined,
    importYear: typeof item?.importYear === "number" ? item.importYear : undefined,
    importWeek: typeof item?.importWeek === "number" ? item.importWeek : undefined,
    importDate: trimText(item?.importDate, 40) || undefined,
    seriesName: trimText(item?.seriesName, 120) || undefined,
    seriesIndex: typeof item?.seriesIndex === "number" ? item.seriesIndex : undefined,
    itemIndex: typeof item?.itemIndex === "number" ? item.itemIndex : undefined,
    mediaAssetId: trimText(item?.mediaAssetId, 140) || undefined,
    sourceAnimeTitle: trimText(item?.sourceAnimeTitle, 160) || undefined,
    sourceAnimeId: trimText(item?.sourceAnimeId, 140) || undefined,
    sourceAnimeUrl: trimText(item?.sourceAnimeUrl, 500) || undefined,
    submittedByUserId: trimText(item?.submittedByUserId, 140) || undefined,
    submittedByName: trimText(item?.submittedByName, 120) || undefined,
    submittedAt: trimText(item?.submittedAt, 80) || undefined,
    reviewedAt: trimText(item?.reviewedAt, 80) || undefined,
    reviewedBy: trimText(item?.reviewedBy, 120) || undefined,
    reviewNote: trimText(item?.reviewNote, 500) || undefined,
    submissionBatchId: trimText(item?.submissionBatchId, 140) || undefined,
    submissionKind: item?.submissionKind === "user-single" || item?.submissionKind === "user-batch" || item?.submissionKind === "admin-weekly" ? item.submissionKind : undefined
  };
}

function normalizePlazaContent(value: unknown): PlazaContent {
  const content = value as Partial<PlazaContent> | null;
  const tags = cleanPostTags(content?.tags);
  return {
    souls: Array.isArray(content?.souls) ? content.souls.map((item, index) => normalizePlazaSoulItem(item, index)) : defaultPlazaContent.souls,
    moments: Array.isArray(content?.moments) ? content.moments : defaultPlazaContent.moments,
    groups: Array.isArray(content?.groups) ? content.groups : defaultPlazaContent.groups,
    tags: tags.length ? tags : defaultPlazaContent.tags
  };
}

function normalizeDateKey(value: unknown) {
  const text = trimText(value, 20);
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  return new Date().toISOString().slice(0, 10);
}

function plazaWeekFromDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map((part) => Number(part));
  const date = new Date(year, (month || 1) - 1, day || 1);
  const start = new Date(year, 0, 1);
  const diffDays = Math.floor((date.getTime() - start.getTime()) / 86400000);
  return Math.max(1, Math.floor(diffDays / 7) + 1);
}

function uniquePlazaName(baseName: string, usedNames: Set<string>) {
  const cleanBase = trimText(baseName, 120) || "用户投稿";
  if (!usedNames.has(cleanBase)) {
    usedNames.add(cleanBase);
    return cleanBase;
  }

  let index = 1;
  while (usedNames.has(`${cleanBase} ${index}`)) index += 1;
  const name = `${cleanBase} ${index}`;
  usedNames.add(name);
  return name;
}

const bannedFeedbackWords = [
  "博彩",
  "赌博",
  "诈骗",
  "外挂",
  "色情",
  "政治敏感",
  "违法"
];

function findBannedFeedbackWord(...values: Array<unknown>) {
  const text = values.map((value) => typeof value === "string" ? value : "").join("\n").toLowerCase();
  return bannedFeedbackWords.find((word) => text.includes(word.toLowerCase()));
}

function normalizeFeedbackImageUrls(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => trimText(item, 500))
    .filter((item) => /^https?:\/\//i.test(item) || item.startsWith("/uploads/"))
    .slice(0, 6);
}

function normalizeFeedbackMetadata(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const entries = Object.entries(value as Record<string, unknown>)
    .map(([key, item]) => [trimText(key, 60), trimText(item, 300)] as const)
    .filter(([key, item]) => key && item)
    .slice(0, 12);
  return entries.length ? Object.fromEntries(entries) : undefined;
}

function normalizeSiteAnalytics(value: unknown): SiteAnalyticsContent {
  const content = value as Partial<SiteAnalyticsContent> | null;
  return {
    totalViews: Number(content?.totalViews || 0),
    uniqueVisitors: Number(content?.uniqueVisitors || 0),
    lastVisitedAt: content?.lastVisitedAt,
    knownVisitors: Array.isArray(content?.knownVisitors) ? content.knownVisitors : [],
    trend24h: Array.isArray(content?.trend24h) ? content.trend24h : [],
    trend7d: Array.isArray(content?.trend7d) ? content.trend7d : [],
    pages: Array.isArray(content?.pages) ? content.pages : defaultSiteAnalytics.pages
  };
}

function hourBucket(date = new Date()) {
  const bucket = new Date(date);
  bucket.setMinutes(0, 0, 0);
  return bucket;
}

function anonymousVisitorHash(visitorId: string, req: express.Request) {
  const input = visitorId || `${clientIp(req)}:${req.headers["user-agent"] || ""}`;
  return createHash("sha256").update(`analytics:${input}`).digest("hex");
}

function labelHour(value: Date) {
  return `${String(value.getMonth() + 1).padStart(2, "0")}/${String(value.getDate()).padStart(2, "0")} ${String(value.getHours()).padStart(2, "0")}:00`;
}

function rowToTrendPoint(row: any): SiteAnalyticsTrendPoint {
  const hour = toIsoString(row.hour);
  const date = new Date(hour);
  return {
    hour,
    label: Number.isFinite(date.getTime()) ? labelHour(date) : hour,
    views: Number(row.views || 0),
    uniqueVisitors: Number(row.unique_visitors || 0)
  };
}

function rowToMetricSample(row: any): ServerMetricSample {
  return {
    id: row.id,
    sampledAt: toIsoString(row.sampled_at),
    cpuPercent: Number(row.cpu_percent || 0),
    memoryTotalBytes: Number(row.memory_total_bytes || 0),
    memoryUsedBytes: Number(row.memory_used_bytes || 0),
    memoryPercent: Number(row.memory_percent || 0),
    diskTotalBytes: Number(row.disk_total_bytes || 0),
    diskUsedBytes: Number(row.disk_used_bytes || 0),
    diskPercent: Number(row.disk_percent || 0),
    processMemoryBytes: Number(row.process_memory_bytes || 0),
    uptimeSeconds: Number(row.uptime_seconds || 0),
    requests: Number(row.requests || 0),
    errors: Number(row.errors || 0),
    avgResponseMs: Number(row.avg_response_ms || 0),
    dbLatencyMs: row.db_latency_ms === null || row.db_latency_ms === undefined ? undefined : Number(row.db_latency_ms),
    status: row.status || "healthy"
  };
}

function rowToServerAlert(row: any): ServerAlert {
  return {
    id: row.id,
    fingerprint: row.fingerprint,
    type: row.type,
    severity: row.severity,
    title: row.title,
    message: row.message,
    status: row.status,
    metricValue: row.metric_value === null || row.metric_value === undefined ? undefined : Number(row.metric_value),
    threshold: row.threshold === null || row.threshold === undefined ? undefined : Number(row.threshold),
    openedAt: toIsoString(row.opened_at),
    acknowledgedAt: row.acknowledged_at ? toIsoString(row.acknowledged_at) : undefined,
    resolvedAt: row.resolved_at ? toIsoString(row.resolved_at) : undefined,
    lastSeenAt: toIsoString(row.last_seen_at)
  };
}

type SupportedImageMimeType = "image/jpeg" | "image/png" | "image/webp" | "image/gif" | "image/avif";

const allowedImageMimeTypes = new Set<SupportedImageMimeType>(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);
const imageExtensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif"
};

const localUploadDir = path.join(dataDir, "uploads");
const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: runtimeConfig.mediaUploadMaxBytes },
  fileFilter: (_req, file, callback) => {
    // Some exported images have AVIF/WebP bytes but keep a .jpg filename.
    // Multer only sees the declared MIME here; the real signature is checked
    // after the file is in memory.
    if (!allowedImageMimeTypes.has(file.mimetype as SupportedImageMimeType) && file.mimetype !== "application/octet-stream") {
      callback(new Error("Only JPEG, PNG, WebP, GIF and AVIF images can be uploaded"));
      return;
    }

    callback(null, true);
  }
});

function uploadImageFile(req: express.Request, res: express.Response, next: express.NextFunction) {
  imageUpload.single("file")(req, res, (error) => {
    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      res.status(413).json({ error: `Image is too large. Max size is ${runtimeConfig.mediaUploadMaxBytes} bytes.` });
      return;
    }

    if (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Image upload failed" });
      return;
    }

    next();
  });
}

function detectImageMimeType(buffer: Buffer): SupportedImageMimeType | null {
  if (buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "image/jpeg";
  if (buffer.length > 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (buffer.length > 12 && buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP") return "image/webp";
  if (buffer.length > 12) {
    const brands = buffer.subarray(4, Math.min(buffer.length, 32)).toString("ascii");
    if (brands.includes("ftypavif") || brands.includes("ftypavis")) return "image/avif";
  }
  if (buffer.length > 6) {
    const header = buffer.subarray(0, 6).toString("ascii");
    if (header === "GIF87a" || header === "GIF89a") return "image/gif";
  }

  return null;
}

function safeObjectSegment(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "image";
}

function buildMediaObjectKey(file: Express.Multer.File, scope: string, mimeType = file.mimetype) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const extension = imageExtensions[mimeType] || "bin";
  const prefix = runtimeConfig.objectStoragePrefix ? `${runtimeConfig.objectStoragePrefix}/` : "";
  const safeScope = safeObjectSegment(scope || "media");
  const baseName = safeObjectSegment(file.originalname || "image");
  return `${prefix}${safeScope}/${year}/${month}/${Date.now()}-${randomBytes(5).toString("hex")}-${baseName}.${extension}`;
}

function s3EncodePath(value: string) {
  return value.split("/").map((part) => encodeURIComponent(part)).join("/");
}

function sha256Hex(value: Buffer | string) {
  return createHash("sha256").update(value).digest("hex");
}

function hmac(key: Buffer | string, value: string) {
  return createHmac("sha256", key).update(value).digest();
}

function awsDateParts(date = new Date()) {
  const iso = date.toISOString().replace(/[:-]|\.\d{3}/g, "");
  return {
    amzDate: iso,
    dateStamp: iso.slice(0, 8)
  };
}

function s3SigningKey(secret: string, dateStamp: string, region: string) {
  const kDate = hmac(`AWS4${secret}`, dateStamp);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, "s3");
  return hmac(kService, "aws4_request");
}

async function putS3CompatibleObject(key: string, body: Buffer, contentType: string) {
  const endpoint = runtimeConfig.objectStorageEndpoint;
  const bucket = runtimeConfig.objectStorageBucket;
  const region = runtimeConfig.objectStorageRegion || "auto";
  const accessKeyId = runtimeConfig.objectStorageAccessKeyId;
  const secretAccessKey = runtimeConfig.objectStorageSecretAccessKey;

  if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) {
    throw new Error("Object storage is not configured. Set endpoint, bucket, access key and secret key.");
  }

  const endpointUrl = new URL(endpoint);
  const encodedKey = s3EncodePath(key);
  const host = runtimeConfig.objectStorageForcePathStyle ? endpointUrl.host : `${bucket}.${endpointUrl.host}`;
  const canonicalUri = runtimeConfig.objectStorageForcePathStyle ? `/${bucket}/${encodedKey}` : `/${encodedKey}`;
  const targetUrl = `${endpointUrl.protocol}//${host}${canonicalUri}`;
  const payloadHash = sha256Hex(body);
  const { amzDate, dateStamp } = awsDateParts();
  const credentialScope = `${dateStamp}/${region}/s3/aws4_request`;
  const canonicalHeaders = [
    `content-type:${contentType}`,
    `host:${host}`,
    `x-amz-content-sha256:${payloadHash}`,
    `x-amz-date:${amzDate}`
  ].join("\n") + "\n";
  const signedHeaders = "content-type;host;x-amz-content-sha256;x-amz-date";
  const canonicalRequest = [
    "PUT",
    canonicalUri,
    "",
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join("\n");
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest)
  ].join("\n");
  const signature = createHmac("sha256", s3SigningKey(secretAccessKey, dateStamp, region)).update(stringToSign).digest("hex");
  const authorization = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  const response = await fetch(targetUrl, {
    method: "PUT",
    headers: {
      Authorization: authorization,
      "Content-Type": contentType,
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amzDate
    },
    body
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(`Object storage upload failed: ${response.status}${message ? ` ${message.slice(0, 200)}` : ""}`);
  }

  const publicBase = runtimeConfig.objectStoragePublicBaseUrl || `${endpointUrl.protocol}//${host}${runtimeConfig.objectStorageForcePathStyle ? `/${bucket}` : ""}`;
  return `${publicBase.replace(/\/$/, "")}/${encodedKey}`;
}

async function deleteS3CompatibleObject(key: string) {
  const endpoint = runtimeConfig.objectStorageEndpoint;
  const bucket = runtimeConfig.objectStorageBucket;
  const region = runtimeConfig.objectStorageRegion || "auto";
  const accessKeyId = runtimeConfig.objectStorageAccessKeyId;
  const secretAccessKey = runtimeConfig.objectStorageSecretAccessKey;

  if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) return;

  const endpointUrl = new URL(endpoint);
  const encodedKey = s3EncodePath(key);
  const host = runtimeConfig.objectStorageForcePathStyle ? endpointUrl.host : `${bucket}.${endpointUrl.host}`;
  const canonicalUri = runtimeConfig.objectStorageForcePathStyle ? `/${bucket}/${encodedKey}` : `/${encodedKey}`;
  const targetUrl = `${endpointUrl.protocol}//${host}${canonicalUri}`;
  const payloadHash = sha256Hex("");
  const { amzDate, dateStamp } = awsDateParts();
  const credentialScope = `${dateStamp}/${region}/s3/aws4_request`;
  const canonicalHeaders = [
    `host:${host}`,
    `x-amz-content-sha256:${payloadHash}`,
    `x-amz-date:${amzDate}`
  ].join("\n") + "\n";
  const signedHeaders = "host;x-amz-content-sha256;x-amz-date";
  const canonicalRequest = [
    "DELETE",
    canonicalUri,
    "",
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join("\n");
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest)
  ].join("\n");
  const signature = createHmac("sha256", s3SigningKey(secretAccessKey, dateStamp, region)).update(stringToSign).digest("hex");
  const authorization = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  const response = await fetch(targetUrl, {
    method: "DELETE",
    headers: {
      Authorization: authorization,
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amzDate
    }
  });

  if (!response.ok && response.status !== 404) {
    const message = await response.text().catch(() => "");
    throw new Error(`Object storage delete failed: ${response.status}${message ? ` ${message.slice(0, 200)}` : ""}`);
  }
}

async function storeImageObject(file: Express.Multer.File, scope: string) {
  const detectedMimeType = detectImageMimeType(file.buffer);
  if (!detectedMimeType || !allowedImageMimeTypes.has(detectedMimeType)) {
    throw new Error("Image signature does not match a supported image format");
  }

  const key = buildMediaObjectKey(file, scope, detectedMimeType);

  if (runtimeConfig.objectStorageDriver === "s3" || runtimeConfig.objectStorageDriver === "r2") {
    const url = await putS3CompatibleObject(key, file.buffer, detectedMimeType);
    return { key, url, storage: "object" as const, mimeType: detectedMimeType };
  }

  const targetPath = path.join(localUploadDir, ...key.split("/"));
  if (!targetPath.startsWith(localUploadDir)) {
    throw new Error("Invalid upload path");
  }

  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(targetPath, file.buffer);
  const publicBase = runtimeConfig.objectStoragePublicBaseUrl || `http://localhost:${runtimeConfig.port}`;
  return { key, url: `${publicBase.replace(/\/$/, "")}/uploads/${s3EncodePath(key)}`, storage: "local" as const, mimeType: detectedMimeType };
}

async function saveMediaAsset(file: Express.Multer.File, auth: AuthSessionContext | null, scope: string, options: { status?: MediaAssetRecord["status"] } = {}) {
  const stored = await storeImageObject(file, scope);
  const now = new Date().toISOString();
  const assetId = `media-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const status = options.status || "published";

  let thumbnailUrls: Record<string, string> = {};
  try {
    await generateThumbnails(file.buffer, assetId, dataDir);
    const publicBase = runtimeConfig.objectStoragePublicBaseUrl || `http://localhost:${runtimeConfig.port}`;
    thumbnailUrls = getThumbnailUrls(assetId, publicBase);
  } catch {
    // thumbnail generation is best-effort, don't fail the upload
  }

  const asset = {
    id: assetId,
    ownerId: auth?.user.id,
    kind: "image" as const,
    url: stored.url,
    thumbnailUrl: thumbnailUrls["400w"] || stored.url,
    originalName: file.originalname,
    mimeType: stored.mimeType,
    fileSize: file.size,
    hash: sha256Hex(file.buffer),
    status,
    metadata: {
      storage: stored.storage,
      objectKey: stored.key,
      scope,
      thumbnails: thumbnailUrls
    },
    createdAt: now,
    updatedAt: now
  };

  if (db) {
    await ensureDatabaseSchema();
    const database = requireDatabase();
    await database.query(
      `insert into media_assets (id, owner_id, kind, url, thumbnail_url, original_name, mime_type, file_size, hash, status, metadata, created_at, updated_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [asset.id, asset.ownerId || null, asset.kind, asset.url, asset.thumbnailUrl, asset.originalName, asset.mimeType, asset.fileSize, asset.hash, asset.status, JSON.stringify(asset.metadata), asset.createdAt, asset.updatedAt]
    );
  }

  return asset;
}

function safeLocalUploadPathFromKey(key: string) {
  const targetPath = path.resolve(localUploadDir, ...key.split("/"));
  const rootPath = path.resolve(localUploadDir);
  return targetPath === rootPath || targetPath.startsWith(`${rootPath}${path.sep}`) ? targetPath : null;
}

function safeLocalUploadPathFromUrl(value?: string) {
  if (!value) return null;
  try {
    const url = value.startsWith("http") ? new URL(value) : null;
    const pathname = url ? url.pathname : value;
    const marker = "/uploads/";
    const index = pathname.indexOf(marker);
    if (index < 0) return null;
    const rawKey = pathname.slice(index + marker.length);
    const key = decodeURIComponent(rawKey).replace(/^\/+/, "");
    return safeLocalUploadPathFromKey(key);
  } catch {
    return null;
  }
}

async function deleteStoredMediaFiles(assetId: string | undefined, url: string | undefined, metadata: Record<string, unknown> = {}) {
  const objectKey = typeof metadata.objectKey === "string" ? metadata.objectKey : "";
  const storage = typeof metadata.storage === "string" ? metadata.storage : "";
  const operations: Array<Promise<unknown>> = [];

  if (storage === "object" && objectKey) {
    operations.push(deleteS3CompatibleObject(objectKey));
  } else {
    const localPath = objectKey ? safeLocalUploadPathFromKey(objectKey) : safeLocalUploadPathFromUrl(url);
    if (localPath) operations.push(rm(localPath, { force: true }));
  }

  if (assetId) {
    for (const width of [150, 400, 800]) {
      operations.push(rm(thumbnailFilePathStatic(dataDir, assetId, width), { force: true }));
    }
  }

  const results = await Promise.allSettled(operations);
  const rejected = results.find((result) => result.status === "rejected") as PromiseRejectedResult | undefined;
  if (rejected) throw rejected.reason;
}

async function markMediaAssetStatus(assetId: string | undefined, status: MediaAssetRecord["status"], metadataPatch: Record<string, unknown> = {}) {
  if (!assetId || !db) return;
  await ensureDatabaseSchema();
  const database = requireDatabase();
  await database.query(
    "update media_assets set status = $1, metadata = metadata || $2::jsonb, updated_at = $3 where id = $4",
    [status, JSON.stringify(metadataPatch), new Date().toISOString(), assetId]
  );
}

async function readMediaAssetForOwner(assetId: string, ownerId: string) {
  if (!db) return null;
  await ensureDatabaseSchema();
  const database = requireDatabase();
  const result = await database.query("select id, owner_id, url, thumbnail_url, status, metadata from media_assets where id = $1 limit 1", [assetId]);
  const row = result.rows[0];
  if (!row || row.owner_id !== ownerId) return null;
  return {
    id: row.id as string,
    url: row.url as string,
    thumbnailUrl: row.thumbnail_url as string | undefined,
    status: row.status as MediaAssetRecord["status"],
    metadata: typeof row.metadata === "object" && row.metadata ? row.metadata as Record<string, unknown> : {}
  };
}

async function hardDeleteMediaAsset(assetId?: string, fallbackUrl?: string) {
  if (!assetId) {
    await deleteStoredMediaFiles(undefined, fallbackUrl, {});
    return;
  }

  if (!db) {
    await deleteStoredMediaFiles(assetId, fallbackUrl, {});
    return;
  }

  await ensureDatabaseSchema();
  const database = requireDatabase();
  const result = await database.query("select id, url, metadata from media_assets where id = $1 limit 1", [assetId]);
  const row = result.rows[0];
  const metadata = typeof row?.metadata === "object" && row.metadata ? row.metadata as Record<string, unknown> : {};
  await deleteStoredMediaFiles(assetId, row?.url || fallbackUrl, metadata);
  await database.query("update media_assets set status = 'deleted', updated_at = $1 where id = $2", [new Date().toISOString(), assetId]);
}

function sendUploadFailure(res: express.Response, error: unknown) {
  console.error("Image upload failed", error);
  const detail = error instanceof Error ? error.message : "Unknown upload error";
  res.status(500).json({ error: `Image upload failed: ${detail}` });
}

function cleanPostTags(value: unknown) {
  const rawTags = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(/[,，\n]/)
      : [];

  return Array.from(new Set(rawTags
    .map((tag) => String(tag).trim())
    .filter(Boolean)
    .slice(0, 12)));
}

function normalizePostStatus(value: unknown, fallback: PostStatus): PostStatus {
  return ["draft", "pending", "published", "hidden", "rejected", "archived"].includes(String(value))
    ? value as PostStatus
    : fallback;
}

function normalizePostVisibility(value: unknown, fallback: PostVisibility): PostVisibility {
  return ["public", "private", "unlisted"].includes(String(value))
    ? value as PostVisibility
    : fallback;
}

function slugifyPostTitle(value: string) {
  const ascii = value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (ascii) return ascii.slice(0, 80);
  const hash = createHash("sha1").update(value || String(Date.now())).digest("hex").slice(0, 10);
  return `post-${hash}`;
}

async function uniquePostSlug(database: Pool, input: string, existingId?: string) {
  const base = slugifyPostTitle(input || "post");

  for (let index = 0; index < 50; index += 1) {
    const slug = index === 0 ? base : `${base}-${index + 1}`;
    const result = await database.query(
      "select id from posts where slug = $1 and ($2::text is null or id <> $2) limit 1",
      [slug, existingId || null]
    );
    if (!result.rowCount) return slug;
  }

  return `${base}-${Date.now()}`;
}

function rowToPostRecord(row: any): PostRecord {
  return {
    id: row.id,
    authorId: row.author_id || undefined,
    authorName: row.author_name || undefined,
    title: row.title,
    slug: row.slug,
    summary: row.summary || undefined,
    content: row.content || "",
    coverUrl: row.cover_url || undefined,
    status: row.status,
    visibility: row.visibility,
    tags: Array.isArray(row.tags) ? row.tags : [],
    publishedAt: row.published_at ? toIsoString(row.published_at) : undefined,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at)
  };
}

function publicPostSummary(post: PostRecord) {
  const { content: _content, status: _status, visibility: _visibility, ...summary } = post;
  return summary;
}

function rowToPostCommentRecord(row: any): PostCommentRecord {
  return {
    id: row.id,
    postId: row.post_id,
    postSlug: row.post_slug,
    authorId: row.author_id || undefined,
    authorName: row.author_name || "访客",
    content: row.content || "",
    status: row.status,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at)
  };
}

async function insertPostRevision(database: Pool, post: PostRecord, editorId?: string) {
  await database.query(
    `insert into post_revisions (id, post_id, editor_id, title, summary, content, cover_url, tags, status, created_at)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [
      `post-revision-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      post.id,
      editorId || null,
      post.title,
      post.summary || null,
      post.content,
      post.coverUrl || null,
      post.tags,
      post.status,
      new Date().toISOString()
    ]
  );
}

async function readPostById(database: Pool, postId: string) {
  const result = await database.query(
    `select p.*, u.name as author_name
     from posts p
     left join auth_users u on u.id = p.author_id
     where p.id = $1
     limit 1`,
    [postId]
  );
  return result.rows[0] ? rowToPostRecord(result.rows[0]) : null;
}

async function writePostEvent(auth: AuthSessionContext | null, message: string, postId: string, type = "post.updated") {
  const database = requireDatabase();
  const store = await loadStore();
  await database.query(
    `insert into content_events (id, type, keys, version, message, actor_id, actor_name, actor_role, created_at)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     on conflict (id) do nothing`,
    [
      `evt_${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      [`posts:${postId}`],
      store.siteVersion,
      message,
      auth?.user.id || null,
      auth?.user.name || null,
      auth?.user.role || null,
      new Date().toISOString()
    ]
  );
}

function toPublicUser(user: AuthUser): PublicUser {
  const { passwordHash: _passwordHash, passwordSalt: _passwordSalt, ...safeUser } = user;
  return safeUser;
}

function requireDatabase() {
  if (!db) throw new Error("DATABASE_URL is required for authentication and deployment-ready user management");
  return db;
}

function sendDatabaseRequired(res: express.Response) {
  res.status(503).json({ error: "DATABASE_URL is required. Configure PostgreSQL before using auth or workspace mutations." });
}

function authUserFromRow(row: any): AuthUser {
  return {
    id: row.id,
    uid: row.uid === null || row.uid === undefined ? undefined : Number(row.uid),
    email: row.email,
    name: row.name,
    role: row.role,
    status: row.status,
    passwordHash: row.password_hash,
    passwordSalt: row.password_salt,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at,
    lastLoginAt: row.last_login_at ? row.last_login_at instanceof Date ? row.last_login_at.toISOString() : row.last_login_at : undefined
  };
}

async function ensureAuthDatabase() {
  if (authDatabaseReady) return authDatabaseReady;

  authDatabaseReady = (async () => {
    const database = requireDatabase();
    await database.query("create sequence if not exists auth_users_uid_seq start 1");
    await database.query(`
      create table if not exists auth_users (
        id text primary key,
        uid integer unique default nextval('auth_users_uid_seq'),
        email text not null unique,
        name text not null,
        role text not null check (role in ('owner', 'admin', 'user')),
        status text not null check (status in ('active', 'disabled')),
        password_hash text not null,
        password_salt text not null,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now(),
        last_login_at timestamptz
      )
    `);
    await database.query("alter table auth_users add column if not exists uid integer");
    await database.query("alter table auth_users alter column uid set default nextval('auth_users_uid_seq')");
    await database.query(`
      with base as (
        select coalesce(max(uid), 0) as max_uid from auth_users
      ),
      numbered as (
        select id, (select max_uid from base) + row_number() over (order by created_at, id) as next_uid
        from auth_users
        where uid is null
      )
      update auth_users
      set uid = numbered.next_uid
      from numbered
      where auth_users.id = numbered.id
    `);
    await database.query(`
      select setval(
        'auth_users_uid_seq',
        greatest(coalesce((select max(uid) from auth_users), 0), 1),
        coalesce((select max(uid) from auth_users), 0) > 0
      )
    `);
    await database.query("create unique index if not exists auth_users_uid_idx on auth_users(uid)");
    await database.query(`
      create table if not exists auth_sessions (
        id text primary key,
        user_id text not null references auth_users(id) on delete cascade,
        token_hash text not null unique,
        created_at timestamptz not null default now(),
        expires_at timestamptz not null
      )
    `);
    await database.query("create index if not exists auth_sessions_user_id_idx on auth_sessions(user_id)");
    await database.query("delete from auth_sessions where expires_at <= now()");
    await database.query(`
      create table if not exists user_watched_sources (
        user_id text not null references auth_users(id) on delete cascade,
        source_id text not null,
        source_title text not null,
        watched_at timestamptz not null default now(),
        primary key (user_id, source_id)
      )
    `);
    await database.query("create index if not exists user_watched_sources_user_id_idx on user_watched_sources(user_id)");
  })();

  try {
    await authDatabaseReady;
  } catch (error) {
    authDatabaseReady = null;
    throw error;
  }
}

function hashPassword(password: string, salt = randomBytes(16).toString("hex")) {
  return { salt, hash: scryptSync(password, salt, 64).toString("hex") };
}

function verifyPassword(password: string, salt: string, hash: string) {
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function authEventActor(auth: { user: AuthUser } | null) {
  return auth ? { actorId: auth.user.id, actorName: auth.user.name, actorRole: auth.user.role } : {};
}

function isConfiguredOwnerAccount(user: Pick<AuthUser, "id" | "email" | "name">) {
  return ownerAccountIds.some((accountId) => [user.id, user.email, user.name].some((value) => value === accountId));
}

function demoAuthUserFromToken(token: string) {
  const match = token.match(/^demo-(owner|admin|user)-(.+?)-\d+-[a-z0-9]+$/);
  if (!match) return null;

  const now = new Date().toISOString();
  const role = match[1] as UserRole;
  const id = decodeURIComponent(match[2]);
  return {
    user: {
      id,
      uid: 1,
      email: `${id}@local.test`,
      name: role === "owner" ? "本地演示站主" : role === "admin" ? "本地演示管理员" : "本地演示用户",
      role,
      status: "active" as const,
      passwordHash: "",
      passwordSalt: "",
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now
    }
  };
}

function bearerToken(req: express.Request) {
  const header = req.headers.authorization || "";
  return header.startsWith("Bearer ") ? header.slice(7).trim() : "";
}

function clientIp(req: express.Request) {
  return req.ip || req.socket.remoteAddress || "unknown";
}

function createRateLimit(options: { windowMs: number; max: number; scope: string }) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const now = Date.now();
    const key = `${options.scope}:${clientIp(req)}`;
    const bucket = rateLimitBuckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      rateLimitBuckets.set(key, { count: 1, resetAt: now + options.windowMs });
      next();
      return;
    }

    bucket.count += 1;
    if (bucket.count > options.max) {
      res.setHeader("Retry-After", String(Math.ceil((bucket.resetAt - now) / 1000)));
      res.status(429).json({ error: "Too many requests. Please try again later." });
      return;
    }

    next();
  };
}

function assertProductionConfig() {
  if (!isProduction) return;

  const missing: string[] = [];
  if (!runtimeConfig.databaseUrl) missing.push("DATABASE_URL");
  if (!runtimeConfig.corsOrigins.length) missing.push("CONTENT_API_CORS_ORIGINS or APP_URL");
  if (!runtimeConfig.ownerAccountIds.length) missing.push("OWNER_ACCOUNT_IDS");

  if (missing.length) {
    throw new Error(`Production configuration is incomplete: ${missing.join(", ")}`);
  }

  if (!runtimeConfig.requireHttps) {
    console.warn("CONTENT_API_REQUIRE_HTTPS is disabled in production. Enable it behind HTTPS reverse proxy unless your platform terminates HTTPS before the app.");
  }

  if (runtimeConfig.objectStorageDriver === "local") {
    console.warn("OBJECT_STORAGE_DRIVER=local in production. Use persistent disk backups or configure S3/R2-compatible object storage.");
  }
}

function securityHeaders(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!runtimeConfig.securityHeadersEnabled) {
    next();
    return;
  }

  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Resource-Policy", req.path.startsWith("/uploads/") ? "cross-origin" : "same-site");
  res.setHeader("Cache-Control", req.path.startsWith("/api/") ? "no-store" : "no-cache");
  if (isProduction && runtimeConfig.requireHttps) {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }

  next();
}

function requireHttps(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!isProduction || !runtimeConfig.requireHttps) {
    next();
    return;
  }

  const forwardedProto = String(req.headers["x-forwarded-proto"] || "").split(",")[0]?.trim();
  if (req.secure || forwardedProto === "https") {
    next();
    return;
  }

  res.status(400).json({ error: "HTTPS is required" });
}

async function createAuthSession(userId: string) {
  const database = requireDatabase();
  const token = randomBytes(32).toString("hex");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + AUTH_SESSION_DURATION_MS).toISOString();
  await database.query(
    "insert into auth_sessions (id, user_id, token_hash, created_at, expires_at) values ($1, $2, $3, $4, $5)",
    [`session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, userId, hashToken(token), now.toISOString(), expiresAt]
  );
  return token;
}

async function currentAuthUser(req: AuthenticatedRequest) {
  if (req.authContext !== undefined) return req.authContext;

  const token = bearerToken(req);
  if (!token) {
    req.authContext = null;
    return null;
  }

  if (!db && token.startsWith("demo-")) {
    req.authContext = demoAuthUserFromToken(token);
    return req.authContext;
  }

  if (!db) {
    req.authContext = null;
    return null;
  }

  await ensureAuthDatabase();
  const database = requireDatabase();
  const tokenHash = hashToken(token);
  const result = await database.query(
    `select u.*, s.expires_at as session_expires_at
     from auth_sessions s
     join auth_users u on u.id = s.user_id
     where s.token_hash = $1 and s.expires_at > now() and u.status = 'active'
     limit 1`,
    [tokenHash]
  );

  const row = result.rows[0];
  if (!row) {
    req.authContext = null;
    return req.authContext;
  }

  const expiresAt = row.session_expires_at instanceof Date ? row.session_expires_at.getTime() : new Date(row.session_expires_at).getTime();
  if (!Number.isNaN(expiresAt) && expiresAt - Date.now() < AUTH_SESSION_RENEW_THRESHOLD_MS) {
    const renewedExpiresAt = new Date(Date.now() + AUTH_SESSION_DURATION_MS).toISOString();
    await database.query("update auth_sessions set expires_at = $1 where token_hash = $2", [renewedExpiresAt, tokenHash]);
  }

  req.authContext = { user: authUserFromRow(row) };
  return req.authContext;
}

async function requireSignedIn(req: AuthenticatedRequest, res: express.Response) {
  const auth = await currentAuthUser(req);
  if (!auth) {
    res.status(401).json({ error: "Authentication required" });
    return null;
  }

  return auth;
}

async function requireSignedInMiddleware(req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) {
  const auth = await requireSignedIn(req, res);
  if (!auth) return;

  next();
}

async function requireWorkspaceAdmin(req: AuthenticatedRequest, res: express.Response) {
  const auth = await currentAuthUser(req);
  if (!auth) {
    res.status(401).json({ error: "Authentication required" });
    return null;
  }

  if (auth.user.role !== "owner" && auth.user.role !== "admin") {
    res.status(403).json({ error: "Workspace edit permission required" });
    return null;
  }

  return auth;
}

async function requireOwner(req: AuthenticatedRequest, res: express.Response) {
  const auth = await currentAuthUser(req);
  if (!auth) {
    res.status(401).json({ error: "Authentication required" });
    return null;
  }

  if (auth.user.role !== "owner") {
    res.status(403).json({ error: "Owner permission required" });
    return null;
  }

  return auth;
}

async function requireWorkspaceAdminMiddleware(req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) {
  const auth = await requireWorkspaceAdmin(req, res);
  if (!auth) return;

  next();
}

function adminWriteRateLimitMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") {
    next();
    return;
  }

  adminWriteLimit(req, res, next);
}

async function fetchOpenAiModels(settings: AiCoreSettings) {
  if (!settings.apiKey) throw new Error("API Key is not configured");

  const response = await fetch(`${settings.baseUrl}/models`, {
    headers: { Authorization: `Bearer ${settings.apiKey}` }
  });

  if (!response.ok) throw new Error(`Model search failed: ${response.status}`);
  const data = await response.json() as { data?: Array<{ id?: string }> };
  return (data.data || [])
    .map((model) => model.id)
    .filter((id): id is string => Boolean(id))
    .sort((a, b) => a.localeCompare(b));
}

function publicContent(store: ContentStore, keys?: string[]) {
  const entries = keys?.length
    ? keys.map((key) => store.entries[key]).filter(Boolean)
    : Object.values(store.entries);

  return Object.fromEntries(entries.map((entry) => {
    if (entry.key === "screenings.sourceSubmissions") {
      const content = normalizeSourceSubmissions(entry.published);
      return [entry.key, { items: content.items.filter((item) => item.status === "approved") }];
    }

    if (entry.key === "feedback.submissions") {
      return [entry.key, { items: [] }];
    }

    return [entry.key, entry.published];
  }));
}

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", runtimeConfig.trustProxy);

for (const method of ["get", "post", "patch", "use"] as const) {
  const original = app[method].bind(app) as (...args: any[]) => unknown;
  (app as any)[method] = (...args: any[]) => original(...args.map((handler) => {
    if (typeof handler !== "function" || handler.length >= 4) return handler;
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
      Promise.resolve(handler(req, res, next)).catch(next);
    };
  }));
}

async function getDatabaseStatus() {
  if (!db) {
    return {
      configured: false,
      connected: false,
      authSchemaReady: false,
      message: "DATABASE_URL is not configured; auth runs in local demo mode."
    };
  }

  try {
    await db.query("select 1");
    await ensureAuthDatabase();
    return {
      configured: true,
      connected: true,
      authSchemaReady: true,
      message: "PostgreSQL is reachable and auth schema is ready."
    };
  } catch (error) {
    return {
      configured: true,
      connected: false,
      authSchemaReady: false,
      message: error instanceof Error ? error.message : "Database health check failed."
    };
  }
}

function requestMetricsMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const startedAt = Date.now();
  res.on("finish", () => {
    if (req.path === "/api/health") return;
    requestMetrics.requests += 1;
    if (res.statusCode >= 500) requestMetrics.errors += 1;
    requestMetrics.totalResponseMs += Date.now() - startedAt;
  });
  next();
}

async function getDiskUsage() {
  try {
    const stats = await statfs(dataDir);
    const total = Number(stats.blocks) * Number(stats.bsize);
    const free = Number(stats.bfree) * Number(stats.bsize);
    const used = Math.max(0, total - free);
    return {
      total,
      used,
      percent: total > 0 ? (used / total) * 100 : 0
    };
  } catch {
    return { total: 0, used: 0, percent: 0 };
  }
}

function getCpuPercent() {
  const now = Date.now();
  const usage = process.cpuUsage();
  const elapsedMicros = Math.max(1, (now - previousCpuSampleAt) * 1000);
  const usedMicros = (usage.user - previousCpuUsage.user) + (usage.system - previousCpuUsage.system);
  previousCpuUsage = usage;
  previousCpuSampleAt = now;
  return Math.max(0, Math.min(100, (usedMicros / elapsedMicros) * 100));
}

async function getDatabaseLatencyMs() {
  if (!db) return undefined;
  const startedAt = Date.now();
  await db.query("select 1");
  return Date.now() - startedAt;
}

function metricStatus(sample: Pick<ServerMetricSample, "cpuPercent" | "memoryPercent" | "diskPercent">, dbLatencyMs?: number) {
  if (
    sample.cpuPercent >= runtimeConfig.monitoringCpuWarningPercent ||
    sample.memoryPercent >= runtimeConfig.monitoringMemoryWarningPercent ||
    sample.diskPercent >= runtimeConfig.monitoringDiskWarningPercent ||
    consecutiveDbFailures >= runtimeConfig.monitoringFailureThreshold ||
    consecutiveApiFailures >= runtimeConfig.monitoringFailureThreshold
  ) return "warning" as const;
  if (dbLatencyMs !== undefined && dbLatencyMs > 2000) return "warning" as const;
  return "healthy" as const;
}

async function upsertServerAlert(alert: { fingerprint: string; type: string; severity: ServerAlert["severity"]; title: string; message: string; metricValue?: number; threshold?: number }) {
  if (!db) return;
  const now = new Date().toISOString();
  await db.query(
    `insert into server_alerts (id, fingerprint, type, severity, title, message, status, metric_value, threshold, opened_at, last_seen_at)
     values ($1,$2,$3,$4,$5,$6,'open',$7,$8,$9,$9)
     on conflict (fingerprint) do update set
       severity = excluded.severity,
       title = excluded.title,
       message = excluded.message,
       metric_value = excluded.metric_value,
       threshold = excluded.threshold,
       status = case when server_alerts.status = 'resolved' then 'open' else server_alerts.status end,
       resolved_at = case when server_alerts.status = 'resolved' then null else server_alerts.resolved_at end,
       last_seen_at = excluded.last_seen_at`,
    [`alert-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, alert.fingerprint, alert.type, alert.severity, alert.title, alert.message, alert.metricValue ?? null, alert.threshold ?? null, now]
  );
}

async function resolveServerAlert(fingerprint: string) {
  if (!db) return;
  await db.query(
    "update server_alerts set status = 'resolved', resolved_at = now(), last_seen_at = now() where fingerprint = $1 and status in ('open', 'ack')",
    [fingerprint]
  );
}

async function reconcileServerAlerts(sample: ServerMetricSample) {
  const checks = [
    {
      active: sample.cpuPercent >= runtimeConfig.monitoringCpuWarningPercent,
      fingerprint: "server:cpu",
      type: "cpu",
      title: "CPU 使用率过高",
      message: `CPU 当前 ${sample.cpuPercent.toFixed(1)}%，超过 ${runtimeConfig.monitoringCpuWarningPercent}% 阈值。`,
      metricValue: sample.cpuPercent,
      threshold: runtimeConfig.monitoringCpuWarningPercent
    },
    {
      active: sample.memoryPercent >= runtimeConfig.monitoringMemoryWarningPercent,
      fingerprint: "server:memory",
      type: "memory",
      title: "内存使用率过高",
      message: `内存当前 ${sample.memoryPercent.toFixed(1)}%，超过 ${runtimeConfig.monitoringMemoryWarningPercent}% 阈值。`,
      metricValue: sample.memoryPercent,
      threshold: runtimeConfig.monitoringMemoryWarningPercent
    },
    {
      active: sample.diskPercent >= runtimeConfig.monitoringDiskWarningPercent,
      fingerprint: "server:disk",
      type: "disk",
      title: "磁盘使用率过高",
      message: `磁盘当前 ${sample.diskPercent.toFixed(1)}%，超过 ${runtimeConfig.monitoringDiskWarningPercent}% 阈值。`,
      metricValue: sample.diskPercent,
      threshold: runtimeConfig.monitoringDiskWarningPercent
    },
    {
      active: consecutiveDbFailures >= runtimeConfig.monitoringFailureThreshold,
      fingerprint: "server:database",
      type: "database",
      title: "数据库健康检查失败",
      message: `数据库连续 ${consecutiveDbFailures} 次健康检查失败。`,
      threshold: runtimeConfig.monitoringFailureThreshold
    },
    {
      active: consecutiveApiFailures >= runtimeConfig.monitoringFailureThreshold,
      fingerprint: "server:api-errors",
      type: "api",
      title: "API 错误率异常",
      message: `最近采样窗口出现 ${sample.errors} 个 5xx 错误。`,
      metricValue: sample.errors,
      threshold: runtimeConfig.monitoringFailureThreshold
    }
  ];

  for (const check of checks) {
    if (check.active) {
      await upsertServerAlert({ ...check, severity: "warning" });
    } else {
      await resolveServerAlert(check.fingerprint);
    }
  }
}

async function collectServerMetricSample() {
  if (!db) return null;
  await ensureDatabaseSchema();

  const memoryTotal = os.totalmem();
  const memoryFree = os.freemem();
  const memoryUsed = Math.max(0, memoryTotal - memoryFree);
  const disk = await getDiskUsage();
  const snapshot = requestMetrics;
  requestMetrics = { requests: 0, errors: 0, totalResponseMs: 0 };

  let dbLatencyMs: number | undefined;
  try {
    dbLatencyMs = await getDatabaseLatencyMs();
    consecutiveDbFailures = 0;
  } catch {
    consecutiveDbFailures += 1;
  }

  consecutiveApiFailures = snapshot.errors > 0 ? consecutiveApiFailures + 1 : 0;
  const avgResponseMs = snapshot.requests > 0 ? snapshot.totalResponseMs / snapshot.requests : 0;
  const sample: ServerMetricSample = {
    id: `metric-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    sampledAt: new Date().toISOString(),
    cpuPercent: Number(getCpuPercent().toFixed(2)),
    memoryTotalBytes: memoryTotal,
    memoryUsedBytes: memoryUsed,
    memoryPercent: memoryTotal > 0 ? Number(((memoryUsed / memoryTotal) * 100).toFixed(2)) : 0,
    diskTotalBytes: disk.total,
    diskUsedBytes: disk.used,
    diskPercent: Number(disk.percent.toFixed(2)),
    processMemoryBytes: process.memoryUsage().rss,
    uptimeSeconds: Number(process.uptime().toFixed(0)),
    requests: snapshot.requests,
    errors: snapshot.errors,
    avgResponseMs: Number(avgResponseMs.toFixed(2)),
    dbLatencyMs,
    status: "healthy"
  };
  sample.status = metricStatus(sample, dbLatencyMs);

  await db.query(
    `insert into server_metric_samples
     (id, sampled_at, cpu_percent, memory_total_bytes, memory_used_bytes, memory_percent, disk_total_bytes, disk_used_bytes, disk_percent, process_memory_bytes, uptime_seconds, requests, errors, avg_response_ms, db_latency_ms, status)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
    [sample.id, sample.sampledAt, sample.cpuPercent, sample.memoryTotalBytes, sample.memoryUsedBytes, sample.memoryPercent, sample.diskTotalBytes, sample.diskUsedBytes, sample.diskPercent, sample.processMemoryBytes, sample.uptimeSeconds, sample.requests, sample.errors, sample.avgResponseMs, sample.dbLatencyMs ?? null, sample.status]
  );

  await reconcileServerAlerts(sample);
  lastMetricSample = sample;
  return sample;
}

async function cleanupMonitoringHistory() {
  if (!db) return;
  const retention = `${runtimeConfig.monitoringRetentionDays} days`;
  await ensureDatabaseSchema();
  await db.query("delete from analytics_hourly where hour < now() - $1::interval", [retention]);
  await db.query("delete from analytics_visitors where hour < now() - $1::interval", [retention]);
  await db.query("delete from server_metric_samples where sampled_at < now() - $1::interval", [retention]);
  await db.query("delete from server_alerts where status = 'resolved' and resolved_at < now() - $1::interval", [retention]);
}

function startMonitoringJobs() {
  if (!db) return;
  void collectServerMetricSample().catch((error) => console.error("Monitoring sample failed", error));
  sampleTimer = setInterval(() => {
    void collectServerMetricSample().catch((error) => console.error("Monitoring sample failed", error));
  }, runtimeConfig.monitoringSampleIntervalMs);
  sampleTimer.unref?.();
  cleanupTimer = setInterval(() => {
    void cleanupMonitoringHistory().catch((error) => console.error("Monitoring cleanup failed", error));
  }, 60 * 60 * 1000);
  cleanupTimer.unref?.();
}

function applyCors(req: express.Request, res: express.Response, next: express.NextFunction) {
  const origin = req.headers.origin;
  const hasOriginAllowlist = runtimeConfig.corsOrigins.length > 0;
  const originAllowed = !origin || !hasOriginAllowlist || runtimeConfig.corsOrigins.includes(origin);

  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (originAllowed) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
  }

  if (req.method === "OPTIONS") {
    res.status(originAllowed ? 204 : 403).end();
    return;
  }

  if (!originAllowed) {
    res.status(403).json({ error: "CORS origin is not allowed" });
    return;
  }

  next();
}

app.use(securityHeaders);
app.use(requireHttps);
app.use(express.json({ limit: runtimeConfig.jsonLimit }));
app.use(applyCors);
app.use(requestMetricsMiddleware);
app.use("/uploads", express.static(localUploadDir, {
  maxAge: "7d",
  immutable: true
}));

const publicWriteLimit = createRateLimit({ scope: "public-write", windowMs: 10 * 60 * 1000, max: 30 });
const analyticsLimit = createRateLimit({ scope: "analytics", windowMs: 60 * 1000, max: 120 });
const authLoginLimit = createRateLimit({ scope: "auth-login", windowMs: runtimeConfig.authLoginWindowMs, max: runtimeConfig.authLoginMax });
const authRegisterLimit = createRateLimit({ scope: "auth-register", windowMs: runtimeConfig.authRegisterWindowMs, max: runtimeConfig.authRegisterMax });
const adminWriteLimit = createRateLimit({ scope: "admin-write", windowMs: runtimeConfig.adminWriteWindowMs, max: runtimeConfig.adminWriteMax });

app.get("/api/health", async (_req, res) => {
  const database = await getDatabaseStatus();
  res.json({
    ok: true,
    service: "content-api",
    database,
    contentStore: {
      mode: db ? "postgres" : "json-file",
      path: db ? undefined : storePath,
      writeQueue: "enabled"
    }
  });
});

app.get("/api/admin/database/status", async (_req, res) => {
  const database = await getDatabaseStatus();
  res.json({ database });
});

app.use("/api/admin", requireWorkspaceAdminMiddleware, adminWriteRateLimitMiddleware);

app.post("/api/auth/register", authRegisterLimit, async (req, res) => {
  if (!db) {
    sendDatabaseRequired(res);
    return;
  }

  const name = trimText(req.body?.name, 80);
  const email = trimText(req.body?.email, 160).toLowerCase();
  const password = typeof req.body?.password === "string" ? req.body.password : "";

  if (!name || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8) {
    res.status(400).json({ error: "Name, valid email and password with at least 8 characters are required" });
    return;
  }

  await ensureAuthDatabase();
  const database = requireDatabase();
  const existing = await database.query("select id from auth_users where email = $1 limit 1", [email]);
  if (existing.rowCount) {
    res.status(409).json({ error: "Email is already registered" });
    return;
  }

  const now = new Date().toISOString();
  const passwordData = hashPassword(password);
  const count = await database.query("select count(*)::int as count from auth_users");
  const user: AuthUser = {
    id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    email,
    name,
    role: Number(count.rows[0]?.count || 0) === 0 || ownerAccountIds.some((accountId) => [email, name].some((value) => value === accountId)) ? "owner" : "user",
    status: "active",
    passwordHash: passwordData.hash,
    passwordSalt: passwordData.salt,
    createdAt: now,
    updatedAt: now,
    lastLoginAt: now
  };
  const insertResult = await database.query(
    `insert into auth_users (id, email, name, role, status, password_hash, password_salt, created_at, updated_at, last_login_at) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) returning uid`,
    [user.id, user.email, user.name, user.role, user.status, user.passwordHash, user.passwordSalt, user.createdAt, user.updatedAt, user.lastLoginAt]
  );
  user.uid = insertResult.rows[0]?.uid === undefined ? undefined : Number(insertResult.rows[0].uid);
  const token = await createAuthSession(user.id);

  res.json({ user: toPublicUser(user), token });
});

app.post("/api/auth/login", authLoginLimit, async (req, res) => {
  if (!db) {
    sendDatabaseRequired(res);
    return;
  }

  const email = trimText(req.body?.email, 160).toLowerCase();
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  await ensureAuthDatabase();
  const database = requireDatabase();
  const result = await database.query("select * from auth_users where email = $1 limit 1", [email]);
  const user = result.rows[0] ? authUserFromRow(result.rows[0]) : null;

  if (!user || !verifyPassword(password, user.passwordSalt, user.passwordHash)) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  if (user.status !== "active") {
    res.status(403).json({ error: "Account is disabled" });
    return;
  }

  user.lastLoginAt = new Date().toISOString();
  user.updatedAt = user.lastLoginAt;
  if (isConfiguredOwnerAccount(user) && user.role !== "owner") user.role = "owner";
  await database.query("update auth_users set last_login_at = $1, updated_at = $1, role = $2 where id = $3", [user.lastLoginAt, user.role, user.id]);
  const token = await createAuthSession(user.id);

  res.json({ user: toPublicUser(user), token });
});

app.post("/api/auth/logout", async (req, res) => {
  if (!db) {
    res.json({ ok: true });
    return;
  }

  const token = bearerToken(req);
  if (token) {
    await ensureAuthDatabase();
    const database = requireDatabase();
    const tokenHash = hashToken(token);
    await database.query("delete from auth_sessions where token_hash = $1", [tokenHash]);
  }

  res.json({ ok: true });
});

app.get("/api/auth/me", async (req, res) => {
  const auth = await currentAuthUser(req);
  res.json({ user: auth ? toPublicUser(auth.user) : null });
});

app.patch("/api/auth/me/profile", async (req, res) => {
  const auth = await requireSignedIn(req, res);
  if (!auth) return;
  if (!db) {
    sendDatabaseRequired(res);
    return;
  }

  const name = trimText(req.body?.name, 80);
  if (!name) {
    res.status(400).json({ error: "Name is required" });
    return;
  }

  await ensureAuthDatabase();
  const database = requireDatabase();
  const updatedAt = new Date().toISOString();
  const result = await database.query(
    "update auth_users set name = $1, updated_at = $2 where id = $3 returning *",
    [name, updatedAt, auth.user.id]
  );

  const user = result.rows[0] ? authUserFromRow(result.rows[0]) : null;
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({ user: toPublicUser(user) });
});

app.patch("/api/auth/me/password", async (req, res) => {
  const auth = await requireSignedIn(req, res);
  if (!auth) return;
  if (!db) {
    sendDatabaseRequired(res);
    return;
  }

  const currentPassword = typeof req.body?.currentPassword === "string" ? req.body.currentPassword : "";
  const newPassword = typeof req.body?.newPassword === "string" ? req.body.newPassword : "";

  if (!currentPassword || newPassword.length < 8) {
    res.status(400).json({ error: "Current password and a new password with at least 8 characters are required" });
    return;
  }

  await ensureAuthDatabase();
  const database = requireDatabase();
  const result = await database.query("select * from auth_users where id = $1 limit 1", [auth.user.id]);
  const user = result.rows[0] ? authUserFromRow(result.rows[0]) : null;

  if (!user || !verifyPassword(currentPassword, user.passwordSalt, user.passwordHash)) {
    res.status(403).json({ error: "Current password is incorrect" });
    return;
  }

  const passwordData = hashPassword(newPassword);
  const updatedAt = new Date().toISOString();
  const tokenHash = hashToken(bearerToken(req));
  await database.query(
    "update auth_users set password_hash = $1, password_salt = $2, updated_at = $3 where id = $4",
    [passwordData.hash, passwordData.salt, updatedAt, user.id]
  );
  await database.query("delete from auth_sessions where user_id = $1 and token_hash <> $2", [user.id, tokenHash]);

  user.updatedAt = updatedAt;
  res.json({ user: toPublicUser(user) });
});

app.get("/api/me/watched-sources", async (req, res) => {
  const auth = await currentAuthUser(req);
  if (!auth) {
    res.json({ items: [] });
    return;
  }

  if (!db) {
    res.json({ items: [] });
    return;
  }

  const database = requireDatabase();
  const result = await database.query(
    "select source_id as \"sourceId\", source_title as \"sourceTitle\", watched_at as \"watchedAt\" from user_watched_sources where user_id = $1 order by watched_at desc",
    [auth.user.id]
  );
  res.json({ items: result.rows });
});

app.post("/api/me/watched-sources", async (req, res) => {
  const auth = await currentAuthUser(req);
  if (!auth) {
    res.status(401).json({ error: "登录后可以同步保存看过记录" });
    return;
  }

  const sourceId = trimText(req.body?.sourceId, 120);
  const sourceTitle = trimText(req.body?.sourceTitle, 160);
  if (!sourceId || !sourceTitle) {
    res.status(400).json({ error: "sourceId and sourceTitle are required" });
    return;
  }

  const watchedAt = new Date().toISOString();
  if (!db) {
    res.json({ item: { sourceId, sourceTitle, watchedAt, demo: true } });
    return;
  }

  const database = requireDatabase();
  await database.query(
    `insert into user_watched_sources (user_id, source_id, source_title, watched_at) values ($1, $2, $3, $4)
     on conflict (user_id, source_id) do update set source_title = excluded.source_title, watched_at = excluded.watched_at`,
    [auth.user.id, sourceId, sourceTitle, watchedAt]
  );
  res.json({ item: { sourceId, sourceTitle, watchedAt } });
});

app.get("/api/me/posts", async (req, res) => {
  const auth = await requireSignedIn(req, res);
  if (!auth) return;

  if (!db) {
    res.json({ posts: [] });
    return;
  }

  await ensureDatabaseSchema();
  const database = requireDatabase();
  const result = await database.query(
    `select p.*, u.name as author_name
     from posts p
     left join auth_users u on u.id = p.author_id
     where p.author_id = $1
     order by p.updated_at desc
     limit 100`,
    [auth.user.id]
  );

  res.json({ posts: result.rows.map(rowToPostRecord) });
});

app.post("/api/me/posts", publicWriteLimit, async (req, res) => {
  const auth = await requireSignedIn(req, res);
  if (!auth) return;

  res.status(403).json({ error: "普通用户只能评论文章，博客由站主在工作台发布" });
});

app.patch("/api/me/posts/:id", publicWriteLimit, async (req, res) => {
  const auth = await requireSignedIn(req, res);
  if (!auth) return;

  res.status(403).json({ error: "普通用户只能评论文章，博客由站主在工作台发布" });
});

app.post("/api/me/media/upload", requireSignedInMiddleware, publicWriteLimit, uploadImageFile, async (req, res) => {
  const auth = await requireSignedIn(req, res);
  if (!auth) return;

  const file = req.file;
  if (!file) {
    res.status(400).json({ error: "Image file is required" });
    return;
  }

  const scope = trimText(req.body?.scope, 80) || "user";
  try {
    const asset = await saveMediaAsset(file, auth, scope, { status: scope === "plaza-submission" ? "pending" : "published" });
    res.json({ asset, storage: asset.metadata.storage });
  } catch (error) {
    sendUploadFailure(res, error);
  }
});

app.get("/api/me/bangumi/search", requireSignedInMiddleware, publicWriteLimit, async (req, res) => {
  const auth = await requireSignedIn(req, res);
  if (!auth) return;

  const query = trimText(req.query.q, 120);
  if (query.length < 2) {
    res.json({ items: [] });
    return;
  }

  const settings = await loadMediaScraperSettings();
  const candidates = await searchBangumiCandidates({ query, mediaType: "anime", providers: ["bangumi"] }, settings).catch(() => []);
  const items = candidates.slice(0, 8).map((candidate) => {
    const bangumiId = candidate.providerId?.startsWith("bangumi_") ? candidate.providerId.slice("bangumi_".length) : candidate.id;
    return {
      id: bangumiId,
      title: candidate.title,
      originalTitle: candidate.originalTitle,
      year: candidate.year,
      posterUrl: candidate.posterUrl,
      url: /^\d+$/.test(bangumiId) ? `https://bgm.tv/subject/${bangumiId}` : undefined
    };
  });

  res.json({ items });
});

app.post("/api/me/plaza/submissions", requireSignedInMiddleware, publicWriteLimit, async (req, res) => {
  const auth = await requireSignedIn(req, res);
  if (!auth) return;

  const rawItems = Array.isArray(req.body?.items) ? req.body.items.slice(0, 24) : [];
  if (rawItems.length === 0) {
    res.status(400).json({ error: "At least one image item is required" });
    return;
  }

  const batchDate = normalizeDateKey(req.body?.batchDate);
  const batchWeek = plazaWeekFromDateKey(batchDate);
  const batchYear = Number(batchDate.slice(0, 4));
  const paddedWeek = String(batchWeek).padStart(2, "0");
  const batchId = `plaza-submission-${batchDate}-w${paddedWeek}-${Date.now().toString(36)}`;
  const mode = rawItems.length > 1 ? "user-batch" : "user-single";
  const submittedAt = new Date().toISOString();
  const gradients = [
    "from-sky-500/20 to-purple-500/20",
    "from-cyan-500/20 to-blue-500/20",
    "from-indigo-500/20 to-violet-500/20",
    "from-fuchsia-500/20 to-rose-500/20",
    "from-amber-500/20 to-orange-500/20",
    "from-emerald-500/20 to-teal-500/20"
  ];

  const verifiedItems: Array<{
    mediaAssetId?: string;
    imageUrl: string;
    author: string;
    sourceAnimeTitle: string;
    sourceAnimeId?: string;
    sourceAnimeUrl?: string;
    creationDate: string;
  }> = [];

  for (const raw of rawItems) {
    const mediaAssetId = trimText(raw?.mediaAssetId, 140) || undefined;
    const sourceAnimeTitle = trimText(raw?.sourceAnimeTitle, 160);
    const imageUrl = trimText(raw?.imageUrl, 800);
    if (!imageUrl && !mediaAssetId) {
      res.status(400).json({ error: "Every submission item needs an uploaded image" });
      return;
    }
    if (!sourceAnimeTitle) {
      res.status(400).json({ error: "Every submission item needs an anime title" });
      return;
    }

    let resolvedImageUrl = imageUrl;
    if (mediaAssetId && db) {
      const asset = await readMediaAssetForOwner(mediaAssetId, auth.user.id);
      if (!asset) {
        res.status(403).json({ error: "Uploaded image does not belong to the current user" });
        return;
      }
      if (asset.status === "deleted") {
        res.status(400).json({ error: "Uploaded image has been deleted" });
        return;
      }
      resolvedImageUrl = asset.url;
    }

    verifiedItems.push({
      mediaAssetId,
      imageUrl: resolvedImageUrl,
      author: trimText(raw?.author, 100) || auth.user.name,
      sourceAnimeTitle,
      sourceAnimeId: trimText(raw?.sourceAnimeId, 140) || undefined,
      sourceAnimeUrl: trimText(raw?.sourceAnimeUrl, 500) || undefined,
      creationDate: normalizeDateKey(raw?.creationDate || batchDate)
    });
  }

  const result = await mutateStore((store) => {
    const entry = store.entries["plaza.main"];
    if (!entry) return { status: 500, error: "Plaza store is not configured" };

    const current = normalizePlazaContent(entry.draft);
    const usedNames = new Set(current.souls.map((item) => item.name).filter(Boolean));
    const existingMaxIndex = current.souls
      .filter((item) => item.submissionBatchId === batchId || item.importBatchId === batchId)
      .reduce((max, item) => Math.max(max, item.itemIndex || 0), 0);

    const newSouls = verifiedItems.map((item, index): PlazaSoulItem => {
      const itemIndex = existingMaxIndex + index + 1;
      const name = uniquePlazaName(item.sourceAnimeTitle, usedNames);
      const tags = Array.from(new Set(["用户投稿", item.sourceAnimeTitle].filter(Boolean)));
      return {
        id: `${batchId}-${String(itemIndex).padStart(2, "0")}-${randomBytes(3).toString("hex")}`,
        name,
        author: item.author,
        tags,
        likes: 0,
        createdAt: item.creationDate,
        views: 0,
        activeDaysAgo: null,
        avatarSrc: item.imageUrl,
        avatarInitials: name.slice(0, 1),
        bannerColor: gradients[index % gradients.length],
        featured: false,
        visibility: "pending",
        desc: "",
        importBatchId: batchId,
        importYear: batchYear,
        importWeek: batchWeek,
        importDate: batchDate,
        seriesName: "用户图库投稿",
        seriesIndex: batchWeek,
        itemIndex,
        mediaAssetId: item.mediaAssetId,
        sourceAnimeTitle: item.sourceAnimeTitle,
        sourceAnimeId: item.sourceAnimeId,
        sourceAnimeUrl: item.sourceAnimeUrl,
        submittedByUserId: auth.user.id,
        submittedByName: auth.user.name,
        submittedAt,
        submissionBatchId: batchId,
        submissionKind: mode
      };
    });

    const nextTags = Array.from(new Set([...current.tags, "用户投稿", ...newSouls.flatMap((item) => item.tags)]));
    entry.draft = { ...current, souls: [...newSouls, ...current.souls], tags: nextTags } satisfies PlazaContent;
    entry.status = "draft";
    entry.version += 1;
    entry.updatedAt = submittedAt;

    const event = {
      id: `evt_${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: "content.draft.updated",
      keys: ["plaza.main"],
      version: store.siteVersion,
      message: `New plaza submission from ${auth.user.name}`,
      ...authEventActor(auth),
      createdAt: submittedAt
    };
    store.events.unshift(event);
    store.events = store.events.slice(0, 100);
    return { status: 200, souls: newSouls, entry, event };
  });

  if (result.status !== 200) {
    res.status(result.status).json({ error: result.error });
    return;
  }

  await Promise.all(result.souls.map((item) => markMediaAssetStatus(item.mediaAssetId, "pending", { plazaSubmissionId: item.id, plazaSubmissionBatchId: batchId }))).catch((error) => {
    console.error("Failed to annotate plaza submission media assets", error);
  });
  broadcast("content.draft.updated", result.event);
  res.json({ ok: true, items: result.souls, entry: result.entry });
});

app.get("/api/public/image-proxy", async (req, res) => {
  const rawUrl = trimText(req.query.url, 1000);
  try {
    const url = new URL(rawUrl);
    const allowed = /(^|\.)doubanio\.com$/i.test(url.hostname) || /(^|\.)douban\.com$/i.test(url.hostname);
    if (!allowed) {
      res.status(400).json({ error: "Only Douban image URLs are allowed" });
      return;
    }

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Referer: "https://movie.douban.com/"
      }
    });
    if (!response.ok) {
      res.status(502).json({ error: "Image proxy fetch failed" });
      return;
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    if (!contentType.startsWith("image/")) {
      res.status(400).json({ error: "URL is not an image" });
      return;
    }

    const bytes = Buffer.from(await response.arrayBuffer());
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(bytes);
  } catch {
    res.status(400).json({ error: "Invalid image URL" });
  }
});

app.get("/api/public/images/:id", async (req, res) => {
  const imageId = trimText(req.params.id, 120);
  if (!imageId) {
    res.status(400).json({ success: false, message: "Image ID is required", images: [] });
    return;
  }

  const width = Math.min(Math.max(Number(req.query.w) || 400, 100), 2000);
  const formatParam = trimText(req.query.format, 10) || "auto";
  const returnType = trimText(req.query.return, 10) || "json";
  const bestFormat = formatParam !== "auto" ? formatParam : detectBestFormat(req.headers.accept);

  let thumbnailUrl: string | null = null;
  let originalUrl: string | null = null;

  if (db) {
    try {
      await ensureDatabaseSchema();
      const database = requireDatabase();
      const result = await database.query(
        "select url, metadata from media_assets where id = $1 and status = 'published' limit 1",
        [imageId]
      );
      if (result.rowCount) {
        const row = result.rows[0];
        originalUrl = row.url;
        const meta = typeof row.metadata === "object" && row.metadata ? row.metadata : {};
        const thumbnails = (meta.thumbnails || {}) as Record<string, string>;

        const candidateWidths = [150, 400, 800].filter((w) => w >= width);
        const targetWidth = candidateWidths.length > 0 ? candidateWidths[0] : 800;
        thumbnailUrl = thumbnails[`${targetWidth}w`] || null;
      }
    } catch {
      // database lookup best-effort
    }
  }

  const serveUrl = thumbnailUrl || originalUrl;

  if (!serveUrl) {
    res.status(404).json({ success: false, message: "Image not found", images: [] });
    return;
  }

  if (returnType === "redirect") {
    res.redirect(302, serveUrl);
    return;
  }

  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  res.json({
    success: true,
    width,
    format: bestFormat,
    url: serveUrl,
    originalUrl,
    thumbnailUrl,
    detectedFormat: bestFormat,
    imageId
  });
});

app.post("/api/public/media/upload", publicWriteLimit, uploadImageFile, async (req, res) => {
  const file = req.file;
  if (!file) {
    res.status(400).json({ error: "Image file is required" });
    return;
  }

  const scope = trimText(req.body?.scope, 80) || "feedback";
  try {
    const asset = await saveMediaAsset(file, null, scope);
    res.json({ asset, storage: asset.metadata.storage });
  } catch (error) {
    sendUploadFailure(res, error);
  }
});

app.get("/api/admin/users", async (req, res) => {
  const auth = await requireOwner(req, res);
  if (!auth) return;
  if (!db) {
    sendDatabaseRequired(res);
    return;
  }

  const database = requireDatabase();
  const result = await database.query("select * from auth_users order by created_at desc");
  res.json({ users: result.rows.map((row) => toPublicUser(authUserFromRow(row))) });
});

app.post("/api/admin/users", async (req, res) => {
  const auth = await requireOwner(req, res);
  if (!auth) return;
  if (!db) {
    sendDatabaseRequired(res);
    return;
  }

  const name = trimText(req.body?.name, 80);
  const email = trimText(req.body?.email, 160).toLowerCase();
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  const role = ["owner", "admin", "user"].includes(req.body?.role) ? req.body.role as UserRole : "user";
  const status = ["active", "disabled"].includes(req.body?.status) ? req.body.status as UserStatus : "active";

  if (!name || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8) {
    res.status(400).json({ error: "Name, valid email and password with at least 8 characters are required" });
    return;
  }

  await ensureAuthDatabase();
  const database = requireDatabase();
  const existing = await database.query("select id from auth_users where email = $1 limit 1", [email]);
  if (existing.rowCount) {
    res.status(409).json({ error: "Email is already registered" });
    return;
  }

  const now = new Date().toISOString();
  const passwordData = hashPassword(password);
  const user: AuthUser = {
    id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    email,
    name,
    role,
    status,
    passwordHash: passwordData.hash,
    passwordSalt: passwordData.salt,
    createdAt: now,
    updatedAt: now
  };

  const insertResult = await database.query(
    `insert into auth_users (id, email, name, role, status, password_hash, password_salt, created_at, updated_at, last_login_at) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) returning uid`,
    [user.id, user.email, user.name, user.role, user.status, user.passwordHash, user.passwordSalt, user.createdAt, user.updatedAt, user.lastLoginAt || null]
  );
  user.uid = insertResult.rows[0]?.uid === undefined ? undefined : Number(insertResult.rows[0].uid);
  const usersResult = await database.query("select * from auth_users order by created_at desc");
  res.json({ user: toPublicUser(user), users: usersResult.rows.map((row) => toPublicUser(authUserFromRow(row))) });
});

app.patch("/api/admin/users/:id", async (req, res) => {
  const auth = await requireOwner(req, res);
  if (!auth) return;
  if (!db) {
    sendDatabaseRequired(res);
    return;
  }

  const database = requireDatabase();
  const targetResult = await database.query("select * from auth_users where id = $1 limit 1", [req.params.id]);
  const target = targetResult.rows[0] ? authUserFromRow(targetResult.rows[0]) : null;
  if (!target) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const nextRole = ["owner", "admin", "user"].includes(req.body?.role) ? req.body.role as UserRole : target.role;
  const nextStatus = ["active", "disabled"].includes(req.body?.status) ? req.body.status as UserStatus : target.status;
  const activeOwners = await database.query("select count(*)::int as count from auth_users where role = 'owner' and status = 'active'");
  const wouldRemoveActiveOwner = target.role === "owner" && target.status === "active" && (nextRole !== "owner" || nextStatus !== "active");

  if (wouldRemoveActiveOwner && Number(activeOwners.rows[0]?.count || 0) <= 1) {
    res.status(400).json({ error: "Cannot remove the last active owner" });
    return;
  }

  const previousRole = target.role;
  const previousStatus = target.status;
  target.name = trimText(req.body?.name, 80) || target.name;
  target.role = nextRole;
  target.status = nextStatus;
  target.updatedAt = new Date().toISOString();
  await database.query("update auth_users set name = $1, role = $2, status = $3, updated_at = $4 where id = $5", [target.name, target.role, target.status, target.updatedAt, target.id]);
  if (target.status !== previousStatus || target.role !== previousRole) await database.query("delete from auth_sessions where user_id = $1", [target.id]);
  const usersResult = await database.query("select * from auth_users order by created_at desc");

  res.json({ user: toPublicUser(target), users: usersResult.rows.map((row) => toPublicUser(authUserFromRow(row))) });
});

app.get("/api/admin/posts", async (req, res) => {
  const auth = await requireWorkspaceAdmin(req, res);
  if (!auth) return;
  if (!db) {
    sendDatabaseRequired(res);
    return;
  }

  await ensureDatabaseSchema();
  const database = requireDatabase();
  const conditions: string[] = [];
  const params: unknown[] = [];
  const status = typeof req.query.status === "string" ? req.query.status.trim() : "all";
  const query = typeof req.query.q === "string" ? req.query.q.trim() : "";

  if (status && status !== "all") {
    params.push(status);
    conditions.push(`p.status = $${params.length}`);
  }

  if (query) {
    params.push(`%${query}%`);
    conditions.push(`(p.title ilike $${params.length} or coalesce(p.summary, '') ilike $${params.length} or coalesce(u.name, '') ilike $${params.length})`);
  }

  const whereClause = conditions.length ? `where ${conditions.join(" and ")}` : "";
  const result = await database.query(
    `select p.*, u.name as author_name
     from posts p
     left join auth_users u on u.id = p.author_id
     ${whereClause}
     order by p.updated_at desc
     limit 200`,
    params
  );

  res.json({ posts: result.rows.map(rowToPostRecord) });
});

app.post("/api/admin/posts", async (req, res) => {
  const auth = await requireWorkspaceAdmin(req, res);
  if (!auth) return;
  if (!db) {
    sendDatabaseRequired(res);
    return;
  }

  const title = trimText(req.body?.title, 160);
  const summary = trimText(req.body?.summary, 420) || undefined;
  const content = trimText(req.body?.content, 50000);
  const coverUrl = trimText(req.body?.coverUrl, 700) || undefined;
  const tags = cleanPostTags(req.body?.tags);
  const status = normalizePostStatus(req.body?.status, "draft");
  const visibility = normalizePostVisibility(req.body?.visibility, "public");

  if (!title) {
    res.status(400).json({ error: "Title is required" });
    return;
  }

  if (status === "published" && content.length < 10) {
    res.status(400).json({ error: "Content must be at least 10 characters before publishing" });
    return;
  }

  await ensureDatabaseSchema();
  const database = requireDatabase();
  const now = new Date().toISOString();
  const id = `post-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const slug = await uniquePostSlug(database, trimText(req.body?.slug, 120) || title);
  const publishedAt = status === "published" ? now : null;

  await database.query(
    `insert into posts (id, author_id, title, slug, summary, content, cover_url, status, visibility, tags, published_at, created_at, updated_at)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
    [id, auth.user.id, title, slug, summary || null, content, coverUrl || null, status, visibility, tags, publishedAt, now, now]
  );

  const post = await readPostById(database, id);
  if (!post) {
    res.status(500).json({ error: "Post was not saved" });
    return;
  }

  await insertPostRevision(database, post, auth.user.id);
  await writePostEvent(auth, status === "published" ? `管理员发布文章：${post.title}` : `管理员创建文章：${post.title}`, post.id, "post.created");
  res.json({ post });
});

app.patch("/api/admin/posts/:id", async (req, res) => {
  const auth = await requireWorkspaceAdmin(req, res);
  if (!auth) return;
  if (!db) {
    sendDatabaseRequired(res);
    return;
  }

  await ensureDatabaseSchema();
  const database = requireDatabase();
  const existing = await readPostById(database, req.params.id);
  if (!existing) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  const title = trimText(req.body?.title, 160) || existing.title;
  const summary = req.body?.summary === undefined ? existing.summary : trimText(req.body.summary, 420) || undefined;
  const content = typeof req.body?.content === "string" ? trimText(req.body.content, 50000) : existing.content;
  const coverUrl = req.body?.coverUrl === undefined ? existing.coverUrl : trimText(req.body.coverUrl, 700) || undefined;
  const tags = req.body?.tags === undefined ? existing.tags : cleanPostTags(req.body.tags);
  const status = normalizePostStatus(req.body?.status, existing.status);
  const visibility = normalizePostVisibility(req.body?.visibility, existing.visibility);

  if (status === "published" && content.length < 10) {
    res.status(400).json({ error: "Content must be at least 10 characters before publishing" });
    return;
  }

  const slug = typeof req.body?.slug === "string" && req.body.slug.trim()
    ? await uniquePostSlug(database, req.body.slug, existing.id)
    : existing.slug;
  const now = new Date().toISOString();
  const publishedAt = status === "published" ? existing.publishedAt || now : existing.publishedAt || null;

  await database.query(
    `update posts
     set title = $1, slug = $2, summary = $3, content = $4, cover_url = $5, status = $6, visibility = $7, tags = $8, published_at = $9, updated_at = $10
     where id = $11`,
    [title, slug, summary || null, content, coverUrl || null, status, visibility, tags, publishedAt, now, existing.id]
  );

  const post = await readPostById(database, existing.id);
  if (!post) {
    res.status(500).json({ error: "Post was not updated" });
    return;
  }

  await insertPostRevision(database, post, auth.user.id);
  const statusLabel: Record<PostStatus, string> = {
    draft: "保存草稿",
    pending: "标记待审核",
    published: "发布",
    hidden: "隐藏",
    rejected: "退回",
    archived: "归档"
  };
  await writePostEvent(auth, `管理员${statusLabel[post.status]}文章：${post.title}`, post.id);
  res.json({ post });
});

app.post("/api/admin/media/upload", uploadImageFile, async (req, res) => {
  const auth = await requireWorkspaceAdmin(req, res);
  if (!auth) return;

  const file = req.file;
  if (!file) {
    res.status(400).json({ error: "Image file is required" });
    return;
  }

  const scope = trimText(req.body?.scope, 80) || "admin";
  try {
    const asset = await saveMediaAsset(file, auth, scope);
    res.json({ asset, storage: asset.metadata.storage });
  } catch (error) {
    sendUploadFailure(res, error);
  }
});

app.get("/api/public/bootstrap", async (_req, res) => {
  const store = await loadStore();

  res.json({
    siteVersion: store.siteVersion,
    content: publicContent(store),
    updatedAt: new Date().toISOString()
  });
});

app.get("/api/public/content", async (req, res) => {
  const store = await loadStore();
  const keys = typeof req.query.keys === "string"
    ? req.query.keys.split(",").map((key) => key.trim()).filter(Boolean)
    : undefined;

  res.json({
    siteVersion: store.siteVersion,
    content: publicContent(store, keys)
  });
});

app.get("/api/public/posts", async (req, res) => {
  if (!db) {
    res.json({ posts: [], tags: [] });
    return;
  }

  await ensureDatabaseSchema();
  const database = requireDatabase();
  const conditions = ["p.status = 'published'", "p.visibility = 'public'"];
  const params: unknown[] = [];
  const tag = typeof req.query.tag === "string" ? req.query.tag.trim() : "";
  const query = typeof req.query.q === "string" ? req.query.q.trim() : "";

  if (tag) {
    params.push(tag);
    conditions.push(`$${params.length} = any(p.tags)`);
  }

  if (query) {
    params.push(`%${query}%`);
    conditions.push(`(p.title ilike $${params.length} or coalesce(p.summary, '') ilike $${params.length} or p.content ilike $${params.length})`);
  }

  const result = await database.query(
    `select p.*, u.name as author_name
     from posts p
     left join auth_users u on u.id = p.author_id
     where ${conditions.join(" and ")}
     order by p.published_at desc nulls last, p.created_at desc
     limit 80`,
    params
  );
  const tagResult = await database.query(
    "select distinct unnest(tags) as tag from posts where status = 'published' and visibility = 'public' order by tag limit 80"
  );

  res.json({
    posts: result.rows.map((row) => publicPostSummary(rowToPostRecord(row))),
    tags: tagResult.rows.map((row) => row.tag).filter(Boolean)
  });
});

app.get("/api/public/posts/:slug", async (req, res) => {
  if (!db) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  await ensureDatabaseSchema();
  const database = requireDatabase();
  const result = await database.query(
    `select p.*, u.name as author_name
     from posts p
     left join auth_users u on u.id = p.author_id
     where p.slug = $1 and p.status = 'published' and p.visibility in ('public', 'unlisted')
     limit 1`,
    [req.params.slug]
  );

  if (!result.rows[0]) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  const post = rowToPostRecord(result.rows[0]);
  res.json({ post: { ...publicPostSummary(post), content: post.content } });
});

app.get("/api/public/posts/:slug/comments", async (req, res) => {
  if (!db) {
    res.json({ comments: [] });
    return;
  }

  await ensureDatabaseSchema();
  const database = requireDatabase();
  const result = await database.query(
    `select c.*, p.slug as post_slug, coalesce(u.name, c.author_name) as author_name
     from post_comments c
     join posts p on p.id = c.post_id
     left join auth_users u on u.id = c.author_id
     where p.slug = $1 and p.status = 'published' and p.visibility in ('public', 'unlisted') and c.status = 'published'
     order by c.created_at desc
     limit 200`,
    [req.params.slug]
  );

  res.json({ comments: result.rows.map(rowToPostCommentRecord) });
});

app.post("/api/public/posts/:slug/comments", publicWriteLimit, async (req, res) => {
  const auth = await requireSignedIn(req, res);
  if (!auth) return;

  if (!db) {
    sendDatabaseRequired(res);
    return;
  }

  const content = trimText(req.body?.content, 1000);
  if (content.length < 2) {
    res.status(400).json({ error: "Comment must be at least 2 characters" });
    return;
  }

  await ensureDatabaseSchema();
  const database = requireDatabase();
  const postResult = await database.query(
    "select id, slug from posts where slug = $1 and status = 'published' and visibility in ('public', 'unlisted') limit 1",
    [req.params.slug]
  );
  const post = postResult.rows[0];
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  const now = new Date().toISOString();
  const id = `post-comment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const insertResult = await database.query(
    `insert into post_comments (id, post_id, author_id, author_name, content, status, created_at, updated_at)
     values ($1,$2,$3,$4,$5,'published',$6,$6)
     returning *, $7::text as post_slug`,
    [id, post.id, auth.user.id, auth.user.name, content, now, post.slug]
  );

  await writePostEvent(auth, `用户评论文章：${post.slug}`, post.id, "post.comment.created");
  res.json({ comment: rowToPostCommentRecord(insertResult.rows[0]) });
});

app.post("/api/public/analytics/visit", analyticsLimit, async (req, res) => {
  const pathValue = trimText(req.body?.path, 120) || "#home";
  const title = trimText(req.body?.title, 80) || pathValue;
  const visitorHash = anonymousVisitorHash(trimText(req.body?.visitorId, 120), req);
  const nowDate = new Date();
  const now = nowDate.toISOString();
  const hour = hourBucket(nowDate).toISOString();

  if (db) {
    await ensureDatabaseSchema();
    const client = await db.connect();
    try {
      await client.query("begin");
      const inserted = await client.query(
        `insert into analytics_visitors (hour, path, visitor_hash, first_seen_at, last_seen_at)
         values ($1,$2,$3,$4,$4)
         on conflict (hour, path, visitor_hash) do update set last_seen_at = excluded.last_seen_at
         returning (xmax = 0) as inserted`,
        [hour, pathValue, visitorHash, now]
      );
      const uniqueDelta = inserted.rows[0]?.inserted ? 1 : 0;
      await client.query(
        `insert into analytics_hourly (hour, path, title, views, unique_visitors, last_visited_at)
         values ($1,$2,$3,1,$4,$5)
         on conflict (hour, path) do update set
           title = excluded.title,
           views = analytics_hourly.views + 1,
           unique_visitors = analytics_hourly.unique_visitors + excluded.unique_visitors,
           last_visited_at = excluded.last_visited_at`,
        [hour, pathValue, title, uniqueDelta, now]
      );
      await client.query("commit");
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }

  const result = await mutateStore((store) => {
    const entry = store.entries["analytics.site"];
    if (!entry) return { status: 500, error: "Analytics store is not configured" };

    const analytics = normalizeSiteAnalytics(entry.draft || entry.published);
    const existingPage = analytics.pages.find((page) => page.path === pathValue);
    const pages = existingPage
      ? analytics.pages.map((page) => page.path === pathValue ? { ...page, title, views: page.views + 1, lastVisitedAt: now } : page)
      : [{ path: pathValue, title, views: 1, lastVisitedAt: now }, ...analytics.pages];

    const uniqueKey = `analytics-visitor:${visitorHash}`;
    const knownVisitors = analytics.knownVisitors || [];
    const nextKnownVisitors = !knownVisitors.includes(uniqueKey) ? [uniqueKey, ...knownVisitors].slice(0, 5000) : knownVisitors;
    const nextAnalytics = {
      ...analytics,
      totalViews: analytics.totalViews + 1,
      uniqueVisitors: Math.max(analytics.uniqueVisitors, nextKnownVisitors.length || analytics.uniqueVisitors),
      lastVisitedAt: now,
      pages,
      knownVisitors: nextKnownVisitors
    };

    entry.draft = nextAnalytics;
    entry.published = nextAnalytics;
    entry.status = "published";
    entry.updatedAt = now;
    entry.publishedAt = now;
    return { status: 200 };
  });

  if (result.status !== 200) {
    res.status(result.status).json({ error: result.error });
    return;
  }

  res.json({ ok: true });
});

async function analyticsFromDatabase() {
  if (!db) return null;
  await ensureDatabaseSchema();
  const [summary, pages, trend24h, trend7d] = await Promise.all([
    db.query("select coalesce(sum(views),0)::int as total_views, coalesce(sum(unique_visitors),0)::int as unique_visitors, max(last_visited_at) as last_visited_at from analytics_hourly"),
    db.query(
      `select path, max(title) as title, coalesce(sum(views),0)::int as views, coalesce(sum(unique_visitors),0)::int as unique_visitors, max(last_visited_at) as last_visited_at
       from analytics_hourly
       group by path
       order by views desc, last_visited_at desc
       limit 30`
    ),
    db.query(
      `select hour, coalesce(sum(views),0)::int as views, coalesce(sum(unique_visitors),0)::int as unique_visitors
       from analytics_hourly
       where hour >= now() - interval '24 hours'
       group by hour
       order by hour asc`
    ),
    db.query(
      `select hour, coalesce(sum(views),0)::int as views, coalesce(sum(unique_visitors),0)::int as unique_visitors
       from analytics_hourly
       where hour >= now() - interval '7 days'
       group by hour
       order by hour asc`
    )
  ]);

  const row = summary.rows[0] || {};
  return {
    totalViews: Number(row.total_views || 0),
    uniqueVisitors: Number(row.unique_visitors || 0),
    lastVisitedAt: row.last_visited_at ? toIsoString(row.last_visited_at) : undefined,
    knownVisitors: [],
    trend24h: trend24h.rows.map(rowToTrendPoint),
    trend7d: trend7d.rows.map(rowToTrendPoint),
    pages: pages.rows.map((page) => ({
      path: page.path,
      title: page.title || page.path,
      views: Number(page.views || 0),
      uniqueVisitors: Number(page.unique_visitors || 0),
      lastVisitedAt: page.last_visited_at ? toIsoString(page.last_visited_at) : undefined
    }))
  } satisfies SiteAnalyticsContent;
}

app.get("/api/admin/analytics", async (req, res) => {
  const auth = await requireWorkspaceAdmin(req, res);
  if (!auth) return;

  const databaseAnalytics = await analyticsFromDatabase();
  if (databaseAnalytics) {
    res.json({ analytics: databaseAnalytics });
    return;
  }

  const store = await loadStore();
  const entry = store.entries["analytics.site"];
  const analytics = normalizeSiteAnalytics(entry?.draft || entry?.published);
  res.json({ analytics });
});

async function getMonitoringSummary(): Promise<ServerMonitoringSummary> {
  if (!db) {
    return {
      enabled: false,
      checkedAt: new Date().toISOString(),
      thresholds: {
        cpuPercent: runtimeConfig.monitoringCpuWarningPercent,
        memoryPercent: runtimeConfig.monitoringMemoryWarningPercent,
        diskPercent: runtimeConfig.monitoringDiskWarningPercent,
        consecutiveFailures: runtimeConfig.monitoringFailureThreshold,
        retentionDays: runtimeConfig.monitoringRetentionDays
      },
      history: [],
      alerts: []
    };
  }

  await ensureDatabaseSchema();
  let current = lastMetricSample;
  if (!current) {
    current = await collectServerMetricSample();
  }

  const [history, alerts] = await Promise.all([
    db.query("select * from server_metric_samples order by sampled_at desc limit 120"),
    db.query("select * from server_alerts where status in ('open', 'ack') order by opened_at desc limit 50")
  ]);

  return {
    enabled: true,
    checkedAt: new Date().toISOString(),
    thresholds: {
      cpuPercent: runtimeConfig.monitoringCpuWarningPercent,
      memoryPercent: runtimeConfig.monitoringMemoryWarningPercent,
      diskPercent: runtimeConfig.monitoringDiskWarningPercent,
      consecutiveFailures: runtimeConfig.monitoringFailureThreshold,
      retentionDays: runtimeConfig.monitoringRetentionDays
    },
    current: current || undefined,
    history: history.rows.map(rowToMetricSample).reverse(),
    alerts: alerts.rows.map(rowToServerAlert)
  };
}

app.get("/api/admin/monitoring/summary", async (req, res) => {
  const auth = await requireWorkspaceAdmin(req, res);
  if (!auth) return;

  res.json({ monitoring: await getMonitoringSummary() });
});

app.post("/api/admin/monitoring/alerts/:id/ack", async (req, res) => {
  const auth = await requireWorkspaceAdmin(req, res);
  if (!auth) return;
  if (!db) {
    sendDatabaseRequired(res);
    return;
  }

  await ensureDatabaseSchema();
  const result = await db.query(
    `update server_alerts
     set status = 'ack', acknowledged_at = now(), acknowledged_by = $2, last_seen_at = now()
     where id = $1 and status = 'open'
     returning *`,
    [req.params.id, auth.user.id]
  );

  if (!result.rows[0]) {
    res.status(404).json({ error: "Open alert not found" });
    return;
  }

  res.json({ alert: rowToServerAlert(result.rows[0]) });
});

app.post("/api/public/screenings/source-submissions", publicWriteLimit, async (req, res) => {
  const sourceId = trimText(req.body?.sourceId, 120);
  const sourceTitle = trimText(req.body?.sourceTitle, 160);
  const content = trimText(req.body?.content, 1200);
  const field = ["description", "sourceUrl", "sourceNote", "fanshiReview", "other"].includes(req.body?.field) ? req.body.field : "other";

  if (!sourceId || !sourceTitle || content.length < 4) {
    res.status(400).json({ error: "sourceId, sourceTitle and content are required" });
    return;
  }

  const submission: ScreeningSourceSubmission = {
    id: `source-submission-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    sourceId,
    sourceTitle,
    field,
    content,
    contact: trimText(req.body?.contact, 160) || undefined,
    submitter: trimText(req.body?.submitter, 80) || undefined,
    status: "pending",
    createdAt: new Date().toISOString()
  };

  const result = await mutateStore((store) => {
    const entry = store.entries["screenings.sourceSubmissions"];
    if (!entry) return { status: 500, error: "Submission store is not configured" };

    const current = normalizeSourceSubmissions(entry.draft);

    const dedupContent = content.trim().toLowerCase();
    const duplicate = current.items.find(
      (item) => item.sourceId === sourceId && item.field === field && (item.content || "").trim().toLowerCase() === dedupContent
    );
    if (duplicate) {
      return { data: { submission: duplicate, duplicate: true } };
    }

    entry.draft = { items: [submission, ...current.items] };
    entry.status = "draft";
    entry.updatedAt = new Date().toISOString();
    return { status: 200 };
  });

  if (result.status !== 200) {
    if (result.data) {
      res.json({ ok: true, submission: result.data.submission, duplicate: true });
      return;
    }
    res.status(result.status).json({ error: result.error });
    return;
  }

  res.json({ ok: true, submission });
});

app.post("/api/public/feedback-submissions", publicWriteLimit, async (req, res) => {
  const title = trimText(req.body?.title, 120);
  const content = trimText(req.body?.content, 1600);
  const category = (["content", "copyright", "bug", "feature", "other"].includes(req.body?.category) ? req.body.category : "other") as FeedbackSubmission["category"];
  const auth = await currentAuthUser(req as AuthenticatedRequest);
  const requestedRole = ["visitor", "user", "admin", "owner"].includes(req.body?.submitterRole)
    ? req.body.submitterRole as NonNullable<FeedbackSubmission["submitterRole"]>
    : "visitor";
  const submitterRole: NonNullable<FeedbackSubmission["submitterRole"]> = auth?.user.role || requestedRole;
  const source = (["about", "screening_nomination", "workspace", "plaza", "other"].includes(req.body?.source) ? req.body.source : "about") as NonNullable<FeedbackSubmission["source"]>;
  const imageUrls = normalizeFeedbackImageUrls(req.body?.imageUrls);
  const metadata = normalizeFeedbackMetadata(req.body?.metadata);
  const bannedWord = findBannedFeedbackWord(title, content, req.body?.contact);

  if (source === "plaza" && !auth) {
    res.status(401).json({ error: "登录后可以提交图库反馈" });
    return;
  }

  if (!title || content.length < 6) {
    res.status(400).json({ error: "title and content are required" });
    return;
  }

  const submission: FeedbackSubmission = {
    id: `feedback-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    category,
    title,
    content,
    contact: trimText(req.body?.contact, 160) || undefined,
    submitter: trimText(req.body?.submitter, 80) || auth?.user.name || undefined,
    submitterRole,
    source,
    imageUrls,
    metadata,
    status: bannedWord ? "rejected" : "pending",
    createdAt: new Date().toISOString(),
    reviewedAt: bannedWord ? new Date().toISOString() : undefined,
    reviewNote: bannedWord ? `自动拒绝：命中违禁词「${bannedWord}」` : undefined
  };

  const result = await mutateStore((store) => {
    const entry = store.entries["feedback.submissions"];
    if (!entry) return { status: 500, error: "Feedback store is not configured" };

    const current = normalizeFeedbackSubmissions(entry.draft);
    entry.draft = { items: [submission, ...current.items] };
    entry.status = "draft";
    entry.updatedAt = new Date().toISOString();
    return { status: 200 };
  });

  if (result.status !== 200) {
    res.status(result.status).json({ error: result.error });
    return;
  }

  res.json({ ok: true, submission, blocked: Boolean(bannedWord), blockedWord: bannedWord });
});

app.patch("/api/admin/submissions/:kind/:id/review", async (req, res) => {
  const auth = await requireWorkspaceAdmin(req, res);
  if (!auth) return;

  const kind = req.params.kind;
  const submissionId = req.params.id;
  const decision = req.body?.decision;
  if (kind !== "source" && kind !== "feedback") {
    res.status(400).json({ error: "Submission kind must be source or feedback" });
    return;
  }
  if (decision !== "pending" && decision !== "approved" && decision !== "rejected") {
    res.status(400).json({ error: "Decision must be pending, approved or rejected" });
    return;
  }

  const result = await mutateStore((store) => {
    const key = kind === "source" ? "screenings.sourceSubmissions" : "feedback.submissions";
    const entry = store.entries[key];
    if (!entry) return { status: 500, error: "Submission store is not configured" };

    const reviewedAt = new Date().toISOString();
    const message = req.body?.message || `${kind} submission reviewed: ${decision}`;
    if (kind === "source") {
      const content = normalizeSourceSubmissions(entry.draft);
      const existing = content.items.find((item) => item.id === submissionId);
      if (!existing) return { status: 404, error: "Submission not found" };

      const nextContent: ScreeningSourceSubmissionsContent = {
        items: content.items.map((item) => item.id === submissionId ? { ...item, status: decision, reviewedAt: decision === "pending" ? undefined : reviewedAt } : item)
      };
      entry.draft = nextContent;
      entry.published = nextContent;
      entry.status = "published";

      if (decision === "approved") {
        const libEntry = store.entries["screenings.library"];
        if (libEntry) {
          const libContent = libEntry.draft || {};
          const libItems = Array.isArray((libContent as any)?.items) ? [...(libContent as any).items] : [];
          const target = libItems.find((item: any) => item.id === existing.sourceId);
          if (target) {
            const f = existing.field;
            const c = (existing.content || "").trim();
            if (f === "description" && c.length > 10 && (!target.description || target.description.length < 10)) {
              target.description = c;
            }
            if (f === "sourceUrl" && c) {
              const u = (c.match(/https?:\/\/[^\s]+/) || [])[0] || c;
              if (!target.sourceUrl) target.sourceUrl = u;
              if (!target.sourceNote) target.sourceNote = c;
              else if (target.sourceNote !== c) target.sourceNote = target.sourceNote + "; " + c;
            }
            if (f === "sourceNote" && c) {
              if (!target.sourceNote) target.sourceNote = c;
              else if (!target.sourceNote.includes(c)) target.sourceNote = target.sourceNote + "; " + c;
            }
            if (f === "fanshiReview" && c) {
              if (!target.fanshiReview) target.fanshiReview = c;
              else if (!target.fanshiReview.includes(c)) target.fanshiReview = target.fanshiReview + "\n" + c;
            }
            if (f === "other" && c) {
              if (!target.sourceNote) target.sourceNote = c;
              else if (!target.sourceNote.includes(c)) target.sourceNote = target.sourceNote + "; " + c;
            }
            libEntry.draft = { ...(libContent as any), items: libItems };
            libEntry.published = libEntry.draft;
            libEntry.status = "published";
            libEntry.version += 1;
            libEntry.updatedAt = reviewedAt;
          }
        }
      }
    } else {
      const content = normalizeFeedbackSubmissions(entry.draft);
      const existing = content.items.find((item) => item.id === submissionId);
      if (!existing) return { status: 404, error: "Submission not found" };

      entry.draft = {
        items: content.items.map((item) => item.id === submissionId ? { ...item, status: decision, reviewedAt: decision === "pending" ? undefined : reviewedAt } : item)
      } satisfies FeedbackSubmissionsContent;
      entry.status = "draft";
    }

    store.siteVersion += kind === "source" ? 1 : 0;
    entry.version += 1;
    entry.updatedAt = reviewedAt;
    if (kind === "source") entry.publishedAt = reviewedAt;

    const eventKeys = kind === "source" && decision === "approved" ? [key, "screenings.library"] : [key];
    const event = {
      id: `evt_${Date.now()}`,
      type: "submission.reviewed",
      keys: eventKeys,
      version: store.siteVersion,
      message,
      ...authEventActor(auth),
      createdAt: reviewedAt
    };
    store.events.unshift(event);
    store.events = store.events.slice(0, 100);
    return { status: 200, entry, event };
  });

  if (result.status !== 200) {
    res.status(result.status).json({ error: result.error });
    return;
  }

  broadcast("submission.reviewed", result.event);
  if (kind === "source") {
    broadcast("content.published", { keys: result.event.keys });
  }
  res.json({ entry: result.entry, event: result.event });
});

app.patch("/api/admin/plaza/items/:id/review", async (req, res) => {
  const auth = await requireWorkspaceAdmin(req, res);
  if (!auth) return;

  const itemId = trimText(req.params.id, 160);
  const decision = req.body?.decision;
  if (decision !== "approve" && decision !== "reject") {
    res.status(400).json({ error: "Decision must be approve or reject" });
    return;
  }

  const reviewedAt = new Date().toISOString();
  const reviewNote = trimText(req.body?.reviewNote, 500) || undefined;

  const result = await mutateStore((store) => {
    const entry = store.entries["plaza.main"];
    if (!entry) return { status: 500, error: "Plaza store is not configured" };

    const draft = normalizePlazaContent(entry.draft);
    const published = normalizePlazaContent(entry.published);
    const existing = draft.souls.find((item) => item.id === itemId) || published.souls.find((item) => item.id === itemId);
    if (!existing) return { status: 404, error: "Plaza item not found" };

    let nextDraft: PlazaContent;
    let nextPublished: PlazaContent;
    const isUserSubmission = Boolean(existing.submittedByUserId || existing.submissionKind === "user-single" || existing.submissionKind === "user-batch");

    if (decision === "approve") {
      const approved: PlazaSoulItem = {
        ...existing,
        visibility: "visible",
        reviewedAt,
        reviewedBy: auth.user.name,
        reviewNote
      };
      const draftSouls = draft.souls.map((item) => item.id === itemId ? approved : item);
      const publishedSouls = [approved, ...published.souls.filter((item) => item.id !== itemId)];
      const tags = Array.from(new Set([...draft.tags, ...published.tags, ...approved.tags]));
      nextDraft = { ...draft, souls: draftSouls, tags };
      nextPublished = { ...published, souls: publishedSouls, tags };
    } else {
      nextDraft = { ...draft, souls: draft.souls.filter((item) => item.id !== itemId) };
      nextPublished = { ...published, souls: published.souls.filter((item) => item.id !== itemId) };
    }

    store.siteVersion += 1;
    entry.draft = nextDraft;
    entry.published = nextPublished;
    entry.status = "published";
    entry.version += 1;
    entry.updatedAt = reviewedAt;
    entry.publishedAt = reviewedAt;

    const event = {
      id: `evt_${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: "content.published",
      keys: ["plaza.main"],
      version: store.siteVersion,
      message: decision === "approve" ? `Approved plaza submission: ${existing.name}` : `Rejected plaza submission: ${existing.name}`,
      ...authEventActor(auth),
      createdAt: reviewedAt
    };
    store.events.unshift(event);
    store.events = store.events.slice(0, 100);
    return { status: 200, entry, event, item: existing, deleteAsset: decision === "reject" && isUserSubmission };
  });

  if (result.status !== 200) {
    res.status(result.status).json({ error: result.error });
    return;
  }

  try {
    if (decision === "approve") {
      await markMediaAssetStatus(result.item.mediaAssetId, "published", { reviewedAt, reviewedBy: auth.user.name });
    } else if (result.deleteAsset) {
      await hardDeleteMediaAsset(result.item.mediaAssetId, result.item.avatarSrc);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Media asset update failed";
    res.status(500).json({ error: message, entry: result.entry });
    return;
  }

  broadcast("content.published", result.event);
  res.json({ entry: result.entry, event: result.event });
});

const plazaLikes = new Map<string, boolean>();

app.post("/api/public/plaza/items/:id/like", async (req, res) => {
  const itemId = trimText(req.params.id, 140);
  if (!itemId) {
    res.status(400).json({ error: "Item ID is required" });
    return;
  }

  const ipFingerprint = sha256Hex(`${req.ip || "0.0.0.0"}|${req.headers["user-agent"] || ""}|${itemId}`);
  const alreadyLiked = plazaLikes.has(ipFingerprint);

  const result = await mutateStore((store) => {
    const entry = store.entries["plaza.main"];
    if (!entry) return { status: 404, error: "Plaza content not found" };

    const draft = (entry.draft || {}) as Partial<PlazaContent>;
    const published = (entry.published || {}) as Partial<PlazaContent>;

    const updateSouls = (souls: PlazaSoulItem[]) =>
      souls.map((s) => {
        if (s.id !== itemId) return s;
        return { ...s, likes: Math.max(0, (s.likes || 0) + (alreadyLiked ? -1 : 1)) };
      });

    const nextDraft = draft.souls ? { ...draft, souls: updateSouls(draft.souls as PlazaSoulItem[]) } : draft;
    const nextPublished = published.souls ? { ...published, souls: updateSouls(published.souls as PlazaSoulItem[]) } : published;

    entry.draft = nextDraft;
    entry.published = nextPublished;
    entry.version += 1;
    entry.updatedAt = new Date().toISOString();

    return {
      status: 200,
      liked: !alreadyLiked,
      likes: (draft.souls as PlazaSoulItem[])?.find((s) => s.id === itemId)?.likes ?? 0
    };
  });

  if (result.status !== 200) {
    res.status(result.status).json({ error: result.error });
    return;
  }

  if (alreadyLiked) {
    plazaLikes.delete(ipFingerprint);
  } else {
    plazaLikes.set(ipFingerprint, true);
  }

  res.json({ liked: result.liked, likes: result.likes + (result.liked ? 1 : -1) });
});

const plazaViewTimestamps = new Map<string, number>();

app.post("/api/public/plaza/items/:id/view", async (req, res) => {
  const itemId = trimText(req.params.id, 140);
  if (!itemId) {
    res.status(400).json({ error: "Item ID is required" });
    return;
  }

  const ipFingerprint = sha256Hex(`${req.ip || "0.0.0.0"}|${req.headers["user-agent"] || ""}|${itemId}`);
  const lastView = plazaViewTimestamps.get(ipFingerprint) || 0;
  const now = Date.now();

  if (now - lastView < 3600000) {
    res.json({ views: 0, skipped: true });
    return;
  }

  const result = await mutateStore((store) => {
    const entry = store.entries["plaza.main"];
    if (!entry) return { status: 404, error: "Plaza content not found" };

    const draft = (entry.draft || {}) as Partial<PlazaContent>;
    const published = (entry.published || {}) as Partial<PlazaContent>;

    const updateSouls = (souls: PlazaSoulItem[]) =>
      souls.map((s) => {
        if (s.id !== itemId) return s;
        return { ...s, views: (s.views || 0) + 1 };
      });

    const nextDraft = draft.souls ? { ...draft, souls: updateSouls(draft.souls as PlazaSoulItem[]) } : draft;
    const nextPublished = published.souls ? { ...published, souls: updateSouls(published.souls as PlazaSoulItem[]) } : published;

    entry.draft = nextDraft;
    entry.published = nextPublished;
    entry.version += 1;
    entry.updatedAt = new Date().toISOString();

    return { status: 200 };
  });

  if (result.status !== 200) {
    res.status(result.status).json({ error: result.error });
    return;
  }

  plazaViewTimestamps.set(ipFingerprint, now);
  res.json({ views: 1, skipped: false });
});

app.get("/api/admin/content", async (req, res) => {
  const auth = await requireWorkspaceAdmin(req, res);
  if (!auth) return;

  const store = await loadStore();

  res.json({
    siteVersion: store.siteVersion,
    entries: Object.values(store.entries)
  });
});

app.patch("/api/admin/content/:key/draft", async (req, res) => {
  const auth = await requireWorkspaceAdmin(req, res);
  if (!auth) return;

  const key = req.params.key;
  const expectedVersion = typeof req.body?.expectedVersion === "number" ? req.body.expectedVersion : undefined;
  const expectedUpdatedAt = typeof req.body?.expectedUpdatedAt === "string" ? req.body.expectedUpdatedAt : undefined;
  const result = await mutateStore((store) => {
    const entry = store.entries[key];
    if (!entry) return { status: 404, error: "Content entry not found" };

    if ((expectedVersion !== undefined && entry.version !== expectedVersion) || (expectedUpdatedAt && entry.updatedAt !== expectedUpdatedAt)) {
      return { status: 409, error: "Content entry has been changed by another user", entry };
    }

    entry.draft = req.body.payload;
    entry.status = "draft";
    entry.updatedAt = new Date().toISOString();
    const isSubmissionReview = key === "screenings.sourceSubmissions" || key === "feedback.submissions";
    const event = {
      id: `evt_${Date.now()}`,
      type: isSubmissionReview ? "submission.reviewed" : "content.draft.updated",
      keys: [key],
      version: store.siteVersion,
      message: req.body?.message || (isSubmissionReview ? "Reviewed user submission" : "Draft updated from workspace"),
      ...authEventActor(auth),
      createdAt: entry.updatedAt
    };
    store.events.unshift(event);
    store.events = store.events.slice(0, 100);
    return { status: 200, entry, event };
  });

  if (result.status !== 200) {
    res.status(result.status).json({ error: result.error, entry: result.entry });
    return;
  }

  broadcast("content.draft.updated", result.event);
  res.json({ entry: result.entry, event: result.event });
});

app.get("/api/admin/media/settings", async (req, res) => {
  const auth = await requireWorkspaceAdmin(req, res);
  if (!auth) return;

  const settings = await loadMediaScraperSettings();
  res.json({ settings });
});

app.patch("/api/admin/media/settings", async (req, res) => {
  const auth = await requireWorkspaceAdmin(req, res);
  if (!auth) return;

  const current = await loadMediaScraperSettings();
  const payload = req.body as Partial<MediaScraperSettings>;
  const settings: MediaScraperSettings = {
    tmdbApiKey: typeof payload.tmdbApiKey === "string" ? payload.tmdbApiKey.trim() : current.tmdbApiKey,
    tmdbApiBase: typeof payload.tmdbApiBase === "string" && payload.tmdbApiBase.trim() ? payload.tmdbApiBase.trim().replace(/\/$/, "") : current.tmdbApiBase,
    bangumiApiBase: typeof payload.bangumiApiBase === "string" && payload.bangumiApiBase.trim() ? payload.bangumiApiBase.trim().replace(/\/$/, "") : current.bangumiApiBase,
    bangumiImageBase: typeof payload.bangumiImageBase === "string" && payload.bangumiImageBase.trim() ? payload.bangumiImageBase.trim().replace(/\/$/, "") : current.bangumiImageBase
  };

  await saveMediaScraperSettings(settings);
  res.json({ settings });
});

app.post("/api/admin/media/tmdb/test", async (req, res) => {
  const auth = await requireWorkspaceAdmin(req, res);
  if (!auth) return;

  const current = await loadMediaScraperSettings();
  const payload = req.body as Partial<MediaScraperSettings>;
  const settings: MediaScraperSettings = {
    ...current,
    tmdbApiKey: typeof payload.tmdbApiKey === "string" && payload.tmdbApiKey.trim() ? payload.tmdbApiKey.trim() : current.tmdbApiKey,
    tmdbApiBase: typeof payload.tmdbApiBase === "string" && payload.tmdbApiBase.trim() ? payload.tmdbApiBase.trim().replace(/\/$/, "") : current.tmdbApiBase
  };

  try {
    await fetchTmdbJson("configuration", settings, {});
    const data = await fetchTmdbJson("search/movie", settings, {
      query: "Inception",
      language: "zh-CN",
      include_adult: "false"
    }) as { results?: Array<Record<string, unknown>> };

    res.json({
      ok: true,
      configured: Boolean(settings.tmdbApiKey || runtimeConfig.tmdbApiKey),
      resultCount: data.results?.length || 0,
      firstTitle: data.results?.[0]?.title || data.results?.[0]?.original_title || null
    });
  } catch (error) {
    res.status(502).json({
      ok: false,
      configured: Boolean(settings.tmdbApiKey || runtimeConfig.tmdbApiKey),
      error: error instanceof Error ? error.message : "TMDB test failed"
    });
  }
});

app.get("/api/admin/ai/settings", async (req, res) => {
  const auth = await requireWorkspaceAdmin(req, res);
  if (!auth) return;

  const settings = await loadAiCoreSettings();
  res.json({
    settings: {
      baseUrl: settings.baseUrl,
      model: settings.model,
      configured: Boolean(settings.apiKey),
      apiKeyPreview: maskSecret(settings.apiKey)
    }
  });
});

app.patch("/api/admin/ai/settings", async (req, res) => {
  const auth = await requireWorkspaceAdmin(req, res);
  if (!auth) return;

  const current = await loadAiCoreSettings();
  const payload = req.body as Partial<AiCoreSettings>;
  const settings = normalizeAiCoreSettings({
    apiKey: typeof payload.apiKey === "string" ? payload.apiKey : current.apiKey,
    baseUrl: typeof payload.baseUrl === "string" ? payload.baseUrl : current.baseUrl,
    model: typeof payload.model === "string" ? payload.model : current.model
  });

  await saveAiCoreSettings(settings);
  res.json({
    settings: {
      baseUrl: settings.baseUrl,
      model: settings.model,
      configured: Boolean(settings.apiKey),
      apiKeyPreview: maskSecret(settings.apiKey)
    }
  });
});

app.post("/api/admin/ai/models", async (req, res) => {
  const auth = await requireWorkspaceAdmin(req, res);
  if (!auth) return;

  const saved = await loadAiCoreSettings();
  const settings = normalizeAiCoreSettings({ ...saved, ...(req.body as Partial<AiCoreSettings>) });

  try {
    const models = await fetchOpenAiModels(settings);
    res.json({ models });
  } catch (error) {
    res.status(502).json({ error: error instanceof Error ? error.message : "Model search failed", models: [] });
  }
});

app.post("/api/admin/ai/heartbeat", async (req, res) => {
  const auth = await requireWorkspaceAdmin(req, res);
  if (!auth) return;

  const saved = await loadAiCoreSettings();
  const settings = normalizeAiCoreSettings({ ...saved, ...(req.body as Partial<AiCoreSettings>) });

  try {
    const response = await fetch(`${settings.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${settings.apiKey}`
      },
      body: JSON.stringify({
        model: settings.model,
        max_tokens: 8,
        messages: [{ role: "user", content: "ping" }]
      })
    });

    if (!response.ok) throw new Error(`Heartbeat failed: ${response.status}`);
    res.json({ ok: true, message: "连接可用" });
  } catch (error) {
    res.status(502).json({ ok: false, message: error instanceof Error ? error.message : "Heartbeat failed" });
  }
});

app.post("/api/admin/media/search", async (req, res) => {
  const auth = await requireWorkspaceAdmin(req, res);
  if (!auth) return;

  const request = req.body as MediaScrapeRequest;

  if (!request.query?.trim() && !request.sourceUrl?.trim()) {
    res.status(400).json({ error: "Query or sourceUrl is required" });
    return;
  }

  const settings = await loadMediaScraperSettings();
  const { candidates, warnings } = await scrapeMediaCandidatesDetailed({
    ...request,
    providers: normalizeMediaProviders(request.providers)
  });

  res.json({
    candidates,
    warnings,
    providerStatus: {
      tmdbConfigured: Boolean(settings.tmdbApiKey || runtimeConfig.tmdbApiKey),
      tmdbApiBase: settings.tmdbApiBase,
      bangumiApiBase: settings.bangumiApiBase,
      bangumiImageBase: settings.bangumiImageBase,
      redirectPlaybackOnly: true
    }
  });
});

app.post("/api/admin/media/parse", async (req, res) => {
  const auth = await requireWorkspaceAdmin(req, res);
  if (!auth) return;

  const request = req.body as MediaScrapeRequest;

  if (!request.query?.trim() && !request.sourceUrl?.trim()) {
    res.status(400).json({ error: "Query or sourceUrl is required" });
    return;
  }

  const settings = await loadMediaScraperSettings();
  const candidate = buildLocalCandidate(request);

  res.json({
    candidate,
    providerStatus: {
      tmdbConfigured: Boolean(settings.tmdbApiKey || runtimeConfig.tmdbApiKey),
      tmdbApiBase: settings.tmdbApiBase,
      bangumiApiBase: settings.bangumiApiBase,
      bangumiImageBase: settings.bangumiImageBase,
      redirectPlaybackOnly: true
    }
  });
});

app.post("/api/admin/media/metadata/complete", async (req, res) => {
  const auth = await requireWorkspaceAdmin(req, res);
  if (!auth) return;

  const request = req.body as MediaMetadataCompleteRequest;
  const item = request.item;
  if (!item?.id || !item.title?.trim()) {
    res.status(400).json({ error: "A source item with id and title is required" });
    return;
  }

  try {
    const suggestion = await completeMediaMetadataItem(item, normalizeMediaProviders(request.providers), request.overwrite !== false);
    res.json({ suggestion, warnings: suggestion.risks });
  } catch (error) {
    res.status(502).json({
      error: error instanceof Error ? error.message : "Metadata completion failed",
      warnings: ["自动补全失败，片源库未被修改"]
    });
  }
});

app.post("/api/admin/media/ai/complete", async (req, res) => {
  const auth = await requireWorkspaceAdmin(req, res);
  if (!auth) return;

  const request = req.body as MediaAiCompleteRequest;
  const rawItems = request.mode === "batch" ? request.items || [] : request.item ? [request.item] : [];
  const limit = Math.max(1, Math.min(request.limit || 8, 12));
  const items = rawItems
    .filter((item): item is ScreeningSourceItem => Boolean(item?.id && item?.title))
    .filter((item) => request.mode === "batch" ? needsAiCompletion(item) : true)
    .slice(0, limit);

  const aiSettings = await loadAiCoreSettings();
  if (!aiSettings.apiKey) {
    res.status(400).json({ error: "OPENAI_API_KEY is not configured" });
    return;
  }

  if (items.length === 0) {
    res.json({ suggestions: [], skipped: rawItems.length, warnings: ["没有需要补全的片源条目"] });
    return;
  }

  try {
    const suggestions: MediaAiSuggestion[] = [];
    for (const item of items) {
      suggestions.push(await completeMediaItem(item));
    }

    res.json({ suggestions, skipped: rawItems.length - items.length, warnings: [] });
  } catch (error) {
    res.status(502).json({
      error: error instanceof Error ? error.message : "AI completion failed",
      suggestions: [],
      skipped: rawItems.length - items.length,
      warnings: ["AI 补全失败，片源库草稿未被修改"]
    });
  }
});

app.post("/api/admin/talks/ai/summarize", async (req, res) => {
  const auth = await requireWorkspaceAdmin(req, res);
  if (!auth) return;

  const title = trimText(req.body?.title, 180);
  const date = trimText(req.body?.date, 40) || undefined;
  const text = trimText(req.body?.text, 50000);
  const videoUrl = trimText(req.body?.videoUrl, 700) || undefined;

  if (!title || text.length < 20) {
    res.status(400).json({ error: "Title and at least 20 characters of source text are required" });
    return;
  }

  try {
    res.json(await summarizeTalkWithAi({ title, date, text, videoUrl }));
  } catch (error) {
    res.status(502).json({ error: error instanceof Error ? error.message : "Talk AI summarize failed" });
  }
});

const uploadJsonFile = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }).single("file");

app.post("/api/admin/talks/import-json", uploadJsonFile, async (req, res) => {
  const auth = await requireWorkspaceAdmin(req, res);
  if (!auth) return;

  const file = req.file;
  if (!file) {
    res.status(400).json({ error: "JSON file is required" });
    return;
  }

  if (file.mimetype !== "application/json" && !file.originalname.endsWith(".json")) {
    res.status(400).json({ error: "Only JSON files are supported" });
    return;
  }

  let data: { videos?: Array<{ title?: string; url?: string; date?: string; duration?: string; playCount?: string; danmakuCount?: string }>; total?: number };
  try {
    const text = file.buffer.toString("utf-8");
    data = JSON.parse(text);
  } catch {
    res.status(400).json({ error: "Invalid JSON format" });
    return;
  }

  const videos = Array.isArray(data.videos) ? data.videos : [];
  if (!videos.length) {
    res.status(400).json({ error: "JSON must contain a videos array" });
    return;
  }

  const result = await mutateStore((store) => {
    const entry = store.entries["talks.main"];
    if (!entry) return { status: 404, error: "Talks content not found" };

    const talksContent = (entry.published || entry.draft || {}) as Record<string, unknown>;
    const archive: Array<Record<string, unknown>> = Array.isArray(talksContent.archive) ? [...talksContent.archive] : [];

    // dedup set from existing non-placeholder items
    const existingUrls = new Set(
      archive
        .filter((t) => {
          const u = String(t.sourceUrl || "").trim();
          return u && u !== "https://www.bilibili.com/" && !u.includes("example.com");
        })
        .map((t) => String(t.sourceUrl || "").trim())
    );

    // remove placeholders
    const cleaned = archive.filter((t) => {
      const u = String(t.sourceUrl || "").trim();
      return !(!u || u === "https://www.bilibili.com/" || u.includes("example.com") || u.includes("placeholder"));
    });
    const removedCount = archive.length - cleaned.length;

    let addedCount = 0;
    let skippedCount = 0;

    for (const video of videos) {
      const sourceUrl = String(video.url || "").trim();
      if (!sourceUrl || existingUrls.has(sourceUrl)) {
        skippedCount += 1;
        continue;
      }

      const rawTitle = String(video.title || "");
      const bvid = (sourceUrl.match(/BV[a-zA-Z0-9]+/) || [])[0] || "";
      const title = rawTitle.replace(/^\s*【[^】]*】\s*/g, "").replace(/\s+/g, " ").trim();

      let viewers = 0;
      const pc = String(video.playCount || "").trim();
      if (pc.includes("万")) viewers = Math.round(parseFloat(pc) * 10000);
      else viewers = parseInt(pc, 10) || 0;

      let danmaku = 0;
      const dc = String(video.danmakuCount || "").trim();
      if (dc !== "-" && dc !== "--") {
        if (dc.includes("万")) danmaku = Math.round(parseFloat(dc) * 10000);
        else danmaku = parseInt(dc, 10) || 0;
      }

      let duration = "";
      const rawDur = String(video.duration || "");
      const parts = rawDur.split(":").map(Number);
      if (parts.length === 3) {
        const [h, m, s] = parts;
        if (h > 0 && m > 0) duration = `${h}时${m}分`;
        else if (h > 0) duration = `${h}时`;
        else if (m > 0 && s > 0) duration = `${m}分${s}秒`;
        else if (m > 0) duration = `${m}分`;
        else duration = `${s}秒`;
      } else if (parts.length === 2) {
        const [m, s] = parts;
        if (m > 0 && s > 0) duration = `${m}分${s}秒`;
        else duration = `${m}分`;
      }

      const t = (title + rawTitle).toLowerCase();
      let category = "other";
      if (t.includes("杂谈")) category = "talk";
      else if (t.includes("鉴赏") || t.includes("op/ed") || t.includes("oped") || t.includes("新番") || t.includes("联动") || t.includes("茶话会") || t.includes("一起看") || t.includes("狼人杀") || t.includes("谁是卧底") || t.includes("发布会") || t.includes("入坑")) category = "special";

      const talk: Record<string, unknown> = {
        id: `talk-${bvid || Date.now()}`,
        title,
        subtitle: rawTitle.replace(/^\s*【[^】]*】\s*/g, "").trim(),
        date: String(video.date || "").trim(),
        time: "",
        duration,
        coverUrl: "",
        status: "archived",
        category,
        host: "泛式",
        guests: [],
        tags: category === "talk" ? ["直播回放", "杂谈回"] : ["直播回放", "特别回"],
        summary: "",
        summaryBullets: [],
        highlights: [],
        viewers,
        danmaku,
        likes: 0,
        sourceUrl,
        videoUrl: sourceUrl,
        videoProvider: "bilibili",
        transcript: [],
        comments: [],
        mentions: []
      };

      cleaned.push(talk);
      existingUrls.add(sourceUrl);
      addedCount += 1;
    }

    // sort by date desc
    cleaned.sort((a, b) => {
      return String(b.date || "").localeCompare(String(a.date || ""));
    });

    // number episodes ascending
    const reversed = [...cleaned].reverse();
    reversed.forEach((t, idx) => { t.episodeNo = idx + 1; });

    // fix dangling liveTalkId
    const archiveIds = new Set(cleaned.map((t) => String(t.id)));
    let liveTalkId = String(talksContent.liveTalkId || "");
    if (liveTalkId && !archiveIds.has(liveTalkId)) liveTalkId = "";

    const nextContent = { ...talksContent, archive: cleaned, liveTalkId };

    entry.draft = nextContent;
    entry.published = nextContent;
    entry.status = "published";
    entry.version = (entry.version || 0) + 1;
    entry.updatedAt = new Date().toISOString();
    entry.publishedAt = new Date().toISOString();

    store.siteVersion += 1;

    store.events.push({
      id: `event-talks-import-${Date.now()}`,
      type: "talks.imported",
      keys: ["talks.main"],
      version: store.siteVersion,
      message: `导入杂谈录像: ${addedCount} 新增, ${skippedCount} 跳过, ${removedCount} 清理`,
      actorId: auth.user.id,
      actorName: auth.user.name,
      actorRole: auth.user.role,
      createdAt: new Date().toISOString()
    });

    broadcast("talks.imported", {
      key: "talks.main",
      imported: addedCount,
      skipped: skippedCount,
      removed: removedCount,
      total: cleaned.length
    });

    broadcast("content.published", {
      keys: ["talks.main"],
      message: `导入杂谈录像: ${addedCount} 新增, ${skippedCount} 跳过, ${removedCount} 清理`,
      actorId: auth.user.id,
      actorName: auth.user.name
    });

    return { data: { imported: addedCount, skipped: skippedCount, removed: removedCount, total: cleaned.length } };
  });

  if (result && "status" in result && result.status === 404) {
    res.status(404).json({ error: result.error });
    return;
  }

  res.json(result.data);
});

app.post("/api/admin/content/batch", async (req, res) => {
  const auth = await requireWorkspaceAdmin(req, res);
  if (!auth) return;

  const operations = Array.isArray(req.body?.operations) ? req.body.operations as Array<{
    key?: string;
    payload?: unknown;
    publish?: boolean;
    message?: string;
    expectedVersion?: number;
    expectedUpdatedAt?: string;
  }> : [];

  if (!operations.length) {
    res.status(400).json({ error: "Batch operations are required" });
    return;
  }

  const result = await mutateStore((store) => {
    for (const operation of operations) {
      const key = trimText(operation.key, 120);
      const entry = store.entries[key];
      if (!entry) return { status: 404, error: `Content entry not found: ${key}` };
      if (typeof operation.expectedVersion === "number" && entry.version !== operation.expectedVersion) {
        return { status: 409, error: `Content entry has been changed by another user: ${key}`, key, entry };
      }
      if (typeof operation.expectedUpdatedAt === "string" && entry.updatedAt !== operation.expectedUpdatedAt) {
        return { status: 409, error: `Content entry has been changed by another user: ${key}`, key, entry };
      }
    }

    const events: ContentStore["events"] = [];
    const entries: ContentEntry[] = [];
    const now = new Date().toISOString();

    for (const operation of operations) {
      const key = trimText(operation.key, 120);
      const entry = store.entries[key];
      entry.draft = operation.payload;
      entry.status = operation.publish ? "published" : "draft";
      entry.updatedAt = now;

      if (operation.publish) {
        store.siteVersion += 1;
        entry.version += 1;
        entry.published = entry.draft;
        entry.publishedAt = now;
      }

      const event = {
        id: `evt_${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type: operation.publish ? "content.published" : "content.draft.updated",
        keys: [key],
        version: store.siteVersion,
        message: operation.message || req.body?.message || (operation.publish ? "Published from batch workspace operation" : "Draft updated from batch workspace operation"),
        ...authEventActor(auth),
        createdAt: now
      };
      store.events.unshift(event);
      events.push(event);
      entries.push(entry);
    }

    store.events = store.events.slice(0, 100);
    return { status: 200, entries, events, siteVersion: store.siteVersion };
  });

  if (result.status !== 200) {
    res.status(result.status).json({ error: result.error, key: result.key, entry: result.entry });
    return;
  }

  for (const event of result.events) {
    broadcast(event.type, event);
  }

  res.json({ entries: result.entries, events: result.events, siteVersion: result.siteVersion });
});

app.post("/api/admin/content/:key/publish", async (req, res) => {
  const auth = await requireWorkspaceAdmin(req, res);
  if (!auth) return;

  const key = req.params.key;
  const expectedVersion = typeof req.body?.expectedVersion === "number" ? req.body.expectedVersion : undefined;
  const expectedUpdatedAt = typeof req.body?.expectedUpdatedAt === "string" ? req.body.expectedUpdatedAt : undefined;
  const result = await mutateStore((store) => {
    const entry = store.entries[key];
    if (!entry) return { status: 404, error: "Content entry not found" };

    if ((expectedVersion !== undefined && entry.version !== expectedVersion) || (expectedUpdatedAt && entry.updatedAt !== expectedUpdatedAt)) {
      return { status: 409, error: "Content entry has been changed by another user", entry, siteVersion: store.siteVersion };
    }

    const now = new Date().toISOString();
    store.siteVersion += 1;
    entry.version += 1;
    entry.status = "published";
    entry.published = entry.draft;
    entry.updatedAt = now;
    entry.publishedAt = now;

    const event = {
      id: `evt_${Date.now()}`,
      type: "content.published",
      keys: [key],
      version: store.siteVersion,
      message: req.body?.message || "Published from workspace",
      ...authEventActor(auth),
      createdAt: now
    };
    store.events.unshift(event);
    store.events = store.events.slice(0, 100);
    return { status: 200, entry, event, siteVersion: store.siteVersion };
  });

  if (result.status !== 200) {
    res.status(result.status).json({ error: result.error, entry: result.entry, siteVersion: result.siteVersion });
    return;
  }

  broadcast("content.published", result.event);
  res.json({ entry: result.entry, event: result.event, siteVersion: result.siteVersion });
});

app.get("/api/admin/events", async (req, res) => {
  const auth = await requireWorkspaceAdmin(req, res);
  if (!auth) return;

  const store = await loadStore();
  res.json({ events: store.events });
});

registerRealtimeRoute(app);

registerContentRoutes(app, {
  loadStore,
  mutateStore,
  publicContent,
  broadcast,
  requireWorkspaceAdmin: async (req: express.Request, res: express.Response) => requireWorkspaceAdmin(req, res),
  trimText
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Content API request failed", error);
  if (res.headersSent) return;

  res.status(500).json({
    error: isProduction ? "Internal server error" : error instanceof Error ? error.message : "Internal server error"
  });
});

assertProductionConfig();
await ensureStore();
startMonitoringJobs();

app.listen(runtimeConfig.port, () => {
  console.log(`Content API listening at http://localhost:${runtimeConfig.port}`);
});
