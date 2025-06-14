import { 
  users, 
  categories, 
  equipment, 
  usageHistory, 
  alerts,
  type User, 
  type InsertUser,
  type Category,
  type InsertCategory,
  type Equipment,
  type InsertEquipment,
  type UsageHistory,
  type InsertUsageHistory,
  type Alert,
  type InsertAlert,
  type EquipmentWithCategory,
  type UsageHistoryWithDetails,
  type DashboardStats,
  type CategoryStats
} from "@shared/schema";

export interface IStorage {
  // ユーザー管理
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // カテゴリ管理
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // 資器材管理
  getEquipment(): Promise<EquipmentWithCategory[]>;
  getEquipmentById(id: number): Promise<EquipmentWithCategory | undefined>;
  createEquipment(equipment: InsertEquipment): Promise<Equipment>;
  updateEquipment(id: number, equipment: Partial<InsertEquipment>): Promise<Equipment | undefined>;
  updateEquipmentStock(id: number, quantity: number): Promise<Equipment | undefined>;

  // 使用履歴管理
  getUsageHistory(): Promise<UsageHistoryWithDetails[]>;
  getUsageHistoryByEquipment(equipmentId: number): Promise<UsageHistoryWithDetails[]>;
  createUsageHistory(usage: InsertUsageHistory): Promise<UsageHistory>;

  // アラート管理
  getAlerts(): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;

  // ダッシュボード用
  getDashboardStats(): Promise<DashboardStats>;
  getCategoryStats(): Promise<CategoryStats[]>;
  getRecentUsageHistory(limit?: number): Promise<UsageHistoryWithDetails[]>;
  getCriticalItems(): Promise<EquipmentWithCategory[]>;
  getExpiringItems(days?: number): Promise<EquipmentWithCategory[]>;
  getLowStockItems(): Promise<EquipmentWithCategory[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private equipment: Map<number, Equipment>;
  private usageHistory: Map<number, UsageHistory>;
  private alerts: Map<number, Alert>;
  private currentUserId: number;
  private currentCategoryId: number;
  private currentEquipmentId: number;
  private currentUsageId: number;
  private currentAlertId: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.equipment = new Map();
    this.usageHistory = new Map();
    this.alerts = new Map();
    this.currentUserId = 1;
    this.currentCategoryId = 1;
    this.currentEquipmentId = 1;
    this.currentUsageId = 1;
    this.currentAlertId = 1;

    this.initializeData();
  }

