import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Eye, EyeOff, Image, Plus, RefreshCw, Rocket, Save, Sparkles, Trash2, Upload } from "lucide-react";
import { ImageUploadField } from "../components/ImageUploadField";
import { CONTENT_API_BASE, uploadImageAsset } from "../content/client";
import { useAuth } from "../contexts/AuthContext";
import { defaultPlazaContent } from "../content/defaults/plaza";
import type { AdminContentEntry, PlazaContent, PlazaSoulItem, PlazaVisibility } from "../content/types";
import { cn } from "../lib/utils";
import { DateTimePicker } from "../components/DateTimePicker";

type AdminContentResponse = { entries: AdminContentEntry[] };

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

function getWeeklyImportMeta(date = new Date()) {
  const startDate = new Date(WEEKLY_IMPORT_YEAR, 0, 1);
  const currentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((currentDate.getTime() - startDate.getTime()) / 86400000);
  const week = Math.max(1, Math.floor(diffDays / 7) + 1);
  const paddedWeek = String(week).padStart(2, "0");
  const dateKey = formatDateKey(currentDate);

  return {
    year: WEEKLY_IMPORT_YEAR,
    week,
    dateKey,
    batchId: `weekly-${WEEKLY_IMPORT_YEAR}-w${paddedWeek}`,
    seriesName: WEEKLY_IMPORT_SERIES_NAME,
    seriesTag: `第${week}周杂谈`,
    weekTag: `${WEEKLY_IMPORT_YEAR}年第${week}周`,
    importDateTag: `${dateKey}导入`
  };
}

function uniqueLines(value: string) {
  return Array.from(new Set(value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)));
}

