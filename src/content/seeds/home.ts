import type { FaqContent, HomeHeroContent } from "../types";

export const defaultHomeHero: HomeHeroContent = {
  badge: "站点功能地图",
  titlePrefix: "这里整理的是",
  highlight1: "放映会",
  highlight2: "与记录",
  subtitle: "一个围绕放映会排期、同人图库、杂谈文章、游戏记录和工作台管理搭建的个人内容站。",
  browserTitle: "站点预览 — 从浏览到发布的完整流程",
  browserStatus1: "实时",
  browserStatus2: "在线",
  chatMsg1: "想找本周放映会排期和片源库里的电影动画。",
  chatMsg2: "可以从放映会进入排期，也能在全量片源库里按分类、标签和时间线筛选。",
  chatMsg3: "我还想提交一张图库作品，站主审核后会发布吗？",
  chatThinking: "正在同步图库投稿、文章评论和服务器监控状态...",
  eventsTitle: "站点动态",
  events: ["放映会: 本周排期已更新", "图库: 新同人作品已发布", "工作台: 服务器监控运行中"],
  activityTitle: "内容",
  activityMemory: "监控",
  activityItem1: "最近更新",
  activityItem1Desc: "「放映 / 图库 / 杂谈 / 游戏」内容记录"
};

export const defaultHomeFaq: FaqContent = {
  title: "常见问题",
  items: [
    {
      question: "这个网站主要做什么？",
      answer: "这是一个个人内容站，用来整理放映会排期、电影动画片源、同人图库、杂谈回记录、文章和游戏库。首页负责说明入口，具体内容在各个页面持续更新。"
    },
    {
      question: "访客可以参与什么？",
      answer: "访客可以浏览全部公开内容；登录后可以提交图库作品、发送反馈、参与文章评论和点赞。投稿进入工作台由站主审核后发布到前台。"
    },
    {
      question: "图片上传保存在哪里？",
      answer: "支持本地存储和 S3 兼容对象存储（如 Cloudflare R2）。本地图片保存在 server/data/uploads 并自动生成 150/400/800 三档 WebP 缩略图，通过 /uploads 路径访问。"
    }
  ]
};