  private initializeData() {
    // デフォルトユーザー
    const defaultUser: User = {
      id: this.currentUserId++,
      username: "admin",
      password: "admin",
      fullName: "管理者",
      role: "admin"
    };
    this.users.set(defaultUser.id, defaultUser);

    const user1: User = {
      id: this.currentUserId++,
      username: "tanaka",
      password: "password",
      fullName: "田中 太郎",
      role: "user"
    };
    this.users.set(user1.id, user1);

    // デフォルトカテゴリ
    const defaultCategories: Category[] = [
      {
        id: this.currentCategoryId++,
        name: "呼吸器系",
        code: "respiratory",
        description: "呼吸に関連する救急資器材",
        iconName: "fas fa-lungs"
      },
      {
        id: this.currentCategoryId++,
        name: "循環器系",
        code: "circulatory",
        description: "循環器に関連する救急資器材",
        iconName: "fas fa-heartbeat"
      },
      {
        id: this.currentCategoryId++,
        name: "外傷処置",
        code: "trauma",
        description: "外傷処置に関連する救急資器材",
        iconName: "fas fa-band-aid"
      },
      {
        id: this.currentCategoryId++,
        name: "薬品・輸液",
        code: "medication",
        description: "薬品・輸液に関連する救急資器材",
        iconName: "fas fa-pills"
      }
    ];

    defaultCategories.forEach(category => {
      this.categories.set(category.id, category);
    });

    // サンプル資器材（デザインリファレンスから）
    const sampleEquipment: Equipment[] = [
      {
        id: this.currentEquipmentId++,
        name: "生理食塩水 500ml",
        categoryId: 4,
        currentStock: 12,
        minimumStock: 20,
        unit: "個",
        expirationDate: new Date("2024-02-15"),
        batchNumber: "LOT123",
        notes: "",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: this.currentEquipmentId++,
        name: "使い捨て手袋 Lサイズ",
        categoryId: 3,
        currentStock: 5,
        minimumStock: 20,
        unit: "箱",
        expirationDate: null,
        batchNumber: "",
        notes: "",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: this.currentEquipmentId++,
        name: "バッグバルブマスク",
        categoryId: 1,
        currentStock: 2,
        minimumStock: 5,
        unit: "個",
        expirationDate: null,
        batchNumber: "",
        notes: "",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: this.currentEquipmentId++,
        name: "酸素マスク（成人用）",
        categoryId: 1,
        currentStock: 25,
        minimumStock: 10,
        unit: "個",
        expirationDate: null,
        batchNumber: "",
        notes: "",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: this.currentEquipmentId++,
        name: "心電図電極パッド",
        categoryId: 2,
        currentStock: 150,
        minimumStock: 50,
        unit: "セット",
        expirationDate: new Date("2024-12-31"),
        batchNumber: "PAD456",
        notes: "",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: this.currentEquipmentId++,
        name: "輸液セット",
        categoryId: 4,
        currentStock: 30,
        minimumStock: 15,
        unit: "セット",
        expirationDate: new Date("2024-08-30"),
        batchNumber: "IV789",
        notes: "",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    sampleEquipment.forEach(item => {
      this.equipment.set(item.id, item);
    });

    // サンプル使用履歴
    const sampleUsage: UsageHistory[] = [
      {
        id: this.currentUsageId++,
        equipmentId: 4, // 酸素マスク
        userId: 2, // 田中太郎
        quantity: 2,
        type: "usage",
        reason: "救急搬送",
        notes: "",
        timestamp: new Date("2024-02-12T12:34:00")
      },
      {
        id: this.currentUsageId++,
        equipmentId: 5, // 心電図電極
        userId: 1, // 管理者
        quantity: 50,
        type: "restock",
        reason: "定期補充",
        notes: "",
        timestamp: new Date("2024-02-12T11:15:00")
      },
      {
        id: this.currentUsageId++,
        equipmentId: 6, // 輸液セット
        userId: 2, // 田中太郎
        quantity: 3,
        type: "usage",
        reason: "救急搬送",
        notes: "",
        timestamp: new Date("2024-02-12T09:22:00")
      }
    ];

    sampleUsage.forEach(usage => {
      this.usageHistory.set(usage.id, usage);
    });
  }

  // ユーザー管理
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      role: insertUser.role || "user"
    };
    this.users.set(id, user);
    return user;
  }

