// Core domain types for BizTrack

export type DistributionStatus = 'completed' | 'partial' | 'pending' | 'unassigned';

export interface BusinessProfile {
  id: string;
  businessName: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  logoUrl?: string;
  currency: string;
  distributionStartDay: number; // default 1
  distributionEndDay: number;   // default 5
  dailyReminderTime: string;    // e.g. "09:00"
  enableWebPush: boolean;
  lowStockGlobalThreshold: number; // default 20
  businessCategory?: string;    // e.g. "Chocolates & Confectionery", "Bakery", "Beverages", "FMCG"
  unitName?: string;            // e.g. "Boxes", "Cartons", "Packs", "Crates", "Trays", "Cases"
  itemTypeName?: string;        // e.g. "Flavours & Varieties", "Products", "SKUs", "Items"
}

export interface Shop {
  id: string;
  name: string;
  ownerName: string;
  phone: string;
  address: string;
  locality: string;
  city: string;
  lat: number;
  lng: number;
  googleMapsUrl: string;
  photoUrl?: string;
  instructions?: string;
  notes?: string;
  preferredDeliveryDate?: number; // 1 to 5
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChocolateProduct {
  id: string;
  brandName: string;
  flavourName: string;
  boxDescription: string; // e.g. "24 bars per box (45g)"
  photoUrl?: string;
  internalCode?: string;
  notes?: string;
  unitCost: number;       // purchase cost per box
  unitPrice: number;      // selling price per box
  isDiscontinued: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductInventory {
  id: string;
  productId: string;
  availableBoxes: number;
  lowStockThreshold: number; // customizable per flavour
  lastRestockedAt: string;
  updatedAt: string;
}

export interface MonthlyPlan {
  id: string;
  month: number; // 1-12
  year: number;  // e.g. 2026
  startDate: string; // ISO string
  endDate: string;
  isConfirmed: boolean;
  confirmedAt?: string;
  status: 'draft' | 'active' | 'completed';
  createdAt: string;
  notes?: string;
}

export interface ShopFlavourAssignment {
  id: string;
  planId: string;
  shopId: string;
  productId: string;
  assignedBoxes: number;
}

export interface DistributionTransaction {
  id: string;
  planId: string;
  shopId: string;
  productId: string;
  boxesDelivered: number;
  deliveryDate: string; // ISO date-time
  deliveryStatus: 'completed' | 'partial';
  notes?: string;
  recordedBy?: string;
  createdAt?: string;
}

export interface InventoryTransaction {
  id: string;
  productId: string;
  type: 'purchase_add' | 'distribution_deduct' | 'adjustment' | 'return';
  quantityChange: number; // e.g. -5 or +50
  balanceAfter: number;
  referenceId?: string; // distribution transaction ID or PO
  notes: string;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  type: 'cycle_start' | 'daily_reminder' | 'urgent_reminder' | 'overdue' | 'low_stock' | 'completed' | 'system';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  shopId?: string;
  productId?: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  shopId: string;
  planId: string;
  invoiceAmount: number;
  amountReceived: number;
  outstandingAmount: number;
  paymentDate: string;
  paymentMethod: 'cash' | 'upi' | 'cheque' | 'bank_transfer' | 'credit';
  notes?: string;
  createdAt: string;
}

export interface ExpenseRecord {
  id: string;
  category: 'fuel' | 'vehicle' | 'packaging' | 'food' | 'miscellaneous';
  amount: number;
  date: string;
  description: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  timestamp: string;
}

// Summary types for UI calculations
export interface ShopDistributionSummary {
  shop: Shop;
  assignedFlavoursCount: number;
  totalAssignedBoxes: number;
  totalDistributedBoxes: number;
  totalRemainingBoxes: number;
  status: DistributionStatus;
  lastDeliveryDate?: string;
  flavourDetails: {
    product: ChocolateProduct;
    assignedBoxes: number;
    distributedBoxes: number;
    remainingBoxes: number;
    isFlavourCompleted: boolean;
  }[];
}

export interface MonthDistributionStats {
  totalShops: number;
  completedShops: number;
  partialShops: number;
  pendingShops: number;
  unassignedShops: number;
  shopCompletionPercentage: number;
  
  totalAssignedBoxes: number;
  totalDistributedBoxes: number;
  totalRemainingBoxes: number;
  boxCompletionPercentage: number;
}
