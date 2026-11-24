import React, { useState } from 'react';
import { 
  X, 
  Store, 
  MapPin, 
  Phone, 
  User, 
  Calendar, 
  FileText, 
  Navigation, 
  Check, 
  Compass,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Shop } from '../../types';

interface AddShopModalProps {
  shopToEdit?: Shop | null;
  onClose: () => void;
}

export const AddShopModal: React.FC<AddShopModalProps> = ({ shopToEdit, onClose }) => {
  const { addShop, updateShop, refreshData } = useApp();

  const [formData, setFormData] = useState({
    name: shopToEdit?.name || '',
    ownerName: shopToEdit?.ownerName || '',
    phone: shopToEdit?.phone || '',
    address: shopToEdit?.address || '',
    locality: shopToEdit?.locality || '',
    city: shopToEdit?.city || 'Hyderabad',
    lat: shopToEdit?.lat || 17.3850,
    lng: shopToEdit?.lng || 78.4867,
    googleMapsUrl: shopToEdit?.googleMapsUrl || '',
    photoUrl: shopToEdit?.photoUrl || '',
    instructions: shopToEdit?.instructions || '',
    notes: shopToEdit?.notes || '',
    preferredDeliveryDate: shopToEdit?.preferredDeliveryDate || 1,
    isActive: shopToEdit?.isActive ?? true
  });

  const [geoLocating, setGeoLocating] = useState(false);
  const [geoMsg, setGeoMsg] = useState<string | null>(null);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoMsg('Geolocation is not supported by your browser');
      return;
    }
    setGeoLocating(true);
    setGeoMsg(null);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = Math.round(pos.coords.latitude * 10000) / 10000;
        const lng = Math.round(pos.coords.longitude * 10000) / 10000;
        setFormData(prev => ({
          ...prev,
          lat,
          lng,
          googleMapsUrl: `https://maps.google.com/?q=${lat},${lng}`
        }));
        setGeoLocating(false);
        setGeoMsg(`GPS captured: ${lat}, ${lng}`);
      },
      err => {
        setGeoLocating(false);
        setGeoMsg(`GPS error: ${err.message}. Using default coordinates.`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const mapsUrl = formData.googleMapsUrl || `https://maps.google.com/?q=${formData.lat},${formData.lng}`;

    if (shopToEdit) {
      updateShop(shopToEdit.id, {
        ...formData,
        googleMapsUrl: mapsUrl
      });
    } else {
      addShop({
        ...formData,
        googleMapsUrl: mapsUrl
      });
    }

    refreshData();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div 
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-emerald-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <Store className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                {shopToEdit ? 'Edit Shop Profile' : 'Register New Shop / Kirana'}
              </h3>
              <p className="text-xs text-emerald-200">
                {shopToEdit ? 'Update store and GPS information' : 'Add to your monthly chocolate distribution network'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Shop Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Shop Name *
              </label>
              <div className="relative">
                <Store className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Kirana & General Store"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Owner Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Owner's Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Patel"
                  value={formData.ownerName}
                  onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Mobile / WhatsApp Number *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9845012345"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Full Address */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Full Physical Address *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. #45, 8th Main, 4th Block, Near Metro Station"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Locality / Area */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Area / Locality *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Banjara Hills, Mehdipatnam"
                value={formData.locality}
                onChange={e => setFormData({ ...formData, locality: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                City *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Hyderabad"
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Preferred Delivery Date in 1st - 5th cycle */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Preferred Delivery Date (1st – 5th)
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <select
                  value={formData.preferredDeliveryDate}
                  onChange={e => setFormData({ ...formData, preferredDeliveryDate: parseInt(e.target.value) || 1 })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value={1}>1st of Month (Day 1)</option>
                  <option value={2}>2nd of Month (Day 2)</option>
                  <option value={3}>3rd of Month (Day 3)</option>
                  <option value={4}>4th of Month (Day 4)</option>
                  <option value={5}>5th of Month (Day 5)</option>
                </select>
              </div>
            </div>

            {/* Shop Photograph URL */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Shop Photograph URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://example.com/shop.jpg"
                value={formData.photoUrl}
                onChange={e => setFormData({ ...formData, photoUrl: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* GPS Coordinates Section */}
            <div className="sm:col-span-2 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    GPS Coordinates & Maps Location
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Used for interactive map routing and navigation
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={geoLocating}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold transition disabled:opacity-50"
                >
                  <Compass className={`w-3.5 h-3.5 ${geoLocating ? 'animate-spin' : ''}`} />
                  <span>{geoLocating ? 'Detecting...' : 'Use Current GPS'}</span>
                </button>
              </div>

              {geoMsg && (
                <p className="text-xs text-emerald-700 font-medium">{geoMsg}</p>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.lat}
                    onChange={e => setFormData({ ...formData, lat: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.lng}
                    onChange={e => setFormData({ ...formData, lng: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Instructions */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Special Delivery Instructions (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Unload at back lane, deliver before 11 AM before rush hour"
                value={formData.instructions}
                onChange={e => setFormData({ ...formData, instructions: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Notes */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Internal Business Notes (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Pays via UPI on delivery, high volume customer"
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-slate-200 font-bold text-sm text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-lg shadow-emerald-900/20 active:scale-98 transition flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{shopToEdit ? 'Save Changes' : 'Register Shop'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
