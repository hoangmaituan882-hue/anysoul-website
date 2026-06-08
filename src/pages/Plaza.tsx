import { useState, useMemo } from "react";
import { BookOpen, Search, Sparkles, Bookmark, Users, Heart, Eye, Crown, HeartPulse, Clock } from "lucide-react";
import { cn } from "../lib/utils";
import { useThemeLanguage } from "../contexts/ThemeLanguageContext";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { motion, AnimatePresence } from "motion/react";
import { SoulImageCard, Soul } from "../components/SoulImageCard";
import { useContent } from "../content/useContent";
import { defaultPlazaContent } from "../content/defaults/plaza";
import type { PlazaContent, PlazaSoulItem } from "../content/types";

const visibleSoul = (soul: PlazaSoulItem) => soul.visibility === "visible";

export function Plaza() {
  const [activeTab, setActiveTab] = useLocalStorage("plaza-activeTab", "souls");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSort, setActiveSort] = useLocalStorage("plaza-activeSort", "default");
  const [infoFilter, setInfoFilter] = useLocalStorage("plaza-infoFilter", "all");
  const [activeTag, setActiveTag] = useLocalStorage("plaza-activeTag", "all");
  const plaza = useContent<PlazaContent>("plaza.main", defaultPlazaContent);
  const { t } = useThemeLanguage();

  const TABS = [
    { id: "souls", label: t("plaza.tab.souls"), icon: Sparkles },
    { id: "moments", label: t("plaza.tab.moments"), icon: Bookmark },
    { id: "groups", label: t("plaza.tab.groups"), icon: Users },
  ];

  const SORT_OPTIONS = [
    { id: "default", label: t("plaza.filter.default") },
    { id: "hot", label: t("plaza.filter.hot") },
    { id: "new", label: t("plaza.filter.new") }
  ];

  const INFO_OPTIONS = [
    { id: "all", label: "全部" },
    { id: "hidden", label: "隐藏" }
  ];

  const sortedSouls = useMemo(() => {
    let result = plaza.souls.filter(visibleSoul);

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => 
        s.name.toLowerCase().includes(q) || 
        s.author.toLowerCase().includes(q) ||
        s.tags.some((t: string) => t.toLowerCase().includes(q))
      );
    }

    if (activeTag !== "all") {
      result = result.filter(s => s.tags.includes(activeTag));
    }

    if (activeSort === "default") {
      result.sort((a, b) => Number(b.featured) - Number(a.featured) || b.views - a.views || a.name.localeCompare(b.name));
    } else if (activeSort === "hot") {
      result.sort((a, b) => b.likes - a.likes);
    } else if (activeSort === "new") {
      result.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
    }

    return result;
  }, [activeSort, activeTag, plaza.souls, searchQuery]);

  const tags = plaza.tags.length > 0 ? plaza.tags : Array.from(new Set(plaza.souls.flatMap((s) => s.tags)));

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 md:py-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          {t("plaza.title")}
          <a href="#" className="inline-flex items-center justify-center size-10 rounded-full text-primary hover:text-foreground hover:bg-muted transition-colors">
            <BookOpen className="size-5" />
          </a>
        </h1>
      </div>

      <div className="flex gap-2 flex-col">
        <div className="inline-flex items-stretch justify-start w-full overflow-x-auto border-b border-border/70 mb-6">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative inline-flex items-center justify-center flex-col gap-1.5 min-w-[92px] px-3 py-3 text-sm font-medium transition-colors border-b-[3px]",
                  isActive 
                    ? "border-primary text-primary" 
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-5" />
                <span className="text-xs">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {activeTab === "souls" && (
          <div className="w-full">
            <div className="flex items-center gap-2 w-full max-w-xs mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input 
                  type="text"
                  placeholder={t("plaza.search")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-md border bg-transparent pl-8 pr-3 py-1 text-sm h-9 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              <button className="inline-flex items-center justify-center rounded-md text-sm font-medium border bg-background hover:bg-accent h-9 px-3">
                {t("plaza.btn.search")}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="flex rounded-lg border bg-muted/50 p-0.5 relative">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setActiveSort(opt.id)}
                    className={cn(
                      "relative px-4 py-1.5 text-sm rounded-md font-medium transition-colors z-10",
                      activeSort === opt.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {activeSort === opt.id && (
                      <motion.div
                        layoutId="activeSort"
                        className="absolute inset-0 bg-background shadow-sm rounded-md z-[-1]"
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      />
                    )}
                    {opt.label}
                  </button>
                ))}
              </div>
              
              <div className="flex rounded-lg border bg-muted/50 p-0.5 relative">
                {INFO_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setInfoFilter(opt.id)}
                    className={cn(
                      "relative px-4 py-1.5 text-sm rounded-md font-medium transition-colors z-10",
                      infoFilter === opt.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {infoFilter === opt.id && (
                      <motion.div
                        layoutId="infoFilter"
                        className="absolute inset-0 bg-background shadow-sm rounded-md z-[-1]"
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      />
                    )}
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-6">
              <button onClick={() => setActiveTag("all")} className={cn("px-3 py-1 text-xs rounded-full border transition-colors", activeTag === "all" ? "bg-primary text-primary-foreground" : "hover:bg-accent text-foreground")}>{t("plaza.filter.all")}</button>
              {tags.map(tag => (
                <button key={tag} onClick={() => setActiveTag(tag)} className={cn("px-3 py-1 text-xs rounded-full border transition-colors text-foreground", activeTag === tag ? "bg-primary text-primary-foreground" : "hover:bg-accent")}>
                  {tag}
                </button>
              ))}
            </div>

            <p className="text-xs text-muted-foreground mb-4">{sortedSouls.length} {t("plaza.count")}</p>

            <div className="columns-1 sm:columns-2 md:columns-3 xl:columns-4 gap-4 space-y-4">
              {sortedSouls.map(soul => (
                <SoulImageCard key={soul.id} soul={soul as Soul} infoFilter={infoFilter} />
              ))}
            </div>
          </div>
        )}

        {activeTab === "moments" && (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            {t("plaza.dev.moments")}
          </div>
        )}

        {activeTab === "groups" && (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            {t("plaza.dev.groups")}
          </div>
        )}
      </div>
    </div>
  );
}