function normalizePlaza(value: unknown): PlazaContent {
  const plaza = value as Partial<PlazaContent> | null;

  return {
    souls: Array.isArray(plaza?.souls) ? plaza.souls : defaultPlazaContent.souls,
    moments: Array.isArray(plaza?.moments) ? plaza.moments : defaultPlazaContent.moments,
    groups: Array.isArray(plaza?.groups) ? plaza.groups : defaultPlazaContent.groups,
    tags: Array.isArray(plaza?.tags) ? plaza.tags : defaultPlazaContent.tags
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
  const [plaza, setPlaza] = useState<PlazaContent>(defaultPlazaContent);
  const [selectedId, setSelectedId] = useState(defaultPlazaContent.souls[0]?.id || "");
  const [status, setStatus] = useState("正在加载图库内容...");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingWeekly, setIsUploadingWeekly] = useState(false);
  const [weeklyImportText, setWeeklyImportText] = useState("");
  const [weeklyImportAuthor, setWeeklyImportAuthor] = useState("运营");
  const [weeklyImportVisibility, setWeeklyImportVisibility] = useState<PlazaVisibility>("pending");
  const weeklyMeta = useMemo(() => getWeeklyImportMeta(), []);

  const selectedSoul = plaza.souls.find((soul) => soul.id === selectedId) || plaza.souls[0];

  const stats = useMemo(() => ({
    total: plaza.souls.length,
    visible: plaza.souls.filter((soul) => soul.visibility === "visible").length,
    pending: plaza.souls.filter((soul) => soul.visibility === "pending").length,
    featured: plaza.souls.filter((soul) => soul.featured).length
  }), [plaza.souls]);

  const currentBatchCount = useMemo(() => plaza.souls.filter((soul) => soul.importBatchId === weeklyMeta.batchId).length, [plaza.souls, weeklyMeta.batchId]);

  const load = async () => {
    const res = await authFetch(`${CONTENT_API_BASE}/api/admin/content`);
    if (!res.ok) throw new Error(await readContentError(res, "加载图库失败"));

    const data = await res.json() as AdminContentResponse;
    const draft = normalizePlaza(data.entries.find((entry) => entry.key === PLAZA_KEY)?.draft);
    setPlaza(draft);
    setSelectedId(draft.souls[0]?.id || "");
    setStatus("图库内容已同步");
  };

  useEffect(() => {
    load().catch((error) => setStatus(error instanceof Error ? error.message : "内容服务未启动，请运行 npm run server:dev"));
  }, []);

  const save = async (publish = false) => {
    if (readOnly) {
      setStatus("只读模式无法保存或发布图库");
      return;
    }

    setIsSaving(true);

    try {
      const draftRes = await authFetch(`${CONTENT_API_BASE}/api/admin/content/${PLAZA_KEY}/draft`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: plaza })
      });
      if (!draftRes.ok) throw new Error(await readContentError(draftRes, "保存草稿失败"));

      if (publish) {
        const publishRes = await authFetch(`${CONTENT_API_BASE}/api/admin/content/${PLAZA_KEY}/publish`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: "Publish plaza controls" })
        });
        if (!publishRes.ok) throw new Error(await readContentError(publishRes, "发布失败"));
      }

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
        avatarSrc: "https://picsum.photos/seed/new-soul/400/520",
        bannerColor: "from-sky-500/20 to-purple-500/20",
        featured: false,
        visibility: "pending",
        desc: ""
      }]
    }));
    setSelectedId(id);
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

  const importWeeklySouls = () => {
    if (readOnly) {
      setStatus("只读模式无法批量导入图库作品");
      return;
    }

    const urls = uniqueLines(weeklyImportText);

    if (urls.length === 0) {
      setStatus("请先点击上传多图，从相册或文件管理选择图片");
      return;
    }

    const existingImageUrls = new Set(plaza.souls.map((soul) => soul.avatarSrc).filter(Boolean));
    const candidateUrls = urls.filter((url) => !existingImageUrls.has(url));
    const skippedCount = urls.length - candidateUrls.length;

    if (candidateUrls.length === 0) {
      setStatus("本次输入的图片地址均已存在，未生成新图库卡片");
      return;
    }

    const existingBatchMaxIndex = plaza.souls
      .filter((soul) => soul.importBatchId === weeklyMeta.batchId)
      .reduce((max, soul) => Math.max(max, soul.itemIndex || 0), 0);

    const createdAt = Date.now();
    const newSouls: PlazaSoulItem[] = candidateUrls.map((url, index) => {
      const itemIndex = existingBatchMaxIndex + index + 1;
      const paddedIndex = String(itemIndex).padStart(2, "0");

      return {
        id: `${weeklyMeta.batchId}-${paddedIndex}-${createdAt + index}`,
        name: `第${weeklyMeta.week}周杂谈-${paddedIndex}`,
        author: weeklyImportAuthor.trim() || "运营",
        tags: ["每周杂谈", weeklyMeta.seriesTag, weeklyMeta.weekTag, weeklyMeta.importDateTag],
        likes: 0,
        createdAt: weeklyMeta.dateKey,
        views: 0,
        activeDaysAgo: null,
        avatarSrc: url,
        bannerColor: weeklyImportGradients[index % weeklyImportGradients.length],
        featured: false,
        visibility: weeklyImportVisibility,
        desc: "",
        importBatchId: weeklyMeta.batchId,
        importYear: weeklyMeta.year,
        importWeek: weeklyMeta.week,
        importDate: weeklyMeta.dateKey,
        seriesName: weeklyMeta.seriesName,
        seriesIndex: weeklyMeta.week,
        itemIndex
      };
    });

    setPlaza((current) => ({
      ...current,
      souls: [...newSouls, ...current.souls],
      tags: Array.from(new Set([...current.tags, "每周杂谈", weeklyMeta.seriesTag, weeklyMeta.weekTag, weeklyMeta.importDateTag]))
    }));

    setSelectedId(newSouls[0].id);
    setWeeklyImportText("");
    setStatus(`已导入 ${newSouls.length} 张${weeklyMeta.seriesTag}图库卡片${skippedCount > 0 ? `，跳过 ${skippedCount} 张重复图片` : ""}。请保存草稿或发布到前台。`);
  };

  const uploadWeeklyImages = async (files?: FileList | null) => {
    if (!files?.length) return;
    if (readOnly) {
      setStatus("只读模式无法上传图库图片");
      return;
    }

    const selectedFiles = Array.from(files);
    setIsUploadingWeekly(true);
    setStatus(`正在上传 ${selectedFiles.length} 张图片...`);

    try {
      const uploadedUrls: string[] = [];
      for (const file of selectedFiles) {
        const result = await uploadImageAsset(authFetch, file, { admin: true, scope: "plaza-weekly" });
        uploadedUrls.push(result.asset.url);
      }

      setWeeklyImportText((current) => [current, ...uploadedUrls].filter(Boolean).join("\n"));
      setStatus(`已上传 ${uploadedUrls.length} 张图片，可直接导入本周图库。`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "批量上传失败");
    } finally {
      setIsUploadingWeekly(false);
    }
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

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-background p-4 shadow-sm"><div className="text-xs font-bold text-muted-foreground">图库总数</div><div className="mt-1 text-3xl font-black">{stats.total}</div></div>
        <div className="rounded-2xl border border-border bg-background p-4 shadow-sm"><div className="text-xs font-bold text-muted-foreground">前台显示</div><div className="mt-1 text-3xl font-black text-emerald-500">{stats.visible}</div></div>
        <div className="rounded-2xl border border-border bg-background p-4 shadow-sm"><div className="text-xs font-bold text-muted-foreground">待审核</div><div className="mt-1 text-3xl font-black text-amber-500">{stats.pending}</div></div>
        <div className="rounded-2xl border border-border bg-background p-4 shadow-sm"><div className="text-xs font-bold text-muted-foreground">精选</div><div className="mt-1 text-3xl font-black text-primary">{stats.featured}</div></div>
      </div>

      <div className="rounded-3xl border border-border bg-background p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-2xl">
            <h3 className="flex items-center gap-2 text-lg font-black text-foreground"><Upload className="size-5 text-primary" /> 本周批量导入</h3>
            <p className="mt-1 text-sm font-medium leading-relaxed text-muted-foreground">
              当前规则：从 2026-01-01 起算第 1 周，每 7 天递增。今天属于 {weeklyMeta.weekTag}，导入后会自动生成 {weeklyMeta.seriesTag}-01 这种标题，并添加每周杂谈标签。
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
          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-bold text-muted-foreground">导入后状态</span>
            <select value={weeklyImportVisibility} onChange={(event) => setWeeklyImportVisibility(event.target.value as PlazaVisibility)} className="h-10 rounded-xl border border-border bg-card px-3 text-sm font-bold outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/15">
              {visibilityOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label className={cn("relative inline-flex h-10 items-center justify-center gap-2 overflow-hidden rounded-xl border border-border bg-card px-4 text-sm font-black text-foreground shadow-sm transition-colors hover:bg-muted", (readOnly || isUploadingWeekly) && "pointer-events-none opacity-50")}>
            <Upload className="size-4" /> {isUploadingWeekly ? "上传中..." : "上传多图"}
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple disabled={readOnly || isUploadingWeekly} className="absolute inset-0 cursor-pointer opacity-0" onChange={(event) => { void uploadWeeklyImages(event.currentTarget.files); event.currentTarget.value = ""; }} />
          </label>
          <button disabled={readOnly || uniqueLines(weeklyImportText).length === 0} onClick={importWeeklySouls} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-black text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50">
            <Upload className="size-4" /> 导入本周图库
          </button>
          <div className="flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-3 text-xs font-bold text-muted-foreground">
            <CalendarDays className="size-4 text-primary" /> {weeklyMeta.seriesName} / 第 {weeklyMeta.week} 周
          </div>
          <div className="flex h-10 items-center rounded-xl border border-border bg-muted/20 px-3 text-xs font-bold text-muted-foreground md:col-span-3">
            待导入 {uniqueLines(weeklyImportText).length} 张图片，上传完成后点击导入本周图库生成卡片。
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[360px_1fr]">
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
                  <ImageUploadField label="图片地址" value={selectedSoul.avatarSrc || ""} onChange={(value) => updateSoul(selectedSoul.id, { avatarSrc: value })} admin readOnly={readOnly} scope="plaza-item" compact />
                  <Field label="渐变背景 class" value={selectedSoul.bannerColor} onChange={(value) => updateSoul(selectedSoul.id, { bannerColor: value })} />
                  <Field label="点赞数" type="number" value={selectedSoul.likes} onChange={(value) => updateSoul(selectedSoul.id, { likes: Number(value) })} />
                  <Field label="浏览量" type="number" value={selectedSoul.views} onChange={(value) => updateSoul(selectedSoul.id, { views: Number(value) })} />
                  <DateTimePicker label="创建日期" mode="date" value={selectedSoul.createdAt} onChange={(value) => updateSoul(selectedSoul.id, { createdAt: value })} />
                  <Field label="标签，逗号分隔" value={selectedSoul.tags.join(", ")} onChange={(value) => updateSoul(selectedSoul.id, { tags: value.split(",").map((tag) => tag.trim()).filter(Boolean) })} />
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

      <div className="rounded-2xl border border-border bg-muted/20 px-4 py-3 text-xs font-medium text-muted-foreground">{status}</div>
    </div>
  );
}
