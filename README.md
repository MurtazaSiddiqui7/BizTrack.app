# 📦 BizTrack – Smart Business & Distribution Manager

> A production-ready, beautiful, and complete business management application engineered for distribution businesses supplying products in boxes, cartons, or packs to kirana stores, grocery shops, and retail outlets.

---

## 🌟 Overview & Core Objective

The distribution cycle typically takes place between the **1st and 5th of every month**.
The core mission of **BizTrack** is to ensure that **no retail shop is missed** during monthly distribution, and every product and box/carton quantity is recorded with 100% mathematical accuracy.

Designed with a **deep emerald fintech aesthetic**, clean typography, rounded cards, intuitive steppers, smooth micro-interactions, and full **Progressive Web App (PWA)** mobile installation support.

---

## 🚀 Live Application URL

- **Local Development URL**: `http://localhost:3000`
- **Network / Mobile Access**: `http://<your-lan-ip>:3000`

---

## ✨ Features & Modules

### 1. 💎 Premium UI/UX Design & PWA
- **Emerald Green Fintech Design Language**: Deep emerald (`#064e3b` / `#047857`), crisp white cards, light grey background (`#f8fafc`).
- **Status Indicators**:
  - 🟢 **Green Tick**: 100% completed (all assigned flavours fully delivered).
  - 🟠 **Orange**: Partial distribution (some flavours delivered, balance pending).
  - 🔴 **Red**: Pending (no boxes delivered yet).
  - ⚪ **Grey**: Not yet included in monthly plan.
- **Responsive Layout**: Desktop emerald sidebar + Mobile 5-tab bottom navigation bar (`Home`, `Shops`, `Deliver`, `Stock`, `More`).
- **PWA Ready**: `manifest.json` and service worker caching for home screen installation on Android and iPhones.

### 2. 🔐 Authentication & Business Profile
- Configurable business profile (business name, owner name, mobile number, warehouse address, city, currency `₹`).
- Distribution cycle window configuration (1st to 5th standard).
- Expandable multi-account and staff ready architecture.

### 3. 📊 Main Dashboard
- **Shop Statistics**: Total registered shops, completed, partial, pending.
- **Chocolate & Inventory Statistics**: Total flavours, available boxes, assigned boxes, distributed, remaining.
- **Dual Visual Progress Bar**: Real-time completion percentage for both **Shops** and **Boxes**.
- **Important Alerts**: Overdue alerts after 5th, incomplete shops, low-stock warnings.
- **Quick Action Buttons**: 1-click shortcuts for Add Shop, Add Flavour, Record Delivery, Plan Route, and Interactive Map.

### 4. 🏬 Shop Management & Gallery
- Full CRUD operations with delete confirmation dialogs.
- Attributes: Shop name, owner name, mobile number, full address, locality/area, city, GPS coordinates, Google Maps link, preferred delivery date (Day 1–5), photo, and special instructions.
- Interactive GPS coordinate detection via browser Geolocation API.
- Filter by locality and status; search by shop name, owner, or mobile.

### 5. 🍫 Chocolate Flavour Management (User-Controlled)
- **Zero Hardcoding**: The owner creates and manages brands (Cadbury, Nestlé, Amul, Ferrero, etc.) and flavour varieties.
- Attributes: Brand name, flavour name, packaging box description (e.g. 24 units/box), internal SKU code, unit cost, unit selling price, photos, and notes.
- Discontinue flavours without breaking historical delivery records.

### 6. 📦 Shop-Wise Chocolate Assignment
- Every shop can receive completely different chocolate flavours and quantities.
  - *Example*: Royal Kirana receives 10 Dairy Milk Silk, 5 KitKat, 8 Munch, 4 5-Star, 3 Perk = 30 Boxes.
  - *Example*: Balaji Provisions receives 5 Dairy Milk Silk, 12 KitKat, 3 Munch = 20 Boxes.
- Quota copy shortcut: Copy flavour assignments from an existing shop in 1-click.

