import React from 'react';
import {
  FileSpreadsheet,
  FileText,
  Download,
  Store,
  Boxes,
  Truck,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ExportService } from '../services/exportService';

export const ReportsView: React.FC = () => {
  const { currentPlan, profile, summaries, stats, products, inventory } = useApp();

  const handleMonthlyPDF = () => {
    ExportService.exportMonthlyDistributionPDF({
      plan: currentPlan,
      profile,
      summaries,
      stats
    });
  };

  const handleMonthlyExcel = () => {
    ExportService.exportMonthlyDistributionExcel({
      plan: currentPlan,
      summaries
    });
  };

  const handleInventoryExcel = () => {
    ExportService.exportInventoryExcel(products, inventory);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 w-full min-w-0 overflow-x-hidden">
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <span>Official Reports & Data Exports</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
            Print & Export Hub
          </span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Generate clean, professional printable PDF documents and spreadsheet files for accounting and audits
        </p>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PDF Reports Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">PDF Print Documents</h3>
              <p className="text-xs text-slate-400">High-resolution formatted printable PDFs</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 transition flex items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-slate-900">Monthly Distribution Master Report</h4>
                <p className="text-[11px] text-slate-500">
                  Full list of kiranas, assigned vs delivered boxes, and official completion summary
                </p>
              </div>
              <button
                onClick={handleMonthlyPDF}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm transition flex-shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 transition flex items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-slate-900">Pending Outlets Checklist</h4>
                <p className="text-[11px] text-slate-500">
                  Driver distribution run sheet with only pending and partial shops
                </p>
              </div>
              <button
                onClick={handleMonthlyPDF}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm transition flex-shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Excel Reports Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Excel / Spreadsheet Exports</h3>
              <p className="text-xs text-slate-400">Structured XLSX files compatible with Microsoft Excel & Google Sheets</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="p-4 rounded-2xl border border-slate-200 hover:border-blue-300 transition flex items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-slate-900">Monthly Distribution Details (XLSX)</h4>
                <p className="text-[11px] text-slate-500">
                  Full raw table with owner phone, locality, assigned, delivered and remaining counts
                </p>
              </div>
              <button
                onClick={handleMonthlyExcel}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-sm transition flex-shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Excel</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 hover:border-blue-300 transition flex items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-slate-900">Warehouse Inventory & Stock Valuation (XLSX)</h4>
                <p className="text-[11px] text-slate-500">
                  Stock counts, reorder thresholds, unit purchase costs and total inventory valuation
                </p>
              </div>
              <button
                onClick={handleInventoryExcel}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-sm transition flex-shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Excel</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

