import { useState, useEffect, useCallback, createContext, useContext } from "react";

// ─────────────────────────────────────────────────────
// Toast Context
// ─────────────────────────────────────────────────────
const ToastContext = createContext(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

// ─────────────────────────────────────────────────────
// Single Toast Item
// ─────────────────────────────────────────────────────
const icons = {
  success: (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="11" fill="#10b981" fillOpacity="0.15" />
      <path d="M7 11.5l2.5 2.5L15 8.5" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  error: (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="11" fill="#ef4444" fillOpacity="0.15" />
      <path d="M8 8l6 6M14 8l-6 6" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  warning: (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="11" fill="#f59e0b" fillOpacity="0.15" />
      <path d="M11 7v4M11 14v1" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  info: (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="11" fill="#3b82f6" fillOpacity="0.15" />
      <path d="M11 10v5M11 7v1" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
};

const borderColors = {
  success: "#10b981",
  error: "#ef4444",
  warning: "#f59e0b",
  info: "#3b82f6",
};

const progressColors = {
  success: "linear-gradient(90deg, #10b981, #34d399)",
  error: "linear-gradient(90deg, #ef4444, #f87171)",
  warning: "linear-gradient(90deg, #f59e0b, #fbbf24)",
  info: "linear-gradient(90deg, #3b82f6, #60a5fa)",
};

function ToastItem({ id, type = "info", title, message, duration = 4000, onRemove }) {
  const [exiting, setExiting] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        handleClose();
      }
    }, 30);
    return () => clearInterval(interval);
  }, [duration]);

  const handleClose = useCallback(() => {
    setExiting(true);
    setTimeout(() => onRemove(id), 320);
  }, [id, onRemove]);

  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRadius: "14px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
        border: `1px solid rgba(${type === "success" ? "16,185,129" : type === "error" ? "239,68,68" : type === "warning" ? "245,158,11" : "59,130,246"}, 0.2)`,
        borderLeft: `4px solid ${borderColors[type]}`,
        padding: "14px 16px 10px 16px",
        minWidth: "320px",
        maxWidth: "420px",
        display: "flex",
        flexDirection: "column",
        gap: "0",
        animation: exiting ? "toast-slide-out 0.32s ease forwards" : "toast-slide-in 0.38s cubic-bezier(0.21, 1.02, 0.73, 1) forwards",
        position: "relative",
        overflow: "hidden",
        cursor: "pointer",
      }}
      onClick={handleClose}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
        <div style={{ flexShrink: 0, marginTop: "1px" }}>{icons[type]}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {title && (
            <div style={{ fontWeight: 600, fontSize: "14px", color: "#1a1b21", lineHeight: "1.3", marginBottom: "2px" }}>
              {title}
            </div>
          )}
          <div style={{ fontSize: "13px", color: "#6b7280", lineHeight: "1.45" }}>{message}</div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); handleClose(); }}
          style={{
            background: "none", border: "none", cursor: "pointer", padding: "2px",
            color: "#9ca3af", flexShrink: 0, lineHeight: 1,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M4 4l6 6M10 4l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      {/* Progress Bar */}
      <div style={{ marginTop: "10px", height: "3px", borderRadius: "2px", background: "rgba(0,0,0,0.05)", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            borderRadius: "2px",
            background: progressColors[type],
            width: `${progress}%`,
            transition: "width 0.05s linear",
          }}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// Toast Provider
// ─────────────────────────────────────────────────────
let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type = "info", title, message, duration = 4000 }) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, type, title, message, duration }]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (message, title = "Success") => addToast({ type: "success", title, message }),
    error: (message, title = "Error") => addToast({ type: "error", title, message }),
    warning: (message, title = "Warning") => addToast({ type: "warning", title, message }),
    info: (message, title = "Info") => addToast({ type: "info", title, message }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Container */}
      <div
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          pointerEvents: "none",
        }}
      >
        {toasts.map((t) => (
          <div key={t.id} style={{ pointerEvents: "auto" }}>
            <ToastItem {...t} onRemove={removeToast} />
          </div>
        ))}
      </div>
      <style>{`
        @keyframes toast-slide-in {
          0% { opacity: 0; transform: translateX(100%) scale(0.95); }
          100% { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes toast-slide-out {
          0% { opacity: 1; transform: translateX(0) scale(1); }
          100% { opacity: 0; transform: translateX(100%) scale(0.95); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export default ToastProvider;
