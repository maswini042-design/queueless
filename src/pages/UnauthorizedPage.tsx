import React from 'react';
import { ArrowRight, LogOut, ShieldAlert } from 'lucide-react';
import { User } from '../types';

interface UnauthorizedPageProps {
  currentUser: User | null;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

export const UnauthorizedPage: React.FC<UnauthorizedPageProps> = ({
  currentUser,
  onNavigate,
  onLogout,
}) => {
  const getAuthorizedPath = () => {
    if (!currentUser) return '/';
    if (currentUser.role === 'ADMIN') return '/admin/dashboard';
    if (currentUser.role === 'STAFF') return '/staff/dashboard';
    return '/user/dashboard';
  };

  return (
    <div className="min-h-screen bg-[#F7F8FC] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 text-left">
      <div className="max-w-md w-full bg-white rounded-2xl border border-[#E7E9F2] p-8 shadow-sm text-center space-y-6">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 font-mono">
            403 &bull; Access Denied
          </span>
          <h1 className="text-2xl font-bold text-[#171A2B] tracking-tight">
            Restricted Workspace
          </h1>
          <p className="text-xs text-[#687086] leading-relaxed">
            Your current account (<strong>{currentUser?.email || 'Guest'}</strong>) is assigned the{' '}
            <span className="font-semibold text-indigo-600">{currentUser?.role || 'ANONYMOUS'}</span> role and does not have permission to view this section.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          {currentUser && (
            <button
              onClick={() => onNavigate(getAuthorizedPath())}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
            >
              <span>Go to Your Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => {
              onLogout();
              onNavigate('/portals');
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#171A2B] border border-[#E7E9F2] font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-500" />
            <span>Sign In with Different Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};
