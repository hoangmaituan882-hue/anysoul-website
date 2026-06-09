import type { TalkItem, TalksContent } from "../types";

const defaultTranscript = [
  { time: "00:00", speaker: "主持人：", text: "晚上好，欢迎来到本周杂谈回。今天从放映会、录像归档和站点更新聊起。" },
  { time: "04:18", speaker: "嘉宾 A：", text: "把杂谈内容沉淀成可检索的录像库，比只放一个外链更方便后续回看。" },
  { time: "12:40", speaker: "主持人：", text: "每期会保留摘要、高光、逐字稿和提到的作品，方便快速定位重点。" },
  { time: "28:12", speaker: "嘉宾 B：", text: "后台直接发布的流程适合个人站维护，少一步草稿确认，更新也更轻。" },
  { time: "43:05", speaker: "主持人：", text: "后续 AI 只负责生成可编辑草稿，最终内容仍由站主确认后发布。" }
];

const defaultComments = [
  { author: "观众", content: "录像库和时间轴高光很有用，回看时不用从头找。", time: "21:40" },
  { author: "站内用户", content: "希望之后能按放映会、图库、站点更新分类筛选。", time: "24:16" },
  { author: "管理员", content: "后台会继续补齐摘要、逐字稿和外链维护。", time: "35:02" }
];

const defaultMentions = [
  {
    title: "放映会片源库",
    type: "站内模块",
    score: "持续维护",
    tags: ["电影", "动画", "归档"],
    summary: "杂谈中提到的长期内容库，用来承接待放映、已归档和用户投稿片源。"
  },
  {
    title: "图库导入流程",
    type: "站点更新",
    score: "优化中",
    tags: ["图库", "杂谈", "批次"],
    summary: "围绕每周杂谈批次整理作品，保留导入日期、周数和标签信息。"
  }
];

function createTalk(overrides: Partial<TalkItem>): TalkItem {
  return {
    id: "talk-default",
    episodeNo: 1,
    title: "杂谈回：网站内容如何沉淀",
    subtitle: "从放映会、图库、文章到工作台的一次站内整理",
    date: "2026-06-09",
    time: "20:30",
    duration: "48 min",
    coverUrl: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1400&q=80",
    status: "archived",
    category: "talk",
    host: "Linze",
    guests: ["站内记录", "内容工作台"],
    tags: ["站点更新", "放映会", "图库"],
    summary: "这一期杂谈回围绕站点内容如何从临时记录变成长期归档展开，串联放映会片源库、图库导入、文章评论和服务器监控。",
    summaryBullets: [
      "说明杂谈回和录像库的关系",
      "确认录像库第一版使用外链保存",
      "梳理 AI 摘要、高光和逐字稿的后台流程"
    ],
    highlights: [
      { time: "04:18", desc: "讨论为什么需要杂谈录像库" },
      { time: "12:40", desc: "确认每期保留摘要、高光和逐字稿" },
      { time: "43:05", desc: "说明 AI 只生成可编辑草稿" }
    ],
    viewers: 1280,
    danmaku: 342,
    likes: 96,
    sourceUrl: "https://www.bilibili.com/",
    videoUrl: "https://www.bilibili.com/",
    videoProvider: "bilibili",
    animeMentions: 2,
    isFeatured: true,
    isLiked: false,
    transcript: defaultTranscript,
    comments: defaultComments,
    mentions: defaultMentions,
    ...overrides
  };
}

