# AnySoul AI Development Reference

更新时间：2026-06-07

这份文档给后续 AI 开发者快速接手当前网站使用。它补充 `DESIGN_REFERENCE.md`：后者偏设计语言与组件视觉规范；本文偏项目结构、页面审阅、代码风险和改动流程。

## 结论概览

- 项目是 Vite + React 19 + Tailwind CSS v4 + `motion/react` 的单页站点，使用 `window.location.hash` 做轻量路由。
- 生产构建通过，`cmd /c npm run lint` 通过，`cmd /c npm run build` 通过。
- 构建产物的主 JS chunk 约 `764 KB`，Vite 已提示超过 500 KB，后续建议按路由拆分。
- 主要路由在桌面和移动宽度均可加载，无控制台错误，无全局横向滚动。
- 视觉语言已经形成：温和 SaaS 底色、圆角卡片、橄榄绿主色、媒体页面重图像、工作台高密度面板、VHS 子系统独立复古风。
- 内容系统已存在：本地 Express 内容 API、草稿/发布模型、SSE 实时同步、工作台管理面板。
- 最大维护风险不是框架，而是大文件、硬编码内容、CMS 未完全接入、外链图片稳定性、以及后台 API 缺少认证。

## 技术栈

- 前端：React 19、TypeScript、Vite 6、Tailwind CSS v4。
- 动效：`motion/react`，大量用于入场、弹窗、轮播、折叠和 SVG 绘制。
- 图标：`lucide-react`。
- 样式工具：`clsx` + `tailwind-merge`，统一通过 `cn()` 组合 class。
- 内容服务：Express + JSON 文件存储，入口在 `server/index.ts`。
- 本地内容端口：默认 `http://localhost:8787`。
- 前端开发端口：`npm run dev` 默认 `http://localhost:3000`。

验证命令：

```bash
cmd /c npm run lint
cmd /c npm run build
cmd /c npm run server:dev
cmd /c npm run dev
```

注意：在当前 Windows/PowerShell 环境里直接运行 `npm run ...` 可能触发 `npm.ps1` 执行策略限制，优先用 `cmd /c npm run ...`。

## 路由地图

路由集中在 `src/App.tsx`，通过 `window.location.hash` 切换：

- `/`：首页，组合 `Hero`、成长流程、功能 Bento、场景跑马灯、价格、评论跑马灯、FAQ。
- `#plaza`：图库/广场，搜索、排序、标签筛选、瀑布流卡片。
- `#screenings`：放映会，统计、排播、片源库、候选片、历史和 tier list。
- `#games`：游戏页，轮播、分类、最近游玩、探索卡片和详情弹窗。
- `#workspace`：工作台，不显示 Header，桌面优先的多面板后台。
- `#about`：静态说明页。
- `#changelog`：路线图和更新日志。

后续如果增加路由，先看 `src/App.tsx` 是否需要保持现有 wrapper：普通页面用 Header + Footer，工作台用 `h-screen overflow-hidden`。

## 内容数据流

入口层级：

- `src/main.tsx` 用 `ContentProvider` 包裹 `App`。
- `src/content/ContentProvider.tsx` 启动时请求 `/api/public/bootstrap`。
- `useContent(key, fallback)` 从内容上下文读取发布内容，不可用时回退到 `src/content/defaults/*`。
- `ContentProvider` 还连接 `/api/realtime/content`，发布后通过 SSE 刷新指定 keys。

内容 key：

- `home.hero.main`
- `home.faq.items`
- `gaming.main`
- `screenings.next`
- `screenings.todo`
- `screenings.schedule`
- `screenings.classics`
- `screenings.anime`
- `screenings.stats`
- `screenings.library`
- `plaza.main`

后台 API：

- 公共读取：`/api/public/bootstrap`、`/api/public/content?keys=...`
- 内容管理：`/api/admin/content`、`PATCH /api/admin/content/:key/draft`、`POST /api/admin/content/:key/publish`
- 媒体抓取：`/api/admin/media/search`、`/api/admin/media/settings`
- 实时同步：`/api/realtime/content`

