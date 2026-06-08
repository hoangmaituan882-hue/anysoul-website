export type ContentMap = Record<string, unknown>;

export type BootstrapResponse = {
  siteVersion: number;
  content: ContentMap;
  updatedAt?: string;
};

export type ContentResponse = {
  siteVersion: number;
  content: ContentMap;
};

export type HomeHeroContent = {
  badge: string;
  titlePrefix: string;
  highlight1: string;
  highlight2: string;
  subtitle: string;
  browserTitle: string;
  browserStatus1: string;
  browserStatus2: string;
  chatMsg1: string;
  chatMsg2: string;
  chatMsg3: string;
  chatThinking: string;
  eventsTitle: string;
  events: string[];
  activityTitle: string;
  activityMemory: string;
  activityItem1: string;
  activityItem1Desc: string;
};

export type FaqContent = {
  title: string;
  items: Array<{
    question: string;
    answer: string;
  }>;
};

export type ScreeningMovie = {
  id: string;
  libraryId?: string;
  type: "good" | "bad" | "classic" | "anime" | "topic" | "other";
  title: string;
  description: string;
  rating?: number;
  originalTitle?: string;
  year?: string;
  duration?: string;
  posterUrl?: string;
  sourceUrl?: string;
  tags?: string[];
  note?: string;
};

export type ScreeningSourceType = "movie" | "anime" | "ova" | "series" | "short" | "other";

export type ScreeningSourceStatus = "available" | "planned" | "watched" | "hidden" | "rejected";

export type ScreeningSourceItem = {
  id: string;
  title: string;
  originalTitle?: string;
  type: ScreeningSourceType;
  category: "good" | "bad" | "classic" | "anime" | "topic" | "other";
  year?: string;
  duration?: string;
  rating?: number;
  posterUrl?: string;
  description: string;
  tags: string[];
  sourceUrl?: string;
  sourceNote?: string;
  fanshiReview?: string;
  status: ScreeningSourceStatus;
  priority: "low" | "normal" | "high";
  timesWatched: number;
  lastWatchedAt?: string;
  addedAt: string;
};

export type ScreeningLibraryContent = {
  title: string;
  description: string;
  items: ScreeningSourceItem[];
  tags: string[];
};

export type ScreeningSourceSubmissionStatus = "pending" | "approved" | "rejected";

export type ScreeningSourceSubmission = {
  id: string;
  sourceId: string;
  sourceTitle: string;
  field: "description" | "sourceUrl" | "sourceNote" | "fanshiReview" | "other";
  content: string;
  contact?: string;
  submitter?: string;
  status: ScreeningSourceSubmissionStatus;
  createdAt: string;
  reviewedAt?: string;
  reviewNote?: string;
};

export type ScreeningSourceSubmissionsContent = {
  items: ScreeningSourceSubmission[];
};

export type FeedbackSubmissionStatus = "pending" | "approved" | "rejected";

export type FeedbackSubmission = {
  id: string;
  category: "content" | "copyright" | "bug" | "feature" | "other";
  title: string;
  content: string;
  contact?: string;
  submitter?: string;
  status: FeedbackSubmissionStatus;
  createdAt: string;
  reviewedAt?: string;
  reviewNote?: string;
};

export type FeedbackSubmissionsContent = {
  items: FeedbackSubmission[];
};

export type SiteAnalyticsContent = {
  totalViews: number;
  uniqueVisitors: number;
  lastVisitedAt?: string;
  knownVisitors?: string[];
  trend24h?: SiteAnalyticsTrendPoint[];
  trend7d?: SiteAnalyticsTrendPoint[];
  pages: Array<{
    path: string;
    title: string;
    views: number;
    uniqueVisitors?: number;
    lastVisitedAt?: string;
  }>;
};

export type SiteAnalyticsTrendPoint = {
  hour: string;
  label: string;
  views: number;
  uniqueVisitors: number;
};

export type ServerMetricSample = {
  id: string;
  sampledAt: string;
  cpuPercent: number;
  memoryTotalBytes: number;
  memoryUsedBytes: number;
  memoryPercent: number;
  diskTotalBytes: number;
  diskUsedBytes: number;
  diskPercent: number;
  processMemoryBytes: number;
  uptimeSeconds: number;
  requests: number;
  errors: number;
  avgResponseMs: number;
  dbLatencyMs?: number;
  status: "healthy" | "warning" | "critical";
};

export type ServerAlert = {
  id: string;
  fingerprint: string;
  type: string;
  severity: "info" | "warning" | "critical";
  title: string;
  message: string;
  status: "open" | "ack" | "resolved";
  metricValue?: number;
  threshold?: number;
  openedAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  lastSeenAt: string;
};

export type ServerMonitoringSummary = {
  enabled: boolean;
  checkedAt: string;
  thresholds: {
    cpuPercent: number;
    memoryPercent: number;
    diskPercent: number;
    consecutiveFailures: number;
    retentionDays: number;
  };
  current?: ServerMetricSample;
  history: ServerMetricSample[];
  alerts: ServerAlert[];
};

export type ScreeningWeek = {
  id: string;
  date: string;
  startsAt?: string;
  title: string;
  theme?: string;
  status: "planned" | "preview" | "live" | "ended" | "cancelled" | "rest";
  statusText: string;
  movies: ScreeningMovie[];
  notes?: string;
  viewerCount?: number;
  discussionCount?: number;
  recordUrl?: string;
  archivedAt?: string;
};

