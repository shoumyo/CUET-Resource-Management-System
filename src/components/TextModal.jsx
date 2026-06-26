import React from "react";

export default function TextModal({ isOpen, onClose, title, content, themeColor = "blue" }) {
  if (!isOpen) return null;

  const colorConfig = {
    blue: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-600", icon: "description" },
    purple: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-600", icon: "speaker_notes" },
    emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-600", icon: "verified" },
    red: { bg: "bg-red-50", border: "border-red-200", text: "text-red-600", icon: "error" },
    amber: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-600", icon: "note" },
  };

  const currentConfig = colorConfig[themeColor] || colorConfig.blue;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative w-full max-w-lg bg-white rounded-[24px] shadow-2xl overflow-hidden animate-pop-in border-t-4 ${currentConfig.border}`}>
        {/* Header */}
        <div className={`p-6 pb-4 ${currentConfig.bg} flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <span className={`material-symbols-outlined ${currentConfig.text} bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-sm`}>
              {currentConfig.icon}
            </span>
            <h2 className={`text-[18px] font-bold ${currentConfig.text} uppercase tracking-wider`}>
              {title}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center text-gray-500 hover:bg-white hover:text-gray-800 transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>close</span>
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <p className="text-[15px] text-gray-700 leading-relaxed break-words whitespace-pre-wrap font-medium">
            {content}
          </p>
        </div>
        
        {/* Footer */}
        <div className="p-4 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-gray-200 text-gray-700 font-bold text-[13px] hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
