import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  BellDot,
  CheckCircle2,
  ChevronDown,
  CircleOff,
  Eye,
  Flame,
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
import { api, formatDate, relativeTime } from "../api-client/client";
import { HoverBorderGradient } from "../components/ui/hover-border-gradient";
import { Spotlight } from "../components/ui/spotlight";

type ViewKey = "hotspots" | "monitor" | "sources";

export function App() {
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [activeView, setActiveView] = useState<ViewKey>("hotspots");
  const [keywordFilter, setKeywordFilter] = useState<number | "all">("all");
  const [sortBy, setSortBy] = useState<"priority" | "newest" | "interaction" | "unread">("priority");
  const [readFilter, setReadFilter] = useState<"all" | "unread" | "read">("all");
  const [sourceFilter, setSourceFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<"all" | "hot" | "watch" | "low">("all");
  const [hotspotSearch, setHotspotSearch] = useState("");
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
    // Source filter (keyword search)
    if (sourceFilter) result = result.filter((item) => getItemSourceLabel(item).toLowerCase().includes(sourceFilter.toLowerCase()));
    // Priority filter
    if (priorityFilter === "hot") result = result.filter((item) => item.priorityScore >= 75);
    else if (priorityFilter === "watch") result = result.filter((item) => item.priorityScore >= 50 && item.priorityScore < 75);
    else if (priorityFilter === "low") result = result.filter((item) => item.priorityScore < 50);
    // Hotspot keyword search (title / summary / keyword)
    if (hotspotSearch) {
      const q = hotspotSearch.toLowerCase();
      result = result.filter((item) =>
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.matchedKeyword.toLowerCase().includes(q)
      );
    }
    // Sort
    if (sortBy === "newest") result = [...result].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    else if (sortBy === "interaction") result = [...result].sort((a, b) => (b.interactionViews + b.interactionLikes) - (a.interactionViews + a.interactionLikes));
    else if (sortBy === "unread") result = [...result].sort((a, b) => (a.readAt ? 1 : 0) - (b.readAt ? 1 : 0) || new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    else result = [...result].sort((a, b) => b.priorityScore - a.priorityScore);
    return result;
  }, [dashboard, keywordFilter, sortBy, readFilter, sourceFilter, priorityFilter, hotspotSearch]);
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
      <Spotlight className="radar-spotlight" fill="#38bdf8" />
      <TopNav
        activeView={activeView}
        unreadCount={unreadCount}
        unreadItems={unreadItems}
        onRefresh={refresh}
        scanning={scanning}
        onScan={runScan}
        onOpenHotspots={openHotspots}
        onOpenOriginal={openOriginal}
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
            onSourceFilter={setSourceFilter}
            onPriorityFilter={setPriorityFilter}
            hotspotSearch={hotspotSearch}
            onHotspotSearchChange={setHotspotSearch}
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
  onOpenOriginal,
  onChangeView
}: {
  activeView: ViewKey;
  unreadCount: number;
  unreadItems: HotspotItem[];
  onRefresh: () => void;
  scanning: boolean;
  onScan: () => Promise<void>;
  onOpenHotspots: () => void;
  onOpenOriginal: (item: HotspotItem) => void;
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
          <HoverBorderGradient
            as="button"
            className="scan-button"
            containerClassName="scan-button-shell"
            surfaceClassName="scan-button-surface"
            duration={1.6}
            onClick={() => void onScan()}
            disabled={scanning}
            aria-label={scanning ? "正在扫描热点" : "立即扫描热点"}
          >
            {scanning ? <Loader2 className="size-4 animate-spin" /> : <RefreshCcw className="size-4" />}
            立即扫描
          </HoverBorderGradient>

          <div className="notify-wrap">
            <button
              className={unreadCount > 0 ? "notify-button active" : "notify-button"}
              onClick={() => onOpenHotspots()}
              aria-label={`未读热点 ${unreadCount} 条`}
            >
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
                    <button key={item.id} className="notify-item" onClick={() => onOpenOriginal(item)}>
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
          <button className="radar-icon-button" onClick={onRefresh} title="刷新" aria-label="刷新仪表盘">
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
    { label: "总热点", value: totalHotspots, tone: "default", caption: "当前可见情报池" },
    { label: "今日新增", value: todayAdded, tone: "cyan", caption: "新鲜内容入口" },
    { label: "紧急热点", value: urgentCount, tone: "red", caption: "建议优先处理" },
    { label: "监控词", value: activeKeywords, tone: "green", caption: "启用中的追踪" }
  ];

  return (
    <section className="metric-grid status-strip" aria-label="热点概览">
      {metrics.map((metric) => (
        <div key={metric.label} className={`metric-card ${metric.tone}`}>
          <div>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </div>
          <small>{metric.caption}</small>
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
  hotspotSearch,
  onHotspotSearchChange,
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
  sourceFilter: string;
  priorityFilter: "all" | "hot" | "watch" | "low";
  onSourceFilter: (value: string) => void;
  onPriorityFilter: (value: "all" | "hot" | "watch" | "low") => void;
  hotspotSearch: string;
  onHotspotSearchChange: (value: string) => void;
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
  const filterSummary = getFilterSummary({
    keywordFilter,
    keywords,
    sortBy,
    readFilter,
    sourceFilter,
    priorityFilter,
    hotspotSearch,
    visibleCount: items.length,
    totalCount: allItems.length
  });

  for (const item of allItems) {
    if (item.keywordId === null) continue;
    keywordCounts.set(item.keywordId, (keywordCounts.get(item.keywordId) ?? 0) + 1);
  }

  return (
    <div className="hotspot-workbench">
      <div className="hotspot-main-column">
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

        <div className="sort-filter-bar console-bar" role="search" aria-label="热点筛选">
          <label className="hotspot-search-bar">
            <Search className="size-4" />
            <span className="sr-only">搜索热点标题或内容</span>
            <input
              type="text"
              placeholder="搜索热点标题、内容..."
              value={hotspotSearch}
              onChange={(e) => onHotspotSearchChange(e.target.value)}
            />
            {hotspotSearch ? (
              <button
                className="hotspot-search-clear"
                onClick={() => onHotspotSearchChange("")}
                title="清除搜索"
              >
                ×
              </button>
            ) : null}
          </label>
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
          <label className="source-search-field">
            <span className="sr-only">搜索来源</span>
            <input
              className="source-search-input"
              type="text"
              placeholder="搜索来源..."
              value={sourceFilter}
              onChange={(e) => onSourceFilter(e.target.value)}
            />
          </label>
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
                items.map((item) => (
                  <HotspotCard
                    key={item.id}
                    item={item}
                    onOpenOriginal={onOpenOriginal}
                  />
                ))
              )}
            </div>
          )}
        </section>
      </div>

      <InsightRail
        allItems={allItems}
        visibleItems={items}
        filterSummary={filterSummary}
        onOpenOriginal={onOpenOriginal}
      />
    </div>
  );
}

