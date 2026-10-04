import React from 'react';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center gap-3 bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-xl shadow-2xl border border-white/10 animate-in slide-in-from-bottom-5 duration-200 min-w-[300px] max-w-md"
        >
          <span className="material-symbols-outlined text-secondary-fixed text-[22px] shrink-0">
            {toast.type === 'error' ? 'error' : toast.type === 'warning' ? 'warning' : 'check_circle'}
          </span>
          <div className="flex flex-col flex-1">
            <span className="text-[13px] font-bold leading-tight">{toast.title}</span>
            <span className="text-[11px] text-surface-container-highest mt-0.5 leading-snug">{toast.message}</span>
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="p-1 text-surface-container-highest hover:text-white rounded cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      ))}
    </div>
  );
};
