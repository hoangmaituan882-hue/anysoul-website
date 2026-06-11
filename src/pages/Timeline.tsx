import { useState } from "react";
import { motion } from "motion/react";
import { TimelineJourney, type TimelineJourneyItem } from "../components/ui/timeline/TimelineJourney";
import { Sparkles, Calendar as CalendarIcon } from "lucide-react";

const defaultTimelineItems: TimelineJourneyItem[] = [
  {
    id: "school-1",
    type: "education",
    startDate: "2000-09",
    endDate: "2006-06",
    title: "小学时光",
    organization: "某市第一小学",
    location: "某市",
    description: "度过了六年快乐的小学时光，培养了最初的兴趣爱好。",
    skills: ["数学", "语文", "绘画"],
    featured: true
  },
  {
    id: "school-2",
    type: "education",
    startDate: "2006-09",
    endDate: "2009-06",
    title: "初中阶段",
    organization: "某市第一中学",
    location: "某市",
    description: "开始接触编程和计算机科学，对技术产生了浓厚兴趣。",
    achievements: ["市级数学竞赛二等奖", "校级三好学生"],
    skills: ["编程入门", "物理", "化学"],
    featured: true
  },
  {
    id: "school-3",
    type: "education",
    startDate: "2009-09",
    endDate: "2012-06",
    title: "高中时期",
    organization: "某市重点高中",
    location: "某市",
    description: "系统学习理科知识，开始自学编程和网络技术。",
    achievements: ["省科技创新大赛一等奖", "英语演讲比赛冠军"],
    skills: ["C语言", "网页设计", "Linux基础"],
    featured: true
  },
  {
    id: "uni",
    type: "education",
    startDate: "2012-09",
    endDate: "2016-06",
    title: "大学本科",
    organization: "某大学 - 计算机科学与技术",
    location: "某市",
    description: "专注于软件工程和前端开发方向，参加各类技术竞赛和开源项目。",
    achievements: ["国家奖学金", "ACM-ICPC 区域赛银牌"],
    skills: ["JavaScript", "React", "Node.js", "算法", "数据结构"],
    featured: true
  },
  {
    id: "work-1",
    type: "work",
    startDate: "2016-07",
    endDate: "2019-03",
    title: "前端开发工程师",
    organization: "某互联网公司",
    position: "中级前端工程师",
    location: "某市",
    description: "负责公司核心产品的前端架构设计和开发，参与多个大型项目。",
    achievements: ["主导完成公司主站从 jQuery 到 React 的技术迁移", "搭建前端组件库和自动化构建体系"],
    skills: ["React", "TypeScript", "Webpack", "CI/CD", "团队管理"],
    featured: true
  },
  {
    id: "work-2",
    type: "work",
    startDate: "2019-04",
    endDate: "2022-08",
    title: "高级前端工程师",
    organization: "某科技公司",
    position: "高级前端工程师 / 技术组长",
    location: "某市",
    description: "带领前端团队，负责多个产品线的技术方案设计和性能优化。",
    achievements: ["将核心应用性能提升 40%", "搭建微前端架构体系", "培养 5 名初级工程师成长"],
    skills: ["架构设计", "性能优化", "Node.js全栈", "团队管理"],
    featured: true
  },
  {
    id: "project-1",
    type: "project",
    startDate: "2020-01",
    endDate: "2020-12",
    title: "开源组件库项目",
    organization: "GitHub",
    position: "项目发起人",
    description: "发起并维护一个面向开发者的 React 组件库，获社区广泛使用。",
    achievements: ["GitHub 3000+ Stars", "npm 月下载量 10w+"],
    skills: ["React", "TypeScript", "Storybook", "开源社区"],
    links: [{ name: "GitHub", url: "https://github.com" }]
  },
  {
    id: "current",
    type: "work",
    startDate: "2022-09",
    title: "全栈开发工程师",
    organization: "个人 / 自由职业",
    position: "独立开发者",
    location: "远程",
    description: "专注于全栈开发和独立项目，持续探索 AI 与前端结合的创新应用。",
    skills: ["全栈开发", "AI应用", "React", "Node.js", "TypeScript"],
    featured: true
  },
  {
    id: "achievement-1",
    type: "achievement",
    startDate: "2023-06",
    title: "AI 应用大赛获奖",
    organization: "某开发者社区",
    description: "基于 AI 的智能内容管理平台获得年度创新应用奖。",
    skills: ["AI", "React", "Serverless"],
    links: [{ name: "项目详情", url: "https://example.com" }]
  }
];

export function Timeline() {
  const [items] = useState<TimelineJourneyItem[]>(defaultTimelineItems);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12 animate-in fade-in duration-700">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-black text-muted-foreground mb-4">
          <CalendarIcon className="size-3.5 text-primary" /> 人生时间线
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground mb-4">
          我的旅程
        </h1>
        <p className="text-muted-foreground text-base md:text-lg max-w-2xl leading-relaxed">
          一部从爱好到专业的旅程，记录学习、成长与创造的重要时刻。
          <Sparkles className="inline size-4 text-primary ml-1 mb-0.5" />
        </p>
      </motion.div>

      <TimelineJourney items={items} showStats />
    </div>
  );
}
