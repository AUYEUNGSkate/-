import type { AppSettings, DashboardPayload, HotspotItem, Keyword, Source } from "../../shared/types";

const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {})
    }
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(payload.error ?? response.statusText);
  }
  return response.json() as Promise<T>;
}

export const api = {
  dashboard: () => request<DashboardPayload>("/dashboard"),
  scan: () => request<{ result: unknown; dashboard: DashboardPayload }>("/scan", { method: "POST" }),
  createKeyword: (term: string, scope: string) =>
    request<Keyword>("/keywords", { method: "POST", body: JSON.stringify({ term, scope }) }),
  updateKeyword: (id: number, patch: Partial<Keyword>) =>
    request<Keyword>(`/keywords/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
  deleteKeyword: (id: number) => request<{ ok: boolean }>(`/keywords/${id}`, { method: "DELETE" }),
  createSource: (input: Pick<Source, "name" | "url" | "category">) =>
    request<Source>("/sources", { method: "POST", body: JSON.stringify(input) }),
  updateSource: (id: number, patch: Partial<Source>) =>
    request<Source>(`/sources/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
  deleteSource: (id: number) => request<{ ok: boolean }>(`/sources/${id}`, { method: "DELETE" }),
  markRead: (id: number) => request<{ ok: boolean; unreadCount: number }>(`/items/${id}/read`, { method: "PATCH" }),
  updateSettings: (patch: Partial<AppSettings>) =>
    request<AppSettings>("/settings", { method: "PATCH", body: JSON.stringify(patch) }),
  archived: (limit = 100) => request<HotspotItem[]>(`/items/archived?limit=${limit}`),
  restore: (id: number) => request<{ ok: boolean }>(`/items/${id}/restore`, { method: "POST" }),
  batchRestore: (ids: number[]) => request<{ ok: number }>("/items/batch-restore", { method: "POST", body: JSON.stringify({ ids }) }),
  batchDelete: (ids: number[]) => request<{ ok: number }>("/items/batch-delete", { method: "POST", body: JSON.stringify({ ids }) }),
  archiveStale: () => request<{ ok: number; unreadCount: number }>("/items/archive-stale", { method: "POST" }),
  summary: () => request<{ briefing: string }>("/summary")
};

export function formatDate(value: string | null): string {
  if (!value) return "尚未完成";
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function scoreTone(item: HotspotItem): string {
  const score = item.evaluation?.hotnessScore ?? 0;
  if (score >= 80) return "text-radar-hot";
  if (score >= 70) return "text-radar-amber";
  return "text-radar-faint";
}

export function relativeTime(value: string | null): string {
  if (!value) return "";
  const now = Date.now();
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return "";
  const diff = now - then;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "刚刚";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}天前`;
  return formatDate(value);
}
