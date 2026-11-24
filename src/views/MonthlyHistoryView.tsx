import React, { useState, useMemo } from 'react';
import {
  History,
  Calendar,
  FileText,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  ChevronDown
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { storage } from '../services/storage';
import { ExportService } from '../services/exportService';

export const MonthlyHistoryView: React.FC = () => {
  const { plans, profile } = useApp();

  const [selectedPlanId, setSelectedPlanId] = useState<string>(plans[0]?.id || '');

  const activePlan = useMemo(() => {
    return plans.find(p => p.id === selectedPlanId) || plans[0];
  }, [plans, selectedPlanId]);

  const monthName = activePlan
    ? new Date(activePlan.year, activePlan.month - 1).toLocaleString('default', {
        month: 'long',
        year: 'numeric'
      })
    : '';

  const summaries = useMemo(() => {
    if (!activePlan) return [];
    return storage.getAllShopDistributionSummaries(activePlan.id);
  }, [activePlan]);

  const stats = useMemo(() => {
    if (!activePlan) {
      return {
        totalShops: 0,
        completedShops: 0,
        partialShops: 0,
        pendingShops: 0,
        unassignedShops: 0,
        shopCompletionPercentage: 0,
        totalAssignedBoxes: 0,
        totalDistributedBoxes: 0,
        totalRemainingBoxes: 0,
        boxCompletionPercentage: 0
      };
    }
    return storage.getMonthDistributionStats(activePlan.id);
  }, [activePlan]);

  const handleExportPDF = () => {
    if (!activePlan) return;
    ExportService.exportMonthlyDistributionPDF({
      plan: activePlan,
      profile,
      summaries,
      stats
    });
  };

  const handleExportExcel = () => {
    if (!activePlan) return;
    ExportService.exportMonthlyDistributionExcel({
      plan: activePlan,
      summaries
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Month Selector */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Monthly Distribution Archives</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
              Permanent Records
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select any past month to view complete historical shop assignments, actual distributions and download reports
          </p>
        </div>

        {/* Month Selector dropdown & Exports */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <select
              value={selectedPlanId}
              onChange={e => setSelectedPlanId(e.target.value)}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none pr-8"
            >
              {plans.map(p => {
                const name = new Date(p.year, p.month - 1).toLocaleString('default', {
                  month: 'long',
                  year: 'numeric'
                });
                return (
                  <option key={p.id} value={p.id}>
                    {name} ({p.isConfirmed ? 'Confirmed' : 'Draft'})
                  </option>
                );
              })}
            </select>
          </div>

          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition border border-slate-200"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-700" />
            <span>PDF Archive</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition border border-slate-200"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-700" />
            <span>Excel Archive</span>
          </button>
        </div>
      </div>

      {/* Monthly Performance Stats Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold">Total Shops</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalShops}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">In distribution cycle</p>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold">Shop Fulfillment</p>
          <p className="text-2xl font-black text-emerald-700 mt-1">{stats.shopCompletionPercentage}%</p>
          <p className="text-[11px] text-emerald-600 mt-0.5">{stats.completedShops} fully done</p>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold">Boxes Distributed</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalDistributedBoxes}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Out of {stats.totalAssignedBoxes}</p>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold">Box Fulfillment</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{stats.boxCompletionPercentage}%</p>
          <p className="text-[11px] text-amber-700 mt-0.5">{stats.totalRemainingBoxes} boxes pending</p>
        </div>
      </div>

      {/* Historical Distribution Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900">
            Archived Records for {monthName}
          </h3>
          <span className="text-xs text-slate-400">
            Immutable Historical Data
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-3 font-bold">Shop Outlet</th>
                <th className="py-3 font-bold">Area</th>
                <th className="py-3 text-center font-bold">Assigned</th>
                <th className="py-3 text-center font-bold">Delivered</th>
                <th className="py-3 text-center font-bold">Remaining</th>
                <th className="py-3 font-bold">Flavours Supplied</th>
                <th className="py-3 text-right font-bold">Final Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summaries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                    No shops recorded for this month.
                  </td>
                </tr>
              ) : (
                summaries.map(s => {
                  const isDone = s.status === 'completed';
                  const isPartial = s.status === 'partial';

                  return (
                    <tr key={s.shop.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 font-bold text-slate-900">
                        {s.shop.name}
                        <span className="block text-[11px] text-slate-400 font-normal">
                          {s.shop.ownerName}
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-600">{s.shop.locality}</td>
                      <td className="py-3.5 text-center font-semibold text-slate-700">
                        {s.totalAssignedBoxes}
                      </td>
                      <td className="py-3.5 text-center font-bold text-emerald-700">
                        {s.totalDistributedBoxes}
                      </td>
                      <td className="py-3.5 text-center font-bold">
                        {s.totalRemainingBoxes > 0 ? (
                          <span className="text-rose-600">{s.totalRemainingBoxes}</span>
                        ) : (
                          <span className="text-slate-300">0</span>
                        )}
                      </td>
                      <td className="py-3.5 text-slate-600 max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {s.flavourDetails.map(f => (
                            <span
                              key={f.product.id}
                              className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700"
                            >
                              {f.product.flavourName}: {f.distributedBoxes}/{f.assignedBoxes}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 text-right font-bold">
                        {isDone ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                          </span>
                        ) : isPartial ? (
                          <span className="inline-flex items-center gap-1 text-amber-700 text-xs">
                            <Clock className="w-3.5 h-3.5" /> Partial
                          </span>
                        ) : (
                          <span className="text-rose-600 text-xs">Pending</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
