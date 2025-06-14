import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime, formatNumber, getUsageTypeLabel } from "@/lib/utils";
import type { UsageHistoryWithDetails } from "@shared/schema";

export default function UsageHistory() {
  const { data: usageHistory = [], isLoading } = useQuery<UsageHistoryWithDetails[]>({
    queryKey: ["/api/usage-history"],
  });

  const getTypeVariant = (type: string) => {
    switch (type) {
      case "usage":
        return "destructive";
      case "restock":
        return "default";
      case "adjustment":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getTypeIcon = (type: string) => {
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
  };

  if (isLoading) {
    return (
      <>
        <Header
          title="使用履歴"
          description="救急資器材の使用・補充履歴"
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
        title="使用履歴"
        description="救急資器材の使用・補充履歴"
      />

      <div className="flex-1 overflow-auto p-6">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>日時</TableHead>
                  <TableHead>資器材名</TableHead>
                  <TableHead>種別</TableHead>
                  <TableHead>数量</TableHead>
                  <TableHead>担当者</TableHead>
                  <TableHead>理由</TableHead>
                  <TableHead>備考</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usageHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      使用履歴がありません
                    </TableCell>
                  </TableRow>
                ) : (
                  usageHistory.map((usage) => (
                    <TableRow key={usage.id}>
                      <TableCell className="font-medium">
                        {formatDateTime(usage.timestamp)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <i className={`${usage.equipment.category?.iconName || 'fas fa-box'} text-primary`}></i>
                          <span>{usage.equipment.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getTypeVariant(usage.type)}>
                          <i className={`${getTypeIcon(usage.type)} mr-1`}></i>
                          {getUsageTypeLabel(usage.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {formatNumber(usage.quantity)}
                        </span>
                        <span className="text-muted-foreground ml-1">
                          {usage.equipment.unit}
                        </span>
                      </TableCell>
                      <TableCell>{usage.user.fullName}</TableCell>
                      <TableCell>
                        {usage.reason || (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {usage.notes || (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
