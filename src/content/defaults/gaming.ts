import type { GamingMainContent } from "../types";

const covers = {
  waves: "https://images.unsplash.com/photo-1605901309584-818e25960b8f?auto=format&fit=crop&q=80&w=1200",
  elden: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200",
  cyberpunk: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&q=80&w=1200",
  zelda: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=1200",
  palworld: "https://images.unsplash.com/photo-1585620285615-568128f73853?auto=format&fit=crop&q=80&w=1200"
};

export const defaultGamingMain: GamingMainContent = {
  searchPlaceholder: "搜索游戏、平台、标签...",
  currentGameTitle: "鸣潮 Wuthering Waves",
  currentGameTime: "今天 14:00",
  dailyPlayTime: "4.5h",
  connectionLatency: "24ms",
  streamTitle: "当前游戏直播",
  streamImage: covers.waves,
  currentGameId: "wuthering-waves",
  streamGameId: "wuthering-waves",
  heroGames: [
    { title: "开放世界动作\n鸣潮 Wuthering Waves", date: "最近游玩 今天 14:00", img: covers.waves },
    { title: "魂系探索\n艾尔登法环 Elden Ring", date: "最近游玩 2026-06-08", img: covers.elden },
    { title: "夜之城回访\n赛博朋克 2077", date: "最近游玩 2026-06-05", img: covers.cyberpunk }
  ],
  categories: [
    { title: "手机游戏", subtitle: "Mobile", img: covers.waves },
    { title: "单机游戏", subtitle: "Single Player", img: covers.elden },
    { title: "联机合作", subtitle: "Co-op", img: covers.palworld }
  ],
  recentGames: [
    { title: "鸣潮 Wuthering Waves", tag1: { text: "ACTION", bg: "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400" }, tag2: { text: "进行中", bg: "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400" }, barColor: "bg-green-500", time: "今天 14:00", desc: "开放世界", img: covers.waves, rating: "8.8 / 10", review: "适合记录探索、抽卡和角色养成进度。" },
    { title: "艾尔登法环 Elden Ring", tag1: { text: "RPG", bg: "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400" }, barColor: "bg-blue-500", time: "2026-06-08", desc: "单人冒险", img: covers.elden, rating: "9.8 / 10", review: "探索节奏和地图设计仍然很耐看。" },
    { title: "赛博朋克 2077", tag1: { text: "STORY", bg: "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400" }, barColor: "bg-amber-500", time: "2026-06-05", desc: "剧情回访", img: covers.cyberpunk, rating: "9.0 / 10", review: "适合做剧情杂谈和夜之城截图记录。" }
  ],
  library: [
    {
      id: "wuthering-waves",
      title: "鸣潮 Wuthering Waves",
      subtitle: "开放世界动作",
      platform: "PC / Mobile",
      genre: "动作 RPG",
      mode: "单人 / 联机",
      status: "playing",
      tags: ["开放世界", "动作", "抽卡", "直播中"],
      coverUrl: covers.waves,
      heroImage: covers.waves,
      rating: "8.8 / 10",
      totalHours: "42h",
      lastPlayedAt: "2026-06-09",
      streamUrl: "https://www.bilibili.com",
      description: "当前主要游玩的开放世界动作游戏，适合记录探索、角色培养和版本活动。",
      review: "战斗反馈轻快，地图探索适合做连续直播记录。",
      playRecords: [
        { date: "2026-06-09", durationHours: 3, note: "主线推进与材料收集" },
        { date: "2026-06-08", durationHours: 2, note: "角色培养" },
        { date: "2026-06-06", durationHours: 4, note: "地图探索" }
      ]
    },
    {
      id: "elden-ring",
      title: "艾尔登法环 Elden Ring",
      subtitle: "魂系开放世界",
      platform: "PC",
      genre: "动作 RPG",
      mode: "单人",
      status: "paused",
      tags: ["魂系", "探索", "Boss"],
      coverUrl: covers.elden,
      heroImage: covers.elden,
      rating: "9.8 / 10",
      totalHours: "86h",
      lastPlayedAt: "2026-06-08",
      description: "长期回访的开放世界动作 RPG，用来记录 Boss 战、路线和装备搭配。",
      review: "地图和战斗密度很适合做阶段性回顾。",
      playRecords: [
        { date: "2026-06-08", durationHours: 2, note: "DLC 前复健" },
        { date: "2026-06-02", durationHours: 3, note: "支线探索" }
      ]
    },
    {
      id: "cyberpunk-2077",
      title: "赛博朋克 2077",
      subtitle: "夜之城剧情回访",
      platform: "PC",
      genre: "剧情 / RPG",
      mode: "单人",
      status: "finished",
      tags: ["剧情", "截图", "科幻"],
      coverUrl: covers.cyberpunk,
      heroImage: covers.cyberpunk,
      rating: "9.0 / 10",
      totalHours: "64h",
      lastPlayedAt: "2026-06-05",
      description: "适合沉淀剧情感想、城市截图和支线记录的长期游戏。",
      review: "资料片之后完整度很高，适合做一轮剧情复盘。",
      playRecords: [
        { date: "2026-06-05", durationHours: 3, note: "支线回顾" },
        { date: "2026-05-30", durationHours: 2, note: "截图整理" }
      ]
    },
    {
      id: "zelda-tears",
      title: "塞尔达传说 王国之泪",
      subtitle: "自由建造与冒险",
      platform: "Switch",
      genre: "冒险",
      mode: "单人",
      status: "planned",
      tags: ["冒险", "解谜", "待补完"],
      coverUrl: covers.zelda,
      heroImage: covers.zelda,
      rating: "9.6 / 10",
      totalHours: "18h",
      lastPlayedAt: "2026-05-28",
      description: "待补完的开放冒险游戏，适合做探索路线和神庙记录。",
      review: "自由度很高，后续可以做专题回顾。",
      playRecords: [{ date: "2026-05-28", durationHours: 2, note: "神庙探索" }]
    }
  ],
  exploreItems: [
    { id: "explore-waves", gameId: "wuthering-waves", title: "本周主玩：鸣潮", author: "AnySoul", description: "整理当前版本活动、角色养成和直播记录。", coverUrl: covers.waves, tags: ["直播中", "开放世界"], stars: 5, views: 158, badge: "精选" },
    { id: "explore-elden", gameId: "elden-ring", title: "艾尔登法环复健记录", author: "AnySoul", description: "DLC 前重新熟悉地图、Boss 和配装。", coverUrl: covers.elden, tags: ["魂系", "复健"], stars: 4, views: 92 },
    { id: "explore-cyberpunk", gameId: "cyberpunk-2077", title: "夜之城截图与剧情", author: "AnySoul", description: "把剧情回访、截图和支线感想归档。", coverUrl: covers.cyberpunk, tags: ["剧情", "截图"], stars: 4, views: 76 }
  ]
};
