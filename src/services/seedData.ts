import { 
  BusinessProfile, 
  Shop, 
  ChocolateProduct, 
  ProductInventory, 
  MonthlyPlan, 
  ShopFlavourAssignment, 
  DistributionTransaction,
  InventoryTransaction,
  PaymentRecord,
  ExpenseRecord
} from '../types';

export const initialBusinessProfile: BusinessProfile = {
  id: 'biz-001',
  businessName: 'Royal Treats Confectionery & Distribution',
  ownerName: 'Mohammed Uzair Shareef',
  phone: '+91 98450 12345',
  email: 'uzair.biztrack@gmail.com',
  address: 'Shop #8, Confectionery Hub, Mehdipatnam Main Road',
  city: 'Hyderabad',
  logoUrl: '/logo-full.png',
  currency: '₹',
  distributionStartDay: 1,
  distributionEndDay: 5,
  dailyReminderTime: '08:30',
  enableWebPush: true,
  lowStockGlobalThreshold: 25,
  businessCategory: 'Chocolates & Confectionery',
  unitName: 'Boxes',
  itemTypeName: 'Flavours & Products'
};

export const initialProducts: ChocolateProduct[] = [
  {
    id: 'prod-cad-dms',
    brandName: 'Cadbury',
    flavourName: 'Dairy Milk Silk (60g)',
    boxDescription: '24 bars per display box',
    internalCode: 'CAD-DMS-60',
    unitCost: 1440,
    unitPrice: 1680,
    isDiscontinued: false,
    notes: 'Fastest moving product in all retail shops.',
    photoUrl: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=300&q=80',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'prod-cad-5st',
    brandName: 'Cadbury',
    flavourName: '5 Star Caramel & Nougat',
    boxDescription: '36 bars per box (30g)',
    internalCode: 'CAD-5ST-30',
    unitCost: 540,
    unitPrice: 720,
    isDiscontinued: false,
    notes: 'Popular for school students and kiranas.',
    photoUrl: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=300&q=80',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'prod-nes-kit',
    brandName: 'Nestlé',
    flavourName: 'KitKat 4-Finger Classic',
    boxDescription: '24 packs per box (38g)',
    internalCode: 'NES-KIT-38',
    unitCost: 840,
    unitPrice: 960,
    isDiscontinued: false,
    notes: 'High demand in tea shops and bakeries.',
    photoUrl: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=300&q=80',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'prod-nes-mun',
    brandName: 'Nestlé',
    flavourName: 'Munch Crispy Wafer',
    boxDescription: '30 pouches per box (18g)',
    internalCode: 'NES-MUN-18',
    unitCost: 240,
    unitPrice: 300,
    isDiscontinued: false,
    notes: 'Standard low-ticket impulse item.',
    photoUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=300&q=80',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'prod-cad-prk',
    brandName: 'Cadbury',
    flavourName: 'Perk Double Crisp',
    boxDescription: '30 units per box (28g)',
    internalCode: 'CAD-PRK-28',
    unitCost: 250,
    unitPrice: 300,
    isDiscontinued: false,
    notes: 'Summer and festive favourite.',
    photoUrl: 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?w=300&q=80',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'prod-fer-roc',
    brandName: 'Ferrero',
    flavourName: 'Ferrero Rocher T-16 Gold',
    boxDescription: '12 display packs per carton',
    internalCode: 'FER-ROC-T16',
    unitCost: 5400,
    unitPrice: 6600,
    isDiscontinued: false,
    notes: 'Premium stores and gift marts only.',
    photoUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=300&q=80',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'prod-amu-drk',
    brandName: 'Amul',
    flavourName: 'Dark Chocolate 55% Rich',
    boxDescription: '20 bars per carton (150g)',
    internalCode: 'AMU-DRK-150',
    unitCost: 1600,
    unitPrice: 2000,
    isDiscontinued: false,
    notes: 'Healthy snacking audience.',
    photoUrl: 'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?w=300&q=80',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  }
];

