import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Activity, ArrowRight, Bell, CalendarDays, Clapperboard, Database, Film, Gamepad2, Image, Megaphone, Newspaper, Search, Sparkles, Video } from "lucide-react";
import { motion } from "motion/react";
import { fetchPublicPosts } from "../content/client";
import { defaultGamingMain } from "../content/defaults/gaming";
import { defaultPlazaContent } from "../content/defaults/plaza";
import { defaultScreeningLibrary } from "../content/defaults/screeningLibrary";
import { defaultScreeningsNext, defaultScreeningsSchedule } from "../content/defaults/screenings";
import { defaultSiteAnnouncements } from "../content/defaults/siteAnnouncements";
import { defaultTalksContent } from "../content/defaults/talks";
import { useContent } from "../content/useContent";
import type { GamingMainContent, PlazaContent, PublicPostSummary, ScreeningLibraryContent, ScreeningNextContent, ScreeningScheduleContent, SiteAnnouncementItem, SiteAnnouncementsContent, SiteWorkspaceEvent, TalksContent } from "../content/types";
import { useAuth } from "../contexts/AuthContext";
import { cn } from "../lib/utils";

type WorkspaceEventType = SiteWorkspaceEvent["type"];

const typeMeta: Record<WorkspaceEventType, { label: string; icon: typeof Bell; href: string; tone: string }> = {
  announcement: { label: "公告", icon: Megaphone, href: "#site-workspace", tone: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300" },
  talk: { label: "杂谈", icon: Video, href: "#talks", tone: "border-pink-500/20 bg-pink-500/10 text-pink-700 dark:text-pink-300" },
  screening: { label: "放映", icon: Film, href: "#screenings", tone: "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300" },
  game: { label: "游戏", icon: Gamepad2, href: "#games", tone: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" },
  plaza: { label: "图库", icon: Image, href: "#plaza", tone: "border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300" },
  post: { label: "文章", icon: Newspaper, href: "#posts", tone: "border-orange-500/20 bg-orange-500/10 text-orange-700 dark:text-orange-300" }
};

const weekDayLabels = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

function normalizeDate(value?: string) {
  if (!value) return undefined;
  const dateKey = value.match(/\d{4}-\d{2}-\d{2}/)?.[0];
  if (dateKey) return dateKey;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString().slice(0, 10);
}

function parseDateKey(dateKey?: string) {
  if (!dateKey) return null;
  const [year, month, day] = dateKey.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function formatDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function startOfMondayWeek(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + diff);
  return next;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(date.getDate() + days);
  return next;
}

function weekLabel(startKey: string) {
  const start = parseDateKey(startKey) || new Date();
  const end = addDays(start, 6);
  return `${start.getMonth() + 1}/${start.getDate()}-${end.getMonth() + 1}/${end.getDate()}`;
}

function isAnnouncementActive(item: SiteAnnouncementItem, now = new Date()) {
  const start = item.startsAt ? new Date(item.startsAt).getTime() : Number.NEGATIVE_INFINITY;
  const end = item.endsAt ? new Date(item.endsAt).getTime() : Number.POSITIVE_INFINITY;
  const current = now.getTime();
  return (Number.isNaN(start) || start <= current) && (Number.isNaN(end) || end >= current);
}

function eventSearchText(event: SiteWorkspaceEvent) {
  return [event.title, event.description, event.date, ...event.tags, typeMeta[event.type].label].join(" ").toLowerCase();
}

function normalizeTalks(value: TalksContent): TalksContent {
  return {
    ...defaultTalksContent,
    ...(value || {}),
    archive: Array.isArray(value?.archive) ? value.archive : defaultTalksContent.archive,
    upcoming: Array.isArray(value?.upcoming) ? value.upcoming : defaultTalksContent.upcoming
  };
}

function normalizeGaming(value: GamingMainContent): GamingMainContent {
  return {
    ...defaultGamingMain,
    ...(value || {}),
    library: Array.isArray(value?.library) ? value.library : defaultGamingMain.library,
    exploreItems: Array.isArray(value?.exploreItems) ? value.exploreItems : defaultGamingMain.exploreItems
  };
}

function normalizePlaza(value: PlazaContent): PlazaContent {
  return {
    ...defaultPlazaContent,
    ...(value || {}),
    souls: Array.isArray(value?.souls) ? value.souls : defaultPlazaContent.souls
  };
}

function normalizeAnnouncements(value: SiteAnnouncementsContent): SiteAnnouncementsContent {
  return { items: Array.isArray(value?.items) ? value.items : defaultSiteAnnouncements.items };
}

function toAnnouncementEvent(item: SiteAnnouncementItem): SiteWorkspaceEvent {
  return {
    id: item.id,
    type: "announcement",
    title: item.title,
    description: item.body,
    date: normalizeDate(item.startsAt),
    href: item.href || "#site-workspace",
    tags: item.tags || [],
    pinned: item.pinned
  };
}

export function SiteWorkspace() {
  const { user, canEditWorkspace } = useAuth();
  const announcements = normalizeAnnouncements(useContent<SiteAnnouncementsContent>("site.announcements", defaultSiteAnnouncements));
  const talks = normalizeTalks(useContent<TalksContent>("talks.main", defaultTalksContent));
  const screeningsNext = useContent<ScreeningNextContent>("screenings.next", defaultScreeningsNext);
  const screeningsSchedule = useContent<ScreeningScheduleContent>("screenings.schedule", defaultScreeningsSchedule);
  const screeningsLibrary = useContent<ScreeningLibraryContent>("screenings.library", defaultScreeningLibrary);
  const gaming = normalizeGaming(useContent<GamingMainContent>("gaming.main", defaultGamingMain));
  const plaza = normalizePlaza(useContent<PlazaContent>("plaza.main", defaultPlazaContent));
  const [posts, setPosts] = useState<PublicPostSummary[]>([]);
  const [query, setQuery] = useState("");
  const [selectedWeekStart, setSelectedWeekStart] = useState(() => formatDateKey(startOfMondayWeek(new Date())));

  useEffect(() => {
    let cancelled = false;
    fetchPublicPosts()
      .then((result) => {
        if (!cancelled) setPosts(result.posts || []);
      })
      .catch(() => {
        if (!cancelled) setPosts([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const activeAnnouncements = useMemo(
    () => announcements.items.filter((item) => isAnnouncementActive(item)).sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned))),
    [announcements.items]
  );

  const events = useMemo<SiteWorkspaceEvent[]>(() => {
    const next: SiteWorkspaceEvent[] = activeAnnouncements.map(toAnnouncementEvent);

    const liveTalk = talks.archive.find((item) => item.id === talks.liveTalkId) || talks.live || talks.archive[0];
    if (liveTalk) {
      next.push({
        id: `talk-live-${liveTalk.id}`,
        type: "talk",
        title: liveTalk.title,
        description: liveTalk.summary || liveTalk.subtitle || "杂谈回录像已归档。",
        date: normalizeDate(liveTalk.date),
        href: "#talks",
        tags: liveTalk.tags || []
      });
    }

    for (const talk of talks.archive.slice(0, 12)) {
      next.push({
        id: `talk-${talk.id}`,
        type: "talk",
        title: talk.title,
        description: talk.summary || talk.subtitle || "杂谈回录像。",
        date: normalizeDate(talk.date),
        href: "#talks",
        tags: talk.tags || []
      });
    }

    if (screeningsNext?.movies?.length) {
      next.push({
        id: "screenings-next",
        type: "screening",
        title: screeningsNext.title || "下次放映会",
        description: screeningsNext.movies.map((movie) => movie.title).join(" / ") || screeningsNext.theme,
        date: normalizeDate(screeningsNext.startsAt),
        href: "#screenings",
        tags: [screeningsNext.statusText, screeningsNext.theme].filter(Boolean)
      });
    }

    for (const week of screeningsSchedule.weeks.slice(-16)) {
      next.push({
        id: `screening-${week.id}`,
        type: "screening",
        title: week.title,
        description: week.movies?.map((movie) => movie.title).join(" / ") || week.theme || week.notes || "放映会记录。",
        date: normalizeDate(week.startsAt || week.date || week.archivedAt),
        href: "#screenings",
        tags: [week.statusText, week.theme || ""].filter(Boolean)
      });
    }

    for (const game of (gaming.library || []).slice(0, 16)) {
      const record = [...(game.playRecords || [])].sort((a, b) => String(b.date).localeCompare(String(a.date)))[0];
      next.push({
        id: `game-${game.id}`,
        type: "game",
        title: game.title,
        description: record?.note || game.description || "游戏回记录。",
        date: normalizeDate(record?.date || game.lastPlayedAt),
        href: "#game-library",
        tags: [game.status, game.platform, game.genre, ...game.tags].filter(Boolean)
      });
    }

    for (const soul of plaza.souls.filter((item) => item.visibility === "visible").slice(0, 16)) {
      next.push({
        id: `plaza-${soul.id}`,
        type: "plaza",
        title: soul.name,
        description: soul.desc || `${soul.author} 的图库作品。`,
        date: normalizeDate(soul.importDate || soul.createdAt),
        href: "#plaza",
        tags: soul.tags || []
      });
    }

    for (const post of posts.slice(0, 10)) {
      next.push({
        id: `post-${post.id}`,
        type: "post",
        title: post.title,
        description: post.summary || "文章记录已发布。",
        date: normalizeDate(post.publishedAt || post.createdAt),
        href: `#posts/${post.slug}`,
        tags: post.tags || []
      });
    }

    return next
      .filter((event, index, list) => list.findIndex((item) => item.id === event.id) === index)
      .sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) || String(b.date || "").localeCompare(String(a.date || "")));
  }, [activeAnnouncements, gaming.library, plaza.souls, posts, screeningsNext, screeningsSchedule.weeks, talks]);

  const weekStarts = useMemo(() => {
    const current = startOfMondayWeek(new Date());
    const keys = new Set([
      formatDateKey(addDays(current, -7)),
      formatDateKey(current),
      formatDateKey(addDays(current, 7))
    ]);
    for (const event of events) {
      const parsed = parseDateKey(event.date);
      if (parsed) keys.add(formatDateKey(startOfMondayWeek(parsed)));
    }
    return Array.from(keys).sort();
  }, [events]);

  const selectedWeekEvents = useMemo(() => {
    const start = parseDateKey(selectedWeekStart) || startOfMondayWeek(new Date());
    return weekDayLabels.map((weekday, index) => {
      const date = formatDateKey(addDays(start, index));
      const items = events.filter((event) => event.date === date && ["talk", "screening", "game", "announcement"].includes(event.type));
      return { date, weekday, items, emptyLabel: index >= 5 ? "休息" as const : "无消息" as const };
    });
  }, [events, selectedWeekStart]);

  const searchResults = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return [] as SiteWorkspaceEvent[];
    return events.filter((event) => eventSearchText(event).includes(keyword)).slice(0, 18);
  }, [events, query]);

  const upcomingNotifications = useMemo(() => {
    const today = formatDateKey(new Date());
    return events.filter((event) => event.pinned || (event.date && event.date >= today)).slice(0, 8);
  }, [events]);

  const stats = [
    { label: "杂谈录像", value: talks.archive.length, href: "#talks", icon: Video },
    { label: "片源库", value: screeningsLibrary.items.length, href: "#screenings", icon: Clapperboard },
    { label: "游戏库", value: gaming.library?.length || 0, href: "#game-library", icon: Gamepad2 },
    { label: "图库作品", value: plaza.souls.filter((item) => item.visibility === "visible").length, href: "#plaza", icon: Image },
    { label: "文章", value: posts.length, href: "#posts", icon: Newspaper }
  ];

  const jumpLinks = [
    { label: "杂谈录像库", href: "#talks", icon: Video },
    { label: "放映会片源库", href: "#screenings", icon: Film },
    { label: "游戏库", href: "#game-library", icon: Gamepad2 },
    { label: "图库", href: "#plaza", icon: Image },
    { label: "文章", href: "#posts", icon: Newspaper },
    { label: "意见反馈", href: "#about", icon: Bell },
    { label: "更新记录", href: "#changelog", icon: Activity }
  ];

  const latestEvents = events.slice(0, 12);
  const roleLabel = user?.role === "owner" ? "站主" : user?.role === "admin" ? "管理员" : user ? "普通用户" : "访客";

  return (
    <div className="min-h-screen overflow-y-auto bg-[#fbfaf8] px-3 py-3 text-foreground dark:bg-zinc-950 md:px-4 md:py-4">
      <div className="mx-auto grid max-w-[1500px] gap-3 lg:h-[calc(100vh-32px)] lg:grid-cols-[35%_1fr] lg:overflow-hidden">
        <section className="grid gap-3 lg:grid-rows-[42%_1fr] lg:overflow-hidden">
          <Panel title="站点动态提醒与公告" icon={Megaphone} count={latestEvents.length}>
            <div className="space-y-2">
              {latestEvents.length ? latestEvents.map((event) => <div key={event.id}><EventRow event={event} /></div>) : <EmptyState text="暂无站点动态。" />}
            </div>
          </Panel>

          <Panel title="通知" icon={Bell} count={upcomingNotifications.length}>
            <div className="space-y-2">
              {upcomingNotifications.length ? upcomingNotifications.map((event) => <div key={`notice-${event.id}`}><EventRow event={event} compact /></div>) : <EmptyState text="本周暂无通知。" />}
            </div>
          </Panel>
        </section>

        <section className="grid gap-3 lg:grid-rows-[58%_1fr] lg:overflow-hidden">
          <Panel
            title="全站可视化"
            icon={Database}
            actions={canEditWorkspace ? <a href="#workspace" className="rounded-full bg-[#abc378] px-3 py-1.5 text-xs font-black text-[#1a1a1a]">进入管理后台</a> : <span className="rounded-full bg-muted px-3 py-1.5 text-xs font-black text-muted-foreground">{roleLabel}</span>}
          >
            <div className="space-y-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="搜索杂谈、电影动画、游戏、图库、文章..."
                  className="h-11 w-full rounded-2xl border border-border bg-background pl-10 pr-3 text-sm font-bold outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                />
              </div>

              {query.trim() ? (
                <div className="grid gap-2 md:grid-cols-2">
                  {searchResults.length ? searchResults.map((event) => <div key={`search-${event.id}`}><EventRow event={event} compact /></div>) : <EmptyState text="没有匹配内容。" />}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
                    {stats.map((item) => {
                      const Icon = item.icon;
                      return (
                        <a key={item.label} href={item.href} className="rounded-2xl border border-border bg-background p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-muted-foreground">{item.label}</span>
                            <Icon className="size-4 text-primary" />
                          </div>
                          <div className="mt-2 text-3xl font-black tracking-tight">{item.value}</div>
                        </a>
                      );
                    })}
                  </div>

                  <div className="grid gap-2 md:grid-cols-3">
                    <FeatureCard title="最近杂谈" desc={talks.archive[0]?.title || talks.live?.title || "暂无杂谈"} href="#talks" />
                    <FeatureCard title="下次放映" desc={screeningsNext.movies?.map((movie) => movie.title).join(" / ") || "待补充"} href="#screenings" />
                    <FeatureCard title="正在记录" desc={(gaming.library || []).find((game) => game.status === "playing")?.title || gaming.currentGameTitle || "暂无游戏记录"} href="#games" />
                  </div>
                </>
              )}

              <div className="flex flex-wrap gap-2">
                {jumpLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a key={item.label} href={item.href} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-2 text-xs font-black transition-colors hover:border-primary/40 hover:text-primary">
                      <Icon className="size-3.5" /> {item.label}
                    </a>
                  );
                })}
              </div>
            </div>
          </Panel>

          <Panel title="本周时间表" icon={CalendarDays} actions={<span className="text-xs font-black text-muted-foreground">{weekLabel(selectedWeekStart)}</span>}>
            <div className="space-y-4">
              <div className="grid gap-2 md:grid-cols-7">
                {selectedWeekEvents.map((day) => (
                  <div key={day.date} className="min-h-[150px] rounded-2xl border border-border bg-background p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-black text-muted-foreground">{day.weekday}</div>
                        <div className="text-sm font-black">{day.date.slice(5)}</div>
                      </div>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-black text-muted-foreground">{day.items.length}</span>
                    </div>
                    <div className="mt-3 space-y-2">
                      {day.items.length ? day.items.map((event) => <div key={`${day.date}-${event.id}`}><ScheduleChip event={event} /></div>) : (
                        <div className="rounded-xl border border-dashed border-border bg-muted/30 px-3 py-5 text-center text-xs font-bold text-muted-foreground">{day.emptyLabel}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="overflow-x-auto rounded-2xl border border-border bg-background p-2">
                <div className="flex min-w-max items-center gap-2">
                  {weekStarts.map((weekStart) => {
                    const active = weekStart === selectedWeekStart;
                    const count = events.filter((event) => {
                      const parsed = parseDateKey(event.date);
                      return parsed && formatDateKey(startOfMondayWeek(parsed)) === weekStart;
                    }).length;
                    return (
                      <button
                        key={weekStart}
                        type="button"
                        onClick={() => setSelectedWeekStart(weekStart)}
                        className={cn("relative rounded-xl border px-4 py-2 text-left transition-colors", active ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted")}
                      >
                        <div className="text-xs font-black">{weekLabel(weekStart)}</div>
                        <div className="mt-0.5 text-[11px] font-bold text-muted-foreground">{count ? `${count} 条动态` : "空周目"}</div>
                        {active ? <motion.div layoutId="site-week-rail" className="absolute inset-x-3 -bottom-0.5 h-1 rounded-full bg-primary" /> : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </Panel>
        </section>
      </div>
    </div>
  );
}

function Panel({ title, icon: Icon, count, actions, children }: { title: string; icon: typeof Bell; count?: number; actions?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex min-h-[320px] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm dark:bg-zinc-950/90 dark:border-zinc-800 lg:min-h-0">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/20 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <Icon className="size-4 text-primary" />
          <h2 className="truncate text-sm font-black tracking-tight">{title}</h2>
          {typeof count === "number" ? <span className="rounded-full bg-background px-2 py-0.5 text-[11px] font-black text-muted-foreground">{count}</span> : null}
        </div>
        {actions}
      </div>
      <div className="flex-1 overflow-y-auto p-3">{children}</div>
    </div>
  );
}

function EventRow({ event, compact = false }: { event: SiteWorkspaceEvent; compact?: boolean }) {
  const meta = typeMeta[event.type];
  const Icon = meta.icon;
  return (
    <a href={event.href || meta.href} className="block rounded-2xl border border-border bg-background p-3 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm">
      <div className="flex items-start gap-3">
        <div className={cn("rounded-xl border p-2", meta.tone)}><Icon className="size-4" /></div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-black">{event.title}</span>
            {event.pinned ? <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-black text-primary">置顶</span> : null}
          </div>
          <p className={cn("mt-1 text-xs font-medium leading-relaxed text-muted-foreground", compact && "line-clamp-1")}>{event.description}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-black text-muted-foreground">{meta.label}</span>
            {event.date ? <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-black text-muted-foreground">{event.date}</span> : null}
            {event.tags.slice(0, 3).map((tag) => <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-black text-muted-foreground">{tag}</span>)}
          </div>
        </div>
        <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground" />
      </div>
    </a>
  );
}

function ScheduleChip({ event }: { event: SiteWorkspaceEvent }) {
  const meta = typeMeta[event.type];
  return (
    <a href={event.href} className={cn("block rounded-xl border px-2.5 py-2 text-xs font-bold transition-colors hover:bg-muted", meta.tone)}>
      <div className="line-clamp-1">{meta.label} · {event.title}</div>
    </a>
  );
}

function FeatureCard({ title, desc, href }: { title: string; desc: string; href: string }) {
  return (
    <a href={href} className="rounded-2xl border border-border bg-background p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40">
      <div className="flex items-center gap-2 text-xs font-black text-primary"><Sparkles className="size-3.5" /> {title}</div>
      <div className="mt-2 line-clamp-2 text-sm font-bold leading-relaxed text-foreground">{desc}</div>
    </a>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-border bg-background px-4 py-8 text-center text-sm font-bold text-muted-foreground">{text}</div>;
}
