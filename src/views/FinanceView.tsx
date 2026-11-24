import React, { useState } from 'react';
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Fuel,
  Receipt,
  CreditCard,
  Building,
  CheckCircle2,
  Calendar,
  Share2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generatePaymentReminderWhatsApp, openWhatsAppChat } from '../services/whatsappService';

export const FinanceView: React.FC = () => {
  const {
    payments,
    addPayment,
    expenses,
    addExpense,
    shops,
    profile,
    currentPlan,
    refreshData
  } = useApp();

  const [activeTab, setActiveTab] = useState<'payments' | 'expenses'>('payments');
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);

  // Form states
  const [paymentForm, setPaymentForm] = useState({
    shopId: shops[0]?.id || '',
    invoiceAmount: 15000,
    amountReceived: 10000,
    paymentMethod: 'upi' as const,
    notes: ''
  });

  const [expenseForm, setExpenseForm] = useState({
    category: 'fuel' as const,
    amount: 500,
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  // Financial aggregates
  const totalInvoiced = payments.reduce((sum, p) => sum + p.invoiceAmount, 0);
  const totalCollected = payments.reduce((sum, p) => sum + p.amountReceived, 0);
  const totalOutstanding = payments.reduce((sum, p) => sum + p.outstandingAmount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netSurplus = totalCollected - totalExpenses;

  const handleCreatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    const invoice = Number(paymentForm.invoiceAmount) || 0;
    const received = Number(paymentForm.amountReceived) || 0;
    const outstanding = Math.max(0, invoice - received);

    addPayment({
      shopId: paymentForm.shopId,
      planId: currentPlan.id,
      invoiceAmount: invoice,
      amountReceived: received,
      outstandingAmount: outstanding,
      paymentDate: new Date().toISOString(),
      paymentMethod: paymentForm.paymentMethod,
      notes: paymentForm.notes
    });

    refreshData();
    setShowAddPaymentModal(false);
  };

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    addExpense({
      category: expenseForm.category,
      amount: Number(expenseForm.amount) || 0,
      date: expenseForm.date,
      description: expenseForm.description
    });

    refreshData();
    setShowAddExpenseModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Payments & Delivery Expenses</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              Cashflow Manager
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track shop billing collections, UPI receipts, fuel expenses, and net distribution profits
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowAddExpenseModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-sm transition"
          >
            <Fuel className="w-4 h-4 text-amber-600" />
            <span>Record Expense</span>
          </button>

          <button
            onClick={() => setShowAddPaymentModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md shadow-emerald-900/10 active:scale-95 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold">Total Collections</p>
          <p className="text-2xl font-black text-emerald-700 mt-1">
            {profile.currency}{totalCollected.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Cash & UPI received</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold">Outstanding Dues</p>
          <p className="text-2xl font-black text-rose-600 mt-1">
            {profile.currency}{totalOutstanding.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-rose-700 mt-0.5">Pending collection from shops</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold">Distribution Expenses</p>
          <p className="text-2xl font-black text-amber-600 mt-1">
            {profile.currency}{totalExpenses.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Fuel, vehicle & snacks</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold">Net Cash Surplus</p>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {profile.currency}{netSurplus.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Collected minus expenses</p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'payments'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Shop Invoices & Payments ({payments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'expenses'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Fuel className="w-4 h-4" />
          <span>Trip & Delivery Expenses ({expenses.length})</span>
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
        {activeTab === 'payments' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 font-bold">Shop</th>
                  <th className="py-2.5 font-bold">Date</th>
                  <th className="py-2.5 text-right font-bold">Invoice (₹)</th>
                  <th className="py-2.5 text-right font-bold">Received (₹)</th>
                  <th className="py-2.5 text-right font-bold">Balance (₹)</th>
                  <th className="py-2.5 font-bold">Method</th>
                  <th className="py-2.5 text-right font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                      No payments recorded yet.
                    </td>
                  </tr>
                ) : (
                  payments.map(p => {
                    const shop = shops.find(s => s.id === p.shopId);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 font-bold text-slate-900">
                          {shop ? shop.name : p.shopId}
                          <span className="block text-[11px] text-slate-400 font-normal">
                            {shop ? shop.locality : ''}
                          </span>
                        </td>
                        <td className="py-3 text-slate-500 whitespace-nowrap">
                          {new Date(p.paymentDate).toLocaleDateString('en-IN')}
                        </td>
                        <td className="py-3 text-right font-semibold text-slate-700">
                          {profile.currency}{p.invoiceAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 text-right font-bold text-emerald-700">
                          {profile.currency}{p.amountReceived.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 text-right font-black">
                          {p.outstandingAmount > 0 ? (
                            <span className="text-rose-600">
                              {profile.currency}{p.outstandingAmount.toLocaleString('en-IN')}
                            </span>
                          ) : (
                            <span className="text-emerald-600 text-xs">Settled</span>
                          )}
                        </td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                            {p.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          {p.outstandingAmount > 0 && shop && (
                            <button
                              onClick={() => {
                                const text = generatePaymentReminderWhatsApp(
                                  shop.name,
                                  shop.ownerName,
                                  p.outstandingAmount,
                                  profile
                                );
                                openWhatsAppChat(shop.phone, text);
                              }}
                              className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[11px] font-bold inline-flex items-center gap-1 transition"
                            >
                              <Share2 className="w-3 h-3" />
                              <span>Remind</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 font-bold">Date</th>
                  <th className="py-2.5 font-bold">Category</th>
                  <th className="py-2.5 font-bold">Description</th>
                  <th className="py-2.5 text-right font-bold">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400 italic">
                      No expenses recorded yet.
                    </td>
                  </tr>
                ) : (
                  expenses.map(e => (
                    <tr key={e.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 text-slate-500 whitespace-nowrap">{e.date}</td>
                      <td className="py-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
                          {e.category}
                        </span>
                      </td>
                      <td className="py-3 text-slate-800 font-medium">{e.description}</td>
                      <td className="py-3 text-right font-black text-slate-900">
                        {profile.currency}{e.amount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {showAddPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <h4 className="text-base font-bold text-slate-900">Record Shop Payment</h4>
            <form onSubmit={handleCreatePayment} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Select Shop</label>
                <select
                  value={paymentForm.shopId}
                  onChange={e => setPaymentForm({ ...paymentForm, shopId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                >
                  {shops.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.locality})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Invoice Total (₹)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={paymentForm.invoiceAmount}
                  onChange={e => setPaymentForm({ ...paymentForm, invoiceAmount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Amount Received (₹)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={paymentForm.amountReceived}
                  onChange={e => setPaymentForm({ ...paymentForm, amountReceived: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-emerald-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Payment Method</label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={e => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                >
                  <option value="upi">UPI (Google Pay / PhonePe / Paytm)</option>
                  <option value="cash">Cash</option>
                  <option value="cheque">Cheque</option>
                  <option value="bank_transfer">Bank Transfer / NEFT</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Notes / Transaction Ref</label>
                <input
                  type="text"
                  placeholder="e.g. GPay UPI Ref #8271819"
                  value={paymentForm.notes}
                  onChange={e => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPaymentModal(false)}
                  className="py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800"
                >
                  Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Expense Modal */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <h4 className="text-base font-bold text-slate-900">Record Delivery Expense</h4>
            <form onSubmit={handleCreateExpense} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Expense Category</label>
                <select
                  value={expenseForm.category}
                  onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                >
                  <option value="fuel">Fuel / Diesel</option>
                  <option value="vehicle">Vehicle Maintenance / Puncture</option>
                  <option value="packaging">Packaging Tape & Boxes</option>
                  <option value="food">Tea & Helper Snacks</option>
                  <option value="miscellaneous">Miscellaneous</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={expenseForm.amount}
                  onChange={e => setExpenseForm({ ...expenseForm, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-rose-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={expenseForm.date}
                  onChange={e => setExpenseForm({ ...expenseForm, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Description / Bill Memo</label>
                <input
                  type="text"
                  placeholder="e.g. Petrol pump receipt #441"
                  value={expenseForm.description}
                  onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
                  className="py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
