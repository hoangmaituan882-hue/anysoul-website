import Gamepad2 from "../components/icons/gamepad-icon";
import Plus from "../components/icons/alarm-clock-plus-icon";
import RefreshCw from "../components/icons/refresh-icon";
import Rocket from "../components/icons/rocket-icon";
import Search from "../components/icons/magnifier-icon";
import Trash2 from "../components/icons/trash-icon";
import Upload from "../components/icons/upload-icon";
import X from "../components/icons/x-icon";
import { useEffect, useMemo, useRef, useState } from "react";

import { CONTENT_API_BASE, importGamingRecordingsJson } from "../content/client";
import { useAuth } from "../contexts/AuthContext";
import { defaultGamingMain } from "../content/defaults/gaming";
import type { AdminContentEntry, GamingLibraryItem, GamingMainContent, GamingRecordingItem } from "../content/types";
import { DateTimePicker } from "../components/DateTimePicker";
import { ImageUploadField } from "../components/ImageUploadField";
import { cn } from "../lib/utils";

type AdminContentResponse = {
  entries: AdminContentEntry[];
};
type ContentEntryMeta = Pick<AdminContentEntry, "version" | "updatedAt">;

function Field({ label, value, onChange, type = "text", placeholder }: { label: string; value: string | number; onChange: (value: string) => void; type?: string; placeholder?: string }) {
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

function Area({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange: (value: string) => void; rows?: number }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12px] font-bold text-muted-foreground">{label}</span>
      <textarea value={value} rows={rows} onChange={(event) => onChange(event.target.value)} className="resize-none rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15" />
    </label>
  );
}

async function readAdminError(response: Response, fallback: string) {
  try {
    const data = await response.json() as { error?: string };
    return data.error ? `${fallback}: ${response.status} ${data.error}` : `${fallback}: HTTP ${response.status}`;
  } catch {
    return `${fallback}: HTTP ${response.status}`;
  }
}

function normalizeGamingDraft(value?: GamingMainContent): GamingMainContent {
  const source = value || defaultGamingMain;
  const library = source.library?.length ? source.library : defaultGamingMain.library || [];
  return {
    ...defaultGamingMain,
    ...source,
    library,
    exploreItems: source.exploreItems?.length ? source.exploreItems : defaultGamingMain.exploreItems || [],
    currentGameId: source.currentGameId || library[0]?.id,
    streamGameId: source.streamGameId || source.currentGameId || library[0]?.id
  };
}

function getGameStatusLabel(status?: GamingLibraryItem["status"]) {
  const labels: Record<NonNullable<GamingLibraryItem["status"]>, string> = {
    playing: "正在记录",
    planned: "待玩",
    finished: "已通关",
    paused: "暂停",
    archived: "已归档"
  };
  return status ? labels[status] || status : "待记录";
}

function newGame(): GamingLibraryItem {
  const id = `game-${Date.now()}`;
  return {
    id,
    title: "新游戏",
    subtitle: "待补充",
    platform: "PC",
    genre: "游戏",
    mode: "单人",
    status: "planned",
    tags: ["待整理"],
    coverUrl: "",
    rating: "",
    totalHours: "",
    lastPlayedAt: "",
    streamUrl: "",
    videoUrl: "",
    description: "补充游戏简介。",
    review: "",
    playRecords: []
  };
}

function toTextList(items?: string[]) {
  return (items || []).join(", ");
}

function parseTextList(value: string) {
  return value.split(/[,，\n]/).map((item) => item.trim()).filter(Boolean);
}

function parseCount(value: unknown) {
  const text = String(value || "").trim();
  if (!text) return 0;
  const number = Number(text.replace(/[^\d.]/g, ""));
  if (!Number.isFinite(number)) return 0;
  if (text.includes("万")) return Math.round(number * 10000);
  return Math.round(number);
}

function durationToSeconds(value: unknown) {
  const text = String(value || "").trim();
  if (!text) return 0;
  const parts = text.split(":").map((part) => Number(part));
  if (parts.length === 3 && parts.every(Number.isFinite)) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2 && parts.every(Number.isFinite)) return parts[0] * 60 + parts[1];
  const hour = text.match(/(\d+(?:\.\d+)?)\s*(?:h|小时|時|时)/i);
  const minute = text.match(/(\d+(?:\.\d+)?)\s*(?:m|分钟|分)/i);
  if (hour || minute) return Number(hour?.[1] || 0) * 3600 + Number(minute?.[1] || 0) * 60;
  const number = text.match(/\d+(?:\.\d+)?/);
  return number ? Number(number[0]) * 3600 : 0;
}

function formatTotalHours(seconds: number) {
  if (!seconds) return "0h";
  const hours = seconds / 3600;
  const rounded = hours >= 10 ? Math.round(hours) : Math.round(hours * 10) / 10;
  return `${rounded}h`;
}

function recordingBelongsToGame(recording: GamingRecordingItem, game: GamingLibraryItem) {
  return recording.gameId === game.id || recording.gameTitle === game.title;
}

function cleanRecordingTitle(title: string, fragments: string[]) {
  let next = title;
  fragments.forEach((fragment) => {
    if (!fragment) return;
    next = next.split(fragment).join("");
  });
  return next
    .replace(/\s+/g, " ")
    .replace(/[|｜·・]{2,}/g, "·")
    .replace(/^[\s|｜·・:：,，、-]+|[\s|｜·・:：,，、-]+$/g, "")
    .trim();
}

function extractBvid(value: unknown) {
  const text = String(value || "");
  const match = text.match(/BV[a-zA-Z0-9]+/);
  return match?.[0] || "";
}

