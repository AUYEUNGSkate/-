# 项目进度记录

更新时间：2026-06-09
当前提交：085fd53

## 当前状态

- **线上版本**：已部署到 Vercel → https://hotpulse-iota.vercel.app
- **Cloudflare Pages**：已适配，待部署（含后台 AI 评估优化）
- **本地版本**：`http://127.0.0.1:5173`（完整可用）
- 支持本地 SQLite / Vercel / Cloudflare 多环境自动切换。
- 前端工作台：AI 简报、AI 分析理由、排序/筛选工具栏、关键词开关、来源管理、归档查看。

## Cloudflare Pages 适配（2026-06-09）

### 技术变更
- **Express → Hono**：框架切换，语法相近，兼容 Cloudflare Workers 运行时
- **DB 简化**：`server/db/cf-index.ts` 仅用 Turso，无 better-sqlite3 依赖
- **环境注入**：`getEnv()` 改为单例，通过 `initEnv()` 接受 Cloudflare Bindings
- **构建**：`scripts/bundle-cf.mjs` 用 esbuild 预编译，排除所有 Node.js 模块
- **扫描优化**：利用 `ctx.waitUntil()` 先返回采集数据，AI 评估后台异步补上

### 扫描双阶段
| 阶段 | 操作 | 耗时 | 说明 |
|---|---|---|---|
| Phase 1 | 采集 → 去重 → 入库 → 返回 | ~8s | 前端立即可见内容 |
| Phase 2 | AI 评估 → 评分 → 写入 Turso | 后台 | waitUntil 异步，下次刷新自动出现 |

### 部署
```bash
npm run build                                # 构建（含 Vite + Vercel + Cloudflare）
npx wrangler pages deploy dist               # 部署到 Cloudflare
```
环境变量在 Cloudflare Dashboard → Settings → Variables 中设置（TURSO_URL, TURSO_AUTH_TOKEN, OPEN_ROUTER）

## Vercel 部署（2026-06-09）

### 架构
- **前端**：Vite React SPA，托管在 Vercel Static
- **后端**：Express API，作为 Vercel Serverless Function（`api/index.js`）
- **数据库**：Turso 云 SQLite（`libsql://`），替代本地 SQLite
- **AI**：OpenRouter API（每轮扫描评估 1 条热点，时间限制）

### 已知限制
- **扫描 30s 超时**：Vercel Hobby 限制，扫描可多次运行积累数据
- **AI 评估受限**：每轮仅评估 1 条热点（超时限制）
- **无 worker**：Vercel 不支持持久后台进程，需手动触发扫描
- **端口不一致**：本地开发需单独启动 web + api

### 环境变量（Vercel）
| 变量 | 说明 |
|------|------|
| `OPEN_ROUTER` | OpenRouter API Key |
| `AI_MODE` | `openrouter` 或 `mock` |
| `TURSO_URL` | Turso 数据库 URL |
| `TURSO_AUTH_TOKEN` | Turso 认证 Token |

## 本次已完成（Vercel 适配）

### Turso 云数据库集成
- `server/db/turso.ts`：基于 `@libsql/client` 的异步 SQLite 兼容层
- `server/db/index.ts`：Vercel / 本地自动切换的 repos 路由
- 所有 API 端点改为异步（兼容 Turso HTTP 访问）

### 扫描优化
- **并行采集**：`Promise.all` 同时请求所有 RSS 源（从串行 144s → 并行 8s）
- **超时控制**：每个 fetch 请求 8s 超时，避免死等
- **关键词相关性过滤**：入库前用 bigram 算法过滤不相关内容（门槛 ≥50 分）
- **Vercel 快速模式**：自动过滤慢速来源，仅使用 RSS

### CJK 关键词精度
- 新增中日韩双字组合（bigram）分词匹配
- 评分阈值收紧：50%（非标题）→ 35 分，低于 50 分门槛过滤
- 解决"搜游戏节出现游戏上线"的问题

## 已验证

```powershell
& 'D:\Node.js\npm.cmd' test
& 'D:\Node.js\npm.cmd' run typecheck
& 'D:\Node.js\npm.cmd' run build
```

验证结果：
- 测试文件：11 个通过
- 测试用例：135 个通过
- TypeScript 类型检查通过
- Vite 生产构建通过

## 当前限制

- Vercel 扫描有 30s 上限，如需完整扫描体验推荐 Railway.app
- Brave Search 是可选增强源，默认禁用
- RSSHub 桥接源需确保 `rsshub.rssforever.com` 可访问
- B站互动量通过公开视频 API 获取
- AI 简报依赖 OpenRouter Key

## 下一步建议

1. 将项目迁移到 Railway / Render 以获得无限制扫描时间
2. 完善 Agent Skill 封装
3. 添加 Telegram / Webhook 外部通知
