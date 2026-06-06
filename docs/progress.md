# 项目进度记录

更新时间：2026-06-06  
当前提交：`5078758 Improve hotspot source reliability`

## 当前状态

- Web 版前后端已可本机运行。
- 后端 API、SQLite 持久化、worker 定时扫描、OpenRouter/Mock AI 判别已具备基础能力。
- 前端工作台已支持热点列表、未读提醒、关键词管理、来源管理、设置管理和热点详情查看。
- 本次已完成“多源可靠性升级”，重点解决低质量社区帖、分页、垃圾搜索结果混入，以及来源过于依赖 Google News RSS 的问题。

## 本次已完成

- 后端新增统一采集 provider 模型：
  - `rss`
  - `google_news`
  - `brave_search`
- 新增可选 Brave Search 增强源：
  - `.env.example` 已增加 `BRAVE_SEARCH_API_KEY`
  - 未配置 Key 时自动跳过，不影响现有扫描
- 扩展 `sources` 元数据：
  - `provider_type`
  - `reliability_tier`
  - `community_source`
  - `min_quality_score`
- 新增 `item_evidence` 证据表：
  - 记录 provider、来源、查询词、排名、原始 URL、规范化 URL、域名、标题、摘要、发布时间
  - 多源命中同一内容时合并证据，不重复生成热点
- 改进去重：
  - Google News 结果尽量解析到原文 URL
  - 中文标题相似度支持 CJK bigram，提升相似新闻合并能力
- 新增质量评分：
  - `qualityScore`
  - `qualitySignals`
  - 过滤或降级博彩垃圾、API 页、搜索结果页、论坛分页、薄社区内容
- AI 判别加入可靠性上下文：
  - 质量分
  - 质量信号
  - 证据数量
  - 命中 provider
  - 来源可靠性等级
  - 是否社区来源
- 新热点门槛升级：
  - `qualityScore >= 70`
  - 社区单源默认不进入未读新热点，除非有多源确认或高可信信号
- 前端热点详情新增可靠性依据：
  - 质量分
  - 证据数
  - 命中引擎
  - 来源等级
  - 质量信号
- 来源列表新增 provider、可靠性等级、最低质量分展示。

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
- `/api/dashboard` 已返回新的来源可靠性字段。

## 当前限制

- Brave Search 是可选增强源，需要用户自行配置 `BRAVE_SEARCH_API_KEY`。
- 未抓取社区详情页互动量；当前采用规则降级，避免反爬和维护成本。
- 历史脏数据没有物理删除；新展示和新扫描逻辑会过滤或降级低质量内容。
- Tavily、Exa 等更高成本搜索 API 暂未接入，只保留后续扩展方向。

## 下一步建议

1. 配置真实 OpenRouter Key 后，用 `AI_MODE=openrouter` 做一次真实扫描验收。
2. 可选配置 Brave Search Key，验证多 provider 证据是否明显提升结果质量。
3. 针对实际扫描结果微调各来源的 `min_quality_score`。
4. 观察 1-2 天后，再决定是否需要增加更强的付费搜索 API 或来源白名单。
5. Web 版稳定后，再进入 Agent Skill 封装阶段。