export const initialInventory: ProductInventory[] = [
  {
    id: 'inv-cad-dms',
    productId: 'prod-cad-dms',
    availableBoxes: 120,
    lowStockThreshold: 25,
    lastRestockedAt: '2026-11-01T09:00:00Z',
    updatedAt: '2026-11-01T09:00:00Z'
  },
  {
    id: 'inv-cad-5st',
    productId: 'prod-cad-5st',
    availableBoxes: 160,
    lowStockThreshold: 30,
    lastRestockedAt: '2026-11-01T09:00:00Z',
    updatedAt: '2026-11-01T09:00:00Z'
  },
  {
    id: 'inv-nes-kit',
    productId: 'prod-nes-kit',
    availableBoxes: 85,
    lowStockThreshold: 20,
    lastRestockedAt: '2026-11-01T09:00:00Z',
    updatedAt: '2026-11-01T09:00:00Z'
  },
  {
    id: 'inv-nes-mun',
    productId: 'prod-nes-mun',
    availableBoxes: 140,
    lowStockThreshold: 30,
    lastRestockedAt: '2026-11-01T09:00:00Z',
    updatedAt: '2026-11-01T09:00:00Z'
  },
  {
    id: 'inv-cad-prk',
    productId: 'prod-cad-prk',
    availableBoxes: 95,
    lowStockThreshold: 20,
    lastRestockedAt: '2026-11-01T09:00:00Z',
    updatedAt: '2026-11-01T09:00:00Z'
  },
  {
    id: 'inv-fer-roc',
    productId: 'prod-fer-roc',
    availableBoxes: 18,
    lowStockThreshold: 20,
    lastRestockedAt: '2026-10-25T11:00:00Z',
    updatedAt: '2026-11-01T09:00:00Z'
  },
  {
    id: 'inv-amu-drk',
    productId: 'prod-amu-drk',
    availableBoxes: 42,
    lowStockThreshold: 15,
    lastRestockedAt: '2026-11-01T09:00:00Z',
    updatedAt: '2026-11-01T09:00:00Z'
  }
];

