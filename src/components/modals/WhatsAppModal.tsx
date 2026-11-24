import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  MessageSquare, 
  Check, 
  Copy, 
  ExternalLink 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ShopDistributionSummary } from '../../types';
import {
  generateDeliveryReceiptWhatsApp,
  generateMonthlyNoticeWhatsApp,
  generatePaymentReminderWhatsApp,
  openWhatsAppChat
} from '../../services/whatsappService';

interface WhatsAppModalProps {
  summary: ShopDistributionSummary;
  onClose: () => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({ summary, onClose }) => {
  const { profile } = useApp();

  const [templateType, setTemplateType] = useState<'receipt' | 'notice' | 'payment'>('receipt');
  const [copied, setCopied] = useState(false);

  // Generate default text based on template
  const getInitialMessage = () => {
    if (templateType === 'receipt') {
      return generateDeliveryReceiptWhatsApp(summary, profile);
    } else if (templateType === 'notice') {
      return generateMonthlyNoticeWhatsApp(summary, profile);
    } else {
      return generatePaymentReminderWhatsApp(summary.shop.name, summary.shop.ownerName, 5000, profile);
    }
  };

  const [customText, setCustomText] = useState<string>(getInitialMessage());

  const handleTemplateChange = (type: 'receipt' | 'notice' | 'payment') => {
    setTemplateType(type);
    if (type === 'receipt') {
      setCustomText(generateDeliveryReceiptWhatsApp(summary, profile));
    } else if (type === 'notice') {
      setCustomText(generateMonthlyNoticeWhatsApp(summary, profile));
    } else {
      setCustomText(generatePaymentReminderWhatsApp(summary.shop.name, summary.shop.ownerName, 5000, profile));
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(customText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    openWhatsAppChat(summary.shop.phone, customText);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div 
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-emerald-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <Share2 className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-base font-bold">WhatsApp Messenger</h3>
              <p className="text-xs text-emerald-200">
                To: {summary.shop.name} ({summary.shop.phone})
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

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Template Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Select Message Template
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleTemplateChange('receipt')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                  templateType === 'receipt'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Delivery Receipt
              </button>

              <button
                type="button"
                onClick={() => handleTemplateChange('notice')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                  templateType === 'notice'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Monthly Notice
              </button>

              <button
                type="button"
                onClick={() => handleTemplateChange('payment')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                  templateType === 'payment'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Payment Reminder
              </button>
            </div>
          </div>

          {/* Editable text area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Message Preview (Editable)
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>
            </div>
            <textarea
              rows={8}
              value={customText}
              onChange={e => setCustomText(e.target.value)}
              className="w-full p-4 rounded-2xl border border-slate-200 text-xs font-mono leading-relaxed bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <p className="text-[11px] text-slate-400">
            * Note: WhatsApp will open with the shop owner's number prefilled for your review before sending.
          </p>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-slate-200 font-bold text-sm text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleOpenWhatsApp}
              className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-900/20 active:scale-98 transition flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open in WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