  // カテゴリ管理
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const category: Category = { 
      ...insertCategory, 
      id,
      description: insertCategory.description || null,
      iconName: insertCategory.iconName || "fas fa-box"
    };
    this.categories.set(id, category);
    return category;
  }

  // 資器材管理
  async getEquipment(): Promise<EquipmentWithCategory[]> {
    const equipmentList = Array.from(this.equipment.values());
    return equipmentList.map(item => ({
      ...item,
      category: this.categories.get(item.categoryId)!
    }));
  }

  async getEquipmentById(id: number): Promise<EquipmentWithCategory | undefined> {
    const item = this.equipment.get(id);
    if (!item) return undefined;
    
    const category = this.categories.get(item.categoryId);
    if (!category) return undefined;

    return { ...item, category };
  }

  async createEquipment(insertEquipment: InsertEquipment): Promise<Equipment> {
    const id = this.currentEquipmentId++;
    const now = new Date();
    const equipment: Equipment = { 
      ...insertEquipment, 
      id,
      currentStock: insertEquipment.currentStock || 0,
      minimumStock: insertEquipment.minimumStock || 0,
      unit: insertEquipment.unit || "個",
      batchNumber: insertEquipment.batchNumber || null,
      notes: insertEquipment.notes || null,
      isActive: insertEquipment.isActive !== undefined ? insertEquipment.isActive : true,
      expirationDate: insertEquipment.expirationDate ? new Date(insertEquipment.expirationDate) : null,
      createdAt: now,
      updatedAt: now
    };
    this.equipment.set(id, equipment);
    return equipment;
  }

  async updateEquipment(id: number, updateData: Partial<InsertEquipment>): Promise<Equipment | undefined> {
    const existing = this.equipment.get(id);
    if (!existing) return undefined;

    const updated: Equipment = {
      ...existing,
      ...updateData,
      expirationDate: updateData.expirationDate ? new Date(updateData.expirationDate) : existing.expirationDate,
      updatedAt: new Date()
    };
    this.equipment.set(id, updated);
    return updated;
  }

  async updateEquipmentStock(id: number, quantity: number): Promise<Equipment | undefined> {
    const existing = this.equipment.get(id);
    if (!existing) return undefined;

    const updated: Equipment = {
      ...existing,
      currentStock: Math.max(0, existing.currentStock + quantity),
      updatedAt: new Date()
    };
    this.equipment.set(id, updated);
    return updated;
  }

  // 使用履歴管理
  async getUsageHistory(): Promise<UsageHistoryWithDetails[]> {
    const historyList = Array.from(this.usageHistory.values());
    return historyList.map(usage => ({
      ...usage,
      equipment: this.equipment.get(usage.equipmentId)!,
      user: this.users.get(usage.userId)!
    })).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getUsageHistoryByEquipment(equipmentId: number): Promise<UsageHistoryWithDetails[]> {
    const historyList = Array.from(this.usageHistory.values())
      .filter(usage => usage.equipmentId === equipmentId);
    
    return historyList.map(usage => ({
      ...usage,
      equipment: this.equipment.get(usage.equipmentId)!,
      user: this.users.get(usage.userId)!
    })).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async createUsageHistory(insertUsage: InsertUsageHistory): Promise<UsageHistory> {
    const id = this.currentUsageId++;
    const usage: UsageHistory = { 
      ...insertUsage, 
      id,
      reason: insertUsage.reason || null,
      notes: insertUsage.notes || null,
      timestamp: new Date()
    };
    this.usageHistory.set(id, usage);

    // 在庫数を更新
    if (insertUsage.type === "usage") {
      await this.updateEquipmentStock(insertUsage.equipmentId, -insertUsage.quantity);
    } else if (insertUsage.type === "restock") {
      await this.updateEquipmentStock(insertUsage.equipmentId, insertUsage.quantity);
    }

    return usage;
  }

  // アラート管理
  async getAlerts(): Promise<Alert[]> {
    return Array.from(this.alerts.values());
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const id = this.currentAlertId++;
    const alert: Alert = { 
      ...insertAlert, 
      id,
      isActive: insertAlert.isActive !== undefined ? insertAlert.isActive : true,
      threshold: insertAlert.threshold || null,
      createdAt: new Date()
    };
    this.alerts.set(id, alert);
    return alert;
  }

  // ダッシュボード用
  async getDashboardStats(): Promise<DashboardStats> {
    const equipmentList = Array.from(this.equipment.values());
    const expiringSoon = await this.getExpiringItems(7);
    const lowStock = await this.getLowStockItems();

    return {
      totalItems: equipmentList.length,
      expiringSoon: expiringSoon.length,
      lowStock: lowStock.length,
      totalCategories: this.categories.size
    };
  }

  async getCategoryStats(): Promise<CategoryStats[]> {
    const categoriesList = Array.from(this.categories.values());
    const equipmentList = Array.from(this.equipment.values());

    return categoriesList.map(category => {
      const categoryEquipment = equipmentList.filter(item => item.categoryId === category.id);
      const lowStockCount = categoryEquipment.filter(item => item.currentStock <= item.minimumStock).length;
      const now = new Date();
      const criticalCount = categoryEquipment.filter(item => {
        if (!item.expirationDate) return false;
        const daysUntilExpiry = Math.ceil((item.expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry <= 7;
      }).length;

      return {
        category,
        totalItems: categoryEquipment.length,
        normalCount: categoryEquipment.length - lowStockCount - criticalCount,
        warningCount: lowStockCount,
        criticalCount
      };
    });
  }

  async getRecentUsageHistory(limit: number = 5): Promise<UsageHistoryWithDetails[]> {
    const historyList = await this.getUsageHistory();
    return historyList.slice(0, limit);
  }

  async getCriticalItems(): Promise<EquipmentWithCategory[]> {
    const expiring = await this.getExpiringItems(7);
    const lowStock = await this.getLowStockItems();
    
    // 重複を除去
    const criticalIds = new Set([...expiring.map(e => e.id), ...lowStock.map(e => e.id)]);
    const allEquipment = await this.getEquipment();
    
    return allEquipment.filter(item => criticalIds.has(item.id));
  }

  async getExpiringItems(days: number = 7): Promise<EquipmentWithCategory[]> {
    const now = new Date();
    const threshold = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
    
    const allEquipment = await this.getEquipment();
    return allEquipment.filter(item => {
      if (!item.expirationDate) return false;
      return item.expirationDate <= threshold;
    });
  }

  async getLowStockItems(): Promise<EquipmentWithCategory[]> {
    const allEquipment = await this.getEquipment();
    return allEquipment.filter(item => item.currentStock <= item.minimumStock);
  }
}

export const storage = new MemStorage();
