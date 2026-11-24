import React, { useState, useMemo } from 'react';
import {
  Boxes,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  RefreshCw,
  Edit2,
  Trash2,
  FileSpreadsheet,
  ArrowUpRight,
  ArrowDownRight,
  History,
  Tag
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ChocolateProduct } from '../types';
import { ExportService } from '../services/exportService';
import { storage } from '../services/storage';

interface InventoryViewProps {
  onOpenAddProduct: () => void;
  onEditProduct: (product: ChocolateProduct) => void;
  onAdjustStock: (product: ChocolateProduct) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  onOpenAddProduct,
  onEditProduct,
  onAdjustStock
}) => {
  const { products, inventory, deleteProduct, profile } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [productToDelete, setProductToDelete] = useState<ChocolateProduct | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const invTransactions = useMemo(() => storage.getInventoryTransactions(), [inventory]);

  // Extract unique brands
  const brands = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => {
      if (p.brandName) set.add(p.brandName);
    });
    return Array.from(set).sort();
  }, [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch =
        p.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.flavourName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.internalCode && p.internalCode.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesBrand = selectedBrand === 'all' || p.brandName === selectedBrand;
      return matchesSearch && matchesBrand;
    });
  }, [products, searchQuery, selectedBrand]);

  const totalBoxesInWarehouse = inventory.reduce((sum, i) => sum + i.availableBoxes, 0);
  const lowStockProductsCount = inventory.filter(i => i.availableBoxes <= i.lowStockThreshold).length;

  const handleExportInventory = () => {
    ExportService.exportInventoryExcel(products, inventory);
  };

  const handleDeleteConfirm = () => {
    if (productToDelete) {
      deleteProduct(productToDelete.id);
      setProductToDelete(null);
    }
  };

  const unit = profile.unitName || 'Boxes';
  const itemType = profile.itemTypeName || 'Flavours';
  const category = profile.businessCategory || 'Product';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>{category} & Warehouse Inventory</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              {products.length} {itemType}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time {unit.toLowerCase()} stock tracking. Confirmed deliveries automatically deduct from stock.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-sm transition"
          >
            <History className="w-4 h-4 text-slate-500" />
            <span>{showHistory ? 'Show Products' : 'Stock Audit Log'}</span>
          </button>

          <button
            onClick={handleExportInventory}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-sm transition"
            title="Download Excel Inventory"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span className="hidden sm:inline">Export Excel</span>
          </button>

          <button
            onClick={onOpenAddProduct}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-900/10 active:scale-95 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add {itemType.split(' ')[0]}</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Total {unit} in Warehouse</p>
            <h4 className="text-2xl font-black text-slate-900 mt-1">{totalBoxesInWarehouse}</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Across all brands</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Boxes className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Low Stock Warnings</p>
            <h4 className={`text-2xl font-black mt-1 ${lowStockProductsCount > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
              {lowStockProductsCount}
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Below reorder threshold</p>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
            lowStockProductsCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
          }`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Distinct Brands</p>
            <h4 className="text-2xl font-black text-slate-900 mt-1">{brands.length}</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Cadbury, Nestlé, Amul...</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Tag className="w-6 h-6" />
          </div>
        </div>
      </div>

      {showHistory ? (
        /* Stock Movement Audit Log */
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-700" />
              <h3 className="text-base font-bold text-slate-900">Inventory Movement & Audit History</h3>
            </div>
            <button
              onClick={() => setShowHistory(false)}
              className="text-xs text-emerald-700 font-bold hover:underline"
            >
              Back to Flavours Grid
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 font-bold">Date & Time</th>
                  <th className="py-2.5 font-bold">Product</th>
                  <th className="py-2.5 font-bold">Type</th>
                  <th className="py-2.5 text-center font-bold">Quantity Change</th>
                  <th className="py-2.5 text-center font-bold">Stock After</th>
                  <th className="py-2.5 font-bold">Reason / Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400 italic">
                      No stock movement logged yet.
                    </td>
                  </tr>
                ) : (
                  invTransactions.slice(0, 50).map(tx => {
                    const prod = products.find(p => p.id === tx.productId);
                    const isDeduction = tx.quantityChange < 0;

                    return (
                      <tr key={tx.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 text-slate-500 whitespace-nowrap">
                          {new Date(tx.timestamp).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="py-3 font-bold text-slate-800">
                          {prod ? `${prod.brandName} ${prod.flavourName}` : tx.productId}
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isDeduction
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {tx.type.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className={`py-3 text-center font-black ${isDeduction ? 'text-rose-600' : 'text-emerald-700'}`}>
                          {tx.quantityChange > 0 ? `+${tx.quantityChange}` : tx.quantityChange} Boxes
                        </td>
                        <td className="py-3 text-center font-bold text-slate-900">
                          {tx.balanceAfter}
                        </td>
                        <td className="py-3 text-slate-600 text-xs">
                          {tx.notes}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Flavours Catalogue & Stock Cards */
        <>
          {/* Search & Brand Filter */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search flavour, brand, or code..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setSelectedBrand('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex-shrink-0 ${
                  selectedBrand === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                All Brands ({products.length})
              </button>
              {brands.map(brand => (
                <button
                  key={brand}
                  onClick={() => setSelectedBrand(brand)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex-shrink-0 ${
                    selectedBrand === brand ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>

          {/* Flavour Cards Grid */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200">
              <Boxes className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-700">No Chocolate Flavours Found</h4>
              <p className="text-xs text-slate-400 mt-1">
                Click "Add Flavour" above to create and manage custom chocolates.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProducts.map(product => {
                const inv = inventory.find(i => i.productId === product.id);
                const stock = inv ? inv.availableBoxes : 0;
                const threshold = inv ? inv.lowStockThreshold : 20;
                const isLowStock = stock <= threshold;
                const isOutOfStock = stock === 0;

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-card-hover transition-all duration-200 p-5 flex flex-col justify-between group"
                  >
                    <div>
                      {/* Brand & Stock Status Badge */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {product.photoUrl ? (
                            <img
                              src={product.photoUrl}
                              alt={product.flavourName}
                              className="w-12 h-12 rounded-2xl object-cover border border-slate-100 shadow-sm"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold text-lg border border-amber-100">
                              🍫
                            </div>
                          )}
                          <div>
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 uppercase tracking-wider">
                              {product.brandName}
                            </span>
                            <h4 className="text-sm font-bold text-slate-900 mt-0.5 group-hover:text-emerald-700 transition">
                              {product.flavourName}
                            </h4>
                          </div>
                        </div>

                        {/* Low stock badge */}
                        {isOutOfStock ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black uppercase tracking-wider">
                            Out of Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Low Stock
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            In Stock
                          </span>
                        )}
                      </div>

                      {/* Box description */}
                      <p className="text-xs text-slate-500 mt-3">
                        {product.boxDescription || 'Standard box packaging'}
                      </p>

                      {/* Stock Counter Display */}
                      <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <div>
                          <p className="text-[11px] text-slate-400 font-medium">Available in Warehouse</p>
                          <h5 className={`text-2xl font-black mt-0.5 ${
                            isOutOfStock ? 'text-rose-600' : isLowStock ? 'text-amber-600' : 'text-slate-900'
                          }`}>
                            {stock} <span className="text-xs font-semibold text-slate-500">Boxes</span>
                          </h5>
                        </div>
                        <div className="text-right text-[11px] text-slate-400">
                          <p>Threshold: <strong>{threshold}</strong></p>
                          {product.unitCost > 0 && (
                            <p className="text-slate-500 mt-0.5">Cost: {profile.currency}{product.unitCost}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onEditProduct(product)}
                          className="p-2 rounded-xl text-slate-400 hover:text-blue-700 hover:bg-blue-50 transition"
                          title="Edit Flavour Information"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setProductToDelete(product)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-700 hover:bg-rose-50 transition"
                          title="Delete / Discontinue Flavour"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => onAdjustStock(product)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Restock / Adjust</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h4 className="text-base font-bold text-slate-900">Discontinue Flavour?</h4>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove <strong>{productToDelete.brandName} {productToDelete.flavourName}</strong>? Past delivery records will be preserved.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setProductToDelete(null)}
                className="py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="py-2.5 rounded-xl bg-rose-600 text-xs font-bold text-white hover:bg-rose-700 transition"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
