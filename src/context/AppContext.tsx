import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  BusinessProfile,
  Shop,
  ChocolateProduct,
  ProductInventory,
  MonthlyPlan,
  ShopFlavourAssignment,
  DistributionTransaction,
  NotificationItem,
  PaymentRecord,
  ExpenseRecord,
  ShopDistributionSummary,
  MonthDistributionStats
} from '../types';
import { storage } from '../services/storage';
import { NotificationEngine } from '../services/notificationEngine';

export type AppView =
  | 'dashboard'
  | 'shops'
  | 'distribution'
  | 'inventory'
  | 'route'
  | 'map'
  | 'analytics'
  | 'history'
  | 'finance'
  | 'reports'
  | 'settings';

interface AppContextType {
  // Navigation
  activeView: AppView;
  setActiveView: (view: AppView) => void;

  // Profile
  profile: BusinessProfile;
  updateProfile: (profile: Partial<BusinessProfile>) => void;

  // Shops
  shops: Shop[];
  addShop: (data: Omit<Shop, 'id' | 'createdAt' | 'updatedAt'>) => Shop;
  updateShop: (id: string, updates: Partial<Shop>) => Shop;
  deleteShop: (id: string) => void;

  // Products & Inventory
  products: ChocolateProduct[];
  inventory: ProductInventory[];
  addProduct: (data: Omit<ChocolateProduct, 'id' | 'createdAt' | 'updatedAt' | 'isDiscontinued'>, initialBoxes?: number, threshold?: number) => ChocolateProduct;
  updateProduct: (id: string, updates: Partial<ChocolateProduct>) => ChocolateProduct;
  deleteProduct: (id: string) => void;
  updateStock: (productId: string, qtyChange: number, type: 'purchase_add' | 'adjustment' | 'return', notes: string) => void;

  // Plans & Assignments
  currentPlan: MonthlyPlan;
  plans: MonthlyPlan[];
  selectPlan: (planId: string) => void;
  confirmCurrentPlan: () => void;
  createMonthlyPlan: (month: number, year: number) => MonthlyPlan;
  assignments: ShopFlavourAssignment[];
  setShopAssignments: (shopId: string, items: { productId: string; assignedBoxes: number }[]) => void;

  // Transactions & Delivery
  transactions: DistributionTransaction[];
  recordDelivery: (params: {
    shopId: string;
    deliveries: { productId: string; boxesDelivered: number }[];
    notes?: string;
  }) => { success: boolean; isShopFullyCompleted: boolean; errorMessage?: string };

  // Calculated Summaries
  summaries: ShopDistributionSummary[];
  stats: MonthDistributionStats;

  // Notifications
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Finance
  payments: PaymentRecord[];
  addPayment: (payment: Omit<PaymentRecord, 'id' | 'createdAt'>) => PaymentRecord;
  expenses: ExpenseRecord[];
  addExpense: (expense: Omit<ExpenseRecord, 'id' | 'createdAt'>) => ExpenseRecord;

  // Modals & Action Shortcuts
  selectedShopForDelivery: Shop | null;
  setSelectedShopForDelivery: (shop: Shop | null) => void;
  selectedShopForAssignment: Shop | null;
  setSelectedShopForAssignment: (shop: Shop | null) => void;

  // Backup & Reset
  resetDemoData: () => void;
  refreshData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<AppView>('dashboard');
  const [version, setVersion] = useState(0);

  // Active plan selector
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');

  // Modals
  const [selectedShopForDelivery, setSelectedShopForDelivery] = useState<Shop | null>(null);
  const [selectedShopForAssignment, setSelectedShopForAssignment] = useState<Shop | null>(null);

  // Subscribe to storage changes
  useEffect(() => {
    const unsubscribe = storage.subscribe(() => {
      setVersion(v => v + 1);
    });
    return unsubscribe;
  }, []);

  const refreshData = useCallback(() => {
    setVersion(v => v + 1);
  }, []);

  // Data fetching
  const profile = useMemo(() => storage.getProfile(), [version]);
  const shops = useMemo(() => storage.getShops(), [version]);
  const products = useMemo(() => storage.getActiveProducts(), [version]);
  const inventory = useMemo(() => storage.getInventory(), [version]);
  const plans = useMemo(() => storage.getPlans(), [version]);
  const transactions = useMemo(() => storage.getTransactions(), [version]);
  const payments = useMemo(() => storage.getPayments(), [version]);
  const expenses = useMemo(() => storage.getExpenses(), [version]);

  // Current Plan determination
  const currentPlan = useMemo(() => {
    if (selectedPlanId) {
      const found = storage.getPlanById(selectedPlanId);
      if (found) return found;
    }
    const active = storage.getCurrentPlan();
    return active;
  }, [selectedPlanId, version]);

  useEffect(() => {
    if (!selectedPlanId && currentPlan) {
      setSelectedPlanId(currentPlan.id);
    }
  }, [currentPlan, selectedPlanId]);

