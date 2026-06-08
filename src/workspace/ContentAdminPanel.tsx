import { useEffect, useMemo, useState } from "react";
import { Activity, Check, Database, FileText, HelpCircle, Plus, RefreshCw, Rocket, Save, Sparkles, Trash2 } from "lucide-react";
import { CONTENT_API_BASE } from "../content/client";
import { useAuth } from "../contexts/AuthContext";
import { defaultHomeFaq, defaultHomeHero } from "../content/defaults/home";
import type { AdminContentEntry, FaqContent, HomeHeroContent } from "../content/types";
import { cn } from "../lib/utils";

type AdminContentResponse = {
  siteVersion: number;
  entries: AdminContentEntry[];
};

const editableLabels: Record<string, { title: string; description: string; icon: typeof Sparkles }> = {
  "home.hero.main": {
    title: "首页主视觉",
    description: "控制首页第一屏的大标题、副标题、按钮提示和演示内容。",
    icon: Sparkles
  },
  "home.faq.items": {
    title: "常见问题",
    description: "管理首页 FAQ 的问题与答案，发布后前台自动更新。",
    icon: HelpCircle
  }
};

function TextField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12px] font-bold text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 rounded-lg border border-border bg-card px-3 text-sm font-medium text-foreground outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
      />
    </label>
  );
}

function TextAreaField({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange: (value: string) => void; rows?: number }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12px] font-bold text-muted-foreground">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        className="resize-none rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium leading-relaxed text-foreground outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
      />
    </label>
  );
}

function normalizeHero(value: unknown): HomeHeroContent {
  const hero = value as Partial<HomeHeroContent> | null;
  return {
    ...defaultHomeHero,
    ...(hero || {}),
    events: Array.isArray(hero?.events) ? hero.events : defaultHomeHero.events
  };
}

function normalizeFaq(value: unknown): FaqContent {
  const faq = value as Partial<FaqContent> | null;
  return {
    title: typeof faq?.title === "string" ? faq.title : defaultHomeFaq.title,
    items: Array.isArray(faq?.items) && faq.items.length > 0
      ? faq.items.map((item) => ({
        question: typeof item?.question === "string" ? item.question : "新的问题",
        answer: typeof item?.answer === "string" ? item.answer : "在这里填写答案。"
      }))
      : defaultHomeFaq.items
  };
}

async function readAdminError(response: Response, fallback: string) {
  try {
    const data = await response.json() as { error?: string };
    return data.error ? `${fallback}：${response.status} ${data.error}` : `${fallback}：HTTP ${response.status}`;
  } catch {
    return `${fallback}：HTTP ${response.status}`;
  }
}

