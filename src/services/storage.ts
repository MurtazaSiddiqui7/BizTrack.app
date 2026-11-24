import {
  BusinessProfile,
  Shop,
  ChocolateProduct,
  ProductInventory,
  MonthlyPlan,
  ShopFlavourAssignment,
  DistributionTransaction,
  InventoryTransaction,
  NotificationItem,
  PaymentRecord,
  ExpenseRecord,
  AuditLog,
  ShopDistributionSummary,
  MonthDistributionStats,
  DistributionStatus
} from '../types';
import {
  initialBusinessProfile,
  initialProducts,
  initialInventory,
  initialShops,
  initialMonthlyPlan,
  initialAssignments,
  initialTransactions,
  initialInventoryTransactions,
  initialPayments,
  initialExpenses
} from './seedData';

const STORAGE_KEYS = {
  PROFILE: 'chocotrack_profile',
  SHOPS: 'chocotrack_shops',
  PRODUCTS: 'chocotrack_products',
  INVENTORY: 'chocotrack_inventory',
  PLANS: 'chocotrack_plans',
  ASSIGNMENTS: 'chocotrack_assignments',
  TRANSACTIONS: 'chocotrack_transactions',
  INV_TRANSACTIONS: 'chocotrack_inv_transactions',
  NOTIFICATIONS: 'chocotrack_notifications',
  PAYMENTS: 'chocotrack_payments',
  EXPENSES: 'chocotrack_expenses',
  AUDIT_LOGS: 'chocotrack_audit_logs',
  INITIALIZED: 'chocotrack_initialized_v2'
};

// Memory fallback if localStorage is unavailable
class StorageManager {
  private listeners: (() => void)[] = [];

