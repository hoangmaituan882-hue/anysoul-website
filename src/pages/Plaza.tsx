import Search from "../components/icons/magnifier-icon";
import Sparkles from "../components/icons/sparkles-icon";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";

import { cn } from "../lib/utils";
import { useThemeLanguage } from "../contexts/ThemeLanguageContext";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { motion } from "motion/react";
import { SoulImageCard } from "../components/SoulImageCard";
import { PlazaContributionPanel } from "../components/PlazaContributionPanel";
import { useContent } from "../content/useContent";
import { defaultPlazaContent } from "../content/defaults/plaza";
import type { PlazaContent, PlazaSoulItem } from "../content/types";

const visibleSoul = (soul: PlazaSoulItem) => soul.visibility === "visible";

export function Plaza() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSort, setActiveSort] = useLocalStorage("plaza-activeSort", "default");
  const [infoFilter, setInfoFilter] = useLocalStorage("plaza-infoFilter", "all");
  const [activeTag, setActiveTag] = useLocalStorage("plaza-activeTag", "all");
  const plaza = useContent<PlazaContent>("plaza.main", defaultPlazaContent);
  const { t } = useThemeLanguage();

  const SORT_OPTIONS = [
    { id: "default", label: t("plaza.filter.default") },
    { id: "hot", label: t("plaza.filter.hot") },
    { id: "new", label: t("plaza.filter.new") }
  ];

  const INFO_OPTIONS = [
    { id: "all", label: "显示信息" },
    { id: "hidden", label: "隐藏信息" }
  ];

  const sortedSouls = useMemo(() => {
    let result = plaza.souls.filter(visibleSoul);

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => 
        (s.name || "").toLowerCase().includes(q) || 
        (s.author || "").toLowerCase().includes(q) ||
        (Array.isArray(s.tags) ? s.tags : []).some((t: string) => t.toLowerCase().includes(q))
      );
    }

    if (activeTag !== "all") {
      result = result.filter(s => (Array.isArray(s.tags) ? s.tags : []).includes(activeTag));
    }

    if (activeSort === "default") {
      result.sort((a, b) => Number(b.featured) - Number(a.featured) || (b.views || 0) - (a.views || 0) || (a.name || "").localeCompare(b.name || ""));
    } else if (activeSort === "hot") {
      result.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else if (activeSort === "new") {
      result.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        if (Number.isNaN(timeA)) return 1;
        if (Number.isNaN(timeB)) return -1;
        return timeB - timeA;
      });
    }

    return result;
  }, [activeSort, activeTag, plaza.souls, searchQuery]);

  const visibleSouls = useMemo(() => plaza.souls.filter(visibleSoul), [plaza.souls]);
  const visibleTags = useMemo(() => {
    const tagSet = new Set<string>();
    for (const soul of visibleSouls) {
      for (const tag of (Array.isArray(soul.tags) ? soul.tags : [])) {
        const trimmed = String(tag).trim();
        if (trimmed) tagSet.add(trimmed);
      }
    }
    return Array.from(tagSet).sort();
  }, [visibleSouls]);

  const tags = useMemo(() => {
    if (plaza.tags.length > 0) {
      const unified = Array.from(new Set(plaza.tags.map((t: string) => String(t).trim()).filter(Boolean)));
      return unified.length > 0 ? unified : visibleTags;
    }
    return visibleTags;
  }, [plaza.tags, visibleTags]);

  // reset activeTag if it's no longer in the current tags list
  if (activeTag !== "all" && !tags.includes(activeTag)) {
    setActiveTag("all");
  }

  const BATCH_SIZE = 24;
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const visibleSoulsSlice = useMemo(() => sortedSouls.slice(0, visibleCount), [sortedSouls, visibleCount]);
  const hasMore = visibleCount < sortedSouls.length;

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, sortedSouls.length));
  }, [sortedSouls.length]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { rootMargin: "400px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  // reset visibleCount when filter/sort/search changes
  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [searchQuery, activeSort, activeTag]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-black text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" /> {t("plaza.tab.souls")}
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-foreground sm:text-4xl">{t("plaza.title")}</h1>
        </div>
        <p className="text-sm font-bold text-muted-foreground">{sortedSouls.length} {t("plaza.count")}</p>
      </div>

      <div className="mb-6 rounded-2xl border border-border bg-card p-3 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t("plaza.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm font-bold outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex rounded-xl border border-border bg-muted/50 p-0.5">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setActiveSort(opt.id)}
                  className={cn("relative z-10 h-8 rounded-lg px-3 text-xs font-bold transition-colors", activeSort === opt.id ? "text-foreground" : "text-muted-foreground hover:text-foreground")}
                >
                  {activeSort === opt.id && <motion.div layoutId="activeSort" className="absolute inset-0 z-[-1] rounded-lg bg-background shadow-sm" transition={{ type: "spring", stiffness: 400, damping: 25 }} />}
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="flex rounded-xl border border-border bg-muted/50 p-0.5">
              {INFO_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setInfoFilter(opt.id)}
                  className={cn("relative z-10 h-8 rounded-lg px-3 text-xs font-bold transition-colors", infoFilter === opt.id ? "text-foreground" : "text-muted-foreground hover:text-foreground")}
                >
                  {infoFilter === opt.id && <motion.div layoutId="infoFilter" className="absolute inset-0 z-[-1] rounded-lg bg-background shadow-sm" transition={{ type: "spring", stiffness: 400, damping: 25 }} />}
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          <button onClick={() => setActiveTag("all")} className={cn("shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors", activeTag === "all" ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground hover:text-foreground")}>{t("plaza.filter.all")}</button>
          {tags.map(tag => (
            <button key={tag} onClick={() => setActiveTag(tag)} className={cn("shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors", activeTag === tag ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground hover:text-foreground")}>
              {tag}
            </button>
          ))}
        </div>
      </div>

      <PlazaContributionPanel visibleSouls={visibleSouls} />

      <div className="columns-1 gap-4 space-y-4 sm:columns-2 md:columns-3 xl:columns-4">
        {visibleSoulsSlice.map((soul, idx) => (
          <SoulImageCard key={soul.id} soul={soul} infoFilter={infoFilter} fetchPriority={idx < 6 ? "high" : "auto"} />
        ))}
      </div>

      <div ref={sentinelRef} className="flex items-center justify-center py-8">
        {hasMore ? (
          <div className="flex flex-col items-center gap-3">
            <div className="size-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
            <span className="text-xs font-bold text-muted-foreground">加载更多...</span>
          </div>
        ) : sortedSouls.length > 0 ? (
          <span className="text-xs font-bold text-muted-foreground">已展示全部 {sortedSouls.length} 张作品</span>
        ) : null}
      </div>
    </div>
  );
}
