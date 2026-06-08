import express from "express";
import multer from "multer";
import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, rename, statfs, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { Pool } from "pg";
import { defaultHomeFaq, defaultHomeHero } from "../src/content/defaults/home";
import { defaultGamingMain } from "../src/content/defaults/gaming";
import { defaultPlazaContent } from "../src/content/defaults/plaza";
import { defaultFeedbackSubmissions } from "../src/content/defaults/feedback";
import { defaultSiteAnalytics } from "../src/content/defaults/analytics";
import { defaultScreeningLibrary } from "../src/content/defaults/screeningLibrary";
import type { FeedbackSubmission, FeedbackSubmissionsContent, PostCommentRecord, PostRecord, PostStatus, PostVisibility, ScreeningLibraryContent, ScreeningMovie, ScreeningScheduleContent, ScreeningSourceItem, ScreeningSourceSubmission, ScreeningSourceSubmissionsContent, ScreeningTodoContent, ServerAlert, ServerMetricSample, ServerMonitoringSummary, SiteAnalyticsContent, SiteAnalyticsTrendPoint } from "../src/content/types";
import {
  defaultScreeningsAnime,
  defaultScreeningsClassics,
  defaultScreeningsNext,
  defaultScreeningsSchedule,
  defaultScreeningSourceSubmissions,
  defaultScreeningsStats,
  defaultScreeningsTodo
} from "../src/content/defaults/screenings";

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
};

type MediaScraperSettings = {
  tmdbApiKey: string;
  bangumiApiBase: string;
  bangumiImageBase: string;
};

type MediaScrapeCandidate = ScreeningSourceItem & {
  provider: "tmdb" | "bilibili" | "bangumi" | "jikan" | "wiki" | "local";
  confidence: number;
};