重要约束：当前 admin API 没有认证、授权或 CSRF 防护，只适合作为本地/原型内容服务。若要部署到公网，必须先补认证和访问控制。

## 设计系统速记

详细视觉规范见 `DESIGN_REFERENCE.md`。后续 AI 改 UI 时遵循这些核心点：

- 主背景：`#fbfaf8`，暗色背景：`#09090b`。
- 主色：橄榄绿 `#869e71`，暗色主色 `#abc378`。
- 卡片：白底或 token `bg-card`，轻边框，轻阴影，大圆角。
- 普通 UI 优先使用语义 token：`bg-background`、`text-foreground`、`border-border`、`text-muted-foreground`。
- 页面级营销区块可以宽松、情绪化；工作台必须紧凑、面板化、信息密集。
- 媒体页以图片和卡片为第一视觉，不要退化成纯表格。
- VHS 组件是独立复古子系统，扫描线、磁带、CRT 等效果不要扩散到普通页面。
- 继续使用 `lucide-react` 图标和 Tailwind utility，避免引入新的 UI 库。

## 组件与页面审阅

### Header

文件：`src/components/Header.tsx`

- 固定顶部、居中、胶囊导航。
- 滚动后变为磨砂卡片。
- 桌面端有下拉“腿”控件：主题、语言、VHS。
- 工作台路由传入 `isWorkspace` 后直接不渲染 Header。

注意：Header 里导入了部分未使用图标，后续整理时可顺手清理，但不要为此单独大改。

### Home

核心文件：`src/components/Hero.tsx`、`GrowWithYouSection.tsx`、`FeaturesBento.tsx`、`ScenariosMarquee.tsx`、`Pricing.tsx`、`MarqueeSection.tsx`、`FAQSection.tsx`

- 首页视觉完成度较高，中心是 Hero 的手写 SVG 和产品 mock browser。
- `Hero` 和 `FAQSection` 已接入内容系统。
- 跑马灯和 Hero SVG 会有可视区域外元素，但 body 没有横向滚动，属于预期视觉实现。

### Plaza

核心文件：`src/pages/Plaza.tsx`、`src/components/SoulImageCard.tsx`

- `plaza.main` 已接入内容系统。
- 使用 CSS columns 做瀑布流：`columns-1 sm:columns-2 md:columns-3 xl:columns-4`。
- 卡片结构清晰，适合继续扩展 metadata、tag、featured 等状态。

风险点：

- `SoulImageCard` 调用了 `t("plaza.filter.featured")`，但翻译表未定义这个 key。运行时精选徽章文字会为空。后续应给 zh/ja/en 都补上。
- `Plaza.tsx` 有 `infoFilter = hidden`，但列表先过滤了 `visibility === "visible"`，所以它不是“显示隐藏作品”的开关，只是控制卡片详情显示模式。若产品语义要变，需要重命名或重写过滤逻辑。

### Screenings

核心文件：`src/pages/Screenings.tsx`、`src/workspace/ScreeningsAdminPanel.tsx`

- 放映会是当前最复杂页面，包含统计、排播横轴、片源库、筛选、详情侧栏、提名弹窗、tier list、历史时间线。
- `screenings.*` 多个 key 已接入内容系统。
- 工作台放映会面板负责下周放映、片源库、媒体 metadata 抓取和发布。

风险点：

- `src/pages/Screenings.tsx` 约 104 KB，已经过大。新增复杂逻辑前应拆分为 `ScreeningHeroStats`、`ScheduleRail`、`SourceLibraryModal`、`TierList`、`HistoryTimeline` 等组件。
- 页面内仍保留若干旧 mock 常量，虽然现在多数被内容系统数据覆盖，但会干扰后续 AI 判断数据来源。
- 放映会桌面和移动均无 body 横向滚动，但横轴/卡片存在刻意越界布局，改动时要用浏览器复测。

### Gaming

核心文件：`src/pages/Gaming.tsx`、`src/workspace/GamingAdminPanel.tsx`

