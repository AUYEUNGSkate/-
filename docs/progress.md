# 项目进度记录

更新时间：2026-07-17
当前提交：16e0778

## 当前状态

- **Vercel 线上**：https://hotpulse-iota.vercel.app
- **Cloudflare Pages**：已部署（GitHub 自动构建 + 后台 AI 评估）
- **本地开发**：`http://127.0.0.1:5173`（完整可用）
- **GitHub**：https://github.com/AUYEUNGSkate/-
- 支持本地 SQLite / Vercel / Cloudflare 三环境切换
- 前端工作台：AI 简报、AI 分析理由、排序/筛选、关键词/来源管理、归档

## Cloudflare Pages 适配

### 技术架构
- **Hono 替代 Express**：兼容 Cloudflare Workers 运行时
- **DB**：`server/db/cf-index.ts` 直接调用 Turso，不依赖 better-sqlite3
- **环境注入**：`initEnv(c.env)` 从 Cloudflare Bindings 读取配置
- **构建**：esbuild 输出到 `dist/functions/api/[[path]].js`，随静态文件一起部署

### 扫描优化（核心差异）
| 阶段 | 操作 | 耗时 | 说明 |
|---|---|---|---|
| Phase 1 | 采集 → 去重 → 入库 → 返回 | ~8s | 前端立即可见内容 |
| Phase 2 | AI 评估 → 评分 → 写入 Turso | 后台 | `ctx.waitUntil()` 异步，下次刷新自动出现 |

### 部署问题修复
1. **函数未部署**：`wrangler pages deploy dist` 不包含根目录 `functions/`，改为输出到 `dist/functions/api/`
2. **路由命名**：`[[...route]].ts` 不被 Cloudflare 支持 → 改为 `[[path]].ts`
3. **构建顺序**：Vite 会清空 `dist/`，CF 函数构建放在 Vite 之后

### 环境变量（Cloudflare Dashboard）
| Secret | 说明 |
|---|---|
| `TURSO_URL` | Turso 数据库 URL |
| `TURSO_AUTH_TOKEN` | Turso 认证 Token |
| `OPEN_ROUTER` | OpenRouter API Key |

## Vercel 部署

### 架构
- **前端**：Vite React SPA，托管在 Vercel Static
- **后端**：Express API，Serverless Function（`api/index.js`）
- **数据库**：Turso 云 SQLite
- **AI**：OpenRouter（每轮评估 1 条，30s 限制）

### 已知限制
- 扫描 30s 超时（Hobby 限制）
- AI 评估受限（每轮仅 1 条）
- 无持久后台进程（需手动触发扫描）

## 已有的通用优化

### 信息源
- 7 个活跃源：机核网、游研社、触乐、RSSHub 百度搜索、微博热搜（B站搜索已禁用）
- 自动区分游戏/非游戏关键词，跳过不相关来源

### 检索精度
- CJK bigram 分词匹配，门槛 50 分
- 并行采集（串行 144s → 并行 8s），8s fetch 超时
- 内容质量过滤（百度中转/SEO/目录/空页面扣分）

### 排序与筛选
- 优先级排序（relevance × 30% + quality × 20% + freshness × 20% + other）
- 关键词、来源、已读/未读、热度多维度筛选

## 已验证

```powershell
& 'D:\Node.js\npm.cmd' test         # 135 用例（134 通过）
& 'D:\Node.js\npm.cmd' run typecheck # 类型检查通过
& 'D:\Node.js\npm.cmd' run build     # 构建通过
```

## 当前限制

- Brave Search 可选增强，默认禁用
- RSSHub 部分路由返回 503
- AI 简报依赖 OpenRouter Key
- Cloudflare 扫描仅用 RSS 源（避免超时）

## 下一步

1. 观察 Cloudflare 后台 AI 评估的稳定性
2. 完善 Agent Skill 封装
3. 添加 Telegram / Webhook 外部通知