type MediaAiCompleteRequest = {
  item?: ScreeningSourceItem;
  items?: ScreeningSourceItem[];
  mode?: "single" | "batch";
  limit?: number;
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

type MediaAiSuggestion = {
  id: string;
  title: string;
  patch: Partial<ScreeningSourceItem>;
  confidence: number;
  reason: string;
  risks: string[];
  sourceProviders: string[];
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const dataDir = path.join(projectRoot, "server", "data");
const storePath = path.join(dataDir, "content-store.json");
const schemaPath = path.join(projectRoot, "server", "schema.sql");
const mediaSettingsPath = path.join(dataDir, "media-scraper-settings.json");
const aiSettingsPath = path.join(dataDir, "ai-settings.json");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

function csvEnv(value = "") {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function boolEnv(value: string | undefined, fallback: boolean) {
  if (value === undefined || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

function normalizedUrl(value: string, fallback: string) {
  return (value || fallback).trim().replace(/\/$/, "");
}

const runtimeConfig = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.CONTENT_API_PORT || process.env.PORT || 8787),
  databaseUrl: process.env.DATABASE_URL || "",
  ownerAccountIds: csvEnv(process.env.OWNER_ACCOUNT_IDS || "2546399970"),
  corsOrigins: csvEnv(process.env.CONTENT_API_CORS_ORIGINS || process.env.APP_URL || ""),
  jsonLimit: process.env.CONTENT_API_JSON_LIMIT || "1mb",
  trustProxy: Number(process.env.CONTENT_API_TRUST_PROXY || 1),
  requireHttps: boolEnv(process.env.CONTENT_API_REQUIRE_HTTPS, false),
  securityHeadersEnabled: boolEnv(process.env.CONTENT_API_SECURITY_HEADERS, true),
  authLoginWindowMs: Number(process.env.AUTH_LOGIN_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  authLoginMax: Number(process.env.AUTH_LOGIN_RATE_LIMIT_MAX || 10),
  authRegisterWindowMs: Number(process.env.AUTH_REGISTER_RATE_LIMIT_WINDOW_MS || 60 * 60 * 1000),
  authRegisterMax: Number(process.env.AUTH_REGISTER_RATE_LIMIT_MAX || 5),
  adminWriteWindowMs: Number(process.env.ADMIN_WRITE_RATE_LIMIT_WINDOW_MS || 10 * 60 * 1000),
  adminWriteMax: Number(process.env.ADMIN_WRITE_RATE_LIMIT_MAX || 120),
  monitoringRetentionDays: Number(process.env.MONITORING_RETENTION_DAYS || 180),
  monitoringSampleIntervalMs: Number(process.env.MONITORING_SAMPLE_INTERVAL_MS || 60 * 1000),
  monitoringCpuWarningPercent: Number(process.env.MONITORING_CPU_WARNING_PERCENT || 85),
  monitoringMemoryWarningPercent: Number(process.env.MONITORING_MEMORY_WARNING_PERCENT || 85),
  monitoringDiskWarningPercent: Number(process.env.MONITORING_DISK_WARNING_PERCENT || 90),
  monitoringFailureThreshold: Number(process.env.MONITORING_FAILURE_THRESHOLD || 2),
  tmdbApiKey: process.env.TMDB_API_KEY || "",
  openAiApiKey: process.env.OPENAI_API_KEY || "",
  openAiBaseUrl: normalizedUrl(process.env.OPENAI_BASE_URL || "", "https://api.openai.com/v1"),
  openAiModel: process.env.OPENAI_MODEL || "gpt-4o-mini",
  mediaUploadMaxBytes: Number(process.env.MEDIA_UPLOAD_MAX_BYTES || 5 * 1024 * 1024),
  objectStorageDriver: (process.env.OBJECT_STORAGE_DRIVER || process.env.OBJECT_STORAGE_PROVIDER || "local").toLowerCase(),
  objectStorageEndpoint: normalizedUrl(process.env.OBJECT_STORAGE_ENDPOINT || process.env.S3_ENDPOINT || "", ""),
  objectStorageBucket: process.env.OBJECT_STORAGE_BUCKET || process.env.S3_BUCKET || "",
  objectStorageRegion: process.env.OBJECT_STORAGE_REGION || process.env.AWS_REGION || "auto",
  objectStorageAccessKeyId: process.env.OBJECT_STORAGE_ACCESS_KEY_ID || process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || "",
  objectStorageSecretAccessKey: process.env.OBJECT_STORAGE_SECRET_ACCESS_KEY || process.env.S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || "",
  objectStoragePublicBaseUrl: normalizedUrl(process.env.OBJECT_STORAGE_PUBLIC_BASE_URL || process.env.S3_PUBLIC_BASE_URL || "", ""),
  objectStoragePrefix: (process.env.OBJECT_STORAGE_PREFIX || "uploads").replace(/^\/+|\/+$/g, ""),
  objectStorageForcePathStyle: (process.env.OBJECT_STORAGE_FORCE_PATH_STYLE || "true") !== "false"
};

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
  bangumiApiBase: "https://bgmapi.anibt.net",
  bangumiImageBase: "https://bgmimg.anibt.net"
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
    }
  },
  events: []
};

const clients = new Set<express.Response>();

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

async function searchTmdbCandidates(request: MediaScrapeRequest, settings: MediaScraperSettings): Promise<MediaScrapeCandidate[]> {
  const token = settings.tmdbApiKey || runtimeConfig.tmdbApiKey;
  const query = extractTitle(request.query || "");
  if (!token || !query) return [];

  const sourceUrl = normalizeBilibiliUrl(request.sourceUrl || request.query);
  const endpoint = request.mediaType === "anime" || request.mediaType === "series" ? "tv" : "movie";
  const url = new URL(`https://api.themoviedb.org/3/search/${endpoint}`);
  url.searchParams.set("query", query);
  url.searchParams.set("language", "zh-CN");
  url.searchParams.set("include_adult", "false");

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json"
    }
  });

  if (!response.ok) return [];
  const data = await response.json() as { results?: Array<Record<string, unknown>> };
  const today = new Date().toISOString().slice(0, 10);

  return (data.results || []).slice(0, 6).map((item, index) => {
    const title = String(item.title || item.name || query);
    const originalTitle = String(item.original_title || item.original_name || "") || undefined;
    const releaseDate = String(item.release_date || item.first_air_date || "");
    const rating = typeof item.vote_average === "number" ? Number(item.vote_average.toFixed(1)) : undefined;
    const type = inferSourceType(title, request.mediaType);
    const category = inferSourceCategory(title, rating);
    const posterPath = typeof item.poster_path === "string" ? item.poster_path : undefined;

    return {
      id: slugifyTitle(`${title}-${releaseDate || index}`),
      title,
      originalTitle,
      type,
      category,
      year: releaseDate ? releaseDate.slice(0, 4) : undefined,
      rating,
      posterUrl: posterPath ? `https://image.tmdb.org/t/p/w342${posterPath}` : undefined,
      description: String(item.overview || "从 TMDB 搜索结果抓取的元数据，播放仍通过 Bilibili 链接外跳。"),
      tags: Array.from(new Set([type === "anime" ? "动画" : "电影", "TMDB", sourceUrl ? "Bilibili" : "待补链接"])),
      sourceUrl,
      sourceNote: sourceUrl ? "Bilibili 外跳播放链接，前台不内置播放器。" : undefined,
      status: "available" as const,
      priority: category === "classic" || category === "bad" ? "high" as const : "normal" as const,
      timesWatched: 0,
      addedAt: today,
      provider: "tmdb" as const,
      confidence: Math.max(0.62, 0.95 - index * 0.08)
    };
  });
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

