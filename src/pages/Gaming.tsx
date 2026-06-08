import { useState, useEffect } from "react";
import { Search, Bell, ChevronDown, Play, ArrowRight, Flame, ChevronLeft, ChevronRight, Clock, User, X, BookOpen, Star, Eye, Crown, Users, LayoutGrid, Heart, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const recentGamesList = [
  {
    title: "剑星 Stellar Blade",
    tag1: { text: "ACTION", bg: "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400" },
    tag2: { text: "预约", bg: "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400" },
    barColor: "bg-green-500",
    time: "2026-06-20",
    desc: "Single-player",
    img: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=200",
  },
  {
    title: "艾尔登法环 Elden Ring",
    tag1: { text: "RPG", bg: "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400" },
    barColor: "bg-blue-500",
    time: "Today 10:00 AM",
    desc: "Multiplayer",
    img: "https://images.unsplash.com/photo-1605901309584-818e25960b8f?auto=format&fit=crop&q=80&w=200",
  },
  {
    title: "赛博朋克 2077 Cyberpunk 2077",
    tag1: { text: "ACTION", bg: "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400" },
    barColor: "bg-amber-500",
    time: "Yesterday",
    desc: "Single-player",
    img: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&q=80&w=200",
  },
  {
    title: "塞尔达传说 旷野之息 Zelda",
    tag1: { text: "ADVENTURE", bg: "bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400" },
    barColor: "bg-purple-500",
    time: "3 days ago",
    desc: "Single-player",
    img: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=200",
  },
  {
    title: "幻兽帕鲁 Palworld",
    tag1: { text: "SURVIVAL", bg: "bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-400" },
    barColor: "bg-teal-500",
    time: "May 25",
    desc: "Online Co-op",
    img: "https://images.unsplash.com/photo-1585620285615-568128f73853?auto=format&fit=crop&q=80&w=200",
  },
  {
    title: "最终幻想14 FFXIV",
    tag1: { text: "MMORPG", bg: "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400" },
    barColor: "bg-indigo-500",
    time: "May 20",
    desc: "MMO",
    img: "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?auto=format&fit=crop&q=80&w=200",
  },
  {
    title: "博德之门3 Baldur's Gate 3",
    tag1: { text: "RPG", bg: "bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400" },
    barColor: "bg-rose-500",
    time: "May 15",
    desc: "Co-op",
    img: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=200",
  }
];

const heroGames = [
  {
    title: "末世科幻动作\n战双帕弥什",
    date: "最近游玩: 2024-05-12",
    img: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200", 
  },
  {
    title: "开放世界动作\n鸣潮 Wuthering Waves",
    date: "最近游玩: 今天 14:00",
    img: "https://images.unsplash.com/photo-1605901309584-818e25960b8f?auto=format&fit=crop&q=80&w=1200",
  },
  {
    title: "江户时代开放世界\n浪人崛起 Rise of the Ronin",
    date: "最近游玩: 2024-03-22",
    img: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&q=80&w=1200",
  }
];

const exploreItems = [
  {
    type: "agent",
    title: "Amadeus",
    author: "Develop",
    avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Amadeus",
    bgClass: "bg-red-50 dark:bg-rose-950/20",
    tags: ["命运石之门", "牧濑红莉栖", "amadeus", "助手"],
    desc: "Amadeus 牧濑红莉栖",
    stars: 5,
    views: 158,
    active: "51 天前",
    badge: "精选",
    badgeColor: "bg-[#b4c053]"
  },
  {
    type: "agent",
    title: "赫萝",
    author: "Doodle Bear",
    avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Holo",
    bgClass: "bg-orange-50 dark:bg-orange-950/20",
    bgImg: "https://images.unsplash.com/photo-1580477667995-2b94f01c9516?auto=format&fit=crop&q=80&w=600",
    tags: [],
    desc: "",
    stars: 1,
    views: 36,
    active: "63 天前",
    badge: ""
  },
  {
    type: "agent",
    title: "KUMA",
    author: "Doodle Bear",
    avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Kuma",
    bgClass: "bg-green-50 dark:bg-green-950/20",
    bgImg: "https://images.unsplash.com/photo-1522069169874-c58ed02bdce6?auto=format&fit=crop&q=80&w=600",
    tags: [],
    desc: "",
    stars: 0,
    views: 18,
    active: "29 天前",
    badge: "精选",
    badgeColor: "bg-[#b4c053]"
  },
  {
    type: "agent",
    title: "庄方宜",
    author: "Doodle Bear",
    avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Zhuang",
    bgClass: "bg-teal-50 dark:bg-teal-950/20",
    bgImg: "https://images.unsplash.com/photo-1518599904199-0ca897819ddb?auto=format&fit=crop&q=80&w=600",
    tags: ["终末地", "endfield", "小庄"],
    desc: "",
    stars: 2,
    views: 58,
    active: "",
    badge: ""
  },
  {
    type: "agent",
    title: "佩丽卡",
    author: "Doodle Bear",
    avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Perilca",
    bgClass: "bg-blue-50 dark:bg-blue-950/20",
    bgImg: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=600",
    tags: ["终末地", "endfield", "鹈鹕", "佩丽卡"],
    desc: "",
    stars: 2,
    views: 25,
    active: "",
    badge: ""
  },
  {
    type: "agent",
    title: "Anya",
    author: "Doodle Bear",
    avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Anya",
    bgClass: "bg-gray-100 dark:bg-gray-800",
    bgImg: "https://images.unsplash.com/photo-1544256718-3b62ade95fb5?auto=format&fit=crop&q=80&w=600",
    tags: [],
    desc: "Hi I am KanBan Musume from AnySoul.\nI am also AI that learn from humans.\nThe reason why I start streaming is because I want to kn...",
    stars: 0,
    views: 16,
    active: "",
    badge: "精选",
    badgeColor: "bg-[#b4c053]"
  },
  {
    type: "group",
    title: "终末地相亲相爱一家人",
    members: 3,
    posts: 3,
    avatars: ["A", "B", "C"],
    bgImg: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=400",
  },
  {
    type: "resource",
    title: "AnySoul官方",
    members: 16,
    posts: 4,
    avatars: ["E", "F", "G", "H"],
    icon: "https://api.dicebear.com/7.x/identicon/svg?seed=AnySoul",
  },
  {
    type: "group",
    title: "狼与香辛料",
    members: 1,
    posts: 2,
    avatars: ["H", "I", "J"],
    bgImg: "https://images.unsplash.com/photo-1605901309584-818e25960b8f?auto=format&fit=crop&q=80&w=400",
  }
];

export function Gaming() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedGameIndex, setSelectedGameIndex] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroGames.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

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
            placeholder="Search..." 
            className="w-full bg-card/80 border border-border/60 rounded-full py-2.5 pl-10 pr-4 text-[15px] font-medium placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
          />
        </div>

        {/* Carousel Hero Card */}
        <div className="relative w-full rounded-[28px] border border-border overflow-hidden h-[280px] shadow-sm bg-card group">
           <AnimatePresence initial={false}>
             <motion.img 
               key={currentSlide}
               src={heroGames[currentSlide].img}
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               transition={{ duration: 0.8 }}
               className="absolute inset-0 w-full h-full object-cover opacity-90 mix-blend-overlay dark:mix-blend-normal dark:opacity-50"
             />
           </AnimatePresence>

           {/* Progress bar and indicators */}
           <div className="absolute top-4 left-0 right-0 px-6 flex justify-between items-center z-20">
             <div className="bg-red-500 text-white text-xs font-bold px-3 py-1 -rotate-12 rounded shadow-sm">PLAYING</div>
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
                    {heroGames[currentSlide].title}
                  </h2>
                  <div className="inline-flex">
                    <span className="text-sm font-bold text-foreground bg-background/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-border/50 shadow-sm">
                       {heroGames[currentSlide].date}
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
               {/* Game Card 1 */}
               <div className="flex flex-col gap-2 group cursor-pointer">
                  <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-card border border-border relative">
                     <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600" alt="Game 1" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  </div>
                  <div>
                    <div className="font-bold text-foreground group-hover:text-primary transition-colors">手机游戏</div>
                    <div className="text-xs text-muted-foreground font-medium">Mobile</div>
                  </div>
               </div>
               {/* Game Card 2 */}
               <div className="flex flex-col gap-2 group cursor-pointer">
                  <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-card border border-border relative">
                     <img src="https://images.unsplash.com/photo-1605901309584-818e25960b8f?auto=format&fit=crop&q=80&w=600" alt="Game 2" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  </div>
                  <div>
                    <div className="font-bold text-foreground group-hover:text-primary transition-colors">单机游戏</div>
                    <div className="text-xs text-muted-foreground font-medium">Single-Player</div>
                  </div>
               </div>
               {/* Game Card 3 */}
               <div className="flex flex-col gap-2 group cursor-pointer">
                  <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-card border border-border relative">
                     <img src="https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&q=80&w=600" alt="Game 3" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  </div>
                  <div>
                    <div className="font-bold text-foreground group-hover:text-primary transition-colors">联动游戏</div>
                    <div className="text-xs text-muted-foreground font-medium">Cross-Over</div>
                  </div>
               </div>
           </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-2">
            {/* Accessories Info */}
            <div className="col-span-1 bg-card rounded-[24px] border border-border p-6 flex flex-col justify-between shadow-sm relative overflow-hidden group cursor-pointer">
               <h3 className="font-bold text-lg mb-2 z-10">Accessories for<br/><span className="text-xl font-black tracking-widest">GAMERS</span> <ArrowRight className="inline-block ml-1 size-5 group-hover:translate-x-1 transition-transform" /></h3>
               <div className="mt-8 flex justify-center z-10">
                  <div className="size-24 bg-muted rounded-2xl flex items-center justify-center">
                     {/* Placeholder for illustration */}
                     <span className="text-3xl">🎮</span>
                  </div>
               </div>
               <div className="absolute -bottom-10 -right-10 size-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* Recent Plays */}
            <div className="col-span-1 md:col-span-2 bg-card rounded-[24px] border border-border p-6 shadow-sm">
               <h3 className="font-bold text-lg mb-4">Recent plays</h3>
               <div className="flex flex-col gap-4">
                  {[
                    { title: "Horizon Zero Dawn", gen: "Action/RPG", img: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=100"},
                    { title: "Call Of Duty", gen: "FPS", img: "https://images.unsplash.com/photo-1585620285615-568128f73853?auto=format&fit=crop&q=80&w=100"},
                    { title: "Cyberpunk 2077", gen: "Action/RPG", img: "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?auto=format&fit=crop&q=80&w=100"},
                  ].map((game, i) => (
                    <div key={i} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-xl transition-colors">
                       <div className="flex items-center gap-3">
                          <img src={game.img} alt={game.title} className="size-10 rounded-lg object-cover" />
                          <div className="flex flex-col">
                             <span className="font-bold text-[15px]">{game.title}</span>
                             <span className="text-[11px] text-muted-foreground font-medium">{game.gen}</span>
                          </div>
                       </div>
                       <button className="px-5 py-1.5 border-2 border-border/80 rounded-xl font-bold text-[13px] hover:border-foreground transition-colors hover:bg-foreground hover:text-background shadow-sm">
                         Play
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
              <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Aaron_J" alt="Aaron_J" className="size-8 rounded-full border border-border object-cover bg-blue-50" />
              <span>Aaron_J</span>
              <ChevronDown className="size-4 text-muted-foreground" />
           </div>
        </div>

        {/* Right Nav / Content Box */}
        <div className="bg-card rounded-[28px] border border-border p-6 flex flex-col gap-8 shadow-sm flex-1">
           
           {/* Stream */}
           <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                 <h3 className="font-bold text-lg">Stream</h3>
                 <ChevronDown className="size-4 text-muted-foreground" />
              </div>
              <div className="relative w-full aspect-video rounded-xl overflow-hidden group cursor-pointer shadow-sm">
                 <img src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=600" alt="Stream" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                 <div className="absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity group-hover:bg-black/40">
                    <div className="size-10 rounded-full flex items-center justify-center bg-[#eab308] border-2 border-white/20 shadow-md transform group-hover:scale-110 transition-transform">
                       <Play className="size-4 text-black fill-black ml-0.5" />
                    </div>
                 </div>
              </div>
           </div>

           {/* Recent Games List */}
           <div className="flex flex-col gap-3 flex-1 min-h-0">
              <h3 className="font-bold text-lg mb-1 px-1">最近游戏</h3>
              <div className="flex flex-col gap-4 overflow-y-auto pr-1 pb-4">
                 {recentGamesList.slice(0, 6).map((game, i) => (
                    <div 
                      key={i} 
                      onClick={() => setSelectedGameIndex(i)}
                      className="flex gap-3 bg-card rounded-[20px] border border-border p-4 shadow-sm hover:shadow-md transition-all hover:border-[#b4c053] group cursor-pointer relative overflow-hidden"
                    >
                       {/* Vertical Color Line */}
                       <div className={`w-[5px] rounded-full shrink-0 ${game.barColor}`}></div>
                       
                       {/* Content */}
                       <div className="flex flex-col justify-center min-w-0 flex-1 py-1">
                          
                          {/* Inner Info */}
                          <div className="flex items-center gap-3 mt-1">
                             {/* Icon */}
                             <div className="size-[42px] rounded-xl flex items-center justify-center border border-border/80 shadow-sm shrink-0 overflow-hidden bg-background">
                                <img src={game.img} alt={game.title} className="size-full object-cover group-hover:scale-110 transition-transform duration-500" />
                             </div>
                             
                             {/* Text info */}
                             <div className="flex flex-col gap-1 min-w-0 flex-1">
                                <span className="font-bold text-foreground text-[14px] leading-tight truncate">{game.title}</span>
                                <div className="flex items-center gap-3 text-[11px] text-muted-foreground whitespace-nowrap">
                                   <span className="flex items-center gap-1.5"><Clock className="size-3" /> {game.time}</span>
                                   <div className="w-[1px] h-3 bg-border"></div>
                                   <span className="flex items-center gap-1.5"><User className="size-3" /> {game.desc}</span>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                 ))}
                 
                 <div className="flex justify-center mt-2">
                   <button className="group relative inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 hover:bg-primary/10 backdrop-blur-md shadow-[0_0_20px_rgba(164,198,57,0.1)] hover:shadow-[0_0_25px_rgba(164,198,57,0.2)] transition-all cursor-pointer">
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
      <div className="mt-8 bg-[#f5f5f5] dark:bg-card rounded-[28px] border-[3px] border-[#e5e5e5] dark:border-border p-6 md:p-8 shadow-sm flex flex-col gap-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-black flex items-center gap-2 tracking-tight">探索游戏回里的精选游戏 <BookOpen className="size-6 text-[#b4c053]" /></h2>
            <p className="text-muted-foreground mt-2 text-[14px]">探索游戏卡片</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-full hover:bg-muted transition-colors font-bold text-sm shadow-sm bg-background">
            <LayoutGrid className="size-4" /> 浏览全部
          </button>
        </div>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {exploreItems.map((item, idx) => {
            if (item.type === "agent") {
              return (
                <div key={idx} className={`relative rounded-[24px] border border-border p-4 break-inside-avoid flex flex-col gap-4 overflow-hidden group hover:shadow-md transition-shadow bg-card`}>
                  {item.badge && (
                    <div className={`absolute top-4 right-4 z-10 ${item.badgeColor} text-white text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm`}>
                      <Crown className="size-3" /> {item.badge}
                    </div>
                  )}
                  <div className={`w-full aspect-[4/3] rounded-2xl relative flex items-center justify-center overflow-hidden ${item.bgClass}`}>
                    {item.bgImg && <img src={item.bgImg} className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-overlay dark:mix-blend-normal" />}
                    <img src={item.avatar} alt={item.title} className="size-16 rounded-full border-4 border-card bg-background relative z-10 transition-transform group-hover:scale-105" />
                    {item.active && (
                       <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-md rounded-full px-3 py-1 text-[10px] font-bold text-muted-foreground flex items-center gap-1.5 whitespace-nowrap shadow-sm border border-border/50">
                         <Heart className="size-3 text-rose-500 fill-rose-500" /> 上次活跃于 {item.active}
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
                  {(item.desc || item.tags!.length > 0) && (
                     <div className="flex flex-col gap-3 px-1 mt-1">
                        {item.desc && <p className="text-[13px] text-muted-foreground line-clamp-3 leading-relaxed">{item.desc}</p>}
                        {item.tags!.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                             {item.tags!.map((t, i) => (
                               <span key={i} className="px-2.5 py-1 bg-muted/60 text-muted-foreground rounded-md text-[11px] font-bold">{t}</span>
                             ))}
                          </div>
                        )}
                     </div>
                  )}
                </div>
              );
            } else if (item.type === "group") {
              return (
                <div key={idx} className="relative rounded-[24px] border border-border overflow-hidden break-inside-avoid flex flex-col group hover:shadow-md transition-shadow bg-card">
                   <div className="w-full aspect-video relative">
                     <img src={item.bgImg} className="w-full h-full object-cover" />
                     <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-black/80 to-transparent" />
                     <div className="absolute bottom-4 left-4 right-4 flex gap-3 z-10">
                         <div className="size-10 rounded-xl bg-background flex items-center justify-center -mb-8 shadow-sm overflow-hidden border border-border z-20 relative">
                            <img src={item.bgImg} className="w-full h-full object-cover" />
                         </div>
                     </div>
                   </div>
                   <div className="p-4 pt-8 flex flex-col gap-1">
                      <h3 className="font-bold text-[16px] leading-snug">{item.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                        <span className="flex items-center gap-1"><Users className="size-3" /> {item.members}</span>
                        <span className="flex items-center gap-1"><MessageSquare className="size-3" /> {item.posts}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                         <div className="flex -space-x-1.5">
                           {item.avatars!.map((seed, i) => (
                              <img key={i} src={`https://api.dicebear.com/7.x/notionists/svg?seed=${seed}`} className="size-6 rounded-full border border-background bg-muted relative z-10" />
                           ))}
                         </div>
                         <span className="text-[10px] text-muted-foreground font-bold bg-muted px-1.5 py-0.5 rounded-full relative z-10">+1</span>
                      </div>
                   </div>
                </div>
              );
            } else {
              return (
                 <div key={idx} className="relative rounded-[24px] border border-border break-inside-avoid flex flex-col group hover:shadow-md transition-shadow bg-card overflow-hidden">
                    <div className="p-6 bg-[#b4c053]/80 aspect-video flex flex-col justify-center items-center gap-4 text-center relative overflow-hidden">
                       <span className="text-[40px] font-black italic tracking-tighter text-white/50 absolute -right-2 -top-2">AnySoul</span>
                       <h3 className="text-3xl font-black text-white drop-shadow-sm z-10 w-2/3 leading-tight tracking-tight">由你塑造的数字灵魂</h3>
                       <div className="absolute left-6 bottom-6 size-12 bg-white rounded-2xl shadow-sm overflow-hidden flex items-center justify-center p-1.5 border border-border">
                           <img src={item.icon} className="size-full" />
                       </div>
                    </div>
                    <div className="p-4 pt-6 flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-[16px]">{item.title}</h3>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                        <span className="flex items-center gap-1"><Users className="size-3" /> {item.members}</span>
                        <span className="flex items-center gap-1"><MessageSquare className="size-3" /> {item.posts}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                         <div className="flex -space-x-1.5">
                           {item.avatars!.map((seed, i) => (
                              <img key={i} src={`https://api.dicebear.com/7.x/notionists/svg?seed=${seed}`} className="size-6 rounded-full border border-background bg-muted relative z-10" />
                           ))}
                         </div>
                         <span className="text-[10px] text-muted-foreground font-bold bg-muted px-1.5 py-0.5 rounded-full relative z-10">+15</span>
                      </div>
                    </div>
                 </div>
              );
            }
          })}
        </div>
      </div>

      {/* Game Details Modal */}
      <AnimatePresence>
        {selectedGameIndex !== null && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setSelectedGameIndex(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-3xl max-h-[90vh] bg-card rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-border"
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedGameIndex(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 backdrop-blur-md hover:bg-black/70 transition-colors text-white z-20"
              >
                <X className="size-4" />
              </button>

              <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col min-h-0">
                {/* Hero Header */}
                <div className="relative h-56 sm:h-72 w-full shrink-0">
                  <img 
                    src={recentGamesList[selectedGameIndex].img.replace('&w=200', '&w=1200')} 
                    alt={recentGamesList[selectedGameIndex].title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 z-10 w-2/3">
                    <div className="flex items-center gap-2 mb-3">
                       <span className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-[12px] font-bold uppercase tracking-wider ${recentGamesList[selectedGameIndex].tag1.bg} border border-[currentColor]/20 shadow-sm backdrop-blur-sm bg-opacity-80`}>
                          {recentGamesList[selectedGameIndex].tag1.text}
                       </span>
                    </div>
                    <h2 className="text-2xl sm:text-4xl font-black tracking-tight drop-shadow-md">{recentGamesList[selectedGameIndex].title}</h2>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col gap-8">
                  {/* Stats Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="bg-muted/30 rounded-2xl p-4 border border-border flex flex-col hover:border-[#b4c053]/50 transition-colors cursor-default">
                      <span className="text-muted-foreground text-[11px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5 whitespace-nowrap"><Clock className="size-3" /> 距离上次游玩</span>
                      <span className="text-xl font-black">{recentGamesList[selectedGameIndex].time}</span>
                    </div>
                    <div className="bg-muted/30 rounded-2xl p-4 border border-border flex flex-col hover:border-[#b4c053]/50 transition-colors cursor-default">
                      <span className="text-muted-foreground text-[11px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5 whitespace-nowrap"><Play className="size-3" /> 预计结束时间</span>
                      <span className="text-xl font-black">约 45 小时</span>
                    </div>
                    <div className="bg-muted/30 rounded-2xl p-4 border border-border flex flex-col col-span-2 sm:col-span-1 hover:border-[#b4c053]/50 transition-colors cursor-default">
                      <span className="text-muted-foreground text-[11px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5 whitespace-nowrap"><Flame className="size-3" /> 综合评价</span>
                      <span className="text-xl font-black text-[#b4c053]">9.5 / 10 杰出</span>
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
                        {Array.from({ length: 84 }).map((_, i) => {
                          const intensity = Math.random() > 0.65 ? Math.floor(Math.random() * 4) + 1 : 0;
                          let bgClass = "bg-muted";
                          if (intensity === 1) bgClass = "bg-[#b4c053]/30";
                          if (intensity === 2) bgClass = "bg-[#b4c053]/60";
                          if (intensity === 3) bgClass = "bg-[#b4c053]/80";
                          if (intensity === 4) bgClass = "bg-[#b4c053]";
                          return (
                            <div 
                              key={i} 
                              className={`size-[15.5px] rounded-[3px] ${bgClass} transition-colors cursor-help hover:ring-2 hover:ring-foreground/30`}
                              title={`Activity level: ${intensity}`}
                            />
                          )
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

                  {/* Review / About */}
                  <div className="flex flex-col gap-3">
                    <h3 className="font-bold text-lg">关于该游戏评价</h3>
                    <p className="text-muted-foreground text-[14.5px] leading-relaxed bg-muted/20 border border-border p-5 rounded-2xl hover:border-foreground/20 transition-colors">
                      这款游戏展现了惊人的画面表现力和深度的游戏机制。战斗系统流畅且具有挑战性，剧情引人入胜，场景美术更是令人叹为观止。不仅如此，游戏在背景设定和世界观构建上细节满满，是近期不可多得的艺术与技术完美结合的佳作。强烈推荐体验。
                    </p>
                  </div>

                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-5 border-t border-border bg-card/50 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between shrink-0 gap-4">
                 <p className="text-[12px] text-muted-foreground font-medium flex items-center gap-1.5">
                   <span className="relative flex h-2 w-2">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#b4c053] opacity-75"></span>
                     <span className="relative inline-flex rounded-full h-2 w-2 bg-[#b4c053]"></span>
                   </span>
                   游戏详细卡片会自动同步最新的云端数据
                 </p>
                 <div className="flex gap-3 justify-end">
                    <button onClick={() => setSelectedGameIndex(null)} className="px-6 py-2.5 rounded-xl border border-border font-bold text-sm hover:bg-muted transition-colors">关闭</button>
                    <button onClick={() => setSelectedGameIndex(null)} className="px-6 py-2.5 rounded-xl bg-[#b4c053] text-[#1a1a1a] font-bold text-sm hover:bg-[#a4b043] transition-colors shadow-[0_4px_14px_0_rgba(180,192,83,0.39)] hover:shadow-[0_6px_20px_rgba(180,192,83,0.23)]">立即启动</button>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
