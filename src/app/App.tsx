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
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { Spotlight } from "@/components/ui/spotlight";
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

  const visibleItems = useMemo(() => (dashboard ? getVisibleItems(dashboard.items, keywordFilter) : []), [dashboard, keywordFilter]);
  const unreadItems = useMemo(() => (dashboard ? dashboard.items.filter((item) => !item.readAt).slice(0, 4) : []), [dashboard]);

  const selected = useMemo(() => {
    if (!dashboard) return null;
    return visibleItems.find((item) => item.id === selectedId) ?? visibleItems[0] ?? null;
  }, [dashboard, selectedId, visibleItems]);

  const featured = visibleItems[0] ?? null;
  const activeKeywords = dashboard?.keywords.filter((keyword) => keyword.enabled).length ?? 0;
  const activeSources = dashboard?.sources.filter((source) => source.enabled).length ?? 0;

  function openHotspots(itemId?: number) {
    setActiveView("hotspots");
    if (itemId) setSelectedId(itemId);
  }

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
      <main className="radar-loading-shell">
        <div className="radar-loading-card">
          <Loader2 className="size-5 animate-spin" />
          正在唤醒热点雷达
        </div>
      </main>
    );
  }

  return (
    <main className="radar-page">
      <TopNav
        activeView={activeView}
        unreadCount={dashboard.unreadCount}
        unreadItems={unreadItems}
        onRefresh={refresh}
        onOpenHotspots={openHotspots}
        onChangeView={setActiveView}
      />

      <section className="workspace-shell compact-shell">
        {error ? <div className="radar-error">{error}</div> : null}

        <CommandDeck
          featured={featured}
          unreadCount={dashboard.unreadCount}
          activeKeywords={activeKeywords}
          activeSources={activeSources}
          aiOnline={dashboard.settings.openRouterConfigured}
          scanning={scanning}
          onScan={runScan}
          onManage={() => setActiveView("monitor")}
        />

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

function TopNav({
  activeView,
  unreadCount,
  unreadItems,
  onRefresh,
  onOpenHotspots,
  onChangeView
}: {
  activeView: ViewKey;
  unreadCount: number;
  unreadItems: HotspotItem[];
  onRefresh: () => void;
  onOpenHotspots: (itemId?: number) => void;
  onChangeView: (view: ViewKey) => void;
}) {
  const tabs: Array<{ key: ViewKey; label: string; icon: ReactNode }> = [
    { key: "hotspots", label: "热点", icon: <Sparkles className="size-4" /> },
    { key: "monitor", label: "关键词", icon: <Search className="size-4" /> },
    { key: "sources", label: "来源", icon: <Rss className="size-4" /> }
  ];

  return (
    <header className="radar-nav">
      <div className="radar-nav-inner compact-nav-inner">
        <div className="radar-brand">
          <span className="radar-brand-mark">
            <Radar className="size-4" />
          </span>
          <div>
            <strong>HotPulse</strong>
          </div>
        </div>

        <nav className="top-nav-tabs" aria-label="页面视图">
          {tabs.map((tab) => (
            <button key={tab.key} className={activeView === tab.key ? "top-nav-item active" : "top-nav-item"} onClick={() => onChangeView(tab.key)}>
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="radar-nav-actions">
          <button className="radar-icon-button" onClick={onRefresh} title="刷新">
            <RefreshCcw className="size-4" />
          </button>

          <div className="notify-wrap">
            <button className={unreadCount > 0 ? "notify-button active" : "notify-button"} onClick={() => onOpenHotspots()}>
              <BellDot className="size-4" />
              <span>{unreadCount}</span>
            </button>
            <div className="notify-popover">
              <div className="notify-popover-head">
                <strong>未读热点</strong>
                <span>{unreadCount}</span>
              </div>
              <div className="notify-list">
                {unreadItems.length === 0 ? (
                  <p className="notify-empty">已全部读完</p>
                ) : (
                  unreadItems.map((item) => (
                    <button key={item.id} className="notify-item" onClick={() => onOpenHotspots(item.id)}>
                      <strong>{item.title}</strong>
                      <small>
                        {item.matchedKeyword} · {formatDate(item.publishedAt)}
                      </small>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function CommandDeck({
  featured,
  unreadCount,
  activeKeywords,
  activeSources,
  aiOnline,
  scanning,
  onScan,
  onManage
}: {
  featured: HotspotItem | null;
  unreadCount: number;
  activeKeywords: number;
  activeSources: number;
  aiOnline: boolean;
  scanning: boolean;
  onScan: () => Promise<void>;
  onManage: () => void;
}) {
  return (
    <section className="deck-panel">
      <Spotlight className="deck-spotlight" fill="#60a5fa" />
      <div className="deck-main">
        <div className="deck-heading">
          <h1>热点监控</h1>
          {featured ? (
            <a className="deck-headline" href={featured.url} target="_blank" rel="noreferrer">
              <span>{featured.title}</span>
            </a>
          ) : null}
        </div>

        <div className="deck-stats">
          <CompactMetric label="未读" value={String(unreadCount)} />
          <CompactMetric label="关键词" value={String(activeKeywords)} />
          <CompactMetric label="来源" value={String(activeSources)} />
          <CompactMetric label="AI" value={aiOnline ? "Online" : "Mock"} />
        </div>

        <div className="deck-actions">
          <HoverBorderGradient
            as="button"
            containerClassName="hero-action-primary"
            surfaceClassName="hero-action-surface compact-action-surface"
            onClick={() => void onScan()}
            aria-label="立即扫描"
          >
            <span className="hero-action-content">
              {scanning ? <Loader2 className="size-4 animate-spin" /> : <Zap className="size-4" />}
              立即扫描
            </span>
          </HoverBorderGradient>
          <button className="hero-secondary-button compact-secondary" onClick={onManage}>
            管理关键词
          </button>
        </div>
      </div>
    </section>
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
    <div className="hotspot-layout compact-layout">
      <section className="surface-panel track-panel compact-track" aria-label="固定关键词热点追踪">
        <div className="track-chip-row">
          <button className={keywordFilter === "all" ? "track-chip active" : "track-chip"} onClick={() => onKeywordFilter("all")}>
            全部
            <span>{allItems.length}</span>
          </button>
          {activeKeywords.map((keyword) => (
            <button
              key={keyword.id}
              className={keywordFilter === keyword.id ? "track-chip active" : "track-chip"}
              onClick={() => onKeywordFilter(keyword.id)}
              title={keyword.scope || keyword.term}
            >
              {keyword.term}
              <span>{keywordCounts.get(keyword.id) ?? 0}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="featured-strip">
        {featured ? (
          <>
            <div className="featured-strip-main">
              <strong>{featured.title}</strong>
              <small>
                {featured.matchedKeyword} · {formatDate(featured.publishedAt)}
              </small>
            </div>
            <a className="inline-link compact-link" href={featured.url} target="_blank" rel="noreferrer">
              打开
              <ExternalLink className="size-4" />
            </a>
          </>
        ) : (
          <EmptyState title="还没有热点" body="添加关键词后点击扫描。" />
        )}
      </section>

      <section className="surface-panel list-panel compact-list-panel">
        <SectionHeader icon={<Sparkles className="size-4" />} title="实时热点" />
        <div className="signal-list">
          {items.length === 0 ? (
            <EmptyState title="暂无候选内容" body="这个关键词暂时没有新的有效资讯。" />
          ) : (
            items.map((item) => (
              <button key={item.id} className={selected?.id === item.id ? "signal-item selected" : "signal-item"} onClick={() => onSelect(item.id)}>
                <span className={item.status === "new" && !item.readAt ? "signal-bullet active" : "signal-bullet"} />
                <span className="signal-copy">
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
    <div className="control-grid compact-control-grid">
      <section className="surface-panel control-panel">
        <SectionHeader icon={<Search className="size-4" />} title="关键词" />
        <div className="field-grid">
          <input className="radar-input" value={props.keywordTerm} onChange={(event) => props.setKeywordTerm(event.target.value)} placeholder="关键词" />
          <input className="radar-input" value={props.keywordScope} onChange={(event) => props.setKeywordScope(event.target.value)} placeholder="范围" />
          <button className="solid-action-button" onClick={() => void props.addKeyword()}>
            <Plus className="size-4" />
            添加
          </button>
        </div>
      </section>

      <section className="surface-panel control-panel">
        <SectionHeader icon={<Gauge className="size-4" />} title="设置" />
        <div className="field-grid two-columns">
          <label className="field-label">
            <span>扫描频率</span>
            <input className="radar-input" type="number" min={5} max={1440} value={props.scanInterval} onChange={(event) => props.setScanInterval(event.target.value)} />
          </label>
          <label className="field-label">
            <span>AI 模式</span>
            <select className="radar-input" value={props.aiMode} onChange={(event) => props.setAiMode(event.target.value as AiMode)}>
              <option value="openrouter">OpenRouter</option>
              <option value="mock">Mock</option>
            </select>
          </label>
          <button className="solid-action-button" onClick={() => void props.saveSettings()}>
            保存
          </button>
        </div>
      </section>

      <section className="surface-panel wide-panel">
        <SectionHeader icon={<Settings2 className="size-4" />} title="已启用" />
        <div className="stack-list">
          {props.dashboard.keywords.map((keyword) => (
            <div key={keyword.id} className="stack-row">
              <button
                className={keyword.enabled ? "row-icon-button active" : "row-icon-button"}
                onClick={async () => {
                  await api.updateKeyword(keyword.id, { enabled: !keyword.enabled });
                  await props.refresh();
                }}
                title={keyword.enabled ? "禁用" : "启用"}
              >
                {keyword.enabled ? <Eye className="size-4" /> : <CircleOff className="size-4" />}
              </button>
              <div className="row-copy">
                <strong>{keyword.term}</strong>
                <small>{keyword.scope || "未设置范围"}</small>
              </div>
              <button
                className="row-icon-button danger"
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
    <div className="control-grid compact-control-grid">
      <section className="surface-panel control-panel">
        <SectionHeader icon={<Rss className="size-4" />} title="添加来源" />
        <div className="field-grid">
          <input className="radar-input" value={props.sourceName} onChange={(event) => props.setSourceName(event.target.value)} placeholder="来源名称" />
          <input className="radar-input" value={props.sourceUrl} onChange={(event) => props.setSourceUrl(event.target.value)} placeholder="RSS URL" />
          <input className="radar-input" value={props.sourceCategory} onChange={(event) => props.setSourceCategory(event.target.value)} placeholder="分类" />
          <button className="solid-action-button" onClick={() => void props.addSource()}>
            <Plus className="size-4" />
            添加
          </button>
        </div>
      </section>

      <section className="surface-panel wide-panel">
        <SectionHeader icon={<Rss className="size-4" />} title="来源列表" />
        <div className="stack-list">
          {props.dashboard.sources.map((source) => (
            <div key={source.id} className="stack-row">
              <button
                className={source.enabled ? "row-icon-button active" : "row-icon-button"}
                onClick={async () => {
                  await api.updateSource(source.id, { enabled: !source.enabled });
                  await props.refresh();
                }}
                title={source.enabled ? "禁用" : "启用"}
              >
                {source.enabled ? <Eye className="size-4" /> : <CircleOff className="size-4" />}
              </button>
              <div className="row-copy">
                <strong>{source.name}</strong>
                <small>{source.category} · {source.builtin ? "内置" : "自定义"}</small>
              </div>
              <span className="row-status">{source.enabled ? "启用" : "暂停"}</span>
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
      <aside className="inspector-panel compact-inspector">
        <EmptyState title="选择一个热点" body="AI 判读会显示在这里。" />
      </aside>
    );
  }

  return (
    <aside className="inspector-panel compact-inspector">
      <div className="inspector-meta">
        <span>{item.matchedKeyword}</span>
        <span>{formatDate(item.publishedAt)}</span>
      </div>
      <h3>{item.title}</h3>
      <p className="inspector-summary">{item.evaluation?.reason ?? "等待 AI 判别"}</p>
      <div className="inspector-note">
        {item.evaluation?.isImpersonationLikely ? "疑似假冒或标题党，暂不标为高优先。" : "未发现明显假冒信号。"}
      </div>
      <div className="inspector-actions">
        {!item.readAt ? (
          <button className="hero-secondary-button compact-secondary" onClick={() => onRead(item)}>
            <CheckCircle2 className="size-4" />
            标记已读
          </button>
        ) : null}
        <HoverBorderGradient as="a" href={item.url} target="_blank" rel="noreferrer" surfaceClassName="hero-action-surface compact-action-surface">
          <span className="hero-action-content">
            打开原文
            <ExternalLink className="size-4" />
          </span>
        </HoverBorderGradient>
      </div>
    </aside>
  );
}

function CompactMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="compact-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function SectionHeader({ icon, title, body }: { icon: ReactNode; title: string; body?: string }) {
  return (
    <div className="section-header compact-section-header">
      <span>{icon}</span>
      <div>
        <h2>{title}</h2>
        {body ? <p>{body}</p> : null}
      </div>
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="empty-panel">
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
