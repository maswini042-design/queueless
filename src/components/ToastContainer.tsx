import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  XCircle,
} from 'lucide-react';
import { ToastItem, useToast } from '../context/ToastContext';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <aside
      aria-live="polite"
      aria-label="Notifications"
      className="fixed z-50 top-3 inset-x-3 sm:inset-x-auto sm:top-5 sm:right-5 sm:w-96 flex flex-col gap-2.5 pointer-events-none"
    >
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={() => dismissToast(toast.id)} />
      ))}
    </aside>
  );
};

interface ToastCardProps {
  toast: ToastItem;
  onDismiss: () => void;
}

const ToastCard: React.FC<ToastCardProps> = ({ toast, onDismiss }) => {
  const isLeaving = toast.isLeaving;

  const getConfig = () => {
    switch (toast.type) {
      case 'success':
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
          bgColor: 'bg-emerald-50/95',
          borderColor: 'border-emerald-300',
          textColor: 'text-emerald-950',
          titleColor: 'text-emerald-900',
          progressColor: 'bg-emerald-500',
          defaultTitle: 'Success',
        };
      case 'error':
        return {
          icon: <XCircle className="w-5 h-5 text-rose-600 shrink-0" />,
          bgColor: 'bg-rose-50/95',
          borderColor: 'border-rose-300',
          textColor: 'text-rose-950',
          titleColor: 'text-rose-900',
          progressColor: 'bg-rose-500',
          defaultTitle: 'Error',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
          bgColor: 'bg-amber-50/95',
          borderColor: 'border-amber-300',
          textColor: 'text-amber-950',
          titleColor: 'text-amber-900',
          progressColor: 'bg-amber-500',
          defaultTitle: 'Warning',
        };
      case 'info':
      default:
        return {
          icon: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
          bgColor: 'bg-blue-50/95',
          borderColor: 'border-blue-300',
          textColor: 'text-blue-950',
          titleColor: 'text-blue-900',
          progressColor: 'bg-blue-500',
          defaultTitle: 'Information',
        };
    }
  };

  const config = getConfig();

  return (
    <div
      role="alert"
      className={`pointer-events-auto w-full relative overflow-hidden rounded-2xl border ${config.borderColor} ${config.bgColor} backdrop-blur-md p-3.5 shadow-lg shadow-slate-900/10 flex items-start gap-3 transition-all ${
        isLeaving ? 'animate-toast-exit' : 'animate-toast-enter'
      }`}
    >
      {/* Icon */}
      <div className="mt-0.5">{config.icon}</div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-1">
        {toast.title && (
          <h4 className={`text-xs font-bold leading-tight ${config.titleColor} mb-0.5`}>
            {toast.title}
          </h4>
        )}
        <p className={`text-xs font-medium leading-relaxed ${config.textColor}`}>
          {toast.message}
        </p>
      </div>

      {/* Close Button */}
      <button
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-black/5 transition-colors cursor-pointer focus:outline-none"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Progress Bar indicating auto-dismiss */}
      {toast.duration > 0 && (
        <div
          className={`absolute bottom-0 left-0 right-0 h-0.5 opacity-40 ${config.progressColor}`}
          style={{
            animation: `toastProgress ${toast.duration}ms linear forwards`,
          }}
        />
      )}
    </div>
  );
};
