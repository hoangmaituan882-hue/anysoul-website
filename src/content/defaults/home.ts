import type { FaqContent, HomeHeroContent } from "../types";

export const defaultHomeHero: HomeHeroContent = {
  badge: "站点功能地图",
  titlePrefix: "这里整理的是",
  highlight1: "放映会",
  highlight2: "与记录",
  subtitle: "一个围绕电影动画片源、同人图库、文章记录和站主工作台搭建的个人内容站。",
  browserTitle: "站点预览 — 从浏览到发布的完整流程",
  browserStatus1: "实时",
  browserStatus2: "在线",
  chatMsg1: "想找本周放映会和已经整理过的片源。",
  chatMsg2: "可以从放映会进入排期，也能在全量片源库里按电影、动画、杂谈和标签筛选。",
  chatMsg3: "我还想补充一个片源，站主审核后会展示吗？",
  chatThinking: "正在同步片源投稿、文章评论和监控状态...",
  eventsTitle: "站点动态",
  events: ["放映会: 本周排期已更新", "图库: 新同人作品已归档", "工作台: 服务器监控运行中"],
  activityTitle: "内容",
  activityMemory: "监控",
  activityItem1: "最近整理",
  activityItem1Desc: "「电影 / 动画 / 杂谈」片源记录"
};

export const defaultHomeFaq: FaqContent = {
  title: "常见问题",
  items: [
    {
      question: "这个网站主要做什么？",
      answer: "这是一个个人内容站，用来整理放映会排期、电影动画片源、同人图库、文章记录和站点动态。首页负责说明入口，具体内容会在各个页面持续更新。"
    },
    {
      question: "访客可以参与什么？",
      answer: "访客可以浏览公开内容；登录后可以提交片源、留下反馈、参与文章评论。投稿会进入工作台，由站主审核、补充信息后再发布。"
    },
    {
      question: "图片上传保存在哪里？",
      answer: "当前生产环境使用服务器本地存储。图片会保存到 server/data/uploads，并通过 api.linzesss.icu/uploads 访问。后续备份服务器时需要一起备份这个目录。"
    }
  ]
};
