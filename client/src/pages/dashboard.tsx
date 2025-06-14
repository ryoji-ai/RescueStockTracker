import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import AddEquipmentModal from "@/components/modals/add-equipment-modal";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { formatTime, formatNumber, getDaysUntilExpiration, getExpirationStatus } from "@/lib/utils";
import type { 
  DashboardStats, 
  CategoryStats, 
  UsageHistoryWithDetails, 
  EquipmentWithCategory 
} from "@shared/schema";

export default function Dashboard() {
  const [showAddModal, setShowAddModal] = useState(false);

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: categoryStats = [] } = useQuery<CategoryStats[]>({
    queryKey: ["/api/dashboard/category-stats"],
  });

  const { data: recentUsage = [] } = useQuery<UsageHistoryWithDetails[]>({
    queryKey: ["/api/dashboard/recent-usage"],
  });

  const { data: criticalItems = [] } = useQuery<EquipmentWithCategory[]>({
    queryKey: ["/api/dashboard/critical-items"],
  });

  const renderCriticalItem = (item: EquipmentWithCategory) => {
    const daysUntilExpiration = getDaysUntilExpiration(item.expirationDate);
    const expirationStatus = getExpirationStatus(item.expirationDate);
    const isLowStock = item.currentStock <= item.minimumStock;
    const isExpiring = expirationStatus === "critical" || expirationStatus === "warning";

    return (
      <div
        key={item.id}
        className={`critical-item ${
          isExpiring ? "critical-item-expiring" : "critical-item-low-stock"
        }`}
      >
        <div className="flex-1">
          <p className="font-medium text-foreground">{item.name}</p>
          {isExpiring && daysUntilExpiration !== null && (
            <p className="text-sm text-destructive">
              期限: {item.expirationDate && new Date(item.expirationDate).toLocaleDateString("ja-JP")} 
              (残り{daysUntilExpiration}日)
            </p>
          )}
          {isLowStock && (
            <p className="text-sm text-warning">
              残り在庫: {formatNumber(item.currentStock)}{item.unit}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {isExpiring && (
            <span className="alert-badge alert-badge-critical">期限切れ間近</span>
          )}
          {isLowStock && (
            <span className="alert-badge alert-badge-warning">在庫不足</span>
          )}
          <span className="text-sm font-medium text-foreground">
            {formatNumber(item.currentStock)}{item.unit}
          </span>
        </div>
      </div>
    );
  };

  return (
    <>
      <Header
        title="ダッシュボード"
        description="救急資器材の在庫状況を確認"
        showAddButton
        showSearch
        onAddClick={() => setShowAddModal(true)}
        onSearch={(query) => {
          // 検索機能の実装
          console.log("Search query:", query);
        }}
      />

      <div className="flex-1 overflow-auto p-6">
        {/* Alert Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">期限切れ間近</p>
                  <p className="text-3xl font-bold text-destructive mt-2">
                    {formatNumber(stats?.expiringSoon || 0)}
                  </p>
                </div>
                <div className="stat-card-icon bg-red-100 text-destructive dark:bg-red-900">
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">7日以内に期限切れ</p>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">在庫不足</p>
                  <p className="text-3xl font-bold text-warning mt-2">
                    {formatNumber(stats?.lowStock || 0)}
                  </p>
                </div>
                <div className="stat-card-icon bg-orange-100 text-warning dark:bg-orange-900">
                  <i className="fas fa-box-open"></i>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">最低在庫数を下回る</p>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">総在庫数</p>
                  <p className="text-3xl font-bold text-success mt-2">
                    {formatNumber(stats?.totalItems || 0)}
                  </p>
                </div>
                <div className="stat-card-icon bg-green-100 text-success dark:bg-green-900">
                  <i className="fas fa-boxes"></i>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">管理中の資器材</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Critical Items */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <Card className="dashboard-card">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">最近の使用履歴</h3>
            </div>
            <div className="p-6">
              {recentUsage.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  使用履歴がありません
                </p>
              ) : (
                recentUsage.map((usage) => (
                  <div key={usage.id} className="activity-item">
                    <div className={`activity-icon ${
                      usage.type === "usage" ? "activity-icon-usage" : "activity-icon-restock"
                    }`}>
                      <i className={
                        usage.type === "usage" ? "fas fa-arrow-down" : "fas fa-arrow-up"
                      }></i>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{usage.equipment.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {usage.type === "usage" ? "使用数" : "補充"}: {formatNumber(usage.quantity)}{usage.equipment.unit} | {usage.user.fullName}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatTime(usage.timestamp)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Critical Items */}
          <Card className="dashboard-card">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">注意が必要な資器材</h3>
            </div>
            <div className="p-6 space-y-4">
              {criticalItems.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  注意が必要な資器材はありません
                </p>
              ) : (
                criticalItems.map(renderCriticalItem)
              )}
            </div>
          </Card>
        </div>

        {/* Category Overview */}
        <Card className="dashboard-card mt-8">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">カテゴリ別在庫状況</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categoryStats.map((categoryData) => (
                <div key={categoryData.category.id} className="category-overview-card">
                  <div className="category-icon">
                    <i className={categoryData.category.iconName}></i>
                  </div>
                  <h4 className="font-medium text-foreground mb-2">
                    {categoryData.category.name}
                  </h4>
                  <p className="text-2xl font-bold text-primary mb-1">
                    {formatNumber(categoryData.totalItems)}
                  </p>
                  <p className="text-sm text-muted-foreground">アイテム</p>
                  <div className="mt-3 flex justify-center space-x-4 text-xs">
                    <span className="text-success">
                      正常: {formatNumber(categoryData.normalCount)}
                    </span>
                    <span className="text-warning">
                      注意: {formatNumber(categoryData.warningCount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <AddEquipmentModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
      />
    </>
  );
}
