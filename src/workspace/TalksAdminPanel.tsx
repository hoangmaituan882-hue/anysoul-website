import { useEffect, useMemo, useState } from "react";
import { Bot, Calendar, FileText, Link, Plus, RefreshCw, Rocket, Save, Sparkles, Trash2, Video, X } from "lucide-react";
import { ImageUploadField } from "../components/ImageUploadField";
import { CONTENT_API_BASE } from "../content/client";
import { defaultTalksContent } from "../content/defaults/talks";
import type { AdminContentEntry, TalkHighlightItem, TalkItem, TalkScheduleItem, TalkSidebarItem, TalkTranscriptItem, TalksContent } from "../content/types";
import { useAuth } from "../contexts/AuthContext";
import { cn } from "../lib/utils";

type AdminContentResponse = {
  entries: AdminContentEntry[];
};

type ContentBatchResponse = {
  entries: AdminContentEntry[];
};

type TalkAiSummaryResponse = {
  summary: string;
  summaryBullets: string[];
  highlights: TalkHighlightItem[];
  transcript: TalkTranscriptItem[];
  tags: string[];
};

const TALKS_KEY = "talks.main";

function textList(value: string[] | undefined) {
  return (value || []).join(", ");
}

function parseTextList(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function transcriptToText(items: TalkTranscriptItem[] = []) {
  return items.map((item) => `${item.time}|${item.speaker}|${item.text}`).join("\n");
}

function textToTranscript(value: string): TalkTranscriptItem[] {
  return value.split("\n").map((line) => {
    const [time = "", speaker = "", ...rest] = line.split("|");
    return { time: time.trim(), speaker: speaker.trim(), text: rest.join("|").trim() };
  }).filter((item) => item.time || item.speaker || item.text);
}

function highlightsToText(items: TalkHighlightItem[] = []) {
  return items.map((item) => `${item.time}|${item.desc}`).join("\n");
}

function textToHighlights(value: string): TalkHighlightItem[] {
  return value.split("\n").map((line) => {
    const [time = "", ...rest] = line.split("|");
    return { time: time.trim(), desc: rest.join("|").trim() };
  }).filter((item) => item.time || item.desc);
}

function normalizeTalks(value: unknown): TalksContent {
  const talks = value as Partial<TalksContent> | null;
  return {
    ...defaultTalksContent,
    ...(talks || {}),
    hero: { ...defaultTalksContent.hero, ...(talks?.hero || {}) },
    liveTalkId: talks?.liveTalkId || defaultTalksContent.liveTalkId,
    live: { ...defaultTalksContent.live, ...(talks?.live || {}) },
    upcoming: Array.isArray(talks?.upcoming) ? talks.upcoming : defaultTalksContent.upcoming,
    weekly: Array.isArray(talks?.weekly) ? talks.weekly : defaultTalksContent.weekly,
    archive: Array.isArray(talks?.archive) ? talks.archive : defaultTalksContent.archive,
    recentUpdates: Array.isArray(talks?.recentUpdates) ? talks.recentUpdates : defaultTalksContent.recentUpdates,
    topArticles: Array.isArray(talks?.topArticles) ? talks.topArticles : defaultTalksContent.topArticles,
    newUploads: Array.isArray(talks?.newUploads) ? talks.newUploads : defaultTalksContent.newUploads,
    topics: Array.isArray(talks?.topics) ? talks.topics : defaultTalksContent.topics
  };
}

function createBlankTalk(index: number): TalkItem {
  const today = new Date().toISOString().slice(0, 10);
  return {
    ...defaultTalksContent.archive[0],
    id: `talk-${Date.now()}`,
    episodeNo: index + 1,
    title: "新的杂谈回录像",
    subtitle: "在这里填写本期杂谈简介",
    date: today,
    time: "20:00",
    duration: "60 min",
    coverUrl: "",
    status: "archived",
    category: "talk",
    host: "Linze",
    guests: [],
    tags: ["杂谈回"],
    summary: "",
    summaryBullets: [],
    highlights: [],
    viewers: 0,
    danmaku: 0,
    likes: 0,
    sourceUrl: "",
    videoUrl: "",
    videoProvider: "bilibili",
    animeMentions: 0,
    isFeatured: false,
    isLiked: false,
    transcript: [],
    comments: [],
    mentions: []
  };
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string | number; onChange: (value: string) => void; placeholder?: string; type?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12px] font-bold text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-lg border border-border bg-card px-3 text-sm font-medium outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
      />
    </label>
  );
}

