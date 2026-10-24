import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration: number;
  isLeaving?: boolean;
  createdAt: number;
}

export interface ToastOptions {
  title?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  addToast: (type: ToastType, message: string, options?: ToastOptions) => string;
  dismissToast: (id: string) => void;
  success: (message: string, options?: ToastOptions) => string;
  error: (message: string, options?: ToastOptions) => string;
  warning: (message: string, options?: ToastOptions) => string;
  info: (message: string, options?: ToastOptions) => string;
}

const ToastContext = createContext<ToastContextType | null>(null);

// Global dispatcher to allow toast calls outside React components if needed
type ToastListener = (toast: ToastItem) => void;
type DismissListener = (id: string) => void;

class GlobalToastManager {
  private toastListeners: Set<ToastListener> = new Set();
  private dismissListeners: Set<DismissListener> = new Set();
  private recentMessages: Map<string, number> = new Map();

  subscribeToast(listener: ToastListener) {
    this.toastListeners.add(listener);
    return () => {
      this.toastListeners.delete(listener);
    };
  }

  subscribeDismiss(listener: DismissListener) {
    this.dismissListeners.add(listener);
    return () => {
      this.dismissListeners.delete(listener);
    };
  }

  emit(type: ToastType, message: string, options?: ToastOptions): string | null {
    const key = `${type}:${message.trim()}`;
    const now = Date.now();
    const last = this.recentMessages.get(key);

    // Suppress exact duplicate notifications within 2500ms
    if (last && now - last < 2500) {
      return null;
    }
    this.recentMessages.set(key, now);

    // Clean up older keys
    if (this.recentMessages.size > 50) {
      for (const [k, time] of this.recentMessages.entries()) {
        if (now - time > 10000) {
          this.recentMessages.delete(k);
        }
      }
    }

    const defaultDuration = type === 'error' ? 6000 : type === 'warning' ? 5000 : 4000;
    const toast: ToastItem = {
      id: 'toast-' + Math.random().toString(36).substring(2, 9) + '-' + now,
      type,
      message,
      title: options?.title,
      duration: options?.duration || defaultDuration,
      isLeaving: false,
      createdAt: now,
    };

    this.toastListeners.forEach((fn) => fn(toast));
    return toast.id;
  }

  dismiss(id: string) {
    this.dismissListeners.forEach((fn) => fn(id));
  }
}

export const globalToast = new GlobalToastManager();

export const toast = {
  success: (message: string, options?: ToastOptions) => globalToast.emit('success', message, options),
  error: (message: string, options?: ToastOptions) => globalToast.emit('error', message, options),
  warning: (message: string, options?: ToastOptions) => globalToast.emit('warning', message, options),
  info: (message: string, options?: ToastOptions) => globalToast.emit('info', message, options),
  dismiss: (id: string) => globalToast.dismiss(id),
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const dismissToast = useCallback((id: string) => {
    // Clear timer
    const timer = timeoutsRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timeoutsRef.current.delete(id);
    }

    // Mark as leaving for smooth fade/slide-out animation
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isLeaving: true } : t))
    );

    // Remove after animation completes (220ms)
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 220);
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string, options?: ToastOptions) => {
      const res = globalToast.emit(type, message, options);
      return res || '';
    },
    []
  );

  useEffect(() => {
    const unsubToast = globalToast.subscribeToast((newToast) => {
      setToasts((prev) => {
        // Keep up to 5 visible toasts to avoid overwhelming screen
        const filtered = prev.slice(-4);
        return [...filtered, newToast];
      });

      // Schedule auto-dismiss
      if (newToast.duration > 0) {
        const timeout = setTimeout(() => {
          dismissToast(newToast.id);
        }, newToast.duration);
        timeoutsRef.current.set(newToast.id, timeout);
      }
    });

    const unsubDismiss = globalToast.subscribeDismiss((id) => {
      dismissToast(id);
    });

    return () => {
      unsubToast();
      unsubDismiss();
      timeoutsRef.current.forEach((t) => clearTimeout(t));
      timeoutsRef.current.clear();
    };
  }, [dismissToast]);

  const value: ToastContextType = {
    toasts,
    addToast,
    dismissToast,
    success: (msg, opts) => addToast('success', msg, opts),
    error: (msg, opts) => addToast('error', msg, opts),
    warning: (msg, opts) => addToast('warning', msg, opts),
    info: (msg, opts) => addToast('info', msg, opts),
  };

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback using global singleton if outside provider
    return {
      toasts: [],
      addToast: (type: ToastType, msg: string, opts?: ToastOptions) => globalToast.emit(type, msg, opts) || '',
      dismissToast: (id: string) => globalToast.dismiss(id),
      success: (msg: string, opts?: ToastOptions) => globalToast.emit('success', msg, opts) || '',
      error: (msg: string, opts?: ToastOptions) => globalToast.emit('error', msg, opts) || '',
      warning: (msg: string, opts?: ToastOptions) => globalToast.emit('warning', msg, opts) || '',
      info: (msg: string, opts?: ToastOptions) => globalToast.emit('info', msg, opts) || '',
    };
  }
  return context;
};
