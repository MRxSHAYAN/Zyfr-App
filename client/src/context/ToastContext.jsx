import React, { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

let toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, dismiss }}>
      {children}
      {/* Toast container */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 pointer-events-none"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const TYPE_STYLES = {
  success: 'bg-emerald-500 text-white',
  error:   'bg-rose-500 text-white',
  warning: 'bg-amber-500 text-white',
  info:    'bg-surface-800 dark:bg-surface-700 text-surface-100 border border-surface-700 dark:border-surface-600',
};

const ToastItem = ({ toast, onDismiss }) => {
  return (
    <div
      role="alert"
      onClick={() => onDismiss(toast.id)}
      className={`pointer-events-auto max-w-xs px-4 py-3 rounded-xl shadow-glass-dark text-sm font-medium
        flex items-center gap-2 cursor-pointer animate-slide-up
        ${TYPE_STYLES[toast.type] || TYPE_STYLES.info}`}
    >
      {toast.type === 'success' && <span aria-hidden>✓</span>}
      {toast.type === 'error'   && <span aria-hidden>✕</span>}
      {toast.type === 'warning' && <span aria-hidden>⚠</span>}
      <span>{toast.message}</span>
    </div>
  );
};
