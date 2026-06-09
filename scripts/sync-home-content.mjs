import "dotenv/config";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is required. Run this on the server after creating .env.");
  process.exit(1);
}

const defaultHomeHero = {
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

const defaultHomeFaq = {
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

const entries = [
  { key: "home.hero.main", type: "home.hero", content: defaultHomeHero },
  { key: "home.faq.items", type: "home.faq", content: defaultHomeFaq }
];

const pool = new Pool({ connectionString: databaseUrl });
const client = await pool.connect();

try {
  await client.query("begin");

  for (const entry of entries) {
    await client.query(
      `insert into content_entries (key, type, status, draft, published, version, updated_at, published_at)
       values ($1, $2, 'published', $3, $3, 1, now(), now())
       on conflict (key) do update set
         type = excluded.type,
         status = 'published',
         draft = excluded.draft,
         published = excluded.published,
         version = content_entries.version + 1,
         updated_at = now(),
         published_at = now()`,
      [entry.key, entry.type, JSON.stringify(entry.content)]
    );
  }

  const meta = await client.query(
    `insert into content_meta (id, site_version, updated_at)
     values ('main', 2, now())
     on conflict (id) do update set site_version = content_meta.site_version + 1, updated_at = now()
     returning site_version`
  );
  const siteVersion = Number(meta.rows[0]?.site_version || 1);

  await client.query(
    `insert into content_events (id, type, keys, version, message, actor_id, actor_name, actor_role, created_at)
     values ($1, 'content.published', $2, $3, $4, 'deploy-script', 'Deploy Script', 'admin', now())`,
    [`event-home-content-${Date.now()}`, entries.map((entry) => entry.key), siteVersion, "同步首页功能介绍文案"]
  );

  await client.query("commit");
  console.log("Home content synchronized:");
  for (const entry of entries) console.log(`- ${entry.key}`);
} catch (error) {
  await client.query("rollback");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}
