import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEquipmentSchema, insertUsageHistorySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // ダッシュボード用データ
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "ダッシュボード統計の取得に失敗しました" });
    }
  });

  app.get("/api/dashboard/category-stats", async (req, res) => {
    try {
      const stats = await storage.getCategoryStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "カテゴリ統計の取得に失敗しました" });
    }
  });

  app.get("/api/dashboard/recent-usage", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const usage = await storage.getRecentUsageHistory(limit);
      res.json(usage);
    } catch (error) {
      res.status(500).json({ message: "最近の使用履歴の取得に失敗しました" });
    }
  });

  app.get("/api/dashboard/critical-items", async (req, res) => {
    try {
      const items = await storage.getCriticalItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "注意が必要な資器材の取得に失敗しました" });
    }
  });

  // カテゴリ管理
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "カテゴリの取得に失敗しました" });
    }
  });

  // 資器材管理
  app.get("/api/equipment", async (req, res) => {
    try {
      const equipment = await storage.getEquipment();
      res.json(equipment);
    } catch (error) {
      res.status(500).json({ message: "資器材一覧の取得に失敗しました" });
    }
  });

  app.get("/api/equipment/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "無効なIDです" });
      }

      const equipment = await storage.getEquipmentById(id);
      if (!equipment) {
        return res.status(404).json({ message: "資器材が見つかりません" });
      }

      res.json(equipment);
    } catch (error) {
      res.status(500).json({ message: "資器材の取得に失敗しました" });
    }
  });

  app.post("/api/equipment", async (req, res) => {
    try {
      const validation = insertEquipmentSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "入力データが不正です",
          errors: validation.error.errors
        });
      }

      const equipment = await storage.createEquipment(validation.data);
      res.status(201).json(equipment);
    } catch (error) {
      res.status(500).json({ message: "資器材の作成に失敗しました" });
    }
  });

  app.put("/api/equipment/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "無効なIDです" });
      }

      const validation = insertEquipmentSchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "入力データが不正です",
          errors: validation.error.errors
        });
      }

      const equipment = await storage.updateEquipment(id, validation.data);
      if (!equipment) {
        return res.status(404).json({ message: "資器材が見つかりません" });
      }

      res.json(equipment);
    } catch (error) {
      res.status(500).json({ message: "資器材の更新に失敗しました" });
    }
  });

  // 在庫数更新（使用・補充）
  app.post("/api/equipment/:id/stock", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "無効なIDです" });
      }

      const { quantity, type, reason, notes } = req.body;
      if (typeof quantity !== "number" || !type) {
        return res.status(400).json({ message: "数量と種別は必須です" });
      }

      // 使用履歴を記録
      await storage.createUsageHistory({
        equipmentId: id,
        userId: 1, // TODO: セッションから取得
        quantity: Math.abs(quantity),
        type,
        reason: reason || "",
        notes: notes || ""
      });

      const equipment = await storage.getEquipmentById(id);
      res.json(equipment);
    } catch (error) {
      res.status(500).json({ message: "在庫数の更新に失敗しました" });
    }
  });

  // 使用履歴
  app.get("/api/usage-history", async (req, res) => {
    try {
      const equipmentId = req.query.equipmentId;
      let history;
      
      if (equipmentId) {
        const id = parseInt(equipmentId as string);
        if (isNaN(id)) {
          return res.status(400).json({ message: "無効な資器材IDです" });
        }
        history = await storage.getUsageHistoryByEquipment(id);
      } else {
        history = await storage.getUsageHistory();
      }

      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "使用履歴の取得に失敗しました" });
    }
  });

  app.post("/api/usage-history", async (req, res) => {
    try {
      const validation = insertUsageHistorySchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "入力データが不正です",
          errors: validation.error.errors
        });
      }

      const usage = await storage.createUsageHistory(validation.data);
      res.status(201).json(usage);
    } catch (error) {
      res.status(500).json({ message: "使用履歴の記録に失敗しました" });
    }
  });

  // 期限切れ間近・在庫不足アラート
  app.get("/api/alerts/expiring", async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 7;
      const items = await storage.getExpiringItems(days);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "期限切れ間近資器材の取得に失敗しました" });
    }
  });

  app.get("/api/alerts/low-stock", async (req, res) => {
    try {
      const items = await storage.getLowStockItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "在庫不足資器材の取得に失敗しました" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
