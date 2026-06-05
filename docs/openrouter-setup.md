# OpenRouter 接入与配置说明

## 目标

项目使用 OpenRouter 做热点内容的 AI 判别，包括：

- 内容是否与关键词/热点范围相关
- 来源和内容是否可信
- 是否是新变化而非旧闻重复
- 是否疑似假冒、冒名、标题党
- 是否应该进入站内新热点列表

## 获取 API Key

用户已获得 OpenRouter API Key。后续使用时注意：

1. 不要把 API Key 发到聊天窗口。
2. 不要把 API Key 写入前端代码。
3. 不要提交包含真实 Key 的 `.env` 文件。
4. 只在本机 `.env` 中配置真实 Key。

## `.env` 配置

项目会提供 `.env.example`，本机运行时复制为 `.env` 并填写真实值：

```env
PORT=8787
VITE_API_BASE=/api

# Preferred. OPENROUTER_API_KEY is also supported for compatibility.
OPEN_ROUTER=
OPENROUTER_API_KEY=
OPENROUTER_MODEL=deepseek/deepseek-v4-flash
AI_MODE=openrouter
OPENROUTER_REFERER=http://localhost:5173
OPENROUTER_TITLE=Game Hotspot Radar

SCAN_INTERVAL_MINUTES=30
DATABASE_PATH=./data/hotspot-radar.sqlite
```

## 鉴权方式

根据 OpenRouter 当前文档，API 使用 HTTP Bearer Token 鉴权。服务端请求必须带：

```txt
Authorization: Bearer <OPEN_ROUTER>
Content-Type: application/json
```

可选归因 header：

```txt
HTTP-Referer: <YOUR_SITE_URL>
X-OpenRouter-Title: <YOUR_SITE_NAME>
```

## 请求端点

Chat Completions endpoint：

```txt
https://openrouter.ai/api/v1/chat/completions
```

## AI 模式

| 模式 | 说明 |
|---|---|
| `openrouter` | 使用真实 OpenRouter API |
| `mock` | 使用本地模拟评分，便于无网络、无额度或开发测试 |

生产开发默认使用 `AI_MODE=openrouter`。项目优先读取 `OPEN_ROUTER`，未设置时兼容读取 `OPENROUTER_API_KEY`。当 API Key 缺失、网络失败或 OpenRouter 返回错误时，扫描流程应记录错误并允许切换到 `mock`。

## 结构化输出

OpenRouter 当前文档支持 `response_format`，项目应使用 JSON Schema 约束 AI 输出：

```json
{
  "type": "json_schema",
  "json_schema": {
    "name": "hotspot_evaluation",
    "strict": true,
    "schema": {
      "type": "object",
      "properties": {
        "relevanceScore": { "type": "number", "minimum": 0, "maximum": 100 },
        "credibilityScore": { "type": "number", "minimum": 0, "maximum": 100 },
        "noveltyScore": { "type": "number", "minimum": 0, "maximum": 100 },
        "hotnessScore": { "type": "number", "minimum": 0, "maximum": 100 },
        "isImpersonationLikely": { "type": "boolean" },
        "summary": { "type": "string" },
        "reason": { "type": "string" },
        "recommendedAction": {
          "type": "string",
          "enum": ["notify", "watch", "ignore"]
        }
      },
      "required": [
        "relevanceScore",
        "credibilityScore",
        "noveltyScore",
        "hotnessScore",
        "isImpersonationLikely",
        "summary",
        "reason",
        "recommendedAction"
      ],
      "additionalProperties": false
    }
  }
}
```

## 新热点判定阈值

| 条件 | v1 阈值 |
|---|---|
| 发布时间 | 近 24 小时 |
| `relevanceScore` | `>= 70` |
| `credibilityScore` | `>= 65` |
| `noveltyScore` | `>= 60` |
| `hotnessScore` | `>= 70` |
| `isImpersonationLikely` | `false` |
| `recommendedAction` | `notify` |

满足条件的内容进入未读热点列表。未满足条件但仍有价值的内容进入待观察或普通列表。

## Prompt 要点

AI 判别时应提供：

- 用户关键词
- 用户热点范围
- 内容标题
- 内容摘要
- 来源名称和 URL
- 发布时间
- 已知重复内容上下文

Prompt 要求 AI：

1. 区分真实行业动态与标题党。
2. 对没有明确来源或来源弱的爆料降低可信度。
3. 对旧闻重复降低新鲜度。
4. 对与关键词无关的内容降低相关性。
5. 只输出符合 JSON Schema 的结果。

## 错误处理

| 情况 | 行为 |
|---|---|
| API Key 缺失 | 返回配置错误，页面显示未配置 |
| 401/403 | 标记 Key 不可用，提示检查 Key |
| 402 | 标记额度不足，提示检查余额 |
| 超时 | 当前候选标记为 AI 失败，扫描继续 |
| JSON 解析失败 | 记录原始响应，候选进入待重试 |
| 单条失败 | 不中断整次扫描 |

## 安全要求

- 前端不得读取 `OPEN_ROUTER` 或 `OPENROUTER_API_KEY`。
- API Key 不通过 `/api/settings` 明文返回。
- 日志不得打印完整 API Key。
- `.env` 必须加入 `.gitignore`。
- `.env.example` 只放占位说明。