export const initialShops: Shop[] = [
  {
    id: 'shop-001',
    name: 'Royal Kirana & General Store',
    ownerName: 'Syed Mansoor',
    phone: '9849011223',
    address: 'Near Sarojini Devi Eye Hospital, Mehdipatnam Main Road',
    locality: 'Mehdipatnam',
    city: 'Hyderabad',
    lat: 17.3916,
    lng: 78.4398,
    googleMapsUrl: 'https://maps.google.com/?q=17.3916,78.4398',
    photoUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=300&q=80',
    instructions: 'Deliver before 11 AM before rush hour. Collect cash from cashier desk.',
    notes: 'Premium customer since 2021. Always pays on time.',
    preferredDeliveryDate: 1,
    isActive: true,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z'
  },
  {
    id: 'shop-002',
    name: 'Karachi Bakery & Confectionery Outlet',
    ownerName: 'Harish Ramani',
    phone: '9849022334',
    address: 'Road No. 1, Near City Center Mall, Banjara Hills',
    locality: 'Banjara Hills',
    city: 'Hyderabad',
    lat: 17.4156,
    lng: 78.4485,
    googleMapsUrl: 'https://maps.google.com/?q=17.4156,78.4485',
    photoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&q=80',
    instructions: 'Call owner 15 mins prior. Requires extra Dairy Milk Silk.',
    notes: 'High volume store.',
    preferredDeliveryDate: 1,
    isActive: true,
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z'
  },
  {
    id: 'shop-003',
    name: 'Balaji Provisions & Supermarket',
    ownerName: 'Kishore Goud',
    phone: '9849033445',
    address: 'Opposite GVK One Mall, Road No. 36, Jubilee Hills',
    locality: 'Jubilee Hills',
    city: 'Hyderabad',
    lat: 17.4319,
    lng: 78.4073,
    googleMapsUrl: 'https://maps.google.com/?q=17.4319,78.4073',
    photoUrl: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=300&q=80',
    instructions: 'Unload from backdoor lane. Ask for Kishore directly.',
    notes: 'Takes mixed boxes of KitKat & Munch.',
    preferredDeliveryDate: 2,
    isActive: true,
    createdAt: '2026-01-20T10:00:00Z',
    updatedAt: '2026-01-20T10:00:00Z'
  },
  {
    id: 'shop-004',
    name: 'Asha Departmental Store',
    ownerName: 'Venkatesh Reddy',
    phone: '9849044556',
    address: 'Near Old Bus Depot, Dilsukhnagar Main Road',
    locality: 'Dilsukhnagar',
    city: 'Hyderabad',
    lat: 17.3688,
    lng: 78.5247,
    googleMapsUrl: 'https://maps.google.com/?q=17.3688,78.5247',
    photoUrl: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=300&q=80',
    instructions: 'Park near gate 3. Delivery receipts need sign and stamp.',
    notes: 'Weekly settlements.',
    preferredDeliveryDate: 3,
    isActive: true,
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-02-01T10:00:00Z'
  },
  {
    id: 'shop-005',
    name: 'Deccan Mart & Confectionery',
    ownerName: 'Mirza Baig',
    phone: '9849055667',
    address: 'Near Charminar Kaman, Pathergatti',
    locality: 'Charminar',
    city: 'Hyderabad',
    lat: 17.3616,
    lng: 78.4747,
    googleMapsUrl: 'https://maps.google.com/?q=17.3616,78.4747',
    photoUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&q=80',
    instructions: 'Morning delivery preferred before 10:30 AM before market gets crowded.',
    notes: 'Takes Dairy Milk, Perk and 5 Star.',
    preferredDeliveryDate: 2,
    isActive: true,
    createdAt: '2026-02-10T10:00:00Z',
    updatedAt: '2026-02-10T10:00:00Z'
  },
  {
    id: 'shop-006',
    name: 'Hitec City Grocers & Daily Retail',
    ownerName: 'Raghavendra Rao',
    phone: '9849066778',
    address: 'Near Inorbit Mall, Mindspace Road, Madhapur',
    locality: 'Madhapur',
    city: 'Hyderabad',
    lat: 17.4399,
    lng: 78.3812,
    googleMapsUrl: 'https://maps.google.com/?q=17.4399,78.3812',
    photoUrl: 'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=300&q=80',
    instructions: 'Stock needs barcode check before taking into store room.',
    notes: 'Top tier outlet in Madhapur IT corridor.',
    preferredDeliveryDate: 3,
    isActive: true,
    createdAt: '2026-02-15T10:00:00Z',
    updatedAt: '2026-02-15T10:00:00Z'
  },
  {
    id: 'shop-007',
    name: 'Secunderabad Sweet Mart & Kirana',
    ownerName: 'Rajesh Agarwal',
    phone: '9849077889',
    address: 'MG Road, Near Clock Tower, Secunderabad',
    locality: 'Secunderabad',
    city: 'Hyderabad',
    lat: 17.4411,
    lng: 78.4983,
    googleMapsUrl: 'https://maps.google.com/?q=17.4411,78.4983',
    photoUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=300&q=80',
    instructions: 'Park delivery van on main road lane.',
    notes: 'Oldest kirana in Secunderabad market.',
    preferredDeliveryDate: 4,
    isActive: true,
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-01T10:00:00Z'
  },
  {
    id: 'shop-008',
    name: 'Vogue Gourmet & Gift Gallery',
    ownerName: 'Anil Singhania',
    phone: '9849088990',
    address: 'Abids Circle, Next to G. Pulla Reddy Sweets',
    locality: 'Abids',
    city: 'Hyderabad',
    lat: 17.3891,
    lng: 78.4739,
    googleMapsUrl: 'https://maps.google.com/?q=17.3891,78.4739',
    photoUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=300&q=80',
    instructions: 'Packs must be pristine. Needs Ferrero Rocher and Amul Dark Chocolate.',
    notes: 'Premium gift client. Highest margins.',
    preferredDeliveryDate: 4,
    isActive: true,
    createdAt: '2026-03-15T10:00:00Z',
    updatedAt: '2026-03-15T10:00:00Z'
  }
];

