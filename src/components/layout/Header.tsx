import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Calendar,
  Plus,
  Download,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Package,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { InstallGuideModal } from '../modals/InstallGuideModal';

export const Header: React.FC = () => {
  const {
    profile,
    currentPlan,
    plans,
    selectPlan,
    createMonthlyPlan,
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setActiveView,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const { isInstalled, canInstallNative, promptInstall } = usePWAInstall();
  const notifRef = useRef<HTMLDivElement>(null);
  const monthRef = useRef<HTMLDivElement>(null);

  const handleInstallClick = async () => {
    const result = await promptInstall();
    if (result === 'unavailable') {
      setShowInstallGuide(true);
    }
  };

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
      if (monthRef.current && !monthRef.current.contains(e.target as Node)) setShowMonthPicker(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const handleCreateNextMonth = () => {
    const nextMonth = currentPlan.month === 12 ? 1 : currentPlan.month + 1;
    const nextYear = currentPlan.month === 12 ? currentPlan.year + 1 : currentPlan.year;
    createMonthlyPlan(nextMonth, nextYear);
    setShowMonthPicker(false);
  };

  const MonthDropdown = () => (
    <div className="absolute left-0 top-full mt-1 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50">
      <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Select Month</span>
        <span className="text-xs text-emerald-600 font-medium">1st–5th</span>
      </div>
      <div className="max-h-48 overflow-y-auto py-1">
        {plans.map(p => (
          <button
            key={p.id}
            onClick={() => { selectPlan(p.id); setShowMonthPicker(false); }}
            className={`w-full text-left px-4 py-2 flex items-center justify-between text-sm hover:bg-slate-50 ${p.id === currentPlan.id ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-700'}`}
          >
            <span>{monthNames[p.month - 1]} {p.year}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{p.isConfirmed ? 'Active' : 'Draft'}</span>
          </button>
        ))}
      </div>
      <div className="p-2 border-t border-slate-100">
        <button
          onClick={handleCreateNextMonth}
          className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
        >
          <Plus className="w-3 h-3" /> New Month
        </button>
      </div>
    </div>
  );

  const NotifDropdown = () => (
    <div className="absolute right-0 top-full mt-1 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50">
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
        <span className="font-bold text-sm text-slate-900">Alerts</span>
        {unreadNotificationCount > 0 && (
          <button onClick={markAllNotificationsAsRead} className="text-xs text-emerald-700 font-medium">Mark all read</button>
        )}
      </div>
      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-slate-400">
            <CheckCircle2 className="w-7 h-7 mx-auto mb-2 text-emerald-500" />
            <p className="text-xs font-medium">All caught up!</p>
          </div>
        ) : notifications.map(n => {
          const isUrgent = n.priority === 'urgent';
          return (
            <div
              key={n.id}
              onClick={() => { markNotificationAsRead(n.id); setActiveView(n.type === 'low_stock' ? 'inventory' : 'distribution'); setShowNotifications(false); }}
              className={`p-3 hover:bg-slate-50 cursor-pointer flex gap-2.5 ${!n.isRead ? 'bg-emerald-50/40' : ''}`}
            >
              <div className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center ${isUrgent ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-700'}`}>
                {isUrgent ? <AlertTriangle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{n.title}</p>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
              </div>
              {!n.isRead && <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 mt-1" />}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 w-full overflow-hidden">

      {/* ── MOBILE HEADER (< lg) ── */}
      <div className="lg:hidden">
        {/* Row 1: logo + month pill + bell + avatar */}
        <div className="flex items-center gap-2 px-3 py-2.5">
          {/* Logo */}
          <img src="/logo-icon.png" alt="BizTrack" className="w-8 h-8 rounded-lg object-contain border border-emerald-100 flex-shrink-0" />

          {/* Month Selector – takes remaining space */}
          <div className="relative flex-1 min-w-0" ref={monthRef}>
            <button
              onClick={() => setShowMonthPicker(!showMonthPicker)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold w-full overflow-hidden"
            >
              <Calendar className="w-3 h-3 text-emerald-700 flex-shrink-0" />
              <span className="truncate flex-1 text-left">{monthNames[currentPlan.month - 1].slice(0,3)} {currentPlan.year}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0 ${currentPlan.isConfirmed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {currentPlan.isConfirmed ? 'Active' : 'Draft'}
              </span>
            </button>
            {showMonthPicker && <MonthDropdown />}
          </div>

          {/* Install App button on mobile when not yet installed */}
          {!isInstalled && (
            <button
              onClick={handleInstallClick}
              title={canInstallNative ? 'Install BizTrack App' : 'How to Install BizTrack'}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold flex-shrink-0 transition"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span>Install</span>
            </button>
          )}

          {/* Notification Bell */}
          <div className="relative flex-shrink-0" ref={notifRef}>
            <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition">
              <Bell className="w-4 h-4" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center border border-white">
                  {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                </span>
              )}
            </button>
            {showNotifications && <NotifDropdown />}
          </div>

          {/* Avatar */}
          <button onClick={() => setActiveView('settings')} className="w-7 h-7 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-xs ring-2 ring-emerald-200 flex-shrink-0">
            {profile.ownerName.charAt(0)}
          </button>
        </div>

        {/* Row 2: Action buttons */}
        <div className="flex gap-2 px-3 pb-2.5">
          <button
            onClick={() => setActiveView('distribution')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold active:scale-95 transition"
          >
            <Package className="w-3.5 h-3.5" />
            Record Delivery
          </button>
          <button
            onClick={() => setActiveView('shops')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold active:scale-95 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            View Shops
          </button>
        </div>
      </div>

      {/* ── DESKTOP HEADER (≥ lg) ── */}
      <div className="hidden lg:flex items-center justify-between gap-4 px-8 py-3">
        {/* Month Selector */}
        <div className="relative" ref={monthRef}>
          <button
            onClick={() => setShowMonthPicker(!showMonthPicker)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-sm font-semibold transition"
          >
            <Calendar className="w-4 h-4 text-emerald-700" />
            <span>{monthNames[currentPlan.month - 1]} {currentPlan.year}</span>
            <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${currentPlan.isConfirmed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
              {currentPlan.isConfirmed ? 'Active' : 'Draft'}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>
          {showMonthPicker && <MonthDropdown />}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {!isInstalled && (
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition"
            >
              <Download className="w-3.5 h-3.5" /> {canInstallNative ? 'Install App' : 'Install Guide'}
            </button>
          )}

          <button
            onClick={() => setActiveView('distribution')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold transition"
          >
            <Package className="w-4 h-4" /> Record Delivery
          </button>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition">
              <Bell className="w-5 h-5" />
              {unreadNotificationCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center border border-white">
                  {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                </span>
              )}
            </button>
            {showNotifications && <NotifDropdown />}
          </div>

          {/* Avatar */}
          <button onClick={() => setActiveView('settings')} className="flex items-center gap-2 pl-2 border-l border-slate-200 hover:opacity-80 transition">
            <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-xs ring-2 ring-emerald-200">
              {profile.ownerName.charAt(0)}
            </div>
            <div className="hidden xl:block text-left">
              <p className="text-xs font-bold text-slate-900">{profile.ownerName}</p>
              <p className="text-[10px] text-slate-500">{profile.businessName}</p>
            </div>
          </button>
        </div>
      </div>
      {/* Install Guide Modal (fallback when native prompt unavailable) */}
      {showInstallGuide && (
        <InstallGuideModal onClose={() => setShowInstallGuide(false)} />
      )}
    </header>
  );
};