function Area({ label, value, onChange, rows = 4, placeholder }: { label: string; value: string; onChange: (value: string) => void; rows?: number; placeholder?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12px] font-bold text-muted-foreground">{label}</span>
      <textarea
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="resize-y rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium leading-relaxed outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
      />
    </label>
  );
}

function SidebarItemsEditor({ title, items, onChange }: { title: string; items: TalkSidebarItem[]; onChange: (items: TalkSidebarItem[]) => void }) {
  const update = (index: number, patch: Partial<TalkSidebarItem>) => {
    onChange(items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  };

  return (
    <div className="rounded-xl border border-border bg-background p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm">{title}</h3>
        <button
          onClick={() => onChange([...items, { id: `${title}-${Date.now()}`, title: "新条目", description: "填写说明", date: new Date().toISOString().slice(0, 10), tags: ["杂谈回"] }])}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-primary"
        >
          <Plus className="size-4" /> 添加
        </button>
      </div>
      {items.map((item, index) => (
        <div key={item.id || index} className="rounded-lg border border-border bg-card p-3 space-y-3">
          <div className="flex justify-between gap-3">
            <div className="text-xs font-bold text-muted-foreground">条目 {index + 1}</div>
            <button onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))} className="inline-flex items-center gap-1 text-xs font-bold text-red-500">
              <Trash2 className="size-3.5" /> 删除
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="标题" value={item.title} onChange={(value) => update(index, { title: value })} />
            <Field label="日期/时间" value={item.date || ""} onChange={(value) => update(index, { date: value })} />
            <Field label="链接" value={item.href || ""} onChange={(value) => update(index, { href: value })} />
            <Field label="标签，逗号分隔" value={textList(item.tags)} onChange={(value) => update(index, { tags: parseTextList(value) })} />
          </div>
          <Area label="说明" value={item.description} onChange={(value) => update(index, { description: value })} rows={2} />
        </div>
      ))}
    </div>
  );
}

