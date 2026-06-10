import type { ScreeningSourceItem, ScreeningSourceStatus } from "./types";

export function screeningSourceStatusLabel(status: ScreeningSourceStatus): string {
  if (status === "available") return "可排播";
  if (status === "planned") return "已排期";
  if (status === "watched") return "已归档";
  if (status === "hidden") return "已隐藏";
  if (status === "rejected") return "已拒绝";
  return "可排播";
}

export function screeningStatusOptions(): Array<{ value: ScreeningSourceStatus; label: string }> {
  return [
    { value: "available", label: "可排播" },
    { value: "planned", label: "已排期" },
    { value: "watched", label: "已归档" },
    { value: "hidden", label: "已隐藏" },
    { value: "rejected", label: "已拒绝" }
  ];
}

export function screeningSourceTimingLabel(item: ScreeningSourceItem): string {
  const dateLabel = formatDateKey(item.lastWatchedAt || item.plannedAt || item.addedAt || "");
  if (item.status === "watched" && item.lastWatchedAt) return `已归档 ${dateLabel}`;
  if (item.status === "planned" && item.plannedAt) return `排期 ${dateLabel}`;
  return screeningSourceStatusLabel(item.status);
}

export function screeningSourceSortTime(item: ScreeningSourceItem): number {
  const t = new Date(item.lastWatchedAt || item.addedAt || "").getTime();
  return Number.isFinite(t) ? t : 0;
}

export function parseScreeningTime(value?: string): number | undefined {
  if (!value) return undefined;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : undefined;
}

export function formatDateKey(value?: string): string {
  const time = parseScreeningTime(value);
  if (!time) return value || "待补";
  const date = new Date(time);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function dateKeyFromDate(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function defaultFanshiReview(item: ScreeningSourceItem): string {
  if (item.fanshiReview) return item.fanshiReview;
  if (item.category === "bad") return "适合当作反面案例一起吐槽，重点看它怎么把好点子拍歪。";
  if (item.category === "anime") return "动画片源优先看演出、节奏和弹幕讨论密度。";
  if (item.category === "good" || item.category === "classic") return "适合复盘结构、表演和名场面，属于可以沉淀进片单的作品。";
  return "资料仍可继续补完，欢迎补充播放入口、版本说明或吐槽点。";
}
