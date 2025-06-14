import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    path: "/",
    label: "ダッシュボード",
    icon: "fas fa-tachometer-alt",
  },
  {
    path: "/inventory",
    label: "在庫一覧",
    icon: "fas fa-boxes",
  },
  {
    path: "/usage-history",
    label: "使用履歴",
    icon: "fas fa-history",
  },
  {
    path: "/expiration-alerts",
    label: "期限通知",
    icon: "fas fa-exclamation-triangle",
    badge: 3,
  },
  {
    path: "/reports",
    label: "レポート",
    icon: "fas fa-chart-bar",
  },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-card shadow-lg border-r border-border flex flex-col">
      {/* Sidebar Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <i className="fas fa-heartbeat text-primary-foreground text-lg"></i>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">救急資器材</h1>
            <p className="text-sm text-muted-foreground">在庫管理システム</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const isActive = location === item.path;
          return (
            <Link key={item.path} href={item.path}>
              <div
                className={cn(
                  "sidebar-nav-item",
                  isActive ? "sidebar-nav-item-active" : "sidebar-nav-item-inactive"
                )}
              >
                <i className={`${item.icon} w-5`}></i>
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-auto alert-badge alert-badge-critical">
                    {item.badge}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Organization Info */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3 px-4 py-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
            <i className="fas fa-shield-alt text-white text-lg"></i>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">総社市消防本部</p>
            <p className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950 px-2 py-1 rounded-md inline-block mt-1">
              救急係
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
