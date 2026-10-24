import React, { useState } from 'react';
import {
  Bell,
  CheckCircle,
  Clock,
  LogOut,
  Monitor,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types';

interface DashboardNavbarProps {
  currentUser: User;
  currentRole: string;
  onLogout: () => void;
  onNavigate: (path: string) => void;
}

export const DashboardNavbar: React.FC<DashboardNavbarProps> = ({
  currentUser,
  currentRole,
  onLogout,
  onNavigate,
}) => {
  const [showNotifs, setShowNotifs] = useState(false);
  const notifications = api.getNotifications();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const getPortalLabel = () => {
    if (currentUser.role === 'ADMIN') return 'Admin Hub';
    if (currentUser.role === 'STAFF') return 'Staff Console';
    return 'User Portal';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E7E9F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Portal Identity */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (currentUser.role === 'ADMIN') onNavigate('/admin/dashboard');
                else if (currentUser.role === 'STAFF') onNavigate('/staff/dashboard');
                else onNavigate('/user/dashboard');
              }}
              className="flex items-center gap-2.5 text-left focus:outline-none cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-[#171A2B] block leading-tight">
                  QueueLess
                </span>
                <span className="text-[11px] font-medium text-[#687086] uppercase tracking-wider block">
                  {getPortalLabel()}
                </span>
              </div>
            </button>
          </div>

          {/* Right Action Icons: Live Kiosk, Notifications, Profile, Logout */}
          <div className="flex items-center gap-3">
            {/* Live TV Display Mode */}
            <button
              onClick={() => onNavigate('/kiosk')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#687086] hover:text-[#171A2B] hover:bg-slate-100 border border-[#E7E9F2] transition cursor-pointer"
              title="Launch Fullscreen Public Kiosk Board"
            >
              <Monitor className="w-3.5 h-3.5 text-indigo-600" />
              <span>Live Display</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white" />
                )}
              </button>

              {/* Notification Popover */}
              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-[#E7E9F2] p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                    <span className="text-xs font-bold text-[#171A2B] uppercase tracking-wider">
                      Queue Notifications
                    </span>
                    <span className="text-xs text-[#687086]">{notifications.length} alerts</span>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-500 py-4 text-center">No notifications</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => api.markNotificationRead(n.id)}
                          className={`p-2.5 rounded-lg text-xs transition cursor-pointer ${
                            n.read ? 'bg-slate-50 text-slate-600' : 'bg-indigo-50/70 text-slate-900 font-medium'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 text-indigo-700 font-semibold mb-0.5">
                            <CheckCircle className="w-3.5 h-3.5" />
                            {n.title}
                          </div>
                          <p className="text-[#687086] text-[11px] leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-2 pl-2 border-l border-[#E7E9F2]">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-semibold text-xs flex items-center justify-center">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <span className="block text-xs font-semibold text-[#171A2B] leading-tight">
                  {currentUser?.name || 'User'}
                </span>
                <span className="block text-[10px] font-medium text-indigo-600 uppercase tracking-wide">
                  {currentUser?.role || 'USER'}
                </span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="py-1.5 px-3 rounded-lg text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer ml-1"
              title="Log out of QueueLess session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
