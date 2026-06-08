# 网站现状与服务器部署上线差距分析

更新时间：2026-06-08

## 1. 当前网站定位

当前项目已经从静态展示页演进为一个具备前后端分离、后台工作台、账号系统和 PostgreSQL 内容存储的内容管理网站。

当前适合继续发展为：

- 个人博客网站
- 内容记录网站
- 图库管理网站
- 放映会/活动管理网站
- 多人投稿审核网站
- 小型社区内容管理系统

当前网站已经具备上线测试基础，但距离正式公网长期运营仍有功能、安全、部署和运维层面的差距。

## 2. 当前技术结构

### 2.1 前端

前端技术栈：

- React 19
- Vite
- TypeScript
- Tailwind CSS
- motion/react
- lucide-react

主要目录：

```text
src/
├── pages/
│   ├── Workspace.tsx
│   ├── Plaza.tsx
│   ├── Screenings.tsx
│   ├── Gaming.tsx
│   ├── About.tsx
│   └── Changelog.tsx
├── workspace/
│   ├── ContentAdminPanel.tsx
│   ├── PlazaAdminPanel.tsx
│   ├── ScreeningsAdminPanel.tsx
│   ├── GamingAdminPanel.tsx
│   └── UserAdminPanel.tsx
├── content/
│   ├── client.ts
│   ├── types.ts
│   └── defaults/
├── contexts/
│   ├── AuthContext.tsx
│   └── ThemeLanguageContext.tsx
└── components/
```

前端当前支持：

- 前台页面访问
- 工作台后台访问
- 登录/注册状态管理
- 工作台只读/可编辑权限区分
- 内容管理
- 图库卡片编辑
- 每周图库批量导入
- 放映会内容编辑
- 用户管理
- 内容保存和发布
- 网站访问统计查看
- 手机端工作台单列浏览优化

### 2.2 后端

后端技术栈：

- Node.js
- Express
- TypeScript/tsx
- PostgreSQL
- pg
- dotenv

主要目录：

```text
server/
├── index.ts
├── schema.sql
└── data/
```

后端 API：

```text
http://localhost:8787
```

说明：`8787` 是 API 服务，浏览器直接打开看到 JSON 或文字是正常现象，不是工作台页面。

当前后端提供：

- 健康检查
- 公开内容读取
- 后台内容读取
- 草稿保存
- 内容发布
- 批量内容操作
- 用户注册
- 用户登录
- 用户管理
- 投稿提交
- 投稿审核
- 访问统计上报
- 放映会片源辅助接口
- AI 设置接口

### 2.3 数据库

当前已经安装并配置本机 PostgreSQL 16。

本机数据库信息：

```text
数据库：anysoul
用户：anysoul
密码：anysoul_dev_password
端口：5432
```

当前 `.env`：

```env
DATABASE_URL="postgres://anysoul:anysoul_dev_password@localhost:5432/anysoul"
```

健康检查已确认：

```json
{
  "database": {
    "configured": true,
    "connected": true,
    "authSchemaReady": true
  },
  "contentStore": {
    "mode": "postgres"
  }
}
```

这表示当前已经进入真实 PostgreSQL 内容模式，不再是本地演示账号或 JSON 文件内容模式。

## 3. 当前数据库表

`server/schema.sql` 当前包含：

```text
auth_users
auth_sessions
user_watched_sources
content_meta
content_entries
content_events
posts
post_revisions
media_assets
artwork_items
content_submissions
screening_sources
screening_weeks
```

### 3.1 账号表

```text
auth_users
auth_sessions
```

用途：

- 用户注册
- 用户登录
- 会话管理
- 用户角色
- 用户启用/禁用

当前角色：

| 角色 | 权限 |
|---|---|
| owner | 站主，拥有全部权限 |
| admin | 管理员，可控制工作台内容 |
| user | 普通用户，只读或有限功能 |

第一个正式数据库注册账号会自动成为 `owner`。

### 3.2 内容发布表

```text
content_meta
content_entries
content_events
```

用途：

- 保存现有网站内容
- 保存草稿
- 保存已发布内容
- 保存版本号
- 保存发布时间
- 保存发布、审核、草稿事件

当前现有页面内容已经通过 `content_entries` 数据库存储，包括：

- 首页内容
- FAQ
- 游戏回内容
- 放映会内容
- 图库内容
- 用户投稿内容
- 站点统计内容

当前内容条目曾验证为：

```text
content_entries: 14
content_events: 2
```

### 3.3 博客/记录表

```text
posts
post_revisions
```

用途：

- 博客文章
- 个人记录
- 用户投稿文章
- 草稿、待审核、已发布、隐藏状态
- 文章历史版本

当前状态：数据库表已预留，但前端文章系统还没有完整实现。

### 3.4 图库/媒体表

```text
media_assets
artwork_items
```

