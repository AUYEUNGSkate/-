# HotPulse - 游戏热点雷达

> AI 驱动的游戏行业热点监控工具。自动从 RSS、微博、B站等来源采集内容，通过 OpenRouter AI 评估相关性、可信度和热度。

[![Vercel](https://hotpulse-iota.vercel.app)](https://hotpulse-iota.vercel.app)

## 功能

- **多源采集**：机核网、游研社、触乐、B站、微博热搜、RSSHub 百度搜索
- **AI 智能判别**：OpenRouter 评估相关性、可信度、新鲜度、热度
- **关键词监控**：自定义关键词，自动区分游戏/非游戏话题
- **双栏工作台**：左侧热点流 + 右侧 AI 洞察栏
- **暗色主题**：赛博霓虹风格，响应式适配桌面/移动端
- **归档管理**：过期内容自动归档，支持恢复和批量操作

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 19 + Vite 7 + TypeScript + TailwindCSS 4 |
| 后端 | Express 5 + TypeScript |
| 数据库 | **本地**：better-sqlite3 \| **云**：Turso (libsql) |
| AI | OpenRouter (DeepSeek V4) |
| 测试 | Vitest (135 用例) |

## 快速开始

### 本地开发

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量（复制 .env.example 为 .env 并填写）
cp .env.example .env

# 3. 启动开发服务器
npm run dev

# 4. 打开浏览器
# 前端：http://127.0.0.1:5173
# API：http://127.0.0.1:8787
```

### 本地运行扫描

```bash
# 手动触发一次扫描
npm run scan

# 启动定时扫描 worker（30 分钟间隔）
npm run worker
```

### 运行测试

```bash
npm test          # 135 用例
npm run typecheck # TypeScript 检查
npm run build     # 生产构建
```

## 环境变量

| 变量 | 说明 | 必需 |
|------|------|------|
| `OPEN_ROUTER` | OpenRouter API Key | 本地/云 |
| `AI_MODE` | `openrouter` 或 `mock` | 否 |
| `OPENROUTER_MODEL` | 模型名称（默认 `deepseek/deepseek-v4-flash`） | 否 |
| `TURSO_URL` | Turso 数据库 URL（Vercel / Cloudflare） | 云 |
| `TURSO_AUTH_TOKEN` | Turso 认证 Token（Vercel / Cloudflare） | 云 |
| `SCAN_INTERVAL_MINUTES` | 扫描间隔分钟数（默认 30） | 否 |

## 部署

### Vercel（线上版本）

```bash
# 1. 创建 Turso 数据库
npx turso auth login
npx turso db create hotpulse
npx turso db show hotpulse --url      # 获取 TURSO_URL
npx turso db tokens create hotpulse   # 获取 TURSO_AUTH_TOKEN

# 2. 设置 Vercel 环境变量
vercel env add OPEN_ROUTER production --value <your-key>
vercel env add TURSO_URL production --value <url>
vercel env add TURSO_AUTH_TOKEN production --value <token>

# 3. 部署
vercel deploy --prod
```

**注意**：Vercel 有 30 秒执行限制，扫描可能超时但数据会持久化。

### Cloudflare Pages

利用 `ctx.waitUntil()` 后台评估，先返回采集数据，AI 分析结果逐步补充。

```bash
# 1. 设置环境变量（Cloudflare Dashboard > Workers & Pages > hotpulse > Settings > Variables）
# 添加以下 Secret 变量：
#   TURSO_URL, TURSO_AUTH_TOKEN, OPEN_ROUTER

# 2. 构建
npm run build

# 3. 部署
npx wrangler pages deploy dist --project-name hotpulse
```

扫描流程：采集+入库（~8s 返回）→ 后台 AI 评估 → 刷新页面可见分析结果

### Railway（推荐）

直接连接 GitHub 仓库即可部署，零配置，无执行时间限制。

## 项目结构

```
├── src/                    # 前端 React SPA
│   ├── app/App.tsx         # 主应用（单文件组件）
│   ├── api-client/         # API 客户端
│   ├── components/ui/      # UI 组件（Aceternity UI）
│   └── styles/             # TailwindCSS + 定制样式
├── server/                 # 后端 Express API
│   ├── index.ts            # API 路由
│   ├── db/                 # 数据库客户端
│   │   ├── client.ts       # 本地 SQLite（better-sqlite3）
│   │   ├── turso.ts        # 云端 SQLite（Turso/libsql）
│   │   └── index.ts        # 自动切换路由
│   └── services/           # 业务逻辑
│       ├── scanner.ts      # 扫描编排
│       ├── collector.ts    # 内容采集
│       ├── ai.ts           # AI 评估服务
│       ├── dedupe.ts       # 去重
│       ├── contentFilter.ts # 内容质量过滤
│       └── enrichment.ts   # 内容增强
├── api/                    # Vercel Serverless 入口
├── shared/types.ts         # 共享类型定义
├── docs/                   # 项目文档
└── tests/                  # 测试套件
```

## 文档

- [需求文档](docs/requirements.md)
- [架构方案](docs/architecture.md)
- [信息源方案](docs/source-plan.md)
- [OpenRouter 配置](docs/openrouter-setup.md)
- [验收清单](docs/acceptance-checklist.md)
- [开发进度](docs/progress.md)
- [本地开发](docs/dev-setup.md)
