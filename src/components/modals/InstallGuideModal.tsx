import React from 'react';
import { X, Download, MoreVertical, Share, Smartphone, CheckCircle2 } from 'lucide-react';

interface InstallGuideModalProps {
  onClose: () => void;
}

export const InstallGuideModal: React.FC<InstallGuideModalProps> = ({ onClose }) => {
  const isIOS =
    typeof navigator !== 'undefined' &&
    /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-800 to-emerald-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src="/icons/icon-192x192.png"
              alt="BizTrack"
              className="w-10 h-10 rounded-xl bg-white p-0.5 flex-shrink-0"
            />
            <div className="min-w-0">
              <h3 className="text-base font-bold truncate">Install BizTrack App</h3>
              <p className="text-xs text-emerald-200 truncate">
                Full-screen app experience on your phone
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5">
            <Smartphone className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-900 leading-relaxed">
              The automatic install prompt is not active in this browser session yet. You can install BizTrack directly from your browser menu in 2 quick steps:
            </p>
          </div>

          {isIOS ? (
            <ol className="space-y-3 text-xs text-slate-700">
              <li className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="w-5 h-5 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center flex-shrink-0">1</span>
                <span>
                  Tap the <strong className="inline-flex items-center gap-1"><Share className="w-3.5 h-3.5" /> Share</strong> button at the bottom of Safari.
                </span>
              </li>
              <li className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="w-5 h-5 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center flex-shrink-0">2</span>
                <span>
                  Scroll down and tap <strong>Add to Home Screen</strong>, then tap <strong>Add</strong>.
                </span>
              </li>
            </ol>
          ) : (
            <ol className="space-y-3 text-xs text-slate-700">
              <li className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="w-5 h-5 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center flex-shrink-0">1</span>
                <span>
                  Tap the <strong className="inline-flex items-center gap-0.5"><MoreVertical className="w-3.5 h-3.5" /> 3-dot menu</strong> in the top-right corner of Chrome.
                </span>
              </li>
              <li className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="w-5 h-5 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center flex-shrink-0">2</span>
                <span>
                  Tap <strong className="inline-flex items-center gap-1"><Download className="w-3.5 h-3.5 text-emerald-700" /> Install app</strong> (or <strong>Add to Home screen → Install</strong>).
                </span>
              </li>
              <li className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="w-5 h-5 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center flex-shrink-0">3</span>
                <span>
                  Tap <strong>Install</strong> to add BizTrack to your app drawer and launch it full-screen without the Chrome bar.
                </span>
              </li>
            </ol>
          )}

          <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Make sure you are using Google Chrome on Android (not an in-app browser).</span>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