function InsightRail({
  allItems,
  visibleItems,
  filterSummary,
  onOpenOriginal
}: {
  allItems: HotspotItem[];
  visibleItems: HotspotItem[];
  filterSummary: string;
  onOpenOriginal: (item: HotspotItem) => void;
}) {
  const unreadCount = getUnreadItems(allItems).length;
  const todayAdded = getTodayAddedCount(allItems);
  const hotCount = allItems.filter((item) => item.priorityScore >= 75).length;
  const priorityItems = [...allItems]
    .filter((item) => item.priorityScore >= 50)
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 5);

  return (
    <aside className="insight-rail" aria-label="AI 洞察">
      <SummaryPanel items={allItems} />
      <section className="insight-panel">
        <div className="insight-panel-head">
          <span>FILTER</span>
          <strong>{visibleItems.length}</strong>
        </div>
        <p className="filter-summary">{filterSummary}</p>
      </section>
      <section className="insight-panel insight-metrics">
        <InsightMetric label="未读" value={unreadCount} tone="cyan" />
        <InsightMetric label="高优先" value={hotCount} tone="red" />
        <InsightMetric label="今日" value={todayAdded} tone="green" />
      </section>
      <PriorityMiniList items={priorityItems} onOpenOriginal={onOpenOriginal} />
    </aside>
  );
}

