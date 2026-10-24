import React, { useState } from 'react';
import {
  Bell,
  CheckCircle,
  Clock,
  Layers,
  LayoutDashboard,
  Monitor,
  Server,
  Settings,
  ShieldCheck,
  UserCheck,
  Users,
  RotateCcw,
} from 'lucide-react';
import { api } from '../services/api';
import { User, UserRole } from '../types';

interface NavbarProps {
  currentUser: User;
  onRoleChange: (role: UserRole) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenDeployGuide: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onRoleChange,
  activeTab,
  setActiveTab,
  onOpenDeployGuide,
}) => {
  const [showNotifs, setShowNotifs] = useState(false);
  const notifications = api.getNotifications();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top micro-bar for Architecture & Project context */}
      <div className="bg-slate-900 text-slate-300 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono text-[11px] font-medium border border-blue-400/30">
            <Server className="w-3 h-3 text-blue-400" />
            Tomcat 10.1 &bull; Java 26 &bull; MongoDB
          </span>
          <span className="hidden sm:inline text-slate-400">
            B.Tech CSE Mini Project &bull; Jakarta Servlet 6.0 &bull; WAR Deployable
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenDeployGuide}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium underline flex items-center gap-1 cursor-pointer"
          >
            IntelliJ &amp; Tomcat Setup
          </button>
          <span className="text-slate-600">|</span>
          <button
            onClick={() => {
              if (confirm('Reset demo state back to default university counters and tokens?')) {
                api.resetDemo();
              }
            }}
            title="Reset sample data"
            className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px] cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Data
          </button>
        </div>
      </div>

      {/* Main App Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('student')}
              className="flex items-center gap-2.5 text-left focus:outline-none cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/30">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 block leading-tight">
                  QueueLess
                </span>
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                  Smart Queue Prediction
                </span>
              </div>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('student')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'student'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Student Portal
            </button>

            <button
              onClick={() => setActiveTab('staff')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'staff'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              Staff Desk
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Admin Hub
            </button>

            <button
              onClick={() => setActiveTab('kiosk')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'kiosk'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Monitor className="w-4 h-4" />
              Live Display
            </button>
          </nav>

          {/* Role Switcher & User Actions */}
          <div className="flex items-center gap-3">
            {/* Role Simulator Pill for effortless testing */}
            <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              <span className="px-2 text-slate-400 font-medium">Role:</span>
              <button
                onClick={() => {
                  onRoleChange('STUDENT');
                  setActiveTab('student');
                }}
                className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                  currentUser.role === 'STUDENT'
                    ? 'bg-white text-blue-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Student
              </button>
              <button
                onClick={() => {
                  onRoleChange('STAFF');
                  setActiveTab('staff');
                }}
                className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                  currentUser.role === 'STAFF'
                    ? 'bg-white text-blue-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Staff
              </button>
              <button
                onClick={() => {
                  onRoleChange('ADMIN');
                  setActiveTab('admin');
                }}
                className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                  currentUser.role === 'ADMIN'
                    ? 'bg-white text-blue-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Admin
              </button>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
                )}
              </button>

              {/* Notification Popover */}
              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Queue Notifications
                    </span>
                    <span className="text-xs text-slate-400">{notifications.length} alerts</span>
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
                            n.read ? 'bg-slate-50 text-slate-600' : 'bg-blue-50/70 text-slate-900 font-medium'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 text-blue-700 font-semibold mb-0.5">
                            <CheckCircle className="w-3.5 h-3.5" />
                            {n.title}
                          </div>
                          <p className="text-slate-600 text-[11px] leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Card */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-semibold text-xs flex items-center justify-center">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <span className="block text-xs font-semibold text-slate-800 leading-tight">
                  {currentUser?.name || 'Student User'}
                </span>
                <span className="block text-[10px] font-medium text-blue-600 uppercase tracking-wide">
                  {currentUser?.role || 'STUDENT'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 text-xs">
          <button
            onClick={() => setActiveTab('student')}
            className={`py-1.5 px-2 rounded-md ${activeTab === 'student' ? 'text-blue-700 font-bold' : 'text-slate-600'}`}
          >
            Student
          </button>
          <button
            onClick={() => setActiveTab('staff')}
            className={`py-1.5 px-2 rounded-md ${activeTab === 'staff' ? 'text-blue-700 font-bold' : 'text-slate-600'}`}
          >
            Staff Desk
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`py-1.5 px-2 rounded-md ${activeTab === 'admin' ? 'text-blue-700 font-bold' : 'text-slate-600'}`}
          >
            Admin
          </button>
          <button
            onClick={() => setActiveTab('kiosk')}
            className={`py-1.5 px-2 rounded-md ${activeTab === 'kiosk' ? 'text-blue-700 font-bold' : 'text-slate-600'}`}
          >
            Live Screen
          </button>
        </div>
      </div>
    </header>
  );
};
