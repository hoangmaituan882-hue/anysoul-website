import type { SiteAnalyticsContent } from "../types";

export const defaultSiteAnalytics: SiteAnalyticsContent = {
  totalViews: 0,
  uniqueVisitors: 0,
  pages: [
    { path: "#home", title: "首页", views: 0 },
    { path: "#screenings", title: "放映会", views: 0 },
    { path: "#games", title: "游戏回", views: 0 },
    { path: "#plaza", title: "图库", views: 0 },
    { path: "#about", title: "关于", views: 0 },
    { path: "#workspace", title: "工作台", views: 0 }
  ]
};
