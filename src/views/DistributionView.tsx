import React, { useState, useMemo } from 'react';
import {
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Boxes,
  Calendar,
  Share2,
  FileText,
  Search,
  Filter,
  Plus,
  Lock,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Shop, ShopDistributionSummary } from '../types';
import { ExportService } from '../services/exportService';

interface DistributionViewProps {
  onRecordDeliveryForShop: (shop: Shop) => void;
  onAssignFlavours: (shop: Shop) => void;
  onOpenWhatsApp: (summary: ShopDistributionSummary) => void;
}

export const DistributionView: React.FC<DistributionViewProps> = ({
  onRecordDeliveryForShop,
  onAssignFlavours,
  onOpenWhatsApp
}) => {
  const {
    currentPlan,
    confirmCurrentPlan,
    summaries,
    stats,
    profile,
    createMonthlyPlan
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'partial' | 'pending'>('all');
  const [selectedLocality, setSelectedLocality] = useState<string>('all');
  const [expandedShopId, setExpandedShopId] = useState<string | null>(null);

  const monthName = new Date(currentPlan.year, currentPlan.month - 1).toLocaleString('default', {
    month: 'long',
    year: 'numeric'
  });

  const localities = useMemo(() => {
    const set = new Set<string>();
    summaries.forEach(s => {
      if (s.shop.locality) set.add(s.shop.locality);
    });
    return Array.from(set).sort();
  }, [summaries]);

  const filteredSummaries = useMemo(() => {
    return summaries.filter(s => {
      const matchesSearch =
        s.shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.shop.locality.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.shop.ownerName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'completed' && s.status === 'completed') ||
        (statusFilter === 'partial' && s.status === 'partial') ||
        (statusFilter === 'pending' && s.status === 'pending');

      const matchesLocality = selectedLocality === 'all' || s.shop.locality === selectedLocality;

      return matchesSearch && matchesStatus && matchesLocality;
    });
  }, [summaries, searchQuery, statusFilter, selectedLocality]);

  const handleExportPDF = () => {
    ExportService.exportMonthlyDistributionPDF({
      plan: currentPlan,
      profile,
      summaries,
      stats
    });
  };

  const handleExportExcel = () => {
    ExportService.exportMonthlyDistributionExcel({
      plan: currentPlan,
      summaries
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Plan Confirmation */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Distribution Tracking – {monthName}
            </h2>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
              currentPlan.isConfirmed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {currentPlan.isConfirmed ? 'Confirmed Cycle' : 'Review & Confirm'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official monthly distribution cycle (1st–5th). Record actual boxes delivered to every retail outlet.
          </p>
        </div>

        {/* Top actions: Confirm Plan / Export */}
        <div className="flex flex-wrap items-center gap-2.5">
          {!currentPlan.isConfirmed ? (
            <button
              onClick={confirmCurrentPlan}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Confirm Monthly Plan</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Plan Confirmed</span>
            </div>
          )}

          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition border border-slate-200"
            title="Download PDF Distribution Report"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-700" />
            <span>PDF</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition border border-slate-200"
            title="Export to Excel"
          >
            <FileText className="w-3.5 h-3.5 text-blue-700" />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* Progress & Stat Pill */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Shops Completed</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-700">{stats.completedShops}</span>
            <span className="text-xs text-slate-400">/ {stats.totalShops}</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden mt-2">
            <div className="h-full bg-emerald-500" style={{ width: `${stats.shopCompletionPercentage}%` }} />
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Boxes Distributed</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900">{stats.totalDistributedBoxes}</span>
            <span className="text-xs text-slate-400">/ {stats.totalAssignedBoxes}</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden mt-2">
            <div className="h-full bg-amber-500" style={{ width: `${stats.boxCompletionPercentage}%` }} />
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Partially Done</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-amber-600">{stats.partialShops}</span>
            <span className="text-xs text-slate-400">shops</span>
          </div>
          <p className="text-[11px] text-amber-700 mt-1">Require follow-up trip</p>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Boxes Remaining</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-rose-600">{stats.totalRemainingBoxes}</span>
            <span className="text-xs text-slate-400">boxes</span>
          </div>
          <p className="text-[11px] text-rose-700 mt-1">To be delivered</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search shop or locality..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1">
            <select
              value={selectedLocality}
              onChange={e => setSelectedLocality(e.target.value)}
              className="text-xs py-1.5 px-3 rounded-xl border border-slate-200 bg-white font-medium"
            >
              <option value="all">All Areas</option>
              {localities.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition flex-shrink-0 ${
              statusFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            All Shops
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition flex-shrink-0 ${
              statusFilter === 'completed' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-800'
            }`}
          >
            Completed ({summaries.filter(s => s.status === 'completed').length})
          </button>
          <button
            onClick={() => setStatusFilter('partial')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition flex-shrink-0 ${
              statusFilter === 'partial' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-800'
            }`}
          >
            Partial ({summaries.filter(s => s.status === 'partial').length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition flex-shrink-0 ${
              statusFilter === 'pending' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-800'
            }`}
          >
            Pending ({summaries.filter(s => s.status === 'pending').length})
          </button>
        </div>
      </div>

      {/* Main Distribution Master List */}
      <div className="space-y-4">
        {filteredSummaries.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200">
            <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-700">No Distribution Records Found</h4>
            <p className="text-xs text-slate-400 mt-1">
              Adjust your search filter or assign flavours to shops for this month.
            </p>
          </div>
        ) : (
          filteredSummaries.map(summary => {
            const { shop, status, totalAssignedBoxes, totalDistributedBoxes, totalRemainingBoxes, flavourDetails } = summary;
            const isCompleted = status === 'completed';
            const isPartial = status === 'partial';
            const isPending = status === 'pending';
            const isExpanded = expandedShopId === shop.id;

            return (
              <div
                key={shop.id}
                className={`bg-white rounded-3xl border transition-all duration-200 overflow-hidden shadow-sm ${
                  isCompleted
                    ? 'border-emerald-200/80 hover:border-emerald-300'
                    : isPartial
                    ? 'border-amber-200/80 hover:border-amber-300'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Shop Row Header */}
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    {/* Visual Status Indicator Icon */}
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-lg flex-shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-700'
                        : isPartial
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}>
                      {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : isPartial ? <Clock className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-base font-bold text-slate-900">{shop.name}</h4>
                        {isCompleted && (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider">
                            100% Completed
                          </span>
                        )}
                        {isPartial && (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase tracking-wider">
                            Partially Completed
                          </span>
                        )}
                        {isPending && (
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-extrabold uppercase tracking-wider">
                            Pending Delivery
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Proprietor: <strong>{shop.ownerName}</strong> • {shop.locality} • Ph: {shop.phone}
                      </p>
                    </div>
                  </div>

                  {/* Numbers & Deliver Button */}
                  <div className="flex items-center justify-between md:justify-end gap-5 border-t md:border-t-0 pt-3 md:pt-0">
                    <div className="text-left md:text-right">
                      <p className="text-xs text-slate-400 font-medium">Boxes Progress</p>
                      <p className="text-base font-black text-slate-900">
                        <span className="text-emerald-700">{totalDistributedBoxes}</span>
                        <span className="text-slate-400"> / </span>
                        <span>{totalAssignedBoxes} Boxes</span>
                      </p>
                      {totalRemainingBoxes > 0 ? (
                        <p className="text-[11px] text-rose-600 font-bold">{totalRemainingBoxes} boxes remaining</p>
                      ) : (
                        <p className="text-[11px] text-emerald-600 font-bold">Quota Completed</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onRecordDeliveryForShop(shop)}
                        className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-bold text-xs shadow-sm transition active:scale-95 ${
                          isCompleted
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                        }`}
                      >
                        <Truck className="w-4 h-4" />
                        <span>{isCompleted ? 'Add More' : 'Record Delivery'}</span>
                      </button>

                      <button
                        onClick={() => setExpandedShopId(isExpanded ? null : shop.id)}
                        className="px-3 py-2.5 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition"
                      >
                        {isExpanded ? 'Hide' : 'Flavours'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Flavour-wise Assignment & Delivery Table */}
                <div className={`p-5 pt-0 border-t border-slate-100 ${isExpanded ? 'block' : 'hidden'}`}>
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200/80 text-slate-400 uppercase tracking-wider text-[10px]">
                          <th className="py-2 font-bold">Chocolate Flavour</th>
                          <th className="py-2 text-center font-bold">Assigned</th>
                          <th className="py-2 text-center font-bold">Delivered</th>
                          <th className="py-2 text-center font-bold">Remaining</th>
                          <th className="py-2 text-right font-bold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {flavourDetails.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-4 text-center text-slate-400 italic">
                              No flavours assigned for this shop yet.{' '}
                              <button
                                onClick={() => onAssignFlavours(shop)}
                                className="text-emerald-700 font-bold underline"
                              >
                                Assign Now
                              </button>
                            </td>
                          </tr>
                        ) : (
                          flavourDetails.map(f => (
                            <tr key={f.product.id} className="hover:bg-slate-50/60 transition">
                              <td className="py-2.5">
                                <div className="font-bold text-slate-800">
                                  {f.product.brandName} {f.product.flavourName}
                                </div>
                                <div className="text-[10px] text-slate-400">{f.product.boxDescription}</div>
                              </td>
                              <td className="py-2.5 text-center font-semibold text-slate-700">
                                {f.assignedBoxes}
                              </td>
                              <td className="py-2.5 text-center font-bold text-emerald-700">
                                {f.distributedBoxes}
                              </td>
                              <td className="py-2.5 text-center font-bold">
                                {f.remainingBoxes > 0 ? (
                                  <span className="text-rose-600">{f.remainingBoxes}</span>
                                ) : (
                                  <span className="text-slate-300">0</span>
                                )}
                              </td>
                              <td className="py-2.5 text-right">
                                {f.isFlavourCompleted ? (
                                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Done
                                  </span>
                                ) : f.distributedBoxes > 0 ? (
                                  <span className="inline-flex items-center gap-1 text-amber-700 font-bold text-[11px]">
                                    <Clock className="w-3.5 h-3.5" /> Partial
                                  </span>
                                ) : (
                                  <span className="text-slate-400 font-medium text-[11px]">
                                    Pending
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Bottom quick utilities per shop */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onAssignFlavours(shop)}
                        className="text-emerald-700 hover:underline font-semibold flex items-center gap-1"
                      >
                        <Boxes className="w-3.5 h-3.5" />
                        <span>Modify Flavours Quota</span>
                      </button>
                      <button
                        onClick={() => onOpenWhatsApp(summary)}
                        className="text-slate-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Send WhatsApp</span>
                      </button>
                    </div>

                    <span className="text-[11px] text-slate-400">
                      {summary.lastDeliveryDate
                        ? `Last delivered: ${new Date(summary.lastDeliveryDate).toLocaleDateString('en-IN')}`
                        : 'No deliveries recorded yet'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
