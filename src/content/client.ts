import type { BootstrapResponse, ContentResponse, FeedbackSubmission, MediaAssetRecord, PostCommentRecord, PostRecord, PublicPostDetail, PublicPostSummary, ScreeningSourceSubmission } from "./types";

export type WatchedSourceRecord = {
  sourceId: string;
  sourceTitle: string;
  watchedAt: string;
};

const inferredApiBase = typeof window === "undefined" ? "http://localhost:8787" : `http://${window.location.hostname || "localhost"}:8787`;

export const CONTENT_API_BASE = import.meta.env.VITE_CONTENT_API_URL || import.meta.env.VITE_CONTENT_API_BASE || inferredApiBase;

export function getImageUrl(assetId: string, options?: { w?: number; format?: string }) {
  const params = new URLSearchParams();
  if (options?.w) params.set("w", String(options.w));
  if (options?.format) params.set("format", options.format);
  const qs = params.toString();
  return `${CONTENT_API_BASE}/api/public/images/${encodeURIComponent(assetId)}${qs ? `?${qs}` : ""}`;
}

export function getImageSrcSet(assetId: string, widths: number[] = [150, 400, 800]) {
  return widths
    .map((w) => `${getImageUrl(assetId, { w })}&return=redirect ${w}w`)
    .join(", ");
}

export function extractAssetIdFromUrl(url: string): string | null {
  const match = url.match(/\/?media-(\d+)-[a-z0-9]+/i);
  if (match) return match[0].replace(/^\//, "");
  const thumbMatch = url.match(/thumbs\/(media-\d+-[a-z0-9]+)_/i);
  if (thumbMatch) return thumbMatch[1];
  return null;
}

export async function importTalksJson(
  authFetch: (input: string, init?: RequestInit) => Promise<Response>,
  file: File
) {
  const body = new FormData();
  body.set("file", file);

  const response = await authFetch(`${CONTENT_API_BASE}/api/admin/talks/import-json`, {
    method: "POST",
    body
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(data.error || `Import failed: ${response.status}`);
  }

  return response.json() as Promise<{ imported: number; skipped: number; removed: number; total: number }>;
}

export async function fetchBootstrap() {
  const response = await fetch(`${CONTENT_API_BASE}/api/public/bootstrap`, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Failed to fetch bootstrap content: ${response.status}`);
  }

  return response.json() as Promise<BootstrapResponse>;
}

export async function fetchPublishedContent(keys: string[]) {
  const query = encodeURIComponent(keys.join(","));
  const response = await fetch(`${CONTENT_API_BASE}/api/public/content?keys=${query}`, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Failed to fetch published content: ${response.status}`);
  }

  return response.json() as Promise<ContentResponse>;
}

export async function fetchPublicPosts(params: { tag?: string; q?: string } = {}) {
  const query = new URLSearchParams();
  if (params.tag) query.set("tag", params.tag);
  if (params.q) query.set("q", params.q);
  const suffix = query.toString() ? `?${query.toString()}` : "";
  const response = await fetch(`${CONTENT_API_BASE}/api/public/posts${suffix}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch public posts: ${response.status}`);
  }

  return response.json() as Promise<{ posts: PublicPostSummary[]; tags: string[] }>;
}

export async function fetchPublicPost(slug: string) {
  const response = await fetch(`${CONTENT_API_BASE}/api/public/posts/${encodeURIComponent(slug)}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch public post: ${response.status}`);
  }

  return response.json() as Promise<{ post: PublicPostDetail }>;
}

export async function fetchPostComments(slug: string) {
  const response = await fetch(`${CONTENT_API_BASE}/api/public/posts/${encodeURIComponent(slug)}/comments`);

  if (!response.ok) {
    throw new Error(`Failed to fetch post comments: ${response.status}`);
  }

  return response.json() as Promise<{ comments: PostCommentRecord[] }>;
}

export async function createPostComment(authFetch: (input: string, init?: RequestInit) => Promise<Response>, slug: string, content: string) {
  const response = await authFetch(`${CONTENT_API_BASE}/api/public/posts/${encodeURIComponent(slug)}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content })
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(data.error || `Failed to create post comment: ${response.status}`);
  }

  return response.json() as Promise<{ comment: PostCommentRecord }>;
}

export type PostDraftPayload = {
  title: string;
  summary?: string;
  content: string;
  coverUrl?: string;
  tags?: string[];
  visibility?: "public" | "private" | "unlisted";
  action?: "draft" | "submit";
};

export async function fetchMyPosts(authFetch: (input: string, init?: RequestInit) => Promise<Response>) {
  const response = await authFetch(`${CONTENT_API_BASE}/api/me/posts`);

  if (!response.ok) {
    throw new Error(`Failed to fetch my posts: ${response.status}`);
  }

  return response.json() as Promise<{ posts: PostRecord[] }>;
}

export async function fetchMyWatchedSources(authFetch: (input: string, init?: RequestInit) => Promise<Response>) {
  const response = await authFetch(`${CONTENT_API_BASE}/api/me/watched-sources`);

  if (!response.ok) {
    throw new Error(`Failed to fetch watched sources: ${response.status}`);
  }

  return response.json() as Promise<{ items: WatchedSourceRecord[] }>;
}

export async function createMyPost(authFetch: (input: string, init?: RequestInit) => Promise<Response>, payload: PostDraftPayload) {
  const response = await authFetch(`${CONTENT_API_BASE}/api/me/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(data.error || `Failed to create post: ${response.status}`);
  }

  return response.json() as Promise<{ post: PostRecord }>;
}

