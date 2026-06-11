import { useEffect, useMemo, useState } from "react";
import { Search, Bell, ChevronDown, Play, ArrowRight, Flame, ChevronLeft, ChevronRight, Clock, User, X, BookOpen, Star, Eye, Crown, LayoutGrid, Heart, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useContent } from "../content/useContent";
import { defaultGamingMain } from "../content/defaults/gaming";
import type { GamingCategory, GamingExploreItem, GamingHeroGame, GamingLibraryItem, GamingMainContent, GamingPlayRecord, GamingRecentGame } from "../content/types";

const tagPalette = [
  "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400",
  "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400",
  "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400",
  "bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400",
  "bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-400",
  "bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400"
];

const barPalette = ["bg-green-500", "bg-blue-500", "bg-amber-500", "bg-purple-500", "bg-teal-500", "bg-rose-500"];

function normalizeGamingContent(content: GamingMainContent): Required<Pick<GamingMainContent, "heroGames" | "categories" | "recentGames">> & GamingMainContent {
  const legacyRecent = content.recentGames?.length ? content.recentGames : defaultGamingMain.recentGames;
  const library = content.library?.length
    ? content.library
    : legacyRecent.map((game, index) => recentToLibrary(game, index));
  const heroGames = content.heroGames?.length
    ? content.heroGames
    : library.slice(0, 3).map((game) => libraryToHero(game));
  const categories = content.categories?.length
    ? content.categories
    : buildCategories(library);
  const recentGames = library.map((game, index) => libraryToRecent(game, index));

  return {
    ...defaultGamingMain,
    ...content,
    heroGames,
    categories,
    recentGames,
    library,
    exploreItems: content.exploreItems?.length ? content.exploreItems : library.slice(0, 6).map((game, index) => libraryToExplore(game, index)),
    currentGameId: content.currentGameId || library[0]?.id,
    streamGameId: content.streamGameId || content.currentGameId || library[0]?.id
  };
}

function recentToLibrary(game: GamingRecentGame, index: number): GamingLibraryItem {
  return {
    id: `legacy-game-${index}`,
    title: game.title,
    subtitle: game.desc,
    platform: "未设置",
    genre: game.tag1.text,
    mode: game.desc,
    status: index === 0 ? "playing" : "archived",
    tags: [game.tag1.text, game.tag2?.text].filter(Boolean) as string[],
    coverUrl: game.img,
    heroImage: game.img,
    rating: game.rating,
    totalHours: "",
    lastPlayedAt: game.time,
    description: game.review || "从旧版游戏回内容迁移的游戏条目。",
    review: game.review,
    playRecords: [{ date: game.time, durationHours: 1 }]
  };
}

function libraryToHero(game: GamingLibraryItem): GamingHeroGame {
  return {
    title: `${game.subtitle || game.genre}\n${game.title}`,
    date: `${game.status === "playing" ? "正在游玩" : "最近游玩"} ${game.lastPlayedAt || "待记录"}`,
    img: game.heroImage || game.coverUrl
  };
}

function libraryToRecent(game: GamingLibraryItem, index: number): GamingRecentGame {
  return {
    title: game.title,
    tag1: { text: game.genre || game.tags[0] || "GAME", bg: tagPalette[index % tagPalette.length] },
    tag2: game.status === "playing" ? { text: "进行中", bg: "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400" } : undefined,
    barColor: barPalette[index % barPalette.length],
    time: game.lastPlayedAt || "待记录",
    desc: game.mode || game.platform,
    img: game.coverUrl,
    rating: game.rating,
    review: game.review || game.description
  };
}

function libraryToExplore(game: GamingLibraryItem, index: number): GamingExploreItem {
  return {
    id: `explore-${game.id}`,
    gameId: game.id,
    title: game.title,
    author: "AnySoul",
    description: game.description,
    coverUrl: game.coverUrl,
    tags: game.tags,
    stars: Math.max(1, 5 - (index % 3)),
    views: 36 + index * 22,
    badge: game.status === "playing" ? "精选" : undefined
  };
}

function buildCategories(library: GamingLibraryItem[]): GamingCategory[] {
  const groups = Array.from(new Map(library.map((game) => [game.genre || "游戏", game])).values()).slice(0, 3);
  return groups.map((game) => ({ title: game.genre || "游戏", subtitle: game.platform, img: game.coverUrl }));
}

