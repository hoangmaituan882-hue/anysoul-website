import type {
  ScreeningAnimeContent,
  ScreeningClassicsContent,
  ScreeningNextContent,
  ScreeningScheduleContent,
  ScreeningSourceSubmissionsContent,
  ScreeningStatsContent,
  ScreeningTodoContent
} from "../types";

export const defaultScreeningsNext: ScreeningNextContent = {
  title: "暂无放映安排",
  theme: "后台发布后显示。",
  status: "draft",
  statusText: "待同步",
  startsAt: "",
  timezone: "Asia/Shanghai",
  reservationCount: 0,
  discussionCount: 0,
  description: "内容服务暂时不可用。",
  movies: []
};

export const defaultScreeningsSchedule: ScreeningScheduleContent = {
  cycle: {
    name: "放映会",
    recurrence: "weekly",
    dayOfWeek: 6,
    defaultTime: "20:00",
    timezone: "Asia/Shanghai"
  },
  weeks: []
};

export const defaultScreeningsTodo: ScreeningTodoContent = {
  sortDefault: "hot",
  items: []
};

export const defaultScreeningsClassics: ScreeningClassicsContent = {
  timeline: [],
  featuredMovies: []
};

export const defaultScreeningsAnime: ScreeningAnimeContent = {
  tierList: [],
  historyMovies: []
};

export const defaultScreeningsStats: ScreeningStatsContent = {
  nextCountdownLabel: "待同步",
  lastScreeningLabel: "待同步",
  totalMovies: 0,
  goodMovies: 0,
  badMovies: 0,
  totalViewers: 0,
  topBadMovie: {
    title: "暂无",
    rating: 0,
    note: "",
    votes: 0
  }
};

export const defaultScreeningSourceSubmissions: ScreeningSourceSubmissionsContent = {
  items: []
};
