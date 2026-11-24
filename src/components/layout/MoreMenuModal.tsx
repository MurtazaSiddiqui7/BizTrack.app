import React from 'react';
import {
  X,
  Navigation,
  MapPin,
  BarChart3,
  History,
  Wallet,
  FileSpreadsheet,
  Settings,
  ChevronRight
} from 'lucide-react';
import { useApp, AppView } from '../../context/AppContext';

export const MoreMenuModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { activeView, setActiveView } = useApp();

  const menuItems: { id: AppView; label: string; desc: string; icon: React.ElementType }[] = [
    { id: 'route', label: 'Plan My Route', desc: 'Optimize shop visiting sequence', icon: Navigation },
    { id: 'map', label: 'Shop Map', desc: 'Interactive GPS location of all shops', icon: MapPin },
    { id: 'analytics', label: 'Business Analytics', desc: 'Distribution trends & flavour charts', icon: BarChart3 },
    { id: 'history', label: 'Monthly History', desc: 'Permanent archive of past months', icon: History },
    { id: 'finance', label: 'Payments & Expenses', desc: 'Invoices, cash collections & fuel log', icon: Wallet },
    { id: 'reports', label: 'Reports & Exports', desc: 'Download PDF & Excel sheets', icon: FileSpreadsheet },
    { id: 'settings', label: 'Settings', desc: 'Business profile & database tools', icon: Settings },
  ];

  const handleSelect = (view: AppView) => {
    setActiveView(view);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div 
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col animate-in slide-in-from-bottom"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">More Features</h3>
            <p className="text-xs text-slate-500">Navigation, reports, and settings</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 space-y-1 divide-y divide-slate-100">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isSelected = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition ${
                  isSelected ? 'bg-emerald-50 text-emerald-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{item.label}</p>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
