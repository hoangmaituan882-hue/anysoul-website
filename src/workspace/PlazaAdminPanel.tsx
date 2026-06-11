import CalendarDays from "../components/icons/clock-icon";
import Eye from "../components/icons/eye-icon";
import EyeOff from "../components/icons/eye-off-icon";
import Image from "../components/icons/camera-icon";
import Plus from "../components/icons/alarm-clock-plus-icon";
import RefreshCw from "../components/icons/refresh-icon";
import Rocket from "../components/icons/rocket-icon";
import Save from "../components/icons/save-icon";
import Sparkles from "../components/icons/sparkles-icon";
import Trash2 from "../components/icons/trash-icon";
import Upload from "../components/icons/upload-icon";
import X from "../components/icons/x-icon";
import { useEffect, useMemo, useRef, useState } from "react";

import { ImageUploadField } from "../components/ImageUploadField";
import { CONTENT_API_BASE, getImageUrl, uploadImageAsset } from "../content/client";
import { useAuth } from "../contexts/AuthContext";
import { defaultPlazaContent } from "../content/defaults/plaza";
import type { AdminContentEntry, PlazaContent, PlazaSoulItem, PlazaVisibility } from "../content/types";
import { OptimizedImage } from "../components/OptimizedImage";
import { cn } from "../lib/utils";
import { DateTimePicker } from "../components/DateTimePicker";

type AdminContentResponse = { entries: AdminContentEntry[] };
type ContentEntryMeta = Pick<AdminContentEntry, "version" | "updatedAt">;

const PLAZA_KEY = "plaza.main";
const WEEKLY_IMPORT_YEAR = 2026;
const WEEKLY_IMPORT_SERIES_NAME = "每周杂谈";
const weeklyImportGradients = [
  "from-sky-500/20 to-purple-500/20",
  "from-cyan-500/20 to-blue-500/20",
  "from-indigo-500/20 to-violet-500/20",
  "from-fuchsia-500/20 to-rose-500/20",
  "from-amber-500/20 to-orange-500/20",
  "from-emerald-500/20 to-teal-500/20"
];

const supportedImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);
const uploadMaxBytes = 15 * 1024 * 1024;

const visibilityOptions: Array<{ value: PlazaVisibility; label: string }> = [
  { value: "visible", label: "前台显示" },
  { value: "hidden", label: "后台隐藏" },
  { value: "pending", label: "待审核" },
  { value: "rejected", label: "已打回" }
];

function Field({ label, value, onChange, type = "text" }: { label: string; value: string | number; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12px] font-bold text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-xl border border-border bg-card px-3 text-sm font-medium outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
      />
    </label>
  );
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateKey(value: string) {
  const [year, month, day] = value.split("-").map((part) => Number(part));
  if (!year || !month || !day) return new Date();
  return new Date(year, month - 1, day);
}

function calculateWeeklyImportWeek(date: Date) {
  const startDate = new Date(WEEKLY_IMPORT_YEAR, 0, 1);
  const currentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((currentDate.getTime() - startDate.getTime()) / 86400000);
  return Math.max(1, Math.floor(diffDays / 7) + 1);
}

function getWeeklyImportMeta(date = new Date(), weekOverride?: number) {
  const currentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const week = Math.max(1, Math.floor(weekOverride || calculateWeeklyImportWeek(currentDate)));
  const paddedWeek = String(week).padStart(2, "0");
  const dateKey = formatDateKey(currentDate);

  return {
    year: WEEKLY_IMPORT_YEAR,
    week,
    dateKey,
    batchId: `weekly-${dateKey}-w${paddedWeek}`,
    seriesName: WEEKLY_IMPORT_SERIES_NAME,
    seriesTag: `第${week}周杂谈`,
    weekTag: `${WEEKLY_IMPORT_YEAR}年第${week}周`,
    importDateTag: `${dateKey}导入`
  };
}

function uniqueLines(value: string) {
  return Array.from(new Set(value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)));
}