用途：

- 图片资源
- 缩略图
- 文件元数据
- 同人图库作品
- 每周导入批次
- 系列周数
- 图片发布状态

当前状态：图库仍主要通过 `content_entries.key = 'plaza.main'` 兼容保存，结构化图库表已预留。

### 3.5 投稿表

```text
content_submissions
```

用途：

- 用户投稿
- 用户反馈
- 图库投稿
- 文章投稿
- 放映会片源投稿
- 审核状态

当前状态：旧投稿仍通过 `screenings.sourceSubmissions` 和 `feedback.submissions` 兼容，统一投稿表已预留。

### 3.6 放映会表

```text
screening_sources
screening_weeks
user_watched_sources
```

用途：

- 放映会片源库
- 周排期
- 用户看过记录

当前状态：放映会 UI 仍兼容 `content_entries`，结构化表已预留。

## 4. 当前已经完成的能力

### 4.1 前后端分离

当前已经可以分离运行：

```text
前端开发：http://localhost:3000
前端生产预览：http://localhost:4173
后端 API：http://localhost:8787
```

公网部署时前端可以独立部署到静态服务，后端可以独立部署为 API 服务。

### 4.2 PostgreSQL 真实数据库模式

已完成：

- PostgreSQL 安装
- 数据库创建
- 用户创建
- schema 初始化
- 后端切换到 postgres 内容模式
- 旧内容导入数据库

### 4.3 注册登录

当前支持：

- 用户注册
- 用户登录
- 会话保存
- 当前用户接口
- 退出登录
- PostgreSQL 真实账号模式

注意：切换到真实数据库后，本地演示账号不再有效，需要重新注册正式数据库账号。

### 4.4 工作台

工作台当前支持：

- 内容管理
- 放映会控制
- 图库中心控制
- 网站监控
- 用户管理
- AI 设置
- 用户投稿审核
- 事件区域
- 待办区域
- 动态统计区域
- 时间轴区域

手机端工作台已经优化为：

```text
动态统计
事件区域
待办区域
时间轴
```

### 4.5 图库中心

当前图库支持：

- 图库作品列表
- 单张卡片编辑
- 标题编辑
- 作者编辑
- 图片地址编辑
- 标签编辑
- 简介编辑
- 显示状态编辑
- 精选状态编辑
- 每周批量导入

每周导入规则：

```text
2026-01-01 起算为第 1 周
2026-06-07 属于第 23 周
```

导入时会自动生成：

- 第 N 周杂谈标题
- 每周杂谈标签
- 年度周数标签
- 导入日期标签
- 批次 ID
- 批次序号

### 4.6 放映会

当前放映会支持：

- 下周播放配置
- 片源库维护
- 排播周期
- 用户片源补充
- 投稿审核
- 媒体信息刮削设置
- AI 补全入口

### 4.7 网站监控

当前支持：

- 总浏览量
- 独立访客
- 最近访问
- 页面访问频率

## 5. 当前主要缺口

### 5.1 文章系统 UI 尚未完整实现

虽然已有 `posts` 和 `post_revisions` 表，但还缺：

- 文章列表页
- 文章详情页
- 文章编辑器
- Markdown 或富文本编辑
- 作者自己的文章管理
- 投稿审核流程
- 文章分类和标签管理

这是距离博客/记录网站最大的功能缺口。

### 5.2 图库仍未完全结构化

当前图库主要保存在 `content_entries.key = 'plaza.main'`。

这短期可用，但长期图库数量变多后建议迁移到：

```text
artwork_items
media_assets
```

### 5.3 图片上传系统尚未实现

当前图库主要使用图片 URL。

还缺：

- 本地图片上传 API
- 文件大小限制
- 图片格式校验
- 缩略图生成
- 图片删除
- 对象存储接入
- 上传权限控制

正式公网部署建议使用：

- Cloudflare R2
- S3
- 阿里云 OSS
- 腾讯云 COS

### 5.4 普通用户创作权限不完整

当前权限主要用于后台控制。

如果要让别人注册后写文章或投稿，需要补：

- 普通用户个人中心
- 我的草稿
- 我的投稿
- 用户只能编辑自己的内容
- 管理员审核后发布
- 发布后修改是否重新审核

### 5.5 内容版本和审计仍是基础级

当前已经有基础版本冲突字段：

```text
version
updated_at
expectedVersion
expectedUpdatedAt
```

但正式多人协作还需要：

- 更完整的修订历史
- 操作日志
- 回滚能力
- 审核日志
- 编辑冲突提示

### 5.6 生产安全还不足

上线前还需要补：

- HTTPS
- CORS 严格白名单
- 登录限流
- 注册限流
- 密码策略
- 找回密码
- 邮箱验证
- 防垃圾注册
- 错误日志
- 数据库备份
- 上传安全扫描

