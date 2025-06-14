import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ユーザー管理
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("user"), // user, admin
});

// 資器材カテゴリ
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  description: text("description"),
  iconName: text("icon_name").notNull().default("fas fa-box"),
});

// 救急資器材
export const equipment = pgTable("equipment", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  categoryId: integer("category_id").notNull().references(() => categories.id),
  currentStock: integer("current_stock").notNull().default(0),
  minimumStock: integer("minimum_stock").notNull().default(0),
  unit: text("unit").notNull().default("個"),
  expirationDate: timestamp("expiration_date"),
  batchNumber: text("batch_number"),
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// 使用履歴
export const usageHistory = pgTable("usage_history", {
  id: serial("id").primaryKey(),
  equipmentId: integer("equipment_id").notNull().references(() => equipment.id),
  userId: integer("user_id").notNull().references(() => users.id),
  quantity: integer("quantity").notNull(),
  type: text("type").notNull(), // usage, restock, adjustment
  reason: text("reason"),
  notes: text("notes"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// アラート設定
export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  equipmentId: integer("equipment_id").notNull().references(() => equipment.id),
  type: text("type").notNull(), // expiration, low_stock
  isActive: boolean("is_active").notNull().default(true),
  threshold: integer("threshold"), // 期限切れまでの日数、または最低在庫数
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// スキーマ定義
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
}).extend({
  description: z.string().nullable().optional(),
  iconName: z.string().optional(),
});

export const insertEquipmentSchema = createInsertSchema(equipment).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  expirationDate: z.string().optional().nullable(),
  currentStock: z.number().optional(),
  minimumStock: z.number().optional(),
  unit: z.string().optional(),
  batchNumber: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

export const insertUsageHistorySchema = createInsertSchema(usageHistory).omit({
  id: true,
  timestamp: true,
}).extend({
  reason: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  createdAt: true,
}).extend({
  isActive: z.boolean().optional(),
  threshold: z.number().nullable().optional(),
});

// 型定義
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Equipment = typeof equipment.$inferSelect;
export type InsertEquipment = z.infer<typeof insertEquipmentSchema>;

export type UsageHistory = typeof usageHistory.$inferSelect;
export type InsertUsageHistory = z.infer<typeof insertUsageHistorySchema>;

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;

// ビュー用の型定義
export type EquipmentWithCategory = Equipment & {
  category: Category;
};

export type UsageHistoryWithDetails = UsageHistory & {
  equipment: Equipment;
  user: User;
};

export type DashboardStats = {
  totalItems: number;
  expiringSoon: number;
  lowStock: number;
  totalCategories: number;
};

export type CategoryStats = {
  category: Category;
  totalItems: number;
  normalCount: number;
  warningCount: number;
  criticalCount: number;
};