function normalizePlazaSoulItem(item: unknown, index: number): PlazaSoulItem {
  const s = item as Partial<PlazaSoulItem> | null;
  const id = String(s?.id || `soul-${index}`);
  return {
    id,
    name: String(s?.name || "未命名作品"),
    author: String(s?.author || ""),
    tags: Array.isArray(s?.tags) ? Array.from(new Set(s.tags.map((t) => String(t).trim()).filter(Boolean))) : [],
    likes: typeof s?.likes === "number" && !Number.isNaN(s.likes) ? Math.max(0, s.likes) : 0,
    createdAt: String(s?.createdAt || s?.importDate || ""),
    views: typeof s?.views === "number" && !Number.isNaN(s.views) ? Math.max(0, s.views) : 0,
    activeDaysAgo: typeof s?.activeDaysAgo === "number" && !Number.isNaN(s.activeDaysAgo) ? s.activeDaysAgo : null,
    avatarSrc: typeof s?.avatarSrc === "string" ? s.avatarSrc : "",
    avatarInitials: typeof s?.avatarInitials === "string" ? s.avatarInitials : (s?.name || "").slice(0, 1),
    bannerColor: typeof s?.bannerColor === "string" ? s.bannerColor : "from-primary/20 to-primary/10",
    featured: Boolean(s?.featured),
    visibility: ["visible", "hidden", "pending", "rejected"].includes(String(s?.visibility)) ? (s!.visibility as PlazaVisibility) : "visible",
    desc: String(s?.desc || ""),
    importBatchId: typeof s?.importBatchId === "string" ? s.importBatchId : undefined,
    importYear: typeof s?.importYear === "number" ? s.importYear : undefined,
    importWeek: typeof s?.importWeek === "number" ? s.importWeek : undefined,
    importDate: typeof s?.importDate === "string" ? s.importDate : undefined,
    seriesName: typeof s?.seriesName === "string" ? s.seriesName : undefined,
    seriesIndex: typeof s?.seriesIndex === "number" ? s.seriesIndex : undefined,
    itemIndex: typeof s?.itemIndex === "number" ? s.itemIndex : undefined,
    mediaAssetId: typeof s?.mediaAssetId === "string" ? s.mediaAssetId : undefined,
    sourceAnimeTitle: typeof s?.sourceAnimeTitle === "string" ? s.sourceAnimeTitle : undefined,
    sourceAnimeId: typeof s?.sourceAnimeId === "string" ? s.sourceAnimeId : undefined,
    sourceAnimeUrl: typeof s?.sourceAnimeUrl === "string" ? s.sourceAnimeUrl : undefined,
    submittedByUserId: typeof s?.submittedByUserId === "string" ? s.submittedByUserId : undefined,
    submittedByName: typeof s?.submittedByName === "string" ? s.submittedByName : undefined,
    submittedAt: typeof s?.submittedAt === "string" ? s.submittedAt : undefined,
    reviewedAt: typeof s?.reviewedAt === "string" ? s.reviewedAt : undefined,
    reviewedBy: typeof s?.reviewedBy === "string" ? s.reviewedBy : undefined,
    reviewNote: typeof s?.reviewNote === "string" ? s.reviewNote : undefined,
    submissionBatchId: typeof s?.submissionBatchId === "string" ? s.submissionBatchId : undefined,
    submissionKind: s?.submissionKind === "user-single" || s?.submissionKind === "user-batch" || s?.submissionKind === "admin-weekly" ? s.submissionKind : undefined
  };
}

function normalizePlaza(value: unknown): PlazaContent {
  const plaza = value as Partial<PlazaContent> | null;

  const souls = Array.isArray(plaza?.souls)
    ? plaza.souls.map((s, i) => normalizePlazaSoulItem(s, i))
    : defaultPlazaContent.souls;

  return {
    souls,
    moments: Array.isArray(plaza?.moments) ? plaza.moments : defaultPlazaContent.moments,
    groups: Array.isArray(plaza?.groups) ? plaza.groups : defaultPlazaContent.groups,
    tags: Array.isArray(plaza?.tags) ? Array.from(new Set(plaza.tags.map((t) => String(t).trim()).filter(Boolean))) : defaultPlazaContent.tags
  };
}

async function readContentError(response: Response, fallback: string) {
  try {
    const data = await response.json() as { error?: string };
    return data.error ? `${fallback}：${response.status} ${data.error}` : `${fallback}：HTTP ${response.status}`;
  } catch {
    return `${fallback}：HTTP ${response.status}`;
  }
}