export function TalksAdminPanel({ readOnly = false }: { readOnly?: boolean }) {
  const { authFetch } = useAuth();
  const [entry, setEntry] = useState<AdminContentEntry | null>(null);
  const [draft, setDraft] = useState<TalksContent>(defaultTalksContent);
  const [selectedId, setSelectedId] = useState(defaultTalksContent.archive[0]?.id || "");
  const [status, setStatus] = useState("正在加载杂谈回内容...");
  const [isSaving, setIsSaving] = useState(false);
  const [aiSource, setAiSource] = useState("");
  const [aiStatus, setAiStatus] = useState("AI 会把结果填入当前选中的录像草稿。");
  const [isAiBusy, setIsAiBusy] = useState(false);
  const [isTalkEditorOpen, setIsTalkEditorOpen] = useState(false);

  const selectedTalk = useMemo(
    () => draft.archive.find((item) => item.id === selectedId) || draft.archive[0],
    [draft.archive, selectedId]
  );
  const liveTalk = useMemo(
    () => draft.archive.find((item) => item.id === draft.liveTalkId) || draft.archive[0] || draft.live,
    [draft.archive, draft.live, draft.liveTalkId]
  );

  const load = async () => {
    const response = await authFetch(`${CONTENT_API_BASE}/api/admin/content`);
    if (!response.ok) throw new Error(`加载失败: HTTP ${response.status}`);
    const data = await response.json() as AdminContentResponse;
    const talksEntry = data.entries.find((item) => item.key === TALKS_KEY);
    const nextDraft = normalizeTalks(talksEntry?.draft);
    setEntry(talksEntry || null);
    setDraft(nextDraft);
    setSelectedId((current) => nextDraft.archive.some((item) => item.id === current) ? current : nextDraft.archive[0]?.id || "");
    setStatus("杂谈回内容已同步");
  };

  useEffect(() => {
    load().catch((error) => setStatus(error instanceof Error ? error.message : "杂谈回内容加载失败"));
  }, []);

  const publish = async (nextDraft: TalksContent, message = "Publish talks controls") => {
    if (readOnly) {
      setStatus("只读模式无法发布");
      return;
    }
    setIsSaving(true);
    try {
      const response = await authFetch(`${CONTENT_API_BASE}/api/admin/content/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operations: [{
            key: TALKS_KEY,
            payload: nextDraft,
            publish: true,
            message,
            expectedVersion: entry?.version,
            expectedUpdatedAt: entry?.updatedAt
          }]
        })
      });
      if (!response.ok) throw new Error(`发布失败: HTTP ${response.status}`);
      const data = await response.json() as ContentBatchResponse;
      const nextEntry = data.entries.find((item) => item.key === TALKS_KEY) || data.entries[0];
      setEntry(nextEntry);
      setDraft(normalizeTalks(nextEntry.draft));
      setStatus("已保存并发布到杂谈回前台");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "发布失败");
    } finally {
      setIsSaving(false);
    }
  };

  const updateDraft = (updater: (current: TalksContent) => TalksContent) => {
    setDraft((current) => updater(normalizeTalks(current)));
  };

  const updateSelectedTalk = (patch: Partial<TalkItem>) => {
    updateDraft((current) => ({
      ...current,
      archive: current.archive.map((item) => item.id === selectedTalk?.id ? { ...item, ...patch } : item)
    }));
  };

  const addArchiveTalk = () => {
    const nextTalk = createBlankTalk(draft.archive.length);
    setDraft((current) => ({ ...current, archive: [nextTalk, ...current.archive] }));
    setSelectedId(nextTalk.id);
    setIsTalkEditorOpen(true);
  };

  const deleteSelectedTalk = () => {
    if (!selectedTalk) return;
    const nextArchive = draft.archive.filter((item) => item.id !== selectedTalk.id);
    const nextDraft = { ...draft, archive: nextArchive, liveTalkId: draft.liveTalkId === selectedTalk.id ? nextArchive[0]?.id : draft.liveTalkId };
    setDraft(nextDraft);
    setSelectedId(nextArchive[0]?.id || "");
    setIsTalkEditorOpen(false);
    void publish(nextDraft, "Delete talks archive video");
  };

  const saveSelectedTalk = () => {
    const normalized = normalizeTalks(draft);
    setDraft(normalized);
    setIsTalkEditorOpen(false);
    void publish(normalized, "Save talks archive video");
  };

  const generateAiSummary = async () => {
    if (!selectedTalk) return;
    setIsAiBusy(true);
    setAiStatus("AI 正在生成摘要、高光和标签...");
    try {
      const response = await authFetch(`${CONTENT_API_BASE}/api/admin/talks/ai/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: selectedTalk.title,
          date: selectedTalk.date,
          text: aiSource || transcriptToText(selectedTalk.transcript),
          videoUrl: selectedTalk.videoUrl || selectedTalk.sourceUrl
        })
      });
      const data = await response.json().catch(() => ({})) as Partial<TalkAiSummaryResponse> & { error?: string };
      if (!response.ok) throw new Error(data.error || `AI 生成失败: HTTP ${response.status}`);
      updateSelectedTalk({
        summary: data.summary || selectedTalk.summary,
        summaryBullets: data.summaryBullets || selectedTalk.summaryBullets,
        highlights: data.highlights || selectedTalk.highlights,
        transcript: data.transcript && data.transcript.length ? data.transcript : selectedTalk.transcript,
        tags: data.tags && data.tags.length ? data.tags : selectedTalk.tags
      });
      setAiStatus("AI 已填入当前录像草稿，检查后点击保存并发布。");
    } catch (error) {
      setAiStatus(error instanceof Error ? error.message : "AI 生成失败");
    } finally {
      setIsAiBusy(false);
    }
  };

  const chooseLiveTalk = (id: string) => {
    const nextDraft = { ...draft, liveTalkId: id };
    setDraft(nextDraft);
    void publish(nextDraft, "Set live talk source");
  };

  return (
    <fieldset disabled={readOnly} className={cn("mx-auto max-w-6xl space-y-5", readOnly && "opacity-75")}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Video className="size-6 text-primary" /> 杂谈回控制
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">管理直播展示、录像归档库、本周安排、侧栏动态和 AI 摘要，保存后直接发布到前台。</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={load} type="button" className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-bold hover:bg-muted">
            <RefreshCw className="size-4" /> 刷新
          </button>
          <button onClick={() => publish(draft)} type="button" disabled={isSaving} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            <Rocket className="size-4" /> 保存并发布
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-border bg-background p-4"><div className="text-xs font-bold text-muted-foreground">录像归档</div><div className="mt-1 text-3xl font-black">{draft.archive.length}</div></div>
        <div className="rounded-xl border border-border bg-background p-4"><div className="text-xs font-bold text-muted-foreground">近期计划</div><div className="mt-1 text-3xl font-black">{draft.upcoming.length}</div></div>
        <div className="rounded-xl border border-border bg-background p-4"><div className="text-xs font-bold text-muted-foreground">本周安排</div><div className="mt-1 text-3xl font-black">{draft.weekly.length}</div></div>
        <div className="rounded-xl border border-border bg-background p-4"><div className="text-xs font-bold text-muted-foreground">话题入口</div><div className="mt-1 text-3xl font-black">{draft.topics.length}</div></div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-background p-4 space-y-3">
            <h3 className="font-bold flex items-center gap-2"><Sparkles className="size-4 text-primary" /> 页面标题</h3>
            <Field label="标题" value={draft.hero.title} onChange={(value) => updateDraft((current) => ({ ...current, hero: { ...current.hero, title: value } }))} />
            <Area label="副标题" value={draft.hero.subtitle} onChange={(value) => updateDraft((current) => ({ ...current, hero: { ...current.hero, subtitle: value } }))} rows={3} />
          </div>

          <div className="rounded-xl border border-border bg-background p-4 space-y-3">
            <h3 className="font-bold flex items-center gap-2"><Video className="size-4 text-red-500" /> 当前直播中/推荐展示</h3>
            <p className="text-xs font-medium leading-relaxed text-muted-foreground">直播中卡片从录像库读取标题、封面、摘要和数据；不再单独维护一套表单。</p>
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-bold text-muted-foreground">选择录像</span>
              <select
                value={draft.liveTalkId || ""}
                onChange={(event) => chooseLiveTalk(event.target.value)}
                className="h-10 rounded-lg border border-border bg-card px-3 text-sm font-medium outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
              >
                {draft.archive.map((talk) => <option key={talk.id} value={talk.id}>{talk.episodeNo ? `第${talk.episodeNo}期 · ` : ""}{talk.title}</option>)}
              </select>
            </label>
            {liveTalk && (
              <button
                type="button"
                onClick={() => { setSelectedId(liveTalk.id); setIsTalkEditorOpen(true); }}
                className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-left transition-colors hover:bg-muted"
              >
                <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {liveTalk.coverUrl ? <img src={liveTalk.coverUrl} alt={liveTalk.title} className="h-full w-full object-cover" /> : null}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-black">{liveTalk.title}</div>
                  <div className="mt-1 text-xs font-bold text-muted-foreground">{liveTalk.date} · {liveTalk.duration}</div>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{liveTalk.subtitle || liveTalk.summary}</p>
                </div>
              </button>
            )}
          </div>

          <div className="rounded-xl border border-border bg-background p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2"><Calendar className="size-4 text-pink-500" /> 本周安排</h3>
              <button onClick={() => updateDraft((current) => ({ ...current, weekly: [...current.weekly, { id: `week-${Date.now()}`, date: "周日", time: "20:00", title: "新安排", topic: "填写安排内容", tags: ["杂谈回"] }] }))} className="text-xs font-bold text-primary inline-flex items-center gap-1"><Plus className="size-4" /> 添加</button>
            </div>
            {draft.weekly.map((item, index) => (
              <div key={item.id || index} className="rounded-lg border border-border bg-card p-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Field label="日期" value={item.date} onChange={(value) => updateDraft((current) => ({ ...current, weekly: current.weekly.map((week, i) => i === index ? { ...week, date: value } : week) }))} />
                  <Field label="时间" value={item.time} onChange={(value) => updateDraft((current) => ({ ...current, weekly: current.weekly.map((week, i) => i === index ? { ...week, time: value } : week) }))} />
                </div>
                <Field label="标题" value={item.title} onChange={(value) => updateDraft((current) => ({ ...current, weekly: current.weekly.map((week, i) => i === index ? { ...week, title: value } : week) }))} />
                <Area label="说明" value={item.topic} onChange={(value) => updateDraft((current) => ({ ...current, weekly: current.weekly.map((week, i) => i === index ? { ...week, topic: value } : week) }))} rows={2} />
              </div>
            ))}
          </div>
        </div>

        <div className="xl:col-span-2 space-y-5">
          <div className="rounded-xl border border-border bg-background p-4 space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="font-bold flex items-center gap-2"><FileText className="size-4 text-blue-500" /> 杂谈会录像库</h3>
                <p className="mt-1 text-xs text-muted-foreground">点击封面卡片进入二级编辑弹窗，封面上传只在弹窗内出现。</p>
              </div>
              <button onClick={addArchiveTalk} disabled={isSaving} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-bold hover:bg-muted disabled:opacity-50">
                <Plus className="size-4" /> 新增录像
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
              {draft.archive.map((talk) => (
                <button
                  key={talk.id}
                  onClick={() => { setSelectedId(talk.id); setIsTalkEditorOpen(true); }}
                  className={cn("group overflow-hidden rounded-2xl border bg-card text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md", draft.liveTalkId === talk.id ? "border-primary/50 ring-2 ring-primary/15" : "border-border")}
                >
                  <div className="relative aspect-[4/3] bg-muted">
                    {talk.coverUrl ? <img src={talk.coverUrl} alt={talk.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-xs font-black text-muted-foreground">暂无封面</div>}
                    <div className="absolute left-2 top-2 rounded-full bg-background/90 px-2 py-1 text-[10px] font-black text-foreground shadow-sm">{talk.episodeNo ? `第${talk.episodeNo}期` : "录像"}</div>
                    {draft.liveTalkId === talk.id && <div className="absolute right-2 top-2 rounded-full bg-primary px-2 py-1 text-[10px] font-black text-primary-foreground">展示中</div>}
                  </div>
                  <div className="space-y-2 p-3">
                    <div className="line-clamp-2 text-sm font-black text-foreground">{talk.title}</div>
                    <div className="text-[11px] font-bold text-muted-foreground">{talk.date} · {talk.category || "talk"}</div>
                    <div className="flex flex-wrap gap-1">
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">{talk.viewers || 0} 看</span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">{talk.danmaku || 0} 弹幕</span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">{talk.highlights?.length || 0} 高光</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <SidebarItemsEditor title="近期动态" items={draft.recentUpdates} onChange={(items) => updateDraft((current) => ({ ...current, recentUpdates: items, topics: items }))} />
          <SidebarItemsEditor title="热门文章" items={draft.topArticles} onChange={(items) => updateDraft((current) => ({ ...current, topArticles: items }))} />
          <SidebarItemsEditor title="新上传文件" items={draft.newUploads} onChange={(items) => updateDraft((current) => ({ ...current, newUploads: items }))} />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-muted/20 px-4 py-3 text-xs text-muted-foreground flex items-center gap-2">
        <Link className="size-4" /> {status}
      </div>

      {selectedTalk && isTalkEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-3xl border border-border bg-background shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-background/95 px-5 py-4 backdrop-blur">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.2em] text-primary">Talk Video</div>
                <h3 className="mt-1 text-xl font-black text-foreground">{selectedTalk.title || "编辑杂谈录像"}</h3>
              </div>
              <button onClick={() => setIsTalkEditorOpen(false)} className="inline-flex size-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <X className="size-4" />
              </button>
            </div>

            <div className="grid gap-5 p-5 lg:grid-cols-[260px_1fr]">
              <div className="space-y-3">
                <div className="overflow-hidden rounded-2xl border border-border bg-muted">
                  {selectedTalk.coverUrl ? <img src={selectedTalk.coverUrl} alt={selectedTalk.title} className="aspect-[4/3] w-full object-cover" /> : <div className="flex aspect-[4/3] items-center justify-center px-4 text-center text-sm font-black text-muted-foreground">暂无封面</div>}
                </div>
                <ImageUploadField label="封面" value={selectedTalk.coverUrl || ""} onChange={(value) => updateSelectedTalk({ coverUrl: value })} admin readOnly={readOnly} scope="talk-cover" compact />
                <button type="button" onClick={() => updateDraft((current) => ({ ...current, liveTalkId: selectedTalk.id }))} className={cn("w-full rounded-xl border px-3 py-2 text-sm font-black transition-colors", draft.liveTalkId === selectedTalk.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted")}>
                  {draft.liveTalkId === selectedTalk.id ? "当前直播展示" : "设为直播展示"}
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <Field label="标题" value={selectedTalk.title} onChange={(value) => updateSelectedTalk({ title: value })} />
                  <Field label="期数" type="number" value={selectedTalk.episodeNo || 0} onChange={(value) => updateSelectedTalk({ episodeNo: Number(value) || undefined })} />
                  <Field label="分类" value={selectedTalk.category || "talk"} onChange={(value) => updateSelectedTalk({ category: value as TalkItem["category"] })} />
                  <Field label="日期" value={selectedTalk.date} onChange={(value) => updateSelectedTalk({ date: value })} />
                  <Field label="时间" value={selectedTalk.time} onChange={(value) => updateSelectedTalk({ time: value })} />
                  <Field label="时长" value={selectedTalk.duration} onChange={(value) => updateSelectedTalk({ duration: value })} />
                  <Field label="观看数" type="number" value={selectedTalk.viewers} onChange={(value) => updateSelectedTalk({ viewers: Number(value) || 0 })} />
                  <Field label="弹幕数" type="number" value={selectedTalk.danmaku} onChange={(value) => updateSelectedTalk({ danmaku: Number(value) || 0 })} />
                  <Field label="点赞数" type="number" value={selectedTalk.likes} onChange={(value) => updateSelectedTalk({ likes: Number(value) || 0 })} />
                </div>
                <Field label="录像外链" value={selectedTalk.videoUrl || selectedTalk.sourceUrl || ""} onChange={(value) => updateSelectedTalk({ videoUrl: value, sourceUrl: value })} />
                <Field label="标签，逗号分隔" value={textList(selectedTalk.tags)} onChange={(value) => updateSelectedTalk({ tags: parseTextList(value) })} />
                <Area label="副标题" value={selectedTalk.subtitle} onChange={(value) => updateSelectedTalk({ subtitle: value })} rows={2} />
                <Area label="AI 摘要/直播概要" value={selectedTalk.summary} onChange={(value) => updateSelectedTalk({ summary: value })} rows={4} />
                <Area label="摘要要点，每行一条" value={(selectedTalk.summaryBullets || []).join("\n")} onChange={(value) => updateSelectedTalk({ summaryBullets: value.split("\n").map((item) => item.trim()).filter(Boolean) })} rows={4} />
                <Area label="时间轴高光，每行 time|desc" value={highlightsToText(selectedTalk.highlights)} onChange={(value) => updateSelectedTalk({ highlights: textToHighlights(value) })} rows={4} />
                <Area label="逐字稿，每行 time|speaker|text" value={transcriptToText(selectedTalk.transcript)} onChange={(value) => updateSelectedTalk({ transcript: textToTranscript(value) })} rows={6} />
                <Area label="精选评论，每行一条" value={(selectedTalk.comments || []).map((comment) => comment.content).join("\n")} onChange={(value) => updateSelectedTalk({ comments: value.split("\n").map((content, index) => ({ author: "观众", content: content.trim(), time: String(index + 1) })).filter((item) => item.content) })} rows={4} />
                <Field label="提及作品/话题，逗号分隔" value={selectedTalk.mentions.map((item) => item.title).join(", ")} onChange={(value) => updateSelectedTalk({ mentions: parseTextList(value).map((title) => ({ title, type: "话题", tags: [], summary: "" })) })} />

                <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-bold flex items-center gap-2"><Bot className="size-4 text-primary" /> AI 辅助生成</div>
                      <p className="mt-1 text-xs text-muted-foreground">粘贴原始逐字稿、录像说明或大段笔记，AI 会生成摘要、高光、标签和逐字稿草稿。</p>
                    </div>
                    <button onClick={generateAiSummary} disabled={isAiBusy} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-foreground px-3 py-2 text-xs font-bold text-background disabled:opacity-50">
                      <Sparkles className="size-4" /> 生成
                    </button>
                  </div>
                  <Area label="AI 输入文本" value={aiSource} onChange={setAiSource} rows={5} placeholder="粘贴直播记录、逐字稿或录像说明..." />
                  <div className="text-xs font-bold text-muted-foreground">{aiStatus}</div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 flex flex-wrap justify-end gap-2 border-t border-border bg-background/95 px-5 py-4 backdrop-blur">
              <button onClick={() => setIsTalkEditorOpen(false)} className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-bold hover:bg-muted">取消</button>
              <button onClick={deleteSelectedTalk} disabled={isSaving || readOnly} className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-500/15 disabled:opacity-50">
                <Trash2 className="size-4" /> 删除并发布
              </button>
              <button onClick={saveSelectedTalk} disabled={isSaving || readOnly} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                <Save className="size-4" /> 保存并发布
              </button>
            </div>
          </div>
        </div>
      )}
    </fieldset>
  );
}
