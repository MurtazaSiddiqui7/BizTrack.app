import React from 'react';
import {
  LayoutDashboard,
  Store,
  Truck,
  Boxes,
  Navigation,
  MapPin,
  BarChart3,
  History,
  Wallet,
  FileSpreadsheet,
  Settings,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useApp, AppView } from '../../context/AppContext';

interface NavItem {
  id: AppView;
  label: string;
  icon: React.ElementType;
  badge?: number | string;
}

export const Sidebar: React.FC = () => {
  const { activeView, setActiveView, stats, profile } = useApp();

  const mainNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'shops', label: 'Shop Gallery', icon: Store, badge: stats.totalShops },
    { id: 'distribution', label: 'Distribution', icon: Truck, badge: stats.pendingShops > 0 ? `${stats.pendingShops} left` : undefined },
    { id: 'inventory', label: 'Inventory Stock', icon: Boxes },
  ];

  const toolsNavItems: NavItem[] = [
    { id: 'route', label: 'Plan My Route', icon: Navigation },
    { id: 'map', label: 'Interactive Map', icon: MapPin },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'history', label: 'Monthly History', icon: History },
    { id: 'finance', label: 'Payments & Expenses', icon: Wallet },
    { id: 'reports', label: 'Reports & Exports', icon: FileSpreadsheet },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-slate-300 border-r border-slate-800 min-h-screen fixed left-0 top-0 bottom-0 z-40 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
        <img
          src="/logo-icon.png"
          alt="BizTrack Logo"
          className="w-10 h-10 rounded-xl shadow-lg shadow-emerald-950/40 object-contain bg-white/95 p-0.5 border border-emerald-500/20"
        />
        <div>
          <h2 className="text-base font-extrabold text-white tracking-tight flex items-center gap-1.5">
            BizTrack
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">PRO</span>
          </h2>
          <p className="text-[11px] text-slate-400 font-medium truncate max-w-[140px]">
            {profile.businessCategory || 'Distribution Manager'}
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3">Core Modules</span>
          <nav className="mt-2 space-y-1">
            {mainNavItems.map(item => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-emerald-400 border border-slate-700'
                      }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3">Tools & Insights</span>
          <nav className="mt-2 space-y-1">
            {toolsNavItems.map(item => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Profile & Status */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-900/60 text-emerald-300 flex items-center justify-center font-bold text-sm border border-emerald-800">
            {profile.ownerName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{profile.ownerName}</p>
            <p className="text-[10px] text-slate-400 truncate flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400 inline" />
              Verified Owner
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
