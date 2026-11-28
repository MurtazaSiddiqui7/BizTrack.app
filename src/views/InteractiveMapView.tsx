import React, { useState, useMemo, useEffect } from 'react';
import {
  MapPin,
  ExternalLink,
  Store,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Filter,
  Navigation,
  Truck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Shop, ShopDistributionSummary } from '../types';
import { getDirectionsUrl } from '../services/routeOptimizer';

interface InteractiveMapViewProps {
  onRecordDeliveryForShop: (shop: Shop) => void;
}

export const InteractiveMapView: React.FC<InteractiveMapViewProps> = ({ onRecordDeliveryForShop }) => {
  const { summaries } = useApp();

  const [selectedLocality, setSelectedLocality] = useState<string>('all');
  const [selectedShop, setSelectedShop] = useState<ShopDistributionSummary | null>(null);

  const localities = useMemo(() => {
    const set = new Set<string>();
    summaries.forEach(s => {
      if (s.shop.locality) set.add(s.shop.locality);
    });
    return Array.from(set).sort();
  }, [summaries]);

  const filteredSummaries = useMemo(() => {
    return summaries.filter(s => {
      return selectedLocality === 'all' || s.shop.locality === selectedLocality;
    });
  }, [summaries, selectedLocality]);

  // Center coordinates (default Hyderabad center or first shop)
  const defaultLat = filteredSummaries[0]?.shop.lat || 17.3850;
  const defaultLng = filteredSummaries[0]?.shop.lng || 78.4867;

  return (
    <div className="space-y-6 animate-in fade-in duration-200 w-full min-w-0 overflow-x-hidden">
      {/* Header */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight flex flex-wrap items-center gap-2">
            <span>Shop Location & GPS Map</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              {filteredSummaries.length} Pins
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Geographic view of all retail outlets color-coded by monthly delivery fulfillment status
          </p>
        </div>

        {/* Filter and Legend */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <select
              value={selectedLocality}
              onChange={e => setSelectedLocality(e.target.value)}
              className="text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-auto max-w-full"
            >
              <option value="all">All Areas ({summaries.length})</option>
              {localities.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Map Legend */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 text-xs">
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-2 font-bold text-emerald-900">
          <span className="w-3 h-3 rounded-full bg-emerald-600 shadow-sm flex-shrink-0" />
          <span>Completed ({summaries.filter(s => s.status === 'completed').length})</span>
        </div>
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-100 flex items-center gap-2 font-bold text-amber-900">
          <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm flex-shrink-0" />
          <span>Partial Delivery ({summaries.filter(s => s.status === 'partial').length})</span>
        </div>
        <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100 flex items-center gap-2 font-bold text-rose-900">
          <span className="w-3 h-3 rounded-full bg-rose-600 shadow-sm flex-shrink-0" />
          <span>Pending ({summaries.filter(s => s.status === 'pending').length})</span>
        </div>
      </div>

      {/* Interactive Map Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Display Card */}
        <div className="lg:col-span-2 bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm flex flex-col h-[360px] sm:h-[520px]">
          {/* Embedded OpenStreetMap interactive frame with customized markers */}
          <iframe
            title="Shop Locations Map"
            className="w-full flex-1 border-0"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${defaultLng - 0.08}%2C${defaultLat - 0.08}%2C${defaultLng + 0.08}%2C${defaultLat + 0.08}&layer=mapnik&marker=${defaultLat}%2C${defaultLng}`}
          />
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>Powered by OpenStreetMap GPS coordinates</span>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=kirana+stores+near+${defaultLat},${defaultLng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
            >
              <span>Open in Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Shop List with Pin Details */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col h-[520px]">
          <h3 className="text-sm font-extrabold text-slate-900 mb-3">
            Shop Outlets ({filteredSummaries.length})
          </h3>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {filteredSummaries.map(s => {
              const isSelected = selectedShop?.shop.id === s.shop.id;
              const isDone = s.status === 'completed';
              const isPartial = s.status === 'partial';

              return (
                <div
                  key={s.shop.id}
                  onClick={() => setSelectedShop(s)}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                        isDone ? 'bg-emerald-600' : isPartial ? 'bg-amber-500' : 'bg-rose-600'
                      }`} />
                      <h4 className="text-xs font-bold text-slate-900 truncate">{s.shop.name}</h4>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 flex-shrink-0">
                      {s.shop.locality}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 mt-1 truncate">
                    {s.shop.address}
                  </p>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px]">
                    <span className="text-slate-500">
                      Boxes: <strong>{s.totalDistributedBoxes} / {s.totalAssignedBoxes}</strong>
                    </span>
                    {s.totalRemainingBoxes > 0 ? (
                      <span className="text-rose-600 font-bold">{s.totalRemainingBoxes} pending</span>
                    ) : (
                      <span className="text-emerald-700 font-bold">Completed</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Pin Details Box */}
          {selectedShop && (
            <div className="pt-3 border-t border-slate-100 mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{selectedShop.shop.name}</span>
                <span className="text-[11px] text-slate-500">Ph: {selectedShop.shop.phone}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={getDirectionsUrl(selectedShop.shop.lat, selectedShop.shop.lng)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition border border-blue-200"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Directions</span>
                </a>
                <button
                  onClick={() => onRecordDeliveryForShop(selectedShop.shop)}
                  className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Deliver</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
