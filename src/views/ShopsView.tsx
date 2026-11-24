import React, { useState, useMemo } from 'react';
import {
  Store,
  Plus,
  Search,
  Filter,
  MapPin,
  Phone,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Boxes,
  Truck,
  ExternalLink,
  Share2,
  Edit2,
  Trash2,
  ChevronRight,
  ArrowUpDown
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Shop, ShopDistributionSummary } from '../types';
import { getDirectionsUrl } from '../services/routeOptimizer';

interface ShopsViewProps {
  onOpenAddShop: () => void;
  onEditShop: (shop: Shop) => void;
  onAssignFlavours: (shop: Shop) => void;
  onRecordDeliveryForShop: (shop: Shop) => void;
  onOpenWhatsApp: (summary: ShopDistributionSummary) => void;
}

export const ShopsView: React.FC<ShopsViewProps> = ({
  onOpenAddShop,
  onEditShop,
  onAssignFlavours,
  onRecordDeliveryForShop,
  onOpenWhatsApp
}) => {
  const { summaries, deleteShop, profile, currentPlan } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'partial' | 'pending' | 'unassigned'>('all');
  const [localityFilter, setLocalityFilter] = useState<string>('all');
  const [selectedShopSummary, setSelectedShopSummary] = useState<ShopDistributionSummary | null>(null);
  const [shopToDelete, setShopToDelete] = useState<Shop | null>(null);

  // Extract unique localities
  const localities = useMemo(() => {
    const set = new Set<string>();
    summaries.forEach(s => {
      if (s.shop.locality) set.add(s.shop.locality);
    });
    return Array.from(set).sort();
  }, [summaries]);

  // Filtered summaries
  const filteredSummaries = useMemo(() => {
    return summaries.filter(s => {
      // Search
      const matchesSearch =
        s.shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.shop.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.shop.phone.includes(searchQuery) ||
        s.shop.locality.toLowerCase().includes(searchQuery.toLowerCase());

      // Status
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;

      // Locality
      const matchesLocality = localityFilter === 'all' || s.shop.locality === localityFilter;

      return matchesSearch && matchesStatus && matchesLocality;
    });
  }, [summaries, searchQuery, statusFilter, localityFilter]);

  const handleDeleteConfirm = () => {
    if (shopToDelete) {
      deleteShop(shopToDelete.id);
      setShopToDelete(null);
      if (selectedShopSummary?.shop.id === shopToDelete.id) {
        setSelectedShopSummary(null);
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title & Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Shop Gallery & Management</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              {summaries.length} Outlets
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your network of kirana stores, assign chocolate quotas and monitor fulfillment
          </p>
        </div>

        <button
          onClick={onOpenAddShop}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-900/10 active:scale-95 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Shop</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search box */}
          <div className="md:col-span-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by shop name, owner, or mobile..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Status Tab buttons */}
          <div className="md:col-span-2 flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex-shrink-0 ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({summaries.length})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex-shrink-0 ${
                statusFilter === 'completed'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              Completed ({summaries.filter(s => s.status === 'completed').length})
            </button>
            <button
              onClick={() => setStatusFilter('partial')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex-shrink-0 ${
                statusFilter === 'partial'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              Partial ({summaries.filter(s => s.status === 'partial').length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex-shrink-0 ${
                statusFilter === 'pending'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
              }`}
            >
              Pending ({summaries.filter(s => s.status === 'pending').length})
            </button>

            {/* Locality Dropdown Filter */}
            <div className="ml-auto pl-2 flex items-center gap-1 flex-shrink-0">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={localityFilter}
                onChange={e => setLocalityFilter(e.target.value)}
                className="text-xs py-1.5 px-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Localities</option>
                {localities.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Shop Cards Grid */}
      {filteredSummaries.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200">
          <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-700">No Shops Found</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            No shops matched your search filter. Try clearing filters or register a new outlet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredSummaries.map(summary => {
            const { shop, status, totalAssignedBoxes, totalDistributedBoxes, totalRemainingBoxes } = summary;

            // Visual indicator badge
            const isCompleted = status === 'completed';
            const isPartial = status === 'partial';
            const isPending = status === 'pending';

            return (
              <div
                key={shop.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-card-hover transition-all duration-200 overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Card Header & Status */}
                  <div className="p-5 pb-3 border-b border-slate-100">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {shop.photoUrl ? (
                          <img
                            src={shop.photoUrl}
                            alt={shop.name}
                            className="w-12 h-12 rounded-2xl object-cover border border-slate-100 shadow-sm"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg border border-emerald-100">
                            🏬
                          </div>
                        )}
                        <div>
                          <h4 
                            onClick={() => setSelectedShopSummary(summary)}
                            className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition cursor-pointer"
                          >
                            {shop.name}
                          </h4>
                          <p className="text-xs text-slate-500 font-medium">
                            Proprietor: <strong>{shop.ownerName}</strong>
                          </p>
                        </div>
                      </div>

                      {/* Status badge */}
                      {isCompleted && (
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Done</span>
                        </span>
                      )}
                      {isPartial && (
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Partial</span>
                        </span>
                      )}
                      {isPending && (
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Pending</span>
                        </span>
                      )}
                      {status === 'unassigned' && (
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold">
                          No Quota
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{shop.address}, {shop.locality}</span>
                    </div>
                  </div>

                  {/* Quota Progress */}
                  <div className="p-5 py-4 bg-slate-50/50 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Monthly Distribution:</span>
                      <span className="font-extrabold text-slate-900">
                        {totalDistributedBoxes} / {totalAssignedBoxes} Boxes
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCompleted ? 'bg-emerald-500' : isPartial ? 'bg-amber-500' : 'bg-slate-300'
                        }`}
                        style={{
                          width: `${totalAssignedBoxes > 0 ? (totalDistributedBoxes / totalAssignedBoxes) * 100 : 0}%`
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                      <span>Assigned Flavours: <strong>{summary.assignedFlavoursCount}</strong></span>
                      {totalRemainingBoxes > 0 ? (
                        <span className="text-rose-600 font-bold">{totalRemainingBoxes} boxes pending</span>
                      ) : (
                        <span className="text-emerald-700 font-bold">100% Fulfilled</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1">
                    {/* Google Maps direction */}
                    <a
                      href={getDirectionsUrl(shop.lat, shop.lng)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition"
                      title="Open Directions in Google Maps"
                    >
                      <MapPin className="w-4 h-4" />
                    </a>

                    {/* WhatsApp */}
                    <button
                      onClick={() => onOpenWhatsApp(summary)}
                      className="p-2 rounded-xl text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition"
                      title="Send WhatsApp Update"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    {/* Assign Flavours */}
                    <button
                      onClick={() => onAssignFlavours(shop)}
                      className="p-2 rounded-xl text-slate-500 hover:text-amber-700 hover:bg-amber-50 transition"
                      title="Assign / Modify Chocolate Flavours"
                    >
                      <Boxes className="w-4 h-4" />
                    </button>

                    {/* Edit shop */}
                    <button
                      onClick={() => onEditShop(shop)}
                      className="p-2 rounded-xl text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition"
                      title="Edit Shop Details"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Delete shop */}
                    <button
                      onClick={() => setShopToDelete(shop)}
                      className="p-2 rounded-xl text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition"
                      title="Delete Shop"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Primary: Deliver Button */}
                  <button
                    onClick={() => onRecordDeliveryForShop(shop)}
                    className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Deliver</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Shop Details Modal / Drawer */}
      {selectedShopSummary && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setSelectedShopSummary(null)}
        >
          <div 
            className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-emerald-800 to-emerald-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl border border-white/20">
                  🏬
                </div>
                <div>
                  <h3 className="text-base font-bold">{selectedShopSummary.shop.name}</h3>
                  <p className="text-xs text-emerald-200">
                    Owner: {selectedShopSummary.shop.ownerName} • {selectedShopSummary.shop.locality}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedShopSummary(null)}
                className="p-2 rounded-full hover:bg-white/10 text-white transition"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Contact & Map Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Mobile:</span>
                  <a href={`tel:${selectedShopSummary.shop.phone}`} className="font-bold text-emerald-700 hover:underline">
                    {selectedShopSummary.shop.phone}
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Address:</span>
                  <span className="font-medium text-slate-800 text-right max-w-xs">{selectedShopSummary.shop.address}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Preferred Delivery:</span>
                  <span className="font-bold text-slate-900">Day {selectedShopSummary.shop.preferredDeliveryDate} of Month</span>
                </div>
                {selectedShopSummary.shop.instructions && (
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-slate-500 font-semibold block mb-0.5">Instructions:</span>
                    <p className="text-slate-700 italic">"{selectedShopSummary.shop.instructions}"</p>
                  </div>
                )}
              </div>

              {/* Assigned Flavours Breakdown */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Assigned Chocolate Quotas ({selectedShopSummary.totalAssignedBoxes} Boxes)
                </h4>
                {selectedShopSummary.flavourDetails.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No flavours assigned yet.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedShopSummary.flavourDetails.map(f => (
                      <div
                        key={f.product.id}
                        className="p-3 rounded-2xl border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-slate-900">
                            {f.product.brandName} {f.product.flavourName}
                          </p>
                          <p className="text-slate-500 text-[11px]">
                            Delivered: {f.distributedBoxes} of {f.assignedBoxes} boxes
                          </p>
                        </div>
                        {f.isFlavourCompleted ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            Completed
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                            {f.remainingBoxes} pending
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3 pt-3">
                <button
                  onClick={() => {
                    onAssignFlavours(selectedShopSummary.shop);
                    setSelectedShopSummary(null);
                  }}
                  className="py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
                >
                  Edit Quota Assignments
                </button>
                <button
                  onClick={() => {
                    onRecordDeliveryForShop(selectedShopSummary.shop);
                    setSelectedShopSummary(null);
                  }}
                  className="py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 transition"
                >
                  Record Delivery
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {shopToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h4 className="text-base font-bold text-slate-900">Delete Shop?</h4>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete <strong>{shopToDelete.name}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShopToDelete(null)}
                className="py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="py-2.5 rounded-xl bg-rose-600 text-xs font-bold text-white hover:bg-rose-700 transition"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
