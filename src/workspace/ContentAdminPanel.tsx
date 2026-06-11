import Activity from "../components/icons/chart-line-icon";
import Bell from "../components/icons/filled-bell-icon";
import Check from "../components/icons/simple-checked-icon";
import Database from "../components/icons/stack-3-icon";
import FileText from "../components/icons/file-description-icon";
import HelpCircle from "../components/icons/question-mark";
import Plus from "../components/icons/alarm-clock-plus-icon";
import RefreshCw from "../components/icons/refresh-icon";
import Rocket from "../components/icons/rocket-icon";
import Save from "../components/icons/save-icon";
import Sparkles from "../components/icons/sparkles-icon";
import Trash2 from "../components/icons/trash-icon";
import { useEffect, useMemo, useState } from "react";

import { CONTENT_API_BASE } from "../content/client";
import { defaultHomeFaq, defaultHomeHero } from "../content/defaults/home";
import { defaultSiteAnnouncements } from "../content/defaults/siteAnnouncements";
import { defaultTalksContent } from "../content/defaults/talks";
import type { AdminContentEntry, FaqContent, HomeHeroContent, SiteAnnouncementsContent, TalksContent } from "../content/types";
import { useAuth } from "../contexts/AuthContext";
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
  },
  "talks.main": {
    title: "杂谈回内容",
    description: "管理杂谈回直播、近期计划、归档列表、侧边栏动态和话题入口。",
    icon: FileText
  },
  "site.announcements": {
    title: "站点公告",
    description: "管理公开站点工作台里的置顶公告、提醒等级、有效时间和跳转入口。",
    icon: Bell
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

function normalizeTalks(value: unknown): TalksContent {
  const talks = value as Partial<TalksContent> | null;
  return {
    ...defaultTalksContent,
    ...(talks || {}),
    hero: { ...defaultTalksContent.hero, ...(talks?.hero || {}) },
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

function normalizeAnnouncements(value: unknown): SiteAnnouncementsContent {
  const content = value as Partial<SiteAnnouncementsContent> | null;
  return {
    items: Array.isArray(content?.items) ? content.items.map((item, index) => ({
      id: typeof item?.id === "string" && item.id ? item.id : `announcement-${Date.now()}-${index}`,
      title: typeof item?.title === "string" ? item.title : "新的公告",
      body: typeof item?.body === "string" ? item.body : "",
      level: ["info", "success", "warning", "urgent"].includes(String(item?.level)) ? item.level as SiteAnnouncementsContent["items"][number]["level"] : "info",
      startsAt: typeof item?.startsAt === "string" ? item.startsAt : "",
      endsAt: typeof item?.endsAt === "string" ? item.endsAt : "",
      href: typeof item?.href === "string" ? item.href : "",
      tags: Array.isArray(item?.tags) ? item.tags.map(String).filter(Boolean) : [],
      pinned: Boolean(item?.pinned)
    })) : defaultSiteAnnouncements.items
  };
}

async function readAdminError(response: Response, fallback: string) {
  try {
    const data = await response.json() as { error?: string };
    return data.error ? `${fallback}: ${response.status} ${data.error}` : `${fallback}: HTTP ${response.status}`;
  } catch {
    return `${fallback}: HTTP ${response.status}`;
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
  const [jsonError, setJsonError] = useState("");

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
      setJsonError("");
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
      setJsonError("");
    }
  }, [selectedEntry?.key]);

  const persistDraft = async () => {
    if (readOnly) throw new Error("read-only");
    if (jsonError) throw new Error(jsonError);

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
    setDraft((current) => updater(normalizeFaq(current)));
  };

  const updateAnnouncements = (updater: (current: SiteAnnouncementsContent) => SiteAnnouncementsContent) => {
    setDraft((current) => updater(normalizeAnnouncements(current)));
  };

  const updateJsonDraft = (value: string) => {
    try {
      setDraft(JSON.parse(value));
      setJsonError("");
    } catch (error) {
      setJsonError(error instanceof Error ? `JSON 格式错误：${error.message}` : "JSON 格式错误");
    }
  };

  const renderEditor = () => {
    if (selectedKey === "home.hero.main") {
      const hero = normalizeHero(draft);

      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <TextField label="顶部小标签" value={hero.badge} onChange={(value) => updateHero("badge", value)} />
            <TextField label="副标题" value={hero.subtitle} onChange={(value) => updateHero("subtitle", value)} />
            <TextField label="主标题前半句" value={hero.titlePrefix} onChange={(value) => updateHero("titlePrefix", value)} />
            <TextField label="绿色强调文字" value={hero.highlight1} onChange={(value) => updateHero("highlight1", value)} />
            <TextField label="粉色强调文字" value={hero.highlight2} onChange={(value) => updateHero("highlight2", value)} />
            <TextField label="演示窗口标题" value={hero.browserTitle} onChange={(value) => updateHero("browserTitle", value)} />
          </div>

          <div className="space-y-4 rounded-xl border border-border bg-muted/20 p-4">
            <h3 className="text-sm font-bold">聊天演示文案</h3>
            <TextAreaField label="用户第一句" value={hero.chatMsg1} onChange={(value) => updateHero("chatMsg1", value)} rows={2} />
            <TextAreaField label="系统回复" value={hero.chatMsg2} onChange={(value) => updateHero("chatMsg2", value)} rows={3} />
            <TextAreaField label="用户第二句" value={hero.chatMsg3} onChange={(value) => updateHero("chatMsg3", value)} rows={2} />
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
            <div key={index} className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-sm">
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

    if (selectedKey === "site.announcements") {
      const announcements = normalizeAnnouncements(draft);

      return (
        <div className="space-y-5">
          {announcements.items.map((item, index) => (
            <div key={item.id} className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold">公告 {index + 1}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">{item.pinned ? "置顶展示" : "普通公告"} · {item.level}</p>
                </div>
                <button
                  onClick={() => updateAnnouncements((current) => ({ ...current, items: current.items.filter((_, itemIndex) => itemIndex !== index) }))}
                  className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-bold text-red-500 hover:bg-red-500/10"
                >
                  <Trash2 className="size-3.5" /> 删除
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <TextField
                  label="标题"
                  value={item.title}
                  onChange={(value) => updateAnnouncements((current) => ({
                    ...current,
                    items: current.items.map((ann, itemIndex) => itemIndex === index ? { ...ann, title: value } : ann)
                  }))}
                />
                <TextField
                  label="跳转地址"
                  value={item.href || ""}
                  placeholder="#talks"
                  onChange={(value) => updateAnnouncements((current) => ({
                    ...current,
                    items: current.items.map((ann, itemIndex) => itemIndex === index ? { ...ann, href: value } : ann)
                  }))}
                />
                <TextField
                  label="开始时间"
                  value={item.startsAt || ""}
                  placeholder="2026-06-10T00:00:00+08:00"
                  onChange={(value) => updateAnnouncements((current) => ({
                    ...current,
                    items: current.items.map((ann, itemIndex) => itemIndex === index ? { ...ann, startsAt: value } : ann)
                  }))}
                />
                <TextField
                  label="结束时间"
                  value={item.endsAt || ""}
                  placeholder="留空表示长期有效"
                  onChange={(value) => updateAnnouncements((current) => ({
                    ...current,
                    items: current.items.map((ann, itemIndex) => itemIndex === index ? { ...ann, endsAt: value } : ann)
                  }))}
                />
              </div>
              <TextAreaField
                label="正文"
                value={item.body}
                rows={3}
                onChange={(value) => updateAnnouncements((current) => ({
                  ...current,
                  items: current.items.map((ann, itemIndex) => itemIndex === index ? { ...ann, body: value } : ann)
                }))}
              />
              <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_auto]">
                <label className="flex flex-col gap-1.5">
                  <span className="text-[12px] font-bold text-muted-foreground">等级</span>
                  <select
                    value={item.level}
                    onChange={(event) => updateAnnouncements((current) => ({
                      ...current,
                      items: current.items.map((ann, itemIndex) => itemIndex === index ? { ...ann, level: event.target.value as SiteAnnouncementsContent["items"][number]["level"] } : ann)
                    }))}
                    className="h-10 rounded-lg border border-border bg-card px-3 text-sm font-bold outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                  >
                    <option value="info">信息</option>
                    <option value="success">正常</option>
                    <option value="warning">提醒</option>
                    <option value="urgent">紧急</option>
                  </select>
                </label>
                <TextField
                  label="标签"
                  value={item.tags.join("、")}
                  placeholder="工作台、公告"
                  onChange={(value) => updateAnnouncements((current) => ({
                    ...current,
                    items: current.items.map((ann, itemIndex) => itemIndex === index ? { ...ann, tags: value.split(/[、,\n]/).map((tag) => tag.trim()).filter(Boolean) } : ann)
                  }))}
                />
                <label className="flex items-end gap-2 pb-2 text-sm font-bold text-foreground">
                  <input
                    type="checkbox"
                    checked={Boolean(item.pinned)}
                    onChange={(event) => updateAnnouncements((current) => ({
                      ...current,
                      items: current.items.map((ann, itemIndex) => itemIndex === index ? { ...ann, pinned: event.target.checked } : ann)
                    }))}
                    className="size-4 accent-primary"
                  />
                  置顶
                </label>
              </div>
            </div>
          ))}

          <button
            onClick={() => updateAnnouncements((current) => ({
              ...current,
              items: [{
                id: `announcement-${Date.now()}`,
                title: "新的公告",
                body: "",
                level: "info",
                href: "#site-workspace",
                tags: [],
                pinned: false
              }, ...current.items]
            }))}
            className="inline-flex items-center gap-2 rounded-lg border border-dashed border-border bg-background px-4 py-2 text-sm font-bold text-muted-foreground hover:border-primary/50 hover:text-primary"
          >
            <Plus className="size-4" /> 添加公告
          </button>
        </div>
      );
    }

    if (selectedKey === "talks.main") {
      const talks = normalizeTalks(draft);
      const jsonValue = jsonError ? JSON.stringify(draft ?? talks, null, 2) : JSON.stringify(talks, null, 2);

      return (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <div className="text-sm font-bold text-foreground">杂谈回 JSON 内容</div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              这里管理直播卡片、近期计划、归档、近期动态、热门文章和上传入口。保持 JSON 格式正确后即可保存并发布。
            </p>
          </div>
          <textarea
            value={jsonValue}
            onChange={(event) => updateJsonDraft(event.target.value)}
            spellCheck={false}
            className="min-h-[520px] w-full resize-y rounded-xl border border-border bg-zinc-950 px-4 py-3 font-mono text-xs leading-relaxed text-zinc-100 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
          />
          {jsonError ? <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm font-bold text-red-600">{jsonError}</div> : null}
        </div>
      );
    }

    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
        <div className="text-sm font-bold text-foreground">这个内容还没有可视化控制面板</div>
        <p className="mt-2 text-sm text-muted-foreground">后续可以继续补专用表单。</p>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
            <Database className="size-6 text-primary" /> 可视化内容管理
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">像填表一样修改网站内容。保存为草稿后，点击发布即可同步到前台。</p>
        </div>
        <button
          onClick={() => loadEntries()}
          className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-muted"
        >
          <RefreshCw className="size-4" /> 刷新
        </button>
      </div>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 space-y-4 xl:col-span-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><Activity className="size-3.5" /> 站点版本</div>
              <div className="mt-1 text-3xl font-black text-foreground">{siteVersion || "-"}</div>
            </div>
            <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><FileText className="size-3.5" /> 可编辑模块</div>
              <div className="mt-1 text-3xl font-black text-foreground">{visibleEntries.length || "-"}</div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
            <div className="border-b border-border bg-muted/20 px-4 py-3 text-sm font-bold">选择要修改的区域</div>
            <div className="space-y-1 p-2">
              {visibleEntries.map((entry) => {
                const meta = editableLabels[entry.key];
                const Icon = meta.icon;
                return (
                  <button
                    key={entry.key}
                    onClick={() => setSelectedKey(entry.key)}
                    className={cn(
                      "w-full rounded-lg border p-3 text-left transition-colors",
                      selectedKey === entry.key ? "border-primary/30 bg-primary/10 text-foreground" : "border-transparent bg-card hover:bg-muted/40"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-lg bg-primary/10 p-2 text-primary"><Icon className="size-4" /></div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-bold">{meta.title}</span>
                          <span className={cn(
                            "rounded border px-1.5 py-0.5 text-[10px]",
                            entry.status === "published" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600" : "border-amber-500/20 bg-amber-500/10 text-amber-600"
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

        <div className="col-span-12 flex min-h-[560px] flex-col overflow-hidden rounded-xl border border-border bg-background shadow-sm xl:col-span-8">
          <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/20 px-4 py-3">
            <div>
              <div className="text-sm font-bold">{editableLabels[selectedKey]?.title || "内容编辑"}</div>
              <div className="text-[11px] text-muted-foreground">修改后先保存草稿，再发布到前台。</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={saveDraft}
                disabled={isSaving || !selectedEntry || readOnly || Boolean(jsonError)}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-bold transition-colors hover:bg-muted disabled:opacity-50"
              >
                <Save className="size-3.5" /> 保存草稿
              </button>
              <button
                onClick={publish}
                disabled={isSaving || !selectedEntry || readOnly || Boolean(jsonError)}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                <Rocket className="size-3.5" /> 发布同步
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto bg-card/60 p-5">
            <fieldset disabled={readOnly} className={readOnly ? "opacity-75" : undefined}>{renderEditor()}</fieldset>
          </div>
          <div className="flex items-center gap-2 border-t border-border bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
            <Check className="size-4 text-emerald-500" /> {status}
          </div>
        </div>
      </div>
    </div>
  );
}
