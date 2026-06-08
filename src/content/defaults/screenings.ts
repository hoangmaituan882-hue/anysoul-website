import type {
  ScreeningAnimeContent,
  ScreeningClassicsContent,
  ScreeningNextContent,
  ScreeningScheduleContent,
  ScreeningSourceSubmissionsContent,
  ScreeningStatsContent,
  ScreeningTodoContent
} from "../types";
import {
  generatedScreeningAnimeHistoryMovies,
  generatedScreeningClassicsTimeline,
  generatedScreeningHistorySource,
  generatedScreeningFeaturedMovies,
  generatedScreeningHistoryStats,
  generatedScreeningHistoryWeeks
} from "./screeningHistory.generated";

const movieSnapshot = {
  inception: {
    id: "inception",
    libraryId: "inception",
    type: "classic" as const,
    title: "盗梦空间",
    originalTitle: "Inception",
    year: "2010",
    duration: "148 分钟",
    rating: 9.4,
    posterUrl: "https://image.tmdb.org/t/p/w342/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg",
    description: "梦境层级、动作场面和开放式结尾都适合放映后讨论。",
    tags: ["科幻", "悬疑", "诺兰"]
  },
  saw: {
    id: "saw",
    libraryId: "saw",
    type: "topic" as const,
    title: "电锯惊魂",
    originalTitle: "Saw",
    year: "2004",
    duration: "103 分钟",
    rating: 8.7,
    description: "低成本密室惊悚片代表，适合悬疑和反转结构主题。",
    tags: ["悬疑", "惊悚", "密室"]
  }
};

export const defaultScreeningsNext: ScreeningNextContent = {
  title: "梦境与密室专场",
  theme: "用《盗梦空间》和《电锯惊魂》做一场关于梦境、空间机关和反转叙事的周末放映。",
  status: "preview",
  statusText: "预告",
  startsAt: "2026-06-13T20:00:00+08:00",
  timezone: "Asia/Shanghai",
  reservationCount: 0,
  discussionCount: 0,
  description: "下周片单从片源库绑定生成，发布和归档会同步回写真实片源记录。",
  movies: [movieSnapshot.inception, movieSnapshot.saw]
};

export const defaultScreeningsSchedule: ScreeningScheduleContent = {
  sourceFile: generatedScreeningHistorySource.sourceFile,
  sourceHash: generatedScreeningHistorySource.sourceHash,
  importedAt: generatedScreeningHistorySource.generatedAt,
  cycle: {
    name: "周末放映会",
    recurrence: "weekly",
    dayOfWeek: 6,
    defaultTime: "20:00",
    timezone: "Asia/Shanghai"
  },
  weeks: [
    ...generatedScreeningHistoryWeeks,
    {
      id: "screening-2026-06-13",
      date: "2026-06-13",
      startsAt: "2026-06-13T20:00:00+08:00",
      title: "梦境与密室专场",
      theme: defaultScreeningsNext.theme,
      status: "preview",
      statusText: "预告",
      movies: defaultScreeningsNext.movies,
      viewerCount: 0,
      discussionCount: 0
    }
  ]
};

export const defaultScreeningsTodo: ScreeningTodoContent = {
  sortDefault: "hot",
  items: [
    { id: "farewell-my-concubine", title: "霸王别姬", reason: "华语影史经典，适合做长线主题放映和演员表演讨论。", added: "2026-06-02", addedAt: "2026-06-02", votes: 42, status: "waiting", priority: "high", category: "classic" },
    { id: "dying-to-survive", title: "我不是药神", reason: "现实题材和商业类型结合成熟，适合讨论观众情绪与社会议题。", added: "2026-06-02", addedAt: "2026-06-02", votes: 36, status: "waiting", priority: "high", category: "classic" },
    { id: "parasite", title: "寄生虫", reason: "空间调度和类型转换很适合做结构拆解。", added: "2026-06-03", addedAt: "2026-06-03", votes: 28, status: "waiting", priority: "normal", category: "classic" },
    { id: "switch", title: "天机·富春山居图", reason: "真实存在的高讨论度反面案例，可作为吐槽专场候选。", added: "2026-06-03", addedAt: "2026-06-03", votes: 21, status: "waiting", priority: "high", category: "bad" },
    { id: "the-matrix", title: "黑客帝国", reason: "赛博空间、动作设计和哲学母题都适合弹幕后讨论。", added: "2026-06-04", addedAt: "2026-06-04", votes: 18, status: "waiting", priority: "normal", category: "topic" }
  ]
};

export const defaultScreeningsClassics: ScreeningClassicsContent = {
  timeline: generatedScreeningClassicsTimeline,
  featuredMovies: generatedScreeningFeaturedMovies
};

export const defaultScreeningsAnime: ScreeningAnimeContent = {
  tierList: [
    {
      tier: "神作",
      color: "bg-[#ff7eb6] dark:bg-[#ff7eb6] text-white",
      posters: [
        "https://image.tmdb.org/t/p/w342/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg",
        "https://image.tmdb.org/t/p/w342/q719jXXEzOoYaps6babgKnONONX.jpg"
      ]
    },
    {
      tier: "佳作",
      color: "bg-[#ffb07c] dark:bg-[#ffb07c] text-white",
      posters: [
        "https://image.tmdb.org/t/p/w342/qgrk7r1fV4IjuoeiGS5HOhXNdLJ.jpg"
      ]
    },
    {
      tier: "待补档",
      color: "bg-[#ffdf76] dark:bg-[#ffdf76] text-[#6d4c00]",
      posters: []
    }
  ],
  historyMovies: generatedScreeningAnimeHistoryMovies
};

export const defaultScreeningsStats: ScreeningStatsContent = {
  nextCountdownLabel: "自动计算",
  lastScreeningLabel: "自动计算",
  totalMovies: generatedScreeningHistoryStats.totalMovies,
  goodMovies: generatedScreeningHistoryStats.goodMovies,
  badMovies: generatedScreeningHistoryStats.badMovies,
  totalViewers: 0,
  topBadMovie: generatedScreeningHistoryStats.topBadMovie
};

export const defaultScreeningSourceSubmissions: ScreeningSourceSubmissionsContent = {
  items: [
    {
      id: "source-submission-test-source-url",
      sourceId: "inception",
      sourceTitle: "盗梦空间",
      field: "sourceUrl",
      content: "测试用户建议补充 Bilibili 录播入口：https://www.bilibili.com/video/BV1testsource",
      contact: "tester@example.com",
      submitter: "测试用户A",
      status: "pending",
      createdAt: "2026-06-07T10:30:00+08:00"
    },
    {
      id: "source-submission-test-note",
      sourceId: "saw",
      sourceTitle: "电锯惊魂",
      field: "sourceNote",
      content: "测试修改意见：建议在播放备注里注明片头跳过 01:20 后进入正片，方便后台排播时检查。",
      submitter: "测试用户B",
      status: "pending",
      createdAt: "2026-06-07T11:10:00+08:00"
    }
  ]
};
