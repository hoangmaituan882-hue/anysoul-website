import type { BootstrapResponse, ContentResponse, FeedbackSubmission, MediaAssetRecord, PostCommentRecord, PostRecord, PublicPostDetail, PublicPostSummary, ScreeningSourceSubmission } from "./types";

const inferredApiBase = typeof window === "undefined" ? "http://localhost:8787" : `http://${window.location.hostname || "localhost"}:8787`;

export const CONTENT_API_BASE = import.meta.env.VITE_CONTENT_API_URL || import.meta.env.VITE_CONTENT_API_BASE || inferredApiBase;

export async function fetchBootstrap() {
  const response = await fetch(`${CONTENT_API_BASE}/api/public/bootstrap`);

  if (!response.ok) {
    throw new Error(`Failed to fetch bootstrap content: ${response.status}`);
  }

  return response.json() as Promise<BootstrapResponse>;
}

export async function fetchPublishedContent(keys: string[]) {
  const query = encodeURIComponent(keys.join(","));
  const response = await fetch(`${CONTENT_API_BASE}/api/public/content?keys=${query}`);

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
