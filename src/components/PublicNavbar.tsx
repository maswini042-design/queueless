import React, { useState } from 'react';
import { Clock, Menu, X, ArrowRight, ShieldCheck, UserCheck, Users } from 'lucide-react';

interface PublicNavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const PublicNavbar: React.FC<PublicNavbarProps> = ({ currentPath, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [portalDropdownOpen, setPortalDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E7E9F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-4">
          {/* Logo & Brand */}
          <button
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2.5 text-left focus:outline-none cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-[#171A2B] block leading-tight">
                QueueLess
              </span>
              <span className="text-[11px] font-medium text-[#687086] uppercase tracking-wider block">
                Smart Queue Management
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#687086]">
            <button
              onClick={() => onNavigate('/')}
              className={`hover:text-[#171A2B] transition-colors cursor-pointer ${
                currentPath === '/' ? 'text-indigo-600 font-semibold' : ''
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('/features')}
              className={`hover:text-[#171A2B] transition-colors cursor-pointer ${
                currentPath === '/features' ? 'text-indigo-600 font-semibold' : ''
              }`}
            >
              Features
            </button>
            <button
              onClick={() => onNavigate('/how-it-works')}
              className={`hover:text-[#171A2B] transition-colors cursor-pointer ${
                currentPath === '/how-it-works' ? 'text-indigo-600 font-semibold' : ''
              }`}
            >
              How It Works
            </button>
            <button
              onClick={() => onNavigate('/services')}
              className={`hover:text-[#171A2B] transition-colors cursor-pointer ${
                currentPath === '/services' ? 'text-indigo-600 font-semibold' : ''
              }`}
            >
              Services
            </button>
            <button
              onClick={() => onNavigate('/portals')}
              className={`hover:text-[#171A2B] transition-colors cursor-pointer ${
                currentPath === '/portals' ? 'text-indigo-600 font-semibold' : ''
              }`}
            >
              Portals
            </button>
          </nav>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center gap-3">
            {/* Portals Dropdown */}
            <div className="relative">
              <button
                onClick={() => setPortalDropdownOpen(!portalDropdownOpen)}
                className="px-3.5 py-2 text-sm font-semibold text-[#171A2B] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                Sign In
              </button>

              {portalDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-[#E7E9F2] p-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onMouseLeave={() => setPortalDropdownOpen(false)}
                >
                  <button
                    onClick={() => {
                      setPortalDropdownOpen(false);
                      onNavigate('/user/login');
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold text-[#171A2B] hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <Users className="w-4 h-4 text-indigo-600" />
                    <span>User Portal</span>
                  </button>
                  <button
                    onClick={() => {
                      setPortalDropdownOpen(false);
                      onNavigate('/staff/login');
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold text-[#171A2B] hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    <span>Staff Station</span>
                  </button>
                  <button
                    onClick={() => {
                      setPortalDropdownOpen(false);
                      onNavigate('/admin/login');
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold text-[#171A2B] hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Admin Workspace</span>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => onNavigate('/portals')}
              className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E7E9F2] bg-white px-4 pt-3 pb-6 space-y-3">
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onNavigate('/');
            }}
            className="w-full text-left py-2 text-sm font-medium text-slate-700"
          >
            Home
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onNavigate('/features');
            }}
            className="w-full text-left py-2 text-sm font-medium text-slate-700"
          >
            Features
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onNavigate('/how-it-works');
            }}
            className="w-full text-left py-2 text-sm font-medium text-slate-700"
          >
            How It Works
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onNavigate('/services');
            }}
            className="w-full text-left py-2 text-sm font-medium text-slate-700"
          >
            Services Directory
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onNavigate('/portals');
            }}
            className="w-full text-left py-2 text-sm font-medium text-slate-700"
          >
            Portal Selection
          </button>
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('/user/login');
              }}
              className="w-full text-left py-2 text-sm font-medium text-indigo-600 flex items-center gap-2"
            >
              <Users className="w-4 h-4" /> User Sign In
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('/staff/login');
              }}
              className="w-full text-left py-2 text-sm font-medium text-blue-600 flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4" /> Staff Sign In
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('/admin/login');
              }}
              className="w-full text-left py-2 text-sm font-medium text-emerald-600 flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" /> Admin Sign In
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
