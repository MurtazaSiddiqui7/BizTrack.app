import React, { useState } from 'react';
import { 
  X, 
  Package, 
  Tag, 
  Boxes, 
  Check, 
  DollarSign, 
  Image as ImageIcon 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ChocolateProduct } from '../../types';

interface AddProductModalProps {
  productToEdit?: ChocolateProduct | null;
  onClose: () => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({ productToEdit, onClose }) => {
  const { addProduct, updateProduct, inventory, refreshData } = useApp();

  const existingInv = productToEdit ? inventory.find(i => i.productId === productToEdit.id) : null;

  const [formData, setFormData] = useState({
    brandName: productToEdit?.brandName || '',
    flavourName: productToEdit?.flavourName || '',
    boxDescription: productToEdit?.boxDescription || '24 units per box',
    internalCode: productToEdit?.internalCode || '',
    unitCost: productToEdit?.unitCost || 500,
    unitPrice: productToEdit?.unitPrice || 600,
    notes: productToEdit?.notes || '',
    photoUrl: productToEdit?.photoUrl || '',
    initialBoxes: existingInv?.availableBoxes || 100,
    lowStockThreshold: existingInv?.lowStockThreshold || 20
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (productToEdit) {
      updateProduct(productToEdit.id, {
        brandName: formData.brandName,
        flavourName: formData.flavourName,
        boxDescription: formData.boxDescription,
        internalCode: formData.internalCode,
        unitCost: Number(formData.unitCost) || 0,
        unitPrice: Number(formData.unitPrice) || 0,
        notes: formData.notes,
        photoUrl: formData.photoUrl
      });
    } else {
      addProduct(
        {
          brandName: formData.brandName,
          flavourName: formData.flavourName,
          boxDescription: formData.boxDescription,
          internalCode: formData.internalCode,
          unitCost: Number(formData.unitCost) || 0,
          unitPrice: Number(formData.unitPrice) || 0,
          notes: formData.notes,
          photoUrl: formData.photoUrl
        },
        Number(formData.initialBoxes) || 0,
        Number(formData.lowStockThreshold) || 20
      );
    }

    refreshData();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div 
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-emerald-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <Package className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                {productToEdit ? 'Edit Chocolate Flavour' : 'Create New Chocolate Flavour'}
              </h3>
              <p className="text-xs text-emerald-200">
                Custom brand and flavour added to your distribution catalogue
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
            {/* Brand Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Brand Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Cadbury, Nestlé, Amul, Ferrero"
                value={formData.brandName}
                onChange={e => setFormData({ ...formData, brandName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Flavour / Product Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Flavour / Variety *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Dairy Milk Silk (60g), KitKat 4-Finger"
                value={formData.flavourName}
                onChange={e => setFormData({ ...formData, flavourName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Packaging / Box description */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Box Packaging Description *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 24 bars per display box (45g each)"
                value={formData.boxDescription}
                onChange={e => setFormData({ ...formData, boxDescription: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Initial Stock (Only on creation) */}
            {!productToEdit && (
              <>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Starting Stock (Boxes) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.initialBoxes}
                    onChange={e => setFormData({ ...formData, initialBoxes: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Low Stock Alert Threshold
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.lowStockThreshold}
                    onChange={e => setFormData({ ...formData, lowStockThreshold: parseInt(e.target.value) || 20 })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </>
            )}

            {/* Unit Purchase Cost & Selling Price */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Purchase Cost per Box (₹)
              </label>
              <input
                type="number"
                min="0"
                value={formData.unitCost}
                onChange={e => setFormData({ ...formData, unitCost: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Selling Price per Box (₹)
              </label>
              <input
                type="number"
                min="0"
                value={formData.unitPrice}
                onChange={e => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Product Internal Code */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Internal SKU / Code (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. CAD-DMS-60"
                value={formData.internalCode}
                onChange={e => setFormData({ ...formData, internalCode: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm uppercase font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Product Photograph URL */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Photo URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://example.com/product.jpg"
                value={formData.photoUrl}
                onChange={e => setFormData({ ...formData, photoUrl: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Notes */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Notes & Description (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Very fast moving item in summer"
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
              <span>{productToEdit ? 'Save Changes' : 'Add Flavour'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