### 7. 📅 Monthly Distribution Planning (1st – 5th)
- Starts automatically on the 1st of each month.
- Uses previous month's assignments as a template while allowing full review and modification before confirmation.
- Permanent historical retention: past months are never overwritten.

### 8. 🚚 Distribution Tracking & Transaction Engine
- Master distribution tracking view: displays Flavour | Assigned | Delivered | Remaining | Status.
- **Atomicity & Safety**:
  - Automatically deducts confirmed deliveries from warehouse flavour inventory.
  - Pre-validates against warehouse stock; warns if inventory is insufficient.
  - Prevents accidental over-distribution beyond assigned quotas.
  - Confetti celebration upon 100% completion of all assigned flavours for a shop!

### 9. 🔔 Automatic Reminder & Alarm System
- **Day 1**: Distribution cycle started alert.
- **Day 2**: Follow-up reminder for shops not yet visited.
- **Day 3**: Mid-cycle alert highlighting partial and pending outlets.
- **Day 4**: Urgent 1-day left reminder.
- **Day 5**: Final urgent distribution deadline.
- **Day 6+**: Overdue warning until all remaining boxes are delivered.
- **Web Push Notifications**: native browser push alerts.

### 10. 🗺️ Shop Location Map & Smart Delivery Route
- **Interactive OpenStreetMap**: GPS markers color-coded by delivery status (Green, Orange, Red) with 1-click Google Maps navigation directions.
- **Plan My Delivery Route**: Greedy Nearest-Neighbor heuristic optimizing the visiting order of pending shops to minimize travel distance and fuel cost.
- Step-by-step navigation order with direct "Deliver" action on the road.

### 11. 📈 Business Analytics
- Interactive charts powered by Recharts:
  - Flavour-wise box distribution (Assigned vs Delivered).
  - Shop completion pie chart.
  - Area / locality sales volume.
  - Top moving flavour vs least distributed flavour.

### 12. 💰 Payments & Delivery Expenses
- Shop billing collection tracker (invoice amount, amount received, outstanding balance, payment method: UPI/Cash/Cheque).
- Delivery expense log (fuel/diesel, vehicle maintenance, packaging materials, food/snacks).
- Financial cash surplus and profit calculation.

### 13. 💬 WhatsApp Integration
- Pre-formatted business communication templates:
  - **Delivery Confirmation Receipt**: Itemized boxes delivered and balance.
  - **Monthly Notice**: Upcoming scheduled delivery dates and quotas.
  - **Payment Reminder**: Outstanding balance with UPI details.
- Opens `wa.me/<phone>?text=...` with confirmation.

### 14. 📄 Reports & Exports
- **PDF Generation** (jsPDF + autoTable):
  - Monthly Distribution Master Report
  - Individual Shop Delivery Slips / Invoices
  - Driver pending checklist
- **Excel Exports** (XLSX):
  - Monthly distribution matrix
  - Warehouse inventory and valuation

### 15. 🗄️ Database Architecture
- Built-in reactive persistent storage engine (runs immediately with zero external dependencies).
- Complete **Supabase / PostgreSQL SQL Schema** with 13 tables, foreign keys, and Row Level Security (RLS) included in Settings with 1-click copy.
- Full JSON backup export & restore.

---

## 🛠️ Technology Stack

- **Frontend Framework**: React 18 + TypeScript + Vite 6
- **Styling**: Tailwind CSS with custom emerald color palette
- **Icons**: Lucide React
- **Charts**: Recharts
- **PDF Generation**: jsPDF + jspdf-autotable
- **Spreadsheets**: SheetJS (XLSX)
- **Delight & Animations**: Canvas Confetti
- **Maps**: OpenStreetMap Leaflet integration
- **Backend Architecture**: Supabase / PostgreSQL schema + local reactive storage

---

## 🏃 Running the Application

```bash
# Install dependencies
npm install

# Start local development server
npm run dev
# -> Opens on http://localhost:3000

# Build for production
npm run build
```

---

## 🚢 Deployment to Vercel

1. Push this repository to GitHub or GitLab.
2. Go to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Select your repository.
4. Framework Preset: **Vite**.
5. Click **"Deploy"**!
