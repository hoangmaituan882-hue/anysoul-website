import type { GamingMainContent } from "../types";

export const defaultGamingMain: GamingMainContent = {
  searchPlaceholder: "Search...",
  currentGameTitle: "鸣潮 Wuthering Waves",
  currentGameTime: "今天 14:00",
  dailyPlayTime: "4.5h",
  connectionLatency: "24ms",
  streamTitle: "Stream",
  streamImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=600",
  heroGames: [
    { title: "末世科幻动作\n战双帕弥什", date: "最近游玩: 2024-05-12", img: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200" },
    { title: "开放世界动作\n鸣潮 Wuthering Waves", date: "最近游玩: 今天 14:00", img: "https://images.unsplash.com/photo-1605901309584-818e25960b8f?auto=format&fit=crop&q=80&w=1200" },
    { title: "江户时代开放世界\n浪人崛起 Rise of the Ronin", date: "最近游玩: 2024-03-22", img: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&q=80&w=1200" }
  ],
  categories: [
    { title: "手机游戏", subtitle: "Mobile", img: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600" },
    { title: "单机游戏", subtitle: "Single-Player", img: "https://images.unsplash.com/photo-1605901309584-818e25960b8f?auto=format&fit=crop&q=80&w=600" },
    { title: "联动游戏", subtitle: "Cross-Over", img: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&q=80&w=600" }
  ],
  recentGames: [
    { title: "剑星 Stellar Blade", tag1: { text: "ACTION", bg: "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400" }, tag2: { text: "预约", bg: "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400" }, barColor: "bg-green-500", time: "2026-06-20", desc: "Single-player", img: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=200", rating: "9.5 / 10 杰出", review: "动作表现优秀，适合近期重点展示。" },
    { title: "艾尔登法环 Elden Ring", tag1: { text: "RPG", bg: "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400" }, barColor: "bg-blue-500", time: "Today 10:00 AM", desc: "Multiplayer", img: "https://images.unsplash.com/photo-1605901309584-818e25960b8f?auto=format&fit=crop&q=80&w=200", rating: "9.8 / 10 神作", review: "开放世界和探索节奏非常强。" },
    { title: "赛博朋克 2077 Cyberpunk 2077", tag1: { text: "ACTION", bg: "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400" }, barColor: "bg-amber-500", time: "Yesterday", desc: "Single-player", img: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&q=80&w=200", rating: "9.0 / 10 推荐", review: "适合做直播回顾和剧情讨论。" }
  ]
};
