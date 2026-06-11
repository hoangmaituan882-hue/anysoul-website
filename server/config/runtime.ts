// Runtime configuration extracted from environment variables

export function csvEnv(value = "") {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

export function boolEnv(value: string | undefined, fallback: boolean) {
  if (value === undefined || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

function normalizedUrl(value: string, fallback: string) {
  return (value || fallback).trim().replace(/\/$/, "");
}

export type RuntimeConfig = ReturnType<typeof loadRuntimeConfig>;

export function loadRuntimeConfig() {
  const nodeEnv = process.env.NODE_ENV || "development";

  return {
    nodeEnv,
    port: Number(process.env.CONTENT_API_PORT || process.env.PORT || 8787),
    databaseUrl: process.env.DATABASE_URL || "",
    ownerAccountIds: csvEnv(process.env.OWNER_ACCOUNT_IDS || (nodeEnv === "production" ? "" : "2546399970")),
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
    tmdbApiBase: normalizedUrl(process.env.TMDB_API_BASE || "", "https://api.themoviedb.org/3"),
    bangumiApiBase: normalizedUrl(process.env.BANGUMI_API_BASE || "", "https://bgmapi.anibt.net"),
    bangumiImageBase: normalizedUrl(process.env.BANGUMI_IMAGE_BASE || "", "https://bgmimg.anibt.net"),
    openAiApiKey: process.env.OPENAI_API_KEY || "",
    openAiBaseUrl: normalizedUrl(process.env.OPENAI_BASE_URL || "", "https://api.openai.com/v1"),
    openAiModel: process.env.OPENAI_MODEL || "gpt-4o-mini",
    mediaUploadMaxBytes: Number(process.env.MEDIA_UPLOAD_MAX_BYTES || 15 * 1024 * 1024),
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
}
