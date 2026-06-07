const SPAM_PATTERNS = [
  /results\s+for/i,
  /bet365/i,
  /博彩|彩票|开奖|开户地址|体育投注|体育综合版|极速赛车|北京赛车|快三|盘口|代理/i,
  /(?:^|[\s{【])官网[}:：】]/i,
  /\b(?:852|x999)\s*\./i,
  /\.(?:tw|pw|ojd|cls|nze)\b/i,
  /api\.weibo\.com/i
];

const GENERIC_TITLES = new Set(["微博正文", "知乎", "首页", "搜索结果", "results"]);
const COMMUNITY_HOSTS = [/taptap\.cn$/i, /zhihu\.com$/i, /tieba\.baidu\.com$/i, /weibo\.com$/i, /bilibili\.com$/i];
const FORUM_PAGE_PATTERNS = [
  /第\s*\d+\s*页/,
  /\bpage[=/_-]?\d+\b/i,
  /\/forum\//i,
  /\/topic\//i,
  /\/post\//i,
  /\/question\//i
];

export interface QualityAssessment {
  score: number;
  signals: string[];
  lowQuality: boolean;
}

export function cleanArticleTitle(title: string): string {
  const decoded = decodeHtml(title)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  let cleaned = decoded;
  for (let index = 0; index < 3; index += 1) {
    const next = cleaned.replace(
      /\s+-\s+(搜狐网|腾讯网|网易|新浪|新浪网|澎湃新闻|TapTap|发现好游戏|知乎专栏|游研社|触乐|竞核|游戏葡萄|哔哩哔哩|Bilibili|微博|百度贴吧|yeeyi)$/i,
      ""
    );
    if (next === cleaned) break;
    cleaned = next;
  }
  return cleaned.trim();
}

export function isLowQualityResult(input: { title: string; url?: string; summary?: string }): boolean {
  return assessContentQuality(input).lowQuality;
}

