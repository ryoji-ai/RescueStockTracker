import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";
import type { DashboardStats, CategoryStats } from "@shared/schema";

export default function Reports() {
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: categoryStats = [] } = useQuery<CategoryStats[]>({
    queryKey: ["/api/dashboard/category-stats"],
  });

  return (
    <>
      <Header
        title="レポート"
        description="在庫統計とカテゴリ別分析"
      />

      <div className="flex-1 overflow-auto p-6 space-y-8">
        {/* 全体統計 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <i className="fas fa-chart-bar text-primary"></i>
              <span>全体統計</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-3xl font-bold text-primary mb-2">
                  {formatNumber(stats?.totalItems || 0)}
                </div>
                <div className="text-sm text-muted-foreground">総資器材数</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-3xl font-bold text-destructive mb-2">
                  {formatNumber(stats?.expiringSoon || 0)}
                </div>
                <div className="text-sm text-muted-foreground">期限切れ間近</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-3xl font-bold text-warning mb-2">
                  {formatNumber(stats?.lowStock || 0)}
                </div>
                <div className="text-sm text-muted-foreground">在庫不足</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-3xl font-bold text-success mb-2">
                  {formatNumber(stats?.totalCategories || 0)}
                </div>
                <div className="text-sm text-muted-foreground">カテゴリ数</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* カテゴリ別詳細統計 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <i className="fas fa-layer-group text-primary"></i>
              <span>カテゴリ別詳細統計</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {categoryStats.map((categoryData) => (
                <div key={categoryData.category.id} className="border border-border rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                      <i className={`${categoryData.category.iconName} text-primary-foreground`}></i>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {categoryData.category.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {categoryData.category.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-muted rounded">
                      <div className="text-2xl font-bold text-primary mb-1">
                        {formatNumber(categoryData.totalItems)}
                      </div>
                      <div className="text-xs text-muted-foreground">総アイテム数</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded">
                      <div className="text-2xl font-bold text-success mb-1">
                        {formatNumber(categoryData.normalCount)}
                      </div>
                      <div className="text-xs text-muted-foreground">正常</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 dark:bg-orange-950 rounded">
                      <div className="text-2xl font-bold text-warning mb-1">
                        {formatNumber(categoryData.warningCount)}
                      </div>
                      <div className="text-xs text-muted-foreground">注意</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 dark:bg-red-950 rounded">
                      <div className="text-2xl font-bold text-destructive mb-1">
                        {formatNumber(categoryData.criticalCount)}
                      </div>
                      <div className="text-xs text-muted-foreground">重要</div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                      <span>在庫状況</span>
                      <span>
                        {categoryData.totalItems > 0 
                          ? Math.round((categoryData.normalCount / categoryData.totalItems) * 100)
                          : 0
                        }% 正常
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-success h-2 rounded-full"
                        style={{
                          width: categoryData.totalItems > 0 
                            ? `${(categoryData.normalCount / categoryData.totalItems) * 100}%`
                            : '0%'
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 改善提案 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <i className="fas fa-lightbulb text-primary"></i>
              <span>改善提案</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.expiringSoon && stats.expiringSoon > 0 && (
                <div className="flex items-start space-x-3 p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                  <i className="fas fa-exclamation-triangle text-destructive mt-1"></i>
                  <div>
                    <h4 className="font-medium text-foreground">期限管理の改善</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {stats.expiringSoon}件の資器材が期限切れ間近です。
                      定期的な在庫チェックと先入先出し(FIFO)の徹底をお勧めします。
                    </p>
                  </div>
                </div>
              )}
              
              {stats?.lowStock && stats.lowStock > 0 && (
                <div className="flex items-start space-x-3 p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                  <i className="fas fa-box-open text-warning mt-1"></i>
                  <div>
                    <h4 className="font-medium text-foreground">在庫補充の最適化</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {stats.lowStock}件の資器材が在庫不足状態です。
                      自動発注システムの導入や安全在庫の見直しを検討してください。
                    </p>
                  </div>
                </div>
              )}

              {(!stats?.expiringSoon || stats.expiringSoon === 0) && 
               (!stats?.lowStock || stats.lowStock === 0) && (
                <div className="flex items-start space-x-3 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <i className="fas fa-check-circle text-success mt-1"></i>
                  <div>
                    <h4 className="font-medium text-foreground">良好な在庫管理状態</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      現在、在庫管理は良好な状態です。
                      この状態を維持するため、定期的な点検を継続してください。
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
