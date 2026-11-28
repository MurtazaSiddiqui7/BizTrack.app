import React, { useState } from 'react';
import {
  Settings,
  Building2,
  Calendar,
  Bell,
  Download,
  Upload,
  RotateCcw,
  Check,
  Briefcase,
  Package,
  Layers,
  Smartphone,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { storage } from '../services/storage';
import { NotificationEngine } from '../services/notificationEngine';

const CATEGORY_PRESETS = [
  'Chocolates & Confectionery',
  'Bakery & Biscuits',
  'Beverages & Soft Drinks',
  'Dairy & Ice Cream',
  'Snacks & Namkeen',
  'Spices & Kirana Groceries',
  'Cosmetics & Personal Care',
  'Pharma & Medical Supplies',
  'General FMCG Distribution',
  'Custom Category'
];

const UNIT_PRESETS = [
  'Boxes',
  'Cartons',
  'Packs',
  'Crates',
  'Trays',
  'Tins',
  'Bags',
  'Cases',
  'Custom Unit'
];

export const SettingsView: React.FC = () => {
  const { profile, updateProfile, resetDemoData, refreshData } = useApp();

  const [formProfile, setFormProfile] = useState({
    ...profile,
    businessCategory: profile.businessCategory || 'Chocolates & Confectionery',
    unitName: profile.unitName || 'Boxes',
    itemTypeName: profile.itemTypeName || 'Flavours & Products'
  });

  const [isCustomCategory, setIsCustomCategory] = useState(
    !CATEGORY_PRESETS.slice(0, -1).includes(profile.businessCategory || '')
  );
  const [isCustomUnit, setIsCustomUnit] = useState(
    !UNIT_PRESETS.slice(0, -1).includes(profile.unitName || '')
  );

  const [profileSaved, setProfileSaved] = useState(false);
  const [backupMsg, setBackupMsg] = useState<string | null>(null);
  const [pushStatus, setPushStatus] = useState<string>(
    'Notification' in window ? Notification.permission : 'unsupported'
  );

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formProfile);
    setProfileSaved(true);
    refreshData();
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const handleCategorySelect = (val: string) => {
    if (val === 'Custom Category') {
      setIsCustomCategory(true);
      setFormProfile({ ...formProfile, businessCategory: '' });
    } else {
      setIsCustomCategory(false);
      setFormProfile({ ...formProfile, businessCategory: val });
    }
  };

  const handleUnitSelect = (val: string) => {
    if (val === 'Custom Unit') {
      setIsCustomUnit(true);
      setFormProfile({ ...formProfile, unitName: '' });
    } else {
      setIsCustomUnit(false);
      setFormProfile({ ...formProfile, unitName: val });
    }
  };

  const handleEnablePush = async () => {
    const granted = await NotificationEngine.requestNotificationPermission();
    setPushStatus(granted ? 'granted' : 'denied');
    if (granted) {
      NotificationEngine.sendPushNotification('BizTrack Notifications Enabled', {
        body: 'You will receive scheduled reminders for monthly distribution cycles (1st - 5th).'
      });
    }
  };

  const handleExportBackup = () => {
    const json = storage.exportFullBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Distribution-FullBackup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setBackupMsg('Backup downloaded successfully!');
    setTimeout(() => setBackupMsg(null), 3000);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      const res = storage.importFullBackup(content);
      if (res.success) {
        refreshData();
        setBackupMsg('Database restored from backup!');
      } else {
        setBackupMsg(`Restore failed: ${res.message}`);
      }
      setTimeout(() => setBackupMsg(null), 4000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 w-full min-w-0 overflow-x-hidden">
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <span>Business Profile & App Settings</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure your business category, packaging units, distribution schedule, and data backups
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Profile & Category Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Form */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Business & Owner Profile</h3>
                <p className="text-xs text-slate-400">Printed on delivery slips, invoices, and WhatsApp messages</p>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-5 pt-1">
              {/* Category & Industry Customization Section */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50/70 to-teal-50/50 border border-emerald-200/80 space-y-3">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-700" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                    Business / Brand Category & Packaging Unit
                  </h4>
                </div>
                <p className="text-[11px] text-emerald-800/80">
                  Manage any product business! Whether chocolates, bakery, soft drinks, milk, namkeen, or groceries, set your industry and packaging unit here. The dashboard updates automatically.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Category Dropdown */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Business Category / Trade
                    </label>
                    <select
                      value={isCustomCategory ? 'Custom Category' : formProfile.businessCategory}
                      onChange={e => handleCategorySelect(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      {CATEGORY_PRESETS.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>

                    {isCustomCategory && (
                      <input
                        type="text"
                        required
                        placeholder="Type your custom industry / trade..."
                        value={formProfile.businessCategory}
                        onChange={e => setFormProfile({ ...formProfile, businessCategory: e.target.value })}
                        className="w-full mt-2 px-3 py-2 rounded-xl border border-emerald-300 text-xs font-bold bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    )}
                  </div>

                  {/* Packaging Unit (Boxes / Cartons / Packs) */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Packaging / Quantity Unit
                    </label>
                    <select
                      value={isCustomUnit ? 'Custom Unit' : formProfile.unitName}
                      onChange={e => handleUnitSelect(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      {UNIT_PRESETS.map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>

                    {isCustomUnit && (
                      <input
                        type="text"
                        required
                        placeholder="e.g. Cartons, Crates, Trays, Bottles..."
                        value={formProfile.unitName}
                        onChange={e => setFormProfile({ ...formProfile, unitName: e.target.value })}
                        className="w-full mt-2 px-3 py-2 rounded-xl border border-emerald-300 text-xs font-bold bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    )}
                  </div>

                  {/* Item / Variety Label */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Product Label (What do you supply?)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Flavours & Varieties, Products & SKUs, Items"
                      value={formProfile.itemTypeName}
                      onChange={e => setFormProfile({ ...formProfile, itemTypeName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Business Name, Owner & Contact Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Business / Agency Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formProfile.businessName}
                    onChange={e => setFormProfile({ ...formProfile, businessName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Proprietor / Owner Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formProfile.ownerName}
                    onChange={e => setFormProfile({ ...formProfile, ownerName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Mobile / WhatsApp Contact
                  </label>
                  <input
                    type="tel"
                    required
                    value={formProfile.phone}
                    onChange={e => setFormProfile({ ...formProfile, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    City / Operating Region
                  </label>
                  <input
                    type="text"
                    required
                    value={formProfile.city}
                    onChange={e => setFormProfile({ ...formProfile, city: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Warehouse / Business Address
                  </label>
                  <input
                    type="text"
                    value={formProfile.address}
                    onChange={e => setFormProfile({ ...formProfile, address: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Distribution Cycle Schedule (1st to 5th) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-700" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Monthly Distribution Cycle Window
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Start Day of Month</label>
                    <select
                      value={formProfile.distributionStartDay}
                      onChange={e => setFormProfile({ ...formProfile, distributionStartDay: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white"
                    >
                      <option value={1}>1st of Month (Standard)</option>
                      <option value={2}>2nd of Month</option>
                      <option value={3}>3rd of Month</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">End Day of Month</label>
                    <select
                      value={formProfile.distributionEndDay}
                      onChange={e => setFormProfile({ ...formProfile, distributionEndDay: parseInt(e.target.value) || 5 })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white"
                    >
                      <option value={5}>5th of Month (Standard 5-day cycle)</option>
                      <option value={7}>7th of Month</option>
                      <option value={10}>10th of Month</option>
                    </select>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400">
                  * Automatic overdue warnings are triggered if shops remain incomplete after the {formProfile.distributionEndDay}th.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                {profileSaved && (
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <Check className="w-4 h-4" /> Profile & Category saved to dashboard!
                  </span>
                )}
                <button
                  type="submit"
                  className="ml-auto px-6 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-900/10 active:scale-95 transition"
                >
                  Save Business Settings
                </button>
              </div>
            </form>
          </div>

          {/* Web Push & Alerts Configuration */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Notifications & Push Alarms</h3>
                <p className="text-xs text-slate-400">Mobile device and desktop reminder alerts</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-slate-800">Browser & Mobile Push Notifications</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Status: <strong className="uppercase">{pushStatus}</strong> (Receives 1st–5th daily distribution alarms)
                </p>
              </div>

              {pushStatus !== 'granted' && (
                <button
                  onClick={handleEnablePush}
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Enable Push Alarms</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Brand Identity, Backup & Restore Management */}
        <div className="space-y-6">
          {/* Official Brand Logo Showcase */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Official Brand Logo</h3>
                <p className="text-xs text-slate-400">BizTrack Distribution & Sales Tracker</p>
              </div>
            </div>

            {/* Logo Display */}
            <div className="flex flex-col items-center justify-center p-5 bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl border border-slate-800 text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-blue-500/10 blur-2xl rounded-full pointer-events-none" />
              
              {/* Full Brand Logo Container */}
              <div className="bg-white rounded-2xl p-3 shadow-xl max-w-full border border-slate-200">
                <img 
                  src="/logo-full.png" 
                  alt="BizTrack – Distribution & Sales Tracker" 
                  className="max-h-24 object-contain mx-auto"
                />
              </div>

              <div className="mt-4">
                <span className="text-sm font-black text-white tracking-wide flex items-center justify-center gap-1.5">
                  BizTrack <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 font-bold">PRO</span>
                </span>
                <p className="text-[11px] text-slate-300 font-medium mt-0.5">
                  Proprietor: {formProfile.ownerName || 'Mohammed Uzair Shareef'}
                </p>
                <p className="text-[10px] text-amber-400 font-semibold mt-0.5">
                  {formProfile.city || 'Hyderabad'} Distribution Hub
                </p>
              </div>
            </div>

            {/* Logo Specifications */}
            <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <div className="flex items-start gap-2">
                <span className="text-base leading-none">🚀</span>
                <span><strong>Ascending Trend Arrow:</strong> 3D golden arrow signifying fast delivery & sales growth.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-base leading-none">📦</span>
                <span><strong>Core Distribution Box:</strong> Center cube depicting physical packaging units & stock.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-base leading-none">🔄</span>
                <span><strong>Dynamic Swirl Ring:</strong> Continuous monthly delivery cycles & route flow.</span>
              </div>
            </div>

            {/* Download Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <a
                href="/logo-full.png"
                download="BizTrack-Full-Logo.png"
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition text-center"
              >
                <Download className="w-3.5 h-3.5 text-emerald-700" />
                <span>Full Logo</span>
              </a>
              <a
                href="/logo-icon.png"
                download="BizTrack-App-Icon.png"
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition text-center"
              >
                <Download className="w-3.5 h-3.5 text-blue-700" />
                <span>App Icon</span>
              </a>
            </div>
          </div>

          {/* Backup & Restore */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Backup & Restore</h3>
                <p className="text-xs text-slate-400">Export or restore your complete business data</p>
              </div>
            </div>

            {backupMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                {backupMsg}
              </div>
            )}

            <div className="space-y-2.5">
              <button
                onClick={handleExportBackup}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold transition"
              >
                <Download className="w-4 h-4 text-emerald-700" />
                <span>Export Full Backup (JSON)</span>
              </button>

              <label className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold transition cursor-pointer">
                <Upload className="w-4 h-4 text-blue-700" />
                <span>Restore Database from File</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Reset Demo Data */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Demonstration & Reset
            </h4>
            <p className="text-xs text-slate-400">
              Restore default starter sample data for demo purposes.
            </p>
            <button
              onClick={() => {
                if (window.confirm('Reset all data to default demonstration state? Current changes will be replaced.')) {
                  resetDemoData();
                  alert('Reset to demo state complete.');
                }
              }}
              className="w-full py-2.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Sample Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