export function PlazaAdminPanel({ readOnly = false }: { readOnly?: boolean }) {
  const { authFetch } = useAuth();
  const weeklyUploadInputRef = useRef<HTMLInputElement | null>(null);
  const [plaza, setPlaza] = useState<PlazaContent>(defaultPlazaContent);
  const [selectedId, setSelectedId] = useState(defaultPlazaContent.souls[0]?.id || "");
  const [status, setStatus] = useState("正在加载图库内容...");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingWeekly, setIsUploadingWeekly] = useState(false);
  const [weeklyImportText, setWeeklyImportText] = useState("");
  const [weeklyImportAuthor, setWeeklyImportAuthor] = useState("运营");
  const [weeklyImportDate, setWeeklyImportDate] = useState(() => formatDateKey(new Date()));
  const [weeklyImportWeek, setWeeklyImportWeek] = useState(() => String(calculateWeeklyImportWeek(new Date())));
  const [isSoulEditorOpen, setIsSoulEditorOpen] = useState(false);
  const [entryMeta, setEntryMeta] = useState<ContentEntryMeta | null>(null);
  const weeklyMeta = useMemo(() => getWeeklyImportMeta(parseDateKey(weeklyImportDate), Number(weeklyImportWeek)), [weeklyImportDate, weeklyImportWeek]);

  const selectedSoul = plaza.souls.find((soul) => soul.id === selectedId) || plaza.souls[0];

  const stats = useMemo(() => ({
    total: plaza.souls.length,
    visible: plaza.souls.filter((soul) => soul.visibility === "visible").length,
    hidden: plaza.souls.filter((soul) => soul.visibility === "hidden").length,
    pending: plaza.souls.filter((soul) => soul.visibility === "pending").length,
    rejected: plaza.souls.filter((soul) => soul.visibility === "rejected").length,
    featured: plaza.souls.filter((soul) => soul.featured).length
  }), [plaza.souls]);

  const currentBatchCount = useMemo(() => plaza.souls.filter((soul) => soul.importBatchId === weeklyMeta.batchId).length, [plaza.souls, weeklyMeta.batchId]);

  const load = async () => {
    const res = await authFetch(`${CONTENT_API_BASE}/api/admin/content`);
    if (!res.ok) throw new Error(await readContentError(res, "加载图库失败"));

    const data = await res.json() as AdminContentResponse;
    const entry = data.entries.find((item) => item.key === PLAZA_KEY);
    const draft = normalizePlaza(entry?.draft);
    setPlaza(draft);
    setSelectedId(draft.souls[0]?.id || "");
    setEntryMeta(entry ? { version: entry.version, updatedAt: entry.updatedAt } : null);
    setStatus("图库内容已同步");
  };

  useEffect(() => {
    load().catch((error) => setStatus(error instanceof Error ? error.message : "内容服务未启动，请运行 npm run server:dev"));
  }, []);

  const savePlazaContent = async (payload: PlazaContent, publish = false, message = "Publish plaza controls") => {
    const draftRes = await authFetch(`${CONTENT_API_BASE}/api/admin/content/${PLAZA_KEY}/draft`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        payload,
        expectedVersion: entryMeta?.version,
        expectedUpdatedAt: entryMeta?.updatedAt
      })
    });
    if (!draftRes.ok) throw new Error(await readContentError(draftRes, "保存草稿失败"));
    const draftData = await draftRes.json() as { entry?: AdminContentEntry };
    const nextMeta = draftData.entry ? { version: draftData.entry.version, updatedAt: draftData.entry.updatedAt } : entryMeta;
    if (nextMeta) setEntryMeta(nextMeta);

    if (publish) {
      const publishRes = await authFetch(`${CONTENT_API_BASE}/api/admin/content/${PLAZA_KEY}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          expectedVersion: nextMeta?.version,
          expectedUpdatedAt: nextMeta?.updatedAt
        })
      });
      if (!publishRes.ok) throw new Error(await readContentError(publishRes, "发布失败"));
      const publishData = await publishRes.json() as { entry?: AdminContentEntry };
      if (publishData.entry) setEntryMeta({ version: publishData.entry.version, updatedAt: publishData.entry.updatedAt });
    }
  };

  const save = async (publish = false) => {
    if (readOnly) {
      setStatus("只读模式无法保存或发布图库");
      return;
    }

    setIsSaving(true);

    try {
      await savePlazaContent(plaza, publish);
      setStatus(publish ? "已发布，图库前台会自动同步更新" : "草稿已保存，发布后同步到前台");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : publish ? "发布失败，请检查内容服务" : "保存失败，请检查内容服务");
    } finally {
      setIsSaving(false);
    }
  };

  const updateSoul = (id: string, patch: Partial<PlazaSoulItem>) => {
    if (readOnly) return;

    setPlaza((current) => ({
      ...current,
      souls: current.souls.map((soul) => soul.id === id ? { ...soul, ...patch } : soul)
    }));
  };

  const addSoul = () => {
    if (readOnly) {
      setStatus("只读模式无法添加图库作品");
      return;
    }

    const id = `soul-${Date.now()}`;
    setPlaza((current) => ({
      ...current,
      souls: [...current.souls, {
        id,
        name: "新的图库作品",
        author: "运营",
        tags: [],
        likes: 0,
        createdAt: new Date().toISOString().slice(0, 10),
        views: 0,
        activeDaysAgo: null,
        avatarSrc: "",
        bannerColor: "from-sky-500/20 to-purple-500/20",
        featured: false,
        visibility: "pending",
        desc: ""
      }]
    }));
    setSelectedId(id);
    setIsSoulEditorOpen(true);
  };

  const removeSoul = (id: string) => {
    if (readOnly) {
      setStatus("只读模式无法删除图库作品");
      return;
    }

    setPlaza((current) => {
      const nextSouls = current.souls.filter((soul) => soul.id !== id);
      setSelectedId(nextSouls[0]?.id || "");
      return { ...current, souls: nextSouls };
    });
  };

  const deleteSoulAndPublish = async (id: string) => {
    if (readOnly) {
      setStatus("只读模式无法删除图库作品");
      return;
    }
    const nextSouls = plaza.souls.filter((soul) => soul.id !== id);
    const nextPlaza = { ...plaza, souls: nextSouls };
    setPlaza(nextPlaza);
    setSelectedId(nextSouls[0]?.id || "");
    setIsSoulEditorOpen(false);
    setIsSaving(true);
    try {
      await savePlazaContent(nextPlaza, true, "Delete plaza item and publish");
      setStatus("作品已删除并发布");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "作品删除发布失败");
    } finally {
      setIsSaving(false);
    }
  };

  const reviewSubmittedSoul = async (id: string, decision: "approve" | "reject") => {
    if (readOnly) {
      setStatus("只读模式无法审核图库投稿");
      return;
    }

    setIsSaving(true);
    try {
      const response = await authFetch(`${CONTENT_API_BASE}/api/admin/plaza/items/${encodeURIComponent(id)}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision })
      });
      if (!response.ok) throw new Error(await readContentError(response, decision === "approve" ? "通过投稿失败" : "拒绝投稿失败"));
      const data = await response.json() as { entry?: AdminContentEntry };
      const draft = normalizePlaza(data.entry?.draft);
      setPlaza(draft);
      setSelectedId(draft.souls[0]?.id || "");
      setIsSoulEditorOpen(false);
      if (data.entry) setEntryMeta({ version: data.entry.version, updatedAt: data.entry.updatedAt });
      setStatus(decision === "approve" ? "投稿已通过并发布到前台图库" : "投稿已拒绝，上传图片已删除");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : decision === "approve" ? "通过投稿失败" : "拒绝投稿失败");
    } finally {
      setIsSaving(false);
    }
  };

  const publishWeeklyUrls = async (items: { url: string; mediaAssetId?: string }[]) => {
    if (readOnly) {
      setStatus("只读模式无法批量导入图库作品");
      return;
    }

    if (items.length === 0) {
      setStatus("请先点击上传多图，从相册或文件管理选择图片");
      return;
    }

    const existingImageUrls = new Set(plaza.souls.map((soul) => soul.avatarSrc).filter(Boolean));
    const candidateItems = items.filter((item) => !existingImageUrls.has(item.url));
    const skippedCount = items.length - candidateItems.length;

    if (candidateItems.length === 0) {
      setStatus("本次输入的图片地址均已存在，未生成新图库卡片");
      return;
    }

    setIsSaving(true);

    const existingBatchMaxIndex = plaza.souls
      .filter((soul) => soul.importBatchId === weeklyMeta.batchId)
      .reduce((max, soul) => Math.max(max, soul.itemIndex || 0), 0);

    const createdAt = Date.now();
    const newSouls: PlazaSoulItem[] = candidateItems.map((item, index) => {
      const itemIndex = existingBatchMaxIndex + index + 1;
      const paddedIndex = String(itemIndex).padStart(2, "0");

      return {
        id: `${weeklyMeta.batchId}-${paddedIndex}-${createdAt + index}`,
        name: `${weeklyMeta.dateKey}-${paddedIndex}`,
        author: weeklyImportAuthor.trim() || "运营",
        tags: ["每周杂谈", weeklyMeta.seriesTag, weeklyMeta.weekTag, weeklyMeta.importDateTag],
        likes: 0,
        createdAt: weeklyMeta.dateKey,
        views: 0,
        activeDaysAgo: null,
        avatarSrc: item.url,
        bannerColor: weeklyImportGradients[index % weeklyImportGradients.length],
        featured: false,
        visibility: "visible",
        desc: "",
        importBatchId: weeklyMeta.batchId,
        importYear: weeklyMeta.year,
        importWeek: weeklyMeta.week,
        importDate: weeklyMeta.dateKey,
        seriesName: weeklyMeta.seriesName,
        seriesIndex: weeklyMeta.week,
        itemIndex,
        mediaAssetId: item.mediaAssetId
      };
    });

    const nextPlaza: PlazaContent = {
      ...plaza,
      souls: [...newSouls, ...plaza.souls],
      tags: Array.from(new Set([...plaza.tags, "每周杂谈", weeklyMeta.seriesTag, weeklyMeta.weekTag, weeklyMeta.importDateTag]))
    };

    try {
      await savePlazaContent(nextPlaza, true, `Publish ${weeklyMeta.seriesTag} plaza import`);
      setPlaza(nextPlaza);
      setSelectedId(newSouls[0].id);
      setWeeklyImportText("");
      setStatus(`已导入并发布 ${newSouls.length} 张${weeklyMeta.seriesTag}图库卡片${skippedCount > 0 ? `，跳过 ${skippedCount} 张重复图片` : ""}。`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "导入后发布失败，请检查内容服务");
    } finally {
      setIsSaving(false);
    }
  };

  const importWeeklySouls = () => {
    void publishWeeklyUrls(uniqueLines(weeklyImportText).map((url) => ({ url })));
  };

  const uploadWeeklyImages = async (files?: FileList | File[] | null) => {
    const selectedFiles = Array.from(files || []);
    if (selectedFiles.length === 0) {
      setStatus("没有选择图片，请重新点击上传并发布");
      return;
    }
    if (readOnly) {
      setStatus("只读模式无法上传图库图片");
      return;
    }

    const invalid = selectedFiles.filter((f) => !supportedImageTypes.has(f.type));
    if (invalid.length) {
      setStatus(`不支持的文件格式: ${invalid.map((f) => f.name).join("、")}。仅支持 JPG、PNG、WebP、GIF、AVIF。`);
      return;
    }

    const oversized = selectedFiles.filter((f) => f.size > uploadMaxBytes);
    if (oversized.length) {
      setStatus(`文件过大: ${oversized.map((f) => `${f.name} (${(f.size / 1024 / 1024).toFixed(1)}MB)`).join("、")}。单文件限制 15MB。`);
      return;
    }

    setIsUploadingWeekly(true);
    setStatus(`正在上传 ${selectedFiles.length} 张图片，完成后会自动发布到图库...`);

    try {
      const uploadedItems: { url: string; mediaAssetId: string }[] = [];
      for (const file of selectedFiles) {
        const result = await uploadImageAsset(authFetch, file, { admin: true, scope: "plaza-weekly" });
        uploadedItems.push({ url: result.asset.url, mediaAssetId: result.asset.id });
      }

      await publishWeeklyUrls(uploadedItems);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "批量上传失败");
    } finally {
      setIsUploadingWeekly(false);
    }
  };

  const handleWeeklyUploadInputChange = (files?: FileList | null) => {
    const selectedFiles = Array.from(files || []);
    if (weeklyUploadInputRef.current) weeklyUploadInputRef.current.value = "";
    void uploadWeeklyImages(selectedFiles);
  };

  const updateWeeklyImportDate = (value: string) => {
    setWeeklyImportDate(value);
    setWeeklyImportWeek(String(calculateWeeklyImportWeek(parseDateKey(value))));
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
            <Image className="size-6 text-primary" /> 图库中心控制
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">简单控制前台图库展示：编辑卡片、切换显示状态、设置精选，发布后前台自动更新。</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={load} className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm font-bold transition-colors hover:bg-muted"><RefreshCw className="size-4" /> 刷新</button>
          <button disabled={isSaving || readOnly} onClick={() => save()} className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-bold transition-colors hover:bg-muted disabled:opacity-50"><Save className="size-4" /> 保存草稿</button>
          <button disabled={isSaving || readOnly} onClick={() => save(true)} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"><Rocket className="size-4" /> 发布到前台</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <div className="rounded-2xl border border-border bg-background p-4 shadow-sm"><div className="text-xs font-bold text-muted-foreground">图库总数</div><div className="mt-1 text-3xl font-black">{stats.total}</div></div>
        <div className="rounded-2xl border border-border bg-background p-4 shadow-sm"><div className="text-xs font-bold text-muted-foreground">前台显示</div><div className="mt-1 text-3xl font-black text-emerald-500">{stats.visible}</div></div>
        <div className="rounded-2xl border border-border bg-background p-4 shadow-sm"><div className="text-xs font-bold text-muted-foreground">后台隐藏</div><div className="mt-1 text-3xl font-black text-slate-500">{stats.hidden}</div></div>
        <div className="rounded-2xl border border-border bg-background p-4 shadow-sm"><div className="text-xs font-bold text-muted-foreground">待审核</div><div className="mt-1 text-3xl font-black text-amber-500">{stats.pending}</div></div>
        <div className="rounded-2xl border border-border bg-background p-4 shadow-sm"><div className="text-xs font-bold text-muted-foreground">已打回</div><div className="mt-1 text-3xl font-black text-red-500">{stats.rejected}</div></div>
        <div className="rounded-2xl border border-border bg-background p-4 shadow-sm"><div className="text-xs font-bold text-muted-foreground">精选</div><div className="mt-1 text-3xl font-black text-primary">{stats.featured}</div></div>
      </div>

      <div className="rounded-3xl border border-border bg-background p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-2xl">
            <h3 className="flex items-center gap-2 text-lg font-black text-foreground"><Upload className="size-5 text-primary" /> 杂谈批量导入</h3>
            <p className="mt-1 text-sm font-medium leading-relaxed text-muted-foreground">
              选择导入日期和第几周杂谈标签后，上传图片会直接生成 {weeklyMeta.dateKey}-01 这种名称，设为前台显示并自动发布到图库。
            </p>
          </div>
          <div className="grid min-w-[260px] grid-cols-2 gap-2 text-xs font-bold text-muted-foreground">
            <div className="rounded-2xl border border-border bg-card p-3"><div>当前批次</div><div className="mt-1 text-sm text-foreground">{weeklyMeta.batchId}</div></div>
            <div className="rounded-2xl border border-border bg-card p-3"><div>本批已有</div><div className="mt-1 text-sm text-foreground">{currentBatchCount} 张</div></div>
            <div className="rounded-2xl border border-border bg-card p-3"><div>导入日期</div><div className="mt-1 text-sm text-foreground">{weeklyMeta.dateKey}</div></div>
            <div className="rounded-2xl border border-border bg-card p-3"><div>系列标签</div><div className="mt-1 text-sm text-foreground">{weeklyMeta.seriesTag}</div></div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
          <Field label="默认作者" value={weeklyImportAuthor} onChange={setWeeklyImportAuthor} />
          <DateTimePicker label="导入日期" mode="date" value={weeklyImportDate} onChange={updateWeeklyImportDate} />
          <Field label="第几周杂谈" type="number" value={weeklyImportWeek} onChange={(value) => setWeeklyImportWeek(value)} />
          <div>
            <button
              type="button"
              disabled={readOnly || isUploadingWeekly || isSaving}
              onClick={() => weeklyUploadInputRef.current?.click()}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-black text-foreground shadow-sm transition-colors hover:bg-muted disabled:opacity-50"
            >
              <Upload className="size-4" /> {isUploadingWeekly ? "上传发布中..." : "上传并发布"}
            </button>
            <input
              ref={weeklyUploadInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              multiple
              disabled={readOnly || isUploadingWeekly || isSaving}
              className="hidden"
              onChange={(event) => handleWeeklyUploadInputChange(event.currentTarget.files)}
            />
          </div>
          <div className="flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-3 text-xs font-bold text-muted-foreground">
            <CalendarDays className="size-4 text-primary" /> {weeklyMeta.seriesName} / 第 {weeklyMeta.week} 周
          </div>
          <label className="flex flex-col gap-1.5 md:col-span-2">
            <span className="text-[12px] font-bold text-muted-foreground">手动图片地址（一行一个，可选）</span>
            <textarea
              value={weeklyImportText}
              onChange={(event) => setWeeklyImportText(event.target.value)}
              rows={3}
              className="min-h-20 resize-y rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
              placeholder="https://api.linzesss.icu/uploads/..."
            />
          </label>
          <button disabled={readOnly || isSaving || isUploadingWeekly || uniqueLines(weeklyImportText).length === 0} onClick={importWeeklySouls} className="inline-flex h-10 items-center justify-center gap-2 self-end rounded-xl bg-primary px-4 text-sm font-black text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50">
            <Rocket className="size-4" /> 导入并发布
          </button>
          <div className="flex h-10 items-center rounded-xl border border-border bg-muted/20 px-3 text-xs font-bold text-muted-foreground md:col-span-4">
            待手动导入 {uniqueLines(weeklyImportText).length} 张图片；多图上传会跳过这一步，上传成功后直接发布到前台图库。
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-background p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-black text-foreground">作品相册</h3>
            <p className="text-sm text-muted-foreground">点击作品卡片进入二级编辑弹窗，图片上传和详细字段都在弹窗内维护。</p>
          </div>
          <button disabled={readOnly} onClick={addSoul} className="inline-flex items-center gap-2 rounded-xl border border-dashed border-border bg-card px-3 py-2 text-sm font-bold text-primary hover:bg-muted disabled:opacity-50">
            <Plus className="size-4" /> 添加作品
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          {plaza.souls.map((soul) => (
            <button
              key={soul.id}
              type="button"
              onClick={() => { setSelectedId(soul.id); setIsSoulEditorOpen(true); }}
              className={cn("group overflow-hidden rounded-2xl border bg-card text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md", selectedId === soul.id ? "border-primary/40 ring-2 ring-primary/10" : "border-border")}
            >
              <div className="relative aspect-[4/5] bg-muted">
                {soul.avatarSrc ? <OptimizedImage src={soul.mediaAssetId ? getImageUrl(soul.mediaAssetId, { w: 300 }) : soul.avatarSrc} alt={soul.name} className="h-full w-full" /> : <div className="flex h-full items-center justify-center text-4xl font-black text-primary">{soul.avatarInitials || soul.name.slice(0, 1)}</div>}
                <span className={cn("absolute left-2 top-2 rounded-full px-2 py-1 text-[10px] font-black shadow-sm", soul.visibility === "visible" ? "bg-emerald-500 text-white" : "bg-background/90 text-foreground")}>{soul.visibility === "visible" ? "可见" : soul.visibility}</span>
                {soul.featured && <span className="absolute right-2 top-2 rounded-full bg-primary px-2 py-1 text-[10px] font-black text-primary-foreground shadow-sm">精选</span>}
              </div>
              <div className="space-y-2 p-3">
                <div className="line-clamp-1 text-sm font-black text-foreground">{soul.name}</div>
                <div className="line-clamp-1 text-[11px] font-bold text-muted-foreground">by {soul.author}</div>
                <div className="flex flex-wrap gap-1">
                  {(soul.importWeek ? [`第${soul.importWeek}周`] : soul.tags.slice(0, 2)).map((tag) => <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">{tag}</span>)}
                </div>
                <div className="text-[11px] font-bold text-muted-foreground">{soul.importDate || soul.createdAt || "未设置日期"}</div>
                {soul.submittedByName && (
                  <div className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-black text-primary">投稿：{soul.submittedByName}</div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="hidden">
        <div className="rounded-3xl border border-border bg-background p-3 shadow-sm">
          <div className="mb-3 flex items-center justify-between px-2">
            <h3 className="text-sm font-black">作品列表</h3>
            <button disabled={readOnly} onClick={addSoul} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-bold text-primary hover:bg-primary/10 disabled:opacity-50"><Plus className="size-3.5" /> 添加</button>
          </div>
          <div className="max-h-[560px] space-y-2 overflow-y-auto pr-1">
            {plaza.souls.map((soul) => (
              <button key={soul.id} onClick={() => setSelectedId(soul.id)} className={cn("w-full rounded-2xl border p-3 text-left transition-colors", selectedId === soul.id ? "border-primary/40 bg-primary/10" : "border-border bg-card hover:bg-muted/50")}>
                <div className="flex items-center gap-3">
                  <div className="size-12 shrink-0 overflow-hidden rounded-xl bg-muted">
                    {soul.avatarSrc ? <img src={soul.avatarSrc} alt={soul.name} className="size-full object-cover" /> : <div className="flex size-full items-center justify-center font-black text-primary">{soul.avatarInitials || soul.name.slice(0, 1)}</div>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-black">{soul.name}</div>
                    <div className="mt-0.5 truncate text-xs text-muted-foreground">by {soul.author}</div>
                  </div>
                  {soul.visibility === "visible" ? <Eye className="size-4 text-emerald-500" /> : <EyeOff className="size-4 text-muted-foreground" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        {selectedSoul && (
          <div className="rounded-3xl border border-border bg-background p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-black">编辑作品</h3>
                <p className="text-sm text-muted-foreground">修改后先保存草稿，确认无误后发布到前台。</p>
              </div>
              <button disabled={readOnly} onClick={() => removeSoul(selectedSoul.id)} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-bold text-red-500 hover:bg-red-500/10 disabled:opacity-50"><Trash2 className="size-3.5" /> 删除</button>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[240px_1fr]">
              <div className="overflow-hidden rounded-3xl border border-border bg-card">
                <div className={cn("relative min-h-[300px] bg-gradient-radial", selectedSoul.bannerColor)}>
                  {selectedSoul.avatarSrc ? <img src={selectedSoul.avatarSrc} alt={selectedSoul.name} className="w-full object-cover" /> : <div className="flex aspect-square items-center justify-center text-5xl font-black text-primary">{selectedSoul.avatarInitials || selectedSoul.name.slice(0, 1)}</div>}
                  {selectedSoul.featured && <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-1 text-[10px] font-bold text-primary-foreground"><Sparkles className="size-3" /> 精选</span>}
                </div>
                <div className="p-4">
                  <div className="text-lg font-black">{selectedSoul.name}</div>
                  <div className="text-xs text-muted-foreground">by {selectedSoul.author}</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Field label="作品名" value={selectedSoul.name} onChange={(value) => updateSoul(selectedSoul.id, { name: value })} />
                  <Field label="作者" value={selectedSoul.author} onChange={(value) => updateSoul(selectedSoul.id, { author: value })} />
                  <ImageUploadField label="图片地址" value={selectedSoul.avatarSrc || ""} onChange={(value) => updateSoul(selectedSoul.id, { avatarSrc: value })} onAssetMetadata={(info) => updateSoul(selectedSoul.id, { mediaAssetId: info.assetId })} admin readOnly={readOnly} scope="plaza-item" compact />
                  <Field label="渐变背景 class" value={selectedSoul.bannerColor} onChange={(value) => updateSoul(selectedSoul.id, { bannerColor: value })} />
                  <Field label="点赞数" type="number" value={selectedSoul.likes} onChange={(value) => updateSoul(selectedSoul.id, { likes: Number(value) || 0 })} />
                  <Field label="浏览量" type="number" value={selectedSoul.views} onChange={(value) => updateSoul(selectedSoul.id, { views: Number(value) || 0 })} />
                  <DateTimePicker label="创建日期" mode="date" value={selectedSoul.createdAt} onChange={(value) => updateSoul(selectedSoul.id, { createdAt: value })} />
                  <Field label="标签，逗号分隔" value={selectedSoul.tags.join(", ")} onChange={(value) => updateSoul(selectedSoul.id, { tags: Array.from(new Set(value.split(",").map((tag) => tag.trim()).filter(Boolean))) })} />
                </div>

                <label className="flex flex-col gap-1.5">
                  <span className="text-[12px] font-bold text-muted-foreground">简介</span>
                  <textarea value={selectedSoul.desc} onChange={(event) => updateSoul(selectedSoul.id, { desc: event.target.value })} rows={3} className="resize-none rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15" />
                </label>

                <div className="flex flex-wrap gap-2">
                  {visibilityOptions.map((option) => <button key={option.value} onClick={() => updateSoul(selectedSoul.id, { visibility: option.value })} className={cn("rounded-full border px-4 py-2 text-sm font-bold transition-colors", selectedSoul.visibility === option.value ? "border-foreground bg-foreground text-background" : "border-border bg-card hover:bg-muted")}>{option.label}</button>)}
                  <button onClick={() => updateSoul(selectedSoul.id, { featured: !selectedSoul.featured })} className={cn("rounded-full border px-4 py-2 text-sm font-bold transition-colors", selectedSoul.featured ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted")}>设为精选</button>
                </div>

                {(selectedSoul.importBatchId || selectedSoul.seriesName || selectedSoul.importWeek) && (
                  <div className="rounded-2xl border border-border bg-card p-4 text-xs font-bold text-muted-foreground">
                    <div className="mb-2 flex items-center gap-2 text-sm font-black text-foreground"><CalendarDays className="size-4 text-primary" /> 每周导入信息</div>
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                      <div>导入批次：<span className="text-foreground">{selectedSoul.importBatchId || "-"}</span></div>
                      <div>导入日期：<span className="text-foreground">{selectedSoul.importDate || selectedSoul.createdAt || "-"}</span></div>
                      <div>系列：<span className="text-foreground">{selectedSoul.seriesName || "-"}</span></div>
                      <div>周数：<span className="text-foreground">{selectedSoul.importWeek ? `第${selectedSoul.importWeek}周` : "-"}</span></div>
                      <div>批次序号：<span className="text-foreground">{selectedSoul.itemIndex ? String(selectedSoul.itemIndex).padStart(2, "0") : "-"}</span></div>
                      <div>年份：<span className="text-foreground">{selectedSoul.importYear || "-"}</span></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedSoul && isSoulEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-3xl border border-border bg-background shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-background/95 px-5 py-4 backdrop-blur">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.2em] text-primary">Gallery Item</div>
                <h3 className="mt-1 text-xl font-black text-foreground">{selectedSoul.name || "编辑作品"}</h3>
              </div>
              <button onClick={() => setIsSoulEditorOpen(false)} className="inline-flex size-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <X className="size-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-5 p-5 lg:grid-cols-[280px_1fr]">
              <div className="space-y-3">
                <div className="overflow-hidden rounded-3xl border border-border bg-card">
                  <div className={cn("relative min-h-[320px] bg-gradient-radial", selectedSoul.bannerColor)}>
                    {selectedSoul.avatarSrc ? <OptimizedImage src={selectedSoul.mediaAssetId ? getImageUrl(selectedSoul.mediaAssetId, { w: 400 }) : selectedSoul.avatarSrc} alt={selectedSoul.name} className="w-full" /> : <div className="flex aspect-square items-center justify-center text-5xl font-black text-primary">{selectedSoul.avatarInitials || selectedSoul.name.slice(0, 1)}</div>}
                    {selectedSoul.featured && <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-1 text-[10px] font-bold text-primary-foreground"><Sparkles className="size-3" /> 精选</span>}
                  </div>
                </div>
                <ImageUploadField label="图片" value={selectedSoul.avatarSrc || ""} onChange={(value) => updateSoul(selectedSoul.id, { avatarSrc: value })} onAssetMetadata={(info) => updateSoul(selectedSoul.id, { mediaAssetId: info.assetId })} admin readOnly={readOnly} scope="plaza-item" compact />
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Field label="作品名" value={selectedSoul.name} onChange={(value) => updateSoul(selectedSoul.id, { name: value })} />
                  <Field label="作者" value={selectedSoul.author} onChange={(value) => updateSoul(selectedSoul.id, { author: value })} />
                  <Field label="渐变背景 class" value={selectedSoul.bannerColor} onChange={(value) => updateSoul(selectedSoul.id, { bannerColor: value })} />
                  <DateTimePicker label="创建日期" mode="date" value={selectedSoul.createdAt} onChange={(value) => updateSoul(selectedSoul.id, { createdAt: value })} />
                  <Field label="点赞数" type="number" value={selectedSoul.likes} onChange={(value) => updateSoul(selectedSoul.id, { likes: Number(value) || 0 })} />
                  <Field label="浏览量" type="number" value={selectedSoul.views} onChange={(value) => updateSoul(selectedSoul.id, { views: Number(value) || 0 })} />
                  <Field label="标签，逗号分隔" value={selectedSoul.tags.join(", ")} onChange={(value) => updateSoul(selectedSoul.id, { tags: Array.from(new Set(value.split(",").map((tag) => tag.trim()).filter(Boolean))) })} />
                  <Field label="第几周杂谈" type="number" value={selectedSoul.importWeek || ""} onChange={(value) => updateSoul(selectedSoul.id, { importWeek: value === "" ? undefined : (Number(value) || undefined) })} />
                  <DateTimePicker label="导入日期" mode="date" value={selectedSoul.importDate || selectedSoul.createdAt || weeklyImportDate} onChange={(value) => updateSoul(selectedSoul.id, { importDate: value, createdAt: value })} />
                  <Field label="系列名称" value={selectedSoul.seriesName || ""} onChange={(value) => updateSoul(selectedSoul.id, { seriesName: value })} />
                </div>

                <label className="flex flex-col gap-1.5">
                  <span className="text-[12px] font-bold text-muted-foreground">简介</span>
                  <textarea value={selectedSoul.desc} onChange={(event) => updateSoul(selectedSoul.id, { desc: event.target.value })} rows={4} className="resize-none rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15" />
                </label>

                <div className="flex flex-wrap gap-2">
                  {visibilityOptions.map((option) => <button key={option.value} onClick={() => updateSoul(selectedSoul.id, { visibility: option.value })} className={cn("rounded-full border px-4 py-2 text-sm font-bold transition-colors", selectedSoul.visibility === option.value ? "border-foreground bg-foreground text-background" : "border-border bg-card hover:bg-muted")}>{option.label}</button>)}
                  <button onClick={() => updateSoul(selectedSoul.id, { featured: !selectedSoul.featured })} className={cn("rounded-full border px-4 py-2 text-sm font-bold transition-colors", selectedSoul.featured ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted")}>设为精选</button>
                </div>

                {selectedSoul.submittedByName && (
                  <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs font-bold text-muted-foreground">
                    <div className="mb-2 flex items-center gap-2 text-sm font-black text-foreground"><Upload className="size-4 text-primary" /> 用户投稿信息</div>
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                      <div>投稿用户：<span className="text-foreground">{selectedSoul.submittedByName}</span></div>
                      <div>投稿时间：<span className="text-foreground">{selectedSoul.submittedAt || "-"}</span></div>
                      <div>来源动画：<span className="text-foreground">{selectedSoul.sourceAnimeTitle || "-"}</span></div>
                      <div>资源 ID：<span className="text-foreground">{selectedSoul.mediaAssetId || "-"}</span></div>
                    </div>
                    {selectedSoul.visibility === "pending" && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button disabled={readOnly || isSaving} onClick={() => { void reviewSubmittedSoul(selectedSoul.id, "approve"); }} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-black text-white hover:bg-emerald-700 disabled:opacity-50">
                          <Rocket className="size-3.5" /> 通过并发布
                        </button>
                        <button disabled={readOnly || isSaving} onClick={() => { void reviewSubmittedSoul(selectedSoul.id, "reject"); }} className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-black text-red-600 hover:bg-red-500/15 disabled:opacity-50">
                          <Trash2 className="size-3.5" /> 拒绝并删除
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {(selectedSoul.importBatchId || selectedSoul.seriesName || selectedSoul.importWeek) && (
                  <div className="rounded-2xl border border-border bg-card p-4 text-xs font-bold text-muted-foreground">
                    <div className="mb-2 flex items-center gap-2 text-sm font-black text-foreground"><CalendarDays className="size-4 text-primary" /> 每周导入信息</div>
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                      <div>导入批次：<span className="text-foreground">{selectedSoul.importBatchId || "-"}</span></div>
                      <div>导入日期：<span className="text-foreground">{selectedSoul.importDate || selectedSoul.createdAt || "-"}</span></div>
                      <div>系列：<span className="text-foreground">{selectedSoul.seriesName || "-"}</span></div>
                      <div>周数：<span className="text-foreground">{selectedSoul.importWeek ? `第${selectedSoul.importWeek}周` : "-"}</span></div>
                      <div>批次序号：<span className="text-foreground">{selectedSoul.itemIndex ? String(selectedSoul.itemIndex).padStart(2, "0") : "-"}</span></div>
                      <div>年份：<span className="text-foreground">{selectedSoul.importYear || "-"}</span></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 flex flex-wrap justify-end gap-2 border-t border-border bg-background/95 px-5 py-4 backdrop-blur">
              <button onClick={() => setIsSoulEditorOpen(false)} className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-bold hover:bg-muted">取消</button>
              <button disabled={readOnly || isSaving} onClick={() => { void (selectedSoul.submittedByUserId && selectedSoul.visibility === "pending" ? reviewSubmittedSoul(selectedSoul.id, "reject") : deleteSoulAndPublish(selectedSoul.id)); }} className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-500/15 disabled:opacity-50">
                <Trash2 className="size-4" /> {selectedSoul.submittedByUserId && selectedSoul.visibility === "pending" ? "拒绝并删除" : "删除并发布"}
              </button>
              <button disabled={isSaving || readOnly} onClick={() => { setIsSoulEditorOpen(false); void save(true); }} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50">
                <Rocket className="size-4" /> 保存并发布
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-muted/20 px-4 py-3 text-xs font-medium text-muted-foreground">{status}</div>
    </div>
  );
}