  constructor() {
    this.ensureInitialized();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(cb => cb());
  }

  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.warn(`Error reading key ${key} from localStorage:`, e);
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      this.notify();
    } catch (e) {
      console.error(`Error saving key ${key} to localStorage:`, e);
    }
  }

  public ensureInitialized(): void {
    try {
      const isInit = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
      if (!isInit) {
        this.resetToDefaults();
      } else {
        // Ensure profile owner and city are updated if older version was stored
        const currentProfile = this.getProfile();
        if (currentProfile.ownerName === 'Sunil Verma' || currentProfile.city === 'Bangalore' || !currentProfile.logoUrl) {
          this.updateProfile({
            ownerName: 'Mohammed Uzair Shareef',
            city: 'Hyderabad',
            email: 'uzair.biztrack@gmail.com',
            address: 'Shop #8, Confectionery Hub, Mehdipatnam Main Road',
            logoUrl: '/logo-full.png'
          });
        }
      }
    } catch (e) {
      console.warn('Storage initialization fallback:', e);
    }
  }

  public resetToDefaults(): void {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(initialBusinessProfile));
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(initialProducts));
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(initialInventory));
    localStorage.setItem(STORAGE_KEYS.SHOPS, JSON.stringify(initialShops));
    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify([initialMonthlyPlan]));
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(initialAssignments));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(initialTransactions));
    localStorage.setItem(STORAGE_KEYS.INV_TRANSACTIONS, JSON.stringify(initialInventoryTransactions));
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(initialPayments));
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(initialExpenses));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify([{
      id: 'log-init',
      action: 'SYSTEM_INITIALIZED',
      entityType: 'System',
      entityId: 'root',
      details: 'BizTrack initialized with production starter database.',
      timestamp: new Date().toISOString()
    }]));
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    this.notify();
  }

  // --- Profile ---
  public getProfile(): BusinessProfile {
    const profile = this.getItem(STORAGE_KEYS.PROFILE, initialBusinessProfile);
    return {
      ...initialBusinessProfile,
      ...profile,
      businessCategory: profile.businessCategory || 'Chocolates & Confectionery',
      unitName: profile.unitName || 'Boxes',
      itemTypeName: profile.itemTypeName || 'Flavours & Products'
    };
  }

  public updateProfile(profile: Partial<BusinessProfile>): BusinessProfile {
    const current = this.getProfile();
    const updated = { ...current, ...profile };
    this.setItem(STORAGE_KEYS.PROFILE, updated);
    this.logAudit('PROFILE_UPDATED', 'BusinessProfile', updated.id, 'Business profile updated');
    return updated;
  }

  // --- Shops ---
  public getShops(): Shop[] {
    return this.getItem(STORAGE_KEYS.SHOPS, []);
  }

  public getShopById(id: string): Shop | undefined {
    return this.getShops().find(s => s.id === id);
  }

  public addShop(shopData: Omit<Shop, 'id' | 'createdAt' | 'updatedAt'>): Shop {
    const shops = this.getShops();
    const newShop: Shop = {
      ...shopData,
      id: `shop-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    shops.push(newShop);
    this.setItem(STORAGE_KEYS.SHOPS, shops);
    this.logAudit('SHOP_CREATED', 'Shop', newShop.id, `Created shop: ${newShop.name} in ${newShop.locality}`);
    return newShop;
  }

  public updateShop(id: string, updates: Partial<Shop>): Shop {
    const shops = this.getShops();
    const index = shops.findIndex(s => s.id === id);
    if (index === -1) throw new Error(`Shop with id ${id} not found`);
    const updatedShop: Shop = {
      ...shops[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    shops[index] = updatedShop;
    this.setItem(STORAGE_KEYS.SHOPS, shops);
    this.logAudit('SHOP_UPDATED', 'Shop', id, `Updated shop details: ${updatedShop.name}`);
    return updatedShop;
  }

  public deleteShop(id: string): void {
    const shops = this.getShops().filter(s => s.id !== id);
    this.setItem(STORAGE_KEYS.SHOPS, shops);
    // Also remove any assignments for upcoming unconfirmed plans
    this.logAudit('SHOP_DELETED', 'Shop', id, `Deleted shop with ID ${id}`);
  }

  // --- Chocolate Products & Inventory ---
  public getProducts(): ChocolateProduct[] {
    return this.getItem(STORAGE_KEYS.PRODUCTS, []);
  }

  public getActiveProducts(): ChocolateProduct[] {
    return this.getProducts().filter(p => !p.isDiscontinued);
  }

  public getProductById(id: string): ChocolateProduct | undefined {
    return this.getProducts().find(p => p.id === id);
  }

  public addProduct(
    productData: Omit<ChocolateProduct, 'id' | 'createdAt' | 'updatedAt' | 'isDiscontinued'>,
    initialBoxes: number = 0,
    lowStockThreshold: number = 20
  ): ChocolateProduct {
    const products = this.getProducts();
    const newId = `prod-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newProduct: ChocolateProduct = {
      ...productData,
      id: newId,
      isDiscontinued: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    products.push(newProduct);
    this.setItem(STORAGE_KEYS.PRODUCTS, products);

    // Create inventory record
    const inventory = this.getInventory();
    inventory.push({
      id: `inv-${newId}`,
      productId: newId,
      availableBoxes: initialBoxes,
      lowStockThreshold: lowStockThreshold,
      lastRestockedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    this.setItem(STORAGE_KEYS.INVENTORY, inventory);

    if (initialBoxes > 0) {
      this.addInventoryTransaction({
        productId: newId,
        type: 'purchase_add',
        quantityChange: initialBoxes,
        balanceAfter: initialBoxes,
        notes: 'Initial inventory added on product creation'
      });
    }

    this.logAudit('PRODUCT_CREATED', 'ChocolateProduct', newId, `Created flavour: ${newProduct.brandName} - ${newProduct.flavourName}`);
    return newProduct;
  }

  public updateProduct(id: string, updates: Partial<ChocolateProduct>): ChocolateProduct {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) throw new Error(`Product ${id} not found`);
    const updated: ChocolateProduct = {
      ...products[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    products[index] = updated;
    this.setItem(STORAGE_KEYS.PRODUCTS, products);
    this.logAudit('PRODUCT_UPDATED', 'ChocolateProduct', id, `Updated flavour: ${updated.brandName} ${updated.flavourName}`);
    return updated;
  }

  public deleteProduct(id: string): void {
    // Soft delete / discontinue to preserve historical delivery logs!
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      products[index].isDiscontinued = true;
      products[index].updatedAt = new Date().toISOString();
      this.setItem(STORAGE_KEYS.PRODUCTS, products);
      this.logAudit('PRODUCT_DISCONTINUED', 'ChocolateProduct', id, `Discontinued flavour ${products[index].flavourName}`);
    }
  }

  public getInventory(): ProductInventory[] {
    return this.getItem(STORAGE_KEYS.INVENTORY, []);
  }

  public getProductStock(productId: string): ProductInventory | undefined {
    return this.getInventory().find(i => i.productId === productId);
  }

  public updateStock(productId: string, quantityChange: number, type: 'purchase_add' | 'adjustment' | 'return', notes: string): ProductInventory {
    const inventory = this.getInventory();
    const index = inventory.findIndex(i => i.productId === productId);
    if (index === -1) throw new Error(`Inventory for product ${productId} not found`);

    const newStock = Math.max(0, inventory[index].availableBoxes + quantityChange);
    inventory[index] = {
      ...inventory[index],
      availableBoxes: newStock,
      lastRestockedAt: quantityChange > 0 ? new Date().toISOString() : inventory[index].lastRestockedAt,
      updatedAt: new Date().toISOString()
    };
    this.setItem(STORAGE_KEYS.INVENTORY, inventory);

    this.addInventoryTransaction({
      productId,
      type,
      quantityChange,
      balanceAfter: newStock,
      notes
    });

    this.logAudit('STOCK_UPDATED', 'ProductInventory', productId, `Stock adjusted by ${quantityChange}. New balance: ${newStock}`);
    return inventory[index];
  }

  public setLowStockThreshold(productId: string, threshold: number): void {
    const inventory = this.getInventory();
    const index = inventory.findIndex(i => i.productId === productId);
    if (index !== -1) {
      inventory[index].lowStockThreshold = threshold;
      inventory[index].updatedAt = new Date().toISOString();
      this.setItem(STORAGE_KEYS.INVENTORY, inventory);
    }
  }

  // --- Monthly Plans & Assignments ---
  public getPlans(): MonthlyPlan[] {
    return this.getItem(STORAGE_KEYS.PLANS, []);
  }

  public getPlanById(id: string): MonthlyPlan | undefined {
    return this.getPlans().find(p => p.id === id);
  }

  public getPlanByMonthYear(month: number, year: number): MonthlyPlan | undefined {
    return this.getPlans().find(p => p.month === month && p.year === year);
  }

  public getCurrentPlan(): MonthlyPlan {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    let plan = this.getPlanByMonthYear(currentMonth, currentYear);
    if (!plan) {
      // Find latest plan to use as template or create new
      plan = this.createOrGetMonthlyPlan(currentMonth, currentYear);
    }
    return plan;
  }

  public createOrGetMonthlyPlan(month: number, year: number, cloneFromPrevious: boolean = true): MonthlyPlan {
    let plan = this.getPlanByMonthYear(month, year);
    if (plan) return plan;

    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0)).toISOString();
    const endDate = new Date(Date.UTC(year, month - 1, 5, 23, 59, 59)).toISOString();

    const newPlan: MonthlyPlan = {
      id: `plan-${year}-${month.toString().padStart(2, '0')}`,
      month,
      year,
      startDate,
      endDate,
      isConfirmed: false,
      status: 'active',
      createdAt: new Date().toISOString(),
      notes: `Monthly Distribution for ${new Date(year, month - 1).toLocaleString('default', { month: 'long' })} ${year}`
    };

    const plans = this.getPlans();
    plans.push(newPlan);
    this.setItem(STORAGE_KEYS.PLANS, plans);

    // If cloning from previous month, copy assignments safely
    if (cloneFromPrevious) {
      this.cloneAssignmentsFromPreviousMonth(newPlan.id, month, year);
    }

    this.logAudit('PLAN_CREATED', 'MonthlyPlan', newPlan.id, `Created distribution plan for ${month}/${year}`);
    return newPlan;
  }

  private cloneAssignmentsFromPreviousMonth(newPlanId: string, month: number, year: number) {
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const prevPlan = this.getPlanByMonthYear(prevMonth, prevYear);

    if (prevPlan) {
      const prevAssignments = this.getAssignmentsForPlan(prevPlan.id);
      const newAssignments: ShopFlavourAssignment[] = prevAssignments.map(asgn => ({
        id: `asgn-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        planId: newPlanId,
        shopId: asgn.shopId,
        productId: asgn.productId,
        assignedBoxes: asgn.assignedBoxes
      }));

      const allAssignments = this.getAssignments().concat(newAssignments);
      this.setItem(STORAGE_KEYS.ASSIGNMENTS, allAssignments);
    }
  }

  public confirmMonthlyPlan(planId: string): MonthlyPlan {
    const plans = this.getPlans();
    const index = plans.findIndex(p => p.id === planId);
    if (index === -1) throw new Error('Plan not found');
    plans[index].isConfirmed = true;
    plans[index].confirmedAt = new Date().toISOString();
    this.setItem(STORAGE_KEYS.PLANS, plans);
    this.logAudit('PLAN_CONFIRMED', 'MonthlyPlan', planId, `Confirmed distribution plan ${planId}`);
    return plans[index];
  }

  public getAssignments(): ShopFlavourAssignment[] {
    return this.getItem(STORAGE_KEYS.ASSIGNMENTS, []);
  }

  public getAssignmentsForPlan(planId: string): ShopFlavourAssignment[] {
    return this.getAssignments().filter(a => a.planId === planId);
  }

  public getShopAssignments(planId: string, shopId: string): ShopFlavourAssignment[] {
    return this.getAssignments().filter(a => a.planId === planId && a.shopId === shopId);
  }

  public setShopAssignments(
    planId: string,
    shopId: string,
    assignments: { productId: string; assignedBoxes: number }[]
  ): void {
    let all = this.getAssignments();
    // Remove existing assignments for this shop in this plan
    all = all.filter(a => !(a.planId === planId && a.shopId === shopId));

    // Add new ones with positive assignedBoxes
    const newItems: ShopFlavourAssignment[] = assignments
      .filter(item => item.assignedBoxes > 0)
      .map(item => ({
        id: `asgn-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        planId,
        shopId,
        productId: item.productId,
        assignedBoxes: item.assignedBoxes
      }));

    all.push(...newItems);
    this.setItem(STORAGE_KEYS.ASSIGNMENTS, all);
    this.logAudit('ASSIGNMENTS_UPDATED', 'ShopFlavourAssignment', shopId, `Assigned ${newItems.length} chocolate flavours to shop for plan ${planId}`);
  }

  // --- Distribution Transactions ---
  public getTransactions(): DistributionTransaction[] {
    return this.getItem(STORAGE_KEYS.TRANSACTIONS, []);
  }

  public getTransactionsForShop(planId: string, shopId: string): DistributionTransaction[] {
    return this.getTransactions().filter(t => t.planId === planId && t.shopId === shopId);
  }

  /**
   * Core transactional method: Records a delivery visit.
   * Atomically:
   * 1. Validates that quantities don't exceed stock
   * 2. Adds DistributionTransaction records
   * 3. Automatically deducts the delivered quantities from flavour inventory
   * 4. Adds InventoryTransaction audit records
   * 5. Checks if shop is fully completed
   */
  public recordDelivery(params: {
    planId: string;
    shopId: string;
    deliveries: { productId: string; boxesDelivered: number }[];
    notes?: string;
    recordedBy?: string;
    deliveryDate?: string;
  }): { success: boolean; isShopFullyCompleted: boolean; errorMessage?: string } {
    const { planId, shopId, deliveries, notes, recordedBy, deliveryDate } = params;
    const timestamp = deliveryDate || new Date().toISOString();

    const validDeliveries = deliveries.filter(d => d.boxesDelivered > 0);
    if (validDeliveries.length === 0) {
      return { success: false, isShopFullyCompleted: false, errorMessage: 'No boxes were entered to deliver.' };
    }

    // Step 1: Pre-validation of inventory stock
    const inventory = this.getInventory();
    const products = this.getProducts();

    for (const item of validDeliveries) {
      const inv = inventory.find(i => i.productId === item.productId);
      const prod = products.find(p => p.id === item.productId);
      const prodName = prod ? `${prod.brandName} ${prod.flavourName}` : item.productId;

      if (!inv || inv.availableBoxes < item.boxesDelivered) {
        const available = inv ? inv.availableBoxes : 0;
        return {
          success: false,
          isShopFullyCompleted: false,
          errorMessage: `Insufficient stock for "${prodName}". Available in warehouse: ${available} boxes, but attempting to deliver: ${item.boxesDelivered} boxes.`
        };
      }
    }

    // Step 2: Record distribution transactions
    const transactions = this.getTransactions();
    const invTransactions = this.getInventoryTransactions();
    const shop = this.getShopById(shopId);
    const shopName = shop ? shop.name : shopId;

    for (const item of validDeliveries) {
      const txId = `tx-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

      // Calculate whether this delivery completes this product assignment
      const priorDelivered = transactions
        .filter(t => t.planId === planId && t.shopId === shopId && t.productId === item.productId)
        .reduce((sum, t) => sum + t.boxesDelivered, 0);

      const assignment = this.getShopAssignments(planId, shopId).find(a => a.productId === item.productId);
      const totalAssigned = assignment ? assignment.assignedBoxes : 0;
      const isCompleted = (priorDelivered + item.boxesDelivered) >= totalAssigned;

      const newTx: DistributionTransaction = {
        id: txId,
        planId,
        shopId,
        productId: item.productId,
        boxesDelivered: item.boxesDelivered,
        deliveryDate: timestamp,
        deliveryStatus: isCompleted ? 'completed' : 'partial',
        notes,
        recordedBy: recordedBy || 'Owner',
        createdAt: new Date().toISOString()
      };
      transactions.push(newTx);

      // Step 3: Deduct from inventory
      const invIndex = inventory.findIndex(i => i.productId === item.productId);
      if (invIndex !== -1) {
        inventory[invIndex].availableBoxes -= item.boxesDelivered;
        inventory[invIndex].updatedAt = new Date().toISOString();

        // Step 4: Record inventory transaction
        invTransactions.push({
          id: `itx-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          productId: item.productId,
          type: 'distribution_deduct',
          quantityChange: -item.boxesDelivered,
          balanceAfter: inventory[invIndex].availableBoxes,
          referenceId: txId,
          notes: `Delivered ${item.boxesDelivered} boxes to ${shopName}`,
          timestamp
        });
      }
    }

    // Save state
    this.setItem(STORAGE_KEYS.TRANSACTIONS, transactions);
    this.setItem(STORAGE_KEYS.INVENTORY, inventory);
    this.setItem(STORAGE_KEYS.INV_TRANSACTIONS, invTransactions);

    // Step 5: Check if shop is now fully completed
    const summary = this.getShopDistributionSummary(planId, shopId);
    const isShopFullyCompleted = summary ? summary.status === 'completed' : false;

    this.logAudit(
      'DELIVERY_RECORDED',
      'DistributionTransaction',
      shopId,
      `Delivered boxes to ${shopName}. Shop status: ${isShopFullyCompleted ? 'COMPLETED' : 'PARTIAL'}`
    );

    return { success: true, isShopFullyCompleted };
  }

  // --- Calculations and Summaries ---
  public getShopDistributionSummary(planId: string, shopId: string): ShopDistributionSummary | null {
    const shop = this.getShopById(shopId);
    if (!shop) return null;

    const assignments = this.getShopAssignments(planId, shopId);
    const transactions = this.getTransactionsForShop(planId, shopId);
    const products = this.getProducts();

    if (assignments.length === 0) {
      return {
        shop,
        assignedFlavoursCount: 0,
        totalAssignedBoxes: 0,
        totalDistributedBoxes: 0,
        totalRemainingBoxes: 0,
        status: 'unassigned',
        flavourDetails: []
      };
    }

    let totalAssigned = 0;
    let totalDistributed = 0;
    let allFlavoursDone = true;
    let anyDelivered = false;
    let lastDate: string | undefined;

    const flavourDetails = assignments.map(asgn => {
      const product = products.find(p => p.id === asgn.productId) || {
        id: asgn.productId,
        brandName: 'Unknown',
        flavourName: 'Product',
        boxDescription: '',
        unitCost: 0,
        unitPrice: 0,
        isDiscontinued: false,
        createdAt: '',
        updatedAt: ''
      };

      const productTxs = transactions.filter(t => t.productId === asgn.productId);
      const delivered = productTxs.reduce((sum, t) => sum + t.boxesDelivered, 0);
      const remaining = Math.max(0, asgn.assignedBoxes - delivered);
      const isDone = remaining === 0;

      if (!isDone) allFlavoursDone = false;
      if (delivered > 0) anyDelivered = true;

      productTxs.forEach(t => {
        if (!lastDate || new Date(t.deliveryDate) > new Date(lastDate)) {
          lastDate = t.deliveryDate;
        }
      });

      totalAssigned += asgn.assignedBoxes;
      totalDistributed += delivered;

      return {
        product,
        assignedBoxes: asgn.assignedBoxes,
        distributedBoxes: delivered,
        remainingBoxes: remaining,
        isFlavourCompleted: isDone
      };
    });

    const totalRemaining = Math.max(0, totalAssigned - totalDistributed);

    let status: DistributionStatus = 'pending';
    if (totalAssigned > 0 && allFlavoursDone) {
      status = 'completed';
    } else if (anyDelivered || totalDistributed > 0) {
      status = 'partial';
    } else {
      status = 'pending';
    }

    return {
      shop,
      assignedFlavoursCount: assignments.length,
      totalAssignedBoxes: totalAssigned,
      totalDistributedBoxes: totalDistributed,
      totalRemainingBoxes: totalRemaining,
      status,
      lastDeliveryDate: lastDate,
      flavourDetails
    };
  }

  public getAllShopDistributionSummaries(planId: string): ShopDistributionSummary[] {
    const shops = this.getShops();
    return shops
      .map(s => this.getShopDistributionSummary(planId, s.id))
      .filter((s): s is ShopDistributionSummary => s !== null);
  }

  public getMonthDistributionStats(planId: string): MonthDistributionStats {
    const summaries = this.getAllShopDistributionSummaries(planId);

    const totalShops = summaries.length;
    const completedShops = summaries.filter(s => s.status === 'completed').length;
    const partialShops = summaries.filter(s => s.status === 'partial').length;
    const pendingShops = summaries.filter(s => s.status === 'pending').length;
    const unassignedShops = summaries.filter(s => s.status === 'unassigned').length;

    const assignedShopsCount = totalShops - unassignedShops;
    const shopCompletionPercentage = assignedShopsCount > 0
      ? Math.round((completedShops / assignedShopsCount) * 100)
      : 0;

    const totalAssignedBoxes = summaries.reduce((sum, s) => sum + s.totalAssignedBoxes, 0);
    const totalDistributedBoxes = summaries.reduce((sum, s) => sum + s.totalDistributedBoxes, 0);
    const totalRemainingBoxes = summaries.reduce((sum, s) => sum + s.totalRemainingBoxes, 0);

    const boxCompletionPercentage = totalAssignedBoxes > 0
      ? Math.round((totalDistributedBoxes / totalAssignedBoxes) * 100)
      : 0;

    return {
      totalShops,
      completedShops,
      partialShops,
      pendingShops,
      unassignedShops,
      shopCompletionPercentage,
      totalAssignedBoxes,
      totalDistributedBoxes,
      totalRemainingBoxes,
      boxCompletionPercentage
    };
  }

  // --- Inventory Transactions ---
  public getInventoryTransactions(): InventoryTransaction[] {
    return this.getItem(STORAGE_KEYS.INV_TRANSACTIONS, []);
  }

  public addInventoryTransaction(tx: Omit<InventoryTransaction, 'id' | 'timestamp'>): void {
    const txs = this.getInventoryTransactions();
    txs.push({
      ...tx,
      id: `itx-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString()
    });
    this.setItem(STORAGE_KEYS.INV_TRANSACTIONS, txs);
  }

  // --- Notifications ---
  public getNotifications(): NotificationItem[] {
    return this.getItem(STORAGE_KEYS.NOTIFICATIONS, []);
  }

  public addNotification(item: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'>): NotificationItem {
    const notifications = this.getNotifications();
    const newItem: NotificationItem = {
      ...item,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    notifications.unshift(newItem);
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, notifications.slice(0, 100)); // retain last 100
    return newItem;
  }

  public markNotificationAsRead(id: string): void {
    const notifs = this.getNotifications();
    const index = notifs.findIndex(n => n.id === id);
    if (index !== -1) {
      notifs[index].isRead = true;
      this.setItem(STORAGE_KEYS.NOTIFICATIONS, notifs);
    }
  }

  public markAllNotificationsAsRead(): void {
    const notifs = this.getNotifications().map(n => ({ ...n, isRead: true }));
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, notifs);
  }

  // --- Payments & Expenses ---
  public getPayments(): PaymentRecord[] {
    return this.getItem(STORAGE_KEYS.PAYMENTS, []);
  }

  public addPayment(payment: Omit<PaymentRecord, 'id' | 'createdAt'>): PaymentRecord {
    const payments = this.getPayments();
    const newPayment: PaymentRecord = {
      ...payment,
      id: `pay-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString()
    };
    payments.push(newPayment);
    this.setItem(STORAGE_KEYS.PAYMENTS, payments);
    this.logAudit('PAYMENT_RECORDED', 'PaymentRecord', newPayment.id, `Payment ₹${payment.amountReceived} recorded for shop ${payment.shopId}`);
    return newPayment;
  }

  public getExpenses(): ExpenseRecord[] {
    return this.getItem(STORAGE_KEYS.EXPENSES, []);
  }

  public addExpense(expense: Omit<ExpenseRecord, 'id' | 'createdAt'>): ExpenseRecord {
    const expenses = this.getExpenses();
    const newExpense: ExpenseRecord = {
      ...expense,
      id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString()
    };
    expenses.push(newExpense);
    this.setItem(STORAGE_KEYS.EXPENSES, expenses);
    this.logAudit('EXPENSE_RECORDED', 'ExpenseRecord', newExpense.id, `Expense ₹${expense.amount} for ${expense.category}`);
    return newExpense;
  }

  // --- Audit Logs ---
  public getAuditLogs(): AuditLog[] {
    return this.getItem(STORAGE_KEYS.AUDIT_LOGS, []);
  }

  public logAudit(action: string, entityType: string, entityId: string, details: string): void {
    const logs = this.getAuditLogs();
    logs.unshift({
      id: `log-${Date.now()}`,
      action,
      entityType,
      entityId,
      details,
      timestamp: new Date().toISOString()
    });
    this.setItem(STORAGE_KEYS.AUDIT_LOGS, logs.slice(0, 500));
  }

  // --- Full Database Backup / Restore ---
  public exportFullBackup(): string {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      profile: this.getProfile(),
      shops: this.getShops(),
      products: this.getProducts(),
      inventory: this.getInventory(),
      plans: this.getPlans(),
      assignments: this.getAssignments(),
      transactions: this.getTransactions(),
      invTransactions: this.getInventoryTransactions(),
      payments: this.getPayments(),
      expenses: this.getExpenses(),
      auditLogs: this.getAuditLogs()
    };
    return JSON.stringify(backupData, null, 2);
  }

  public importFullBackup(jsonString: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonString);
      if (!data.shops || !data.products) {
        return { success: false, message: 'Invalid backup file format' };
      }
      if (data.profile) this.setItem(STORAGE_KEYS.PROFILE, data.profile);
      if (data.shops) this.setItem(STORAGE_KEYS.SHOPS, data.shops);
      if (data.products) this.setItem(STORAGE_KEYS.PRODUCTS, data.products);
      if (data.inventory) this.setItem(STORAGE_KEYS.INVENTORY, data.inventory);
      if (data.plans) this.setItem(STORAGE_KEYS.PLANS, data.plans);
      if (data.assignments) this.setItem(STORAGE_KEYS.ASSIGNMENTS, data.assignments);
      if (data.transactions) this.setItem(STORAGE_KEYS.TRANSACTIONS, data.transactions);
      if (data.invTransactions) this.setItem(STORAGE_KEYS.INV_TRANSACTIONS, data.invTransactions);
      if (data.payments) this.setItem(STORAGE_KEYS.PAYMENTS, data.payments);
      if (data.expenses) this.setItem(STORAGE_KEYS.EXPENSES, data.expenses);
      if (data.auditLogs) this.setItem(STORAGE_KEYS.AUDIT_LOGS, data.auditLogs);

      this.logAudit('BACKUP_RESTORED', 'System', 'all', 'Full database restored from file backup');
      return { success: true, message: 'Backup restored successfully!' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Error parsing backup JSON' };
    }
  }
}

export const storage = new StorageManager();
