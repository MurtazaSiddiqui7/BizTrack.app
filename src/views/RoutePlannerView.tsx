import React, { useState, useMemo } from 'react';
import {
  Navigation,
  MapPin,
  Truck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  Phone,
  Compass,
  Boxes,
  Layers,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Shop, ShopDistributionSummary } from '../types';
import { planDeliveryRoute, getDirectionsUrl, getFullRouteMapUrl } from '../services/routeOptimizer';

interface RoutePlannerViewProps {
  onRecordDeliveryForShop: (shop: Shop) => void;
}

export const RoutePlannerView: React.FC<RoutePlannerViewProps> = ({ onRecordDeliveryForShop }) => {
  const { summaries, profile, currentPlan } = useApp();

  const [localityFilter, setLocalityFilter] = useState<string>('all');
  const [visitedShopIds, setVisitedShopIds] = useState<Set<string>>(new Set());

  // Extract localities of pending shops
  const localities = useMemo(() => {
    const set = new Set<string>();
    summaries
      .filter(s => s.status === 'pending' || s.status === 'partial')
      .forEach(s => {
        if (s.shop.locality) set.add(s.shop.locality);
      });
    return Array.from(set).sort();
  }, [summaries]);

  // Compute optimized route
  const routePlan = useMemo(() => {
    return planDeliveryRoute(summaries, {
      localityFilter
    });
  }, [summaries, localityFilter]);

  const toggleVisited = (shopId: string) => {
    setVisitedShopIds(prev => {
      const next = new Set(prev);
      if (next.has(shopId)) next.delete(shopId);
      else next.add(shopId);
      return next;
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-7 shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <Compass className="w-3.5 h-3.5" />
              <span>Smart Nearest-Neighbor Route Optimizer</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Plan My Delivery Route
            </h2>
            <p className="text-xs text-emerald-100 max-w-xl">
              Efficiently visit kirana shops and retail outlets with optimized ordering by distance and locality.
            </p>
          </div>

          {routePlan.stops.length > 0 && (
            <a
              href={getFullRouteMapUrl(routePlan.stops)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white text-emerald-950 font-extrabold text-xs sm:text-sm shadow-md hover:bg-emerald-50 active:scale-95 transition"
            >
              <ExternalLink className="w-4 h-4 text-emerald-700" />
              <span>Open Full Route in Google Maps</span>
            </a>
          )}
        </div>

        {/* Route Stats Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs border-t border-emerald-700/60">
          <div>
            <span className="text-emerald-300 block">Planned Stops:</span>
            <span className="text-lg font-black">{routePlan.stops.length} Shops</span>
          </div>
          <div>
            <span className="text-emerald-300 block">Total Distance:</span>
            <span className="text-lg font-black">{routePlan.totalDistanceKm} km</span>
          </div>
          <div>
            <span className="text-emerald-300 block">Boxes to Deliver:</span>
            <span className="text-lg font-black">{routePlan.totalBoxesToDeliver} Boxes</span>
          </div>
          <div>
            <span className="text-emerald-300 block">Est. Time in Route:</span>
            <span className="text-lg font-black">~{Math.round(routePlan.estimatedTotalMinutes / 60)} hrs</span>
          </div>
        </div>
      </div>

      {/* Filter by Locality */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Filter by Locality Cluster:</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setLocalityFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex-shrink-0 ${
              localityFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Areas ({routePlan.stops.length})
          </button>
          {localities.map(loc => (
            <button
              key={loc}
              onClick={() => setLocalityFilter(loc)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex-shrink-0 ${
                localityFilter === loc ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {loc}
            </button>
          ))}
        </div>
      </div>

      {/* Stop by Stop Sequence */}
      {routePlan.stops.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-800">No Pending Deliveries in this Area!</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            All registered shops in this area have already received their assigned chocolate boxes for this month.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {routePlan.stops.map((stop, index) => {
            const { summary } = stop;
            const { shop, totalRemainingBoxes, flavourDetails } = summary;
            const isMarkedVisited = visitedShopIds.has(shop.id);
            const isCompletedInDb = summary.status === 'completed';

            return (
              <div
                key={shop.id}
                className={`bg-white rounded-3xl border transition-all duration-200 p-5 shadow-sm ${
                  isMarkedVisited || isCompletedInDb
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Stop Order & Shop Info */}
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg flex-shrink-0 shadow-sm ${
                      isCompletedInDb
                        ? 'bg-emerald-100 text-emerald-700'
                        : isMarkedVisited
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-emerald-700 text-white'
                    }`}>
                      #{stop.order}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-base font-bold text-slate-900">{shop.name}</h4>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                          {shop.locality}
                        </span>
                        {isCompletedInDb && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                            ✓ Delivered
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span>Proprietor: <strong>{shop.ownerName}</strong></span>
                        <span>•</span>
                        <a href={`tel:${shop.phone}`} className="text-emerald-700 hover:underline flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          <span>{shop.phone}</span>
                        </a>
                      </div>

                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>{shop.address}</span>
                      </p>

                      {shop.instructions && (
                        <p className="text-[11px] text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl mt-2 inline-block font-medium">
                          Note: "{shop.instructions}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Quota to Unload & Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0">
                    <div className="text-left md:text-right">
                      <p className="text-xs text-slate-400 font-medium">To Deliver at Stop</p>
                      <p className="text-lg font-black text-rose-600">
                        {totalRemainingBoxes} Boxes
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {flavourDetails.filter(f => !f.isFlavourCompleted).length} pending flavours
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* 1-Click Directions */}
                      <a
                        href={getDirectionsUrl(shop.lat, shop.lng)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition border border-blue-200"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Directions</span>
                      </a>

                      {/* Record Delivery shortcut right from route */}
                      <button
                        onClick={() => onRecordDeliveryForShop(shop)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-sm active:scale-95"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Deliver</span>
                      </button>

                      {/* Mark Visited Toggle */}
                      <button
                        onClick={() => toggleVisited(shop.id)}
                        className={`p-2 rounded-xl border text-xs font-bold transition ${
                          isMarkedVisited
                            ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                        }`}
                        title="Mark Visited / Skip"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Items to deliver breakdown */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-2 text-xs">
                  {flavourDetails.map(f => (
                    <span
                      key={f.product.id}
                      className={`px-2.5 py-1 rounded-xl font-medium ${
                        f.isFlavourCompleted
                          ? 'bg-slate-100 text-slate-400 line-through'
                          : 'bg-emerald-50 text-emerald-900 border border-emerald-200/60 font-semibold'
                      }`}
                    >
                      {f.product.brandName} {f.product.flavourName}: <strong>{f.remainingBoxes} boxes</strong>
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