export const defaultTalksContent: TalksContent = {
  hero: {
    eyebrow: "Talk Archive",
    title: "杂谈回",
    subtitle: "把每周讨论、站点更新和内容线索整理成可以检索、回看和继续补充的长期记录。"
  },
  live: createTalk({
    id: "talk-live-2026-06-09",
    episodeNo: 6,
    title: "本周杂谈：内容入口重新整理",
    subtitle: "首页、关于页、放映会和图库之间的关系",
    status: "live",
    date: "2026-06-09",
    time: "21:00",
    duration: "直播中",
    category: "talk",
    tags: ["直播中", "站点更新", "内容结构"]
  }),
  upcoming: [
    { id: "upcoming-1", date: "2026-06-14", time: "20:00", title: "下周放映前瞻", topic: "待补充片源与归档逻辑", tags: ["放映会", "片源库"] },
    { id: "upcoming-2", date: "2026-06-21", time: "20:30", title: "图库整理回", topic: "杂谈批次、导入日期与作品展示", tags: ["图库", "同人作品"] },
    { id: "upcoming-3", date: "2026-06-28", time: "21:00", title: "站点维护记录", topic: "服务器监控、反馈待办与部署复盘", tags: ["工作台", "监控"] }
  ],
  weekly: [
    { id: "week-1", date: "周一", time: "19:30", title: "内容巡检", topic: "检查投稿、评论和反馈", tags: ["工作台"] },
    { id: "week-2", date: "周二", time: "20:30", title: "录像整理", topic: "补充外链、封面和摘要", tags: ["录像库"] },
    { id: "week-3", date: "周三", time: "21:00", title: "片源补全", topic: "补海报、简介、来源链接", tags: ["片源库"] },
    { id: "week-4", date: "周四", time: "20:30", title: "话题归档", topic: "整理近期动态和热门入口", tags: ["话题"] },
    { id: "week-5", date: "周五", time: "21:00", title: "AI 摘要检查", topic: "人工确认高光和逐字稿", tags: ["AI"] },
    { id: "week-6", date: "周六", time: "20:00", title: "开放补充", topic: "收集投稿、评论和想看的话题", tags: ["互动"] },
    { id: "week-7", date: "周日", time: "20:00", title: "杂谈回更新", topic: "发布本周记录并沉淀归档", tags: ["发布"] }
  ],
  archive: [
    createTalk({ id: "talk-2026-06-02", episodeNo: 5, title: "杂谈回：服务器部署之后", date: "2026-06-02", time: "20:30", viewers: 960, danmaku: 188, likes: 72, category: "special", tags: ["部署", "服务器", "监控"] }),
    createTalk({ id: "talk-2026-05-26", episodeNo: 4, title: "杂谈回：图库导入和周数标签", date: "2026-05-26", time: "21:10", viewers: 1180, danmaku: 266, likes: 81, category: "selected", tags: ["图库", "导入", "标签"], isFeatured: true }),
    createTalk({ id: "talk-2026-05-19", episodeNo: 3, title: "杂谈回：放映会历史怎么看", date: "2026-05-19", time: "20:00", viewers: 1320, danmaku: 301, likes: 104, category: "talk", tags: ["放映会", "电影", "动画"], isLiked: true }),
    createTalk({ id: "talk-2026-05-12", episodeNo: 2, title: "杂谈回：文章记录与评论", date: "2026-05-12", time: "20:45", viewers: 880, danmaku: 156, likes: 63, category: "talk", tags: ["文章", "评论", "用户"] })
  ],
  recentUpdates: [
    { id: "upd1", title: "本周杂谈录像已归档", description: "补充直播摘要、时间轴高光、相关链接和逐字稿。", date: "2026-06-09", tags: ["录像库", "杂谈回"] },
    { id: "upd2", title: "新增 AI 摘要辅助", description: "后台可粘贴原始文本生成摘要、高光和标签建议。", date: "2026-06-09", tags: ["AI", "工作台"] }
  ],
  topArticles: [
    { id: "article-1", title: "服务器部署记录", description: "从宝塔、PM2、Nginx 到 HTTPS 反代的完整部署过程。", href: "#posts", tags: ["部署"] },
    { id: "article-2", title: "放映会片源库整理", description: "如何把搜索抓取、片源库和排播归档串起来。", href: "#screenings", tags: ["放映会"] }
  ],
  newUploads: [
    { id: "upload-1", title: "六月杂谈录像整理.pdf", description: "本月杂谈回录像和摘要索引。", href: "#talks", tags: ["录像库"] },
    { id: "upload-2", title: "杂谈回话题补充.md", description: "下一期可展开的话题和观众留言。", href: "#talks", tags: ["话题"] }
  ],
  topics: [
    { id: "upd1", title: "本周杂谈录像已归档", description: "补充直播摘要、时间轴高光、相关链接和逐字稿。", date: "2026-06-09", tags: ["录像库", "杂谈回"] },
    { id: "upd2", title: "新增 AI 摘要辅助", description: "后台可粘贴原始文本生成摘要、高光和标签建议。", date: "2026-06-09", tags: ["AI", "工作台"] },
    { id: "topic-screening", title: "放映会", description: "排期、片源、历史归档和本周播放。", href: "#screenings", tags: ["电影", "动画"] },
    { id: "topic-gallery", title: "图库", description: "杂谈批次导入、同人作品展示与标签整理。", href: "#plaza", tags: ["作品", "标签"] }
  ]
};
