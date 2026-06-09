import type { TalkItem, TalksContent } from "../types";

const baseTranscript = [
  { time: "00:00", speaker: "主持人", text: "晚上好，欢迎来到本周杂谈回。今天从新番、片源和网站更新三个方向聊起。" },
  { time: "03:12", speaker: "嘉宾 A", text: "本周最明显的感受是作品讨论开始变得分散，所以需要一个能长期归档的页面。" },
  { time: "08:45", speaker: "主持人", text: "片源库和放映会历史会继续互相补充，杂谈回负责把讨论脉络留下来。" },
  { time: "14:20", speaker: "嘉宾 B", text: "如果后续有用户投稿或评论，也可以在这里形成可回看的索引。" },
  { time: "21:06", speaker: "主持人", text: "今天的结论是先把内容结构跑通，再逐步加入更完整的真实音视频资料。" }
];

const baseComments = [
  { author: "访客", content: "这个归档方式比只放链接清楚很多。", time: "21:40" },
  { author: "站内用户", content: "希望后面能按动画、电影、站点更新分类筛选。", time: "23:15" },
  { author: "管理员", content: "后续会把后台维护能力补齐。", time: "25:02" }
];

const baseMentions = [
  {
    title: "放映会片源库",
    type: "站内模块",
    score: "稳定维护",
    tags: ["电影", "动画", "归档"],
    summary: "本期重点提到的长期内容库，用来承接待放映、已归档和用户投稿片源。"
  },
  {
    title: "图库导入流程",
    type: "站点更新",
    score: "持续优化",
    tags: ["图库", "杂谈", "批次"],
    summary: "围绕每周杂谈批次整理作品，保留导入日期、周数和标签信息。"
  }
];

function talk(overrides: Partial<TalkItem>): TalkItem {
  return {
    id: "talk-default",
    title: "杂谈回：网站内容如何沉淀",
    subtitle: "从放映会、图库、文章到工作台的一次站内整理",
    date: "2026-06-09",
    time: "20:30",
    duration: "48 min",
    coverUrl: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1400&q=80",
    status: "archived",
    host: "Linze",
    guests: ["站内记录", "内容工作台"],
    tags: ["网站更新", "放映会", "图库"],
    summary: "这一期杂谈回围绕站点内容如何从临时记录变成长期归档展开，串联放映会片源库、图库导入、文章评论和服务器监控。",
    viewers: 1280,
    danmaku: 342,
    likes: 96,
    sourceUrl: "#posts",
    transcript: baseTranscript,
    comments: baseComments,
    mentions: baseMentions,
    ...overrides
  };
}

export const defaultTalksContent: TalksContent = {
  hero: {
    eyebrow: "Talk Archive",
    title: "杂谈回",
    subtitle: "把每周讨论、站点更新和内容线索整理成可以检索、回看和继续补充的长期记录。"
  },
  live: talk({
    id: "talk-live-2026-06-09",
    title: "本周杂谈：内容入口重新整理",
    subtitle: "首页、关于页、放映会和图库之间的关系",
    status: "live",
    date: "2026-06-09",
    time: "21:00",
    duration: "直播中",
    tags: ["直播中", "网站更新", "内容结构"]
  }),
  upcoming: [
    { id: "upcoming-1", date: "2026-06-14", time: "20:00", title: "下周放映前瞻", topic: "待补充片源与归档逻辑", tags: ["放映会", "片源库"] },
    { id: "upcoming-2", date: "2026-06-21", time: "20:30", title: "图库整理回", topic: "杂谈批次、导入日期与作品展示", tags: ["图库", "同人作品"] },
    { id: "upcoming-3", date: "2026-06-28", time: "21:00", title: "站点维护记录", topic: "服务器监控、反馈待办与部署复盘", tags: ["工作台", "监控"] }
  ],
  weekly: [
    { id: "week-1", date: "周一", time: "19:30", title: "内容巡检", topic: "检查投稿、评论和反馈", tags: ["工作台"] },
    { id: "week-2", date: "周三", time: "21:00", title: "片源补全", topic: "补海报、简介、来源链接", tags: ["片源库"] },
    { id: "week-3", date: "周日", time: "20:00", title: "放映会", topic: "按排期归档当周播放", tags: ["放映会"] }
  ],
  archive: [
    talk({ id: "talk-2026-06-02", title: "杂谈回：服务器部署之后", date: "2026-06-02", time: "20:30", viewers: 960, danmaku: 188, likes: 72, tags: ["部署", "服务器", "监控"] }),
    talk({ id: "talk-2026-05-26", title: "杂谈回：图库导入和周数标签", date: "2026-05-26", time: "21:10", viewers: 1180, danmaku: 266, likes: 81, tags: ["图库", "导入", "标签"] }),
    talk({ id: "talk-2026-05-19", title: "杂谈回：放映会历史怎么读", date: "2026-05-19", time: "20:00", viewers: 1320, danmaku: 301, likes: 104, tags: ["放映会", "电影", "动画"] }),
    talk({ id: "talk-2026-05-12", title: "杂谈回：文章记录与评论", date: "2026-05-12", time: "20:45", viewers: 880, danmaku: 156, likes: 63, tags: ["文章", "评论", "用户"] })
  ],
  recentUpdates: [
    { id: "update-1", title: "关于页 UI 重构", description: "新版关于页保留意见通道，并改成更适合个人站的说明结构。", date: "2026-06-09", tags: ["关于"] },
    { id: "update-2", title: "杂谈回接入后台内容", description: "页面数据通过 talks.main 管理，前台可实时读取发布内容。", date: "2026-06-09", tags: ["杂谈回"] }
  ],
  topArticles: [
    { id: "article-1", title: "服务器部署记录", description: "从宝塔、PM2、Nginx 到 HTTPS 反代的完整部署过程。", href: "#posts", tags: ["部署"] },
    { id: "article-2", title: "放映会片源库整理", description: "如何把搜索抓取、片源库和排播归档串起来。", href: "#screenings", tags: ["放映会"] }
  ],
  newUploads: [
    { id: "upload-1", title: "本周图库导入", description: "来自本月杂谈批次的新作品已进入图库。", href: "#plaza", tags: ["图库"] },
    { id: "upload-2", title: "片源海报补全", description: "部分待放映片源更新了海报与简介。", href: "#screenings", tags: ["片源"] }
  ],
  topics: [
    { id: "topic-screening", title: "放映会", description: "排期、片源、历史归档和本周播放。", href: "#screenings", tags: ["电影", "动画"] },
    { id: "topic-gallery", title: "图库", description: "杂谈批次导入、同人作品展示与标签整理。", href: "#plaza", tags: ["作品", "标签"] },
    { id: "topic-workspace", title: "工作台", description: "内容发布、服务器监控和待办处理。", href: "#workspace", tags: ["管理", "监控"] }
  ]
};