function getGameImage(game?: GamingLibraryItem) {
  return game?.heroImage || game?.coverUrl || defaultGamingMain.streamImage;
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

function isLinkedGame(game: GamingLibraryItem) {
  const text = [game.genre, game.mode, ...(game.tags || [])].filter(Boolean).join(" ");
  return (game.tags || []).includes("联动游戏") || text.includes("联动") || text.includes("联机") || text.includes("合作");
}

function sortPlayRecords(records: GamingPlayRecord[]) {
  return [...records].sort((a, b) => b.date.localeCompare(a.date));
}

function buildHeatmap(records: GamingPlayRecord[]) {
  const map = new Map(records.map((record) => [record.date, Math.min(4, Math.max(1, Math.ceil(Number(record.durationHours || 0))))]));
  const today = new Date();
  return Array.from({ length: 84 }).map((_, index) => {
    const day = new Date(today);
    day.setDate(today.getDate() - (83 - index));
    const date = day.toISOString().slice(0, 10);
    return { date, intensity: map.get(date) || 0 };
  });
}

export function Gaming() {
  const content = normalizeGamingContent(useContent("gaming.main", defaultGamingMain));
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const library = content.library || [];
  const currentGame = library.find((game) => game.id === content.currentGameId) || library[0];
  const streamGame = library.find((game) => game.id === content.streamGameId) || currentGame;
  const heroGames = content.heroGames.length ? content.heroGames : library.map(libraryToHero);
  const selectedGame = library.find((game) => game.id === selectedGameId) || null;
  const heatmap = useMemo(() => buildHeatmap(selectedGame?.playRecords || []), [selectedGame]);

  const filteredLibrary = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return library;
    return library.filter((game) => [
      game.title,
      game.subtitle,
      game.platform,
      game.genre,
      game.mode,
      game.status,
      ...game.tags
    ].filter(Boolean).join(" ").toLowerCase().includes(keyword));
  }, [library, query]);

  const exploreItems = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    const linkedGames = library.filter(isLinkedGame);
    const items = linkedGames.map((game, index) => libraryToExplore(game, index));
    if (!keyword) return items;
    return items.filter((item) => [item.title, item.author, item.description, ...(item.tags || [])].filter(Boolean).join(" ").toLowerCase().includes(keyword));
  }, [library, query]);

  useEffect(() => {
    if (!heroGames.length) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroGames.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroGames.length]);

  useEffect(() => {
    if (currentSlide >= heroGames.length) setCurrentSlide(0);
  }, [currentSlide, heroGames.length]);

  const totalGames = library.length;
  const plannedGames = library.filter((game) => game.status === "planned").length;
  const playingGames = library.filter((game) => game.status === "playing").length;
  const openGameLibrary = () => {
    window.location.hash = "#game-library";
  };

  if (!library.length && !heroGames.length) {
    return (
      <div className="mx-auto w-full max-w-[1400px] px-6 pb-16 pt-8">
        <div className="flex w-full max-w-sm flex-col gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={content.searchPlaceholder || "Search games..."}
              className="w-full rounded-full border border-border/60 bg-card/80 py-2.5 pl-10 pr-4 text-[15px] font-medium shadow-sm outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
        <div className="mt-8 rounded-[28px] border border-dashed border-border bg-card p-8 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex rounded-full bg-muted px-3 py-1 text-xs font-black text-muted-foreground">
                GAME LIBRARY
              </div>
              <h1 className="mt-4 text-2xl font-black tracking-tight">游戏内容等待发布</h1>
              <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground">
                后台发布游戏条目后，这里会恢复原来的轮播、分类、最近记录和联动游戏展示。
              </p>
            </div>
            <button
              onClick={openGameLibrary}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-bold shadow-sm transition-colors hover:bg-muted"
            >
              <LayoutGrid className="size-4" />
              游戏库
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const activeHero = heroGames[currentSlide] || heroGames[0] || libraryToHero(currentGame);

  return (
    <div className="max-w-[1400px] mx-auto w-full px-6 pb-16">
      <div className="flex flex-col md:flex-row gap-6 lg:gap-8 pt-8">
        {/* Left Column */}
        <div className="flex-1 flex flex-col gap-8 min-w-0">
        
        {/* Search */}
        <div className="w-full max-w-sm relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
          <input 
            type="text" 
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={content.searchPlaceholder || "搜索游戏..."}
            className="w-full bg-card/80 border border-border/60 rounded-full py-2.5 pl-10 pr-4 text-[15px] font-medium placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
          />
        </div>

        {/* Carousel Hero Card */}
        <div className="relative w-full rounded-[28px] border border-border overflow-hidden h-[280px] shadow-sm bg-card group">
           <AnimatePresence initial={false}>
             <motion.img 
               key={currentSlide}
               src={activeHero.img}
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               transition={{ duration: 0.8 }}
               className="absolute inset-0 w-full h-full object-cover opacity-90 mix-blend-overlay dark:mix-blend-normal dark:opacity-50"
             />
           </AnimatePresence>

           {/* Progress bar and indicators */}
           <div className="absolute top-4 left-0 right-0 px-6 flex justify-between items-center z-20">
             <div className="bg-red-500 text-white text-xs font-bold px-3 py-1 -rotate-12 rounded shadow-sm">RECORDING</div>
             <div className="flex gap-2">
               {heroGames.map((_, idx) => (
                 <div key={idx} className="h-1.5 w-12 bg-black/20 dark:bg-white/20 rounded-full overflow-hidden flex">
                   {currentSlide === idx && (
                     <motion.div 
                       key={`progress-${currentSlide}`}
                       initial={{ width: "0%" }}
                       animate={{ width: "100%" }}
                       transition={{ duration: 5, ease: "linear" }}
                       className="h-full bg-white dark:bg-primary shadow-sm"
                     />
                   )}
                   {idx < currentSlide && (
                     <div className="h-full w-full bg-white dark:bg-primary shadow-sm" />
                   )}
                 </div>
               ))}
             </div>
           </div>

           {/* Content */}
           <div className="absolute inset-x-0 bottom-0 p-8 flex flex-col justify-end z-10 pointer-events-none overflow-hidden h-[180px]">
             <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -30, opacity: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="text-foreground w-2/3"
                >
                  <h2 className="text-2xl md:text-3xl font-black mb-3 leading-tight tracking-tight whitespace-pre-line drop-shadow-md">
                    {activeHero.title}
                  </h2>
                  <div className="inline-flex">
                    <span className="text-sm font-bold text-foreground bg-background/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-border/50 shadow-sm">
                       {activeHero.date}
                    </span>
                  </div>
                </motion.div>
             </AnimatePresence>
           </div>
           
           {/* Controls (visible on hover) */}
           <button 
             onClick={() => setCurrentSlide(prev => (prev - 1 + heroGames.length) % heroGames.length)}
             className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-background/50 backdrop-blur opacity-0 group-hover:opacity-100 transition-all z-20 hover:bg-background/80 hover:scale-105 border border-border/50 text-foreground"
           >
             <ChevronLeft className="size-5" />
           </button>
           <button 
             onClick={() => setCurrentSlide(prev => (prev + 1) % heroGames.length)}
             className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-background/50 backdrop-blur opacity-0 group-hover:opacity-100 transition-all z-20 hover:bg-background/80 hover:scale-105 border border-border/50 text-foreground"
           >
             <ChevronRight className="size-5" />
           </button>
        </div>

        {/* Trending games */}
        <div className="flex flex-col gap-4 mt-2">
           <h3 className="text-xl font-bold flex items-center gap-2">游戏分类 <Flame className="size-5 text-orange-500 fill-orange-500" /></h3>
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
               {content.categories.slice(0, 3).map((category) => (
                 <button key={`${category.title}-${category.subtitle}`} onClick={() => { window.location.hash = `#game-library?category=${encodeURIComponent(category.title)}`; }} className="flex flex-col gap-2 group cursor-pointer text-left">
                    <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-card border border-border relative">
                       <img src={category.img} alt={category.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    </div>
                    <div>
                      <div className="font-bold text-foreground group-hover:text-primary transition-colors">{category.title}</div>
                      <div className="text-xs text-muted-foreground font-medium">{category.subtitle}</div>
                    </div>
                 </button>
               ))}
           </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-2">
            {/* Game Library Entry */}
            <button onClick={openGameLibrary} className="col-span-1 bg-card rounded-[24px] border border-border p-6 flex flex-col justify-between shadow-sm relative overflow-hidden group cursor-pointer text-left transition hover:-translate-y-0.5 hover:shadow-md">
               <h3 className="font-bold text-lg mb-2 z-10">游戏库<br/><span className="text-xl font-black tracking-widest">待玩清单</span> <ArrowRight className="inline-block ml-1 size-5 group-hover:translate-x-1 transition-transform" /></h3>
               <p className="z-10 text-sm font-medium leading-relaxed text-muted-foreground">观众查看主播游戏记录、待玩安排和联动游戏回归档。</p>
               <div className="mt-8 flex justify-center z-10">
                  <div className="size-24 bg-muted rounded-2xl flex items-center justify-center">
                     <span className="text-3xl">🎮</span>
                  </div>
               </div>
               <div className="mt-6 grid grid-cols-3 gap-2 z-10">
                  <div className="rounded-2xl bg-muted/60 p-3 text-center">
                    <div className="text-xl font-black">{totalGames}</div>
                    <div className="mt-1 text-[10px] font-bold text-muted-foreground">全部</div>
                  </div>
                  <div className="rounded-2xl bg-primary/10 p-3 text-center text-primary">
                    <div className="text-xl font-black">{plannedGames}</div>
                    <div className="mt-1 text-[10px] font-bold">待玩</div>
                  </div>
                  <div className="rounded-2xl bg-foreground/5 p-3 text-center">
                    <div className="text-xl font-black">{playingGames}</div>
                    <div className="mt-1 text-[10px] font-bold text-muted-foreground">记录中</div>
                  </div>
               </div>
               <div className="absolute -bottom-10 -right-10 size-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            </button>

            {/* Recent Plays */}
            <div className="col-span-1 md:col-span-2 bg-card rounded-[24px] border border-border p-6 shadow-sm">
               <h3 className="font-bold text-lg mb-4">主播最近记录</h3>
               <div className="flex flex-col gap-4">
                  {filteredLibrary.slice(0, 3).map((game) => (
                    <div key={game.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-xl transition-colors">
                       <div className="flex items-center gap-3 min-w-0">
                          <img src={game.coverUrl} alt={game.title} className="size-10 rounded-lg object-cover" />
                          <div className="flex min-w-0 flex-col">
                             <span className="font-bold text-[15px] truncate">{game.title}</span>
                             <span className="text-[11px] text-muted-foreground font-medium">{getGameStatusLabel(game.status)} / {game.genre} / {game.platform}</span>
                          </div>
                       </div>
                       <button onClick={() => setSelectedGameId(game.id)} className="px-5 py-1.5 border-2 border-border/80 rounded-xl font-bold text-[13px] hover:border-foreground transition-colors hover:bg-foreground hover:text-background shadow-sm">
                         查看
                       </button>
                    </div>
                  ))}
               </div>
            </div>
        </div>

      </div>

      {/* Right Sidebar */}
      <div className="w-full md:w-[320px] shrink-0 flex flex-col gap-6">
        
        {/* User Profile */}
        <div className="flex items-center justify-end gap-3 px-2">
           <button className="relative size-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors shadow-sm bg-card">
              <Bell className="size-[18px] text-muted-foreground" />
              <span className="absolute top-2 right-2.5 size-1.5 rounded-full bg-red-500" />
           </button>
           <div className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 py-1.5 px-2 rounded-full transition-colors font-bold">
              <span className="flex size-8 items-center justify-center rounded-full border border-border bg-primary/10 text-xs font-black text-primary">AS</span>
              <span>AnySoul</span>
              <ChevronDown className="size-4 text-muted-foreground" />
           </div>
        </div>

        {/* Right Nav / Content Box */}
        <div className="bg-card rounded-[28px] border border-border p-6 flex flex-col gap-8 shadow-sm flex-1">
           
           {/* Stream */}
           <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                 <h3 className="font-bold text-lg">{content.streamTitle || "Stream"}</h3>
                 <ChevronDown className="size-4 text-muted-foreground" />
              </div>
              <button onClick={() => streamGame && setSelectedGameId(streamGame.id)} className="relative w-full aspect-video rounded-xl overflow-hidden group cursor-pointer shadow-sm text-left">
                 <img src={getGameImage(streamGame)} alt={streamGame?.title || "Stream"} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                 <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="size-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                       <Play className="size-5 fill-black text-black ml-1" />
                    </div>
                 </div>
                 <div className="absolute bottom-3 left-3 right-3 rounded-xl bg-black/50 px-3 py-2 text-white backdrop-blur">
                   <div className="text-xs font-black uppercase tracking-wider text-white/70">记录中</div>
                   <div className="truncate text-sm font-black">{streamGame?.title || content.currentGameTitle}</div>
                 </div>
              </button>
           </div>

           <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                 <h3 className="font-bold text-lg">游戏库</h3>
                 <span className="text-xs font-bold text-muted-foreground">{filteredLibrary.length}</span>
              </div>
              <div className="flex flex-col gap-3">
                 {filteredLibrary.slice(0, 6).map((game, i) => (
                    <button key={game.id} onClick={() => setSelectedGameId(game.id)} className="flex items-center gap-3 group text-left">
                       <div className="relative size-12 rounded-xl overflow-hidden shrink-0 border border-border bg-muted">
                          <img src={game.coverUrl} alt={game.title} className="size-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          <div className={`absolute left-0 top-0 bottom-0 w-[4px] ${barPalette[i % barPalette.length]}`}></div>
                       </div>
                       <div className="flex flex-col gap-1 min-w-0 flex-1">
                          <span className="font-bold text-foreground text-[14px] leading-tight truncate">{game.title}</span>
                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground whitespace-nowrap">
                             <span className="flex items-center gap-1.5"><Clock className="size-3" /> {game.status === "planned" ? "待玩" : game.lastPlayedAt || "待记录"}</span>
                             <div className="w-[1px] h-3 bg-border"></div>
                             <span className="flex items-center gap-1.5"><User className="size-3" /> {game.mode}</span>
                          </div>
                       </div>
                    </button>
                 ))}
                 
                 <div className="flex justify-center mt-2">
                   <button onClick={openGameLibrary} className="group relative inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 hover:bg-primary/10 backdrop-blur-md shadow-[0_0_20px_rgba(164,198,57,0.1)] hover:shadow-[0_0_25px_rgba(164,198,57,0.2)] transition-all cursor-pointer">
                     <span className="relative flex h-2 w-2">
                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#b4c053] opacity-75"></span>
                       <span className="relative inline-flex rounded-full h-2 w-2 bg-[#b4c053]"></span>
                     </span>
                     <span className="text-[12px] font-semibold text-foreground transition-colors group-hover:text-primary">查看全部</span>
                     <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-primary transition-colors group-hover:translate-x-0.5" />
                   </button>
                 </div>
              </div>
           </div>

        </div>
      </div>
      </div>


      {/* Explore Section */}
      <div className="mt-8 scroll-mt-24 bg-[#f5f5f5] dark:bg-card rounded-[28px] border-[3px] border-[#e5e5e5] dark:border-border p-6 md:p-8 shadow-sm flex flex-col gap-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-black flex items-center gap-2 tracking-tight">探索联动游戏回里的游戏 <BookOpen className="size-6 text-[#b4c053]" /></h2>
            <p className="text-muted-foreground mt-2 text-[14px]">从游戏库读取主播记录、待玩清单和联动回顾。</p>
          </div>
          <button onClick={() => { window.location.hash = "#game-library?tag=%E8%81%94%E5%8A%A8%E6%B8%B8%E6%88%8F"; }} className="flex items-center gap-2 px-4 py-2 border border-border rounded-full hover:bg-muted transition-colors font-bold text-sm shadow-sm bg-background">
            <LayoutGrid className="size-4" /> 浏览全部
          </button>
        </div>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {!exploreItems.length && (
            <div className="w-full rounded-[24px] border border-dashed border-border bg-card p-6 text-center text-sm font-bold text-muted-foreground">
              暂无联动游戏，给游戏库条目添加“联动游戏”标签后会自动出现在这里。
            </div>
          )}
          {exploreItems.map((item) => {
            const linkedGame = item.gameId ? library.find((game) => game.id === item.gameId) : undefined;
            return (
              <button key={item.id} onClick={() => linkedGame && setSelectedGameId(linkedGame.id)} className="relative w-full rounded-[24px] border border-border p-4 break-inside-avoid flex flex-col gap-4 overflow-hidden group hover:shadow-md transition-shadow bg-card text-left">
                {item.badge && (
                  <div className="absolute top-4 right-4 z-10 bg-[#b4c053] text-white text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                    <Crown className="size-3" /> {item.badge}
                  </div>
                )}
                <div className="w-full aspect-[4/3] rounded-2xl relative flex items-center justify-center overflow-hidden bg-muted">
                  <img src={item.coverUrl} className="absolute inset-0 w-full h-full object-cover opacity-90 mix-blend-overlay dark:mix-blend-normal" />
                  <img src={item.coverUrl} alt={item.title} className="size-16 rounded-full border-4 border-card bg-background relative z-10 object-cover transition-transform group-hover:scale-105" />
                  {linkedGame?.lastPlayedAt && (
                     <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-md rounded-full px-3 py-1 text-[10px] font-bold text-muted-foreground flex items-center gap-1.5 whitespace-nowrap shadow-sm border border-border/50">
                       <Heart className="size-3 text-rose-500 fill-rose-500" /> 上次活跃于 {linkedGame.lastPlayedAt}
                     </div>
                  )}
                </div>
                <div className="flex flex-col text-center px-1">
                   <h3 className="font-bold text-[18px]">{item.title}</h3>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground font-medium px-1 mt-2">
                   <span>by {item.author}</span>
                   <div className="flex gap-3">
                      <span className="flex items-center gap-1"><Star className="size-3" /> {item.stars}</span>
                      <span className="flex items-center gap-1"><Eye className="size-3" /> {item.views}</span>
                   </div>
                </div>
                {(item.description || item.tags.length > 0) && (
                   <div className="flex flex-col gap-3 px-1 mt-1">
                      {item.description && <p className="text-[13px] text-muted-foreground line-clamp-3 leading-relaxed">{item.description}</p>}
                      {item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                           {item.tags.map((tag) => (
                             <span key={tag} className="px-2.5 py-1 bg-muted/60 text-muted-foreground rounded-md text-[11px] font-bold">{tag}</span>
                           ))}
                        </div>
                      )}
                   </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Game Details Modal */}
      <AnimatePresence>
        {selectedGame && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setSelectedGameId(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-3xl max-h-[90vh] bg-card rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-border"
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedGameId(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 backdrop-blur-md hover:bg-black/70 transition-colors text-white z-20"
              >
                <X className="size-4" />
              </button>

              <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col min-h-0">
                {/* Hero Header */}
                <div className="relative h-56 sm:h-72 w-full shrink-0">
                  <img 
                    src={getGameImage(selectedGame)}
                    alt={selectedGame.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 z-10 w-2/3">
                    <div className="flex items-center gap-2 mb-3">
                       <span className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-[12px] font-bold uppercase tracking-wider ${tagPalette[0]} border border-[currentColor]/20 shadow-sm backdrop-blur-sm bg-opacity-80`}>
                          {selectedGame.genre}
                       </span>
                    </div>
                    <h2 className="text-2xl sm:text-4xl font-black tracking-tight drop-shadow-md">{selectedGame.title}</h2>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col gap-8">
                  {/* Stats Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="bg-muted/30 rounded-2xl p-4 border border-border flex flex-col hover:border-[#b4c053]/50 transition-colors cursor-default">
                      <span className="text-muted-foreground text-[11px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5 whitespace-nowrap"><Clock className="size-3" /> 最近记录</span>
                       <span className="text-xl font-black">{selectedGame.status === "planned" ? "待玩" : selectedGame.lastPlayedAt || "待记录"}</span>
                    </div>
                    <div className="bg-muted/30 rounded-2xl p-4 border border-border flex flex-col hover:border-[#b4c053]/50 transition-colors cursor-default">
                      <span className="text-muted-foreground text-[11px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5 whitespace-nowrap"><Play className="size-3" /> 累计时长</span>
                      <span className="text-xl font-black">{selectedGame.totalHours || "待记录"}</span>
                    </div>
                    <div className="bg-muted/30 rounded-2xl p-4 border border-border flex flex-col col-span-2 sm:col-span-1 hover:border-[#b4c053]/50 transition-colors cursor-default">
                      <span className="text-muted-foreground text-[11px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5 whitespace-nowrap"><Flame className="size-3" /> 综合评价</span>
                      <span className="text-xl font-black text-[#b4c053]">{selectedGame.rating || "待评分"}</span>
                    </div>
                  </div>

                  {/* Heatmap Area */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-lg">近期活跃度</h3>
                      <span className="text-xs text-muted-foreground font-medium px-2 py-1 bg-muted rounded-md">近 3 个月</span>
                    </div>
                    <div className="bg-muted/20 border border-border p-5 rounded-2xl">
                      <div className="flex gap-1.5 flex-wrap">
                        {heatmap.map(({ date, intensity }) => {
                          let bgClass = "bg-muted";
                          if (intensity === 1) bgClass = "bg-[#b4c053]/30";
                          if (intensity === 2) bgClass = "bg-[#b4c053]/60";
                          if (intensity === 3) bgClass = "bg-[#b4c053]/80";
                          if (intensity === 4) bgClass = "bg-[#b4c053]";
                          return (
                            <div 
                              key={date}
                              className={`size-[15.5px] rounded-[3px] ${bgClass} transition-colors cursor-help hover:ring-2 hover:ring-foreground/30`}
                              title={`${date}: ${intensity ? `${intensity} 级活跃` : "无记录"}`}
                            />
                          );
                        })}
                      </div>
                      <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground font-medium">
                         <span>Less</span>
                         <div className="flex gap-1">
                           <div className="size-3 rounded-[2px] bg-muted" />
                           <div className="size-3 rounded-[2px] bg-[#b4c053]/30" />
                           <div className="size-3 rounded-[2px] bg-[#b4c053]/60" />
                           <div className="size-3 rounded-[2px] bg-[#b4c053]/80" />
                           <div className="size-3 rounded-[2px] bg-[#b4c053]" />
                         </div>
                         <span>More</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <h3 className="font-bold text-lg">主播游玩时间轴</h3>
                    <div className="space-y-4 rounded-2xl border border-border bg-muted/20 p-5">
                      {sortPlayRecords(selectedGame.playRecords || []).length ? sortPlayRecords(selectedGame.playRecords || []).map((record, index, records) => (
                        <div key={`${record.date}-${index}`} className="relative pl-6">
                          <div className="absolute left-1 top-1.5 size-3 rounded-full border-2 border-[#b4c053] bg-card" />
                          {index < records.length - 1 && <div className="absolute bottom-[-18px] left-[9px] top-5 w-px bg-border" />}
                          <div className="rounded-2xl border border-border bg-card p-4">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <div className="text-sm font-black">{record.date}</div>
                                <div className="text-xs font-bold text-muted-foreground">{record.durationHours || 0}h · {record.note || "暂无备注"}</div>
                              </div>
                              {record.href && (
                                <a href={record.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-[#b4c053]/15 px-3 py-1.5 text-xs font-black text-[#6f7d1f] transition hover:bg-[#b4c053]/25 dark:text-[#d7e675]">
                                  查看记录 <ExternalLink className="size-3.5" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      )) : (
                        <div className="rounded-2xl border border-dashed border-border bg-card p-5 text-sm font-bold text-muted-foreground">暂无游玩记录</div>
                      )}
                    </div>
                  </div>

                  {/* Review / About */}
                  <div className="flex flex-col gap-3">
                    <h3 className="font-bold text-lg">关于这款游戏</h3>
                    <p className="text-muted-foreground text-[14.5px] leading-relaxed bg-muted/20 border border-border p-5 rounded-2xl hover:border-foreground/20 transition-colors">
                      {selectedGame.review || selectedGame.description}
                    </p>
                  </div>

                  {(selectedGame.streamUrl || selectedGame.videoUrl) && (
                    <div className="flex flex-col gap-3">
                      <h3 className="font-bold text-lg">相关链接</h3>
                      <div className="flex flex-wrap gap-2 rounded-2xl border border-border bg-muted/20 p-4 text-sm font-bold">
                        {selectedGame.streamUrl && (
                          <a href={selectedGame.streamUrl} target="_blank" rel="noreferrer" className="rounded-full border border-border bg-card px-3 py-1.5 text-muted-foreground hover:text-foreground">
                            直播记录
                          </a>
                        )}
                        {selectedGame.videoUrl && (
                          <a href={selectedGame.videoUrl} target="_blank" rel="noreferrer" className="rounded-full border border-border bg-card px-3 py-1.5 text-muted-foreground hover:text-foreground">
                            录像回放
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-5 border-t border-border bg-card/50 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between shrink-0 gap-4">
                 <p className="text-[12px] text-muted-foreground font-medium flex items-center gap-1.5">
                   <span className="relative flex h-2 w-2">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#b4c053] opacity-75"></span>
                     <span className="relative inline-flex rounded-full h-2 w-2 bg-[#b4c053]"></span>
                   </span>
                   游戏记录卡片会自动同步后台发布的最新数据
                 </p>
                 <div className="flex gap-3 justify-end">
                    <button onClick={() => setSelectedGameId(null)} className="px-6 py-2.5 rounded-xl border border-border font-bold text-sm hover:bg-muted transition-colors">关闭</button>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