function parseImportJson(value: string): Record<string, unknown>[] {
  const cleaned = value.trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  if (!cleaned) return [];
  try {
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    const wrapped = `[${cleaned.replace(/,\s*$/, "")}]`;
    const parsed = JSON.parse(wrapped);
    return Array.isArray(parsed) ? parsed : [parsed];
  }
}

function importedRecordingToItem(source: Record<string, unknown>, game: GamingLibraryItem, index: number): GamingRecordingItem {
  const title = String(source["标题"] || source.title || `${game.title} 录像`).trim();
  const bvid = String(source["BV号"] || source.bvid || extractBvid(source["链接"] || source.link)).trim();
  const link = String(source["链接"] || source.link || (bvid ? `https://www.bilibili.com/video/${bvid}` : "")).trim();
  const host = String(source["UP主"] || source.host || "录播组").trim();
  const duration = String(source["时长"] || source.duration || "").trim();
  const date = String(source["收藏时间"] || source.date || "").trim();
  const idSeed = bvid || `${Date.now()}-${index}`;

  return {
    id: `recording-${game.id}-${idSeed}`,
    title,
    gameId: game.id,
    gameTitle: game.title,
    date,
    duration,
    coverUrl: game.coverUrl || game.heroImage || "",
    host,
    videoUrl: link,
    sourceUrl: link,
    videoProvider: link.includes("bilibili.com") || bvid ? "bilibili" : "web",
    tags: Array.from(new Set([game.title, game.genre, ...(game.tags || []), "录播"].filter(Boolean))),
    summary: bvid ? `${host} / ${bvid}` : host,
    highlights: [bvid, host, duration].filter(Boolean),
    chapters: [{ time: "00:00", title: "录播开始", description: title }],
    viewers: parseCount(source["播放量"] || source.viewers),
    danmaku: parseCount(source["弹幕数"] || source.danmaku),
    isFeatured: false
  };
}

function summarizeGameFromRecordings(game: GamingLibraryItem, recordings: GamingRecordingItem[]): GamingLibraryItem {
  const gameRecordings = recordings.filter((recording) => recordingBelongsToGame(recording, game));
  if (!gameRecordings.length) {
    return {
      ...game,
      recordingCount: 0,
      totalViewers: 0,
      totalDanmaku: 0
    };
  }
  const totalSeconds = gameRecordings.reduce((sum, recording) => sum + durationToSeconds(recording.duration), 0);
  const sortedByDate = [...gameRecordings].sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
  const latestDate = sortedByDate.find((recording) => recording.date)?.date || game.lastPlayedAt;
  return {
    ...game,
    totalHours: formatTotalHours(totalSeconds),
    lastPlayedAt: latestDate,
    recordingCount: gameRecordings.length,
    totalViewers: gameRecordings.reduce((sum, recording) => sum + Number(recording.viewers || 0), 0),
    totalDanmaku: gameRecordings.reduce((sum, recording) => sum + Number(recording.danmaku || 0), 0),
    playRecords: sortedByDate.map((recording) => ({
      date: recording.date || "",
      durationHours: Math.round((durationToSeconds(recording.duration) / 3600) * 100) / 100,
      note: recording.title,
      href: recording.videoUrl || recording.sourceUrl
    })).filter((record) => record.date || record.note)
  };
}

function syncGameRecordingStats(draft: GamingMainContent): GamingMainContent {
  const recordings = draft.recordings || [];
  const library = (draft.library || []).map((game) => summarizeGameFromRecordings(game, recordings));
  return {
    ...draft,
    recordings,
    library
  };
}

function normalizeForPublish(draft: GamingMainContent): GamingMainContent {
  const syncedDraft = syncGameRecordingStats(draft);
  const library = syncedDraft.library || [];
  const recordings = syncedDraft.recordings || [];
  const categories = (draft.categories || []).filter((category) => category.title || category.subtitle || category.img);
  return {
    ...syncedDraft,
    recordings,
    library,
    categories,
    currentGameTitle: library.find((game) => game.id === draft.currentGameId)?.title || draft.currentGameTitle,
    streamTitle: library.find((game) => game.id === draft.streamGameId)?.title || draft.streamTitle,
    streamImage: library.find((game) => game.id === draft.streamGameId)?.coverUrl || draft.streamImage,
    heroGames: library.slice(0, 3).map((game) => ({
      title: `${game.subtitle || game.genre}\n${game.title}`,
      date: `${game.status === "playing" ? "正在游玩" : "最近游玩"} ${game.lastPlayedAt || "待记录"}`,
      img: game.heroImage || game.coverUrl
    })),
    recentGames: library.map((game, index) => ({
      title: game.title,
      tag1: { text: game.genre || "GAME", bg: ["bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400", "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400", "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400"][index % 3] },
      tag2: game.status === "playing" ? { text: "进行中", bg: "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400" } : undefined,
      barColor: ["bg-green-500", "bg-blue-500", "bg-amber-500", "bg-purple-500"][index % 4],
      time: game.lastPlayedAt || "待记录",
      desc: game.mode || game.platform,
      img: game.coverUrl,
      rating: game.rating,
      review: game.review || game.description
    }))
  };
}

