import { useEffect, useState } from "react";
import { Gamepad2, Plus, RefreshCw, Rocket, Save, Trash2 } from "lucide-react";
import { CONTENT_API_BASE } from "../content/client";
import { useAuth } from "../contexts/AuthContext";
import { defaultGamingMain } from "../content/defaults/gaming";
import type { AdminContentEntry, GamingMainContent } from "../content/types";
import { DateTimePicker } from "../components/DateTimePicker";

type AdminContentResponse = {
  entries: AdminContentEntry[];
};

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12px] font-bold text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-lg border border-border bg-card px-3 text-sm font-medium outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
      />
    </label>
  );
}

async function readAdminError(response: Response, fallback: string) {
  try {
    const data = await response.json() as { error?: string };
    return data.error ? `${fallback}：${response.status} ${data.error}` : `${fallback}：HTTP ${response.status}`;
  } catch {
    return `${fallback}：HTTP ${response.status}`;
  }
}

export function GamingAdminPanel() {
  const { authFetch } = useAuth();
  const [draft, setDraft] = useState<GamingMainContent>(defaultGamingMain);
  const [status, setStatus] = useState("正在加载游戏回内容...");
  const [isSaving, setIsSaving] = useState(false);

  const load = async () => {
    const response = await authFetch(`${CONTENT_API_BASE}/api/admin/content`);
    if (!response.ok) throw new Error(await readAdminError(response, "游戏回内容加载失败"));
    const data = await response.json() as AdminContentResponse;
    const entry = data.entries.find((item) => item.key === "gaming.main");
    setDraft((entry?.draft as GamingMainContent | undefined) || defaultGamingMain);
    setStatus("游戏回内容已同步");
  };

  useEffect(() => {
    load().catch((error) => setStatus(error instanceof TypeError ? "内容服务未启动，请运行 npm run server:dev" : error instanceof Error ? error.message : "游戏回内容加载失败"));
  }, []);

  const saveDraft = async () => {
    setIsSaving(true);
    try {
      const response = await authFetch(`${CONTENT_API_BASE}/api/admin/content/gaming.main/draft`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: draft })
      });
      if (!response.ok) throw new Error("save failed");
      setStatus("草稿已保存，可以发布到游戏回页面");
    } catch {
      setStatus("保存失败，请检查内容服务");
    } finally {
      setIsSaving(false);
    }
  };

  const publish = async () => {
    setIsSaving(true);
    try {
      await saveDraft();
      const response = await authFetch(`${CONTENT_API_BASE}/api/admin/content/gaming.main/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Publish gaming page controls" })
      });
      if (!response.ok) throw new Error("publish failed");
      setStatus("已发布，游戏回页面会自动同步更新");
    } catch {
      setStatus("发布失败，请检查内容服务");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2"><Gamepad2 className="size-6 text-primary" /> 游戏回控制</h2>
          <p className="text-sm text-muted-foreground mt-1">直接填写最近游玩、轮播、游戏分类和游戏库卡片信息，不需要接触代码。</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted text-sm font-bold"><RefreshCw className="size-4" /> 刷新</button>
          <button onClick={saveDraft} disabled={isSaving} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card hover:bg-muted text-sm font-bold disabled:opacity-50"><Save className="size-4" /> 保存草稿</button>
          <button onClick={publish} disabled={isSaving} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-bold disabled:opacity-50"><Rocket className="size-4" /> 发布同步</button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-1 space-y-4">
          <div className="rounded-xl border border-border bg-background p-4 space-y-3 shadow-sm">
            <h3 className="font-bold">页面状态</h3>
            <Field label="最近玩的游戏" value={draft.currentGameTitle} onChange={(value) => setDraft({ ...draft, currentGameTitle: value })} />
            <DateTimePicker label="最近游玩时间" mode="datetime" value={draft.currentGameTime} onChange={(value) => setDraft({ ...draft, currentGameTime: value })} />
            <Field label="日均游玩时数" value={draft.dailyPlayTime} onChange={(value) => setDraft({ ...draft, dailyPlayTime: value })} />
            <Field label="连接延迟" value={draft.connectionLatency} onChange={(value) => setDraft({ ...draft, connectionLatency: value })} />
          </div>

          <div className="rounded-xl border border-border bg-background p-4 space-y-3 shadow-sm">
            <h3 className="font-bold">直播卡片</h3>
            <Field label="标题" value={draft.streamTitle} onChange={(value) => setDraft({ ...draft, streamTitle: value })} />
            <Field label="封面图片地址" value={draft.streamImage} onChange={(value) => setDraft({ ...draft, streamImage: value })} />
          </div>
        </div>

        <div className="xl:col-span-2 space-y-5">
          <div className="rounded-xl border border-border bg-background p-4 space-y-4 shadow-sm">
            <div className="flex items-center justify-between"><h3 className="font-bold">顶部轮播游戏</h3></div>
            {draft.heroGames.map((game, index) => (
              <div key={index} className="rounded-lg border border-border bg-card p-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                <Field label="标题" value={game.title} onChange={(value) => setDraft({ ...draft, heroGames: draft.heroGames.map((item, i) => i === index ? { ...item, title: value } : item) })} />
                <DateTimePicker label="时间说明" mode="date" value={game.date} onChange={(value) => setDraft({ ...draft, heroGames: draft.heroGames.map((item, i) => i === index ? { ...item, date: value } : item) })} />
                <Field label="图片地址" value={game.img} onChange={(value) => setDraft({ ...draft, heroGames: draft.heroGames.map((item, i) => i === index ? { ...item, img: value } : item) })} />
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-border bg-background p-4 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">最近游戏列表</h3>
              <button onClick={() => setDraft({ ...draft, recentGames: [...draft.recentGames, { ...defaultGamingMain.recentGames[0], title: "新游戏" }] })} className="inline-flex items-center gap-1.5 text-xs font-bold text-primary"><Plus className="size-4" /> 添加游戏</button>
            </div>
            {draft.recentGames.map((game, index) => (
              <div key={index} className="rounded-lg border border-border bg-card p-3 space-y-3">
                <div className="flex justify-between gap-3">
                  <div className="font-bold text-sm">游戏 {index + 1}</div>
                  <button onClick={() => setDraft({ ...draft, recentGames: draft.recentGames.filter((_, i) => i !== index) })} className="text-xs font-bold text-red-500 inline-flex items-center gap-1"><Trash2 className="size-3.5" /> 删除</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Field label="游戏名称" value={game.title} onChange={(value) => setDraft({ ...draft, recentGames: draft.recentGames.map((item, i) => i === index ? { ...item, title: value } : item) })} />
                  <DateTimePicker label="时间" mode="datetime" value={game.time} onChange={(value) => setDraft({ ...draft, recentGames: draft.recentGames.map((item, i) => i === index ? { ...item, time: value } : item) })} />
                  <Field label="类型/模式" value={game.desc} onChange={(value) => setDraft({ ...draft, recentGames: draft.recentGames.map((item, i) => i === index ? { ...item, desc: value } : item) })} />
                  <Field label="标签" value={game.tag1.text} onChange={(value) => setDraft({ ...draft, recentGames: draft.recentGames.map((item, i) => i === index ? { ...item, tag1: { ...item.tag1, text: value } } : item) })} />
                  <Field label="评分" value={game.rating || ""} onChange={(value) => setDraft({ ...draft, recentGames: draft.recentGames.map((item, i) => i === index ? { ...item, rating: value } : item) })} />
                  <Field label="图片地址" value={game.img} onChange={(value) => setDraft({ ...draft, recentGames: draft.recentGames.map((item, i) => i === index ? { ...item, img: value } : item) })} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-muted/20 px-4 py-3 text-xs text-muted-foreground">{status}</div>
    </div>
  );
}