export const initialMonthlyPlan: MonthlyPlan = {
  id: 'plan-2026-11',
  month: 11,
  year: 2026,
  startDate: '2026-11-01T00:00:00Z',
  endDate: '2026-11-05T23:59:59Z',
  isConfirmed: true,
  confirmedAt: '2026-11-01T08:00:00Z',
  status: 'active',
  createdAt: '2026-11-01T00:00:00Z',
  notes: 'November 2026 Monthly Distribution Cycle - Hyderabad'
};

export const initialAssignments: ShopFlavourAssignment[] = [
  // Shop 1: Royal Kirana (Total 30 boxes: 10 DMS, 5 Kit, 8 Mun, 4 5St, 3 Prk)
  { id: 'asgn-1-1', planId: 'plan-2026-11', shopId: 'shop-001', productId: 'prod-cad-dms', assignedBoxes: 10 },
  { id: 'asgn-1-2', planId: 'plan-2026-11', shopId: 'shop-001', productId: 'prod-nes-kit', assignedBoxes: 5 },
  { id: 'asgn-1-3', planId: 'plan-2026-11', shopId: 'shop-001', productId: 'prod-nes-mun', assignedBoxes: 8 },
  { id: 'asgn-1-4', planId: 'plan-2026-11', shopId: 'shop-001', productId: 'prod-cad-5st', assignedBoxes: 4 },
  { id: 'asgn-1-5', planId: 'plan-2026-11', shopId: 'shop-001', productId: 'prod-cad-prk', assignedBoxes: 3 },

  // Shop 2: Karachi Bakery (Total 26 boxes: 12 DMS, 8 Kit, 6 5St)
  { id: 'asgn-2-1', planId: 'plan-2026-11', shopId: 'shop-002', productId: 'prod-cad-dms', assignedBoxes: 12 },
  { id: 'asgn-2-2', planId: 'plan-2026-11', shopId: 'shop-002', productId: 'prod-nes-kit', assignedBoxes: 8 },
  { id: 'asgn-2-3', planId: 'plan-2026-11', shopId: 'shop-002', productId: 'prod-cad-5st', assignedBoxes: 6 },

  // Shop 3: Balaji Provisions (Total 20 boxes: 5 DMS, 12 Kit, 3 Mun)
  { id: 'asgn-3-1', planId: 'plan-2026-11', shopId: 'shop-003', productId: 'prod-cad-dms', assignedBoxes: 5 },
  { id: 'asgn-3-2', planId: 'plan-2026-11', shopId: 'shop-003', productId: 'prod-nes-kit', assignedBoxes: 12 },
  { id: 'asgn-3-3', planId: 'plan-2026-11', shopId: 'shop-003', productId: 'prod-nes-mun', assignedBoxes: 3 },

  // Shop 4: Asha Departmental (Total 22 boxes: 6 DMS, 6 5St, 5 Mun, 5 Prk)
  { id: 'asgn-4-1', planId: 'plan-2026-11', shopId: 'shop-004', productId: 'prod-cad-dms', assignedBoxes: 6 },
  { id: 'asgn-4-2', planId: 'plan-2026-11', shopId: 'shop-004', productId: 'prod-cad-5st', assignedBoxes: 6 },
  { id: 'asgn-4-3', planId: 'plan-2026-11', shopId: 'shop-004', productId: 'prod-nes-mun', assignedBoxes: 5 },
  { id: 'asgn-4-4', planId: 'plan-2026-11', shopId: 'shop-004', productId: 'prod-cad-prk', assignedBoxes: 5 },

  // Shop 5: Deccan Mart (Total 18 boxes: 8 DMS, 5 5St, 5 Prk)
  { id: 'asgn-5-1', planId: 'plan-2026-11', shopId: 'shop-005', productId: 'prod-cad-dms', assignedBoxes: 8 },
  { id: 'asgn-5-2', planId: 'plan-2026-11', shopId: 'shop-005', productId: 'prod-cad-5st', assignedBoxes: 5 },
  { id: 'asgn-5-3', planId: 'plan-2026-11', shopId: 'shop-005', productId: 'prod-cad-prk', assignedBoxes: 5 },

  // Shop 6: Hitec City Grocers (Total 35 boxes: 15 DMS, 10 Kit, 5 Mun, 5 Amu)
  { id: 'asgn-6-1', planId: 'plan-2026-11', shopId: 'shop-006', productId: 'prod-cad-dms', assignedBoxes: 15 },
  { id: 'asgn-6-2', planId: 'plan-2026-11', shopId: 'shop-006', productId: 'prod-nes-kit', assignedBoxes: 10 },
  { id: 'asgn-6-3', planId: 'plan-2026-11', shopId: 'shop-006', productId: 'prod-nes-mun', assignedBoxes: 5 },
  { id: 'asgn-6-4', planId: 'plan-2026-11', shopId: 'shop-006', productId: 'prod-amu-drk', assignedBoxes: 5 },

  // Shop 7: Secunderabad Sweet Mart (Total 15 boxes: 5 DMS, 5 5St, 5 Mun)
  { id: 'asgn-7-1', planId: 'plan-2026-11', shopId: 'shop-007', productId: 'prod-cad-dms', assignedBoxes: 5 },
  { id: 'asgn-7-2', planId: 'plan-2026-11', shopId: 'shop-007', productId: 'prod-cad-5st', assignedBoxes: 5 },
  { id: 'asgn-7-3', planId: 'plan-2026-11', shopId: 'shop-007', productId: 'prod-nes-mun', assignedBoxes: 5 },

  // Shop 8: Vogue Gourmet (Total 20 boxes: 10 Fer, 10 Amu)
  { id: 'asgn-8-1', planId: 'plan-2026-11', shopId: 'shop-008', productId: 'prod-fer-roc', assignedBoxes: 10 },
  { id: 'asgn-8-2', planId: 'plan-2026-11', shopId: 'shop-008', productId: 'prod-amu-drk', assignedBoxes: 10 }
];

