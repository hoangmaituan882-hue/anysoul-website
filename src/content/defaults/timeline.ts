import type { TimelinePlansContent } from "../types";

export const defaultTimelinePlans: TimelinePlansContent = {
  plans: [
    {
      id: "plan-001",
      title: "PicFlow 图片服务集成",
      description: "集成 PicFlow API 作为可选图片服务后端，支持 AVIF/WebP/JPEG 智能格式检测和设备自适应。",
      status: "planned",
      tags: ["图片系统", "性能优化"],
      createdAt: new Date().toISOString()
    },
    {
      id: "plan-002",
      title: "评论系统",
      description: "为文章和图库添加用户评论功能，支持嵌套回复和点赞。",
      status: "planned",
      tags: ["社交", "互动"],
      createdAt: new Date().toISOString()
    },
    {
      id: "plan-003",
      title: "RSS 订阅",
      description: "为文章和杂谈回生成 RSS/Atom feed，支持播客客户端订阅。",
      status: "planned",
      tags: ["内容分发"],
      createdAt: new Date().toISOString()
    },
    {
      id: "plan-004",
      title: "全文搜索",
      description: "集成全文搜索引擎，支持跨文章、杂谈、图库的全局搜索。",
      status: "in-progress",
      tags: ["搜索", "UX"],
      createdAt: new Date().toISOString()
    },
    {
      id: "plan-005",
      title: "PWA 离线支持",
      description: "添加 Service Worker 和 Web App Manifest，支持离线浏览和添加到主屏幕。",
      status: "planned",
      tags: ["PWA", "移动端"],
      createdAt: new Date().toISOString()
    },
    {
      id: "plan-006",
      title: "暗色模式优化",
      description: "完善全站暗色模式适配，包括图片亮度调整和对比度增强。",
      status: "in-progress",
      tags: ["UI", "主题"],
      createdAt: new Date().toISOString()
    }
  ],
  updatedAt: new Date().toISOString()
};
