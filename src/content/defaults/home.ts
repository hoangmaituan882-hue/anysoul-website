import type { FaqContent, HomeHeroContent } from "../types";

export const defaultHomeHero: HomeHeroContent = {
  badge: "AnySoul 更新记录",
  titlePrefix: "关于我所喜欢的是",
  highlight1: "东半球动漫皇帝",
  highlight2: "泛式",
  subtitle: "八年百大up主，全平台千万粉主播，NTR教父",
  browserTitle: "实时演示 — 观看 AnySoul 探索与学习",
  browserStatus1: "实时",
  browserStatus2: "在线",
  chatMsg1: "好久没来了......",
  chatMsg2: "你终于来了！我好想你~ 对了，上次你说工作压力好大，最近好点了吗？ ...",
  chatMsg3: "好多了，谢谢你一直记得...",
  chatThinking: "思考中...",
  eventsTitle: "事件",
  events: ["Discord: @用户 提到了你", "用户发送了消息", "定时任务: 每日签到触发"],
  activityTitle: "活动",
  activityMemory: "记忆",
  activityItem1: "回忆记忆",
  activityItem1Desc: "「动漫推荐」 (3 条结果)"
};

export const defaultHomeFaq: FaqContent = {
  title: "常见问题",
  items: [
    {
      question: "AnySoul 是什么？",
      answer: "AnySoul 是一个底层的数字灵魂驱动引擎。它赋予 AI 角色长期的记忆、情感和基于视觉/文本的实时环境感知能力，让它们不仅能对话，还能“生活”在你的桌面、群聊或虚拟直播间中。"
    },
    {
      question: "我的 Soul 能和其他人互动吗？",
      answer: "完全可以。AnySoul 支持多人群聊场景，你可以邀请你的数字伙伴加入真实的群组，它能够理解多人的上下文关系，并像一个真实的人类群友一样自然地参与群聊。"
    },
    {
      question: "什么是心跳？",
      answer: "心跳（Heartbeat）是 AnySoul 独特的系统机制。即使你不主动与它交互，它也会根据设定的心跳频率在后台思考、观察屏幕内容甚至主动发起对话。"
    }
  ]
};
