# 项目进度记录

更新时间：2026-06-07  
当前提交：`7b8e51b`

## 当前状态

- Web 版前后端已可本机运行。
- 后端 API、SQLite 持久化、worker 定时扫描、OpenRouter/Mock AI 判别已具备基础能力。
- 前端工作台已支持 AI 简报、排序/筛选工具栏、关键词开关、来源管理、归档查看。
- 本次已完成"检索精度与信息质量优化"，重点解决无关垃圾混入、关键词匹配弱、来源组成不合理问题。

## 本次已完成

### 检索精度优化
- 百度搜索加双引号精确匹配 `"vibe coding"`，排除 CSDN/知乎/简书等 SEO 农场站。
- 新增 `computeKeywordRelevance()` 关键词相关性评分，纳入 priorityScore 公式（权重 15%）。
- 无 `{query}` 的全站 RSS 源（机核网/游研社/触乐）增加标题+摘要双重关键词过滤。
- B站搜索增加二次标题/摘要关键词相关性过滤（enrichment 后）。
- 新增 `isGameKeyword()` 自动判别：非游戏词自动跳过 3 个游戏媒体 RSS 源，仅查百度+B站+微博。

### 信息质量过滤升级
新增 4 条内容审核规则（`contentFilter.ts`）：

| 规则 | 扣分 | 覆盖 |
|------|------|------|
| R1 百度中转/索引 URL | -45 | `baidu.com/link`、`/sf/` |
| R2 SEO 堆砌标题 | -40 | ≥10个逗号片段或中英混排≥5次 |
| R3 目录/导航页标题 | -35 | 含"目录""索引""问答""聚合" |
| R4 空内容页 | -50 | 纯日期标题或极短无摘要页 |

### 信息源扩展
- 新增 游研社 RSS (`yystv.cn/rss/feed`)。
- 新增 触乐 RSS (`chuapp.com/feed`)。
- 新增 微博热搜 源（`weibo_hot`），直接调用公开 API，5 分钟缓存，按关键词 + 游戏词库双匹过滤。
- 新增 B站搜索 源（`bilibili_search`），调用公开搜索 API，≥1000 播放过滤。
- RSSHub URL 统一切换为 `rsshub.rssforever.com`（无 Cloudflare）。
- 游民星空 因噪音大已停用。
- 全量源清单（启用 6 个）：机核网、游研社、触乐、B站视频搜索、微博热搜、RSSHub 百度搜索。

### 排序/筛选系统
- 工具栏改为 4 个下拉菜单：排序（优先/最新/最热互动/仅未读）、已读、重要程度（热门/关注/低质）、来源搜索。
- 来源改为搜索输入框实时过滤，大小写不敏感。
- 关键词启用/禁用改为 iOS 绿色开关滑块。

### AI 简报
- 新增 `GET /api/summary` 接口。
- 每次扫描后自动调用 AI 生成 2-3 句话中文简报。
- 无 OpenRouter Key 时回退 Mock 摘要。
- 前端热点列表上方展示 AI 简报卡片。

### 未读/已读优化
- 移除「标记已读」按钮，点击标题打开原文时自动标记已读。
- 已读项显示绿色 `✓ 已读` 徽标替换蓝色未读圆点。
- 通知弹窗点击项自动标记已读。

### 管道重构
新扫描流程：收集 → 去重 → 新鲜度打分 → 质量过滤 → 入库 → 优先级评分 → Top15 AI 评估 → 分级 → 排序展示。

### 数据库新增字段
- `items.priority_score`：综合优先级评分
- `items.freshness_score`：新鲜度评分
- `items.summary_source / interaction_source`：来源标记

### 新增模块
- `server/services/enrichment.ts`：B站/Zhihu/WeChat/Weibo 互动量与简介补全
- `tests/relevance.test.ts`：关键词相关性 + 游戏判别测试（8 用例）
- `tests/enrichment.test.ts`：互动量补全测试（5 用例）
- `tests/repository.test.ts`：数据仓储测试（3 用例）

## 已验证

已运行并通过：

```powershell
& 'D:\Node.js\npm.cmd' test
& 'D:\Node.js\npm.cmd' run typecheck
& 'D:\Node.js\npm.cmd' run build
```

验证结果：

- 测试文件：8 个通过
- 测试用例：40 个通过
- TypeScript 类型检查通过
- Vite 生产构建通过
- 本地前端已可打开：`http://127.0.0.1:5173`
- 本地后端已可访问：`http://127.0.0.1:8787`

## 当前限制

- Brave Search 是可选增强源，默认禁用；如需启用才配置 `BRAVE_SEARCH_API_KEY`。
- RSSHub 桥接源需确保 `rsshub.rssforever.com` 可访问；部分路由返回 503。
- B站互动量通过公开视频 API 获取；游戏网站仅做轻量 metadata/文本识别。
- 微博热搜仅在当日有游戏相关话题时产出内容。
- AI 简报依赖 OpenRouter Key，无 Key 时使用 Mock 摘要。

## 下一步建议

1. 配置真实 OpenRouter Key 后验证 AI 简报和判别效果。
2. 观察关键词自动判别（游戏/非游戏）的准确率。
3. Web 版稳定后，进入 Agent Skill 封装阶段。
