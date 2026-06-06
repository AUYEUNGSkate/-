# 项目进度记录

更新时间：2026-06-06  
当前提交：待提交本轮修复

## 当前状态

- Web 版前后端已可本机运行。
- 后端 API、SQLite 持久化、worker 定时扫描、OpenRouter/Mock AI 判别已具备基础能力。
- 前端工作台已支持单列热点流、未读提醒、关键词管理、来源管理、设置管理和归档查看。
- 本次已完成"最新热点质量与工作台修复"，重点解决未读计数口径、旧内容滞留、无 Key 国内来源、B站互动量、详情面板噪声和文档/代码不一致问题。

## 本次已完成

### 信息质量与最新内容
- 主列表默认只显示未归档且近 24 小时内容。
- 未读徽标只统计 `status='new'` 且未读、未归档、近 24 小时的热点。
- 扫描后自动归档过期内容：已读旧内容归档，`watch/ignored` 旧内容归档，过期 `new` 降级后归档。
- 新增手动旧内容清理接口：`POST /api/items/archive-stale`。
- 社区泛搜索源默认禁用（微博、B站、TapTap、知乎、贴吧），不再默认采集社区讨论帖。
- 回复/评论内容检测与过滤：标题匹配「回复」「评论」「Re:」「@xxx」等模式后，质量评分 -60。
- 从标题提取互动量（点赞、转发、回复、播放），分平台设置阈值（如微博点赞 ≥10、B站播放 ≥500 等），低于阈值 -50 分。
- 无互动量的内容保留不受影响，只过滤明确低互动内容。

### 信息源扩展
- 默认来源改为国内无 Key 优先，不要求用户填写搜索 API Key。
- Brave Search 保留为可选增强源，但默认禁用。
- Google News 降级为可选补充源，默认全部禁用，不再作为主路径。
- 新增国内 RSS / RSSHub 源：
  - RSSHub 百度搜索 (`rsshub.app/baidu/search/{query}`)
  - 机核网 (`gcores.com/rss`)
  - 游民星空 (`rsshub.app/gamersky/news`)
  - 3DM 游戏 (`rsshub.app/3dm/news`)
  - 搜狐游戏 (`rsshub.app/sohu/game`)
  - 网易游戏 (`rsshub.app/163/dy`)
  - 17173 新闻 (`rsshub.app/17173/news`)
- 新增 B站账号源（需能识别 UID）：
  - B站账号视频 (`rsshub.app/bilibili/user/video/{accountUid}`)
  - B站账号动态 (`rsshub.app/bilibili/user/dynamic/{accountUid}`)
- 新增原文恢复链路：Google 代理链接和 `b23.tv` 等短链会尽量还原到真实原文 URL，再进入后续补全。

### 账号/话题自动识别
- 新增 `keywords.account_mode` 字段，添加关键词时自动检测是否为组织名/账号名。
- 新增 `keywords.account_platform/account_uid/account_url` 字段。
- 组织名检测规则：匹配 `公司/团队/工作室/官方` 等后缀，或 2-3 个中文字且无空格。
- 账号模式下搜索 URL 不再拼接 scope 范围，直接搜索账号名。
- 支持识别 B站空间 URL 或 `uid:` 写法，将账号源直达用户视频/动态 RSS。

### Enrichment 补全
- 新增 `server/services/enrichment.ts`。
- B站视频通过公开网页接口补充播放、点赞、评论、转发和简介。
- 17173、机核、游民星空、3DM、搜狐游戏、网易游戏等站点尝试从 HTML meta / JSON-LD 提取简介。
- 补全失败不阻断扫描，自动回退原始 RSS 数据。
- 非视频页在没有互动量时不再统一显示「暂无互动数据」，避免把资讯页误标成抓取失败。

### 热点归档
- 新增 `items.archived_at` 字段，已读信息 24 小时后自动归档。
- 归档列表 API：`GET /api/items/archived`。
- 支持单条恢复、批量恢复、批量删除。
- 每次扫描完成后自动归档超期已读信息。
- 前端新增「查看归档」按钮和归档列表视图。

### UI 优化
- 工作台改为深色顶部导航、指标卡和单列「实时热点流」布局。
- 移除顶部「热点监控」下方单条热点标题 pill。
- 移除右侧 Inspector 详情面板和「判别依据」展示，卡片直接承载标题、简介、来源、时间、互动量和操作。
- 所有文本容器添加溢出/换行约束，修复长标题穿模。
- 关键词 chip 改为横向滚动，避免挤压主列表。
- 去除 AI 热度分数回退逻辑，无互动量时显示「暂无互动数据」。
- 互动量数字格式化：≥10000 显示为「万」、≥1000 显示为「k」。

### 未读逻辑修复
- 未读数统计改为从当前可见主列表派生，只统计未读 `new`，避免 badge 与列表不一致。
- 通知弹窗与右上 badge 使用同一个 `unreadItems` 结果。
- 热点标题本身可直接跳转原文，并在打开时自动标记已读。
- 单独的「打开原文」按钮已移除，仅保留「标记已读」辅助操作。

### 数据库新增字段
- `items.archived_at`：归档时间
- `items.interaction_likes / reposts / replies / views`：互动量
- `items.summary_source / interaction_source`：简介和互动来源
- `keywords.account_mode`：账号模式标记
- `keywords.account_platform / account_uid / account_url`：账号解析信息

## 已验证

已运行并通过：

```powershell
& 'D:\Node.js\npm.cmd' test
& 'D:\Node.js\npm.cmd' run typecheck
& 'D:\Node.js\npm.cmd' run build
```

验证结果：

- 测试文件：7 个通过
- 测试用例：25 个通过
- TypeScript 类型检查通过
- Vite 生产构建通过
- 本地前端已可打开：`http://127.0.0.1:5173`
- 本地后端已可访问：`http://127.0.0.1:8787`
- 网页验收通过：未读 badge 与通知弹层一致，右侧详情和「判别依据」不再渲染，桌面视口无横向溢出。

## 当前限制

- Brave Search 是可选增强源，默认禁用；如需启用才配置 `BRAVE_SEARCH_API_KEY`。
- RSSHub 桥接的源需确保 `rsshub.app` 在国内可访问。
- B站互动量可通过公开视频接口补充；其他游戏网站仅做轻量 metadata/文本识别。
- 作者粉丝数、认证优先等更精细的过滤维度需后续接入平台 API。
- Tavily、Exa 等更高成本搜索 API 暂未接入。

## 下一步建议

1. 配置真实 OpenRouter Key 后，用 `AI_MODE=openrouter` 做一次真实扫描验收。
2. 验证国内 RSSHub / 站点 RSS 源的实际抓取效果，调整 `min_quality_score`。
3. 观察 B站互动量与游戏网站简介补全准确率，再决定是否扩展更多站点。
4. Web 版稳定后，再进入 Agent Skill 封装阶段。