- 页面视觉上是游戏 dashboard + 发现页，图片和卡片丰富。
- 当前 `Gaming.tsx` 主要仍使用本地硬编码数组，没有读取 `gaming.main`。
- `GamingAdminPanel.tsx` 存在，但 `Workspace.tsx` 当前未导入使用它，工作台里的游戏 tab 是内联占位/接口设定 UI。

风险点：

- 如果后续要做可视化运营游戏页，先把 `Gaming.tsx` 改为 `useContent<GamingMainContent>("gaming.main", defaultGamingMain)`。
- 再把 `GamingAdminPanel` 接入 `Workspace.tsx`，避免后台保存了但前台不变化。
- 当前浏览器检查中，游戏页有若干 Unsplash 外链图片加载失败。建议把关键视觉图转为稳定资源、项目 assets、或可控 CDN。

### Workspace

核心文件：`src/pages/Workspace.tsx`、`src/workspace/*AdminPanel.tsx`

- 工作台是桌面优先，不应套用营销页的大标题和大留白。
- 已有内容管理、放映会控制、图库控制；游戏控制尚未真正接入专用 admin panel。
- 大量状态使用 `useLocalStorage` 保存 tab/view 偏好。

风险点：

- `Workspace.tsx` 约 84 KB，继续扩展前应拆分左栏、事件/待办、主控制区、底部时间轴、设置抽屉。
- 移动宽度下 body 无横向滚动，但主面板实际向右延伸，属于桌面优先设计；若要求手机可用，需要专门设计移动布局，而不是简单缩放。

### VHS

核心文件：`src/components/vhs/*`

- VHS modal 是独立体验，包含磁带 shelf、CRT player、scanline effects、插入动画。
- 继续保持独立，不要把 VHS 的视觉噪声混进正常 SaaS 页面。

## 浏览器检查结果

检查环境：

- 桌面视口：默认约 1280 宽。
- 移动视口：390 x 844。
- 内容 API：`http://localhost:8787`。
- 前端：`http://localhost:3000`。

结果：

- 首页、图库、放映会、游戏、工作台、关于、更新日志均可加载。
- 桌面和移动下均未出现 body 级横向滚动。
- 控制台无 error/warn。
- 生产构建通过，但 Vite 警告主 chunk 超过 500 KB。
- `index.html` 标题仍是 `My Google AI Studio App`，需要改成项目名。
- `index.html` 的 `lang="en"` 与默认中文内容不一致，建议改为 `zh-CN` 或由语言状态动态管理。
- README 仍是 AI Studio 默认模板，不足以指导真实项目运行。

## 代码审查发现

### P1：后台 API 不能直接公网部署

`server/index.ts` 的 `/api/admin/*` 没有鉴权。任何能访问服务的人都可以读写草稿、发布内容、改媒体抓取设置。

建议：

- 本地原型可保留现状。
- 公网前至少加 admin token、session、origin 校验和写操作权限控制。
- `TMDB_API_KEY` 等敏感配置不要通过前端暴露。

### P2：主包过大

生产构建主 JS：约 `764 KB`，gzip 后约 `207 KB`。页面都在 `App.tsx` 顶层静态 import，导致所有路由组件一起进主包。

建议：

- 用 `React.lazy` + `Suspense` 按 hash route 分包。
- 优先拆 `Screenings`、`Workspace`、`Gaming` 和 VHS modal。
- 大型后台面板只在 `#workspace` 加载。

### P2：大文件降低 AI 可维护性

最大文件：

- `src/pages/Screenings.tsx`：约 104 KB。
- `src/pages/Workspace.tsx`：约 84 KB。
- `src/workspace/ScreeningsAdminPanel.tsx`：约 53 KB。
- `src/pages/Gaming.tsx`：约 42 KB。
- `server/index.ts`：约 38 KB。
- `src/contexts/ThemeLanguageContext.tsx`：约 35 KB。

建议：

- 后续 AI 不要在这些文件里继续堆大块 JSX。
- 每次新增功能先找自然边界拆组件或 hook。
- 拆分要保持行为等价，先小步抽取，不做顺手重构。

### P2：Gaming CMS 未闭环