  const assignments = useMemo(() => {
    return storage.getAssignmentsForPlan(currentPlan.id);
  }, [currentPlan.id, version]);

  // Derived summaries & stats
  const summaries = useMemo(() => {
    return storage.getAllShopDistributionSummaries(currentPlan.id);
  }, [currentPlan.id, version]);

  const stats = useMemo(() => {
    return storage.getMonthDistributionStats(currentPlan.id);
  }, [currentPlan.id, version]);

  // Smart Notifications
  const notifications = useMemo(() => {
    const stored = storage.getNotifications();
    const systemAlerts = NotificationEngine.checkAndGenerateAlerts(currentPlan);
    
    // Combine unique alerts
    const alertMap = new Map<string, NotificationItem>();
    systemAlerts.forEach(a => alertMap.set(a.id, a));
    stored.forEach(s => alertMap.set(s.id, s));
    
    return Array.from(alertMap.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [currentPlan, version]);

  const unreadNotificationCount = useMemo(() => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

  // Actions
  const updateProfile = useCallback((updates: Partial<BusinessProfile>) => {
    storage.updateProfile(updates);
  }, []);

  const addShop = useCallback((data: Omit<Shop, 'id' | 'createdAt' | 'updatedAt'>) => {
    return storage.addShop(data);
  }, []);

  const updateShop = useCallback((id: string, updates: Partial<Shop>) => {
    return storage.updateShop(id, updates);
  }, []);

  const deleteShop = useCallback((id: string) => {
    storage.deleteShop(id);
  }, []);

  const addProduct = useCallback(
    (data: Omit<ChocolateProduct, 'id' | 'createdAt' | 'updatedAt' | 'isDiscontinued'>, initialBoxes = 0, threshold = 20) => {
      return storage.addProduct(data, initialBoxes, threshold);
    },
    []
  );

  const updateProduct = useCallback((id: string, updates: Partial<ChocolateProduct>) => {
    return storage.updateProduct(id, updates);
  }, []);

  const deleteProduct = useCallback((id: string) => {
    storage.deleteProduct(id);
  }, []);

  const updateStock = useCallback(
    (productId: string, qtyChange: number, type: 'purchase_add' | 'adjustment' | 'return', notes: string) => {
      storage.updateStock(productId, qtyChange, type, notes);
    },
    []
  );

  const selectPlan = useCallback((planId: string) => {
    setSelectedPlanId(planId);
  }, []);

  const confirmCurrentPlan = useCallback(() => {
    storage.confirmMonthlyPlan(currentPlan.id);
  }, [currentPlan.id]);

  const createMonthlyPlan = useCallback((month: number, year: number) => {
    const newPlan = storage.createOrGetMonthlyPlan(month, year, true);
    setSelectedPlanId(newPlan.id);
    return newPlan;
  }, []);

  const setShopAssignments = useCallback(
    (shopId: string, items: { productId: string; assignedBoxes: number }[]) => {
      storage.setShopAssignments(currentPlan.id, shopId, items);
    },
    [currentPlan.id]
  );

  const recordDelivery = useCallback(
    (params: {
      shopId: string;
      deliveries: { productId: string; boxesDelivered: number }[];
      notes?: string;
    }) => {
      const result = storage.recordDelivery({
        planId: currentPlan.id,
        shopId: params.shopId,
        deliveries: params.deliveries,
        notes: params.notes,
        recordedBy: profile.ownerName
      });

      if (result.success && result.isShopFullyCompleted) {
        // Trigger celebratory confetti for completing a shop's distribution!
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#047857', '#10b981', '#34d399', '#f59e0b', '#fbbf24']
          });
        } catch (e) {
          // ignore
        }
      }

      return result;
    },
    [currentPlan.id, profile.ownerName]
  );

  const markNotificationAsRead = useCallback((id: string) => {
    storage.markNotificationAsRead(id);
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    storage.markAllNotificationsAsRead();
  }, []);

  const addPayment = useCallback((payment: Omit<PaymentRecord, 'id' | 'createdAt'>) => {
    return storage.addPayment(payment);
  }, []);

  const addExpense = useCallback((expense: Omit<ExpenseRecord, 'id' | 'createdAt'>) => {
    return storage.addExpense(expense);
  }, []);

  const resetDemoData = useCallback(() => {
    storage.resetToDefaults();
    setSelectedPlanId('');
  }, []);

  const value: AppContextType = {
    activeView,
    setActiveView,
    profile,
    updateProfile,
    shops,
    addShop,
    updateShop,
    deleteShop,
    products,
    inventory,
    addProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    currentPlan,
    plans,
    selectPlan,
    confirmCurrentPlan,
    createMonthlyPlan,
    assignments,
    setShopAssignments,
    transactions,
    recordDelivery,
    summaries,
    stats,
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    payments,
    addPayment,
    expenses,
    addExpense,
    selectedShopForDelivery,
    setSelectedShopForDelivery,
    selectedShopForAssignment,
    setSelectedShopForAssignment,
    resetDemoData,
    refreshData
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