export function assessContentQuality(input: { 
  title: string; 
  url?: string; 
  summary?: string;
  sourceName?: string;
  sourceCommunity?: boolean;
}): QualityAssessment {
  const title = cleanArticleTitle(input.title);
  const haystack = `${input.title} ${input.url ?? ""} ${input.summary ?? ""}`;
  const signals: string[] = [];
  let score = 92;

  if (!title || title.length < 6) {
    signals.push("标题过短或缺失");
    score -= 55;
  }
  if (GENERIC_TITLES.has(title.toLowerCase())) {
    signals.push("泛化页面标题");
    score -= 60;
  }
  if (SPAM_PATTERNS.some((pattern) => pattern.test(haystack))) {
    signals.push("命中垃圾/博彩模式");
    score -= 75;
  }

  const symbolCount = (title.match(/[{}【】[\]".|]/g) ?? []).length;
  if (symbolCount >= 5) {
    signals.push("标题符号异常");
    score -= 35;
  }

  const latinAndDigits = (title.match(/[A-Za-z0-9]/g) ?? []).length;
  if (latinAndDigits > 24 && /[{}]|\.com|\.tw|\.pw|\.ojd|\.cls/i.test(title)) {
    signals.push("疑似搜索垃圾标题");
    score -= 45;
  }

  if (!input.summary?.trim()) {
    signals.push("摘要缺失");
    score -= 12;
  }

  const host = hostname(input.url ?? "");
  const communityHost = COMMUNITY_HOSTS.some((pattern) => pattern.test(host));
  if (communityHost) {
    signals.push("社区平台单条信号");
    score -= 10;
  }

  // 新增：社区平台互动量检查
  if (input.sourceCommunity && input.sourceName) {
    const platform = identifyPlatform(input.sourceName, input.url || '');
    
    // 检查是否是回复内容
    if (isReplyContent(title)) {
      signals.push("回复/评论内容");
      score -= 60;
    }
    
    // 提取互动量
    const counts = extractInteractionCounts(title);
    const hasInteraction = counts.likes > 0 || counts.reposts > 0 || counts.replies > 0 || counts.views > 0;
    
    // 如果有互动量信息，检查是否达到阈值
    if (hasInteraction) {
      const thresholdCheck = checkInteractionThresholds(platform, counts);
      if (!thresholdCheck.passed) {
        signals.push(thresholdCheck.reason);
        score -= 50;
      }
    }
    // 没有互动量信息的内容保留，不降低评分
  }

  if (FORUM_PAGE_PATTERNS.some((pattern) => pattern.test(haystack))) {
    signals.push("疑似论坛/分页内容");
    score -= 32;
  }

  if (/api\./i.test(host) || /\/api\//i.test(input.url ?? "")) {
    signals.push("API 页面");
    score -= 45;
  }

  // R1: 搜索引擎中转/索引页
  if (/(?:baidu|sogou)\.com\/(?:link|sf|bai|url)/i.test(input.url ?? "")) {
    signals.push("搜索引擎中转/索引页");
    score -= 45;
  }

  // R2: SEO 堆砌标题
  const commaSegments = title.split(/[,，、;；\s]+/).filter((s) => s.length > 1);
  const enSegments = title.match(/[a-zA-Z]{2,}/g) ?? [];
  if (commaSegments.length >= 10 || (enSegments.length >= 5 && /[\u4e00-\u9fff]/.test(title))) {
    signals.push("疑似SEO堆砌标题");
    score -= 40;
  }

  // R3: 目录/导航/聚合页标题
  if (/目录|索引|标签|分类汇总|搜索结果|问答$|聚合|归档$/i.test(title)) {
    signals.push("目录/导航类标题");
    score -= 35;
  }

  // R4: 空内容标题（纯日期或极短无摘要页）
  if (/^\d{4}[-/]\d{2}[-/]\d{2}/.test(title) || (title.length < 12 && !input.summary?.trim())) {
    signals.push("空或纯日期标题");
    score -= 50;
  }

  score = Math.max(0, Math.min(100, score));

  return {
    score,
    signals: signals.length ? signals : ["基础质量通过"],
    lowQuality: score < 45
  };
}

export function cleanSummary(value: string): string {
  const cleaned = decodeHtml(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/<[^>]*$/g, " ")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/\bnews\.google\.com\/rss\/articles\/\S+/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return "";
  if (/^<a\s/i.test(value) || cleaned.length > 180) {
    return cleanArticleTitle(cleaned);
  }
  return cleaned;
}

// 平台类型
type Platform = 'weibo' | 'bilibili' | 'taptap' | 'zhihu' | 'tieba' | 'other';

// 根据source信息识别平台
function identifyPlatform(sourceName: string, sourceUrl: string): Platform {
  const name = sourceName.toLowerCase();
  const url = sourceUrl.toLowerCase();
  
  if (name.includes('微博') || url.includes('weibo.com')) return 'weibo';
  if (name.includes('b站') || name.includes('bilibili') || url.includes('bilibili.com')) return 'bilibili';
  if (name.includes('taptap') || url.includes('taptap.cn')) return 'taptap';
  if (name.includes('知乎') || url.includes('zhihu.com')) return 'zhihu';
  if (name.includes('贴吧') || url.includes('tieba.baidu.com')) return 'tieba';
  
  return 'other';
}

// 检测是否是回复/评论内容
function isReplyContent(title: string): boolean {
  const replyPatterns = [
    /^回复[:：]/,
    /^Re[:：]/i,
    /^回复@/,
    /的回复$/,
    /的评论$/,
    /^评论[:：]/,
    /^@[\w]+[\s：:]/,
    /^回复\s/,
  ];
  return replyPatterns.some(pattern => pattern.test(title.trim()));
}

// 从标题中提取互动量
function extractInteractionCounts(title: string): {
  likes: number;
  reposts: number;
  replies: number;
  views: number;
} {
  const patterns = {
    likes: /(\d+(?:\.\d+)?[kK万]?)\s*(?:赞|点赞|like|upvote|赞同)/i,
    reposts: /(\d+(?:\.\d+)?[kK万]?)\s*(?:转发|repost|share)/i,
    replies: /(\d+(?:\.\d+)?[kK万]?)\s*(?:回复|评论|comment|reply|回答|条评价|个回答)/i,
    views: /(\d+(?:\.\d+)?[kK万]?)\s*(?:播放|浏览|view|阅读)/i,
  };
  
  const result = { likes: 0, reposts: 0, replies: 0, views: 0 };
  
  for (const [key, pattern] of Object.entries(patterns)) {
    const match = title.match(pattern);
    if (match) {
      result[key as keyof typeof result] = parseNumber(match[1]);
    }
  }
  
  return result;
}

// 解析数字（支持k、万等单位）
function parseNumber(str: string): number {
  const num = parseFloat(str);
  if (str.toLowerCase().includes('k')) return num * 1000;
  if (str.includes('万')) return num * 10000;
  return num;
}

// 检查互动量是否达到阈值
function checkInteractionThresholds(
  platform: Platform,
  counts: { likes: number; reposts: number; replies: number; views: number }
): { passed: boolean; reason: string } {
  switch (platform) {
    case 'weibo':
      if (counts.likes > 0 && counts.likes < 10) return { passed: false, reason: "点赞数" + counts.likes + "低于阈值10" };
      if (counts.reposts > 0 && counts.reposts < 5) return { passed: false, reason: "转发数" + counts.reposts + "低于阈值5" };
      break;
    case 'bilibili':
      if (counts.views > 0 && counts.views < 500) return { passed: false, reason: "播放量" + counts.views + "低于阈值500" };
      if (counts.likes > 0 && counts.likes < 10) return { passed: false, reason: "点赞数" + counts.likes + "低于阈值10" };
      break;
    case 'taptap':
      if (counts.replies > 0 && counts.replies < 5) return { passed: false, reason: "评价数" + counts.replies + "低于阈值5" };
      break;
    case 'zhihu':
      if (counts.replies > 0 && counts.replies < 5) return { passed: false, reason: "回答数" + counts.replies + "低于阈值5" };
      if (counts.likes > 0 && counts.likes < 10) return { passed: false, reason: "赞同数" + counts.likes + "低于阈值10" };
      break;
    case 'tieba':
      if (counts.replies > 0 && counts.replies < 10) return { passed: false, reason: "回复数" + counts.replies + "低于阈值10" };
      break;
  }
  
  return { passed: true, reason: '' };
}

function hostname(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
}

function decodeHtml(value: string): string {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'");
}
