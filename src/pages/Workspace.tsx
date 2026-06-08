import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus, LayoutDashboard, MessageCircle, ScanEye, Activity, PanelLeftOpen,
  Inbox, ArrowUpDown, ListTodo, ChevronDown, List, Calendar, Clock,
  Circle, Bell, Brain, Pause, Settings, X, Search, Database,
  Navigation, Sparkles, XCircle, Volume2, Film, Gamepad2, Image,
  ChevronLeft, ChevronRight, Home, Languages, Moon, Sun,
  Palette, Smartphone, Key, BarChart2, Gift, Trophy, GraduationCap, Monitor,
  Play, FastForward, Rewind, Users, Tv, Airplay, Video, VolumeX, Maximize, Share2,
  Heart, Pencil, CheckCircle2, RefreshCw
} from "lucide-react";
import { cn } from "../lib/utils";
import { useThemeLanguage } from "../contexts/ThemeLanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { ContentAdminPanel } from "../workspace/ContentAdminPanel";
import { ScreeningsAdminPanel } from "../workspace/ScreeningsAdminPanel";
import { PlazaAdminPanel } from "../workspace/PlazaAdminPanel";
import { UserAdminPanel } from "../workspace/UserAdminPanel";
import { PostAdminPanel } from "../workspace/PostAdminPanel";
import type { AdminContentEntry, FeedbackSubmission, FeedbackSubmissionsContent, ScreeningSourceSubmission, ScreeningSourceSubmissionsContent, ServerAlert, ServerMonitoringSummary, SiteAnalyticsContent, SiteAnalyticsTrendPoint } from "../content/types";
import { CONTENT_API_BASE, getLocalFeedbackSubmissions, getLocalSourceSubmissions, saveLocalFeedbackSubmissions, saveLocalSourceSubmissions } from "../content/client";
import { defaultScreeningSourceSubmissions } from "../content/defaults/screenings";
import { defaultFeedbackSubmissions } from "../content/defaults/feedback";

type AiSettings = {
  apiKey: string;
  baseUrl: string;
  model: string;
  configured: boolean;
  apiKeyPreview: string;
};

type AdminContentResponse = {
  entries: AdminContentEntry[];
};

type WorkspaceEvent = {
  id: string;
  type: string;
  keys: string[];
  version: number;
  message: string;
  actorId?: string;
  actorName?: string;
  actorRole?: string;
  createdAt: string;
};

type WorkspaceLayout = {
  leftWidth: number;
  leftTop: number;
  rightTop: number;
};

type CalendarTodoItem = {
  id: string;
  date: string;
  title: string;
  meta: string;
  tone: "rose" | "amber" | "emerald" | "sky" | "primary";
  submission?: PendingUserSubmission;
};

type PendingUserSubmission = {
  id: string;
  kind: "source" | "feedback";
  title: string;
  category: string;
  content: string;
  contact?: string;
  submitter?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  reviewedAt?: string;
  source?: ScreeningSourceSubmission;
  feedback?: FeedbackSubmission;
};

