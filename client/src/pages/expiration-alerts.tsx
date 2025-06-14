import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, formatNumber, getDaysUntilExpiration } from "@/lib/utils";
import type { EquipmentWithCategory } from "@shared/schema";

export default function ExpirationAlerts() {
  const { data: expiringItems = [], isLoading: expiringLoading } = useQuery<EquipmentWithCategory[]>({
    queryKey: ["/api/alerts/expiring"],
  });

  const { data: lowStockItems = [], isLoading: lowStockLoading } = useQuery<EquipmentWithCategory[]>({
    queryKey: ["/api/alerts/low-stock"],
  });

  const isLoading = expiringLoading || lowStockLoading;

  const getExpirationBadge = (expirationDate: Date | string | null) => {
    const days = getDaysUntilExpiration(expirationDate);
    
    if (days === null) return null;
    
    if (days < 0) {
      return <Badge variant="destructive">期限切れ</Badge>;
    } else if (days <= 3) {
      return <Badge variant="destructive">期限切れ間近</Badge>;
    } else if (days <= 7) {
      return <Badge variant="secondary">期限注意</Badge>;
    }
    
    return null;
  };

  if (isLoading) {
    return (
      <>
        <Header
          title="期限通知"
          description="期限切れ間近・在庫不足の資器材"
        />
        <div className="flex-1 overflow-auto p-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">読み込み中...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title="期限通知"
        description="期限切れ間近・在庫不足の資器材"
      />

      <div className="flex-1 overflow-auto p-6 space-y-8">
        {/* 期限切れ間近 */}
        <Card>
          <div className="p-6 border-b border-border">
            <div className="flex items-center space-x-2">
              <i className="fas fa-exclamation-triangle text-destructive"></i>
              <h3 className="text-lg font-semibold text-foreground">
                期限切れ間近の資器材 ({expiringItems.length}件)
              </h3>
            </div>
          </div>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>資器材名</TableHead>
                  <TableHead>カテゴリ</TableHead>
                  <TableHead>在庫数</TableHead>
                  <TableHead>有効期限</TableHead>
                  <TableHead>残り日数</TableHead>
                  <TableHead>状態</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expiringItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      期限切れ間近の資器材はありません
                    </TableCell>
                  </TableRow>
                ) : (
                  expiringItems.map((item) => {
                    const daysUntilExpiration = getDaysUntilExpiration(item.expirationDate);
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <i className={`${item.category.iconName} text-primary`}></i>
                            <span>{item.category.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {formatNumber(item.currentStock)}
                          </span>
                          <span className="text-muted-foreground ml-1">{item.unit}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-destructive font-medium">
                            {formatDate(item.expirationDate)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {daysUntilExpiration !== null && (
                            <span className={
                              daysUntilExpiration < 0 ? "text-destructive font-bold" :
                              daysUntilExpiration <= 3 ? "text-destructive font-medium" :
                              "text-warning"
                            }>
                              {daysUntilExpiration < 0 ? "期限切れ" : `${daysUntilExpiration}日`}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {getExpirationBadge(item.expirationDate)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* 在庫不足 */}
        <Card>
          <div className="p-6 border-b border-border">
            <div className="flex items-center space-x-2">
              <i className="fas fa-box-open text-warning"></i>
              <h3 className="text-lg font-semibold text-foreground">
                在庫不足の資器材 ({lowStockItems.length}件)
              </h3>
            </div>
          </div>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>資器材名</TableHead>
                  <TableHead>カテゴリ</TableHead>
                  <TableHead>現在在庫</TableHead>
                  <TableHead>最低在庫</TableHead>
                  <TableHead>不足数</TableHead>
                  <TableHead>状態</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      在庫不足の資器材はありません
                    </TableCell>
                  </TableRow>
                ) : (
                  lowStockItems.map((item) => {
                    const shortage = item.minimumStock - item.currentStock;
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <i className={`${item.category.iconName} text-primary`}></i>
                            <span>{item.category.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`font-medium ${
                            item.currentStock === 0 ? "text-destructive" : "text-warning"
                          }`}>
                            {formatNumber(item.currentStock)}
                          </span>
                          <span className="text-muted-foreground ml-1">{item.unit}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-muted-foreground">
                            {formatNumber(item.minimumStock)}{item.unit}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-warning font-medium">
                            {formatNumber(shortage)}{item.unit}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={item.currentStock === 0 ? "destructive" : "secondary"}>
                            {item.currentStock === 0 ? "在庫切れ" : "在庫不足"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
