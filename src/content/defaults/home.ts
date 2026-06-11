import type { FaqContent, HomeHeroContent } from "../types";

export const defaultHomeHero: HomeHeroContent = {
  badge: "内容暂未连接",
  titlePrefix: "这里会展示",
  highlight1: "AnySoul",
  highlight2: "站点内容",
  subtitle: "内容服务暂时不可用，当前仅显示最小占位信息。",
  browserTitle: "站点内容待同步",
  browserStatus1: "离线",
  browserStatus2: "待连接",
  chatMsg1: "后台内容发布后会显示在这里。",
  chatMsg2: "请稍后刷新，或检查内容服务连接。",
  chatMsg3: "页面不会因为内容缺失而中断。",
  chatThinking: "等待内容服务连接...",
  eventsTitle: "站点动态",
  events: [],
  activityTitle: "内容",
  activityMemory: "待同步",
  activityItem1: "暂无内容",
  activityItem1Desc: "后台发布后显示。"
};

export const defaultHomeFaq: FaqContent = {
  title: "常见问题",
  items: []
};