服务端有 `gaming.main`，默认数据也存在，`GamingAdminPanel` 也存在，但公开游戏页没有读取内容系统，工作台也没有使用 `GamingAdminPanel`。

建议：

- 先让 `Gaming.tsx` 读取 `gaming.main`。
- 再把 `GamingAdminPanel` 替换到工作台 games tab。
- 保持 fallback 数据完整，避免内容 API 未启动时页面空白。

### P2：外链图片稳定性

页面大量依赖 Unsplash、Dicebear、picsum、远程 poster URL。浏览器检查中游戏页若干 Unsplash 图片报告加载失败。

建议：

- 关键首屏图和产品识别图不要只依赖随机外链。
- 对外链图片加 fallback UI。
- 内容系统里保存的图片 URL 要允许为空，并在 UI 中明确显示缺图状态。

### P3：翻译与文案治理

多语言集中在 `src/contexts/ThemeLanguageContext.tsx`，但很多页面仍有硬编码中文。当前还发现 `plaza.filter.featured` 被使用但未定义。

建议：

- 新增用户可见文案时优先补 zh/ja/en。
- 后台/workspace 如果只面向中文运营，可暂时硬编码中文，但要统一保存在组件顶部常量或内容系统里。
- 不要只改一个语言分支。

### P3：元信息还是模板状态

`index.html` 和 README 仍是 AI Studio 默认模板。

建议：

- `<title>` 改为项目名，如 `AnySoul / 泛式`。
- `<html lang>` 改为默认语言。
- README 补充真实运行方式：前端、内容 API、环境变量、构建、已知限制。

## 后续 AI 改动准则

1. 先确认改的是“展示层”还是“内容数据层”。
   - 展示层：改 `src/components` 或 `src/pages`。
   - 内容层：改 `src/content/types.ts`、`src/content/defaults/*`、`server/index.ts`、对应 AdminPanel。

2. 加一个新可运营字段时，需要同时改：
   - type 定义。
   - fallback 默认内容。
   - server default store。
   - public page 消费逻辑。
   - workspace admin 编辑控件。
   - 必要时补发布/同步逻辑。

3. 改视觉时先读 `DESIGN_REFERENCE.md`。
   - 不要引入新 UI 库。
   - 不要把页面改成营销模板。
   - 不要在工作台里使用超大 hero 字体。
   - 不要滥用渐变 blob 或纯装饰球。

4. 改路由时注意 `App.tsx` 的 wrapper 差异。
   - 普通页面要有 Header/Footer。
   - 工作台不要显示 Header，不要全页滚动。

5. 改数据获取时保留 fallback。
   - 内容 API 不启动时，公开页面仍应能展示默认内容。
   - AdminPanel 可以提示 `npm run server:dev`。

6. 改动后至少运行：
   - `cmd /c npm run lint`
   - `cmd /c npm run build`
   - 必要时打开 `http://localhost:3000` 检查主路由。

7. 处理中文文件时注意终端编码。
   - PowerShell 的 `Get-Content` 输出可能显示乱码，但源码本身是 UTF-8。
   - 判断中文是否真实损坏时，优先用 `rg`、编辑器或浏览器渲染结果。

## 推荐重构顺序

1. 补元信息和 README。
2. 补 `plaza.filter.featured` 翻译 key。
3. 给 `Gaming.tsx` 接入 `gaming.main` 内容系统。
4. 将 `GamingAdminPanel` 接入工作台 games tab。
5. 对 `Screenings.tsx` 做组件级拆分。
6. 对 `Workspace.tsx` 做布局/面板级拆分。
7. 用 route-level lazy loading 降低主 chunk。
8. 给 admin API 增加认证，再考虑部署。

## 交接检查清单

提交前确认：

- `cmd /c npm run lint` 通过。
- `cmd /c npm run build` 通过。
- 首页、图库、放映会、游戏、工作台至少各打开一次。
- 没有新增 body 横向滚动。
- 新增图片有 fallback。
- 新增文案至少有默认中文，涉及公共页面时同步 ja/en。
- 新增内容字段已覆盖 type、default、server store、public page、admin panel。
- 没有把后台-only 逻辑打进普通营销页面。
