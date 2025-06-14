import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 日本語対応の日付フォーマット
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "yyyy年MM月dd日", { locale: ja });
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "";
  
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "yyyy年MM月dd日 HH:mm", { locale: ja });
}

export function formatTime(date: Date | string | null | undefined): string {
  if (!date) return "";
  
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "HH:mm", { locale: ja });
}

export function formatRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return "";
  
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: ja });
}

// 在庫状況の判定
export function getStockStatus(currentStock: number, minimumStock: number): "normal" | "warning" | "critical" {
  if (currentStock === 0) return "critical";
  if (currentStock <= minimumStock) return "warning";
  return "normal";
}

// 期限切れまでの日数計算
export function getDaysUntilExpiration(expirationDate: Date | string | null | undefined): number | null {
  if (!expirationDate) return null;
  
  const dateObj = typeof expirationDate === "string" ? new Date(expirationDate) : expirationDate;
  const now = new Date();
  const diffTime = dateObj.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

// 期限状況の判定
export function getExpirationStatus(expirationDate: Date | string | null | undefined): "normal" | "warning" | "critical" | "expired" {
  const days = getDaysUntilExpiration(expirationDate);
  
  if (days === null) return "normal";
  if (days < 0) return "expired";
  if (days <= 3) return "critical";
  if (days <= 7) return "warning";
  return "normal";
}

// 数値のフォーマット（カンマ区切り）
export function formatNumber(num: number): string {
  return num.toLocaleString("ja-JP");
}

// 使用種別の日本語表示
export function getUsageTypeLabel(type: string): string {
  switch (type) {
    case "usage":
      return "使用";
    case "restock":
      return "補充";
    case "adjustment":
      return "調整";
    default:
      return type;
  }
}

// アラートレベルのスタイルクラス
export function getAlertClassName(level: "normal" | "warning" | "critical"): string {
  switch (level) {
    case "critical":
      return "alert-badge-critical";
    case "warning":
      return "alert-badge-warning";
    default:
      return "alert-badge-success";
  }
}

// 在庫状況に基づくアイコンクラス
export function getStockIconClass(status: "normal" | "warning" | "critical"): string {
  switch (status) {
    case "critical":
      return "fas fa-exclamation-triangle text-destructive";
    case "warning":
      return "fas fa-exclamation-circle text-warning";
    default:
      return "fas fa-check-circle text-success";
  }
}

// 使用種別のアイコンクラス
export function getUsageTypeIcon(type: string): string {
  switch (type) {
    case "usage":
      return "fas fa-arrow-down";
    case "restock":
      return "fas fa-arrow-up";
    case "adjustment":
      return "fas fa-edit";
    default:
      return "fas fa-circle";
  }
}