async function scrapeMediaCandidates(request: MediaScrapeRequest) {
  const settings = await loadMediaScraperSettings();
  const local = buildLocalCandidate(request);
  const bilibili = await scrapeBilibiliCandidate(request).catch(() => undefined);
  const tmdb = await searchTmdbCandidates(request, settings).catch(() => []);
  const bangumi = await searchBangumiCandidates(request, settings).catch(() => []);
  const jikan = await searchJikanCandidates(request).catch(() => []);
  const wiki = await searchWikiCandidates(request).catch(() => []);
  const byTitle = new Map<string, MediaScrapeCandidate>();

  for (const candidate of [...tmdb, ...bangumi, ...jikan, ...wiki, ...(bilibili ? [bilibili] : []), local]) {
    const key = candidate.title.trim().toLowerCase();
    const existing = byTitle.get(key);
    if (!existing || candidate.confidence > existing.confidence || (!existing.posterUrl && candidate.posterUrl)) {
      byTitle.set(key, candidate);
    }
  }

  return Array.from(byTitle.values()).sort((a, b) => b.confidence - a.confidence);
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

function fallbackPatchFromCandidates(item: ScreeningSourceItem, candidates: MediaScrapeCandidate[]) {
  const best = candidates.find((candidate) => candidate.provider !== "local") || candidates[0];
  if (!best) return {};

  return sanitizeAiPatch({
    originalTitle: best.originalTitle,
    type: best.type,
    category: best.category,
    year: best.year,
    duration: best.duration,
    rating: best.rating,
    posterUrl: best.posterUrl,
    description: best.description,
    tags: Array.from(new Set([...item.tags, ...best.tags, "AI建议"])),
    sourceNote: item.sourceUrl ? "播放链接来自已配置的 Bilibili 外跳地址；元数据经抓取源与 AI 清洗。" : best.sourceNote
  }, item, candidates);
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

  for (const item of additions) {
    const titleKey = item.title.trim().toLowerCase();
    const existingId = byId.has(item.id) ? item.id : byTitle.get(titleKey);

    if (existingId) {
      const existing = byId.get(existingId);
      if (existing && existing.tags.length === 0 && item.tags.length > 0) {
        byId.set(existingId, { ...existing, tags: item.tags });
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

    const keys = Object.keys(store.entries);
    if (keys.length > 0) await client.query("delete from content_entries where not (key = any($1::text[]))", [keys]);

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

const localUploadDir = path.join(dataDir, "uploads");
const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: runtimeConfig.mediaUploadMaxBytes },
  fileFilter: (_req, file, callback) => {
    if (!allowedImageMimeTypes.has(file.mimetype)) {
      callback(new Error("Only JPEG, PNG, WebP and GIF images can be uploaded"));
      return;
    }

    callback(null, true);
  }
});

const allowedImageMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const imageExtensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif"
};

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

function hasValidImageSignature(buffer: Buffer, mimeType: string) {
  if (mimeType === "image/jpeg") return buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (mimeType === "image/png") return buffer.length > 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (mimeType === "image/webp") return buffer.length > 12 && buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP";
  if (mimeType === "image/gif") {
    const header = buffer.subarray(0, 6).toString("ascii");
    return header === "GIF87a" || header === "GIF89a";
  }

  return false;
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

function buildMediaObjectKey(file: Express.Multer.File, scope: string) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const extension = imageExtensions[file.mimetype] || "bin";
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

async function storeImageObject(file: Express.Multer.File, scope: string) {
  if (!allowedImageMimeTypes.has(file.mimetype) || !hasValidImageSignature(file.buffer, file.mimetype)) {
    throw new Error("Image signature does not match a supported image format");
  }

  const key = buildMediaObjectKey(file, scope);

  if (runtimeConfig.objectStorageDriver === "s3" || runtimeConfig.objectStorageDriver === "r2") {
    const url = await putS3CompatibleObject(key, file.buffer, file.mimetype);
    return { key, url, storage: "object" as const };
  }

  const targetPath = path.join(localUploadDir, ...key.split("/"));
  if (!targetPath.startsWith(localUploadDir)) {
    throw new Error("Invalid upload path");
  }

  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(targetPath, file.buffer);
  const publicBase = runtimeConfig.objectStoragePublicBaseUrl || `http://localhost:${runtimeConfig.port}`;
  return { key, url: `${publicBase.replace(/\/$/, "")}/uploads/${s3EncodePath(key)}`, storage: "local" as const };
}

async function saveMediaAsset(file: Express.Multer.File, auth: AuthSessionContext | null, scope: string) {
  const stored = await storeImageObject(file, scope);
  const now = new Date().toISOString();
  const asset = {
    id: `media-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ownerId: auth?.user.id,
    kind: "image" as const,
    url: stored.url,
    thumbnailUrl: stored.url,
    originalName: file.originalname,
    mimeType: file.mimetype,
    fileSize: file.size,
    hash: sha256Hex(file.buffer),
    status: "published" as const,
    metadata: { storage: stored.storage, objectKey: stored.key, scope },
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
    await database.query(`
      create table if not exists auth_users (
        id text primary key,
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
  if (!runtimeConfig.ownerAccountIds.length || runtimeConfig.ownerAccountIds.includes("2546399970")) missing.push("OWNER_ACCOUNT_IDS");

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
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
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
    `select u.* from auth_sessions s join auth_users u on u.id = s.user_id where s.token_hash = $1 and s.expires_at > now() and u.status = 'active' limit 1`,
    [tokenHash]
  );

  req.authContext = result.rows[0] ? { user: authUserFromRow(result.rows[0]) } : null;
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

function broadcast(event: string, payload: unknown) {
  const data = JSON.stringify(payload);

  for (const client of clients) {
    client.write(`event: ${event}\n`);
    client.write(`data: ${data}\n\n`);
  }
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
  await database.query(
    `insert into auth_users (id, email, name, role, status, password_hash, password_salt, created_at, updated_at, last_login_at) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [user.id, user.email, user.name, user.role, user.status, user.passwordHash, user.passwordSalt, user.createdAt, user.updatedAt, user.lastLoginAt]
  );
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
  const asset = await saveMediaAsset(file, auth, scope);
  res.json({ asset, storage: asset.metadata.storage });
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

  await database.query(
    `insert into auth_users (id, email, name, role, status, password_hash, password_salt, created_at, updated_at, last_login_at) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [user.id, user.email, user.name, user.role, user.status, user.passwordHash, user.passwordSalt, user.createdAt, user.updatedAt, user.lastLoginAt || null]
  );
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
  const asset = await saveMediaAsset(file, auth, scope);
  res.json({ asset, storage: asset.metadata.storage });
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
    entry.draft = { items: [submission, ...current.items] };
    entry.status = "draft";
    entry.updatedAt = new Date().toISOString();
    return { status: 200 };
  });

  if (result.status !== 200) {
    res.status(result.status).json({ error: result.error });
    return;
  }

  res.json({ ok: true, submission });
});

app.post("/api/public/feedback-submissions", publicWriteLimit, async (req, res) => {
  const title = trimText(req.body?.title, 120);
  const content = trimText(req.body?.content, 1600);
  const category = (["content", "copyright", "bug", "feature", "other"].includes(req.body?.category) ? req.body.category : "other") as FeedbackSubmission["category"];

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
    submitter: trimText(req.body?.submitter, 80) || undefined,
    status: "pending",
    createdAt: new Date().toISOString()
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

  res.json({ ok: true, submission });
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
  if (decision !== "approved" && decision !== "rejected") {
    res.status(400).json({ error: "Decision must be approved or rejected" });
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
        items: content.items.map((item) => item.id === submissionId ? { ...item, status: decision, reviewedAt } : item)
      };
      entry.draft = nextContent;
      entry.published = nextContent;
      entry.status = "published";
    } else {
      const content = normalizeFeedbackSubmissions(entry.draft);
      const existing = content.items.find((item) => item.id === submissionId);
      if (!existing) return { status: 404, error: "Submission not found" };

      entry.draft = {
        items: content.items.map((item) => item.id === submissionId ? { ...item, status: decision, reviewedAt } : item)
      } satisfies FeedbackSubmissionsContent;
      entry.status = "draft";
    }

    store.siteVersion += kind === "source" ? 1 : 0;
    entry.version += 1;
    entry.updatedAt = reviewedAt;
    if (kind === "source") entry.publishedAt = reviewedAt;

    const event = {
      id: `evt_${Date.now()}`,
      type: "submission.reviewed",
      keys: [key],
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
  res.json({ entry: result.entry, event: result.event });
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
    bangumiApiBase: typeof payload.bangumiApiBase === "string" && payload.bangumiApiBase.trim() ? payload.bangumiApiBase.trim().replace(/\/$/, "") : current.bangumiApiBase,
    bangumiImageBase: typeof payload.bangumiImageBase === "string" && payload.bangumiImageBase.trim() ? payload.bangumiImageBase.trim().replace(/\/$/, "") : current.bangumiImageBase
  };

  await saveMediaScraperSettings(settings);
  res.json({ settings });
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
  const candidates = await scrapeMediaCandidates(request);

  res.json({
    candidates,
    providerStatus: {
      tmdbConfigured: Boolean(settings.tmdbApiKey || runtimeConfig.tmdbApiKey),
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
      bangumiApiBase: settings.bangumiApiBase,
      bangumiImageBase: settings.bangumiImageBase,
      redirectPlaybackOnly: true
    }
  });
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

app.get("/api/realtime/content", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();
  res.write(`event: connected\n`);
  res.write(`data: ${JSON.stringify({ ok: true })}\n\n`);

  clients.add(res);
  req.on("close", () => {
    clients.delete(res);
  });
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
