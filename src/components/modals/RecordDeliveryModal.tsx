import React, { useState, useEffect } from 'react';
import { 
  X, 
  Package, 
  CheckCircle2, 
  AlertTriangle, 
  Truck, 
  Plus, 
  Minus, 
  Share2, 
  FileText,
  Clock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Shop, ShopDistributionSummary } from '../../types';
import { ExportService } from '../../services/exportService';
import { generateDeliveryReceiptWhatsApp, openWhatsAppChat } from '../../services/whatsappService';

interface RecordDeliveryModalProps {
  shop: Shop | null;
  onClose: () => void;
}

export const RecordDeliveryModal: React.FC<RecordDeliveryModalProps> = ({ shop, onClose }) => {
  const { 
    currentPlan, 
    summaries, 
    products, 
    inventory, 
    recordDelivery, 
    profile, 
    refreshData 
  } = useApp();

  const [selectedShopId, setSelectedShopId] = useState<string>(shop ? shop.id : '');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [deliveryNotes, setDeliveryNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{ isComplete: boolean; summary: ShopDistributionSummary } | null>(null);

  // Find summary for selected shop
  const activeSummary = summaries.find(s => s.shop.id === selectedShopId);

  // Initialize quantities when shop changes
  useEffect(() => {
    if (activeSummary) {
      const initial: Record<string, number> = {};
      activeSummary.flavourDetails.forEach(f => {
        // By default suggest delivering all remaining boxes if warehouse stock permits
        const inv = inventory.find(i => i.productId === f.product.id);
        const avail = inv ? inv.availableBoxes : 0;
        const defaultQty = Math.min(f.remainingBoxes, avail);
        initial[f.product.id] = defaultQty > 0 ? defaultQty : 0;
      });
      setQuantities(initial);
      setErrorMsg(null);
      setSuccessResult(null);
    }
  }, [selectedShopId, activeSummary?.shop.id]);

  if (!shop && summaries.length === 0) return null;

  const handleQtyChange = (productId: string, val: number) => {
    const f = activeSummary?.flavourDetails.find(item => item.product.id === productId);
    const max = f ? f.remainingBoxes : 999;
    const clamped = Math.max(0, Math.min(val, max));
    setQuantities(prev => ({ ...prev, [productId]: clamped }));
    setErrorMsg(null);
  };

  const handleDeliverAll = () => {
    if (!activeSummary) return;
    const updated: Record<string, number> = {};
    activeSummary.flavourDetails.forEach(f => {
      const inv = inventory.find(i => i.productId === f.product.id);
      const avail = inv ? inv.availableBoxes : 0;
      updated[f.product.id] = Math.min(f.remainingBoxes, avail);
    });
    setQuantities(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShopId || !activeSummary) return;

    const deliveries = Object.entries(quantities).map(([productId, boxesDelivered]) => ({
      productId,
      boxesDelivered: Number(boxesDelivered) || 0
    }));

    const totalToDeliver = deliveries.reduce((acc, d) => acc + d.boxesDelivered, 0);
    if (totalToDeliver === 0) {
      setErrorMsg('Please enter at least 1 box to deliver.');
      return;
    }

    const result = recordDelivery({
      shopId: selectedShopId,
      deliveries,
      notes: deliveryNotes
    });

    if (result.success) {
      refreshData();
      // Look up updated summary
      const updatedSummary = summaries.find(s => s.shop.id === selectedShopId) || activeSummary;
      setSuccessResult({
        isComplete: result.isShopFullyCompleted,
        summary: updatedSummary
      });
    } else {
      setErrorMsg(result.errorMessage || 'Failed to record delivery');
    }
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
              <Truck className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-base font-bold">Record Chocolate Delivery</h3>
              <p className="text-xs text-emerald-200">
                {activeSummary ? activeSummary.shop.name : 'Select Kirana or Store'}
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

        {/* Success View */}
        {successResult ? (
          <div className="p-8 text-center space-y-6 overflow-y-auto">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <div>
              <h4 className="text-xl font-extrabold text-slate-900">Delivery Recorded Successfully!</h4>
              <p className="text-sm text-slate-600 mt-1">
                Inventory has been deducted and transactions recorded in the audit log.
              </p>
              {successResult.isComplete && (
                <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold">
                  🎉 All assigned flavours completed for this shop!
                </div>
              )}
            </div>

            {/* Quick Actions: WhatsApp & PDF */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  const text = generateDeliveryReceiptWhatsApp(successResult.summary, profile);
                  openWhatsAppChat(successResult.summary.shop.phone, text);
                }}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition"
              >
                <Share2 className="w-4 h-4" />
                <span>Send WhatsApp Receipt</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  ExportService.exportShopDeliverySlipPDF({
                    summary: successResult.summary,
                    profile,
                    plan: currentPlan
                  });
                }}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition border border-slate-200"
              >
                <FileText className="w-4 h-4 text-emerald-700" />
                <span>Download Delivery Slip (PDF)</span>
              </button>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition"
              >
                Done / Close
              </button>
            </div>
          </div>
        ) : (
          /* Delivery Entry Form */
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {/* Shop Selector (if not preselected) */}
            {!shop && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Select Shop
                </label>
                <select
                  value={selectedShopId}
                  onChange={e => setSelectedShopId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                >
                  <option value="">-- Choose a Shop --</option>
                  {summaries.map(s => (
                    <option key={s.shop.id} value={s.shop.id}>
                      {s.shop.name} ({s.shop.locality}) – {s.totalRemainingBoxes} boxes pending
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Error banner */}
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-xs font-medium">
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {activeSummary && (
              <>
                {/* Shop summary pill */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{activeSummary.shop.name}</h4>
                    <p className="text-xs text-slate-500">
                      Owner: {activeSummary.shop.ownerName} | Ph: {activeSummary.shop.phone}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDeliverAll}
                      className="px-3 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold transition"
                    >
                      Fill All Remaining
                    </button>
                  </div>
                </div>

                {/* Assigned Flavours Table */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Flavour Deliveries (Boxes)
                    </label>
                    <span className="text-xs text-slate-500">
                      Remaining for Shop: <strong className="text-emerald-700">{activeSummary.totalRemainingBoxes} boxes</strong>
                    </span>
                  </div>

                  {activeSummary.flavourDetails.length === 0 ? (
                    <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
                      No chocolate flavours have been assigned to this shop yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activeSummary.flavourDetails.map(item => {
                        const inv = inventory.find(i => i.productId === item.product.id);
                        const warehouseStock = inv ? inv.availableBoxes : 0;
                        const currentInput = quantities[item.product.id] || 0;
                        const isOutOfStock = warehouseStock === 0;
                        const hasInsufficientStock = currentInput > warehouseStock;

                        return (
                          <div
                            key={item.product.id}
                            className={`p-3.5 rounded-2xl border transition ${
                              item.isFlavourCompleted
                                ? 'bg-emerald-50/30 border-emerald-200'
                                : 'bg-white border-slate-200'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 flex-shrink-0">
                                    {item.product.brandName}
                                  </span>
                                  <h5 className="text-sm font-bold text-slate-900 truncate">
                                    {item.product.flavourName}
                                  </h5>
                                  {item.isFlavourCompleted && (
                                    <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold flex-shrink-0">
                                      <CheckCircle2 className="w-3.5 h-3.5" /> Done
                                    </span>
                                  )}
                                </div>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-slate-500">
                                  <span>Assigned: <strong>{item.assignedBoxes}</strong></span>
                                  <span>Delivered: <strong>{item.distributedBoxes}</strong></span>
                                  <span className="text-amber-700 font-semibold">Remaining: <strong>{item.remainingBoxes}</strong></span>
                                  <span className={`text-[11px] ${isOutOfStock ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                                    (Stock: {warehouseStock})
                                  </span>
                                </div>
                              </div>

                              {/* Stepper / Input */}
                              <div className="flex items-center justify-end gap-1.5 flex-shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleQtyChange(item.product.id, currentInput - 1)}
                                  disabled={currentInput <= 0}
                                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-30 flex items-center justify-center text-slate-700 transition"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <input
                                  type="number"
                                  min="0"
                                  max={item.remainingBoxes}
                                  value={currentInput}
                                  onChange={e => handleQtyChange(item.product.id, parseInt(e.target.value) || 0)}
                                  className={`w-14 py-1.5 px-2 text-center rounded-xl border text-sm font-bold focus:outline-none ${
                                    hasInsufficientStock
                                      ? 'border-rose-500 bg-rose-50 text-rose-700'
                                      : 'border-slate-200 focus:ring-2 focus:ring-emerald-500'
                                  }`}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleQtyChange(item.product.id, currentInput + 1)}
                                  disabled={currentInput >= item.remainingBoxes}
                                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-30 flex items-center justify-center text-slate-700 transition"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Stock warning if exceeding available warehouse stock */}
                            {hasInsufficientStock && (
                              <p className="text-[11px] text-rose-600 font-semibold mt-2 flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Insufficient warehouse inventory! Only {warehouseStock} boxes available in stock.
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Delivery Notes */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Delivery Notes / Remarks (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Received partial payment, requested balance delivery tomorrow"
                    value={deliveryNotes}
                    onChange={e => setDeliveryNotes(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Total Boxes delivering summary */}
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-emerald-700" />
                    <div>
                      <p className="text-xs text-emerald-800 font-medium">Boxes to deliver now:</p>
                      <p className="text-base font-extrabold text-emerald-950">
                        {Object.values(quantities).reduce((a, b) => a + b, 0)} boxes total
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-emerald-700 font-medium">
                    Auto-deducts from stock
                  </span>
                </div>

                {/* Submit Actions */}
                <div className="pt-2 flex items-center gap-3">
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
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Record Delivery</span>
                  </button>
                </div>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
