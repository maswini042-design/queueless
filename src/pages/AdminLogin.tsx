import React, { useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  Shield,
  ShieldAlert,
} from 'lucide-react';
import { toast } from '../context/ToastContext';
import { api } from '../services/api';
import { User } from '../types';

interface AdminLoginProps {
  onSuccess: (user: User) => void;
  onNavigate: (path: string) => void;
}

interface FormFieldErrors {
  email?: string;
  password?: string;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FormFieldErrors>({});

  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const validate = (): boolean => {
    const errors: FormFieldErrors = {};
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      errors.email = 'Administrator email address is required.';
    } else if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Administrator password is required.';
    }

    setFieldErrors(errors);

    if (errors.email) {
      emailInputRef.current?.focus();
      return false;
    }
    if (errors.password) {
      passwordInputRef.current?.focus();
      return false;
    }

    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const user = await api.login(email.trim(), password, 'admin');
      if (user.role !== 'ADMIN') {
        throw new Error('Access denied: You do not have administrator privileges.');
      }
      onSuccess(user);
    } catch (err: any) {
      const msg = err.message || 'Invalid email or password. Please try again.';
      setErrorMessage(msg);
      toast.error(msg);
      passwordInputRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = () => {
    setEmail('admin@queueless.edu');
    setPassword('admin123');
    setFieldErrors({});
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#F7F8FC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-left">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-indigo-950 text-indigo-400 flex items-center justify-center shadow-md">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-[#171A2B]">
            Administrator Sign In
          </h2>
          <p className="mt-1 text-xs text-[#687086]">
            QueueLess Control Console &bull; Centralized system orchestration
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-sm rounded-2xl border border-[#E7E9F2]">
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            <div>
              <label className="block text-xs font-semibold text-[#171A2B] mb-1.5">
                Administrator Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  ref={emailInputRef}
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                    if (errorMessage) setErrorMessage(null);
                  }}
                  disabled={loading}
                  placeholder="admin@queueless.edu"
                  className={`w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border transition disabled:bg-slate-50 disabled:text-slate-400 focus:outline-none ${
                    fieldErrors.email
                      ? 'border-rose-400 ring-2 ring-rose-100 bg-rose-50/20'
                      : 'border-[#E7E9F2] focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10'
                  }`}
                  required
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1 text-[11px] font-medium text-rose-600">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171A2B] mb-1.5">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  ref={passwordInputRef}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                    if (errorMessage) setErrorMessage(null);
                  }}
                  disabled={loading}
                  placeholder="Enter administrator password"
                  className={`w-full pl-9 pr-10 py-2.5 text-xs rounded-xl border transition disabled:bg-slate-50 disabled:text-slate-400 focus:outline-none ${
                    fieldErrors.password
                      ? 'border-rose-400 ring-2 ring-rose-100 bg-rose-50/20'
                      : 'border-[#E7E9F2] focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-[11px] font-medium text-rose-600">{fieldErrors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-900 hover:bg-indigo-950 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying authorization...</span>
                </>
              ) : (
                <>
                  <span>Authenticate Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-5 pt-4 border-t border-[#E7E9F2]">
            <button
              type="button"
              onClick={handleQuickFill}
              disabled={loading}
              className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <KeyRound className="w-3.5 h-3.5 text-indigo-700" />
              <span>Fill Admin Demo Credentials</span>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center space-y-2">
          <p className="text-xs text-slate-500">
            Need student or staff access?{' '}
            <button
              onClick={() => onNavigate('/portals')}
              className="font-semibold text-indigo-600 hover:underline cursor-pointer"
            >
              Change portal
            </button>
          </p>
          <div>
            <button
              onClick={() => onNavigate('/')}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 transition cursor-pointer"
            >
              &larr; Back to QueueLess Overview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
