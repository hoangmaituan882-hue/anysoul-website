import type { SiteAnnouncementsContent } from "../types";

export const defaultSiteAnnouncements: SiteAnnouncementsContent = {
  items: [
    {
      id: "site-announcement-weekly-hub",
      title: "站点工作台开放",
      body: "公开工作台会集中展示本周杂谈、放映会、游戏回和图库动态，方便从一个入口查看全站更新。",
      level: "info",
      startsAt: "2026-06-10T00:00:00+08:00",
      href: "#site-workspace",
      tags: ["工作台", "全站动态"],
      pinned: true
    },
    {
      id: "site-announcement-feedback",
      title: "意见通道持续开放",
      body: "发现内容错误、想提名电影动画或补充资料，可以从关于页提交给站主处理。",
      level: "success",
      startsAt: "2026-06-10T00:00:00+08:00",
      href: "#about",
      tags: ["反馈", "投稿"],
      pinned: false
    }
  ]
};
