import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  BellDot,
  CheckCircle2,
  ChevronDown,
  CircleOff,
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
import type { AiMode, DashboardPayload, HotspotItem, Keyword, Source } from "../../shared/types";
import { api, formatDate } from "../api-client/client";

type ViewKey = "hotspots" | "monitor" | "sources";

export function App() {
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [activeView, setActiveView] = useState<ViewKey>("hotspots");
  const [keywordFilter, setKeywordFilter] = useState<number | "all">("all");
  const [sortBy, setSortBy] = useState<"priority" | "newest" | "interaction" | "unread">("priority");
  const [readFilter, setReadFilter] = useState<"all" | "unread" | "read">("all");
  const [sourceFilter, setSourceFilter] = useState<string[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<"all" | "hot" | "watch" | "low">("all");
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
  const [showArchived, setShowArchived] = useState(false);
  const [archivedItems, setArchivedItems] = useState<HotspotItem[]>([]);
  const [selectedArchivedIds, setSelectedArchivedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    void refresh();
  }, []);

  useEffect(() => {
    if (!dashboard) return;
    setScanInterval(String(dashboard.settings.scanIntervalMinutes));
    setAiMode(dashboard.settings.aiMode);
  }, [dashboard]);

  const visibleItems = useMemo(() => {
    if (!dashboard) return [];
    let result = getVisibleItems(dashboard.items, keywordFilter);
    // Read filter
    if (readFilter === "unread") result = result.filter((item) => !item.readAt);
    else if (readFilter === "read") result = result.filter((item) => Boolean(item.readAt));
    // Source filter (multi-select, empty = all)
    if (sourceFilter.length > 0) result = result.filter((item) => sourceFilter.includes(getItemSourceLabel(item)));
    // Priority filter
    if (priorityFilter === "hot") result = result.filter((item) => item.priorityScore >= 75);
    else if (priorityFilter === "watch") result = result.filter((item) => item.priorityScore >= 50 && item.priorityScore < 75);
    else if (priorityFilter === "low") result = result.filter((item) => item.priorityScore < 50);
    // Sort
    if (sortBy === "newest") result = [...result].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    else if (sortBy === "interaction") result = [...result].sort((a, b) => (b.interactionViews + b.interactionLikes) - (a.interactionViews + a.interactionLikes));
    else if (sortBy === "unread") result = [...result].sort((a, b) => (a.readAt ? 1 : 0) - (b.readAt ? 1 : 0) || new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    else result = [...result].sort((a, b) => b.priorityScore - a.priorityScore);
    return result;
  }, [dashboard, keywordFilter, sortBy, readFilter, sourceFilter, priorityFilter]);
  const unreadItems = useMemo(() => getUnreadItems(dashboard?.items ?? []), [dashboard]);
  const unreadCount = unreadItems.length;
  const todayAdded = useMemo(() => getTodayAddedCount(dashboard?.items ?? []), [dashboard]);
  const urgentCount = useMemo(
    () => (dashboard?.items ?? []).filter((item) => item.qualityScore >= 90 || (item.evaluation?.hotnessScore ?? 0) >= 85).length,
    [dashboard]
  );
  const activeKeywords = dashboard?.keywords.filter((keyword) => keyword.enabled).length ?? 0;

  async function openHotspots() {
    setActiveView("hotspots");
  }

  function changeKeywordFilter(next: number | "all") {
    setKeywordFilter(next);
  }

  async function loadArchived() {
    try {
      const items = await api.archived();
      setArchivedItems(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载归档失败");
    }
  }

  async function restoreItem(id: number) {
    try {
      await api.restore(id);
      await loadArchived();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "恢复失败");
    }
  }

  async function batchRestore() {
    const ids = Array.from(selectedArchivedIds);
    if (ids.length === 0) return;
    try {
      await api.batchRestore(ids);
      setSelectedArchivedIds(new Set());
      await loadArchived();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "批量恢复失败");
    }
  }

  async function batchDelete() {
    const ids = Array.from(selectedArchivedIds);
    if (ids.length === 0) return;
    try {
      await api.batchDelete(ids);
      setSelectedArchivedIds(new Set());
      await loadArchived();
    } catch (err) {
      setError(err instanceof Error ? err.message : "批量删除失败");
    }
  }

  function toggleArchivedSelection(id: number, selected: boolean) {
    const next = new Set(selectedArchivedIds);
    if (selected) next.add(id);
    else next.delete(id);
    setSelectedArchivedIds(next);
  }

  async function refresh() {
    setError("");
    try {
      const next = await api.dashboard();
      setDashboard(next);
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
    const readAt = new Date().toISOString();
    setDashboard((current) => {
      if (!current) return current;
      const items = current.items.map((entry) => (entry.id === item.id ? { ...entry, readAt } : entry));
      return { ...current, items, unreadCount: getUnreadItems(items).length };
    });
    try {
      const result = await api.markRead(item.id);
      setDashboard((current) => (current ? { ...current, unreadCount: result.unreadCount } : current));
    } catch (err) {
      setError(err instanceof Error ? err.message : "标记已读失败");
      await refresh();
    }
  }

  function openOriginal(item: HotspotItem) {
    if (!item.readAt) void markRead(item);
    window.open(item.url, "_blank", "noopener,noreferrer");
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
        unreadCount={unreadCount}
        unreadItems={unreadItems}
        onRefresh={refresh}
        scanning={scanning}
        onScan={runScan}
        onOpenHotspots={openHotspots}
        onChangeView={setActiveView}
      />

      <section className="workspace-shell compact-shell">
        {error ? <div className="radar-error">{error}</div> : null}

        <CommandDeck
          totalHotspots={dashboard.items.length}
          todayAdded={todayAdded}
          urgentCount={urgentCount}
          activeKeywords={activeKeywords}
        />

        {activeView === "hotspots" ? (
          <HotspotView
            items={visibleItems}
            allItems={dashboard.items}
            keywords={dashboard.keywords}
            keywordFilter={keywordFilter}
            onKeywordFilter={changeKeywordFilter}
            onOpenOriginal={openOriginal}
            sources={dashboard.sources}
            sortBy={sortBy}
            readFilter={readFilter}
            onSortBy={setSortBy}
            onReadFilter={setReadFilter}
            sourceFilter={sourceFilter}
            priorityFilter={priorityFilter}
            onSourceFilter={(sources) => setSourceFilter(sources)}
            onPriorityFilter={setPriorityFilter}
            showArchived={showArchived}
            archivedItems={archivedItems}
            selectedArchivedIds={selectedArchivedIds}
            onToggleArchived={toggleArchivedSelection}
            onRestore={restoreItem}
            onBatchRestore={batchRestore}
            onBatchDelete={batchDelete}
            onLoadArchived={loadArchived}
            onShowArchived={setShowArchived}
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
  scanning,
  onScan,
  onOpenHotspots,
  onChangeView
}: {
  activeView: ViewKey;
  unreadCount: number;
  unreadItems: HotspotItem[];
  onRefresh: () => void;
  scanning: boolean;
  onScan: () => Promise<void>;
  onOpenHotspots: () => void;
  onChangeView: (view: ViewKey) => void;
}) {
  const tabs: Array<{ key: ViewKey; label: string; icon: ReactNode }> = [
    { key: "hotspots", label: "热点雷达", icon: <Zap className="size-4" /> },
    { key: "monitor", label: "监控词", icon: <Radar className="size-4" /> },
    { key: "sources", label: "搜索", icon: <Search className="size-4" /> }
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
            <small>AI 热点雷达</small>
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
          <button className="scan-button" onClick={() => void onScan()} disabled={scanning}>
            {scanning ? <Loader2 className="size-4 animate-spin" /> : <RefreshCcw className="size-4" />}
            立即扫描
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
                    <button key={item.id} className="notify-item" onClick={() => onOpenHotspots()}>
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
          <button className="radar-icon-button" onClick={onRefresh} title="刷新">
            <RefreshCcw className="size-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

function CommandDeck({
  totalHotspots,
  todayAdded,
  urgentCount,
  activeKeywords
}: {
  totalHotspots: number;
  todayAdded: number;
  urgentCount: number;
  activeKeywords: number;
}) {
  const metrics = [
    { label: "总热点", value: totalHotspots, tone: "default" },
    { label: "今日新增", value: todayAdded, tone: "cyan" },
    { label: "紧急热点", value: urgentCount, tone: "red" },
    { label: "监控词", value: activeKeywords, tone: "green" }
  ];

  return (
    <section className="metric-grid" aria-label="热点概览">
      {metrics.map((metric) => (
        <div key={metric.label} className={`metric-card ${metric.tone}`}>
          <span>{metric.label}</span>
          <strong>{metric.value}</strong>
        </div>
      ))}
    </section>
  );
}

function HotspotView({
  items,
  allItems,
  keywords,
  sources,
  keywordFilter,
  onKeywordFilter,
  onOpenOriginal,
  sortBy,
  readFilter,
  onSortBy,
  onReadFilter,
  sourceFilter,
  priorityFilter,
  onSourceFilter,
  onPriorityFilter,
  showArchived,
  archivedItems,
  selectedArchivedIds,
  onToggleArchived,
  onRestore,
  onBatchRestore,
  onBatchDelete,
  onLoadArchived,
  onShowArchived
}: {
  items: HotspotItem[];
  allItems: HotspotItem[];
  keywords: Keyword[];
  sources: Source[];
  keywordFilter: number | "all";
  onKeywordFilter: (id: number | "all") => void;
  onOpenOriginal: (item: HotspotItem) => void;
  sortBy: "priority" | "newest" | "interaction" | "unread";
  readFilter: "all" | "unread" | "read";
  onSortBy: (value: "priority" | "newest" | "interaction" | "unread") => void;
  onReadFilter: (value: "all" | "unread" | "read") => void;
  sourceFilter: string[];
  priorityFilter: "all" | "hot" | "watch" | "low";
  onSourceFilter: (sources: string[]) => void;
  onPriorityFilter: (value: "all" | "hot" | "watch" | "low") => void;
  showArchived: boolean;
  archivedItems: HotspotItem[];
  selectedArchivedIds: Set<number>;
  onToggleArchived: (id: number, selected: boolean) => void;
  onRestore: (id: number) => void;
  onBatchRestore: () => void;
  onBatchDelete: () => void;
  onLoadArchived: () => void;
  onShowArchived: (show: boolean) => void;
}) {
  const activeKeywords = keywords.filter((keyword) => keyword.enabled);
  const keywordCounts = new Map<number, number>();

  for (const item of allItems) {
    if (item.keywordId === null) continue;
    keywordCounts.set(item.keywordId, (keywordCounts.get(item.keywordId) ?? 0) + 1);
  }

  return (
    <div className="hotspot-workbench">
      <section className="track-panel" aria-label="固定关键词热点追踪">
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

      <div className="sort-filter-bar">
        <FilterDropdown
          label="排序"
          value={sortBy}
          options={[
            { key: "priority", label: "优先" },
            { key: "newest", label: "最新" },
            { key: "interaction", label: "最热互动" },
            { key: "unread", label: "仅未读" }
          ]}
          onChange={(v) => onSortBy(v as typeof sortBy)}
        />
        <FilterDropdown
          label="已读"
          value={readFilter}
          options={[
            { key: "all", label: "全部" },
            { key: "unread", label: "未读" },
            { key: "read", label: "已读" }
          ]}
          onChange={(v) => onReadFilter(v as typeof readFilter)}
        />
        <FilterDropdown
          label="重要"
          value={priorityFilter}
          options={[
            { key: "all", label: "全部" },
            { key: "hot", label: "热门 ≥75" },
            { key: "watch", label: "关注 50-74" },
            { key: "low", label: "低质 <50" }
          ]}
          onChange={(v) => onPriorityFilter(v as typeof priorityFilter)}
        />
        <MultiFilterDropdown
          label="来源"
          selected={sourceFilter}
          options={sources.filter((s) => s.enabled).map((s) => s.name)}
          onChange={onSourceFilter}
        />
      </div>

      <section className="feed-panel">
        <div className="feed-head">
          <SectionHeader icon={<Sparkles className="size-4" />} title={showArchived ? "归档热点" : "实时热点流"} />
          <div className="feed-actions">
            <span>每 30 分钟自动更新</span>
            <button 
              className={showArchived ? "toolbar-button active" : "toolbar-button"}
              onClick={() => {
                onShowArchived(!showArchived);
                if (!showArchived) onLoadArchived();
              }}
            >
              {showArchived ? "返回主列表" : "查看归档"}
            </button>
          </div>
        </div>
        {showArchived ? (
          <div className="archived-view">
            <div className="archived-toolbar">
              <button onClick={onBatchRestore} disabled={selectedArchivedIds.size === 0}>
                批量恢复 ({selectedArchivedIds.size})
              </button>
              <button onClick={onBatchDelete} disabled={selectedArchivedIds.size === 0}>
                批量删除
              </button>
            </div>
            <div className="archived-list">
              {archivedItems.length === 0 ? (
                <EmptyState title="暂无归档内容" body="已读信息会在 24 小时后自动归档。" />
              ) : (
                archivedItems.map((item) => (
                  <div key={item.id} className="archived-item">
                    <input
                      type="checkbox"
                      checked={selectedArchivedIds.has(item.id)}
                      onChange={(e) => onToggleArchived(item.id, e.target.checked)}
                    />
                    <div className="archived-item-content">
                      <strong>{item.title}</strong>
                      <small>{item.matchedKeyword} · {formatDate(item.publishedAt)}</small>
                    </div>
                    <button onClick={() => onRestore(item.id)}>恢复</button>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="signal-list">
            {items.length === 0 ? (
              <EmptyState title="暂无候选内容" body="当前筛选下没有新的有效资讯。" />
            ) : (
              items.map((item) => <HotspotCard key={item.id} item={item} onOpenOriginal={onOpenOriginal} />)
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function HotspotCard({ item, onOpenOriginal }: { item: HotspotItem; onOpenOriginal: (item: HotspotItem) => void }) {
  const unread = item.status === "new" && !item.readAt;
  const priority = getPriority(item);
  const interaction = formatInteraction(item);

  return (
    <article className={unread ? "signal-item unread" : "signal-item"}>
      <div className="signal-card-top">
        <div className={`priority-badge ${priority.tone}`}>
          <Zap className="size-3" />
          {priority.label}
        </div>
        {!unread && item.readAt ? (
          <span className="read-badge">
            <CheckCircle2 className="size-3" />
            已读
          </span>
        ) : null}
      </div>
      <div className="signal-copy">
        <div className="signal-source">
          <span>{item.matchedKeyword}</span>
          <span>{getItemSourceLabel(item)}</span>
        </div>
        <h3>
          <a
            className="signal-title"
            href={item.url}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => {
              event.preventDefault();
              onOpenOriginal(item);
            }}
          >
            {item.title}
          </a>
        </h3>
        <p>{displaySummary(item)}</p>
        <div className="signal-meta">
          <span>优先 {item.priorityScore}</span>
          <span>{formatDate(item.publishedAt)}</span>
          {interaction ? <span>{interaction}</span> : null}
        </div>
      </div>
    </article>
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
              <label className="toggle-switch" title={keyword.enabled ? "禁用" : "启用"}>
                <input
                  type="checkbox"
                  checked={keyword.enabled}
                  onChange={async () => {
                    await api.updateKeyword(keyword.id, { enabled: !keyword.enabled });
                    await props.refresh();
                  }}
                />
                <span className="toggle-slider" />
              </label>
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
                <small>
                  {source.category} · {providerLabel(source.providerType)} · {reliabilityLabel(source.reliabilityTier)} · 最低质量 {source.minQualityScore}
                </small>
              </div>
              <span className="row-status">{source.enabled ? "启用" : "暂停"}</span>
            </div>
          ))}
        </div>
      </section>
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
  const raw = item.summary || item.evaluation?.summary || `${item.title} 的最新动态，建议打开原文查看完整信息。`;
  return trimText(cleanText(raw), 120);
}

function getVisibleItems(items: HotspotItem[], keywordFilter: number | "all"): HotspotItem[] {
  if (keywordFilter === "all") return items;
  return items.filter((item) => item.keywordId === keywordFilter);
}

function getUnreadItems(items: HotspotItem[]): HotspotItem[] {
  return items.filter((item) => item.status === "new" && !item.readAt);
}

function getTodayAddedCount(items: HotspotItem[]): number {
  const today = new Date().toDateString();
  return items.filter((item) => new Date(item.publishedAt).toDateString() === today).length;
}

function getPriority(item: HotspotItem): { label: string; tone: "high" | "medium" | "low" } {
  const hotness = item.evaluation?.hotnessScore ?? item.qualityScore;
  if (hotness >= 85 || item.qualityScore >= 90) return { label: "HIGH", tone: "high" };
  if (hotness >= 65 || item.qualityScore >= 70) return { label: "MEDIUM", tone: "medium" };
  return { label: "LOW", tone: "low" };
}

function getItemSourceLabel(item: HotspotItem): string {
  return item.evidenceSourceNames[0] || providerLabel(item.evidenceProviders[0] ?? "rss");
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

function trimText(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1)}…`;
}

function providerLabel(value: string): string {
  if (value === "google_news") return "Google News";
  if (value === "brave_search") return "Brave";
  return "RSS";
}

function reliabilityLabel(value: string | null): string {
  if (value === "official") return "官方";
  if (value === "trusted") return "可信";
  if (value === "community") return "社区";
  if (value === "search") return "搜索";
  return "未知";
}

function MultiFilterDropdown({ label, selected, options, onChange }: { label: string; selected: string[]; options: string[]; onChange: (selected: string[]) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="filter-dropdown">
      <button className="filter-dropdown-trigger" onClick={() => setOpen(!open)}>
        <span className="filter-dropdown-label">{label}</span>
        <span className="filter-dropdown-value">{selected.length > 0 ? `已选 ${selected.length}` : "全部"}</span>
        <ChevronDown className={`size-3 filter-chevron ${open ? "open" : ""}`} />
      </button>
      {open ? (
        <>
          <div className="filter-dropdown-overlay" onClick={() => setOpen(false)} />
          <div className="filter-dropdown-menu">
            {options.map((opt) => {
              const checked = selected.includes(opt);
              return (
                <button
                  key={opt}
                  className={`filter-dropdown-item ${checked ? "active" : ""}`}
                  onClick={() => {
                    if (checked) onChange(selected.filter((s) => s !== opt));
                    else onChange([...selected, opt]);
                  }}
                >
                  <span className={checked ? "multi-check checked" : "multi-check"} />
                  {opt}
                </button>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}

function FilterDropdown({ label, value, options, onChange }: { label: string; value: string; options: Array<{ key: string; label: string }>; onChange: (key: string) => void }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.key === value);
  return (
    <div className="filter-dropdown">
      <button className="filter-dropdown-trigger" onClick={() => setOpen(!open)}>
        <span className="filter-dropdown-label">{label}</span>
        <span className="filter-dropdown-value">{selected?.label ?? value}</span>
        <ChevronDown className={`size-3 filter-chevron ${open ? "open" : ""}`} />
      </button>
      {open ? (
        <>
          <div className="filter-dropdown-overlay" onClick={() => setOpen(false)} />
          <div className="filter-dropdown-menu">
            {options.map((opt) => (
              <button
                key={opt.key}
                className={value === opt.key ? "filter-dropdown-item active" : "filter-dropdown-item"}
                onClick={() => { onChange(opt.key); setOpen(false); }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

function formatInteraction(item: HotspotItem): string {
  const parts: string[] = [];
  if (item.interactionLikes > 0) parts.push(`${formatNumber(item.interactionLikes)}赞`);
  if (item.interactionReposts > 0) parts.push(`${formatNumber(item.interactionReposts)}转发`);
  if (item.interactionReplies > 0) parts.push(`${formatNumber(item.interactionReplies)}回复`);
  if (item.interactionViews > 0) parts.push(`${formatNumber(item.interactionViews)}浏览`);
  if (parts.length > 0) return parts.join(" · ");

  return expectsVideoInteraction(item) ? "暂无互动数据" : "";
}

function expectsVideoInteraction(item: HotspotItem): boolean {
  const url = `${item.url} ${item.normalizedUrl}`.toLowerCase();
  return /bilibili\.com\/video\/|\/video\/av|(?:^|\W)bv[0-9a-z]{8,}/i.test(url);
}

function formatNumber(num: number): string {
  if (num >= 10000) {
    return (num / 10000).toFixed(1).replace(/\.0$/, "") + "万";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return String(num);
}
