import React, { useEffect, useState } from 'react';
import { AdminDashboard } from './components/AdminDashboard';
import { DashboardNavbar } from './components/DashboardNavbar';
import { LiveQueueBoard } from './components/LiveQueueBoard';
import { PublicNavbar } from './components/PublicNavbar';
import { StaffDashboard } from './components/StaffDashboard';
import { AdminLogin } from './pages/AdminLogin';
import { FeaturesPage } from './pages/FeaturesPage';
import { HomePage } from './pages/HomePage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PortalSelection } from './pages/PortalSelection';
import { PrivacyPage } from './pages/PrivacyPage';
import { PublicServicesPage } from './pages/PublicServicesPage';
import { StaffLogin } from './pages/StaffLogin';
import { TermsPage } from './pages/TermsPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { UserDashboard } from './pages/UserDashboard';
import { UserLogin } from './pages/UserLogin';
import { UserRegister } from './pages/UserRegister';
import { api } from './services/api';
import { Counter, Token, User } from './types';
import { ToastProvider, toast } from './context/ToastContext';
import { ToastContainer } from './components/ToastContainer';

// Helper to determine initial path from pathname or hash
function getInitialPath(): string {
  const hash = window.location.hash.replace(/^#/, '');
  if (hash.startsWith('/')) return hash;
  let path = window.location.pathname;
  const base = '/queueless';
  if (path === base) path = '/';
  else if (path.startsWith(base + '/')) path = path.slice(base.length);
  return path || '/';
}

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(getInitialPath());
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [counters, setCounters] = useState<Counter[]>([]);
  const [activeToken, setActiveToken] = useState<Token | null>(null);
  const [allTokens, setAllTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync route on popstate
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(getInitialPath());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    setCurrentPath(path);
    const base = window.location.pathname === '/queueless' ||
      window.location.pathname.startsWith('/queueless/')
      ? '/queueless'
      : '';
    const target = base + (path.startsWith('/') ? path : '/' + path);
    if (window.location.pathname !== target) {
      window.history.pushState({}, '', target);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const refreshState = async () => {
    try {
      const user = await api.getCurrentUser();
      setCurrentUser(user);
      const c = await api.getCounters();
      setCounters(c);
      if (user) {
        const active = await api.getActiveToken();
        setActiveToken(active);
        const myTokens = await api.getMyTokens();
        setAllTokens(myTokens);
      } else {
        setActiveToken(null);
        setAllTokens(api.getTokens());
      }
    } catch (e) {
      console.error('Error refreshing state:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshState();
    const interval = setInterval(refreshState, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    setActiveToken(null);
    toast.success('You have been logged out successfully.');
    navigate('/');
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    refreshState();
    toast.success('Login successful! Welcome back.');
    if (user.role === 'ADMIN') {
      navigate('/admin/dashboard');
    } else if (user.role === 'STAFF') {
      navigate('/staff/dashboard');
    } else {
      navigate('/user/dashboard');
    }
  };

  // Fullscreen Live Display Board (Kiosk)
  if (currentPath === '/kiosk') {
    return (
      <ToastProvider>
        <ToastContainer />
        <main className="min-h-screen bg-slate-950">
          <LiveQueueBoard
            counters={counters}
            tokens={allTokens}
            onBack={() => {
              if (currentUser?.role === 'ADMIN') navigate('/admin/dashboard');
              else if (currentUser?.role === 'STAFF') navigate('/staff/dashboard');
              else if (currentUser) navigate('/user/dashboard');
              else navigate('/');
            }}
          />
        </main>
      </ToastProvider>
    );
  }

  // Determine whether current path is an authenticated dashboard route
  const isAdminRoute = currentPath.startsWith('/admin') && currentPath !== '/admin/login';
  const isStaffRoute = currentPath.startsWith('/staff') && currentPath !== '/staff/login';
  const isUserRoute =
    currentPath.startsWith('/user') &&
    currentPath !== '/user/login' &&
    currentPath !== '/user/register';
  const isDashboardRoute =
    isAdminRoute || isStaffRoute || isUserRoute || currentPath === '/unauthorized';

  // Role Protection Checks for Dashboards
  const renderDashboardContent = () => {
    if (!currentUser) {
      if (isAdminRoute) {
        return <AdminLogin onSuccess={handleLoginSuccess} onNavigate={navigate} />;
      }
      if (isStaffRoute) {
        return <StaffLogin onSuccess={handleLoginSuccess} onNavigate={navigate} />;
      }
      return <UserLogin onSuccess={handleLoginSuccess} onNavigate={navigate} />;
    }

    if (isAdminRoute) {
      if (currentUser.role !== 'ADMIN') {
        return (
          <UnauthorizedPage
            currentUser={currentUser}
            onNavigate={navigate}
            onLogout={handleLogout}
          />
        );
      }
      return (
        <AdminDashboard
          currentUser={currentUser}
          currentPath={currentPath}
          onNavigate={navigate}
          onRefresh={refreshState}
        />
      );
    }

    if (isStaffRoute) {
      if (currentUser.role !== 'STAFF' && currentUser.role !== 'ADMIN') {
        return (
          <UnauthorizedPage
            currentUser={currentUser}
            onNavigate={navigate}
            onLogout={handleLogout}
          />
        );
      }
      return (
        <StaffDashboard
          currentUser={currentUser}
          counters={counters}
          currentPath={currentPath}
          onNavigate={navigate}
          onRefresh={refreshState}
        />
      );
    }

    if (isUserRoute) {
      return (
        <UserDashboard
          currentUser={currentUser}
          activeToken={activeToken}
          counters={counters}
          currentPath={currentPath}
          onNavigate={navigate}
          onRefresh={refreshState}
        />
      );
    }

    if (currentPath === '/unauthorized') {
      return (
        <UnauthorizedPage
          currentUser={currentUser}
          onNavigate={navigate}
          onLogout={handleLogout}
        />
      );
    }

    return null;
  };

  const isKnownPublicRoute =
    currentPath === '/' ||
    currentPath === '/features' ||
    currentPath === '/how-it-works' ||
    currentPath === '/services' ||
    currentPath === '/privacy' ||
    currentPath === '/terms' ||
    currentPath === '/portals' ||
    currentPath === '/admin/login' ||
    currentPath === '/staff/login' ||
    currentPath === '/user/login' ||
    currentPath === '/user/register' ||
    isDashboardRoute;

  return (
    <ToastProvider>
      <ToastContainer />
      <div className="min-h-screen bg-[#F7F8FC] text-[#171A2B] flex flex-col font-sans">
      {/* Dynamic Navbar based on route and auth state */}
      {isDashboardRoute && currentUser ? (
        <DashboardNavbar
          currentUser={currentUser}
          currentRole={currentUser.role}
          onLogout={handleLogout}
          onNavigate={navigate}
        />
      ) : (
        <PublicNavbar currentPath={currentPath} onNavigate={navigate} />
      )}

      {/* Main View Router */}
      <main className="flex-1 w-full">
        {loading ? (
          <div className="py-24 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span>Connecting to QueueLess server...</span>
          </div>
        ) : (
          <>
            {/* Public Landing & Marketing Pages */}
            {currentPath === '/' && (
              <HomePage counters={counters} onNavigate={navigate} />
            )}

            {currentPath === '/features' && (
              <FeaturesPage onNavigate={navigate} />
            )}

            {currentPath === '/how-it-works' && (
              <HowItWorksPage onNavigate={navigate} />
            )}

            {currentPath === '/services' && (
              <PublicServicesPage
                counters={counters}
                currentUser={currentUser}
                onNavigate={navigate}
              />
            )}

            {currentPath === '/privacy' && (
              <PrivacyPage onNavigate={navigate} />
            )}

            {currentPath === '/terms' && (
              <TermsPage onNavigate={navigate} />
            )}

            {/* Portal Selection */}
            {currentPath === '/portals' && (
              <PortalSelection onNavigate={navigate} />
            )}

            {/* Authentication Pages */}
            {currentPath === '/admin/login' && (
              <AdminLogin onSuccess={handleLoginSuccess} onNavigate={navigate} />
            )}

            {currentPath === '/staff/login' && (
              <StaffLogin onSuccess={handleLoginSuccess} onNavigate={navigate} />
            )}

            {currentPath === '/user/login' && (
              <UserLogin onSuccess={handleLoginSuccess} onNavigate={navigate} />
            )}

            {currentPath === '/user/register' && (
              <UserRegister onSuccess={handleLoginSuccess} onNavigate={navigate} />
            )}

            {/* Protected Dashboard Views */}
            {isDashboardRoute && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {renderDashboardContent()}
              </div>
            )}

            {/* 404 Route */}
            {!isKnownPublicRoute && (
              <NotFoundPage onNavigate={navigate} />
            )}
          </>
        )}
      </main>
      </div>
    </ToastProvider>
  );
}

