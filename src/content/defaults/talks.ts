import type { TalkItem, TalksContent } from "../types";

const fallbackTalk: TalkItem = {
  id: "talk-placeholder",
  title: "暂无杂谈内容",
  subtitle: "后台发布后显示。",
  date: "",
  time: "",
  duration: "0 min",
  coverUrl: "",
  status: "archived",
  category: "talk",
  host: "",
  guests: [],
  tags: [],
  summary: "",
  viewers: 0,
  danmaku: 0,
  likes: 0,
  transcript: [],
  comments: [],
  mentions: []
};

export const defaultTalksContent: TalksContent = {
  hero: {
    eyebrow: "Talk Archive",
    title: "杂谈",
    subtitle: "内容服务暂时不可用，后台发布后会显示真实内容。"
  },
  defaultCoverUrl: "",
  liveTalkId: "",
  live: fallbackTalk,
  upcoming: [],
  weekly: [],
  archive: [],
  recentUpdates: [],
  topArticles: [],
  newUploads: [],
  topics: []
};
