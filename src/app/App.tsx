import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  BellDot,
  CheckCircle2,
  CircleOff,
  ExternalLink,
  Eye,
  Gauge,
  Loader2,
  Plus,
  Radar,
  RefreshCcw,
  Rss,
  Search,
  Settings2,
  Sparkles,
  Trash2,
  Zap
} from "lucide-react";
import type { AiMode, DashboardPayload, HotspotItem, Keyword } from "../../shared/types";
import { api, formatDate } from "../api-client/client";

type ViewKey = "hotspots" | "monitor" | "sources";

export function App() {
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [activeView, setActiveView] = useState<ViewKey>("hotspots");
  const [keywordFilter, setKeywordFilter] = useState<number | "all">("all");
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const [keywordTerm, setKeywordTerm] = useState("");
  const [keywordScope, setKeywordScope] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceCategory, setSourceCategory] = useState("自定义");
  const [scanInterval, setScanInterval] = useState("30");
  const [aiMode, setAiMode] = useState<AiMode>("openrouter");

  useEffect(() => {
    void refresh();
  }, []);

  useEffect(() => {
    if (!dashboard) return;
    setScanInterval(String(dashboard.settings.scanIntervalMinutes));
    setAiMode(dashboard.settings.aiMode);
  }, [dashboard]);

  const selected = useMemo(() => {
    if (!dashboard) return null;
    const visibleItems = getVisibleItems(dashboard.items, keywordFilter);
    return visibleItems.find((item) => item.id === selectedId) ?? visibleItems[0] ?? null;
  }, [dashboard, keywordFilter, selectedId]);

  const visibleItems = useMemo(() => (dashboard ? getVisibleItems(dashboard.items, keywordFilter) : []), [dashboard, keywordFilter]);
  const featured = visibleItems[0] ?? null;
  const activeKeywords = dashboard?.keywords.filter((keyword) => keyword.enabled).length ?? 0;
  const activeSources = dashboard?.sources.filter((source) => source.enabled).length ?? 0;

  function changeKeywordFilter(next: number | "all") {
    setKeywordFilter(next);
    if (!dashboard) return;
    const nextItems = getVisibleItems(dashboard.items, next);
    setSelectedId(nextItems[0]?.id ?? null);
  }

  async function refresh() {
    setError("");
    try {
      const next = await api.dashboard();
      setDashboard(next);
      setSelectedId((current) => current ?? next.items[0]?.id ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }

  async function runScan() {
    setScanning(true);
    setError("");
    try {
      const result = await api.scan();
      setDashboard(result.dashboard);
      setSelectedId(result.dashboard.items[0]?.id ?? null);
      setActiveView("hotspots");
    } catch (err) {
      setError(err instanceof Error ? err.message : "扫描失败");
    } finally {
      setScanning(false);
    }
  }

  async function addKeyword() {
    if (!keywordTerm.trim()) return;
    await api.createKeyword(keywordTerm, keywordScope);
    setKeywordTerm("");
    setKeywordScope("");
    await refresh();
  }

  async function addSource() {
    if (!sourceName.trim() || !sourceUrl.trim()) return;
    await api.createSource({ name: sourceName, url: sourceUrl, category: sourceCategory });
    setSourceName("");
    setSourceUrl("");
    setSourceCategory("自定义");
    await refresh();
  }

  async function markRead(item: HotspotItem) {
    await api.markRead(item.id);
    await refresh();
  }

  async function saveSettings() {
    await api.updateSettings({
      scanIntervalMinutes: Number(scanInterval),
      aiMode
    });
    await refresh();
  }

  if (loading || !dashboard) {
    return (
      <main className="min-h-screen bg-apple-canvas text-apple-ink grid place-items-center">
        <div className="apple-loading">
          <Loader2 className="size-5 animate-spin" />
          正在唤醒热点雷达
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-apple-canvas text-apple-ink">
      <TopNav unreadCount={dashboard.unreadCount} onRefresh={refresh} />

      <section className="apple-hero">
        <div className="apple-hero-copy">
          <p className="apple-kicker">Game Hotspot Radar</p>
          <h1>热点监控</h1>
          <p>
            主要跟踪国内平台和游戏媒体。每 {dashboard.settings.scanIntervalMinutes} 分钟自动扫描，AI 先做相关性、可信度和新鲜度初筛。
          </p>
          <div className="hero-status-line">
            <span>{dashboard.items.length} 条候选</span>
            <span>{dashboard.unreadCount} 条未读</span>
            <span>国内平台优先</span>
            <span>{dashboard.settings.openRouterConfigured ? "OpenRouter 已连接" : "Mock 模式"}</span>
          </div>
          <div className="apple-actions">
            <button className="apple-primary" onClick={runScan} disabled={scanning}>
              {scanning ? <Loader2 className="size-4 animate-spin" /> : <Zap className="size-4" />}
              立即扫描
            </button>
            <button className="apple-secondary" onClick={() => setActiveView("monitor")}>
              管理监控
            </button>
          </div>
        </div>

        <div className="apple-hero-visual">
          <div className="signal-sphere">
            <Radar className="size-12" />
            <span>{dashboard.unreadCount}</span>
            <small>待查看</small>
          </div>
          <div className="hero-mini-row">
            <MiniMetric label="关键词" value={String(activeKeywords)} />
            <MiniMetric label="来源" value={String(activeSources)} />
            <MiniMetric label="AI" value={dashboard.settings.openRouterConfigured ? "Ready" : "Mock"} />
          </div>
        </div>
      </section>

      <section className="apple-shell">
        {error ? <div className="apple-error">{error}</div> : null}

        <SegmentedNav activeView={activeView} setActiveView={setActiveView} unreadCount={dashboard.unreadCount} />

        {activeView === "hotspots" ? (
          <HotspotView
            items={visibleItems}
            allItems={dashboard.items}
            keywords={dashboard.keywords}
            keywordFilter={keywordFilter}
            onKeywordFilter={changeKeywordFilter}
            featured={featured}
            selected={selected}
            onSelect={setSelectedId}
            onRead={markRead}
          />
        ) : null}

        {activeView === "monitor" ? (
          <MonitorView
            dashboard={dashboard}
            keywordTerm={keywordTerm}
            keywordScope={keywordScope}
            setKeywordTerm={setKeywordTerm}
            setKeywordScope={setKeywordScope}
            addKeyword={addKeyword}
            refresh={refresh}
            scanInterval={scanInterval}
            setScanInterval={setScanInterval}
            aiMode={aiMode}
            setAiMode={setAiMode}
            saveSettings={saveSettings}
          />
        ) : null}

        {activeView === "sources" ? (
          <SourceView
            dashboard={dashboard}
            sourceName={sourceName}
            sourceUrl={sourceUrl}
            sourceCategory={sourceCategory}
            setSourceName={setSourceName}
            setSourceUrl={setSourceUrl}
            setSourceCategory={setSourceCategory}
            addSource={addSource}
            refresh={refresh}
          />
        ) : null}
      </section>
    </main>
  );
}

function TopNav({ unreadCount, onRefresh }: { unreadCount: number; onRefresh: () => void }) {
  return (
    <header className="apple-nav">
      <div className="apple-nav-inner">
        <div className="apple-brand">
          <Radar className="size-4" />
          游戏热点雷达
        </div>
        <div className="apple-nav-actions">
          <span className={unreadCount > 0 ? "apple-badge apple-badge-on" : "apple-badge"}>
            <BellDot className="size-3.5" />
            {unreadCount}
          </span>
          <button className="apple-icon" onClick={onRefresh} title="刷新">
            <RefreshCcw className="size-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

function SegmentedNav({
  activeView,
  setActiveView,
  unreadCount
}: {
  activeView: ViewKey;
  setActiveView: (view: ViewKey) => void;
  unreadCount: number;
}) {
  const tabs: Array<{ key: ViewKey; label: string; icon: ReactNode }> = [
    { key: "hotspots", label: `热点 ${unreadCount ? `(${unreadCount})` : ""}`, icon: <Sparkles className="size-4" /> },
    { key: "monitor", label: "监控", icon: <Search className="size-4" /> },
    { key: "sources", label: "来源", icon: <Rss className="size-4" /> }
  ];

  return (
    <nav className="apple-segment" aria-label="页面视图">
      {tabs.map((tab) => (
        <button key={tab.key} className={activeView === tab.key ? "apple-segment-item active" : "apple-segment-item"} onClick={() => setActiveView(tab.key)}>
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </nav>
  );
}

function HotspotView({
  items,
  allItems,
  keywords,
  keywordFilter,
  onKeywordFilter,
  featured,
  selected,
  onSelect,
  onRead
}: {
  items: HotspotItem[];
  allItems: HotspotItem[];
  keywords: Keyword[];
  keywordFilter: number | "all";
  onKeywordFilter: (id: number | "all") => void;
  featured: HotspotItem | null;
  selected: HotspotItem | null;
  onSelect: (id: number) => void;
  onRead: (item: HotspotItem) => void;
}) {
  const activeKeywords = keywords.filter((keyword) => keyword.enabled);
  const keywordCounts = new Map<number, number>();
  for (const item of allItems) {
    if (item.keywordId === null) continue;
    keywordCounts.set(item.keywordId, (keywordCounts.get(item.keywordId) ?? 0) + 1);
  }

  return (
    <div className="view-grid">
      <section className="keyword-track" aria-label="固定关键词热点追踪">
        <div>
          <p className="apple-kicker">Tracking</p>
          <h2>固定关键词追踪</h2>
        </div>
        <div className="keyword-track-list">
          <button className={keywordFilter === "all" ? "keyword-track-item active" : "keyword-track-item"} onClick={() => onKeywordFilter("all")}>
            全部
            <span>{allItems.length}</span>
          </button>
          {activeKeywords.map((keyword) => (
            <button
              key={keyword.id}
              className={keywordFilter === keyword.id ? "keyword-track-item active" : "keyword-track-item"}
              onClick={() => onKeywordFilter(keyword.id)}
              title={keyword.scope || keyword.term}
            >
              {keyword.term}
              <span>{keywordCounts.get(keyword.id) ?? 0}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="apple-feature">
        <p className="apple-kicker">Latest</p>
        {featured ? (
          <>
            <h2>{featured.title}</h2>
            <p>{displaySummary(featured)}</p>
            <a className="apple-link" href={featured.url} target="_blank" rel="noreferrer">
              打开原文 <ExternalLink className="size-4" />
            </a>
          </>
        ) : (
          <EmptyState title="还没有热点" body="添加关键词后点击立即扫描，热点会出现在这里。" />
        )}
      </section>

      <section className="apple-list-section">
        <SectionHeader icon={<Sparkles className="size-4" />} title="热点列表" body="按关键词过滤后，只保留资讯题目和来源时间。" />
        <div className="apple-list">
          {items.length === 0 ? (
            <EmptyState title="暂无候选内容" body="这个关键词暂时没有新的有效资讯。" />
          ) : (
            items.map((item) => (
              <button key={item.id} className={selected?.id === item.id ? "apple-list-item selected" : "apple-list-item"} onClick={() => onSelect(item.id)}>
                <span className={item.status === "new" && !item.readAt ? "status-dot hot" : "status-dot"} />
                <span className="list-copy">
                  <strong>{item.title}</strong>
                  <small>
                    {item.matchedKeyword} · {formatDate(item.publishedAt)}
                  </small>
                </span>
              </button>
            ))
          )}
        </div>
      </section>

      <Inspector item={selected} onRead={onRead} />
    </div>
  );
}

function MonitorView(props: {
  dashboard: DashboardPayload;
  keywordTerm: string;
  keywordScope: string;
  setKeywordTerm: (value: string) => void;
  setKeywordScope: (value: string) => void;
  addKeyword: () => Promise<void>;
  refresh: () => Promise<void>;
  scanInterval: string;
  setScanInterval: (value: string) => void;
  aiMode: AiMode;
  setAiMode: (value: AiMode) => void;
  saveSettings: () => Promise<void>;
}) {
  return (
    <div className="settings-grid">
      <section className="apple-section">
        <SectionHeader icon={<Search className="size-4" />} title="监控关键词" body="把要盯的词和上下文分开写，AI 判断会更稳。" />
        <div className="apple-form">
          <input className="apple-input" value={props.keywordTerm} onChange={(event) => props.setKeywordTerm(event.target.value)} placeholder="关键词，例如 AI 编程" />
          <input className="apple-input" value={props.keywordScope} onChange={(event) => props.setKeywordScope(event.target.value)} placeholder="范围，例如 游戏开发工具、引擎更新" />
          <button className="apple-primary" onClick={props.addKeyword}>
            <Plus className="size-4" />
            添加关键词
          </button>
        </div>
      </section>

      <section className="apple-section">
        <SectionHeader icon={<Gauge className="size-4" />} title="运行设置" body="默认 30 分钟扫描一次；真实 AI 会读取 OPEN_ROUTER。" />
        <div className="apple-form two-col">
          <label>
            <span>扫描频率（分钟）</span>
            <input className="apple-input" type="number" min={5} max={1440} value={props.scanInterval} onChange={(event) => props.setScanInterval(event.target.value)} />
          </label>
          <label>
            <span>AI 模式</span>
            <select className="apple-input" value={props.aiMode} onChange={(event) => props.setAiMode(event.target.value as AiMode)}>
              <option value="openrouter">OpenRouter</option>
              <option value="mock">Mock</option>
            </select>
          </label>
          <button className="apple-primary" onClick={props.saveSettings}>
            保存设置
          </button>
        </div>
      </section>

      <section className="apple-section wide">
        <SectionHeader icon={<Settings2 className="size-4" />} title="已启用监控" body={`${props.dashboard.keywords.filter((keyword) => keyword.enabled).length} 个关键词正在参与扫描。`} />
        <div className="chip-list">
          {props.dashboard.keywords.map((keyword) => (
            <div key={keyword.id} className="apple-chip-row">
              <button
                className={keyword.enabled ? "round-control on" : "round-control"}
                onClick={async () => {
                  await api.updateKeyword(keyword.id, { enabled: !keyword.enabled });
                  await props.refresh();
                }}
                title={keyword.enabled ? "禁用" : "启用"}
              >
                {keyword.enabled ? <Eye className="size-4" /> : <CircleOff className="size-4" />}
              </button>
              <div>
                <strong>{keyword.term}</strong>
                <small>{keyword.scope || "未设置范围"}</small>
              </div>
              <button
                className="round-control danger"
                onClick={async () => {
                  await api.deleteKeyword(keyword.id);
                  await props.refresh();
                }}
                title="删除"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SourceView(props: {
  dashboard: DashboardPayload;
  sourceName: string;
  sourceUrl: string;
  sourceCategory: string;
  setSourceName: (value: string) => void;
  setSourceUrl: (value: string) => void;
  setSourceCategory: (value: string) => void;
  addSource: () => Promise<void>;
  refresh: () => Promise<void>;
}) {
  return (
    <div className="settings-grid">
      <section className="apple-section">
        <SectionHeader icon={<Rss className="size-4" />} title="添加来源" body="RSS 地址可以包含 {query}，扫描时会替换成关键词和范围。" />
        <div className="apple-form">
          <input className="apple-input" value={props.sourceName} onChange={(event) => props.setSourceName(event.target.value)} placeholder="来源名称" />
          <input className="apple-input" value={props.sourceUrl} onChange={(event) => props.setSourceUrl(event.target.value)} placeholder="RSS URL，可含 {query}" />
          <input className="apple-input" value={props.sourceCategory} onChange={(event) => props.setSourceCategory(event.target.value)} placeholder="分类" />
          <button className="apple-primary" onClick={props.addSource}>
            <Plus className="size-4" />
            添加来源
          </button>
        </div>
      </section>

      <section className="apple-section wide">
        <SectionHeader icon={<Rss className="size-4" />} title="来源列表" body={`${props.dashboard.sources.filter((source) => source.enabled).length} 个来源启用。内置来源会保留，只做禁用。`} />
        <div className="source-table">
          {props.dashboard.sources.map((source) => (
            <div key={source.id} className="source-row">
              <button
                className={source.enabled ? "round-control on" : "round-control"}
                onClick={async () => {
                  await api.updateSource(source.id, { enabled: !source.enabled });
                  await props.refresh();
                }}
                title={source.enabled ? "禁用" : "启用"}
              >
                {source.enabled ? <Eye className="size-4" /> : <CircleOff className="size-4" />}
              </button>
              <div>
                <strong>{source.name}</strong>
                <small>{source.category} · {source.builtin ? "内置" : "自定义"}</small>
              </div>
              <span>{source.enabled ? "启用" : "暂停"}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Inspector({ item, onRead }: { item: HotspotItem | null; onRead: (item: HotspotItem) => void }) {
  if (!item) {
    return (
      <aside className="apple-inspector">
        <EmptyState title="选择一个热点" body="AI 判读会显示在这里。" />
      </aside>
    );
  }

  return (
    <aside className="apple-inspector">
      <p className="apple-kicker">AI Reading</p>
      <h3>{item.title}</h3>
      <p className="inspector-summary">{item.evaluation?.reason ?? "等待 AI 判别"}</p>
      <div className="inspector-note">
        {item.evaluation?.isImpersonationLikely ? "疑似假冒或标题党，暂不标为高优先。" : "未发现明显假冒信号。"}
      </div>
      <div className="inspector-actions">
        {!item.readAt ? (
          <button className="apple-secondary" onClick={() => onRead(item)}>
            <CheckCircle2 className="size-4" />
            标记已读
          </button>
        ) : null}
        <a className="apple-primary" href={item.url} target="_blank" rel="noreferrer">
          打开原文
        </a>
      </div>
    </aside>
  );
}

function SectionHeader({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <div className="section-header">
      <span>{icon}</span>
      <div>
        <h2>{title}</h2>
        <p>{body}</p>
      </div>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="mini-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="apple-empty">
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  );
}

function displaySummary(item: HotspotItem): string {
  const raw = item.evaluation?.summary || item.summary || "等待 AI 摘要";
  return cleanText(raw);
}

function getVisibleItems(items: HotspotItem[], keywordFilter: number | "all"): HotspotItem[] {
  if (keywordFilter === "all") return items;
  return items.filter((item) => item.keywordId === keywordFilter);
}

function cleanText(value: string): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}