export const initialTransactions: DistributionTransaction[] = [
  // Shop 1 completed
  { id: 'tx-1-1', planId: 'plan-2026-11', shopId: 'shop-001', productId: 'prod-cad-dms', boxesDelivered: 10, deliveryDate: '2026-11-01T10:15:00Z', deliveryStatus: 'completed', recordedBy: 'Mohammed Uzair Shareef', createdAt: '2026-11-01T10:15:00Z' },
  { id: 'tx-1-2', planId: 'plan-2026-11', shopId: 'shop-001', productId: 'prod-nes-kit', boxesDelivered: 5, deliveryDate: '2026-11-01T10:15:00Z', deliveryStatus: 'completed', recordedBy: 'Mohammed Uzair Shareef', createdAt: '2026-11-01T10:15:00Z' },
  { id: 'tx-1-3', planId: 'plan-2026-11', shopId: 'shop-001', productId: 'prod-nes-mun', boxesDelivered: 8, deliveryDate: '2026-11-01T10:15:00Z', deliveryStatus: 'completed', recordedBy: 'Mohammed Uzair Shareef', createdAt: '2026-11-01T10:15:00Z' },
  { id: 'tx-1-4', planId: 'plan-2026-11', shopId: 'shop-001', productId: 'prod-cad-5st', boxesDelivered: 4, deliveryDate: '2026-11-01T10:15:00Z', deliveryStatus: 'completed', recordedBy: 'Mohammed Uzair Shareef', createdAt: '2026-11-01T10:15:00Z' },
  { id: 'tx-1-5', planId: 'plan-2026-11', shopId: 'shop-001', productId: 'prod-cad-prk', boxesDelivered: 3, deliveryDate: '2026-11-01T10:15:00Z', deliveryStatus: 'completed', recordedBy: 'Mohammed Uzair Shareef', createdAt: '2026-11-01T10:15:00Z' },

  // Shop 3 partial
  { id: 'tx-3-1', planId: 'plan-2026-11', shopId: 'shop-003', productId: 'prod-cad-dms', boxesDelivered: 5, deliveryDate: '2026-11-02T11:45:00Z', deliveryStatus: 'completed', recordedBy: 'Mohammed Uzair Shareef', createdAt: '2026-11-02T11:45:00Z' },
  { id: 'tx-3-2', planId: 'plan-2026-11', shopId: 'shop-003', productId: 'prod-nes-kit', boxesDelivered: 8, deliveryDate: '2026-11-02T11:45:00Z', deliveryStatus: 'partial', notes: 'Store had only space for 8 boxes of KitKat today. Balance 4 boxes will take tomorrow.', recordedBy: 'Mohammed Uzair Shareef', createdAt: '2026-11-02T11:45:00Z' },
  { id: 'tx-3-3', planId: 'plan-2026-11', shopId: 'shop-003', productId: 'prod-nes-mun', boxesDelivered: 3, deliveryDate: '2026-11-02T11:45:00Z', deliveryStatus: 'completed', recordedBy: 'Mohammed Uzair Shareef', createdAt: '2026-11-02T11:45:00Z' }
];

