import type { FeedbackSubmissionsContent } from "../types";

export const defaultFeedbackSubmissions: FeedbackSubmissionsContent = {
  items: [
    {
      id: "feedback-test-copyright",
      category: "copyright",
      title: "测试意见：关于页版权声明需要更醒目",
      content: "这是一条占位测试反馈，用于验证游客提交意见进入后台待办、点击二级详情、审核同意或拒绝的完整流程。",
      contact: "visitor@example.com",
      submitter: "测试游客",
      status: "pending",
      createdAt: "2026-06-07T12:00:00+08:00"
    },
    {
      id: "feedback-test-feature",
      category: "feature",
      title: "测试建议：希望放映会页面增加筛选",
      content: "建议片源库支持按照动画、电影、已看过等维度快速筛选；这条用于测试管理员在工作台待办中处理意见反馈。",
      submitter: "测试用户C",
      status: "pending",
      createdAt: "2026-06-07T12:30:00+08:00"
    }
  ]
};
