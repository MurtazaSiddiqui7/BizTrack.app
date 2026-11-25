import React from 'react';
import {
  Store,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Boxes,
  Truck,
  Plus,
  Navigation,
  MapPin,
  ArrowRight,
  TrendingUp,
  Package,
  Layers,
  Sparkles,
  CalendarDays
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface DashboardViewProps {
  onOpenAddShop: () => void;
  onOpenAddProduct: () => void;
  onOpenRecordDelivery: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenAddShop,
  onOpenAddProduct,
  onOpenRecordDelivery
}) => {
  const {
    profile,
    currentPlan,
    shops,
    products,
    inventory,
    summaries,
    stats,
    setActiveView,
    setSelectedShopForDelivery
  } = useApp();

  const totalAvailableStock = inventory.reduce((sum, i) => sum + i.availableBoxes, 0);

  // Month & Cycle Information
  const today = new Date();
  const currentDay = today.getDate();
  const monthName = new Date(currentPlan.year, currentPlan.month - 1).toLocaleString('default', {
    month: 'long',
    year: 'numeric'
  });

  const unit = profile.unitName || 'Boxes';
  const itemType = profile.itemTypeName || 'Flavours';
  const category = profile.businessCategory || 'Product';

  const isCycleWindow = currentDay >= profile.distributionStartDay && currentDay <= profile.distributionEndDay;
  const isPast5th = currentDay > profile.distributionEndDay;

  // Alerts to highlight
  const pendingOrPartialSummaries = summaries.filter(s => s.status === 'pending' || s.status === 'partial');
  const lowStockItems = inventory.filter(inv => inv.availableBoxes <= inv.lowStockThreshold);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Welcome & Status Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 text-white p-5 shadow-xl shadow-emerald-950/15">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 mb-3">
            <Sparkles className="w-3 h-3" />
            <span className="truncate">{category} • Cycle: 1st – 5th</span>
          </div>
          <h2 className="text-xl font-extrabold tracking-tight leading-snug">
            Hello, {profile.ownerName.split(' ')[0]}! 👋
          </h2>
          <p className="text-sm text-emerald-100/90 mt-1 leading-relaxed">
            {stats.pendingShops === 0 && stats.totalShops > 0
              ? 'Amazing! All shops 100% completed! 🎉'
              : `${stats.pendingShops + stats.partialShops} shops awaiting delivery in ${monthName}.`}
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={onOpenRecordDelivery}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-emerald-900 font-extrabold text-sm shadow-lg hover:bg-emerald-50 active:scale-95 transition"
            >
              <Truck className="w-4 h-4 text-emerald-700" />
              <span>Record Delivery</span>
            </button>
            <button
              onClick={() => setActiveView('route')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-700/60 hover:bg-emerald-700 border border-emerald-500/30 text-white font-bold text-sm active:scale-95 transition"
            >
              <Navigation className="w-4 h-4" />
              <span>Plan Route</span>
            </button>
          </div>
        </div>
        <div className="absolute -right-8 -bottom-10 w-48 h-48 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
      </div>

      {/* C. LARGE DISTRIBUTION PROGRESS BAR */}
      <div className="bg-white rounded-3xl p-4 sm:p-7 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm font-extrabold text-slate-900 truncate">
              Monthly Progress – {monthName}
            </h3>
            <p className="text-xs text-slate-500">
              Shops visited &amp; boxes (1st–5th)
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-2xl font-black text-emerald-700">
              {stats.shopCompletionPercentage}%
            </span>
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 whitespace-nowrap">
              {stats.completedShops}/{stats.totalShops} Done
            </span>
          </div>
        </div>

        {/* Visual Progress Bar - Dual Bar (Shops vs Boxes) */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1.5 text-slate-700 gap-2">
              <span className="flex-shrink-0">Shops Completed</span>
              <span className="text-right">{stats.completedShops}/{stats.totalShops} ({stats.shopCompletionPercentage}%)</span>
            </div>
            <div className="w-full h-4 rounded-full bg-slate-100 overflow-hidden p-0.5 border border-slate-200/60">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-700"
                style={{ width: `${Math.min(100, stats.shopCompletionPercentage)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1.5 text-slate-700 gap-2">
              <span className="flex-shrink-0">{unit} Delivered</span>
              <span className="text-right">
                {stats.totalDistributedBoxes}/{stats.totalAssignedBoxes} ({stats.boxCompletionPercentage}%)
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden p-0.5 border border-slate-200/60">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-700"
                style={{ width: `${Math.min(100, stats.boxCompletionPercentage)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Status Legend */}
        <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
          <div className="flex items-center gap-1.5 p-2 rounded-xl bg-emerald-50 text-emerald-900 font-semibold border border-emerald-100">
            <span className="w-2 h-2 rounded-full bg-emerald-600 flex-shrink-0" />
            <span className="truncate">Done: <strong>{stats.completedShops}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 p-2 rounded-xl bg-amber-50 text-amber-900 font-semibold border border-amber-100">
            <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
            <span className="truncate">Partial: <strong>{stats.partialShops}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 p-2 rounded-xl bg-rose-50 text-rose-900 font-semibold border border-rose-100">
            <span className="w-2 h-2 rounded-full bg-rose-600 flex-shrink-0" />
            <span className="truncate">Pending: <strong>{stats.pendingShops}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 text-slate-700 font-semibold border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-slate-400 flex-shrink-0" />
            <span className="truncate">Left: <strong>{stats.totalRemainingBoxes}</strong></span>
          </div>
        </div>
      </div>

      {/* A & B. METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* A. SHOP STATISTICS CARD */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">Shop Statistics</h4>
                <p className="text-[11px] text-slate-400">Monthly outlet coverage</p>
              </div>
            </div>
            <button
              onClick={() => setActiveView('shops')}
              className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-xs text-slate-500 font-medium">Total Registered</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalShops}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Kiranas & supermarkets</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100">
              <p className="text-xs text-emerald-700 font-medium">Completed Outlets</p>
              <p className="text-2xl font-black text-emerald-800 mt-1">{stats.completedShops}</p>
              <p className="text-[11px] text-emerald-600 mt-0.5">100% quota delivered</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-100">
              <p className="text-xs text-amber-700 font-medium">Partially Delivered</p>
              <p className="text-2xl font-black text-amber-800 mt-1">{stats.partialShops}</p>
              <p className="text-[11px] text-amber-600 mt-0.5">Some flavours pending</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-100">
              <p className="text-xs text-rose-700 font-medium">Pending Delivery</p>
              <p className="text-2xl font-black text-rose-800 mt-1">{stats.pendingShops}</p>
              <p className="text-[11px] text-rose-600 mt-0.5">Not yet visited</p>
            </div>
          </div>
        </div>

        {/* B. CHOCOLATE / PRODUCT STATISTICS CARD */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Boxes className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">{category} & Stock Inventory</h4>
                <p className="text-[11px] text-slate-400">Warehouse stock & {unit.toLowerCase()}</p>
              </div>
            </div>
            <button
              onClick={() => setActiveView('inventory')}
              className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1"
            >
              <span>Manage Stock</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-xs text-slate-500 font-medium">Total {itemType}</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{products.length}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Active catalogue</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100">
              <p className="text-xs text-emerald-700 font-medium">Available in Warehouse</p>
              <p className="text-2xl font-black text-emerald-800 mt-1">{totalAvailableStock}</p>
              <p className="text-[11px] text-emerald-600 mt-0.5">Total {unit.toLowerCase()} in stock</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100">
              <p className="text-xs text-blue-700 font-medium">Assigned this Month</p>
              <p className="text-2xl font-black text-blue-800 mt-1">{stats.totalAssignedBoxes}</p>
              <p className="text-[11px] text-blue-600 mt-0.5">{unit} committed</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-100">
              <p className="text-xs text-amber-700 font-medium">Remaining to Deliver</p>
              <p className="text-2xl font-black text-amber-800 mt-1">{stats.totalRemainingBoxes}</p>
              <p className="text-[11px] text-amber-600 mt-0.5">{unit} pending dispatch</p>
            </div>
          </div>
        </div>
      </div>

      {/* D. IMPORTANT ALERTS & QUICK ACTIONS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts & Critical Notices */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h4 className="text-sm font-extrabold text-slate-900">Important Distribution Alerts</h4>
            </div>
            {isPast5th && stats.pendingShops > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold animate-pulse">
                Overdue Window
              </span>
            )}
          </div>

          <div className="space-y-3">
            {/* Alert: Overdue / Cycle status */}
            {isPast5th && stats.pendingShops + stats.partialShops > 0 && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-rose-900">
                    Distribution Overdue ({stats.pendingShops + stats.partialShops} Shops Remaining)
                  </h5>
                  <p className="text-xs text-rose-700 mt-0.5">
                    The standard 1st–5th delivery window has passed. Priority distribution recommended to prevent customer stock-outs.
                  </p>
                </div>
              </div>
            )}

            {/* Alert: Low Stock Flavours */}
            {lowStockItems.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                <Boxes className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h5 className="text-xs font-bold text-amber-900">
                    Low Stock Alert for {lowStockItems.length} Chocolate Flavour(s)
                  </h5>
                  <p className="text-xs text-amber-700 mt-0.5">
                    {lowStockItems.map(i => {
                      const p = products.find(prod => prod.id === i.productId);
                      return `${p ? `${p.brandName} ${p.flavourName}` : 'Item'}: ${i.availableBoxes} boxes left`;
                    }).join(' • ')}
                  </p>
                  <button
                    onClick={() => setActiveView('inventory')}
                    className="text-xs text-amber-900 font-bold hover:underline mt-2 inline-block"
                  >
                    Restock now →
                  </button>
                </div>
              </div>
            )}

            {/* Pending shops list preview */}
            <div className="pt-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Shops Requiring Visit ({pendingOrPartialSummaries.length})
              </span>
              <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
                {pendingOrPartialSummaries.length === 0 ? (
                  <div className="py-4 text-center text-slate-400 text-xs flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>All registered shops have received 100% of their assigned boxes!</span>
                  </div>
                ) : (
                  pendingOrPartialSummaries.slice(0, 5).map(s => (
                    <div
                      key={s.shop.id}
                      className="py-2.5 flex items-center justify-between hover:bg-slate-50 px-2 rounded-xl transition"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-900 truncate">{s.shop.name}</p>
                          <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                            s.status === 'partial' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {s.status === 'partial' ? 'Partial' : 'Pending'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">{s.shop.locality} • {s.totalRemainingBoxes} boxes left</p>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedShopForDelivery(s.shop);
                          onOpenRecordDelivery();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold transition flex items-center gap-1"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Deliver</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* E. QUICK ACTION BUTTONS */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <h4 className="text-sm font-extrabold text-slate-900">Quick Actions</h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
            {/* Add New Shop */}
            <button
              onClick={onOpenAddShop}
              className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-left transition group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Add New Shop</p>
                <p className="text-[11px] text-slate-400">Register kirana or supermarket</p>
              </div>
            </button>

            {/* Add Product / Flavour */}
            <button
              onClick={onOpenAddProduct}
              className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-left transition group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Add {itemType.split(' ')[0]} / Item</p>
                <p className="text-[11px] text-slate-400">New brand or product variety</p>
              </div>
            </button>

            {/* Record Delivery */}
            <button
              onClick={onOpenRecordDelivery}
              className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-left transition group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Record Delivery</p>
                <p className="text-[11px] text-slate-400">Log boxes delivered to shop</p>
              </div>
            </button>

            {/* Plan Delivery Route */}
            <button
              onClick={() => setActiveView('route')}
              className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-left transition group"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Plan Delivery Route</p>
                <p className="text-[11px] text-slate-400">Optimized stop sequence</p>
              </div>
            </button>

            {/* View Shop Map */}
            <button
              onClick={() => setActiveView('map')}
              className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-left transition group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-slate-700 group-hover:text-white transition">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">View Shop Map</p>
                <p className="text-[11px] text-slate-400">Interactive GPS markers</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