export type ScreeningNextContent = {
  title: string;
  theme: string;
  status: "draft" | "planned" | "preview" | "live" | "ended" | "cancelled";
  statusText: string;
  startsAt: string;
  timezone: string;
  reservationCount: number;
  discussionCount: number;
  streamUrl?: string;
  coverUrl?: string;
  description?: string;
  movies: ScreeningMovie[];
};

export type ScreeningTodoItem = {
  id: string;
  title: string;
  reason: string;
  added: string;
  addedAt?: string;
  votes: number;
  status: "waiting" | "urgent" | "shortlisted" | "scheduled" | "watched" | "rejected";
  priority?: "low" | "normal" | "high";
  category?: "classic" | "bad" | "anime" | "topic" | "other";
  submitter?: string;
  note?: string;
  targetScheduleId?: string;
};

export type ScreeningTodoContent = {
  sortDefault: "hot" | "new" | "priority";
  items: ScreeningTodoItem[];
};

export type ScreeningScheduleContent = {
  sourceFile?: string;
  sourceHash?: string;
  importedAt?: string;
  cycle: {
    name: string;
    recurrence: "weekly" | "biweekly" | "monthly" | "manual";
    dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    defaultTime: string;
    timezone: string;
  };
  weeks: ScreeningWeek[];
};

export type ClassicScreening = {
  id: string;
  year: string;
  title: string;
  description: string;
  image: string;
  tags?: string[];
};

export type ClassicMovie = {
  id: string;
  title: string;
  reason: string;
  date: string;
  viewers: number;
  rating?: number;
  posterUrl?: string;
};

export type ScreeningClassicsContent = {
  timeline: ClassicScreening[];
  featuredMovies: ClassicMovie[];
};

export type AnimeTier = {
  tier: string;
  color: string;
  posters: string[];
};

export type ScreeningAnimeContent = {
  tierList: AnimeTier[];
  historyMovies: ClassicMovie[];
};

export type ScreeningStatsContent = {
  nextCountdownLabel: string;
  lastScreeningLabel: string;
  totalMovies: number;
  goodMovies: number;
  badMovies: number;
  totalViewers: number;
  topBadMovie: {
    title: string;
    rating: number;
    note: string;
    votes: number;
  };
};

export type GamingTag = {
  text: string;
  bg: string;
};

export type GamingRecentGame = {
  title: string;
  tag1: GamingTag;
  tag2?: GamingTag;
  barColor: string;
  time: string;
  desc: string;
  img: string;
  rating?: string;
  review?: string;
};

export type GamingHeroGame = {
  title: string;
  date: string;
  img: string;
};

export type GamingCategory = {
  title: string;
  subtitle: string;
  img: string;
};

export type GamingMainContent = {
  searchPlaceholder: string;
  currentGameTitle: string;
  currentGameTime: string;
  dailyPlayTime: string;
  connectionLatency: string;
  streamTitle: string;
  streamImage: string;
  heroGames: GamingHeroGame[];
  categories: GamingCategory[];
  recentGames: GamingRecentGame[];
};

export type PlazaVisibility = "visible" | "hidden" | "pending" | "rejected";

export type PlazaSoulItem = {
  id: string;
  name: string;
  author: string;
  tags: string[];
  likes: number;
  createdAt: string;
  views: number;
  activeDaysAgo: number | null;
  avatarSrc?: string;
  avatarInitials?: string;
  bannerColor: string;
  featured: boolean;
  visibility: PlazaVisibility;
  desc: string;
  importBatchId?: string;
  importYear?: number;
  importWeek?: number;
  importDate?: string;
  seriesName?: string;
  seriesIndex?: number;
  itemIndex?: number;
};

export type PlazaMomentItem = {
  id: string;
  title: string;
  author: string;
  imageUrl: string;
  tags: string[];
  likes: number;
  views: number;
  createdAt: string;
  visibility: PlazaVisibility;
};

export type PlazaGroupItem = {
  id: string;
  name: string;
  description: string;
  members: number;
  posts: number;
  coverUrl?: string;
  tags: string[];
  visibility: PlazaVisibility;
};

export type PlazaContent = {
  souls: PlazaSoulItem[];
  moments: PlazaMomentItem[];
  groups: PlazaGroupItem[];
  tags: string[];
};

export type AdminContentEntry = {
  key: string;
  type: string;
  status: "draft" | "published";
  draft: unknown;
  published: unknown;
  version: number;
  updatedAt: string;
  publishedAt: string;
};

export type PostStatus = "draft" | "pending" | "published" | "hidden" | "rejected" | "archived";

export type PostVisibility = "public" | "private" | "unlisted";

export type PostRecord = {
  id: string;
  authorId?: string;
  authorName?: string;
  title: string;
  slug: string;
  summary?: string;
  content: string;
  coverUrl?: string;
  status: PostStatus;
  visibility: PostVisibility;
  tags: string[];
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type PublicPostSummary = Pick<PostRecord, "id" | "authorId" | "authorName" | "title" | "slug" | "summary" | "coverUrl" | "tags" | "publishedAt" | "createdAt" | "updatedAt">;

export type PublicPostDetail = PublicPostSummary & {
  content: string;
};

export type PostCommentRecord = {
  id: string;
  postId: string;
  postSlug: string;
  authorId?: string;
  authorName: string;
  content: string;
  status: "published" | "hidden" | "deleted";
  createdAt: string;
  updatedAt: string;
};

export type MediaAssetRecord = {
  id: string;
  ownerId?: string;
  kind: "image" | "video" | "audio" | "document" | "other";
  url: string;
  thumbnailUrl?: string;
  originalName?: string;
  mimeType?: string;
  fileSize?: number;
  hash?: string;
  status: "draft" | "pending" | "published" | "hidden" | "deleted";
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};
