import type { ScreeningLibraryContent, ScreeningSourceItem } from "../types";
import {
  generatedScreeningHistoryLibraryItems,
  generatedScreeningHistoryTags
} from "./screeningHistory.generated";

const futureLibraryItems: ScreeningSourceItem[] = [
  {
    id: "inception",
    title: "盗梦空间",
    originalTitle: "Inception",
    type: "movie",
    category: "classic",
    year: "2010",
    duration: "148 分钟",
    rating: 9.4,
    posterUrl: "https://image.tmdb.org/t/p/w342/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg",
    description: "克里斯托弗·诺兰执导的科幻悬疑电影，以梦境层级和开放式结尾形成稳定讨论点。",
    tags: ["科幻", "悬疑", "诺兰", "梦境", "待排播"],
    status: "planned",
    priority: "high",
    timesWatched: 0,
    addedAt: "2026-06-01"
  },
  {
    id: "saw",
    title: "电锯惊魂",
    originalTitle: "Saw",
    type: "movie",
    category: "topic",
    year: "2004",
    duration: "103 分钟",
    rating: 8.7,
    description: "詹姆斯·温执导的密室惊悚片，适合作为悬疑、反转和低成本类型片案例。",
    tags: ["悬疑", "惊悚", "密室", "系列片", "待排播"],
    status: "planned",
    priority: "normal",
    timesWatched: 0,
    addedAt: "2026-06-01"
  },
  {
    id: "farewell-my-concubine",
    title: "霸王别姬",
    originalTitle: "Farewell My Concubine",
    type: "movie",
    category: "classic",
    year: "1993",
    duration: "171 分钟",
    rating: 9.6,
    description: "陈凯歌执导的华语经典电影，围绕京剧、身份和时代变迁展开。",
    tags: ["华语", "陈凯歌", "张国荣", "经典", "待看片"],
    status: "available",
    priority: "high",
    timesWatched: 0,
    addedAt: "2026-06-02"
  },
  {
    id: "dying-to-survive",
    title: "我不是药神",
    originalTitle: "Dying to Survive",
    type: "movie",
    category: "classic",
    year: "2018",
    duration: "117 分钟",
    rating: 9.0,
    description: "文牧野执导的现实题材电影，兼具商业类型节奏和社会议题讨论空间。",
    tags: ["华语", "现实题材", "剧情", "徐峥", "待看片"],
    status: "available",
    priority: "high",
    timesWatched: 0,
    addedAt: "2026-06-02"
  },
  {
    id: "parasite",
    title: "寄生虫",
    originalTitle: "Parasite",
    type: "movie",
    category: "classic",
    year: "2019",
    duration: "132 分钟",
    rating: 8.8,
    description: "奉俊昊执导的韩国电影，类型转换强、空间调度清晰，适合作为结构讨论片。",
    tags: ["韩国", "奉俊昊", "黑色喜剧", "奥斯卡", "待看片"],
    status: "available",
    priority: "normal",
    timesWatched: 0,
    addedAt: "2026-06-03"
  },
  {
    id: "the-matrix",
    title: "黑客帝国",
    type: "movie",
    category: "topic",
    description: "赛博空间、动作设计和哲学母题都适合弹幕后讨论。",
    tags: ["科幻", "赛博朋克", "动作", "待看片"],
    status: "available",
    priority: "normal",
    timesWatched: 0,
    addedAt: "2026-06-04"
  }
];

const historyTitles = new Set(generatedScreeningHistoryLibraryItems.map((item) => item.title.trim().toLowerCase()));
const availableFutureItems = futureLibraryItems.filter((item) => !historyTitles.has(item.title.trim().toLowerCase()));

export const defaultScreeningLibrary: ScreeningLibraryContent = {
  title: "真实历史放映片源库",
  description: "从电影.txt 自动导入历史放映、Bilibili 录播入口、评分和片源状态；下周放映、累计放映、历史归档都从这里和排播记录自动读取。",
  tags: Array.from(new Set([...generatedScreeningHistoryTags, ...availableFutureItems.flatMap((item) => item.tags)])),
  items: [
    ...generatedScreeningHistoryLibraryItems,
    ...availableFutureItems
  ]
};