export function ContentAdminPanel({ readOnly = false }: { readOnly?: boolean }) {
  const { authFetch } = useAuth();
  const [entries, setEntries] = useState<AdminContentEntry[]>([]);
  const [siteVersion, setSiteVersion] = useState(0);
  const [selectedKey, setSelectedKey] = useState("home.hero.main");
  const [draft, setDraft] = useState<unknown>(null);
  const [status, setStatus] = useState("正在连接内容服务...");
  const [isSaving, setIsSaving] = useState(false);

  const selectedEntry = useMemo(
    () => entries.find((entry) => entry.key === selectedKey),
    [entries, selectedKey]
  );

  const visibleEntries = useMemo(
    () => entries.filter((entry) => editableLabels[entry.key]),
    [entries]
  );

  const loadEntries = async () => {
    const response = await authFetch(`${CONTENT_API_BASE}/api/admin/content`);

    if (!response.ok) {
      throw new Error(await readAdminError(response, "内容加载失败"));
    }

    const data = await response.json() as AdminContentResponse;
    setEntries(data.entries);
    setSiteVersion(data.siteVersion);
    setStatus(`内容服务已同步 · Site v${data.siteVersion}`);

    const nextSelected = data.entries.find((entry) => entry.key === selectedKey && editableLabels[entry.key])
      || data.entries.find((entry) => editableLabels[entry.key]);
    if (nextSelected) {
      setSelectedKey(nextSelected.key);
      setDraft(nextSelected.draft);
    }
  };

  useEffect(() => {
    loadEntries().catch((error) => {
      console.warn(error);
      setStatus(error instanceof TypeError ? "内容服务未启动，请运行 npm run server:dev" : error instanceof Error ? error.message : "内容加载失败");
    });
  }, []);

  useEffect(() => {
    if (selectedEntry) {
      setDraft(selectedEntry.draft);
    }
  }, [selectedEntry?.key]);

  const persistDraft = async () => {
    if (readOnly) throw new Error("read-only");

    const response = await authFetch(`${CONTENT_API_BASE}/api/admin/content/${selectedKey}/draft`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload: draft, expectedVersion: selectedEntry?.version, expectedUpdatedAt: selectedEntry?.updatedAt })
    });

    if (!response.ok) {
      if (response.status === 409) throw new Error("内容已被其他管理员修改，请刷新后再合并保存。");
      throw new Error(`Draft save failed: ${response.status}`);
    }

    const data = await response.json() as { entry: AdminContentEntry };
    return data.entry;
  };

  const saveDraft = async () => {
    if (readOnly) {
      setStatus("只读模式无法保存草稿");
      return;
    }

    setIsSaving(true);

    try {
      await persistDraft();
      setStatus("草稿已保存。确认无误后点击发布同步到前台。");
      await loadEntries();
    } catch (error) {
      console.warn(error);
      setStatus(error instanceof Error ? error.message : "保存失败，请检查内容服务是否启动。");
    } finally {
      setIsSaving(false);
    }
  };

  const publish = async () => {
    if (readOnly) {
      setStatus("只读模式无法发布内容");
      return;
    }

    setIsSaving(true);

    try {
      const savedEntry = await persistDraft();
      const response = await authFetch(`${CONTENT_API_BASE}/api/admin/content/${selectedKey}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Published from visual workspace panel", expectedVersion: savedEntry.version, expectedUpdatedAt: savedEntry.updatedAt })
      });

      if (!response.ok) {
        if (response.status === 409) throw new Error("发布前内容已被其他管理员修改，请刷新后再发布。");
        throw new Error(`Publish failed: ${response.status}`);
      }

      setStatus("发布成功，前台页面会自动同步更新。");
      await loadEntries();
    } catch (error) {
      console.warn(error);
      setStatus(error instanceof Error ? error.message : "发布失败，请检查内容服务是否启动。");
    } finally {
      setIsSaving(false);
    }
  };

  const updateHero = (key: keyof HomeHeroContent, value: string) => {
    setDraft((current) => ({ ...(current as HomeHeroContent), [key]: value }));
  };

  const updateFaq = (updater: (current: FaqContent) => FaqContent) => {
    setDraft((current) => updater(current as FaqContent));
  };

  const renderEditor = () => {
    if (selectedKey === "home.hero.main") {
      const hero = normalizeHero(draft);

      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField label="顶部小标签" value={hero.badge} onChange={(value) => updateHero("badge", value)} />
            <TextField label="副标题" value={hero.subtitle} onChange={(value) => updateHero("subtitle", value)} />
            <TextField label="主标题前半句" value={hero.titlePrefix} onChange={(value) => updateHero("titlePrefix", value)} />
            <TextField label="绿色强调文字" value={hero.highlight1} onChange={(value) => updateHero("highlight1", value)} />
            <TextField label="粉色强调文字" value={hero.highlight2} onChange={(value) => updateHero("highlight2", value)} />
            <TextField label="演示窗口标题" value={hero.browserTitle} onChange={(value) => updateHero("browserTitle", value)} />
          </div>

          <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
            <h3 className="text-sm font-bold">聊天演示文案</h3>
            <TextAreaField label="用户第一句" value={hero.chatMsg1} onChange={(value) => updateHero("chatMsg1", value)} rows={2} />
            <TextAreaField label="AI 回复" value={hero.chatMsg2} onChange={(value) => updateHero("chatMsg2", value)} rows={3} />
            <TextAreaField label="用户第二句" value={hero.chatMsg3} onChange={(value) => updateHero("chatMsg3", value)} rows={2} />
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <div className="text-xs font-bold text-muted-foreground mb-2">前台预览摘要</div>
            <div className="text-2xl font-black tracking-tight">{hero.titlePrefix}</div>
            <div className="text-2xl font-black tracking-tight"><span className="text-[#a4c639]">{hero.highlight1}</span><span className="text-[#ea4c89]">{hero.highlight2}</span></div>
            <p className="mt-2 text-sm text-muted-foreground">{hero.subtitle}</p>
          </div>
        </div>
      );
    }

    if (selectedKey === "home.faq.items") {
      const faq = normalizeFaq(draft);

      return (
        <div className="space-y-5">
          <TextField
            label="FAQ 区块标题"
            value={faq.title}
            onChange={(value) => updateFaq((current) => ({ ...current, title: value }))}
          />

          {faq.items.map((item, index) => (
            <div key={index} className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold">问题 {index + 1}</h3>
                <button
                  onClick={() => updateFaq((current) => ({ ...current, items: current.items.filter((_, itemIndex) => itemIndex !== index) }))}
                  className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-bold text-red-500 hover:bg-red-500/10"
                >
                  <Trash2 className="size-3.5" /> 删除
                </button>
              </div>
              <TextField
                label="问题"
                value={item.question}
                onChange={(value) => updateFaq((current) => ({
                  ...current,
                  items: current.items.map((faqItem, itemIndex) => itemIndex === index ? { ...faqItem, question: value } : faqItem)
                }))}
              />
              <TextAreaField
                label="答案"
                value={item.answer}
                rows={4}
                onChange={(value) => updateFaq((current) => ({
                  ...current,
                  items: current.items.map((faqItem, itemIndex) => itemIndex === index ? { ...faqItem, answer: value } : faqItem)
                }))}
              />
            </div>
          ))}

          <button
            onClick={() => updateFaq((current) => ({ ...current, items: [...current.items, { question: "新的问题", answer: "在这里填写答案。" }] }))}
            className="inline-flex items-center gap-2 rounded-lg border border-dashed border-border bg-background px-4 py-2 text-sm font-bold text-muted-foreground hover:border-primary/50 hover:text-primary"
          >
            <Plus className="size-4" /> 添加问题
          </button>
        </div>
      );
    }

    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
        <div className="text-sm font-bold text-foreground">这个内容还没有可视化控制面板</div>
        <p className="mt-2 text-sm text-muted-foreground">后续会为游戏回、放映会、图库等模块提供专用表单，不需要编辑代码。</p>
      </div>
    );
  };

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Database className="size-6 text-primary" /> 可视化内容管理
          </h2>
          <p className="text-sm text-muted-foreground mt-1">像填表一样修改网站内容。保存为草稿后，点击发布即可同步到前台。</p>
        </div>
        <button
          onClick={() => loadEntries()}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted text-sm font-medium transition-colors shadow-sm"
        >
          <RefreshCw className="size-4" /> 刷新
        </button>
      </div>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 xl:col-span-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-background border border-border rounded-xl p-4 shadow-sm">
              <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5"><Activity className="size-3.5" /> 站点版本</div>
              <div className="text-3xl font-black text-foreground mt-1">{siteVersion || "-"}</div>
            </div>
            <div className="bg-background border border-border rounded-xl p-4 shadow-sm">
              <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5"><FileText className="size-3.5" /> 可编辑模块</div>
              <div className="text-3xl font-black text-foreground mt-1">{visibleEntries.length || "-"}</div>
            </div>
          </div>

          <div className="bg-background border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/20 text-sm font-bold">选择要修改的区域</div>
            <div className="p-2 space-y-1">
              {visibleEntries.map((entry) => {
                const meta = editableLabels[entry.key];
                const Icon = meta.icon;
                return (
                  <button
                    key={entry.key}
                    onClick={() => setSelectedKey(entry.key)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg border transition-colors",
                      selectedKey === entry.key ? "bg-primary/10 border-primary/30 text-foreground" : "bg-card border-transparent hover:bg-muted/40"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-lg bg-primary/10 p-2 text-primary"><Icon className="size-4" /></div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-bold truncate">{meta.title}</span>
                          <span className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded border",
                            entry.status === "published" ? "text-emerald-600 border-emerald-500/20 bg-emerald-500/10" : "text-amber-600 border-amber-500/20 bg-amber-500/10"
                          )}>{entry.status === "published" ? "已发布" : "草稿"}</span>
                        </div>
                        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{meta.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-8 bg-background border border-border rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[560px]">
          <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-bold">{editableLabels[selectedKey]?.title || "内容编辑"}</div>
              <div className="text-[11px] text-muted-foreground">修改后先保存草稿，再发布到前台。</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={saveDraft}
                disabled={isSaving || !selectedEntry || readOnly}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-bold transition-colors disabled:opacity-50"
              >
                <Save className="size-3.5" /> 保存草稿
              </button>
              <button
                onClick={publish}
                disabled={isSaving || !selectedEntry || readOnly}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
              >
                <Rocket className="size-3.5" /> 发布同步
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-5 bg-card/60">
            <fieldset disabled={readOnly} className={readOnly ? "opacity-75" : undefined}>{renderEditor()}</fieldset>
          </div>
          <div className="px-4 py-3 border-t border-border bg-muted/20 flex items-center gap-2 text-xs text-muted-foreground">
            <Check className="size-4 text-emerald-500" /> {status}
          </div>
        </div>
      </div>
    </div>
  );
}
