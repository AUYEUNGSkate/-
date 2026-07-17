# 项目进度记录

更新时间：2026-07-17
当前提交：见 Git 历史

## 当前状态

- **Vercel 线上**：https://hotpulse-iota.vercel.app
- **Cloudflare Pages**：已部署，使用 GitHub 自动构建 + 后台 AI 评估。
- **本地开发**：`http://127.0.0.1:5173` 完整可用。
- **GitHub**：https://github.com/AUYEUNGSkate/-
- 支持本地 SQLite / Vercel / Cloudflare 三环境切换。
- 前端工作台已完成“克制情报台”重设计：保留暗色游戏情报雷达气质，降低青蓝铺满感，优化热点流、右侧情报栏、筛选条、移动端首屏顺序和 Aceternity UI 光效。

## 本次完成：HotPulse 工作台重设计

### 前端视觉与信息架构

- 热点页保持“左侧实时热点流 + 右侧 AI 情报栏”的主结构，但减少卡片堆叠感和过重边框，让列表更像可扫描的情报流。
- 重新整理深色视觉系统：背景更安静，青色用于雷达焦点，绿色用于正向状态，红色用于紧急热点，圆角和间距更统一。
- 顶部概览指标增加辅助说明，帮助用户快速判断总热点、今日新增、紧急热点和监控词状态。
- 热点卡片改为左侧优先级/热度轨道 + 右侧标题、来源、摘要、AI 理由和互动数据，提升阅读效率。
- 筛选工具条整合搜索、排序、已读、重要程度、来源搜索，并补充可访问性 label。
- 移动端改为优先展示导航、扫描、概览指标、关键词、筛选和热点流，避免 AI 情报栏抢占首屏。

### Aceternity UI 使用

- 复用现有 `Spotlight` 作为低强度背景光效，不引入新依赖。
- 复用 `HoverBorderGradient` 包裹“立即扫描”按钮，形成克制的流光边框。
- 修复扫描按钮内部 padding 被覆盖的问题，确保图标、文字和移动端宽度不挤压。
- 增加 `prefers-reduced-motion` 处理，降低动效对长时间阅读的干扰。

### 可访问性与文案

- 为搜索、来源过滤、关键词、来源表单、通知和刷新按钮补充 label / aria。
- 修正前端时间文案 fallback：`尚未完成`、`刚刚`、`X分钟前`、`X小时前`、`X天前`。

## Cloudflare Pages 适配

### 技术架构

- **Hono 替代 Express**：兼容 Cloudflare Workers 运行时。
- **DB**：`server/db/cf-index.ts` 直接调用 Turso，不依赖 better-sqlite3。
- **环境注入**：`initEnv(c.env)` 从 Cloudflare Bindings 读取配置。
- **构建**：Vite 输出静态资源到 `dist/`；Cloudflare Pages 从仓库根目录 `functions/api/[[path]].ts` 自动编译 API Function。

### 扫描优化

| 阶段 | 操作 | 耗时 | 说明 |
|---|---|---|---|
| Phase 1 | 采集 -> 去重 -> 入库 -> 返回 | ~8s | 前端立即可见内容 |
| Phase 2 | AI 评估 -> 评分 -> 写入 Turso | 后台 | `ctx.waitUntil()` 异步，下次刷新自动出现 |

### 部署问题修复

1. **函数目录**：API 源码保留在仓库根目录 `functions/`，由 Pages Git 构建或 Wrangler 自动发现并编译。
2. **路由命名**：`[[...route]].ts` 不被 Cloudflare 支持，改为 `[[path]].ts`。
3. **构建顺序**：Vite 会清空 `dist/`，Cloudflare 函数构建放在 Vite 之后。
4. **Pages 配置识别**：`wrangler.toml` 增加 `pages_build_output_dir = "./dist"`，避免 Cloudflare 跳过配置文件。
5. **2026-07-17 部署失败**：失败日志构建的是旧提交 `969aed1`，其中仍生成 `[[...route]]`；需要从包含 `16e0778` 及后续修复的 `main` 重新部署。

### 环境变量

| Secret | 说明 |
|---|---|
| `TURSO_URL` | Turso 数据库 URL |
| `TURSO_AUTH_TOKEN` | Turso 认证 Token |
| `OPEN_ROUTER` | OpenRouter API Key |

## Vercel 部署

### 架构

- **前端**：Vite React SPA，托管在 Vercel Static。
- **后端**：Express API Serverless Function（`api/index.js`）。
- **数据库**：Turso 兼容 SQLite。
- **AI**：OpenRouter，每轮评估 1 条以适配 30s 限制。

### 已知限制

- 扫描可能受 Vercel Hobby 30s 超时限制。
- AI 评估受限，每轮仅 1 条。
- 无持久后台进程，需要手动触发扫描。

## 已有通用优化

### 信息源

- 7 个活跃源：机核网、游研社、触乐、RSSHub 百度搜索、微博热搜等；B 站搜索已禁用。
- 自动区分游戏/非游戏关键词，跳过不相关来源。

### 检索精度

- CJK bigram 分词匹配，门槛 50 分。
- 并行采集：串行约 144s -> 并行约 8s，8s fetch 超时。
- 内容质量过滤：百度中转、SEO、目录页、空页面扣分。

### 排序与筛选

- 优先级排序：relevance 30% + quality 20% + freshness 20% + other。
- 支持关键词、来源、已读/未读、热度等多维度筛选。

## 已验证

```powershell
& 'D:\Node.js\npm.cmd' test          # 11 个测试文件，135 个用例通过
& 'D:\Node.js\npm.cmd' run typecheck # 类型检查通过
& 'D:\Node.js\npm.cmd' run build     # 构建通过
& 'D:\Node.js\npx.cmd' --yes wrangler@3.114.17 pages functions build functions # Pages Functions 编译通过
```

浏览器验收：

- 桌面 `1440x900`：热点流、右侧情报栏、筛选条布局稳定。
- 移动端 `390x844`：无横向滚动，首屏能看到扫描入口、概览指标、筛选和热点流入口。
- “立即扫描”按钮图标与文字显示正常，不再挤压。
- 控制台仅有 React DevTools 提示，无业务错误。

## 当前限制

- Brave Search 可选增强，默认禁用。
- RSSHub 部分路由返回 503。
- AI 简报依赖 OpenRouter Key。
- Cloudflare 扫描仅用 RSS 源，避免超时。

## 下一步

1. 观察 Cloudflare 后台 AI 评估稳定性。
2. 完善 Agent Skill 封装。
3. 添加 Telegram / Webhook 外部通知。
