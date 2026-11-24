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
  Building2,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

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
    stats,
    setSelectedShopForDelivery
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const monthRef = useRef<HTMLDivElement>(null);

  // PWA Install prompt listener
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (monthRef.current && !monthRef.current.contains(e.target as Node)) {
        setShowMonthPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleCreateNextMonth = () => {
    const nextMonth = currentPlan.month === 12 ? 1 : currentPlan.month + 1;
    const nextYear = currentPlan.month === 12 ? currentPlan.year + 1 : currentPlan.year;
    createMonthlyPlan(nextMonth, nextYear);
    setShowMonthPicker(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200/80 px-4 lg:px-8 py-3 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Brand / Title for Mobile */}
        <div className="flex items-center gap-3 lg:hidden">
          <img 
            src="/logo-icon.png" 
            alt="BizTrack Logo" 
            className="w-10 h-10 rounded-xl shadow-md shadow-emerald-900/20 object-contain bg-white p-0.5 border border-emerald-700/20" 
          />
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">BizTrack</h1>
            <p className="text-xs text-emerald-700 font-medium truncate max-w-[150px]">
              {profile.businessCategory || profile.businessName.split(' ')[0]}
            </p>
          </div>
        </div>

        {/* Current Active Month Selector */}
        <div className="relative" ref={monthRef}>
          <button
            onClick={() => setShowMonthPicker(!showMonthPicker)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-800 text-sm font-semibold transition"
          >
            <Calendar className="w-4 h-4 text-emerald-700" />
            <span>{monthNames[currentPlan.month - 1]} {currentPlan.year}</span>
            <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
              currentPlan.isConfirmed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {currentPlan.isConfirmed ? 'Active' : 'Draft'}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </button>

          {/* Month Dropdown */}
          {showMonthPicker && (
            <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Select Month</span>
                <span className="text-xs text-emerald-600 font-medium">Cycle: 1st–5th</span>
              </div>
              <div className="max-h-60 overflow-y-auto py-1">
                {plans.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      selectPlan(p.id);
                      setShowMonthPicker(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 flex items-center justify-between text-sm hover:bg-slate-50 transition ${
                      p.id === currentPlan.id ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-700'
                    }`}
                  >
                    <span>{monthNames[p.month - 1]} {p.year}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {p.isConfirmed ? 'Confirmed' : 'Draft'}
                    </span>
                  </button>
                ))}
              </div>
              <div className="p-2 border-t border-slate-100">
                <button
                  onClick={handleCreateNextMonth}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Start New Month Distribution
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* PWA Install Button (if available) */}
          {deferredPrompt && (
            <button
              onClick={handleInstallClick}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install App</span>
            </button>
          )}

          {/* Quick Record Delivery Button */}
          <button
            onClick={() => {
              setActiveView('distribution');
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-emerald-900/10 transition"
          >
            <Package className="w-4 h-4" />
            <span className="hidden sm:inline">Record Delivery</span>
            <span className="sm:hidden">Deliver</span>
          </button>

          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white animate-pulse">
                  {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">Notifications & Alerts</span>
                    {unreadNotificationCount > 0 && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 text-rose-700">
                        {unreadNotificationCount} New
                      </span>
                    )}
                  </div>
                  {unreadNotificationCount > 0 && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-xs text-emerald-700 hover:underline font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">
                      <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                      <p className="text-sm font-medium">All caught up!</p>
                      <p className="text-xs">No pending distribution alerts.</p>
                    </div>
                  ) : (
                    notifications.map(n => {
                      const isUrgent = n.priority === 'urgent';
                      return (
                        <div
                          key={n.id}
                          onClick={() => {
                            markNotificationAsRead(n.id);
                            if (n.type === 'low_stock') setActiveView('inventory');
                            else setActiveView('distribution');
                            setShowNotifications(false);
                          }}
                          className={`p-3.5 text-left hover:bg-slate-50 transition cursor-pointer flex gap-3 ${
                            !n.isRead ? 'bg-emerald-50/40' : ''
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${
                            isUrgent ? 'bg-rose-100 text-rose-600' : n.type === 'low_stock' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {isUrgent ? <AlertTriangle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">{n.title}</p>
                            <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{n.message}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          {!n.isRead && (
                            <span className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 flex-shrink-0" />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar */}
          <button
            onClick={() => setActiveView('settings')}
            className="flex items-center gap-2 pl-2 border-l border-slate-200 hover:opacity-85 transition"
            title="Settings & Profile"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-xs ring-2 ring-emerald-600/20">
              {profile.ownerName.charAt(0)}
            </div>
            <div className="hidden xl:block text-left">
              <p className="text-xs font-bold text-slate-900 leading-tight">{profile.ownerName}</p>
              <p className="text-[10px] text-slate-500">{profile.businessName}</p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
