import { useEffect, useMemo, useState } from "react";
import { Gamepad2, Plus, RefreshCw, Rocket, Search, Trash2, X } from "lucide-react";
import { CONTENT_API_BASE } from "../content/client";
import { useAuth } from "../contexts/AuthContext";
import { defaultGamingMain } from "../content/defaults/gaming";
import type { AdminContentEntry, GamingExploreItem, GamingLibraryItem, GamingMainContent } from "../content/types";
import { DateTimePicker } from "../components/DateTimePicker";
import { ImageUploadField } from "../components/ImageUploadField";
import { cn } from "../lib/utils";

type AdminContentResponse = {
  entries: AdminContentEntry[];
};

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
    coverUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200",
    rating: "",
    totalHours: "",
    lastPlayedAt: new Date().toISOString().slice(0, 10),
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

function normalizeForPublish(draft: GamingMainContent): GamingMainContent {
  const library = draft.library || [];
  return {
    ...draft,
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

  const library = draft.library || [];
  const selectedGame = library.find((game) => game.id === selectedGameId) || null;
  const streamGame = library.find((game) => game.id === draft.streamGameId) || library[0];
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

  const load = async () => {
    const response = await authFetch(`${CONTENT_API_BASE}/api/admin/content`);
    if (!response.ok) throw new Error(await readAdminError(response, "游戏回内容加载失败"));
    const data = await response.json() as AdminContentResponse;
    const entry = data.entries.find((item) => item.key === "gaming.main");
    setDraft(normalizeGamingDraft((entry?.draft as GamingMainContent | undefined) || defaultGamingMain));
    setStatus("游戏回内容已同步");
  };

  useEffect(() => {
    load().catch((error) => setStatus(error instanceof TypeError ? "内容服务未启动，请运行 npm run server:dev" : error instanceof Error ? error.message : "游戏回内容加载失败"));
  }, []);

  const publish = async (nextDraft = draft) => {
    if (readOnly) return;
    setIsSaving(true);
    try {
      const payload = normalizeForPublish(nextDraft);
      const response = await authFetch(`${CONTENT_API_BASE}/api/admin/content/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operations: [{ key: "gaming.main", payload, publish: true, message: "Publish gaming page controls" }]
        })
      });
      if (!response.ok) throw new Error(await readAdminError(response, "游戏回发布失败"));
      setDraft(normalizeGamingDraft(payload));
      setStatus("已保存并发布，游戏回页面会自动同步更新");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "发布失败，请检查内容服务");
    } finally {
      setIsSaving(false);
    }
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
      exploreItems: (draft.exploreItems || []).filter((item) => item.gameId !== id)
    };
    setDraft(nextDraft);
    setSelectedGameId(null);
  };

  const chooseStreamGame = (id: string) => {
    const game = library.find((item) => item.id === id);
    if (!game) return;
    const nextDraft = { ...draft, streamGameId: id, currentGameId: draft.currentGameId || id, streamTitle: game.title, streamImage: game.coverUrl };
    setDraft(nextDraft);
    void publish(nextDraft);
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
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-black text-primary">{game.status}</span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">{game.platform}</span>
                    </div>
                    <div className="text-xs font-bold text-muted-foreground">{game.lastPlayedAt || "待记录"} · {game.totalHours || "0h"}</div>
                  </div>
                </button>
              ))}
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
                      <option value="playing">进行中</option>
                      <option value="planned">计划中</option>
                      <option value="finished">已通关</option>
                      <option value="paused">暂停</option>
                      <option value="archived">归档</option>
                    </select>
                  </label>
                  <DateTimePicker label="最近游玩" mode="date" value={selectedGame.lastPlayedAt || ""} onChange={(value) => updateGame(selectedGame.id, { lastPlayedAt: value })} />
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
                  value={(selectedGame.playRecords || []).map((record) => `${record.date}|${record.durationHours}|${record.note || ""}`).join("\n")}
                  onChange={(value) => updateGame(selectedGame.id, { playRecords: value.split("\n").map((line) => {
                    const [date, hours, note] = line.split("|");
                    return { date: (date || "").trim(), durationHours: Number(hours) || 1, note: (note || "").trim() };
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