export async function updateMyPost(authFetch: (input: string, init?: RequestInit) => Promise<Response>, postId: string, payload: PostDraftPayload) {
  const response = await authFetch(`${CONTENT_API_BASE}/api/me/posts/${encodeURIComponent(postId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(data.error || `Failed to update post: ${response.status}`);
  }

  return response.json() as Promise<{ post: PostRecord }>;
}

export async function uploadImageAsset(
  authFetch: (input: string, init?: RequestInit) => Promise<Response>,
  file: File,
  options: { scope?: string; admin?: boolean } = {}
) {
  const body = new FormData();
  body.set("file", file);
  if (options.scope) body.set("scope", options.scope);

  const endpoint = options.admin ? "/api/admin/media/upload" : "/api/me/media/upload";
  const response = await authFetch(`${CONTENT_API_BASE}${endpoint}`, {
    method: "POST",
    body
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(data.error || `Image upload failed: ${response.status}`);
  }

  return response.json() as Promise<{ asset: MediaAssetRecord; storage: "local" | "object" }>;
}

export async function uploadPublicImageAsset(file: File, options: { scope?: string } = {}) {
  const body = new FormData();
  body.set("file", file);
  if (options.scope) body.set("scope", options.scope);

  const response = await fetch(`${CONTENT_API_BASE}/api/public/media/upload`, {
    method: "POST",
    body
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(data.error || `Image upload failed: ${response.status}`);
  }

  return response.json() as Promise<{ asset: MediaAssetRecord; storage: "local" | "object" }>;
}

export async function likePlazaItem(id: string) {
  const response = await fetch(`${CONTENT_API_BASE}/api/public/plaza/items/${encodeURIComponent(id)}/like`, { method: "POST" });
  if (!response.ok) {
    const data = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(data.error || `Like failed: ${response.status}`);
  }
  return response.json() as Promise<{ liked: boolean; likes: number }>;
}

export async function recordPlazaView(id: string) {
  const response = await fetch(`${CONTENT_API_BASE}/api/public/plaza/items/${encodeURIComponent(id)}/view`, { method: "POST" });
  if (!response.ok) {
    return { views: 0 };
  }
  return response.json() as Promise<{ views: number }>;
}

const LOCAL_SOURCE_SUBMISSIONS_KEY = "anysoul-local-source-submissions";
const LOCAL_FEEDBACK_SUBMISSIONS_KEY = "anysoul-local-feedback-submissions";

function readLocalItems<T>(key: string) {
  try {
    const items = JSON.parse(localStorage.getItem(key) || "[]") as T[];
    return items.filter((item) => !hasCorruptLocalText(item));
  } catch {
    return [] as T[];
  }
}

function hasCorruptLocalText(value: unknown): boolean {
  if (typeof value === "string") {
    const questionMarks = (value.match(/\?/g) || []).length;
    return value.includes("�") || questionMarks >= Math.max(3, Math.floor(value.length / 3));
  }

  if (Array.isArray(value)) return value.some(hasCorruptLocalText);
  if (value && typeof value === "object") return Object.values(value).some(hasCorruptLocalText);
  return false;
}

function writeLocalItems<T>(key: string, items: T[]) {
  localStorage.setItem(key, JSON.stringify(items));
}

export function getLocalSourceSubmissions() {
  return readLocalItems<ScreeningSourceSubmission>(LOCAL_SOURCE_SUBMISSIONS_KEY);
}

export function getLocalFeedbackSubmissions() {
  return readLocalItems<FeedbackSubmission>(LOCAL_FEEDBACK_SUBMISSIONS_KEY);
}

export function saveLocalSourceSubmissions(items: ScreeningSourceSubmission[]) {
  writeLocalItems(LOCAL_SOURCE_SUBMISSIONS_KEY, items);
}

export function saveLocalFeedbackSubmissions(items: FeedbackSubmission[]) {
  writeLocalItems(LOCAL_FEEDBACK_SUBMISSIONS_KEY, items);
}

export function appendLocalSourceSubmission(submission: ScreeningSourceSubmission) {
  saveLocalSourceSubmissions([submission, ...getLocalSourceSubmissions().filter((item) => item.id !== submission.id)]);
}

export function appendLocalFeedbackSubmission(submission: FeedbackSubmission) {
  saveLocalFeedbackSubmissions([submission, ...getLocalFeedbackSubmissions().filter((item) => item.id !== submission.id)]);
}
