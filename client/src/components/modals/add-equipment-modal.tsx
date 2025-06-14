import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Category } from "@shared/schema";

const addEquipmentSchema = z.object({
  name: z.string().min(1, "資器材名は必須です"),
  categoryId: z.number().min(1, "カテゴリを選択してください"),
  currentStock: z.number().min(0, "在庫数は0以上である必要があります"),
  minimumStock: z.number().min(0, "最低在庫数は0以上である必要があります"),
  unit: z.string().min(1, "単位は必須です"),
  expirationDate: z.string().optional().nullable(),
  batchNumber: z.string().optional(),
  notes: z.string().optional(),
});

type AddEquipmentForm = z.infer<typeof addEquipmentSchema>;

interface AddEquipmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddEquipmentModal({ open, onOpenChange }: AddEquipmentModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const form = useForm<AddEquipmentForm>({
    resolver: zodResolver(addEquipmentSchema),
    defaultValues: {
      name: "",
      categoryId: 0,
      currentStock: 0,
      minimumStock: 5,
      unit: "個",
      expirationDate: "",
      batchNumber: "",
      notes: "",
    },
  });

  const createEquipmentMutation = useMutation({
    mutationFn: async (data: AddEquipmentForm) => {
      const response = await apiRequest("POST", "/api/equipment", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/equipment"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "成功",
        description: "資器材が正常に追加されました。",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "エラー",
        description: error.message || "資器材の追加に失敗しました。",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AddEquipmentForm) => {
    createEquipmentMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>新規資器材追加</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">資器材名 *</Label>
            <Input
              id="name"
              placeholder="例: 酸素マスク（成人用）"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="currentStock">現在の在庫数 *</Label>
              <Input
                id="currentStock"
                type="number"
                min="0"
                placeholder="0"
                {...form.register("currentStock", { valueAsNumber: true })}
              />
              {form.formState.errors.currentStock && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.currentStock.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="minimumStock">最低在庫数 *</Label>
              <Input
                id="minimumStock"
                type="number"
                min="0"
                placeholder="5"
                {...form.register("minimumStock", { valueAsNumber: true })}
              />
              {form.formState.errors.minimumStock && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.minimumStock.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="categoryId">カテゴリ *</Label>
              <Select
                onValueChange={(value) => form.setValue("categoryId", parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="カテゴリを選択" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.categoryId && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.categoryId.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="unit">単位 *</Label>
              <Input
                id="unit"
                placeholder="個"
                {...form.register("unit")}
              />
              {form.formState.errors.unit && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.unit.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="expirationDate">有効期限（任意）</Label>
            <Input
              id="expirationDate"
              type="date"
              {...form.register("expirationDate")}
            />
          </div>

          <div>
            <Label htmlFor="batchNumber">ロット番号（任意）</Label>
            <Input
              id="batchNumber"
              placeholder="例: LOT123456"
              {...form.register("batchNumber")}
            />
          </div>

          <div>
            <Label htmlFor="notes">備考（任意）</Label>
            <Textarea
              id="notes"
              placeholder="備考や注意事項があれば入力してください"
              {...form.register("notes")}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              className="flex-1"
              disabled={createEquipmentMutation.isPending}
            >
              {createEquipmentMutation.isPending ? "追加中..." : "追加"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              キャンセル
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
