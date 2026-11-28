import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  TrendingUp,
  Award,
  AlertCircle,
  Boxes,
  Store,
  MapPin,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const COLORS = ['#047857', '#10b981', '#34d399', '#f59e0b', '#fbbf24', '#6366f1', '#ec4899', '#8b5cf6'];

export const AnalyticsView: React.FC = () => {
  const { summaries, stats, products, currentPlan, plans } = useApp();

  // 1. Flavour Distribution Breakdown
  const flavourData = useMemo(() => {
    const map = new Map<string, { name: string; brand: string; delivered: number; assigned: number }>();

    summaries.forEach(s => {
      s.flavourDetails.forEach(f => {
        const key = f.product.id;
        const existing = map.get(key) || {
          name: f.product.flavourName,
          brand: f.product.brandName,
          delivered: 0,
          assigned: 0
        };
        existing.delivered += f.distributedBoxes;
        existing.assigned += f.assignedBoxes;
        map.set(key, existing);
      });
    });

    return Array.from(map.values()).sort((a, b) => b.delivered - a.delivered);
  }, [summaries]);

  // Most & least distributed flavours
  const mostDistributed = flavourData[0] || null;
  const leastDistributed = flavourData[flavourData.length - 1] || null;

  // 2. Locality Distribution Breakdown
  const localityData = useMemo(() => {
    const map = new Map<string, { locality: string; delivered: number; assigned: number; shops: number }>();

    summaries.forEach(s => {
      const loc = s.shop.locality || 'General';
      const existing = map.get(loc) || { locality: loc, delivered: 0, assigned: 0, shops: 0 };
      existing.delivered += s.totalDistributedBoxes;
      existing.assigned += s.totalAssignedBoxes;
      existing.shops += 1;
      map.set(loc, existing);
    });

    return Array.from(map.values()).sort((a, b) => b.delivered - a.delivered);
  }, [summaries]);

  // 3. Shop Completion Status Breakdown
  const shopStatusData = [
    { name: 'Completed', value: stats.completedShops, color: '#10b981' },
    { name: 'Partial', value: stats.partialShops, color: '#f59e0b' },
    { name: 'Pending', value: stats.pendingShops, color: '#ef4444' }
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200 w-full min-w-0 overflow-x-hidden">
      {/* Title */}
      <div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2 flex-wrap min-w-0">
          <span>Business & Distribution Analytics</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
            Live Insights
          </span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time metrics on product demand and outlet fulfillment
        </p>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Most Distributed */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xl flex-shrink-0">
            🥇
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Top Flavour</p>
            <h4 className="text-sm font-extrabold text-slate-900 truncate">
              {mostDistributed ? `${mostDistributed.brand} ${mostDistributed.name}` : 'N/A'}
            </h4>
            <p className="text-xs text-emerald-700 font-bold mt-0.5">
              {mostDistributed ? `${mostDistributed.delivered} boxes delivered` : '0 boxes'}
            </p>
          </div>
        </div>

        {/* Total Assigned vs Distributed */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xl flex-shrink-0">
            📦
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Fulfillment Rate</p>
            <h4 className="text-sm font-extrabold text-slate-900">
              {stats.boxCompletionPercentage}% Fulfilled
            </h4>
            <p className="text-xs text-amber-700 font-bold mt-0.5">
              {stats.totalDistributedBoxes} of {stats.totalAssignedBoxes} boxes
            </p>
          </div>
        </div>

        {/* Shop Coverage */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xl flex-shrink-0">
            🏬
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Outlets Completed</p>
            <h4 className="text-sm font-extrabold text-slate-900">
              {stats.shopCompletionPercentage}% Outlets Done
            </h4>
            <p className="text-xs text-blue-700 font-bold mt-0.5">
              {stats.completedShops} of {stats.totalShops} shops
            </p>
          </div>
        </div>

        {/* Remaining Pipeline */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xl flex-shrink-0">
            ⏳
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Pending Volume</p>
            <h4 className="text-sm font-extrabold text-slate-900">
              {stats.totalRemainingBoxes} Boxes Left
            </h4>
            <p className="text-xs text-rose-700 font-bold mt-0.5">
              Across {stats.pendingShops + stats.partialShops} shops
            </p>
          </div>
        </div>
      </div>

      {/* Chart Row 1: Flavour Demand & Shop Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Flavour Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Flavour-wise Box Distribution
              </h3>
              <p className="text-xs text-slate-400">Assigned Quota vs Actually Delivered</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800">
              {flavourData.length} Flavours
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={flavourData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10, fill: '#64748b' }} 
                  angle={-25}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '11px', border: 'none' }} 
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="assigned" name="Assigned Boxes" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                <Bar dataKey="delivered" name="Delivered Boxes" fill="#047857" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Shop Completion Pie Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Shop Status Breakdown
            </h3>
            <p className="text-xs text-slate-400">Outlets by delivery progress</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={shopStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {shopStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '11px', border: 'none' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
            Total of <strong>{stats.totalShops}</strong> registered retail stores
          </div>
        </div>
      </div>

      {/* Chart Row 2: Locality Volume Distribution */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Area & Locality Demand Distribution
            </h3>
            <p className="text-xs text-slate-400">Which commercial markets consume the most chocolate boxes</p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={localityData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis dataKey="locality" type="category" tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }} width={90} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '11px', border: 'none' }} 
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="delivered" name="Boxes Delivered" fill="#10b981" radius={[0, 4, 4, 0]} />
              <Bar dataKey="assigned" name="Total Assigned" fill="#cbd5e1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};


