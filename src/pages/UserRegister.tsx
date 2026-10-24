import React, { useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  User,
  Users,
} from 'lucide-react';
import { toast } from '../context/ToastContext';
import { api } from '../services/api';
import { User as UserType } from '../types';

interface UserRegisterProps {
  onSuccess: (user: UserType) => void;
  onNavigate: (path: string) => void;
}

interface FormFieldErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

export const UserRegister: React.FC<UserRegisterProps> = ({ onSuccess, onNavigate }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FormFieldErrors>({});

  const nameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const confirmPasswordInputRef = useRef<HTMLInputElement>(null);

  const validate = (): boolean => {
    const errors: FormFieldErrors = {};
    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (!cleanName) {
      errors.name = 'Full name is required.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail) {
      errors.email = 'Email address is required.';
    } else if (!emailRegex.test(cleanEmail)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setFieldErrors(errors);

    // Autofocus first invalid input
    if (errors.name) {
      nameInputRef.current?.focus();
      return false;
    }
    if (errors.email) {
      emailInputRef.current?.focus();
      return false;
    }
    if (errors.password) {
      passwordInputRef.current?.focus();
      return false;
    }
    if (errors.confirmPassword) {
      confirmPasswordInputRef.current?.focus();
      return false;
    }

    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const user = await api.register(name.trim(), email.trim(), password, phone.trim());
      toast.success('Registration successful! Your account has been created.');
      onSuccess(user);
    } catch (err: any) {
      const msg = err.message || 'Registration failed. Please try again.';
      if (msg.includes('already exists') || msg.includes('duplicate')) {
        const dupMsg = 'An account with this email already exists.';
        setErrorMessage(dupMsg);
        setFieldErrors((prev) => ({ ...prev, email: dupMsg }));
        emailInputRef.current?.focus();
        toast.error(dupMsg);
      } else {
        setErrorMessage(msg);
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-left">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
            <Users className="w-6 h-6" />
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-[#171A2B]">
            Create QueueLess Account
          </h2>
          <p className="mt-1 text-xs text-[#687086]">
            Join the smart digital queue network &bull; Fast, paperless, real-time
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

          <form onSubmit={handleRegister} className="space-y-4" noValidate>
            <div>
              <label className="block text-xs font-semibold text-[#171A2B] mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  ref={nameInputRef}
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }));
                    if (errorMessage) setErrorMessage(null);
                  }}
                  disabled={loading}
                  placeholder="e.g. Jordan Smith"
                  className={`w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border transition disabled:bg-slate-50 disabled:text-slate-400 focus:outline-none ${
                    fieldErrors.name
                      ? 'border-rose-400 ring-2 ring-rose-100 bg-rose-50/20'
                      : 'border-[#E7E9F2] focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10'
                  }`}
                  required
                />
              </div>
              {fieldErrors.name && (
                <p className="mt-1 text-[11px] font-medium text-rose-600">{fieldErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171A2B] mb-1.5">
                Email Address <span className="text-rose-500">*</span>
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
                  placeholder="name@campus.edu"
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
                Phone Number <span className="text-slate-400 font-normal">(optional for SMS queue alerts)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  disabled={loading}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-[#E7E9F2] focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 focus:outline-none transition disabled:bg-slate-50 disabled:text-slate-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#171A2B] mb-1.5">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
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
                    placeholder="Min 6 chars"
                    className={`w-full px-3 py-2.5 text-xs rounded-xl border transition disabled:bg-slate-50 disabled:text-slate-400 focus:outline-none ${
                      fieldErrors.password
                        ? 'border-rose-400 ring-2 ring-rose-100 bg-rose-50/20'
                        : 'border-[#E7E9F2] focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10'
                    }`}
                    required
                  />
                </div>
                {fieldErrors.password && (
                  <p className="mt-1 text-[11px] font-medium text-rose-600">{fieldErrors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171A2B] mb-1.5">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    ref={confirmPasswordInputRef}
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (fieldErrors.confirmPassword) setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                      if (errorMessage) setErrorMessage(null);
                    }}
                    disabled={loading}
                    placeholder="Re-enter password"
                    className={`w-full px-3 py-2.5 text-xs rounded-xl border transition disabled:bg-slate-50 disabled:text-slate-400 focus:outline-none ${
                      fieldErrors.confirmPassword
                        ? 'border-rose-400 ring-2 ring-rose-100 bg-rose-50/20'
                        : 'border-[#E7E9F2] focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10'
                    }`}
                    required
                  />
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="mt-1 text-[11px] font-medium text-rose-600">{fieldErrors.confirmPassword}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Show passwords</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating user account...</span>
                </>
              ) : (
                <>
                  <span>Complete Registration</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 text-center border-t border-[#E7E9F2] pt-4">
            <span className="text-xs text-[#687086]">Already have an account? </span>
            <button
              onClick={() => onNavigate('/user/login')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
            >
              Sign In
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => onNavigate('/')}
            className="text-xs font-medium text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            &larr; Back to QueueLess Overview
          </button>
        </div>
      </div>
    </div>
  );
};
