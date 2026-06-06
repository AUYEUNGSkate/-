# 项目进度记录

更新时间：2026-06-06  
当前提交：`5af1876 Content quality, domestic RSS sources, archive, and UI polish`

## 当前状态

- Web 版前后端已可本机运行。
- 后端 API、SQLite 持久化、worker 定时扫描、OpenRouter/Mock AI 判别已具备基础能力。
- 前端工作台已支持热点列表、未读提醒、关键词管理、来源管理、设置管理和热点详情查看。
- 本次已完成"信息质量与源扩展优化"，重点解决低质量社区帖混入、来源单一、旧信息堆积和 UI 穿模问题。

## 本次已完成

### 信息质量过滤
- 社区源全部禁用（微博、B站、TapTap、知乎、贴吧），不再采集社区讨论帖。
- 回复/评论内容检测与过滤：标题匹配「回复」「评论」「Re:」「@xxx」等模式后，质量评分 -60。
- 从标题提取互动量（点赞、转发、回复、播放），分平台设置阈值（如微博点赞 ≥10、B站播放 ≥500 等），低于阈值 -50 分。
- 无互动量的内容保留不受影响，只过滤明确低互动内容。

### 信息源扩展
- 新增 5 个国内可直接访问的 RSS 源（无需 API Key）：
  - 机核网 (`gcores.com/rss`)
  - 游民星空 (`rsshub.app/gamersky/news`)
  - 3DM 游戏 (`rsshub.app/3dm/news`)
  - 搜狐游戏 (`rsshub.app/sohu/game`)
  - 网易游戏 (`rsshub.app/163/dy`)
- 所有新源 `providerType: rss`，`reliabilityTier: trusted`，`communitySource: false`。

### 账号/话题自动识别
- 新增 `keywords.account_mode` 字段，添加关键词时自动检测是否为组织名/账号名。
- 组织名检测规则：匹配 `公司/团队/工作室/官方` 等后缀，或 2-3 个中文字且无空格。
- 账号模式下搜索 URL 不再拼接 scope 范围，直接搜索账号名。

### 热点归档
- 新增 `items.archived_at` 字段，已读信息 24 小时后自动归档。
- 归档列表 API：`GET /api/items/archived`。
- 支持单条恢复、批量恢复、批量删除。
- 每次扫描完成后自动归档超期已读信息。
- 前端新增「查看归档」按钮和归档列表视图。

### UI 优化
- 移除顶部精选热点横幅（featured-strip）。
- 所有文本容器添加溢出截断（`text-overflow: ellipsis`），修复长标题穿模。
- Inspector 面板标题限 2 行、摘要限 4 行显示。
- 关键词 chip 设 `max-width: 140px`。
- 去除 AI 热度分数回退逻辑，无互动量时显示「暂无互动数据」。
- 互动量数字格式化：≥10000 显示为「万」、≥1000 显示为「k」。

### 未读逻辑修复
- 未读数统计改为所有未读项（不再限制 `status='new'`）。
- 点击任意未读热点自动标记已读（之前仅对 `status='new'` 生效）。
- 通知弹窗点击项自动标记已读并刷新。

### 数据库新增字段
- `items.archived_at`：归档时间
- `items.interaction_likes / reposts / replies / views`：互动量
- `keywords.account_mode`：账号模式标记

## 已验证

已运行并通过：

```powershell
& 'D:\Node.js\npm.cmd' test
& 'D:\Node.js\npm.cmd' run typecheck
& 'D:\Node.js\npm.cmd' run build
```

验证结果：

- 测试文件：5 个通过
- 测试用例：19 个通过
- TypeScript 类型检查通过
- Vite 生产构建通过
- 本地前端已可打开：`http://127.0.0.1:5173`
- 本地后端已可访问：`http://127.0.0.1:8787`

## 当前限制

- Brave Search 是可选增强源，需要用户自行配置 `BRAVE_SEARCH_API_KEY`。
- RSSHub 桥接的源需确保 `rsshub.app` 在国内可访问。
- 互动量提取仅从标题正则匹配，未调用平台 API 获取真实互动数据。
- 作者粉丝数、认证优先等更精细的过滤维度需后续接入平台 API。
- Tavily、Exa 等更高成本搜索 API 暂未接入。

## 下一步建议

1. 配置真实 OpenRouter Key 后，用 `AI_MODE=openrouter` 做一次真实扫描验收。
2. 验证国内外 RSS 源的实际抓取效果，调整 `min_quality_score`。
3. 观察互动量提取的准确率，考虑接入平台 API 获取真实数据。
4. Web 版稳定后，再进入 Agent Skill 封装阶段。
