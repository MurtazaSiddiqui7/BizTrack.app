import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Store, 
  Truck, 
  Boxes, 
  MoreHorizontal 
} from 'lucide-react';
import { useApp, AppView } from '../../context/AppContext';
import { MoreMenuModal } from './MoreMenuModal';

export const MobileNav: React.FC = () => {
  const { activeView, setActiveView, stats } = useApp();
  const [showMore, setShowMore] = useState(false);

  const isMoreActive = [
    'route', 'map', 'analytics', 'history', 'finance', 'reports', 'settings'
  ].includes(activeView);

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200 px-2 py-1 shadow-lg mobile-nav-safe">
        <div className="grid grid-cols-5 gap-1">
          {/* Home / Dashboard */}
          <button
            onClick={() => setActiveView('dashboard')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition ${
              activeView === 'dashboard' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LayoutDashboard className={`w-5 h-5 ${activeView === 'dashboard' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] mt-0.5">Home</span>
          </button>

          {/* Shops */}
          <button
            onClick={() => setActiveView('shops')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition relative ${
              activeView === 'shops' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Store className={`w-5 h-5 ${activeView === 'shops' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] mt-0.5">Shops</span>
            {stats.totalShops > 0 && (
              <span className="absolute top-1 right-3 px-1.5 py-0.5 rounded-full text-[9px] bg-slate-100 text-slate-600 font-bold">
                {stats.totalShops}
              </span>
            )}
          </button>

          {/* Distribution */}
          <button
            onClick={() => setActiveView('distribution')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition relative ${
              activeView === 'distribution' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className={`p-1 rounded-xl ${activeView === 'distribution' ? 'bg-emerald-100' : ''}`}>
              <Truck className={`w-5 h-5 ${activeView === 'distribution' ? 'stroke-[2.5]' : ''}`} />
            </div>
            <span className="text-[10px] mt-0.5">Deliver</span>
            {stats.pendingShops > 0 && (
              <span className="absolute top-1 right-2 px-1 py-0.5 rounded-full text-[9px] bg-rose-500 text-white font-bold">
                {stats.pendingShops}
              </span>
            )}
          </button>

          {/* Inventory */}
          <button
            onClick={() => setActiveView('inventory')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition ${
              activeView === 'inventory' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Boxes className={`w-5 h-5 ${activeView === 'inventory' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] mt-0.5">Stock</span>
          </button>

          {/* More Menu */}
          <button
            onClick={() => setShowMore(true)}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition ${
              isMoreActive ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <MoreHorizontal className={`w-5 h-5 ${isMoreActive ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] mt-0.5">More</span>
          </button>
        </div>
      </nav>

      {/* More Modal */}
      {showMore && (
        <MoreMenuModal onClose={() => setShowMore(false)} />
      )}
    </>
  );
};