## 6. 距离服务器部署上线的差距

### 6.1 已经具备上线测试条件

当前已经具备：

- 前后端分离运行
- PostgreSQL 数据库
- 真实账号注册登录
- 内容发布状态数据库化
- 后台工作台
- 图库和放映会管理
- 生产构建通过

因此可以进行服务器测试部署。

### 6.2 还不能算正式运营版本

原因：

- 文章系统还没有完整前台/后台 UI
- 图片上传和对象存储未接入
- 普通用户投稿/创作流程不完整
- 生产安全和备份策略未完成
- 后端还没有生产进程管理配置
- 没有域名、HTTPS 和反向代理配置

## 7. 推荐上线阶段

### 阶段 1：服务器测试部署

目标：让网站公网可访问，站主可以登录后台发布内容。

预计时间：0.5 到 1 天。

需要完成：

- 准备服务器
- 安装 Node.js
- 安装 PostgreSQL 或使用托管 PostgreSQL
- 上传项目代码
- 配置 `.env`
- 执行 `npm install`
- 执行 `npm run db:init`
- 执行 `npm run build`
- 启动后端 API
- 部署前端 `dist/`
- 配置前端 API 地址
- 配置 CORS

### 阶段 2：公网可用 MVP

目标：别人可以访问网站，站主可以发布内容，用户可以注册登录。

预计时间：1 到 3 天。

需要完成：

- 域名解析
- HTTPS
- Nginx 反代
- PM2 或 systemd 后端守护
- 正式 PostgreSQL 备份策略
- 注册登录验证
- 站主账号验证
- 内容发布验证

### 阶段 3：博客/记录系统

目标：成为真正的博客/记录网站。

预计时间：2 到 5 天。

需要完成：

- 文章列表页
- 文章详情页
- 文章编辑器
- 用户文章草稿
- 文章发布状态
- 管理员审核
- 分类和标签
- 搜索和分页

### 阶段 4：图库和投稿结构化

目标：图库和投稿从兼容内容条目迁移到专用表。

预计时间：3 到 7 天。

需要完成：

- 图片上传
- 对象存储
- `artwork_items` CRUD
- `media_assets` CRUD
- `content_submissions` 统一投稿
- 投稿审核队列
- 普通用户投稿入口

### 阶段 5：正式生产运营

目标：可长期运行。

预计时间：1 到 2 周以上。

需要完成：

- 监控
- 日志
- 备份
- 回滚
- 安全限流
- 邮件服务
- 上传安全
- 权限细化
- 数据迁移脚本
- 管理员操作审计

## 8. 前后端分离部署建议

### 8.1 前端

构建：

```powershell
npm run build
```

部署目录：

```text
dist/
```

前端环境变量：

```env
VITE_CONTENT_API_URL="https://api.example.com"
```

可部署到：

- Nginx 静态目录
- Vercel
- Netlify
- Cloudflare Pages
- 对象存储静态网站

### 8.2 后端

后端环境变量：

```env
CONTENT_API_PORT="8787"
DATABASE_URL="postgres://user:password@host:5432/anysoul"
CONTENT_API_CORS_ORIGINS="https://example.com"
APP_URL="https://example.com"
OWNER_ACCOUNT_IDS="站主邮箱或ID"
```

后端启动：

```powershell
npm run server:dev
```

正式生产建议改成 PM2 或 systemd 管理。

PM2 示例：

```bash
pm2 start "npm run server:dev" --name anysoul-api
pm2 save
```

### 8.3 Nginx 示例

```nginx
server {
  listen 80;
  server_name example.com;

  root /var/www/anysoul/dist;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }
}

server {
  listen 80;
  server_name api.example.com;

  location / {
    proxy_pass http://127.0.0.1:8787;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

正式上线需要再加 HTTPS。

## 9. 当前启动测试方式

后端健康检查：

```text
http://localhost:8787/api/health
```

前端开发：

```text
http://localhost:3000
```

生产预览：

```text
http://localhost:4173
```

PostgreSQL 初始化：

```powershell
npm run db:init
```

注册第一个正式账号后，该账号会成为站主。

## 10. 总体评估

当前网站已经完成了服务器部署前最关键的基础：

- 前后端分离
- PostgreSQL 数据库
- 真实账号系统
- 内容发布系统
- 工作台管理后台
- 图库和放映会管理能力

距离公网测试部署：较近。

距离正式博客/记录网站：还需要补文章系统 UI、普通用户创作流程、图片上传和对象存储。

距离长期运营生产站点：还需要补安全、备份、监控、HTTPS、进程守护和审计能力。

推荐下一步优先级：

1. 完成服务器前后端分离测试部署。
2. 补文章/记录系统 UI。
3. 补普通用户投稿和审核流程。
4. 接入对象存储图片上传。
5. 做生产安全、备份和监控。