const SOURCE_SUBMISSIONS_KEY = "screenings.sourceSubmissions";
const FEEDBACK_SUBMISSIONS_KEY = "feedback.submissions";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function buildCalendarDays(monthDate: Date) {
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

function formatRelativeTime(value: string) {
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return value || "未知时间";

  const diff = Date.now() - time;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (Math.abs(diff) < minute) return "刚刚";
  if (Math.abs(diff) < hour) return `${Math.max(1, Math.round(Math.abs(diff) / minute))} 分钟前`;
  if (Math.abs(diff) < day) return `${Math.round(Math.abs(diff) / hour)} 小时前`;
  return `${Math.round(Math.abs(diff) / day)} 天前`;
}

function workspaceRoleLabel(role?: string) {
  if (role === "owner") return "站主";
  if (role === "admin") return "管理员";
  return role || "系统";
}

function workspaceKeyLabel(key: string) {
  const labels: Record<string, string> = {
    "home.main": "首页内容",
    "screenings.next": "下周播放控制",
    "screenings.library": "片源库",
    "screenings.sourceSubmissions": "用户提交审核",
    "feedback.submissions": "意见反馈审核",
    "screenings.schedule": "排播日历",
    "plaza.main": "图库中心",
    "gaming.main": "游戏回",
    "users.main": "用户管理"
  };

  return labels[key] || key;
}

function describeWorkspaceEvent(event: WorkspaceEvent) {
  const message = event.message || "工作台内容已更新";
  const isReview = /review|审核|用户提交|意见反馈|source submission|feedback/i.test(message) || event.keys.includes(SOURCE_SUBMISSIONS_KEY) || event.keys.includes(FEEDBACK_SUBMISSIONS_KEY);
  const approved = /approved|同意|通过|采纳/i.test(message);
  const rejected = /rejected|拒绝|打回/i.test(message);

  if (isReview && approved) {
    return { action: "审核通过通知", detail: message, tone: "emerald" as const, decision: "approved" as const };
  }

  if (isReview && rejected) {
    return { action: "审核拒绝通知", detail: message, tone: "rose" as const, decision: "rejected" as const };
  }

  if (event.type === "content.published") {
    return { action: "发布实际改动", detail: message, tone: "primary" as const, decision: "changed" as const };
  }

  return { action: "工作台记录", detail: message, tone: "sky" as const, decision: "changed" as const };
}

const todoFilterLabels: Record<"all" | "pending" | "approved" | "rejected", string> = {
  all: "全部",
  pending: "进行中",
  approved: "已同意",
  rejected: "已拒绝"
};

const submissionStatusLabels: Record<"pending" | "approved" | "rejected", string> = {
  pending: "进行中",
  approved: "已同意",
  rejected: "已拒绝"
};

function mergeSubmissionsById<T extends { id: string }>(primary: T[], fallback: T[]) {
  const seen = new Set<string>();
  return [...primary, ...fallback].filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function formatBytes(value = 0) {
  if (!value) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = value;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${size >= 10 || unit === 0 ? size.toFixed(0) : size.toFixed(1)} ${units[unit]}`;
}

function formatUptime(seconds = 0) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days} 天 ${hours} 小时`;
  if (hours > 0) return `${hours} 小时 ${minutes} 分钟`;
  return `${minutes} 分钟`;
}

function metricTone(value: number, warning: number): "emerald" | "amber" | "rose" {
  if (value >= warning) return "rose";
  if (value >= warning * 0.75) return "amber";
  return "emerald";
}

function toneClasses(tone: "emerald" | "amber" | "rose" | "sky" | "primary") {
  if (tone === "rose") return "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-300";
  if (tone === "amber") return "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-300";
  if (tone === "sky") return "border-sky-500/20 bg-sky-500/10 text-sky-600 dark:text-sky-300";
  if (tone === "primary") return "border-primary/20 bg-primary/10 text-primary";
  return "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300";
}

function maxTrendValue(points: SiteAnalyticsTrendPoint[]) {
  return Math.max(...points.map((point) => point.views), 1);
}

function ResizeHandle({
  orientation,
  onPointerDown
}: {
  orientation: "horizontal" | "vertical";
  onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
}) {
  const isHorizontal = orientation === "horizontal";

  return (
    <div
      onPointerDown={onPointerDown}
      className={cn(
        "group hidden shrink-0 touch-none items-center justify-center rounded-full transition-colors lg:flex",
        isHorizontal ? "h-full w-3 cursor-col-resize" : "h-3 cursor-row-resize"
      )}
    >
      <div
        className={cn(
          "rounded-full border border-border/70 bg-background shadow-sm transition-all group-hover:bg-primary/60",
          isHorizontal ? "h-10 w-1.5 hover:h-14 hover:bg-primary/60" : "h-1.5 w-10 hover:w-14 hover:bg-primary/60"
        )}
      />
    </div>
  );
}

export function Workspace() {
  const [activeTab, setActiveTab] = useLocalStorage<'content' | 'posts' | 'screenings' | 'games' | 'plaza' | 'users' | 'monitor'>('workspace-activeTab', 'content');
  const [todoView, setTodoView] = useLocalStorage<'list' | 'calendar' | 'monitor'>('workspace-todoView', 'list');
  const [todoFilter, setTodoFilter] = useLocalStorage<'all' | 'pending' | 'approved' | 'rejected'>('workspace-todoFilter', 'all');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAiSettingsOpen, setIsAiSettingsOpen] = useState(false);
  const [isTodoFilterOpen, setIsTodoFilterOpen] = useState(false);
  const [aiSettings, setAiSettings] = useState<AiSettings>({
    apiKey: "",
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o-mini",
    configured: false,
    apiKeyPreview: ""
  });
  const [aiModels, setAiModels] = useState<string[]>([]);
  const [aiStatus, setAiStatus] = useState("未配置");
  const [isAiBusy, setIsAiBusy] = useState(false);
  const [sourceSubmissions, setSourceSubmissions] = useState<ScreeningSourceSubmissionsContent>(defaultScreeningSourceSubmissions);
  const [feedbackSubmissions, setFeedbackSubmissions] = useState<FeedbackSubmissionsContent>(defaultFeedbackSubmissions);
  const [selectedSubmission, setSelectedSubmission] = useState<PendingUserSubmission | null>(null);
  const [todoStatus, setTodoStatus] = useState("待办同步中...");
  const [isReviewingSubmission, setIsReviewingSubmission] = useState(false);
  const [workspaceEvents, setWorkspaceEvents] = useState<WorkspaceEvent[]>([]);
  const [siteAnalytics, setSiteAnalytics] = useState<SiteAnalyticsContent | null>(null);
  const [serverMonitoring, setServerMonitoring] = useState<ServerMonitoringSummary | null>(null);
  const [monitoringStatus, setMonitoringStatus] = useState("监控同步中...");
  const [workspaceLayout, setWorkspaceLayout] = useLocalStorage<WorkspaceLayout>('workspace-panel-layout', { leftWidth: 35, leftTop: 35, rightTop: 75 });
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [selectedTodoDate, setSelectedTodoDate] = useState(() => formatDateKey(new Date()));
  const { theme, toggleTheme, language, toggleLanguage } = useThemeLanguage();
  const { user, canEditWorkspace, canManageUsers, authFetch } = useAuth();
  const readOnly = !canEditWorkspace;
  const roleLabel = user?.role === "owner" ? "站主" : user?.role === "admin" ? "管理员" : user ? "普通用户" : "访客";
  const allUserSubmissions = useMemo<PendingUserSubmission[]>(() => [
    ...sourceSubmissions.items.map((submission) => ({
      id: submission.id,
      kind: "source" as const,
      title: `用户补充：${submission.sourceTitle}`,
      category: submission.field,
      content: submission.content,
      contact: submission.contact,
      submitter: submission.submitter,
      status: submission.status,
      createdAt: submission.createdAt,
      reviewedAt: submission.reviewedAt,
      source: submission
    })),
    ...feedbackSubmissions.items.map((feedback) => ({
      id: feedback.id,
      kind: "feedback" as const,
      title: `意见反馈：${feedback.title}`,
      category: feedback.category,
      content: feedback.content,
      contact: feedback.contact,
      submitter: feedback.submitter,
      status: feedback.status,
      createdAt: feedback.createdAt,
      reviewedAt: feedback.reviewedAt,
      feedback
    }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [sourceSubmissions.items, feedbackSubmissions.items]);
  const pendingSubmissions = allUserSubmissions.filter((submission) => todoFilter === "all" || submission.status === todoFilter);
  const calendarDays = useMemo(() => buildCalendarDays(calendarMonth), [calendarMonth]);
  const calendarTodoItems = useMemo<CalendarTodoItem[]>(() => {
    const internalItems: CalendarTodoItem[] = [];

    return [
      ...internalItems,
      ...pendingSubmissions.map((submission) => ({
        id: submission.id,
        date: formatDateKey(new Date(submission.createdAt)),
        title: submission.title,
        meta: `${submission.kind === "source" ? "用户补充" : "意见反馈"} · ${new Date(submission.createdAt).toLocaleDateString()}`,
        tone: "sky" as const,
        submission
      }))
    ];
  }, [pendingSubmissions]);
  const selectedDayTodos = calendarTodoItems.filter((item) => item.date === selectedTodoDate);
  const openServerAlerts = serverMonitoring?.alerts.filter((alert) => alert.status === "open") || [];
  const currentMetric = serverMonitoring?.current;

  function startLayoutResize(event: ReactPointerEvent<HTMLDivElement>, area: "columns" | "leftStack" | "rightStack") {
    event.preventDefault();
    const startX = event.clientX;
    const startY = event.clientY;
    const start = workspaceLayout;

    const onPointerMove = (moveEvent: PointerEvent) => {
      if (area === "columns") {
        const delta = ((moveEvent.clientX - startX) / Math.max(window.innerWidth - 96, 320)) * 100;
        setWorkspaceLayout((current) => ({ ...current, leftWidth: clamp(start.leftWidth + delta, 22, 60) }));
        return;
      }

      const delta = ((moveEvent.clientY - startY) / Math.max(window.innerHeight - 56, 320)) * 100;
      if (area === "leftStack") {
        setWorkspaceLayout((current) => ({ ...current, leftTop: clamp(start.leftTop + delta, 18, 78) }));
      } else {
        setWorkspaceLayout((current) => ({ ...current, rightTop: clamp(start.rightTop + delta, 35, 88) }));
      }
    };

    const onPointerUp = () => {
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
    };

    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
  }

  useEffect(() => {
    if (!isSettingsOpen) return;

    void loadAiSettings();
  }, [isSettingsOpen]);

  useEffect(() => {
    if (!canEditWorkspace) return;

    void loadSourceSubmissions();
    void loadWorkspaceEvents();
    void loadSiteAnalytics();
    void loadServerMonitoring();
  }, [canEditWorkspace]);

  useEffect(() => {
    if (activeTab === "users" && !canManageUsers) setActiveTab("content");
  }, [activeTab, canManageUsers, setActiveTab]);

  async function loadAiSettings() {
    try {
      const response = await authFetch(`${CONTENT_API_BASE}/api/admin/ai/settings`);
      if (!response.ok) throw new Error("AI 设置加载失败");
      const data = await response.json() as { settings: Omit<AiSettings, "apiKey"> };
      setAiSettings((current) => ({ ...current, ...data.settings, apiKey: "" }));
      setAiStatus(data.settings.configured ? `已配置 ${data.settings.model}` : "未配置");
    } catch (error) {
      setAiStatus(error instanceof Error ? error.message : "AI 设置加载失败");
    }
  }

  async function loadSourceSubmissions() {
    try {
      const response = await authFetch(`${CONTENT_API_BASE}/api/admin/content`);
      if (!response.ok) throw new Error("待办加载失败");
      const data = await response.json() as AdminContentResponse;
      const draft = data.entries.find((entry) => entry.key === SOURCE_SUBMISSIONS_KEY)?.draft as Partial<ScreeningSourceSubmissionsContent> | undefined;
      const feedbackDraft = data.entries.find((entry) => entry.key === FEEDBACK_SUBMISSIONS_KEY)?.draft as Partial<FeedbackSubmissionsContent> | undefined;
      const items = Array.isArray(draft?.items) ? draft.items : [];
      const feedbackItems = Array.isArray(feedbackDraft?.items) ? feedbackDraft.items : [];
      const nextSourceItems = mergeSubmissionsById(items.length ? items : defaultScreeningSourceSubmissions.items, getLocalSourceSubmissions());
      const nextFeedbackItems = mergeSubmissionsById(feedbackItems.length ? feedbackItems : defaultFeedbackSubmissions.items, getLocalFeedbackSubmissions());
      setSourceSubmissions({ items: nextSourceItems });
      setFeedbackSubmissions({ items: nextFeedbackItems });
      setTodoStatus(`已同步 ${nextSourceItems.filter((item) => item.status === "pending").length + nextFeedbackItems.filter((item) => item.status === "pending").length} 条待审核提交`);
    } catch (error) {
      setSourceSubmissions({ items: mergeSubmissionsById(getLocalSourceSubmissions(), defaultScreeningSourceSubmissions.items) });
      setFeedbackSubmissions({ items: mergeSubmissionsById(getLocalFeedbackSubmissions(), defaultFeedbackSubmissions.items) });
      setTodoStatus(error instanceof Error ? error.message : "待办加载失败");
    }
  }

  async function loadWorkspaceEvents() {
    try {
      const response = await authFetch(`${CONTENT_API_BASE}/api/admin/events`);
      if (!response.ok) throw new Error("事件加载失败");
      const data = await response.json() as { events: WorkspaceEvent[] };
      setWorkspaceEvents(data.events || []);
    } catch {
      setWorkspaceEvents([]);
    }
  }

  async function loadSiteAnalytics() {
    try {
      const response = await authFetch(`${CONTENT_API_BASE}/api/admin/analytics`);
      if (!response.ok) throw new Error("监控数据加载失败");
      const data = await response.json() as { analytics: SiteAnalyticsContent };
      setSiteAnalytics(data.analytics);
    } catch {
      setSiteAnalytics(null);
    }
  }

  async function loadServerMonitoring() {
    try {
      const response = await authFetch(`${CONTENT_API_BASE}/api/admin/monitoring/summary`);
      if (!response.ok) throw new Error("服务器监控加载失败");
      const data = await response.json() as { monitoring: ServerMonitoringSummary };
      setServerMonitoring(data.monitoring);
      setMonitoringStatus(data.monitoring.enabled ? `已同步，采样时间 ${new Date(data.monitoring.checkedAt).toLocaleString()}` : "未配置 PostgreSQL，长期服务器监控未启用");
    } catch (error) {
      setServerMonitoring(null);
      setMonitoringStatus(error instanceof Error ? error.message : "服务器监控加载失败");
    }
  }

  async function acknowledgeServerAlert(alert: ServerAlert) {
    try {
      const response = await authFetch(`${CONTENT_API_BASE}/api/admin/monitoring/alerts/${encodeURIComponent(alert.id)}/ack`, { method: "POST" });
      if (!response.ok) throw new Error("确认告警失败");
      await loadServerMonitoring();
    } catch (error) {
      setMonitoringStatus(error instanceof Error ? error.message : "确认告警失败");
    }
  }

  async function reviewSubmissionOnServer(submission: PendingUserSubmission, decision: "approved" | "rejected", message: string) {
    const response = await authFetch(`${CONTENT_API_BASE}/api/admin/submissions/${submission.kind}/${submission.id}/review`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision, message })
    });
    const data = await response.json().catch(() => ({})) as { entry?: AdminContentEntry; error?: string };
    if (!response.ok || !data.entry) throw new Error(data.error || "审核保存失败");
    return data.entry;
  }

  async function reviewSourceSubmission(submission: PendingUserSubmission, decision: "approved" | "rejected") {
    if (readOnly) {
      setTodoStatus("只读模式无法审核用户提交");
      return;
    }

    const reviewedAt = new Date().toISOString();

    setIsReviewingSubmission(true);
    setTodoStatus(decision === "approved" ? `正在同意「${submission.title}」...` : `正在拒绝「${submission.title}」...`);

    try {
      if (submission.kind === "source") {
        const entry = await reviewSubmissionOnServer(submission, decision, `用户补充审核${decision === "approved" ? "通过" : "拒绝"}：${submission.title} / 字段 ${submission.category}`);
        const nextSubmissions = entry.draft as ScreeningSourceSubmissionsContent;
        setSourceSubmissions(nextSubmissions);
      } else {
        const entry = await reviewSubmissionOnServer(submission, decision, `意见反馈审核${decision === "approved" ? "通过" : "拒绝"}：${submission.title} / 分类 ${submission.category}`);
        const nextSubmissions = entry.draft as FeedbackSubmissionsContent;
        setFeedbackSubmissions(nextSubmissions);
      }
      setSelectedSubmission((current) => current?.id === submission.id ? { ...submission, status: decision, reviewedAt } : current);
      setTodoStatus(decision === "approved" ? "已同意，提交会从待办队列移出" : "已拒绝，提交会从待办队列移出");
      void loadWorkspaceEvents();
    } catch (error) {
      if (submission.kind === "source") {
        const nextSubmissions = {
          items: sourceSubmissions.items.map((item) => item.id === submission.id ? { ...item, status: decision, reviewedAt } : item)
        } satisfies ScreeningSourceSubmissionsContent;
        setSourceSubmissions(nextSubmissions);
        saveLocalSourceSubmissions(nextSubmissions.items);
      } else {
        const nextSubmissions = {
          items: feedbackSubmissions.items.map((item) => item.id === submission.id ? { ...item, status: decision, reviewedAt } : item)
        } satisfies FeedbackSubmissionsContent;
        setFeedbackSubmissions(nextSubmissions);
        saveLocalFeedbackSubmissions(nextSubmissions.items);
      }
      setSelectedSubmission((current) => current?.id === submission.id ? { ...submission, status: decision, reviewedAt } : current);
      setTodoStatus(error instanceof Error ? `后端不可用，已在本地标记为${decision === "approved" ? "已同意" : "已拒绝"}：${error.message}` : `已在本地标记为${decision === "approved" ? "已同意" : "已拒绝"}`);
    } finally {
      setIsReviewingSubmission(false);
    }
  }

  async function saveAiSettings() {
    if (readOnly) {
      setAiStatus("只读模式无法保存 AI 设置");
      return;
    }

    setIsAiBusy(true);
    setAiStatus("正在保存 AI 设置...");

    try {
      const payload = {
        apiKey: aiSettings.apiKey || undefined,
        baseUrl: aiSettings.baseUrl,
        model: aiSettings.model
      };
      const response = await authFetch(`${CONTENT_API_BASE}/api/admin/ai/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error("保存失败");
      const data = await response.json() as { settings: Omit<AiSettings, "apiKey"> };
      setAiSettings((current) => ({ ...current, ...data.settings, apiKey: "" }));
      setAiStatus("AI 设置已保存");
    } catch (error) {
      setAiStatus(error instanceof Error ? error.message : "保存失败");
    } finally {
      setIsAiBusy(false);
    }
  }

  async function searchAiModels() {
    if (readOnly) {
      setAiStatus("只读模式无法搜索模型");
      return;
    }

    setIsAiBusy(true);
    setAiStatus("正在搜索可用模型...");

    try {
      const response = await authFetch(`${CONTENT_API_BASE}/api/admin/ai/models`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(aiSettings)
      });
      const data = await response.json() as { models: string[]; error?: string };
      if (!response.ok) throw new Error(data.error || "模型搜索失败");
      setAiModels(data.models);
      setAiStatus(data.models.length ? `已找到 ${data.models.length} 个模型` : "未找到可用模型");
      if (data.models.length && !data.models.includes(aiSettings.model)) {
        setAiSettings((current) => ({ ...current, model: data.models[0] }));
      }
    } catch (error) {
      setAiStatus(error instanceof Error ? error.message : "模型搜索失败");
    } finally {
      setIsAiBusy(false);
    }
  }

  async function testAiHeartbeat() {
    if (readOnly) {
      setAiStatus("只读模式无法执行心跳测试");
      return;
    }

    setIsAiBusy(true);
    setAiStatus("正在进行心跳测试...");

    try {
      const response = await authFetch(`${CONTENT_API_BASE}/api/admin/ai/heartbeat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(aiSettings)
      });
      const data = await response.json() as { ok: boolean; message: string };
      if (!response.ok || !data.ok) throw new Error(data.message || "心跳测试失败");
      setAiStatus(data.message);
    } catch (error) {
      setAiStatus(error instanceof Error ? error.message : "心跳测试失败");
    } finally {
      setIsAiBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen w-screen flex-col overflow-y-auto bg-[#fbfaf8] p-2 pb-24 pt-3 text-foreground transition-colors duration-300 dark:bg-[radial-gradient(circle_at_top_left,#162033_0%,#0b0f14_42%,#070a0f_100%)] lg:h-screen lg:flex-row lg:overflow-hidden lg:pb-4 lg:pt-4 relative font-sans z-10">
      {/* 1. Left Slim Rail */}
      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex w-full shrink-0 items-stretch px-1 py-1 lg:h-full lg:w-auto lg:py-2 lg:pl-2 lg:pr-1"
      >
        <div className="inline-flex h-16 w-full items-center overflow-x-auto no-scrollbar rounded-full border border-border bg-card px-2 shadow-sm transition-all duration-200 lg:h-full lg:w-auto lg:flex-col lg:items-center lg:overflow-y-auto lg:px-1.5 lg:pb-3 lg:pt-0">
          <div className="min-w-0 flex-1 lg:min-h-0">
            <div className="flex h-full min-w-0 items-center justify-between gap-2 lg:min-h-0 lg:flex-col lg:items-center">

              <div className="flex items-center gap-2 px-0.5 py-1 lg:flex-col lg:pb-2 lg:pt-3">
                {/* Avatar Profile */}
                <button className="group relative flex size-11 items-center justify-center rounded-full transition-all duration-200 bg-primary/20 ring-2 ring-primary">
                  <div className="relative flex shrink-0 overflow-hidden size-9 rounded-full">
                    <img className="aspect-square size-full object-cover" alt="Profile" src="https://api.dicebear.com/7.x/notionists/svg?seed=Fanshi" />
                  </div>
                  <span className="absolute bottom-0 right-0 size-2.5 rounded-full ring-2 ring-background bg-emerald-500" />
                </button>
              </div>

              <div className="flex shrink-0 items-center gap-2 border-l border-border/70 pl-3 lg:mt-auto lg:mb-2 lg:flex-col lg:border-l-0 lg:border-t lg:pl-0 lg:pt-3">
                <button className="flex size-11 items-center justify-center rounded-full text-muted-foreground hover:bg-muted/70 hover:text-foreground border border-dashed border-border/70 bg-transparent transition-colors">
                  <Plus className="size-5" />
                </button>
                <div className="h-6 w-px bg-border/70 mx-1 lg:my-1 lg:h-px lg:w-6" />
                <button className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-colors shadow-sm">
                  <LayoutDashboard className="size-5" />
                </button>
                <button className="flex size-11 items-center justify-center rounded-full bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-colors">
                  <MessageCircle className="size-5" />
                </button>
                <button className="flex size-11 items-center justify-center rounded-full bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-colors">
                  <ScanEye className="size-5" />
                </button>
                <button className="flex size-11 items-center justify-center rounded-full bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-colors">
                  <Activity className="size-5" />
                </button>
              </div>

              <div className="flex shrink-0 items-center gap-2 border-l border-border/70 pl-3 lg:flex-col lg:border-l-0 lg:border-t lg:pl-0 lg:pt-3">
                <a href="#" className="flex size-11 items-center justify-center rounded-full bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-colors" title="Home">
                  <Home className="size-4" />
                </a>
                <a href="#screenings" className="flex size-11 items-center justify-center rounded-full bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-colors" title="Screenings">
                  <Film className="size-4" />
                </a>
                <a href="#games" className="flex size-11 items-center justify-center rounded-full bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-colors" title="Games">
                  <Gamepad2 className="size-4" />
                </a>
                <a href="#plaza" className="flex size-11 items-center justify-center rounded-full bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-colors" title="Plaza">
                  <Image className="size-4" />
                </a>

                <div className="h-6 w-px bg-border/70 mx-1 lg:my-1 lg:h-px lg:w-6" />

                <button onClick={toggleLanguage} className="flex size-11 items-center justify-center rounded-full bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-colors" title="Language">
                  <Languages className="size-4" />
                </button>
                <button onClick={toggleTheme} className="flex size-11 items-center justify-center rounded-full bg-muted/40 text-amber-500/80 hover:bg-muted/70 hover:text-amber-500 transition-colors" title="Theme">
                  {theme === 'light' ? <Sun className="size-4" /> : <Moon className="size-4 text-foreground/80" />}
                </button>

                <div className="h-6 w-px bg-border/70 mx-1 lg:my-1 lg:h-px lg:w-6" />

                <button onClick={() => setIsSettingsOpen(true)} className="flex size-11 items-center justify-center rounded-full bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-colors relative overflow-hidden">
                  <img src="https://api.dicebear.com/7.x/shapes/svg?seed=setting1" className="size-8 rounded-full border border-border" />
                  <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-amber-500" />
                </button>
                <button className="flex size-11 items-center justify-center rounded-full bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-colors">
                  <PanelLeftOpen className="size-5" />
                </button>
              </div>

            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. Main content area (Resizable panel group conceptually) */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="flex w-full flex-1 flex-col gap-2 lg:h-full lg:flex-row lg:gap-0"
      >
        {/* Left Column: Events & Todos (40%) */}
        <div className="order-2 flex w-full flex-col gap-2 py-1 lg:order-none lg:h-full lg:shrink-0 lg:py-2 lg:pr-1 lg:[width:var(--workspace-left-width)]" style={{ "--workspace-left-width": `${workspaceLayout.leftWidth}%` } as CSSProperties}>

          {/* Top: Events */}
          <div className="min-h-[360px] bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col group/panel transition-shadow hover:shadow-md dark:bg-zinc-950/90 dark:border-zinc-800 lg:min-h-0" style={{ flexBasis: `${workspaceLayout.leftTop}%` }}>
            <div className="flex h-10 items-center justify-between px-3 border-b border-border shrink-0 bg-muted/20">
              <button className="flex items-center gap-1.5 px-2 py-1 hover:bg-muted rounded-md transition-colors relative">
                <Inbox className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">事件</span>
                <span className="absolute top-1 right-0 size-1.5 rounded-full bg-red-500" />
              </button>
              <div className="flex items-center gap-1">
                <button className="p-1 rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                  <ArrowUpDown className="size-3.5" />
                </button>
                <span className="text-xs text-muted-foreground font-mono ml-1">{workspaceEvents.length}</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 border-b border-border/60 bg-background/70 p-2 dark:bg-zinc-950/40">
              <div className="rounded-xl border border-border bg-card px-2 py-1.5 shadow-sm">
                <div className="text-[10px] font-bold text-muted-foreground">实际改动</div>
                <div className="text-lg font-black text-foreground">{workspaceEvents.filter((event) => event.type === "content.published" || event.type === "content.draft.updated").length}</div>
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-2 py-1.5 shadow-sm">
                <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">通过</div>
                <div className="text-lg font-black text-emerald-600 dark:text-emerald-300">{workspaceEvents.filter((event) => /通过|approved|同意/i.test(event.message)).length}</div>
              </div>
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-2 py-1.5 shadow-sm">
                <div className="text-[10px] font-bold text-rose-700 dark:text-rose-300">拒绝</div>
                <div className="text-lg font-black text-rose-600 dark:text-rose-300">{workspaceEvents.filter((event) => /拒绝|rejected/i.test(event.message)).length}</div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar relative">
              {workspaceEvents.length ? workspaceEvents.slice(0, 40).map((event) => {
                const eventMeta = describeWorkspaceEvent(event);
                return (
                  <div key={event.id} className={cn("flex flex-col border-b border-border/50 p-3 transition-colors hover:bg-muted/30", eventMeta.tone === "rose" && "bg-rose-500/5 hover:bg-rose-500/10", eventMeta.tone === "emerald" && "bg-emerald-500/5 hover:bg-emerald-500/10")}>
                    <div className="flex justify-between items-start w-full gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className={cn("size-1.5 rounded-full shrink-0", eventMeta.tone === "rose" ? "bg-rose-500" : eventMeta.tone === "emerald" ? "bg-emerald-500" : eventMeta.tone === "sky" ? "bg-sky-500" : "bg-primary")} />
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-primary/10 text-primary shrink-0">{event.actorName || "系统"}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-muted text-muted-foreground shrink-0">{workspaceRoleLabel(event.actorRole)}</span>
                        <div className="flex items-center gap-1 truncate text-xs font-bold text-foreground">
                          {eventMeta.decision === "rejected" ? <XCircle className="size-3 text-rose-500" /> : eventMeta.decision === "approved" ? <CheckCircle2 className="size-3 text-emerald-500" /> : <ListTodo className="size-3 text-cyan-500" />}
                          {eventMeta.action}
                        </div>
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums">{formatRelativeTime(event.createdAt)}</span>
                    </div>
                    <p className="mt-1 ml-3 line-clamp-2 pl-0.5 text-xs font-medium leading-relaxed text-foreground/85">{eventMeta.detail}</p>
                    <div className="mt-2 ml-3 flex flex-wrap items-center gap-1.5">
                      {event.keys.map((key) => <span key={key} className="rounded-md border border-border bg-background px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">{workspaceKeyLabel(key)}</span>)}
                      <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">v{event.version}</span>
                    </div>
                  </div>
                );
              }) : (
                <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                  <Inbox className="mb-3 size-8 text-muted-foreground/50" />
                  <div className="text-sm font-black text-foreground">暂无事件记录</div>
                  <div className="mt-1 text-xs font-bold text-muted-foreground">管理员发布、审核通过或拒绝后会显示详细通知。</div>
                </div>
              )}
            </div>
          </div>

          <ResizeHandle orientation="vertical" onPointerDown={(event) => startLayoutResize(event, "leftStack")} />

          {/* Bottom: Todos */}
          <div className="min-h-[420px] bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col group/panel transition-shadow hover:shadow-md relative dark:bg-zinc-950/90 dark:border-zinc-800 lg:min-h-0" style={{ flexBasis: `${100 - workspaceLayout.leftTop}%` }}>
            <div className="flex h-10 items-center px-3 border-b border-border shrink-0 bg-muted/20">
              <button className="flex items-center gap-1.5 px-2 py-1 hover:bg-muted rounded-md transition-colors relative">
                <ListTodo className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">待办</span>
              </button>

              <div className="relative ml-2">
                <button onClick={() => setIsTodoFilterOpen((open) => !open)} className="flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-xs font-black shadow-sm transition-colors hover:bg-muted">
                  <span>{todoFilterLabels[todoFilter]}</span>
                  <span className="ml-0.5 font-mono tabular-nums text-muted-foreground">{canEditWorkspace ? pendingSubmissions.length : "-"}</span>
                  <ChevronDown className={cn("size-3.5 opacity-60 transition-transform", isTodoFilterOpen && "rotate-180")} />
                </button>
                {isTodoFilterOpen && (
                  <div className="absolute left-0 top-full z-40 mt-2 w-36 overflow-hidden rounded-2xl border border-border bg-popover p-1.5 text-popover-foreground shadow-xl shadow-black/10 dark:shadow-black/40">
                    {(["all", "pending", "approved", "rejected"] as const).map((filter) => {
                      const count = filter === "all" ? allUserSubmissions.length : allUserSubmissions.filter((item) => item.status === filter).length;
                      return (
                        <button
                          key={filter}
                          onClick={() => {
                            setTodoFilter(filter);
                            setIsTodoFilterOpen(false);
                          }}
                          className={cn(
                            "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-black transition-colors",
                            todoFilter === filter ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                        >
                          <span>{todoFilterLabels[filter]}</span>
                          <span className={cn("font-mono tabular-nums", todoFilter === filter ? "text-primary-foreground/80" : "text-muted-foreground")}>{count}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="ml-auto flex items-center gap-1">
                <button onClick={() => setTodoView('list')} className={cn("p-1 rounded border shadow-sm transition-colors", todoView === 'list' ? "border-border bg-background text-foreground" : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground")}><List className="size-3.5" /></button>
                <button onClick={() => setTodoView('calendar')} className={cn("p-1 rounded border shadow-sm transition-colors", todoView === 'calendar' ? "border-border bg-background text-foreground" : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground")}><Calendar className="size-3.5" /></button>
                <button onClick={() => setTodoView('monitor')} className={cn("p-1 rounded border shadow-sm transition-colors", todoView === 'monitor' ? "border-border bg-background text-foreground" : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground")}><Activity className="size-3.5" /></button>
                <div className="w-px h-4 bg-border mx-1" />
                <button className="p-1 text-muted-foreground hover:bg-muted hover:text-foreground rounded transition-colors"><Plus className="size-4" /></button>
              </div>
            </div>

            {todoView === 'list' ? (
              <div className="flex-1 overflow-y-auto p-4 space-y-5">

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">用户提交</span>
                    <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground tabular-nums">{pendingSubmissions.length}</span>
                  </div>
                  <div className="space-y-2">
                    {pendingSubmissions.map((submission) => (
                    <div key={submission.id} onClick={() => setSelectedSubmission(submission)} className={cn("flex items-start gap-2.5 group cursor-pointer hover:bg-muted/40 p-2 -mx-2 rounded-lg transition-colors", selectedSubmission?.id === submission.id && "bg-primary/10")}>
                      <button className="mt-0.5 text-muted-foreground hover:text-amber-500 transition-colors">
                        <Circle className="size-4" />
                      </button>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[13.5px] font-medium leading-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors">{submission.title}</span>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">M/M</span>
                          <span className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded border border-amber-500/20">
                            <Bell className="size-3" /> {submission.kind === "source" ? "用户补充" : "意见反馈"}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-card text-muted-foreground border border-border">{submission.category}</span>
                          <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-black", submission.status === "approved" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300" : submission.status === "rejected" ? "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-300" : "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-300")}>{submissionStatusLabels[submission.status]}</span>
                          <span className="text-[10px] text-muted-foreground">{new Date(submission.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    ))}
                    {!pendingSubmissions.length ? (
                      <div className="rounded-2xl border border-dashed border-border bg-background px-4 py-6 text-center">
                        <div className="text-sm font-black text-foreground">暂无{todoFilterLabels[todoFilter]}用户提交</div>
                        <div className="mt-1 text-xs font-bold text-muted-foreground">公开补充、关于页意见和测试提交会显示在这里。</div>
                      </div>
                    ) : null}
                  </div>
                </div>

                {selectedSubmission && (
                  <div className="rounded-2xl border border-border bg-background p-3 shadow-sm">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div>
                        <div className="text-xs font-black text-primary">二级详情 / {selectedSubmission.kind === "source" ? "用户补充" : "意见反馈"}</div>
                        <div className="mt-1 text-sm font-black text-foreground">{selectedSubmission.title}</div>
                      </div>
                      <button onClick={() => setSelectedSubmission(null)} className="rounded-full border border-border px-2 py-1 text-xs font-black text-muted-foreground hover:bg-muted">关闭</button>
                    </div>
                    <div className="rounded-xl bg-card px-3 py-2 text-xs font-bold text-muted-foreground">来源：{selectedSubmission.kind === "source" ? "公开用户补充" : "关于页意见通道"} · 分类：{selectedSubmission.category} · 状态：{selectedSubmission.status}</div>
                    <p className="mt-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium leading-relaxed text-foreground/80">{selectedSubmission.content}</p>
                    {selectedSubmission.submitter ? <div className="mt-2 text-xs font-bold text-muted-foreground">提交者：{selectedSubmission.submitter}</div> : null}
                    {selectedSubmission.contact ? <div className="mt-2 text-xs font-bold text-muted-foreground">联系方式：{selectedSubmission.contact}</div> : null}
                    {selectedSubmission.status === "pending" ? <div className="mt-3 flex gap-2">
                      <button disabled={isReviewingSubmission} onClick={() => reviewSourceSubmission(selectedSubmission, "approved")} className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-black text-emerald-600 transition-colors hover:bg-emerald-500/15 disabled:opacity-50">同意</button>
                      <button disabled={isReviewingSubmission} onClick={() => reviewSourceSubmission(selectedSubmission, "rejected")} className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs font-black text-rose-600 transition-colors hover:bg-rose-500/15 disabled:opacity-50">拒绝</button>
                    </div> : <div className="mt-3 rounded-xl border border-border bg-card px-3 py-2 text-xs font-black text-muted-foreground">该提交已处理：{submissionStatusLabels[selectedSubmission.status]}</div>}
                    <div className="mt-2 text-[11px] font-bold text-muted-foreground">{todoStatus}</div>
                  </div>
                )}

              </div>
            ) : todoView === 'calendar' ? (
              <div className="flex-1 flex flex-col p-4 overflow-hidden bg-background dark:bg-zinc-950">
                <div className="flex items-center justify-between mb-4 shrink-0">
                  <button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))} className="p-1 rounded-md hover:bg-muted transition-colors">
                    <ChevronLeft className="size-5" />
                  </button>
                  <button onClick={() => setSelectedTodoDate(formatDateKey(new Date()))} className="rounded-xl border border-border bg-card px-3 py-1.5 text-sm font-black text-foreground shadow-sm transition-colors hover:bg-muted">
                    {calendarMonth.getFullYear()} 年 {calendarMonth.getMonth() + 1} 月
                  </button>
                  <button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))} className="p-1 rounded-md hover:bg-muted transition-colors">
                    <ChevronRight className="size-5" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center mb-2 shrink-0">
                  {["日", "一", "二", "三", "四", "五", "六"].map((day) => (
                    <div key={day} className="text-xs font-semibold text-muted-foreground py-1">{day}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1 flex-1 overflow-y-auto no-scrollbar">
                  {calendarDays.map((date) => {
                    const dateKey = formatDateKey(date);
                    const dayItems = calendarTodoItems.filter((item) => item.date === dateKey);
                    const selected = selectedTodoDate === dateKey;
                    const today = formatDateKey(new Date()) === dateKey;
                    const inactive = date.getMonth() !== calendarMonth.getMonth();

                    return (
                      <button
                        key={dateKey}
                        onClick={() => setSelectedTodoDate(dateKey)}
                        className={cn(
                          "min-h-[76px] rounded-xl border p-2 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20",
                          selected ? "border-primary/50 bg-primary/10 shadow-sm" : "border-transparent hover:border-border hover:bg-muted/40",
                          inactive && !selected && "text-muted-foreground/40",
                          today && !selected && "bg-emerald-500/5 text-emerald-700 dark:text-emerald-300"
                        )}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-black">{date.getDate()}</span>
                          {dayItems.length ? <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-black text-primary-foreground">{dayItems.length}</span> : null}
                        </div>
                        <div className="mt-2 space-y-1">
                          {dayItems.slice(0, 2).map((item) => (
                            <div key={item.id} className={cn("truncate rounded-md px-1.5 py-0.5 text-[10px] font-bold", item.tone === "rose" && "bg-rose-500/10 text-rose-600 dark:text-rose-300", item.tone === "amber" && "bg-amber-500/10 text-amber-600 dark:text-amber-300", item.tone === "emerald" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300", item.tone === "sky" && "bg-sky-500/10 text-sky-600 dark:text-sky-300", item.tone === "primary" && "bg-primary/10 text-primary")}>{item.title}</div>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 shrink-0 rounded-2xl border border-border bg-card p-3 shadow-sm dark:bg-zinc-900/80">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="text-xs font-black text-muted-foreground">{selectedTodoDate} 待办</div>
                    <button onClick={() => setTodoView('list')} className="text-xs font-black text-primary hover:underline">进入列表</button>
                  </div>
                  <div className="max-h-24 space-y-1 overflow-y-auto no-scrollbar">
                    {selectedDayTodos.length ? selectedDayTodos.map((item) => (
                      <button key={item.id} onClick={() => { if (item.submission) setSelectedSubmission(item.submission); setTodoView('list'); }} className="flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-background px-3 py-2 text-left text-xs font-bold transition-colors hover:bg-muted">
                        <span className="truncate text-foreground">{item.title}</span>
                        <span className="shrink-0 text-muted-foreground">{item.meta}</span>
                      </button>
                    )) : <div className="rounded-xl border border-dashed border-border px-3 py-4 text-center text-xs font-bold text-muted-foreground">当天暂无待办，可点击其他日期查看排期。</div>}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto bg-background p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[13px] font-black text-foreground">服务器监控</div>
                    <div className="mt-0.5 text-[11px] font-bold text-muted-foreground">{monitoringStatus}</div>
                  </div>
                  <button onClick={loadServerMonitoring} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1.5 text-[11px] font-black text-muted-foreground transition-colors hover:bg-muted">
                    <RefreshCw className="size-3.5" /> 刷新
                  </button>
                </div>

                {!serverMonitoring?.enabled ? (
                  <div className="rounded-2xl border border-dashed border-border bg-card px-4 py-6 text-center text-xs font-bold text-muted-foreground">
                    未启用长期服务器历史。配置 PostgreSQL 后会自动记录分钟级指标和异常待办。
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "CPU", icon: Activity, value: `${currentMetric?.cpuPercent.toFixed(1) || "0.0"}%`, percent: currentMetric?.cpuPercent || 0, warning: serverMonitoring.thresholds.cpuPercent },
                        { label: "内存", icon: Smartphone, value: `${currentMetric?.memoryPercent.toFixed(1) || "0.0"}%`, percent: currentMetric?.memoryPercent || 0, warning: serverMonitoring.thresholds.memoryPercent },
                        { label: "磁盘", icon: Inbox, value: `${currentMetric?.diskPercent.toFixed(1) || "0.0"}%`, percent: currentMetric?.diskPercent || 0, warning: serverMonitoring.thresholds.diskPercent },
                        { label: "DB 延迟", icon: Database, value: currentMetric?.dbLatencyMs == null ? "离线" : `${currentMetric.dbLatencyMs}ms`, percent: Math.min(currentMetric?.dbLatencyMs || 0, 100), warning: 80 }
                      ].map((metric) => {
                        const MetricIcon = metric.icon;
                        const tone = metric.label === "DB 延迟" && currentMetric?.dbLatencyMs == null ? "rose" : metricTone(metric.percent, metric.warning);
                        return (
                          <div key={metric.label} className={cn("rounded-xl border p-3 shadow-sm", toneClasses(tone))}>
                            <div className="flex items-center justify-between gap-2">
                              <span className="inline-flex items-center gap-1.5 text-[12px] font-black"><MetricIcon className="size-3.5" /> {metric.label}</span>
                              <span className="font-mono text-[13px] font-black">{metric.value}</span>
                            </div>
                            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-background/70">
                              <div className="h-full rounded-full bg-current transition-all" style={{ width: `${Math.min(100, Math.max(4, metric.percent))}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-sm font-black text-foreground"><Navigation className="size-4 text-emerald-500" /> 请求窗口</div>
                        <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-black", toneClasses(currentMetric?.status === "critical" ? "rose" : currentMetric?.status === "warning" ? "amber" : "emerald"))}>{currentMetric?.status || "unknown"}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="rounded-lg bg-muted/50 px-2 py-2">
                          <div className="text-[10px] font-bold text-muted-foreground">请求</div>
                          <div className="font-mono text-sm font-black">{currentMetric?.requestCount || 0}</div>
                        </div>
                        <div className="rounded-lg bg-muted/50 px-2 py-2">
                          <div className="text-[10px] font-bold text-muted-foreground">错误率</div>
                          <div className="font-mono text-sm font-black">{(currentMetric?.errorRate || 0).toFixed(1)}%</div>
                        </div>
                        <div className="rounded-lg bg-muted/50 px-2 py-2">
                          <div className="text-[10px] font-bold text-muted-foreground">响应</div>
                          <div className="font-mono text-sm font-black">{Math.round(currentMetric?.avgResponseMs || 0)}ms</div>
                        </div>
                      </div>
                      <div className="mt-4 flex h-20 items-end gap-1 border-b border-border/60 px-1">
                        {(serverMonitoring.history.length ? serverMonitoring.history.slice(-24) : []).map((sample) => {
                          const maxRequests = Math.max(...serverMonitoring.history.slice(-24).map((item) => item.requestCount), 1);
                          return <div key={sample.sampledAt} className="flex-1 rounded-t-sm bg-emerald-500/70" style={{ height: `${Math.max(8, Math.round((sample.requestCount / maxRequests) * 100))}%` }} />;
                        })}
                        {!serverMonitoring.history.length ? <div className="mb-5 w-full text-center text-xs font-bold text-muted-foreground">等待第一批分钟采样</div> : null}
                      </div>
                      <div className="mt-2 flex justify-between text-[10px] font-mono text-muted-foreground">
                        <span>最近 24 分钟</span>
                        <span>Uptime {formatUptime(currentMetric?.uptimeSeconds || 0)}</span>
                      </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-sm font-black text-foreground"><Bell className="size-4 text-amber-500" /> 异常待办</div>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-black text-muted-foreground">{openServerAlerts.length} 打开</span>
                      </div>
                      <div className="space-y-2">
                        {serverMonitoring.alerts.length ? serverMonitoring.alerts.map((alert) => (
                          <div key={alert.id} className={cn("rounded-xl border px-3 py-2", toneClasses(alert.status === "open" ? alert.severity === "critical" ? "rose" : "amber" : "emerald"))}>
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="truncate text-xs font-black">{alert.title}</div>
                                <div className="mt-0.5 line-clamp-2 text-[11px] font-bold opacity-80">{alert.message}</div>
                                <div className="mt-1 text-[10px] font-mono opacity-70">最近 {new Date(alert.lastSeenAt).toLocaleTimeString()}</div>
                              </div>
                              {alert.status === "open" ? (
                                <button onClick={() => acknowledgeServerAlert(alert)} className="shrink-0 rounded-lg bg-background/70 px-2 py-1 text-[10px] font-black transition-colors hover:bg-background">确认</button>
                              ) : (
                                <span className="shrink-0 rounded-lg bg-background/70 px-2 py-1 text-[10px] font-black">{alert.status === "ack" ? "已确认" : "已恢复"}</span>
                              )}
                            </div>
                          </div>
                        )) : (
                          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-4 text-center text-xs font-black text-emerald-700 dark:text-emerald-300">
                            <CheckCircle2 className="mx-auto mb-1 size-4" /> 系统正常，暂无服务器异常。
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {!canEditWorkspace && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-card/45 backdrop-blur-md">
                <div className="mx-6 rounded-3xl border border-white/40 bg-background/70 px-5 py-4 text-center shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-black/40">
                  <div className="text-sm font-black text-foreground">待办区域已隐藏</div>
                  <div className="mt-1 text-xs font-bold text-muted-foreground">仅站主和管理员可查看用户提交、审核队列和内部待办。</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Resizer Handle */}
        <ResizeHandle orientation="horizontal" onPointerDown={(event) => startLayoutResize(event, "columns")} />

        {/* Right Column: Main Workspace Area (65%) */}
        <div className="contents lg:flex lg:flex-col lg:flex-1 lg:h-full lg:pl-1 lg:gap-2 lg:py-2">

          {/* Top: Unified Workspace View */}
          <div className="order-1 min-h-[620px] bg-card border border-border rounded-xl shadow-[0_2px_20px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col relative group/panel dark:bg-zinc-950/90 dark:border-zinc-800 lg:order-none lg:min-h-0" style={{ flexBasis: `${workspaceLayout.rightTop}%` }}>
            <div className="flex min-h-16 items-center justify-between gap-3 border-b border-border bg-muted/10 px-3 py-2 shrink-0 backdrop-blur-md sticky top-0 z-10 w-full overflow-x-auto no-scrollbar lg:h-12 lg:px-5 lg:py-0">
              <div className="flex h-full shrink-0 items-center gap-2 lg:gap-5 lg:pt-1">
                 <div className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-foreground font-bold tracking-tight shadow-sm lg:rounded-none lg:border-0 lg:bg-transparent lg:px-0 lg:py-0 lg:pr-4 lg:shadow-none lg:border-r">
                    <Activity className="size-4 text-emerald-500" /> 动态统计
                  </div>
                  <button
                    onClick={() => setActiveTab('content')}
                    className={cn("flex h-10 items-center gap-1.5 rounded-full border px-3 text-[13px] relative tracking-wide transition-colors lg:h-full lg:rounded-none lg:border-0 lg:px-0 lg:text-[14px]", activeTab === 'content' ? "border-primary/30 bg-primary/10 font-bold text-primary lg:border-b-2 lg:border-primary lg:bg-transparent" : "border-border bg-background/70 font-medium text-muted-foreground hover:text-foreground lg:border-b-2 lg:border-transparent lg:bg-transparent")}>
                    <Database className="size-4" /> 内容管理
                  </button>
                  <button
                    onClick={() => setActiveTab('posts')}
                    className={cn("flex h-10 items-center gap-1.5 rounded-full border px-3 text-[13px] relative tracking-wide transition-colors lg:h-full lg:rounded-none lg:border-0 lg:px-0 lg:text-[14px]", activeTab === 'posts' ? "border-primary/30 bg-primary/10 font-bold text-primary lg:border-b-2 lg:border-primary lg:bg-transparent" : "border-border bg-background/70 font-medium text-muted-foreground hover:text-foreground lg:border-b-2 lg:border-transparent lg:bg-transparent")}>
                    <Pencil className="size-4" /> 文章系统
                  </button>
                  <button
                    onClick={() => setActiveTab('screenings')}
                   className={cn("flex h-10 items-center gap-1.5 rounded-full border px-3 text-[13px] relative tracking-wide transition-colors lg:h-full lg:rounded-none lg:border-0 lg:px-0 lg:text-[14px]", activeTab === 'screenings' ? "border-primary/30 bg-primary/10 font-bold text-primary lg:border-b-2 lg:border-primary lg:bg-transparent" : "border-border bg-background/70 font-medium text-muted-foreground hover:text-foreground lg:border-b-2 lg:border-transparent lg:bg-transparent")}>
                   <Film className="size-4" /> 放映会控制
                 </button>
                 <button
                   onClick={() => setActiveTab('games')}
                   className={cn("flex h-10 items-center gap-1.5 rounded-full border px-3 text-[13px] relative tracking-wide transition-colors lg:h-full lg:rounded-none lg:border-0 lg:px-0 lg:text-[14px]", activeTab === 'games' ? "border-primary/30 bg-primary/10 font-bold text-primary lg:border-b-2 lg:border-primary lg:bg-transparent" : "border-border bg-background/70 font-medium text-muted-foreground hover:text-foreground lg:border-b-2 lg:border-transparent lg:bg-transparent")}>
                   <Gamepad2 className="size-4" /> 游戏回控制
                 </button>
                  <button
                    onClick={() => setActiveTab('plaza')}
                    className={cn("flex h-10 items-center gap-1.5 rounded-full border px-3 text-[13px] relative tracking-wide transition-colors lg:h-full lg:rounded-none lg:border-0 lg:px-0 lg:text-[14px]", activeTab === 'plaza' ? "border-primary/30 bg-primary/10 font-bold text-primary lg:border-b-2 lg:border-primary lg:bg-transparent" : "border-border bg-background/70 font-medium text-muted-foreground hover:text-foreground lg:border-b-2 lg:border-transparent lg:bg-transparent")}>
                    <Image className="size-4" /> 图库中心控制
                  </button>
                  <button
                    onClick={() => setActiveTab('monitor')}
                    className={cn("flex h-10 items-center gap-1.5 rounded-full border px-3 text-[13px] relative tracking-wide transition-colors lg:h-full lg:rounded-none lg:border-0 lg:px-0 lg:text-[14px]", activeTab === 'monitor' ? "border-primary/30 bg-primary/10 font-bold text-primary lg:border-b-2 lg:border-primary lg:bg-transparent" : "border-border bg-background/70 font-medium text-muted-foreground hover:text-foreground lg:border-b-2 lg:border-transparent lg:bg-transparent")}>
                    <BarChart2 className="size-4" /> 网站监控
                  </button>
                  {canManageUsers && (
                  <button
                    onClick={() => setActiveTab('users')}
                    className={cn("flex h-10 items-center gap-1.5 rounded-full border px-3 text-[13px] relative tracking-wide transition-colors lg:h-full lg:rounded-none lg:border-0 lg:px-0 lg:text-[14px]", activeTab === 'users' ? "border-primary/30 bg-primary/10 font-bold text-primary lg:border-b-2 lg:border-primary lg:bg-transparent" : "border-border bg-background/70 font-medium text-muted-foreground hover:text-foreground lg:border-b-2 lg:border-transparent lg:bg-transparent")}>
                    <Users className="size-4" /> 用户管理
                  </button>
                  )}
               </div>
               <button className={cn("flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full border hover:shadow-md transition-colors shadow-sm relative overflow-hidden group shrink-0", readOnly ? "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/40" : "bg-[#f4fce3] dark:bg-[#84cc16]/10 text-[#65a30d] dark:text-[#a3e635] border-[#d9f99d] dark:border-[#84cc16]/20")}>
                  <Volume2 className="size-3.5 relative z-10" />
                  <span className="relative z-10 tracking-wider">{roleLabel}</span>
                  <span className={cn("text-white rounded-full flex items-center justify-center text-[10px] ml-1 relative z-10 shadow-inner px-1.5 h-[18px]", readOnly ? "bg-amber-500" : "bg-[#84cc16]")}>{readOnly ? "只读" : "可控"}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
               </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar p-3 sm:p-5 lg:p-6 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.02)_10%,transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.02)_10%,transparent_70%)]">
              <div className={cn("mb-4 rounded-2xl border px-4 py-3 text-sm font-bold", readOnly ? "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300" : "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300")}>
                当前身份：{roleLabel}。{readOnly ? "普通用户或访客只能查看工作台，不能保存、发布、审核、配置 API 或修改内容。" : canManageUsers ? "站主拥有全部控制权限，包括用户管理。" : "管理员可控制工作台，但不能管理用户。"}
              </div>

                <AnimatePresence mode="wait">
                  {activeTab === 'content' && (
                    <motion.div
                      key="content"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ContentAdminPanel readOnly={readOnly} />
                    </motion.div>
                  )}

                  {activeTab === 'posts' && (
                    <motion.div
                      key="posts"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <PostAdminPanel readOnly={readOnly} />
                    </motion.div>
                  )}

                  {activeTab === 'screenings' && (
                    <motion.div
                      key="screenings"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6 max-w-5xl mx-auto"
                    >
                       <ScreeningsAdminPanel readOnly={readOnly} />
                       <div className="hidden">
                        {/* Header Bar */}
                       <div className="flex items-center justify-between">
                         <div>
                            <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                              <Film className="size-6 text-emerald-500" /> 放映会中心
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">同步控制大屏播放与观众互动</p>
                         </div>
                         <div className="flex items-center gap-3">
                           <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 shadow-sm text-sm font-medium">
                             <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
                             <span className="text-emerald-600 dark:text-emerald-400">大屏在线</span>
                           </div>
                           <button className="flex items-center gap-2 bg-foreground text-background px-4 py-2 text-sm font-bold rounded-lg shadow-sm hover:scale-105 transition-transform active:scale-95">
                             <Airplay className="size-4" /> 投射新流
                           </button>
                         </div>
                       </div>

                       <div className="grid grid-cols-12 gap-6">
                         {/* Main Player Control Panel (Left Side) - 8 cols */}
                         <div className="col-span-12 xl:col-span-8 space-y-6">

                           {/* Now Playing Card */}
                           <div className="bg-card border border-border shadow-md rounded-2xl overflow-hidden relative group">
                             {/* Background blur image effect */}
                             <div className="absolute inset-0 z-0">
                               <img src="https://images.unsplash.com/photo-1440404653325-ab127d49abc1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Poster blur" className="w-full h-full object-cover opacity-20 dark:opacity-10 scale-110 blur-xl" />
                               <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
                             </div>

                             <div className="relative z-10 p-6 flex flex-col sm:flex-row gap-6">
                               <div className="shrink-0 group/cover relative rounded-lg overflow-hidden border border-border shadow-md h-40 w-28 sm:h-48 sm:w-36 transition-transform duration-300 hover:scale-105">
                                 <img src="https://images.unsplash.com/photo-1440404653325-ab127d49abc1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Movie Poster" className="w-full h-full object-cover" />
                                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/cover:opacity-100 transition-opacity flex items-center justify-center">
                                   <button className="bg-white/20 hover:bg-white/40 backdrop-blur-md p-2 rounded-full transition-colors text-white">
                                     <Pencil className="size-4" />
                                   </button>
                                 </div>
                               </div>

                               <div className="flex flex-col flex-1 py-1">
                                 <div className="flex items-center gap-2 mb-2">
                                   <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">正在直播</span>
                                   <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-muted text-muted-foreground border border-border flex items-center gap-1">
                                     <Users className="size-3" /> 1,248 观众
                                   </span>
                                 </div>
                                 <h3 className="text-2xl font-bold tracking-tight text-foreground line-clamp-1">楚门的世界</h3>
                                 <p className="text-sm text-muted-foreground mt-1 line-clamp-2">The Truman Show (1998) · 剧情 / 科幻</p>

                                 <div className="mt-auto pt-4">
                                   <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground mb-1.5">
                                     <span>01:24:15</span>
                                     <span>01:43:00</span>
                                   </div>
                                   <div className="h-1.5 w-full bg-muted overflow-hidden flex rounded-full cursor-pointer group/progress relative">
                                     <div className="absolute inset-0 bg-border/40 opacity-0 group-hover/progress:opacity-100 transition-opacity" />
                                     <motion.div
                                       className="h-full bg-emerald-500 relative"
                                       animate={{ width: ["80%", "81%"] }}
                                       transition={{ duration: 10, ease: "linear" }}
                                     >
                                       <span className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-background border-[2px] border-emerald-500 rounded-full scale-0 group-hover/progress:scale-100 transition-transform shadow-sm" />
                                     </motion.div>
                                   </div>
                                 </div>
                               </div>
                             </div>

                             {/* Media Controls Toolbar */}
                             <div className="relative z-10 bg-muted/30 border-t border-border backdrop-blur-md px-6 py-3 flex items-center justify-between">
                               <div className="flex items-center gap-2">
                                 <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"><VolumeX className="size-4" /></button>
                                 <div className="w-24 h-1.5 bg-border rounded-full overflow-hidden flex cursor-pointer group/vol">
                                   <div className="h-full bg-foreground w-[65%] group-hover/vol:bg-primary transition-colors" />
                                 </div>
                               </div>

                               <div className="flex items-center gap-4">
                                 <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"><Rewind className="size-5" /></button>
                                 <button className="flex items-center justify-center size-10 bg-foreground text-background hover:scale-105 active:scale-95 rounded-full transition-all shadow-md">
                                   <Pause className="size-4 fill-background" />
                                 </button>
                                 <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"><FastForward className="size-5" /></button>
                               </div>

                               <div className="flex items-center gap-2">
                                 <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"><Tv className="size-4" /></button>
                                 <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"><Maximize className="size-4" /></button>
                               </div>
                             </div>
                           </div>

                           {/* Stats Row */}
                           <div className="grid grid-cols-3 gap-4">
                              <div className="p-4 bg-background border border-border rounded-xl shadow-sm hover:border-border/80 transition-colors flex flex-col gap-1">
                                <div className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"><Users className="size-3.5" /> 在线观众峰值</div>
                                <div className="text-2xl font-bold text-foreground">3,892</div>
                                <div className="text-[10px] text-emerald-500 font-medium mt-1">+14% 较上一场</div>
                              </div>
                              <div className="p-4 bg-background border border-border rounded-xl shadow-sm hover:border-border/80 transition-colors flex flex-col gap-1">
                                <div className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"><MessageCircle className="size-3.5" /> 弹幕数量</div>
                                <div className="text-2xl font-bold text-foreground">12.4k</div>
                                <div className="text-[10px] text-emerald-500 font-medium mt-1">热度极高 🚀</div>
                              </div>
                              <div className="p-4 bg-background border border-border rounded-xl shadow-sm hover:border-border/80 transition-colors flex flex-col gap-1">
                                <div className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"><Heart className="size-3.5" /> 观众好评率</div>
                                <div className="text-2xl font-bold text-foreground">98.2%</div>
                                <div className="text-[10px] text-muted-foreground mt-1.5 w-full bg-border rounded-full h-1 overflow-hidden">
                                  <div className="h-full border-emerald-500 bg-emerald-500 w-[98.2%]" />
                                </div>
                              </div>
                           </div>
                         </div>

                         {/* Sidebar (Right Side) - 4 cols */}
                         <div className="col-span-12 xl:col-span-4 space-y-6">

                           {/* Quick Actions */}
                           <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col gap-2">
                             <button className="w-full flex items-center justify-between p-3 bg-muted/40 hover:bg-muted border border-border/50 rounded-lg transition-colors group">
                               <div className="flex items-center gap-2.5 text-sm font-medium">
                                 <div className="p-1.5 bg-blue-500/10 text-blue-500 rounded"><Share2 className="size-4" /></div>
                                 获取分享链接
                               </div>
                               <ChevronRight className="size-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                             </button>
                             <button className="w-full flex items-center justify-between p-3 bg-muted/40 hover:bg-muted border border-border/50 rounded-lg transition-colors group">
                               <div className="flex items-center gap-2.5 text-sm font-medium">
                                 <div className="p-1.5 bg-amber-500/10 text-amber-500 rounded"><MessageCircle className="size-4" /></div>
                                 管理弹幕黑名单
                               </div>
                               <ChevronRight className="size-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                             </button>
                             <button className="w-full flex items-center justify-between p-3 bg-muted/40 hover:bg-muted border border-border/50 rounded-lg transition-colors group">
                               <div className="flex items-center gap-2.5 text-sm font-medium">
                                 <div className="p-1.5 bg-purple-500/10 text-purple-500 rounded"><Settings className="size-4" /></div>
                                 高级排播设置
                               </div>
                               <ChevronRight className="size-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                             </button>
                           </div>

                           {/* Up Next Queue */}
                           <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden flex flex-col">
                             <div className="p-4 border-b border-border/50 flex justify-between items-center bg-muted/10">
                               <h3 className="font-bold text-sm tracking-tight flex items-center gap-2">
                                 <List className="size-4 text-muted-foreground" /> 接下来播放
                               </h3>
                               <button className="text-xs font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-500 px-2 py-1 rounded hover:bg-emerald-500/10 transition-colors">
                                 编辑列表
                               </button>
                             </div>

                             <div className="p-2 space-y-1">
                               {[
                                 { title: "星际穿越", time: "18:00", duration: "169 min", type: "科幻" },
                                 { title: "教父", time: "21:30", duration: "175 min", type: "犯罪" },
                                 { title: "千与千寻", time: "次日 14:00", duration: "125 min", type: "动画" },
                               ].map((movie, i) => (
                                 <div key={i} className="flex items-center gap-3 p-2.5 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer group">
                                   <div className="text-[10px] font-mono text-muted-foreground font-medium w-10 text-center shrink-0 group-hover:text-foreground transition-colors">{movie.time}</div>
                                   <div className="w-[3px] h-8 rounded-full bg-border group-hover:bg-primary transition-colors shrink-0" />
                                   <div className="flex-1 min-w-0">
                                     <div className="font-bold text-sm text-foreground truncate">{movie.title}</div>
                                     <div className="text-[11px] text-muted-foreground flex gap-2 mt-0.5">
                                       <span>{movie.duration}</span>
                                       <span>&middot;</span>
                                       <span>{movie.type}</span>
                                     </div>
                                   </div>
                                 </div>
                               ))}

                               <button className="w-full mt-2 py-2.5 text-[12px] font-bold text-muted-foreground border border-dashed border-border hover:border-foreground hover:text-foreground rounded-lg transition-colors flex justify-center items-center gap-1.5 focus:outline-none">
                                 <Plus className="size-3.5" /> 添加放映计划
                               </button>
                             </div>
                           </div>

                          </div>
                        </div>
                        </div>
                     </motion.div>
                   )}

                  {activeTab === 'games' && (
                    <motion.div
                      key="games"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6 max-w-4xl mx-auto"
                    >
                       <div className="grid grid-cols-3 gap-4">
                          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-xl shadow-sm">
                            <div className="text-sm font-medium text-emerald-800 dark:text-emerald-400 mb-1">进行中游戏</div>
                            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-500">2</div>
                          </div>
                          <div className="p-4 bg-background border border-border rounded-xl shadow-sm">
                            <div className="text-sm font-medium text-muted-foreground mb-1">日均游玩时数</div>
                            <div className="text-3xl font-black text-foreground">4.5h</div>
                          </div>
                          <div className="p-4 bg-background border border-border rounded-xl shadow-sm">
                            <div className="text-sm font-medium text-muted-foreground mb-1">连通器延迟</div>
                            <div className="text-3xl font-black text-amber-500">24ms</div>
                          </div>
                       </div>
                       <div className="bg-background border border-border rounded-xl p-5 shadow-sm space-y-4">
                          <h3 className="font-bold text-lg flex items-center gap-2"><Gamepad2 className="size-5" /> 游戏状态接口设定</h3>
                          <p className="text-sm text-muted-foreground">配置 Steam / Epic 账号抓取连接池或手动更新当前游玩状态图表。</p>
                          <div className="flex gap-3">
                              <button disabled={readOnly} className="bg-muted hover:bg-black/5 dark:hover:bg-white/5 border border-border px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50">
                                重新同步 Steam
                              </button>
                              <button disabled={readOnly} className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-bold shadow-sm transition-colors disabled:opacity-50">
                                添加自定义记录
                              </button>
                          </div>
                       </div>
                    </motion.div>
                  )}

                  {activeTab === 'plaza' && (
                    <motion.div
                      key="plaza"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
                       <PlazaAdminPanel readOnly={readOnly} />
                     </motion.div>
                   )}

                  {activeTab === 'monitor' && (
                    <motion.div
                      key="monitor"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="mx-auto max-w-6xl space-y-6"
                    >
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground"><BarChart2 className="size-6 text-primary" /> 网站监控</h2>
                          <p className="mt-1 text-sm text-muted-foreground">匿名聚合前台访问，并展示当前服务器健康、分钟采样和异常待办。</p>
                        </div>
                        <button onClick={() => { void loadSiteAnalytics(); void loadServerMonitoring(); }} className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm font-bold transition-colors hover:bg-muted"><RefreshCw className="size-4" /> 刷新监控</button>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        <div className="rounded-2xl border border-border bg-background p-5 shadow-sm">
                          <div className="text-xs font-bold text-muted-foreground">总浏览量</div>
                          <div className="mt-2 text-4xl font-black text-foreground">{(siteAnalytics?.totalViews || 0).toLocaleString()}</div>
                        </div>
                        <div className="rounded-2xl border border-border bg-background p-5 shadow-sm">
                          <div className="text-xs font-bold text-muted-foreground">独立访客</div>
                          <div className="mt-2 text-4xl font-black text-primary">{(siteAnalytics?.uniqueVisitors || 0).toLocaleString()}</div>
                        </div>
                        <div className="rounded-2xl border border-border bg-background p-5 shadow-sm">
                          <div className="text-xs font-bold text-muted-foreground">打开告警</div>
                          <div className={cn("mt-2 text-4xl font-black", openServerAlerts.length ? "text-amber-500" : "text-emerald-500")}>{openServerAlerts.length}</div>
                        </div>
                        <div className="rounded-2xl border border-border bg-background p-5 shadow-sm">
                          <div className="text-xs font-bold text-muted-foreground">最近访问</div>
                          <div className="mt-2 text-sm font-black leading-6 text-foreground">{siteAnalytics?.lastVisitedAt ? new Date(siteAnalytics.lastVisitedAt).toLocaleString() : "暂无"}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                        {[
                          { title: "24h 小时趋势", points: siteAnalytics?.trend24h || [], caption: "每小时浏览 / 访客" },
                          { title: "7d 小时趋势", points: siteAnalytics?.trend7d || [], caption: "最近 7 天小时聚合" }
                        ].map((chart) => {
                          const max = maxTrendValue(chart.points);
                          return (
                            <div key={chart.title} className="rounded-3xl border border-border bg-background p-5 shadow-sm">
                              <div className="mb-4 flex items-center justify-between gap-2">
                                <div>
                                  <h3 className="text-lg font-black text-foreground">{chart.title}</h3>
                                  <div className="text-xs font-bold text-muted-foreground">{chart.caption}</div>
                                </div>
                                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-black text-muted-foreground">{chart.points.length} 点</span>
                              </div>
                              <div className="flex h-44 items-end gap-1 border-b border-border/60 px-1">
                                {chart.points.length ? chart.points.map((point) => (
                                  <div key={`${chart.title}-${point.bucket}-${point.path || "all"}`} className="group relative flex flex-1 items-end">
                                    <div className="w-full rounded-t-md bg-primary/70 transition-colors group-hover:bg-primary" style={{ height: `${Math.max(5, Math.round((point.views / max) * 100))}%` }} />
                                    <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-border bg-popover px-2 py-1 text-[11px] font-bold text-popover-foreground shadow-md group-hover:block">
                                      {point.label} · {point.views} 次 / {point.uniqueVisitors} 人
                                    </div>
                                  </div>
                                )) : <div className="mb-12 w-full text-center text-sm font-bold text-muted-foreground">暂无趋势数据</div>}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                        <div className="rounded-3xl border border-border bg-background p-5 shadow-sm">
                          <div className="mb-4 flex items-center justify-between gap-2">
                            <h3 className="text-lg font-black text-foreground">服务器健康</h3>
                            <span className={cn("rounded-full border px-2.5 py-1 text-xs font-black", toneClasses(currentMetric?.status === "critical" ? "rose" : currentMetric?.status === "warning" ? "amber" : "emerald"))}>{currentMetric?.status || "waiting"}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                            {[
                              { label: "CPU", value: `${currentMetric?.cpuPercent.toFixed(1) || "0.0"}%`, tone: metricTone(currentMetric?.cpuPercent || 0, serverMonitoring?.thresholds.cpuPercent || 85) },
                              { label: "内存", value: `${currentMetric?.memoryPercent.toFixed(1) || "0.0"}%`, tone: metricTone(currentMetric?.memoryPercent || 0, serverMonitoring?.thresholds.memoryPercent || 85) },
                              { label: "磁盘", value: `${currentMetric?.diskPercent.toFixed(1) || "0.0"}%`, tone: metricTone(currentMetric?.diskPercent || 0, serverMonitoring?.thresholds.diskPercent || 90) },
                              { label: "DB", value: currentMetric?.dbLatencyMs == null ? "离线" : `${currentMetric.dbLatencyMs}ms`, tone: currentMetric?.dbLatencyMs == null ? "rose" : "emerald" }
                            ].map((item) => (
                              <div key={item.label} className={cn("rounded-2xl border p-4", toneClasses(item.tone as "emerald" | "amber" | "rose"))}>
                                <div className="text-xs font-black opacity-80">{item.label}</div>
                                <div className="mt-2 font-mono text-2xl font-black">{item.value}</div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                            <div className="rounded-2xl border border-border bg-card p-4">
                              <div className="text-xs font-bold text-muted-foreground">分钟请求</div>
                              <div className="mt-1 font-mono text-xl font-black text-foreground">{currentMetric?.requestCount || 0}</div>
                            </div>
                            <div className="rounded-2xl border border-border bg-card p-4">
                              <div className="text-xs font-bold text-muted-foreground">错误率</div>
                              <div className="mt-1 font-mono text-xl font-black text-foreground">{(currentMetric?.errorRate || 0).toFixed(1)}%</div>
                            </div>
                            <div className="rounded-2xl border border-border bg-card p-4">
                              <div className="text-xs font-bold text-muted-foreground">进程内存</div>
                              <div className="mt-1 font-mono text-xl font-black text-foreground">{formatBytes(currentMetric?.processMemoryBytes || 0)}</div>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-3xl border border-border bg-background p-5 shadow-sm">
                          <div className="mb-4 flex items-center justify-between gap-2">
                            <h3 className="text-lg font-black text-foreground">服务器异常待办</h3>
                            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-black text-muted-foreground">{serverMonitoring?.alerts.length || 0} 条</span>
                          </div>
                          <div className="space-y-3">
                            {serverMonitoring?.alerts.length ? serverMonitoring.alerts.map((alert) => (
                              <div key={alert.id} className={cn("rounded-2xl border p-4", toneClasses(alert.status === "open" ? alert.severity === "critical" ? "rose" : "amber" : "emerald"))}>
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <div className="text-sm font-black">{alert.title}</div>
                                    <div className="mt-1 text-xs font-bold opacity-80">{alert.message}</div>
                                    <div className="mt-2 text-[11px] font-mono opacity-70">最近出现 {new Date(alert.lastSeenAt).toLocaleString()}</div>
                                  </div>
                                  {alert.status === "open" ? <button onClick={() => acknowledgeServerAlert(alert)} className="shrink-0 rounded-xl bg-background/80 px-3 py-1.5 text-xs font-black transition-colors hover:bg-background">确认</button> : <span className="shrink-0 rounded-xl bg-background/80 px-3 py-1.5 text-xs font-black">{alert.status === "ack" ? "已确认" : "已恢复"}</span>}
                                </div>
                              </div>
                            )) : <div className="rounded-2xl border border-dashed border-border px-4 py-10 text-center text-sm font-bold text-muted-foreground">暂无服务器异常。</div>}
                          </div>
                        </div>
                      </div>

                      <div className="rounded-3xl border border-border bg-background p-5 shadow-sm">
                        <div className="mb-4 flex items-center justify-between gap-2">
                          <h3 className="text-lg font-black text-foreground">页面访问频率</h3>
                          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-black text-muted-foreground">{siteAnalytics?.pages.length || 0} 页面</span>
                        </div>
                        <div className="space-y-3">
                          {(siteAnalytics?.pages || []).sort((a, b) => b.views - a.views).map((page) => {
                            const maxViews = Math.max(...(siteAnalytics?.pages || [{ views: 1 }]).map((item) => item.views), 1);
                            const percent = Math.max(4, Math.round((page.views / maxViews) * 100));
                            return (
                              <div key={page.path} className="rounded-2xl border border-border bg-card p-4">
                                <div className="mb-2 flex items-center justify-between gap-3">
                                  <div className="min-w-0">
                                    <div className="truncate text-sm font-black text-foreground">{page.title}</div>
                                    <div className="mt-0.5 text-xs font-bold text-muted-foreground">{page.path} · UV {(page.uniqueVisitors || 0).toLocaleString()} · 最近 {page.lastVisitedAt ? new Date(page.lastVisitedAt).toLocaleString() : "暂无"}</div>
                                  </div>
                                  <div className="text-xl font-black text-primary">{page.views.toLocaleString()}</div>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-muted">
                                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percent}%` }} />
                                </div>
                              </div>
                            );
                          })}
                          {!siteAnalytics?.pages.length ? <div className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm font-bold text-muted-foreground">暂无监控数据，访问前台页面后会自动生成。</div> : null}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'users' && canManageUsers && (
                    <motion.div
                      key="users"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
                       <UserAdminPanel />
                    </motion.div>
                  )}
                </AnimatePresence>
            </div>
          </div>

          <ResizeHandle orientation="vertical" onPointerDown={(event) => startLayoutResize(event, "rightStack")} />

          {/* Bottom: Timeline Grid */}
          <div className="order-4 min-h-[260px] bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col relative group/panel hover:shadow-md transition-shadow dark:bg-zinc-950/90 dark:border-zinc-800 lg:order-none lg:min-h-0" style={{ flexBasis: `${100 - workspaceLayout.rightTop}%` }}>
            <div className="flex h-[42px] items-center justify-between px-5 border-b border-border bg-muted/10 shrink-0">
               <span className="text-[13px] font-bold text-muted-foreground tracking-wide">时间轴</span>
               <div className="flex items-center gap-3.5 text-muted-foreground/80">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-muted/60 border border-border font-medium shadow-sm">3m</span>
                  <Navigation className="size-4 hover:text-foreground cursor-pointer -rotate-45 transition-colors" />
                  <div className="w-px h-3.5 bg-border" />
                  <Pause className="size-[14px] fill-current hover:text-foreground cursor-pointer transition-colors" />
                  <Settings className="size-[15px] hover:text-foreground cursor-pointer transition-colors" />
                  <X className="size-4 hover:text-foreground cursor-pointer transition-colors" />
               </div>
            </div>

            <div className="flex-1 relative flex flex-col px-6 pb-3 pt-6 overflow-hidden">
               <div className="flex-1 relative w-full border-b border-border/80 overflow-hidden flex items-end">

                 {/* Moving Data Activity Elements */}
                 <div className="absolute inset-y-0 right-[22%] left-0 overflow-hidden pointer-events-none">
                    <motion.div
                      animate={{ x: ["0%", "-100%"] }}
                      transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-y-0 left-0 flex items-end gap-[2px]"
                      style={{ width: "200%" }}
                    >
                      {/* Abstract activity bars */}
                      {Array.from({ length: 150 }).map((_, i) => {
                        const height = 5 + Math.random() * 80;
                        const isHigh = height > 60;
                        return (
                          <div key={i} className="flex flex-col items-center justify-end shrink-0 w-1.5 h-full opacity-60">
                            <div
                              className={cn("w-1 rounded-sm transition-colors", isHigh ? "bg-[#84cc16]/80" : "bg-muted-foreground/30")}
                              style={{ height: `${height}%` }}
                            />
                          </div>
                        );
                      })}
                    </motion.div>

                    {/* Floating Event Nodes */}
                    <motion.div
                      animate={{ x: ["0%", "-100%"] }}
                      transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                      className="absolute top-1/4 left-0 flex gap-12 text-xs font-semibold"
                      style={{ width: "200%" }}
                    >
                       <div className="px-2 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-md whitespace-nowrap shadow-sm backdrop-blur-sm">任务更新: 视觉调整</div>
                       <div className="px-2 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-md whitespace-nowrap shadow-sm backdrop-blur-sm">系统快照备份</div>
                       <div className="px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-md whitespace-nowrap shadow-sm backdrop-blur-sm flex items-center gap-1.5"><Circle className="size-2 fill-emerald-500" /> 用户操作检测</div>
                       <div className="px-2 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 rounded-md whitespace-nowrap shadow-sm backdrop-blur-sm">组件渲染完毕</div>

                       {/* Duplicate for infinite scroll */}
                       <div className="px-2 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-md whitespace-nowrap shadow-sm backdrop-blur-sm">任务更新: 视觉调整</div>
                       <div className="px-2 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-md whitespace-nowrap shadow-sm backdrop-blur-sm">系统快照备份</div>
                       <div className="px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-md whitespace-nowrap shadow-sm backdrop-blur-sm flex items-center gap-1.5"><Circle className="size-2 fill-emerald-500" /> 用户操作检测</div>
                       <div className="px-2 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 rounded-md whitespace-nowrap shadow-sm backdrop-blur-sm">组件渲染完毕</div>
                    </motion.div>
                 </div>

                 {/* Current Time marker (Olive Line) */}
                 <div className="absolute top-0 bottom-0 right-[22%] w-[1.5px] bg-[#84cc16] group/marker cursor-pointer z-10 shadow-[0_0_4px_rgba(132,204,22,0.3)]">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], boxShadow: ["0 0 8px rgba(132,204,22,0.4)", "0 0 12px rgba(132,204,22,0.8)", "0 0 8px rgba(132,204,22,0.4)"] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute -top-1.5 -translate-x-[calc(50%-0.75px)] size-[10px] rounded-full bg-[#84cc16] ring-[3px] ring-background shadow-[0_0_8px_rgba(132,204,22,0.6)] origin-center"
                    />
                    <motion.div
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute top-0 right-0 h-full w-48 bg-gradient-to-r from-transparent to-[#84cc16]/10 -translate-x-full pointer-events-none"
                    />
                 </div>

                 {/* Faint Grid Lines */}
                 <div className="absolute inset-0 flex justify-between pr-[22%] pointer-events-none">
                    <div className="w-px h-full bg-border/40" />
                    <div className="w-px h-full bg-border/40" />
                    <div className="w-px h-full bg-border/40" />
                    <div className="w-px h-full bg-border/40" />
                 </div>
               </div>
               <div className="flex justify-between items-center pt-2.5 text-[10.5px] font-mono font-bold text-muted-foreground/80 tracking-wider">
                  <span className="flex-1 text-left relative -left-1">7:09</span>
                  <span className="flex-1 text-center -translate-x-6">17:10</span>
                  <span className="flex-1 text-right relative -right-1 pr-[22%]">17:11</span>
               </div>
            </div>
          </div>
        </div>

      </motion.div>

      {/* Floating Bottom Right Action Bar */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
        className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center rounded-full border border-border bg-background/95 p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-xl dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] lg:bottom-6 lg:left-auto lg:right-6 lg:translate-x-0"
      >
        <button className="flex items-center justify-center py-1.5 px-3 hover:bg-[#84cc16]/10 dark:hover:bg-[#84cc16]/20 rounded-full transition-colors group">
          <Sparkles className="size-4 text-[#84cc16] fill-[#84cc16]/20 group-hover:scale-110 transition-transform" />
        </button>
        <div className="w-px h-5 bg-border/80 mx-1" />
        <button className="flex items-center justify-center size-9 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground">
          <Navigation className="size-[18px] rotate-45" strokeWidth={2} />
        </button>
        <button className="flex items-center justify-center size-9 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground">
          <svg className="size-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 21v-5h5" /></svg>
        </button>
        <button className="flex items-center justify-center size-9 hover:bg-muted rounded-full transition-colors text-[13px] font-bold text-foreground font-mono">
          Ai
        </button>
      </motion.div>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end isolate">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-full max-w-md bg-card border-l border-border/80 shadow-[-20px_0_60px_rgba(0,0,0,0.15)] h-screen overflow-hidden flex flex-col z-10"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-muted/20">
                <h2 className="text-xl font-bold tracking-tight">设置</h2>
                <button onClick={() => setIsSettingsOpen(false)} className="p-1 hover:bg-muted-foreground/10 rounded-full transition-colors text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar bg-card/50">
                {/* Profile Card */}
                <div className="bg-background border border-border/60 rounded-xl p-5 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-3 right-3 text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                    <Settings className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-[#7c5cdb] text-white flex items-center justify-center text-3xl font-medium mb-3 shadow-sm border-2 border-background">
                      S
                    </div>
                    <h3 className="text-lg font-bold">Stephano Avrohom</h3>

                    <div className="mt-4 w-full bg-[#f8f9e6] dark:bg-[#eaf1c9]/10 rounded-lg p-3 flex justify-between items-center sm:text-sm text-xs border border-[#eaf1c9] dark:border-[#eaf1c9]/20 shadow-inner">
                      <span className="font-bold text-[#8db33a] dark:text-[#aee041]">免费版</span>
                      <span className="text-muted-foreground font-medium flex items-center cursor-pointer hover:text-foreground transition-colors">方案与充值</span>
                    </div>
                  </div>
                </div>

                {/* Appearance */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-px h-3 bg-border" />
                    <span className="text-xs font-semibold text-muted-foreground">外观</span>
                    <div className="flex-1 h-px bg-border/50" />
                  </div>
                  <div className="p-1 bg-muted/40 border border-border/60 rounded-xl flex items-center shadow-inner">
                    <button onClick={theme !== 'light' ? toggleTheme : undefined} className={cn("flex-1 py-2 rounded-lg text-sm font-medium flex justify-center items-center gap-2 transition-all", theme === 'light' ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground")}>
                      <Sun className="w-4 h-4" /> 浅色
                    </button>
                    <button onClick={theme !== 'dark' ? toggleTheme : undefined} className={cn("flex-1 py-2 rounded-lg text-sm font-medium flex justify-center items-center gap-2 transition-all", theme === 'dark' ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground")}>
                      <Moon className="w-4 h-4" /> 深色
                    </button>
                    <button className="flex-1 py-2 rounded-lg text-sm font-medium flex justify-center items-center gap-2 text-muted-foreground hover:text-foreground transition-all">
                      <Monitor className="w-4 h-4" /> 跟随系统
                    </button>
                  </div>

                  <div className="space-y-1 mt-3">
                    <div className="flex items-center justify-between p-3.5 bg-background border border-border/60 rounded-xl hover:bg-muted/30 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-lg"><Palette className="w-4 h-4" /></div>
                        <div>
                          <div className="text-[14px] font-bold">界面设置</div>
                          <div className="text-[12px] text-muted-foreground">可选择头像取色，或使用自定义流态色板。</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
                    </div>

                    <div className="flex items-center justify-between p-3.5 bg-background border border-border/60 rounded-xl hover:bg-muted/30 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-lg"><Smartphone className="w-4 h-4" /></div>
                        <div>
                          <div className="text-[14px] font-bold">触觉反馈</div>
                          <div className="text-[12px] text-muted-foreground">交互时提供振动反馈</div>
                        </div>
                      </div>
                      <div className="w-10 h-6 bg-[#afc33a] rounded-full p-1 shadow-inner flex items-center justify-end">
                        <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Language */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-px h-3 bg-border" />
                    <span className="text-xs font-semibold text-muted-foreground">语言</span>
                    <div className="flex-1 h-px bg-border/50" />
                  </div>
                  <div className="p-1 bg-muted/40 border border-border/60 rounded-xl flex items-center shadow-inner">
                    <button className={cn("flex-1 py-2 text-sm font-medium transition-all rounded-lg", language === 'en' ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground")} onClick={() => language !== 'en' && toggleLanguage()}>
                      English
                    </button>
                    <button className={cn("flex-1 py-2 text-sm font-medium transition-all rounded-lg", language === 'zh' ? "bg-background shadow text-foreground font-bold" : "text-muted-foreground hover:text-foreground")} onClick={() => language !== 'zh' && toggleLanguage()}>
                      中文
                    </button>
                    <button className={cn("flex-1 py-2 text-sm font-medium transition-all rounded-lg", language === 'ja' ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground")} onClick={() => language !== 'ja' && toggleLanguage()}>
                      日本語
                    </button>
                  </div>
                </div>

                {/* Account */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-px h-3 bg-border" />
                    <span className="text-xs font-semibold text-muted-foreground">账号</span>
                    <div className="flex-1 h-px bg-border/50" />
                  </div>
                  <div className="space-y-1">
                    <button type="button" onClick={() => setIsAiSettingsOpen((open) => !open)} className="w-full flex items-center justify-between p-3.5 bg-background border border-border/60 rounded-xl hover:bg-muted/30 transition-colors cursor-pointer group text-left">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-50 dark:bg-orange-900/20 text-orange-500 rounded-lg"><Key className="w-4 h-4" /></div>
                        <div>
                          <div className="text-[14px] font-bold">API Key 设置</div>
                          <div className="text-[12px] text-muted-foreground">{aiSettings.configured ? `${aiSettings.apiKeyPreview || "已配置"} · ${aiSettings.model}` : "未配置"}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", aiSettings.configured ? "bg-emerald-500" : "bg-orange-500")} />
                        <ChevronRight className={cn("w-4 h-4 text-muted-foreground/50 group-hover:text-foreground transition-colors", isAiSettingsOpen && "rotate-90")} />
                      </div>
                    </button>

                    {isAiSettingsOpen && (
                      <div className="p-4 bg-background border border-border/60 rounded-xl space-y-3 shadow-sm">
                        <div className="grid gap-2">
                          <label className="text-[12px] font-bold text-muted-foreground">API Base URL</label>
                          <input value={aiSettings.baseUrl} onChange={(event) => setAiSettings((current) => ({ ...current, baseUrl: event.target.value }))} className="w-full rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm outline-none focus:border-[#afc33a]" placeholder="https://api.openai.com/v1" />
                        </div>
                        <div className="grid gap-2">
                          <label className="text-[12px] font-bold text-muted-foreground">API Key</label>
                          <input value={aiSettings.apiKey} onChange={(event) => setAiSettings((current) => ({ ...current, apiKey: event.target.value }))} type="password" className="w-full rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm outline-none focus:border-[#afc33a]" placeholder={aiSettings.configured ? "留空则保留当前 Key" : "sk-..."} />
                        </div>
                        <div className="grid gap-2">
                          <div className="flex items-center justify-between gap-2">
                            <label className="text-[12px] font-bold text-muted-foreground">模型</label>
                            <button type="button" onClick={searchAiModels} disabled={isAiBusy || readOnly} className="text-[12px] font-bold text-[#8db33a] disabled:opacity-50">自动搜索模型</button>
                          </div>
                          {aiModels.length ? (
                            <select value={aiSettings.model} onChange={(event) => setAiSettings((current) => ({ ...current, model: event.target.value }))} className="w-full rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm outline-none focus:border-[#afc33a]">
                              {aiModels.map((model) => <option key={model} value={model}>{model}</option>)}
                            </select>
                          ) : (
                            <input value={aiSettings.model} onChange={(event) => setAiSettings((current) => ({ ...current, model: event.target.value }))} className="w-full rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm outline-none focus:border-[#afc33a]" placeholder="点击自动搜索模型" />
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-2 pt-1">
                          <div className="text-[12px] text-muted-foreground truncate">{aiStatus}</div>
                          <div className="flex gap-2 shrink-0">
                            <button type="button" onClick={testAiHeartbeat} disabled={isAiBusy || readOnly} className="rounded-lg border border-border px-3 py-1.5 text-[12px] font-bold hover:bg-muted disabled:opacity-50">心跳测试</button>
                            <button type="button" onClick={saveAiSettings} disabled={isAiBusy || readOnly} className="rounded-lg bg-[#afc33a] px-3 py-1.5 text-[12px] font-bold text-white hover:bg-[#9eb02f] disabled:opacity-50">保存</button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between p-3.5 bg-background border border-border/60 rounded-xl hover:bg-muted/30 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-lg"><BarChart2 className="w-4 h-4" /></div>
                        <div>
                          <div className="text-[14px] font-bold">使用统计</div>
                          <div className="text-[12px] text-muted-foreground">查看 Token 使用量和成本</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
                    </div>
                  </div>
                </div>

                {/* Rewards */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-px h-3 bg-border" />
                    <span className="text-xs font-semibold text-muted-foreground">奖励</span>
                    <div className="flex-1 h-px bg-border/50" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between p-3.5 bg-background border border-border/60 rounded-xl hover:bg-muted/30 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg"><Gift className="w-4 h-4" /></div>
                        <div>
                          <div className="text-[14px] font-bold">邀请与推广</div>
                          <div className="text-[12px] text-muted-foreground">邀请与推广统一累计到每月 Growth Pass</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
                    </div>

                    <div className="flex items-center justify-between p-3.5 bg-background border border-border/60 rounded-xl hover:bg-muted/30 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#8bc34a]/10 text-[#8bc34a] rounded-lg"><Trophy className="w-4 h-4" /></div>
                        <div>
                          <div className="text-[14px] font-bold">奖励任务</div>
                          <div className="text-[12px] text-muted-foreground">完成任务，赚取奖励</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
                    </div>
                  </div>
                </div>

                {/* Notification */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-px h-3 bg-border" />
                    <span className="text-xs font-semibold text-muted-foreground">通知</span>
                    <div className="flex-1 h-px bg-border/50" />
                  </div>
                  <div className="flex items-center justify-between p-3.5 bg-background border border-border/60 rounded-xl hover:bg-muted/30 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#e8f5e9] dark:bg-[#2e7d32]/20 text-[#4caf50] rounded-lg"><Bell className="w-4 h-4" /></div>
                      <div>
                        <div className="text-[14px] font-bold">通知</div>
                        <div className="text-[12px] text-muted-foreground">消息与奖励的系统推送</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
                  </div>
                </div>

                {/* Guide */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-px h-3 bg-border" />
                    <span className="text-xs font-semibold text-muted-foreground">引导</span>
                    <div className="flex-1 h-px bg-border/50" />
                  </div>
                  <div className="flex items-center justify-between p-3.5 bg-background border border-border/60 rounded-xl hover:bg-muted/30 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-500 rounded-lg"><GraduationCap className="w-4 h-4" /></div>
                      <div>
                        <div className="text-[14px] font-bold">引导与新手教程</div>
                        <div className="text-[12px] text-muted-foreground">管理引导、提示和新功能指示器</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
                  </div>
                </div>

              </div>

              <div className="px-6 py-4 border-t border-border/50 bg-background flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-semibold text-muted-foreground">社区与反馈</span>
                  <div className="flex-1 h-px bg-border/50" />
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 py-1.5 flex justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded transition-colors"><Settings className="w-4 h-4" /></button>
                  <button className="flex-1 py-1.5 flex justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded transition-colors"><Navigation className="w-4 h-4 rotate-45" /></button>
                  <button className="flex-1 py-1.5 flex justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded transition-colors"><Languages className="w-4 h-4" /></button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
