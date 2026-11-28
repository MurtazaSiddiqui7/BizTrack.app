import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Check, 
  Plus, 
  Minus, 
  Trash2, 
  Package, 
  Boxes,
  Copy
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Shop } from '../../types';

interface AssignFlavoursModalProps {
  shop: Shop;
  onClose: () => void;
}

export const AssignFlavoursModal: React.FC<AssignFlavoursModalProps> = ({ shop, onClose }) => {
  const { 
    currentPlan, 
    products, 
    assignments, 
    setShopAssignments, 
    shops, 
    summaries, 
    refreshData 
  } = useApp();

  // Find existing assignments for this shop
  const existingForShop = assignments.filter(a => a.shopId === shop.id && a.planId === currentPlan.id);

  // Map of productId -> assignedBoxes
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [templateShopId, setTemplateShopId] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const init: Record<string, number> = {};
    existingForShop.forEach(a => {
      init[a.productId] = a.assignedBoxes;
    });
    setQuantities(init);
  }, [shop.id]);

  const handleQtyChange = (productId: string, val: number) => {
    const qty = Math.max(0, val);
    setQuantities(prev => {
      const next = { ...prev };
      if (qty === 0) {
        delete next[productId];
      } else {
        next[productId] = qty;
      }
      return next;
    });
  };

  const handleCopyTemplate = (sourceShopId: string) => {
    if (!sourceShopId) return;
    const sourceAssignments = assignments.filter(a => a.shopId === sourceShopId && a.planId === currentPlan.id);
    const copied: Record<string, number> = {};
    sourceAssignments.forEach(a => {
      copied[a.productId] = a.assignedBoxes;
    });
    setQuantities(copied);
  };

  const totalAssignedBoxes = Object.values(quantities).reduce((acc, qty) => acc + (qty || 0), 0);
  const totalAssignedFlavours = Object.keys(quantities).length;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const items = Object.entries(quantities).map(([productId, assignedBoxes]) => ({
      productId,
      assignedBoxes: Number(assignedBoxes) || 0
    }));

    setShopAssignments(shop.id, items);
    refreshData();
    setSaveSuccess(true);
    setTimeout(() => {
      onClose();
    }, 600);
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
              <Boxes className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-base font-bold">Assign Chocolate Flavours</h3>
              <p className="text-xs text-emerald-200">
                {shop.name} • {shop.locality}
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
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Shop & Template Copy Bar */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Target Outlet</p>
              <h4 className="text-sm font-bold text-slate-900 truncate">{shop.name}</h4>
              <p className="text-xs text-slate-500 truncate">Owner: {shop.ownerName}</p>
            </div>

            {/* Copy from another shop shortcut */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={templateShopId}
                onChange={e => {
                  setTemplateShopId(e.target.value);
                  handleCopyTemplate(e.target.value);
                }}
                className="text-xs py-1.5 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-auto max-w-full"
              >
                <option value="">Copy quota from another shop...</option>
                {shops
                  .filter(s => s.id !== shop.id)
                  .map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.locality})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Product Flavour List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Catalogue Flavours & Box Quantities
              </label>
              <span className="text-xs text-slate-500 font-medium">
                {products.length} flavours available
              </span>
            </div>

            {products.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500">
                <p className="text-sm font-medium">No chocolate flavours created yet.</p>
                <p className="text-xs mt-1">Add flavours in the Inventory section first.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {products.map(prod => {
                  const currentQty = quantities[prod.id] || 0;
                  const isAssigned = currentQty > 0;

                  return (
                    <div
                      key={prod.id}
                      className={`p-3.5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isAssigned
                          ? 'bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-500/20'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 flex-shrink-0">
                            {prod.brandName}
                          </span>
                          <h5 className="text-sm font-bold text-slate-900 truncate">
                            {prod.flavourName}
                          </h5>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          {prod.boxDescription || 'Standard box packaging'}
                        </p>
                      </div>

                      {/* Stepper controls */}
                      <div className="flex items-center justify-end gap-2 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleQtyChange(prod.id, currentQty - 1)}
                          disabled={currentQty <= 0}
                          className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-30 flex items-center justify-center text-slate-700 transition"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>

                        <input
                          type="number"
                          min="0"
                          max="999"
                          value={currentQty}
                          onChange={e => handleQtyChange(prod.id, parseInt(e.target.value) || 0)}
                          className={`w-14 py-1.5 px-2 text-center rounded-xl border text-sm font-extrabold focus:outline-none ${
                            isAssigned
                              ? 'border-emerald-500 bg-white text-emerald-950 ring-1 ring-emerald-500'
                              : 'border-slate-200 text-slate-400'
                          }`}
                        />

                        <button
                          type="button"
                          onClick={() => handleQtyChange(prod.id, currentQty + 1)}
                          className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>

                        {isAssigned && (
                          <button
                            type="button"
                            onClick={() => handleQtyChange(prod.id, 0)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 transition ml-1"
                            title="Remove this flavour"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quota Summary Footer */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-emerald-100/60 border border-emerald-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-emerald-800 font-medium">Assigned to this shop:</p>
                <p className="text-base font-extrabold text-emerald-950">
                  {totalAssignedBoxes} Boxes across {totalAssignedFlavours} Flavours
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-200 text-emerald-800">
              {currentPlan.month}/{currentPlan.year} Plan
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-slate-200 font-bold text-sm text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 py-3 rounded-2xl font-bold text-sm text-white shadow-lg shadow-emerald-900/20 active:scale-98 transition flex items-center justify-center gap-2 ${
                saveSuccess ? 'bg-emerald-600' : 'bg-emerald-700 hover:bg-emerald-800'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{saveSuccess ? 'Assignments Saved!' : 'Save Monthly Quota'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
