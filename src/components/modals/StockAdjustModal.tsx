import React, { useState } from 'react';
import { 
  X, 
  Boxes, 
  PlusCircle, 
  MinusCircle, 
  RefreshCw, 
  Check, 
  FileText 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ChocolateProduct } from '../../types';

interface StockAdjustModalProps {
  product: ChocolateProduct;
  onClose: () => void;
}

export const StockAdjustModal: React.FC<StockAdjustModalProps> = ({ product, onClose }) => {
  const { inventory, updateStock, refreshData } = useApp();

  const inv = inventory.find(i => i.productId === product.id);
  const currentBoxes = inv ? inv.availableBoxes : 0;

  const [actionType, setActionType] = useState<'purchase_add' | 'adjustment' | 'return'>('purchase_add');
  const [boxQuantity, setBoxQuantity] = useState<number>(50);
  const [notes, setNotes] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (boxQuantity <= 0) return;

    const change = actionType === 'adjustment' && notes.includes('damage') ? -boxQuantity : boxQuantity;
    updateStock(
      product.id,
      change,
      actionType,
      notes || `Stock ${actionType === 'purchase_add' ? 'Purchase Received' : actionType}`
    );

    refreshData();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div 
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-emerald-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <Boxes className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-base font-bold">Update Flavour Stock</h3>
              <p className="text-xs text-emerald-200">
                {product.brandName} {product.flavourName}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Current balance card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Current Warehouse Stock:</p>
              <h4 className="text-xl font-extrabold text-slate-900">{currentBoxes} Boxes</h4>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              {product.brandName}
            </span>
          </div>

          {/* Action Type */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Stock Movement Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setActionType('purchase_add')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 ${
                  actionType === 'purchase_add'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>Purchase Stock</span>
              </button>

              <button
                type="button"
                onClick={() => setActionType('adjustment')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 ${
                  actionType === 'adjustment'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <RefreshCw className="w-4 h-4" />
                <span>Adjustment</span>
              </button>

              <button
                type="button"
                onClick={() => setActionType('return')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 ${
                  actionType === 'return'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <MinusCircle className="w-4 h-4" />
                <span>Customer Return</span>
              </button>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Number of Boxes to Add *
            </label>
            <input
              type="number"
              min="1"
              required
              value={boxQuantity}
              onChange={e => setBoxQuantity(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-base font-extrabold text-emerald-950 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Notes / Vendor Bill */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Reason / Invoice / PO Details
            </label>
            <input
              type="text"
              placeholder="e.g. Invoice #CAD-8849 from Distributor"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-3">
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
              <span>Update Stock</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
