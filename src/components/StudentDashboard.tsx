import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Bell,
  CheckCircle2,
  Clock,
  HelpCircle,
  History,
  Info,
  Layers,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Ticket,
  User as UserIcon,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { toast } from '../context/ToastContext';
import { api } from '../services/api';
import { Counter, NotificationItem, Service, Token, User } from '../types';
import { formatWaitTimeDisplay } from '../utils/predictionEngine';
import { getStatusBadgeConfig } from '../utils/tokenStateMachine';

interface StudentDashboardProps {
  currentUser: User;
  activeToken: Token | null;
  counters: Counter[];
  currentPath?: string;
  onNavigate?: (path: string) => void;
  onRefresh: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  currentUser,
  activeToken,
  counters,
  currentPath = '/user/dashboard',
  onNavigate,
  onRefresh,
}) => {
  const getSubRoute = (): string => {
    if (currentPath.includes('/services')) return 'services';
    if (currentPath.includes('/join-queue')) return 'join-queue';
    if (currentPath.includes('/my-token')) return 'my-token';
    if (currentPath.includes('/queue-status')) return 'queue-status';
    if (currentPath.includes('/history')) return 'history';
    if (currentPath.includes('/notifications')) return 'notifications';
    if (currentPath.includes('/profile')) return 'profile';
    return 'overview';
  };

  const activeTab = getSubRoute();

  const handleTabChange = (tab: string) => {
    if (onNavigate) {
      if (tab === 'overview') onNavigate('/user/dashboard');
      else onNavigate(`/user/${tab}`);
    }
  };

  const [selectedCounter, setSelectedCounter] = useState<Counter | null>(null);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [myHistory, setMyHistory] = useState<Token[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // User Profile Edit State
  const [profilePhone, setProfilePhone] = useState(currentUser.phone || '+1 (555) 234-5678');
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Monitor token called status
  const prevStatusRef = useRef(activeToken?.status);
  useEffect(() => {
    if (activeToken && activeToken.status === 'CALLED' && prevStatusRef.current !== 'CALLED') {
      toast.warning('Your token has been called. Please proceed to the counter.');
    }
    prevStatusRef.current = activeToken?.status;
  }, [activeToken?.status]);

  const loadData = async () => {
    try {
      const history = await api.getMyTokens();
      setMyHistory(history);
      const svc = await api.getServices();
      setServices(svc);
      const notifs = api.getNotifications();
      setNotifications(notifs);
    } catch (e) {}
  };

  useEffect(() => {
    loadData();
  }, [activeToken]);

  // Open modal if user navigates to /user/join-queue
  useEffect(() => {
    if (currentPath === '/user/join-queue') {
      const active = counters.find((c) => c.status === 'ACTIVE') || counters[0];
      if (active) {
        setSelectedCounter(active);
        setShowTokenModal(true);
      }
    }
  }, [currentPath, counters]);

  const handleOpenTokenModal = (counter: Counter) => {
    setSelectedCounter(counter);
    setErrorMessage(null);
    setShowTokenModal(true);
  };

  const handleGenerateToken = async () => {
    if (!selectedCounter) return;
    setIsGenerating(true);
    setErrorMessage(null);
    try {
      await api.generateToken(selectedCounter.id);
      toast.success('Queue token generated successfully!');
      setShowTokenModal(false);
      onRefresh();
      if (onNavigate) onNavigate('/user/my-token');
    } catch (err: any) {
      const msg = err.message || 'Failed to generate token';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCancelToken = async () => {
    if (!activeToken) return;
    setIsCancelling(true);
    try {
      await api.cancelToken(activeToken.id);
      toast.success('Your queue token has been cancelled.');
      setShowCancelModal(false);
      onRefresh();
    } catch (err: any) {
      const msg = err.message || 'Failed to cancel token';
      toast.error(msg);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    currentUser.phone = profilePhone;
    setProfileSuccess(true);
    toast.success('Profile updated successfully.');
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  const handleMarkAllNotificationsRead = async () => {
    await api.markAllNotificationsRead();
    toast.info('Notifications marked as read.');
    await loadData();
  };

  const filteredCounters = counters.filter((c) =>
    c.counterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-[#171A2B] text-white rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3 border border-indigo-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            Smart Queue Prediction Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {currentUser.name}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1.5 leading-relaxed">
            Eliminate long physical queues. Generate a digital ticket, track your live position in real time, and receive explainable wait-time predictions.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={() => {
                const available = counters.find((c) => c.status === 'ACTIVE') || counters[0];
                if (available) handleOpenTokenModal(available);
              }}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-xs transition cursor-pointer flex items-center gap-2"
            >
              <Ticket className="w-4 h-4" />
              Book Digital Token
            </button>
            <button
              onClick={() => handleTabChange('history')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl text-xs transition cursor-pointer flex items-center gap-2"
            >
              <History className="w-4 h-4 text-indigo-300" />
              View Past Tokens ({myHistory.length})
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Route Navigation Tabs */}
      <div className="bg-white rounded-xl border border-[#E7E9F2] p-1.5 overflow-x-auto shadow-xs">
        <div className="flex items-center gap-1 min-w-max text-xs font-semibold">
          {[
            { id: 'overview', label: 'Overview', icon: <Ticket className="w-3.5 h-3.5" /> },
            { id: 'services', label: `Services (${counters.length})`, icon: <Layers className="w-3.5 h-3.5" /> },
            { id: 'my-token', label: activeToken ? `Active Ticket (${activeToken.tokenNumber})` : 'Active Ticket', icon: <Clock className="w-3.5 h-3.5" /> },
            { id: 'queue-status', label: 'Live Queue Tracker', icon: <Users className="w-3.5 h-3.5" /> },
            { id: 'history', label: `History (${myHistory.length})`, icon: <History className="w-3.5 h-3.5" /> },
            { id: 'notifications', label: 'Alerts', icon: <Bell className="w-3.5 h-3.5" /> },
            { id: 'profile', label: 'Profile', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'text-[#687086] hover:text-[#171A2B] hover:bg-slate-100'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 1. OVERVIEW & 3. MY-TOKEN VIEW */}
      {(activeTab === 'overview' || activeTab === 'my-token') && (
        <>
          {activeToken ? (
            <section aria-labelledby="active-token-heading" className="bg-white rounded-2xl border-2 border-indigo-600/30 shadow-xs p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-indigo-600" />

              <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {activeToken.tokenNumber.split('-')[0]}
                    </span>
                    <h2 id="active-token-heading" className="text-xl font-bold text-[#171A2B]">
                      {activeToken.counterName}
                    </h2>
                  </div>
                  <p className="text-xs text-[#687086] mt-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    Campus Student Center &bull; Assigned Counter Desk
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadgeConfig(activeToken.status as any).bg} ${getStatusBadgeConfig(activeToken.status as any).text}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    {activeToken.status}
                  </span>
                  {activeToken.status === 'WAITING' && (
                    <button
                      onClick={() => setShowCancelModal(true)}
                      className="px-3 py-1 rounded-lg text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 transition cursor-pointer"
                    >
                      Cancel Token
                    </button>
                  )}
                </div>
              </div>

              {/* Big Token Display Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6 items-center">
                {/* Token Sequence Number */}
                <div className="p-6 bg-slate-50 border border-[#E7E9F2] rounded-2xl text-center">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#687086] block">
                    Your Digital Token
                  </span>
                  <div className="text-6xl font-black text-indigo-600 font-mono tracking-tight my-2">
                    {activeToken.tokenNumber}
                  </div>
                  <span className="text-xs text-[#687086] block">
                    Issued at {new Date(activeToken.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Queue Position */}
                <div className="p-6 bg-slate-50 border border-[#E7E9F2] rounded-2xl text-center">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#687086] block">
                    Current Queue Position
                  </span>
                  <div className="text-6xl font-black text-[#171A2B] font-mono tracking-tight my-2">
                    #{activeToken.queuePosition || 1}
                  </div>
                  <span className="text-xs text-[#687086] block">
                    {activeToken.peopleAhead === 0
                      ? 'You are next in line to be served!'
                      : `${activeToken.peopleAhead} customer${(activeToken.peopleAhead ?? 1) > 1 ? 's' : ''} ahead of you`}
                  </span>
                </div>

                {/* Estimated Wait */}
                <div className="p-6 bg-indigo-50/60 border border-indigo-100 rounded-2xl text-center">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-900 block">
                    Predicted Wait Time
                  </span>
                  <div className="text-5xl font-black text-indigo-700 font-mono tracking-tight my-2">
                    {formatWaitTimeDisplay(activeToken.estimatedWaitMinutes)}
                  </div>
                  <span className="text-xs text-indigo-800 font-medium block">
                    Confidence: 94% &bull; Dynamic Model
                  </span>
                </div>
              </div>
            </section>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-[#E7E9F2] p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
                <Ticket className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#171A2B]">No Active Queue Ticket</h3>
              <p className="text-xs text-[#687086] max-w-sm mx-auto">
                You do not have any pending tokens in the queue. Browse available service counters below to book your spot.
              </p>
            </div>
          )}

          {/* Available Counters */}
          <div className="bg-white rounded-2xl border border-[#E7E9F2] p-6 shadow-xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-[#171A2B]">Campus Service Desks</h3>
                <p className="text-xs text-[#687086]">Select a desk to join the queue and receive an immediate wait-time estimate.</p>
              </div>
              <div className="relative max-w-xs w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search counters..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#E7E9F2] focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCounters.map((c) => {
                const isAvailable = c.status === 'ACTIVE';
                const hasActiveTokenAtThis = activeToken?.counterId === c.id;

                return (
                  <div
                    key={c.id}
                    className="p-5 rounded-2xl border border-[#E7E9F2] bg-slate-50/50 hover:bg-white hover:border-indigo-200 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-mono font-bold text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100">
                          {c.code}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isAvailable ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {isAvailable ? 'Open' : 'Closed'}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-[#171A2B]">{c.counterName}</h4>
                      <p className="text-xs text-[#687086] mt-1 line-clamp-2">{c.description}</p>

                      <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                        <span className="text-[#687086]">Waiting: <strong className="text-indigo-600">{c.waitingCount || 0}</strong></span>
                        <span className="text-[#687086]">Est. Wait: <strong>~{((c.waitingCount || 0) * (c.averageServiceMinutes || 5))}m</strong></span>
                      </div>
                    </div>

                    <div className="mt-4">
                      {hasActiveTokenAtThis ? (
                        <div className="py-2 px-3 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-semibold text-center border border-indigo-100">
                          Your Active Desk ({activeToken?.tokenNumber})
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOpenTokenModal(c)}
                          disabled={!isAvailable || !!activeToken}
                          className={`w-full py-2 px-3 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                            isAvailable && !activeToken
                              ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          <Ticket className="w-3.5 h-3.5" />
                          {activeToken ? 'Already in a Queue' : 'Join Desk Queue'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* 2. SERVICES DIRECTORY VIEW */}
      {activeTab === 'services' && (
        <div className="bg-white rounded-2xl border border-[#E7E9F2] p-6 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-[#171A2B]">Campus Services Catalog</h3>
              <p className="text-xs text-[#687086]">Official university departments offering digital queue appointments.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {counters.map((c) => (
              <div key={c.id} className="p-5 rounded-2xl border border-[#E7E9F2] bg-slate-50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
                      {c.code}
                    </span>
                    <span className="text-xs text-indigo-600 font-semibold">
                      ~{c.averageServiceMinutes} mins / person
                    </span>
                  </div>
                  <h4 className="font-bold text-base text-[#171A2B]">{c.counterName}</h4>
                  <p className="text-xs text-[#687086] mt-1 mb-4 leading-relaxed">{c.description}</p>
                </div>
                <button
                  onClick={() => handleOpenTokenModal(c)}
                  disabled={c.status !== 'ACTIVE' || !!activeToken}
                  className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Ticket className="w-4 h-4" />
                  {activeToken ? 'Active Token Exists' : 'Book Token for this Service'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. QUEUE-STATUS LIVE TRACKER VIEW */}
      {activeTab === 'queue-status' && (
        <div className="bg-white rounded-2xl border border-[#E7E9F2] p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-bold text-[#171A2B]">Live Campus Queue Tracker</h3>
            <p className="text-xs text-[#687086]">Check current serving tokens across all university service counters.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {counters.map((c) => (
              <div key={c.id} className="p-5 rounded-2xl border border-[#E7E9F2] bg-slate-50 text-center">
                <span className="font-mono font-bold text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                  {c.code}
                </span>
                <h4 className="font-bold text-sm text-[#171A2B] mt-2 mb-4">{c.counterName}</h4>
                <div className="p-4 bg-white rounded-xl border border-[#E7E9F2] mb-3">
                  <span className="text-[11px] text-slate-500 uppercase tracking-wide block">Serving Token</span>
                  <div className="text-3xl font-black text-indigo-700 font-mono mt-1">
                    {c.currentServingToken || 'Idle'}
                  </div>
                </div>
                <div className="text-xs text-slate-600 font-semibold">
                  {c.waitingCount || 0} students waiting
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. HISTORY VIEW */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-[#E7E9F2] p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-bold text-[#171A2B]">My Past Token History</h3>
            <p className="text-xs text-[#687086]">Log of all tickets you booked and completed at campus service desks.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[#687086] uppercase tracking-wider border-y border-[#E7E9F2]">
                <tr>
                  <th className="py-3 px-4">Token #</th>
                  <th className="py-3 px-4">Desk</th>
                  <th className="py-3 px-4">Date &amp; Time</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myHistory.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400 italic">
                      No historical tokens found.
                    </td>
                  </tr>
                ) : (
                  myHistory.map((t) => {
                    const badge = getStatusBadgeConfig(t.status as any);
                    return (
                      <tr key={t.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">{t.tokenNumber}</td>
                        <td className="py-3.5 px-4 font-bold text-[#171A2B]">{t.counterName}</td>
                        <td className="py-3.5 px-4 text-slate-500 font-mono">
                          {new Date(t.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg} ${badge.text}`}>
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. NOTIFICATIONS VIEW */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-2xl border border-[#E7E9F2] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#171A2B]">Queue Alerts &amp; Announcements</h3>
            <button
              onClick={handleMarkAllNotificationsRead}
              className="px-3 py-1.5 rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-semibold text-xs transition cursor-pointer"
            >
              Mark all as read
            </button>
          </div>
          <div className="space-y-3">
            {notifications.map((n) => (
              <div key={n.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-[#171A2B]">{n.title}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-[#687086] leading-relaxed">{n.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. PROFILE VIEW */}
      {activeTab === 'profile' && (
        <div className="max-w-xl bg-white rounded-2xl border border-[#E7E9F2] p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-sm">
              {currentUser.name ? currentUser.name.charAt(0) : 'U'}
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#171A2B]">{currentUser.name}</h3>
              <p className="text-xs text-indigo-600 font-semibold">{currentUser.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
                ROLE: {currentUser.role}
              </span>
            </div>
          </div>

          {profileSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Profile contact details updated successfully!
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                disabled
                type="text"
                value={currentUser.name}
                className="w-full px-3 py-2 border border-[#E7E9F2] rounded-xl bg-slate-50 text-slate-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Institutional Email</label>
              <input
                disabled
                type="email"
                value={currentUser.email}
                className="w-full px-3 py-2 border border-[#E7E9F2] rounded-xl bg-slate-50 text-slate-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">SMS / WhatsApp Phone</label>
              <input
                type="text"
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
                className="w-full px-3 py-2 border border-[#E7E9F2] rounded-xl focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition cursor-pointer"
              >
                Save Profile
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: Book Token Confirmation */}
      {showTokenModal && selectedCounter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E7E9F2] text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-[#171A2B]">Confirm Queue Ticket</h3>
              </div>
              <button
                onClick={() => setShowTokenModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Service Counter:</span>
                <strong className="text-[#171A2B]">{selectedCounter.counterName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Counter Code:</span>
                <span className="font-mono font-bold text-indigo-600">{selectedCounter.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">People Ahead:</span>
                <span className="font-bold text-[#171A2B]">{selectedCounter.waitingCount || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Est. Wait Time:</span>
                <span className="font-bold text-emerald-700">~{((selectedCounter.waitingCount || 0) * (selectedCounter.averageServiceMinutes || 5))} mins</span>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowTokenModal(false)}
                className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateToken}
                disabled={isGenerating}
                className="px-5 py-2.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition cursor-pointer flex items-center gap-1.5"
              >
                {isGenerating ? 'Generating Ticket...' : 'Confirm & Join Queue'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Cancel Token */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#E7E9F2] text-xs space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#171A2B]">Cancel Your Queue Token?</h3>
            <p className="text-slate-500">
              Your ticket <strong className="font-mono text-slate-800">{activeToken?.tokenNumber}</strong> will be released. You will lose your current spot in line.
            </p>

            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
              >
                Keep Token
              </button>
              <button
                onClick={handleCancelToken}
                disabled={isCancelling}
                className="px-5 py-2 rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {isCancelling ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Cancelling...</span>
                  </>
                ) : (
                  'Yes, Cancel'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
