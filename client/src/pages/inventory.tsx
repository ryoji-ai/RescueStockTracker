import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import AddEquipmentModal from "@/components/modals/add-equipment-modal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, formatNumber, getStockStatus, getExpirationStatus } from "@/lib/utils";
import type { EquipmentWithCategory } from "@shared/schema";

export default function Inventory() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: equipment = [], isLoading } = useQuery<EquipmentWithCategory[]>({
    queryKey: ["/api/equipment"],
  });

  const filteredEquipment = equipment.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (item: EquipmentWithCategory) => {
    const stockStatus = getStockStatus(item.currentStock, item.minimumStock);
    const expirationStatus = getExpirationStatus(item.expirationDate);

    if (expirationStatus === "critical" || expirationStatus === "expired") {
      return <Badge variant="destructive">期限切れ間近</Badge>;
    }
    
    if (stockStatus === "critical") {
      return <Badge variant="destructive">在庫切れ</Badge>;
    }
    
    if (stockStatus === "warning") {
      return <Badge variant="secondary">在庫不足</Badge>;
    }
    
    return <Badge variant="outline">正常</Badge>;
  };

  if (isLoading) {
    return (
      <>
        <Header
          title="在庫一覧"
          description="救急資器材の在庫状況一覧"
          showAddButton
          showSearch
          onAddClick={() => setShowAddModal(true)}
          onSearch={setSearchQuery}
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
        title="在庫一覧"
        description="救急資器材の在庫状況一覧"
        showAddButton
        showSearch
        onAddClick={() => setShowAddModal(true)}
        onSearch={setSearchQuery}
      />

      <div className="flex-1 overflow-auto p-6">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>資器材名</TableHead>
                  <TableHead>カテゴリ</TableHead>
                  <TableHead>現在在庫</TableHead>
                  <TableHead>最低在庫</TableHead>
                  <TableHead>有効期限</TableHead>
                  <TableHead>状態</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEquipment.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {searchQuery ? "検索条件に一致する資器材がありません" : "登録された資器材がありません"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEquipment.map((item) => (
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
                        <span className="text-muted-foreground">
                          {formatNumber(item.minimumStock)}{item.unit}
                        </span>
                      </TableCell>
                      <TableCell>
                        {item.expirationDate ? (
                          <span className={
                            getExpirationStatus(item.expirationDate) === "critical" ? 
                            "text-destructive font-medium" : ""
                          }>
                            {formatDate(item.expirationDate)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(item)}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <i className="fas fa-edit mr-1"></i>
                            編集
                          </Button>
                          <Button variant="outline" size="sm">
                            <i className="fas fa-history mr-1"></i>
                            履歴
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <AddEquipmentModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
      />
    </>
  );
}