export function GamingAdminPanel({ readOnly = false }: { readOnly?: boolean }) {
  const { authFetch } = useAuth();
  const [draft, setDraft] = useState<GamingMainContent>(normalizeGamingDraft(defaultGamingMain));
  const [status, setStatus] = useState("正在加载游戏回内容...");
  const [isSaving, setIsSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [streamSearch, setStreamSearch] = useState("");
  const [recordingGameId, setRecordingGameId] = useState<string>("");
  const [recordingQuery, setRecordingQuery] = useState("");
  const [recordingImportJson, setRecordingImportJson] = useState("");
  const [selectedRecordingIds, setSelectedRecordingIds] = useState<string[]>([]);
  const [titleCleanupText, setTitleCleanupText] = useState("");
  const [entryMeta, setEntryMeta] = useState<ContentEntryMeta | null>(null);

  const library = draft.library || [];
  const recordings = draft.recordings || [];
  const selectedGame = library.find((game) => game.id === selectedGameId) || null;
  const streamGame = library.find((game) => game.id === draft.streamGameId) || library[0];
  const recordingGame = library.find((game) => game.id === recordingGameId) || library[0];
  const filteredLibrary = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return library;
    return library.filter((game) => [game.title, game.subtitle, game.platform, game.genre, game.mode, ...game.tags].filter(Boolean).join(" ").toLowerCase().includes(keyword));
  }, [library, query]);
  const streamResults = useMemo(() => {
    const keyword = streamSearch.trim().toLowerCase();
    return library
      .filter((game) => !keyword || [game.title, game.platform, game.genre, ...game.tags].join(" ").toLowerCase().includes(keyword))
      .slice(0, keyword ? 10 : 6);
  }, [library, streamSearch]);
  const filteredRecordings = useMemo(() => {
    const keyword = recordingQuery.trim().toLowerCase();
    return recordings.filter((recording) => {
      const matchesGame = !recordingGame?.id || recording.gameId === recordingGame.id || recording.gameTitle === recordingGame.title || (recording.tags || []).includes(recordingGame.title);
      const haystack = [recording.title, recording.gameTitle, recording.host, recording.date, recording.duration, ...(recording.tags || [])].filter(Boolean).join(" ").toLowerCase();
      return matchesGame && (!keyword || haystack.includes(keyword));
    });
  }, [recordingGame, recordingQuery, recordings]);
  const recordingStatsPreview = useMemo(() => {
    const totalSeconds = recordings.reduce((sum, recording) => sum + durationToSeconds(recording.duration), 0);
    const totalViewers = recordings.reduce((sum, recording) => sum + Number(recording.viewers || 0), 0);
    const totalDanmaku = recordings.reduce((sum, recording) => sum + Number(recording.danmaku || 0), 0);
    return { count: recordings.length, totalHours: formatTotalHours(totalSeconds), totalViewers, totalDanmaku };
  }, [recordings]);
  const filteredRecordingIds = useMemo(() => filteredRecordings.map((recording) => recording.id), [filteredRecordings]);
  const selectedFilteredCount = selectedRecordingIds.filter((id) => filteredRecordingIds.includes(id)).length;

  const load = async () => {
    const response = await authFetch(`${CONTENT_API_BASE}/api/admin/content`);
    if (!response.ok) throw new Error(await readAdminError(response, "游戏回内容加载失败"));
    const data = await response.json() as AdminContentResponse;
    const entry = data.entries.find((item) => item.key === "gaming.main");
    setDraft(normalizeGamingDraft((entry?.draft as GamingMainContent | undefined) || defaultGamingMain));
    setEntryMeta(entry ? { version: entry.version, updatedAt: entry.updatedAt } : null);
    setStatus("游戏回内容已同步");
  };

  useEffect(() => {
    load().catch((error) => setStatus(error instanceof TypeError ? "内容服务未启动，请运行 npm run server:dev" : error instanceof Error ? error.message : "游戏回内容加载失败"));
  }, []);

  useEffect(() => {
    if (!recordingGameId && library[0]?.id) setRecordingGameId(library[0].id);
  }, [library, recordingGameId]);

  const publish = async (nextDraft = draft, successMessage = "已保存并发布，游戏回页面会自动同步更新") => {
    if (readOnly) return;
    setIsSaving(true);
    try {
      const payload = normalizeForPublish(nextDraft);
      const response = await authFetch(`${CONTENT_API_BASE}/api/admin/content/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operations: [{
            key: "gaming.main",
            payload,
            publish: true,
            message: "Publish gaming page controls",
            expectedVersion: entryMeta?.version,
            expectedUpdatedAt: entryMeta?.updatedAt
          }]
        })
      });
      if (!response.ok) throw new Error(await readAdminError(response, "游戏回发布失败"));
      const data = await response.json() as { entries?: AdminContentEntry[] };
      const entry = data.entries?.find((item) => item.key === "gaming.main");
      if (entry) setEntryMeta({ version: entry.version, updatedAt: entry.updatedAt });
      setDraft(normalizeGamingDraft(payload));
      setStatus(successMessage);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "发布失败，请检查内容服务");
    } finally {
      setIsSaving(false);
    }
  };

  const syncRecordingStatsAndPublish = () => {
    const nextDraft = syncGameRecordingStats(draft);
    setDraft(nextDraft);
    void publish(nextDraft, "已根据录像库更新游戏统计并发布");
  };

  const updateGame = (id: string, patch: Partial<GamingLibraryItem>) => {
    setDraft((current) => ({
      ...current,
      library: (current.library || []).map((game) => game.id === id ? { ...game, ...patch } : game)
    }));
  };

  const addGame = () => {
    const game = newGame();
    setDraft((current) => ({ ...current, library: [game, ...(current.library || [])], currentGameId: current.currentGameId || game.id, streamGameId: current.streamGameId || game.id }));
    setSelectedGameId(game.id);
  };

  const deleteGame = (id: string) => {
    const nextLibrary = library.filter((game) => game.id !== id);
    const nextDraft = {
      ...draft,
      library: nextLibrary,
      currentGameId: draft.currentGameId === id ? nextLibrary[0]?.id : draft.currentGameId,
      streamGameId: draft.streamGameId === id ? nextLibrary[0]?.id : draft.streamGameId,
      exploreItems: (draft.exploreItems || []).filter((item) => item.gameId !== id),
      recordings: (draft.recordings || []).filter((item) => item.gameId !== id)
    };
    setDraft(nextDraft);
    setSelectedGameId(null);
    if (recordingGameId === id) setRecordingGameId(nextLibrary[0]?.id || "");
  };

  const addRecording = (game = recordingGame) => {
    if (!game) return;
    const recording: GamingRecordingItem = {
      id: `recording-${game.id}-${Date.now()}`,
      title: `${game.title} 新录像`,
      gameId: game.id,
      gameTitle: game.title,
      date: "",
      duration: "",
      coverUrl: game.coverUrl || game.heroImage || "",
      host: "AnySoul",
      videoUrl: "",
      sourceUrl: "",
      videoProvider: "bilibili",
      tags: Array.from(new Set([game.title, game.genre, ...(game.tags || []), "录播"].filter(Boolean))),
      summary: "",
      highlights: [],
      chapters: [{ time: "00:00", title: "录播开始", description: "" }],
      viewers: 0,
      danmaku: 0,
      isFeatured: false
    };
    setDraft((current) => ({ ...current, recordings: [recording, ...(current.recordings || [])] }));
    setStatus("已添加录像，点击一键更新并发布统计或保存并发布后同步到游戏库");
  };

  const updateRecording = (id: string, patch: Partial<GamingRecordingItem>) => {
    setDraft((current) => ({
      ...current,
      recordings: (current.recordings || []).map((recording) => recording.id === id ? { ...recording, ...patch } : recording)
    }));
  };

  const deleteRecording = (id: string) => {
    setDraft((current) => ({ ...current, recordings: (current.recordings || []).filter((recording) => recording.id !== id) }));
    setSelectedRecordingIds((current) => current.filter((item) => item !== id));
    setStatus("已删除录像，点击一键更新并发布统计或保存并发布后刷新游戏库统计");
  };

  const toggleRecordingSelection = (id: string) => {
    setSelectedRecordingIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const selectFilteredRecordings = () => {
    setSelectedRecordingIds((current) => Array.from(new Set([...current, ...filteredRecordingIds])));
  };

  const clearRecordingSelection = () => {
    setSelectedRecordingIds([]);
  };

  const deleteSelectedRecordings = () => {
    const selected = new Set(selectedRecordingIds);
    const deletable = new Set(filteredRecordingIds.filter((id) => selected.has(id)));
    if (!deletable.size) {
      setStatus("请先选择要删除的录像");
      return;
    }
    setDraft((current) => ({ ...current, recordings: (current.recordings || []).filter((recording) => !deletable.has(recording.id)) }));
    setSelectedRecordingIds((current) => current.filter((id) => !deletable.has(id)));
    setStatus(`已删除 ${deletable.size} 条当前筛选范围内的录像，点击一键更新并发布统计或保存并发布后刷新游戏库统计`);
  };

  const cleanupCurrentGameTitles = () => {
    if (!recordingGame) {
      setStatus("请先选择要清洗标题的游戏");
      return;
    }
    const fragments = parseTextList(titleCleanupText);
    if (!fragments.length) {
      setStatus("请输入要清洗的重复字段");
      return;
    }
    let changed = 0;
    setDraft((current) => ({
      ...current,
      recordings: (current.recordings || []).map((recording) => {
        if (!recordingBelongsToGame(recording, recordingGame)) return recording;
        const title = cleanRecordingTitle(recording.title, fragments);
        if (title === recording.title) return recording;
        changed += 1;
        return { ...recording, title };
      })
    }));
    setStatus(`已清洗 ${changed} 条 ${recordingGame.title} 录像标题，点击一键更新并发布统计或保存并发布后同步到游戏库`);
  };

  const importRecordings = () => {
    if (!recordingGame) {
      setStatus("请先在游戏录像库选择一个游戏标签");
      return;
    }
    try {
      const imported = parseImportJson(recordingImportJson).map((item, index) => importedRecordingToItem(item, recordingGame, index));
      if (!imported.length) {
        setStatus("没有可导入的录像 JSON");
        return;
      }
      setDraft((current) => {
        const existingIds = new Set((current.recordings || []).map((item) => item.id));
        const uniqueImported = imported.filter((item) => !existingIds.has(item.id));
        return { ...current, recordings: [...uniqueImported, ...(current.recordings || [])] };
      });
      setRecordingImportJson("");
      setStatus(`已导入 ${imported.length} 条 ${recordingGame.title} 录像，点击一键更新并发布统计或保存并发布后同步到游戏库`);
    } catch (error) {
      setStatus(error instanceof Error ? `录像 JSON 导入失败：${error.message}` : "录像 JSON 导入失败");
    }
  };

  const gamingImportFileRef = useRef<HTMLInputElement | null>(null);
  const [isGamingImporting, setIsGamingImporting] = useState(false);

  const handleGamingFileImport = async (files?: FileList | null) => {
    const file = files?.[0];
    if (!file || readOnly) return;
    setIsGamingImporting(true);
    setStatus("正在导入游戏录像文件...");
    try {
      const result = await importGamingRecordingsJson(authFetch, file);
      setStatus(`导入完成：${result.imported} 新增, ${result.skipped} 跳过, ${result.gamesCreated} 个游戏自动创建, 共 ${result.total} 条`);
      await load();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "录像文件导入失败");
    } finally {
      setIsGamingImporting(false);
      if (gamingImportFileRef.current) gamingImportFileRef.current.value = "";
    }
  };

  const chooseStreamGame = (id: string) => {
    const game = library.find((item) => item.id === id);
    if (!game) return;
    const nextDraft = { ...draft, streamGameId: id, currentGameId: draft.currentGameId || id, streamTitle: game.title, streamImage: game.coverUrl };
    setDraft(nextDraft);
    void publish(nextDraft);
  };

  const addCategory = () => {
    const game = library[0];
    setDraft((current) => ({
      ...current,
      categories: [...(current.categories || []), { title: game?.genre || "新分类", subtitle: game?.platform || "待补充", img: game?.coverUrl || "" }]
    }));
  };

  const updateCategory = (index: number, patch: Partial<NonNullable<GamingMainContent["categories"]>[number]>) => {
    setDraft((current) => ({
      ...current,
      categories: (current.categories || []).map((category, categoryIndex) => categoryIndex === index ? { ...category, ...patch } : category)
    }));
  };

  const moveCategory = (index: number, direction: -1 | 1) => {
    setDraft((current) => {
      const categories = [...(current.categories || [])];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= categories.length) return current;
      [categories[index], categories[targetIndex]] = [categories[targetIndex], categories[index]];
      return { ...current, categories };
    });
  };

  const deleteCategory = (index: number) => {
    setDraft((current) => ({ ...current, categories: (current.categories || []).filter((_, categoryIndex) => categoryIndex !== index) }));
  };

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight"><Gamepad2 className="size-6 text-primary" /> 游戏回控制</h2>
          <p className="mt-1 text-sm text-muted-foreground">维护游戏库、当前直播、分类和探索卡片，保存后直接发布到游戏回页面。</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={load} className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-bold hover:bg-muted"><RefreshCw className="size-4" /> 刷新</button>
          <button onClick={() => void publish()} disabled={isSaving || readOnly} className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"><Rocket className="size-4" /> 保存并发布</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-1">
          <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
            <h3 className="font-bold">当前直播 / 正在玩</h3>
            {streamGame ? (
              <button onClick={() => setSelectedGameId(streamGame.id)} className="mt-3 flex w-full gap-3 rounded-xl border border-border bg-card p-2 text-left hover:bg-muted/40">
                <img src={streamGame.coverUrl} className="size-16 rounded-lg object-cover" />
                <div className="min-w-0">
                  <div className="truncate text-sm font-black">{streamGame.title}</div>
                  <div className="mt-1 text-xs font-bold text-muted-foreground">{streamGame.platform} · {streamGame.genre}</div>
                  <div className="mt-2 inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-black text-primary">前台 Stream 展示</div>
                </div>
              </button>
            ) : null}
            <div className="mt-3 rounded-xl border border-border bg-card px-3 py-2">
              <div className="flex items-center gap-2">
                <Search className="size-4 text-muted-foreground" />
                <input value={streamSearch} onChange={(event) => setStreamSearch(event.target.value)} className="h-8 min-w-0 flex-1 bg-transparent text-sm font-bold outline-none" placeholder="搜索并选择直播游戏" />
              </div>
            </div>
            <div className="mt-2 space-y-2">
              {streamResults.map((game) => (
                <button key={game.id} disabled={readOnly || isSaving} onClick={() => chooseStreamGame(game.id)} className={cn("flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs font-bold hover:bg-muted", draft.streamGameId === game.id && "bg-primary/10 text-primary")}>
                  <img src={game.coverUrl} className="size-8 rounded object-cover" />
                  <span className="truncate">{game.title}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
            <h3 className="font-bold">页面状态</h3>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Field label="日均游玩" value={draft.dailyPlayTime} onChange={(value) => setDraft({ ...draft, dailyPlayTime: value })} />
              <Field label="连接延迟" value={draft.connectionLatency} onChange={(value) => setDraft({ ...draft, connectionLatency: value })} />
            </div>
            <Field label="搜索框提示" value={draft.searchPlaceholder} onChange={(value) => setDraft({ ...draft, searchPlaceholder: value })} />
          </div>
        </div>

        <div className="space-y-5 xl:col-span-2">
          <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="font-bold">游戏库</h3>
              <div className="flex gap-2">
                <div className="flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-3">
                  <Search className="size-4 text-muted-foreground" />
                  <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 bg-transparent text-sm font-bold outline-none" placeholder="搜索游戏库" />
                </div>
                <button onClick={addGame} disabled={readOnly} className="inline-flex items-center gap-1.5 rounded-xl bg-foreground px-3 py-2 text-sm font-bold text-background disabled:opacity-50"><Plus className="size-4" /> 新增</button>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredLibrary.map((game) => (
                <button key={game.id} onClick={() => setSelectedGameId(game.id)} className="group overflow-hidden rounded-2xl border border-border bg-card text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="aspect-[4/3] overflow-hidden bg-muted">
                    <img src={game.coverUrl} alt={game.title} className="size-full object-cover transition duration-500 group-hover:scale-105" />
                  </div>
                  <div className="space-y-2 p-3">
                    <div className="line-clamp-1 text-sm font-black">{game.title}</div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-black text-primary">{getGameStatusLabel(game.status)}</span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">{game.platform}</span>
                    </div>
                    <div className="text-xs font-bold text-muted-foreground">{game.status === "planned" ? "待玩" : game.lastPlayedAt || "待记录"} · {game.totalHours || "0h"}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-bold">游戏分类展示</h3>
                <p className="mt-1 text-xs font-bold text-muted-foreground">控制游戏页“游戏分类”下方的标题、副标题和图片。清空后前台会从游戏库自动生成。</p>
              </div>
              <button onClick={addCategory} disabled={readOnly} className="inline-flex items-center gap-1.5 rounded-xl bg-foreground px-3 py-2 text-sm font-bold text-background disabled:opacity-50"><Plus className="size-4" /> 添加分类</button>
            </div>
            <div className="mt-4 space-y-3">
              {(draft.categories || []).length ? (draft.categories || []).map((category, index) => (
                <div key={`${category.title}-${index}`} className="grid gap-3 rounded-2xl border border-border bg-card p-3 lg:grid-cols-[140px_1fr_auto]">
                  <div className="overflow-hidden rounded-xl border border-border bg-muted">
                    {category.img ? <img src={category.img} alt={category.title} className="aspect-[4/3] w-full object-cover" /> : <div className="flex aspect-[4/3] items-center justify-center px-3 text-center text-xs font-black text-muted-foreground">空图时自动回退</div>}
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <Field label="标题" value={category.title} onChange={(value) => updateCategory(index, { title: value })} />
                    <Field label="副标题" value={category.subtitle} onChange={(value) => updateCategory(index, { subtitle: value })} />
                    <div className="md:col-span-2">
                      <ImageUploadField label="分类图片" value={category.img || ""} onChange={(value) => updateCategory(index, { img: value })} admin readOnly={readOnly} scope="gaming-category" compact />
                    </div>
                  </div>
                  <div className="flex flex-row gap-2 lg:flex-col">
                    <button disabled={readOnly || index === 0} onClick={() => moveCategory(index, -1)} className="rounded-lg border border-border px-3 py-2 text-xs font-black disabled:opacity-50">上移</button>
                    <button disabled={readOnly || index === (draft.categories || []).length - 1} onClick={() => moveCategory(index, 1)} className="rounded-lg border border-border px-3 py-2 text-xs font-black disabled:opacity-50">下移</button>
                    <button disabled={readOnly} onClick={() => deleteCategory(index)} className="rounded-lg border border-rose-500/20 px-3 py-2 text-xs font-black text-rose-500 disabled:opacity-50"><Trash2 className="inline size-3.5" /> 删除</button>
                  </div>
                </div>
              )) : (
                <div className="rounded-2xl border border-dashed border-border bg-card p-5 text-sm font-bold text-muted-foreground">暂无手动分类。保存发布后，前台会从游戏库自动生成分类。</div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h3 className="font-bold">游戏录像库</h3>
                <p className="mt-1 text-xs font-bold text-muted-foreground">先选择游戏标签，再添加单条录像或批量导入 B 站录播 JSON。</p>
                <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-black text-muted-foreground">
                  <span className="rounded-full border border-border bg-card px-2.5 py-1">总录像 {recordingStatsPreview.count}</span>
                  <span className="rounded-full border border-border bg-card px-2.5 py-1">总时长 {recordingStatsPreview.totalHours}</span>
                  <span className="rounded-full border border-border bg-card px-2.5 py-1">播放量 {recordingStatsPreview.totalViewers}</span>
                  <span className="rounded-full border border-border bg-card px-2.5 py-1">弹幕 {recordingStatsPreview.totalDanmaku}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={syncRecordingStatsAndPublish}
                  disabled={readOnly || isSaving || !library.length}
                  className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-2 text-sm font-black text-primary hover:bg-primary/15 disabled:opacity-50"
                >
                  <RefreshCw className="size-4" /> 一键更新并发布统计
                </button>
                <button onClick={() => addRecording()} disabled={readOnly || !recordingGame} className="inline-flex items-center gap-1.5 rounded-xl bg-foreground px-3 py-2 text-sm font-bold text-background disabled:opacity-50"><Plus className="size-4" /> 添加录像</button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {library.map((game) => {
                const count = recordings.filter((recording) => recording.gameId === game.id || recording.gameTitle === game.title || (recording.tags || []).includes(game.title)).length;
                return (
                  <button
                    key={game.id}
                    onClick={() => setRecordingGameId(game.id)}
                    className={cn("rounded-full border border-border bg-card px-3 py-1.5 text-xs font-black transition hover:bg-muted", recordingGame?.id === game.id && "border-primary/40 bg-primary/10 text-primary")}
                  >
                    {game.title} <span className="ml-1 text-muted-foreground">{count}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 grid gap-3 rounded-2xl border border-border bg-card p-3 lg:grid-cols-[1fr_auto]">
              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-bold text-muted-foreground">输入要清洗的重复字段</span>
                <input
                  value={titleCleanupText}
                  onChange={(event) => setTitleCleanupText(event.target.value)}
                  placeholder="例如：【泛式/录播】, 太空狼人杀联动！"
                  className="h-10 rounded-lg border border-border bg-background px-3 text-sm font-medium outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                />
              </label>
              <div className="flex flex-wrap items-end gap-2">
                <button onClick={cleanupCurrentGameTitles} disabled={readOnly || !recordingGame || !titleCleanupText.trim()} className="rounded-xl border border-border px-3 py-2 text-xs font-black hover:bg-muted disabled:opacity-50">清洗当前游戏标题</button>
                <button onClick={selectFilteredRecordings} disabled={readOnly || !filteredRecordingIds.length} className="rounded-xl border border-border px-3 py-2 text-xs font-black hover:bg-muted disabled:opacity-50">全选当前筛选结果</button>
                <button onClick={clearRecordingSelection} disabled={!selectedRecordingIds.length} className="rounded-xl border border-border px-3 py-2 text-xs font-black hover:bg-muted disabled:opacity-50">取消选择</button>
                <button onClick={deleteSelectedRecordings} disabled={readOnly || !selectedFilteredCount} className="rounded-xl border border-rose-500/20 px-3 py-2 text-xs font-black text-rose-500 disabled:opacity-50">批量删除 {selectedFilteredCount || ""}</button>
              </div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_320px]">
              <div className="space-y-3">
                <div className="flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-3">
                  <Search className="size-4 text-muted-foreground" />
                  <input value={recordingQuery} onChange={(event) => setRecordingQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none" placeholder="搜索当前游戏的录像" />
                </div>
                {filteredRecordings.length ? (
                  <div className="space-y-3">
                    {filteredRecordings.map((recording) => (
                      <div key={recording.id} className="rounded-2xl border border-border bg-card p-3">
                        <label className="mb-3 flex items-center gap-2 text-xs font-black text-muted-foreground">
                          <input
                            type="checkbox"
                            checked={selectedRecordingIds.includes(recording.id)}
                            onChange={() => toggleRecordingSelection(recording.id)}
                            className="size-4 rounded border-border accent-primary"
                          />
                          选择此录像
                        </label>
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                          <Field label="标题" value={recording.title} onChange={(value) => updateRecording(recording.id, { title: value })} />
                          <Field label="BV号 / 链接" value={recording.videoUrl || recording.sourceUrl || ""} onChange={(value) => updateRecording(recording.id, { videoUrl: value, sourceUrl: value, videoProvider: value.includes("bilibili.com") || extractBvid(value) ? "bilibili" : "web" })} />
                          <Field label="UP主" value={recording.host || ""} onChange={(value) => updateRecording(recording.id, { host: value })} />
                          <Field label="时长" value={recording.duration} onChange={(value) => updateRecording(recording.id, { duration: value })} />
                          <Field label="播放量" value={recording.viewers} type="number" onChange={(value) => updateRecording(recording.id, { viewers: Number(value) || 0 })} />
                          <Field label="弹幕数" value={recording.danmaku} type="number" onChange={(value) => updateRecording(recording.id, { danmaku: Number(value) || 0 })} />
                          <DateTimePicker label="日期 / 收藏时间" mode="date" value={recording.date || ""} onChange={(value) => updateRecording(recording.id, { date: value })} />
                          <Field label="标签，逗号分隔" value={toTextList(recording.tags)} onChange={(value) => updateRecording(recording.id, { tags: parseTextList(value) })} />
                        </div>
                        <Area label="简介 / 备注" value={recording.summary || ""} onChange={(value) => updateRecording(recording.id, { summary: value })} rows={2} />
                        <div className="mt-3 flex justify-end">
                          <button disabled={readOnly} onClick={() => deleteRecording(recording.id)} className="rounded-lg border border-rose-500/20 px-3 py-2 text-xs font-black text-rose-500 disabled:opacity-50"><Trash2 className="inline size-3.5" /> 删除录像</button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-border bg-card p-5 text-sm font-bold text-muted-foreground">
                    当前游戏还没有录像。添加游戏后，可在这里选择对应游戏标签并添加录像。
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-border bg-card p-3">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="flex items-center gap-2 text-sm font-black"><Upload className="size-4 text-primary" /> 批量导入 JSON</h4>
                  <button
                    type="button"
                    disabled={readOnly || isGamingImporting}
                    onClick={() => gamingImportFileRef.current?.click()}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-bold text-primary transition-colors hover:bg-muted disabled:opacity-50"
                  >
                    <Upload className="size-3.5" /> {isGamingImporting ? "导入中..." : "上传 JSON 文件"}
                  </button>
                  <input
                    ref={gamingImportFileRef}
                    type="file"
                    accept=".json"
                    disabled={readOnly || isGamingImporting}
                    className="hidden"
                    onChange={(event) => handleGamingFileImport(event.currentTarget.files)}
                  />
                </div>
                <p className="mt-1 text-xs font-bold leading-relaxed text-muted-foreground">上传文件自动清洗标题并创建游戏库条目；或粘贴到下方文本框手动导入到当前游戏：{recordingGame?.title || "未选择"}</p>
                <textarea
                  value={recordingImportJson}
                  onChange={(event) => setRecordingImportJson(event.target.value)}
                  rows={10}
                  placeholder={'[\n  {\n    "标题": "【泛式/录播】太空狼人杀联动！",\n    "弹幕数": "625",\n    "播放量": "5.7万",\n    "时长": "03:27:15",\n    "BV号": "BV1RM4y1f7i2",\n    "链接": "https://www.bilibili.com/video/BV1RM4y1f7i2",\n    "UP主": "下播型泛式录播组",\n    "收藏时间": ""\n  }\n]'}
                  className="mt-3 w-full resize-none rounded-xl border border-border bg-background px-3 py-2 font-mono text-xs outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                />
                <button onClick={importRecordings} disabled={readOnly || !recordingGame || !recordingImportJson.trim()} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-black text-primary-foreground disabled:opacity-50">
                  <Upload className="size-4" /> 导入到当前游戏
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">探索卡片</h3>
              <button
                disabled={readOnly}
                onClick={() => setDraft((current) => ({ ...current, exploreItems: [...(current.exploreItems || []), { id: `explore-${Date.now()}`, title: "新探索卡片", author: "AnySoul", description: "", coverUrl: streamGame?.coverUrl || "", tags: ["游戏回"], stars: 1, views: 0 }] }))}
                className="text-xs font-black text-primary disabled:opacity-50"
              >
                添加卡片
              </button>
            </div>
            <div className="mt-3 space-y-2">
              {(draft.exploreItems || []).map((item, index) => (
                <div key={item.id} className="grid grid-cols-1 gap-2 rounded-xl border border-border bg-card p-3 md:grid-cols-4">
                  <Field label="标题" value={item.title} onChange={(value) => setDraft((current) => ({ ...current, exploreItems: (current.exploreItems || []).map((entry, i) => i === index ? { ...entry, title: value } : entry) }))} />
                  <Field label="作者" value={item.author} onChange={(value) => setDraft((current) => ({ ...current, exploreItems: (current.exploreItems || []).map((entry, i) => i === index ? { ...entry, author: value } : entry) }))} />
                  <Field label="标签" value={toTextList(item.tags)} onChange={(value) => setDraft((current) => ({ ...current, exploreItems: (current.exploreItems || []).map((entry, i) => i === index ? { ...entry, tags: parseTextList(value) } : entry) }))} />
                  <button disabled={readOnly} onClick={() => setDraft((current) => ({ ...current, exploreItems: (current.exploreItems || []).filter((_, i) => i !== index) }))} className="self-end rounded-lg border border-rose-500/20 px-3 py-2 text-xs font-black text-rose-500 disabled:opacity-50"><Trash2 className="inline size-3.5" /> 删除</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-muted/20 px-4 py-3 text-xs text-muted-foreground">{status}</div>

      {selectedGame && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={() => setSelectedGameId(null)}>
          <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-border bg-background shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <div className="text-xs font-black text-primary">游戏详情编辑</div>
                <h3 className="text-xl font-black">{selectedGame.title}</h3>
              </div>
              <button onClick={() => setSelectedGameId(null)} className="rounded-full border border-border p-2 text-muted-foreground hover:bg-muted"><X className="size-4" /></button>
            </div>
            <div className="grid flex-1 gap-5 overflow-y-auto p-5 lg:grid-cols-[280px_1fr]">
              <div className="space-y-4">
                <img src={selectedGame.coverUrl} alt={selectedGame.title} className="aspect-[4/3] w-full rounded-2xl object-cover" />
                <ImageUploadField label="封面" value={selectedGame.coverUrl} onChange={(value) => updateGame(selectedGame.id, { coverUrl: value, heroImage: selectedGame.heroImage || value })} admin readOnly={readOnly} scope="gaming-cover" compact />
                <ImageUploadField label="轮播大图" value={selectedGame.heroImage || selectedGame.coverUrl} onChange={(value) => updateGame(selectedGame.id, { heroImage: value })} admin readOnly={readOnly} scope="gaming-cover" compact />
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Field label="标题" value={selectedGame.title} onChange={(value) => updateGame(selectedGame.id, { title: value })} />
                  <Field label="副标题" value={selectedGame.subtitle || ""} onChange={(value) => updateGame(selectedGame.id, { subtitle: value })} />
                  <Field label="平台" value={selectedGame.platform} onChange={(value) => updateGame(selectedGame.id, { platform: value })} />
                  <Field label="类型" value={selectedGame.genre} onChange={(value) => updateGame(selectedGame.id, { genre: value })} />
                  <Field label="模式" value={selectedGame.mode} onChange={(value) => updateGame(selectedGame.id, { mode: value })} />
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[12px] font-bold text-muted-foreground">状态</span>
                    <select value={selectedGame.status} onChange={(event) => updateGame(selectedGame.id, { status: event.target.value as GamingLibraryItem["status"] })} className="h-10 rounded-lg border border-border bg-card px-3 text-sm font-medium outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15">
                      <option value="playing">正在记录</option>
                      <option value="planned">待玩</option>
                      <option value="finished">已通关</option>
                      <option value="paused">暂停</option>
                      <option value="archived">已归档</option>
                    </select>
                  </label>
                  <DateTimePicker label="最近记录" mode="date" value={selectedGame.lastPlayedAt || ""} onChange={(value) => updateGame(selectedGame.id, { lastPlayedAt: value })} />
                  <Field label="累计时长" value={selectedGame.totalHours || ""} onChange={(value) => updateGame(selectedGame.id, { totalHours: value })} />
                  <Field label="评分" value={selectedGame.rating || ""} onChange={(value) => updateGame(selectedGame.id, { rating: value })} />
                  <Field label="标签，逗号分隔" value={toTextList(selectedGame.tags)} onChange={(value) => updateGame(selectedGame.id, { tags: parseTextList(value) })} />
                  <Field label="直播链接" value={selectedGame.streamUrl || ""} onChange={(value) => updateGame(selectedGame.id, { streamUrl: value })} />
                  <Field label="录像链接" value={selectedGame.videoUrl || ""} onChange={(value) => updateGame(selectedGame.id, { videoUrl: value })} />
                </div>
                <Area label="简介" value={selectedGame.description} onChange={(value) => updateGame(selectedGame.id, { description: value })} rows={3} />
                <Area label="站主评价" value={selectedGame.review || ""} onChange={(value) => updateGame(selectedGame.id, { review: value })} rows={3} />
                <Area
                  label="游玩记录，每行 日期|小时|备注"
                  value={(selectedGame.playRecords || []).map((record) => `${record.date}|${record.durationHours}|${record.note || ""}|${record.href || ""}`).join("\n")}
                  onChange={(value) => updateGame(selectedGame.id, { playRecords: value.split("\n").map((line) => {
                    const [date, hours, note, href] = line.split("|");
                    return { date: (date || "").trim(), durationHours: Number(hours) || 1, note: (note || "").trim(), href: (href || "").trim() || undefined };
                  }).filter((record) => record.date) })}
                  rows={4}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2 border-t border-border px-5 py-4 sm:flex-row sm:justify-between">
              <button disabled={readOnly} onClick={() => deleteGame(selectedGame.id)} className="rounded-xl border border-rose-500/20 px-4 py-2 text-sm font-black text-rose-500 disabled:opacity-50"><Trash2 className="inline size-4" /> 删除并发布</button>
              <div className="flex gap-2">
                <button onClick={() => setSelectedGameId(null)} className="rounded-xl border border-border px-4 py-2 text-sm font-black">取消</button>
                <button disabled={readOnly || isSaving} onClick={() => void publish()} className="rounded-xl bg-primary px-4 py-2 text-sm font-black text-primary-foreground disabled:opacity-50">保存并发布</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