export const initialInventoryTransactions: InventoryTransaction[] = [
  { id: 'itx-init-1', productId: 'prod-cad-dms', type: 'purchase_add', quantityChange: 135, balanceAfter: 135, notes: 'Opening stock purchase from distributor', timestamp: '2026-11-01T08:00:00Z' },
  { id: 'itx-del-1', productId: 'prod-cad-dms', type: 'distribution_deduct', quantityChange: -10, balanceAfter: 125, referenceId: 'tx-1-1', notes: 'Delivered to Royal Kirana', timestamp: '2026-11-01T10:15:00Z' },
  { id: 'itx-del-2', productId: 'prod-cad-dms', type: 'distribution_deduct', quantityChange: -5, balanceAfter: 120, referenceId: 'tx-3-1', notes: 'Delivered to Balaji Provisions', timestamp: '2026-11-02T11:45:00Z' }
];

export const initialPayments: PaymentRecord[] = [
  {
    id: 'pay-001',
    shopId: 'shop-001',
    planId: 'plan-2026-11',
    invoiceAmount: 28440,
    amountReceived: 28440,
    outstandingAmount: 0,
    paymentDate: '2026-11-01T10:20:00Z',
    paymentMethod: 'upi',
    notes: 'Received on Google Pay. Full payment settled.',
    createdAt: '2026-11-01T10:20:00Z'
  },
  {
    id: 'pay-003',
    shopId: 'shop-003',
    planId: 'plan-2026-11',
    invoiceAmount: 16980,
    amountReceived: 10000,
    outstandingAmount: 6980,
    paymentDate: '2026-11-02T12:00:00Z',
    paymentMethod: 'cash',
    notes: 'Partial advance cash. Remaining ₹6,980 when remaining 4 boxes KitKat delivered.',
    createdAt: '2026-11-02T12:00:00Z'
  }
];

export const initialExpenses: ExpenseRecord[] = [
  {
    id: 'exp-001',
    category: 'fuel',
    amount: 850,
    date: '2026-11-01',
    description: 'Diesel for distribution van (Full tank top-up)',
    createdAt: '2026-11-01T08:30:00Z'
  },
  {
    id: 'exp-002',
    category: 'packaging',
    amount: 320,
    date: '2026-11-01',
    description: 'Heavy duty brown tape and marker pens',
    createdAt: '2026-11-01T09:15:00Z'
  },
  {
    id: 'exp-003',
    category: 'food',
    amount: 180,
    date: '2026-11-02',
    description: 'Morning Irani chai and Osmania biscuits for delivery helper',
    createdAt: '2026-11-02T11:00:00Z'
  }
];
