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

      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3 px-4 py-3">
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <i className="fas fa-user text-muted-foreground text-sm"></i>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">田中 太郎</p>
            <p className="text-xs text-muted-foreground">救急隊員</p>
          </div>
          <button className="text-muted-foreground hover:text-foreground">
            <i className="fas fa-cog"></i>
          </button>
        </div>
      </div>
    </aside>
  );
}