function InsightMetric({ label, value, tone }: { label: string; value: number; tone: "cyan" | "red" | "green" }) {
  return (
    <div className={`insight-metric ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function PriorityMiniList({ items, onOpenOriginal }: { items: HotspotItem[]; onOpenOriginal: (item: HotspotItem) => void }) {
  return (
    <section className="insight-panel">
      <div className="insight-panel-head">
        <span>PRIORITY</span>
        <strong>Top</strong>
      </div>
      <div className="priority-mini-list">
        {items.length === 0 ? (
          <p className="priority-mini-empty">暂无高优先级热点</p>
        ) : (
          items.map((item) => (
            <button key={item.id} className="priority-mini-item" onClick={() => onOpenOriginal(item)}>
              <span>{item.priorityScore}</span>
              <strong>{item.title}</strong>
              <small>{item.matchedKeyword} · {getItemSourceLabel(item)}</small>
            </button>
          ))
        )}
      </div>
    </section>
  );
}

function getFilterSummary({
  keywordFilter,
  keywords,
  sortBy,
  readFilter,
  sourceFilter,
  priorityFilter,
  hotspotSearch,
  visibleCount,
  totalCount
}: {
  keywordFilter: number | "all";
  keywords: Keyword[];
  sortBy: "priority" | "newest" | "interaction" | "unread";
  readFilter: "all" | "unread" | "read";
  sourceFilter: string;
  priorityFilter: "all" | "hot" | "watch" | "low";
  hotspotSearch: string;
  visibleCount: number;
  totalCount: number;
}) {
  const keyword = keywordFilter === "all" ? "全部监控词" : keywords.find((item) => item.id === keywordFilter)?.term ?? "当前监控词";
  const parts = [
    keyword,
    sortLabel(sortBy),
    readLabel(readFilter),
    priorityLabel(priorityFilter)
  ];
  if (sourceFilter) parts.push(`来源含「${sourceFilter}」`);
  if (hotspotSearch) parts.push(`搜索「${hotspotSearch}」`);
  return `${parts.join(" · ")}，显示 ${visibleCount}/${totalCount} 条`;
}

function sortLabel(value: "priority" | "newest" | "interaction" | "unread"): string {
  if (value === "newest") return "最新发布";
  if (value === "interaction") return "互动热度";
  if (value === "unread") return "未读优先";
  return "优先级排序";
}

function readLabel(value: "all" | "unread" | "read"): string {
  if (value === "unread") return "仅未读";
  if (value === "read") return "仅已读";
  return "全部阅读状态";
}

function priorityLabel(value: "all" | "hot" | "watch" | "low"): string {
  if (value === "hot") return "热门";
  if (value === "watch") return "关注";
  if (value === "low") return "低质";
  return "全部重要程度";
}

function HotspotCard({ item, onOpenOriginal }: {
  item: HotspotItem;
  onOpenOriginal: (item: HotspotItem) => void;
}) {
  const unread = item.status === "new" && !item.readAt;
  const priority = getPriority(item);
  const interaction = formatInteraction(item);
  const hotness = computeHotnessScore(item);
  const hotnessColor = hotness >= 80 ? "#f87171" : hotness >= 65 ? "#facc15" : "#60a5fa";

  return (
    <article className={unread ? "signal-item unread" : "signal-item"}>
      <div className="signal-score-rail">
        <div className={`priority-badge ${priority.tone}`}>
          <Zap className="size-3" />
          {priority.label}
        </div>
        <div className="hotness-indicator" style={{ color: hotnessColor }}>
          <Flame className="size-3" />
          {Math.round(hotness)}
        </div>
      </div>
      <div className="signal-copy">
        <div className="signal-source">
          <span>{item.matchedKeyword}</span>
          <span>{getItemSourceLabel(item)}</span>
          {item.sourceReliability ? (
            <span className={`reliability-tag reliability-${item.sourceReliability}`}>
              {reliabilityLabel(item.sourceReliability)}
            </span>
          ) : null}
          {item.authorName ? (
            <span className="author-tag">
              {item.authorVerified ? (
                <span className="author-verified-mark">V</span>
              ) : null}
              {item.authorName}
              {item.authorFollowers > 0 ? (
                <span className="author-followers">{formatNumber(item.authorFollowers)}粉</span>
              ) : null}
            </span>
          ) : null}
          {!unread && item.readAt ? (
            <span className="read-badge">
              <CheckCircle2 className="size-3" />
              已读
            </span>
          ) : null}
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
        <AiReasonBlock item={item} />
        <div className="signal-meta">
          <span>优先 {item.priorityScore}</span>
          <span title={formatDate(item.publishedAt)}>发布 {relativeTime(item.publishedAt)}</span>
          <span className="signal-fetched" title={formatDate(item.fetchedAt)}>抓取 {relativeTime(item.fetchedAt)}</span>
          {interaction ? <span>{interaction}</span> : null}
        </div>
      </div>
    </article>
  );
}

function AiReasonBlock({ item }: { item: HotspotItem }) {
  const reason = getAiReasonText(item);
  if (!reason || !item.evaluation) return null;

  return (
    <section className="ai-reason-block" aria-label="AI 分析理由">
      <p>
        <strong>AI 分析</strong>
        <span>此内容与【{item.matchedKeyword}】的关联：{reason}</span>
      </p>
      <div className="ai-reason-tags">
        <span>相关性 {Math.round(item.evaluation.relevanceScore)}%</span>
        <span>可信 {Math.round(item.evaluation.credibilityScore)}%</span>
        <span>建议：{recommendedActionLabel(item.evaluation.recommendedAction)}</span>
      </div>
    </section>
  );
}

function computeHotnessScore(item: HotspotItem): number {
  const h = item.evaluation?.hotnessScore ?? 0;
  const interaction = Math.log10(item.interactionViews + item.interactionLikes + 1) * 20;
  return Math.round(h * 0.4 + Math.min(100, interaction) * 0.6);
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
          <label className="field-label">
            <span>关键词</span>
            <input className="radar-input" value={props.keywordTerm} onChange={(event) => props.setKeywordTerm(event.target.value)} placeholder="例如 Unity" />
          </label>
          <label className="field-label">
            <span>范围</span>
            <input className="radar-input" value={props.keywordScope} onChange={(event) => props.setKeywordScope(event.target.value)} placeholder="行业、账号、技术范围" />
          </label>
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
                  aria-label={`${keyword.enabled ? "禁用" : "启用"} ${keyword.term}`}
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
          <label className="field-label">
            <span>来源名称</span>
            <input className="radar-input" value={props.sourceName} onChange={(event) => props.setSourceName(event.target.value)} placeholder="来源名称" />
          </label>
          <label className="field-label">
            <span>RSS URL</span>
            <input className="radar-input" value={props.sourceUrl} onChange={(event) => props.setSourceUrl(event.target.value)} placeholder="RSS URL" />
          </label>
          <label className="field-label">
            <span>分类</span>
            <input className="radar-input" value={props.sourceCategory} onChange={(event) => props.setSourceCategory(event.target.value)} placeholder="分类" />
          </label>
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

function getAiReasonText(item: HotspotItem): string {
  if (!item.evaluation) return "";
  return cleanText(item.evaluation.relevanceSummary || item.evaluation.reason || "");
}

function recommendedActionLabel(value: string): string {
  if (value === "notify") return "通知";
  if (value === "watch") return "关注";
  if (value === "ignore") return "忽略";
  return "关注";
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
  if (value === "bilibili_search") return "B站搜索";
  if (value === "weibo_hot") return "微博热搜";
  return "RSS";
}

function reliabilityLabel(value: string | null): string {
  if (value === "official") return "官方";
  if (value === "trusted") return "可信";
  if (value === "community") return "社区";
  if (value === "search") return "搜索";
  return "未知";
}

function SummaryPanel({ items }: { items: HotspotItem[] }) {
  const [briefing, setBriefing] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (items.length === 0) return;
    setLoading(true);
    api.summary().then((s) => { setBriefing(s.briefing); setLoading(false); }).catch(() => setLoading(false));
  }, [items.length]);
  if (!briefing) return null;
  return (
    <div className="briefing-panel">
      <div className="briefing-header">
        <Sparkles className="size-4" />
        <span>AI 简报</span>
        {loading ? <Loader2 className="size-3 animate-spin" /> : null}
      </div>
      <p className="briefing-text">{briefing}</p>
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
  if (item.interactionDanmaku > 0) parts.push(`${formatNumber(item.interactionDanmaku)}弹幕`);
  if (item.interactionQuotes > 0) parts.push(`${formatNumber(item.interactionQuotes)}引用`);
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
