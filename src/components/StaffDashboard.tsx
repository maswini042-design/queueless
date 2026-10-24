import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Bell,
  Check,
  CheckCircle,
  Clock,
  FastForward,
  FileText,
  Play,
  RotateCcw,
  ShieldCheck,
  SkipForward,
  UserCheck,
  Users,
  Volume2,
} from 'lucide-react';
import { toast } from '../context/ToastContext';
import { api } from '../services/api';
import { Counter, NotificationItem, ServiceHistoryItem, Token, User } from '../types';
import { getStatusBadgeConfig } from '../utils/tokenStateMachine';

interface StaffDashboardProps {
  currentUser: User;
  counters: Counter[];
  currentPath?: string;
  onNavigate?: (path: string) => void;
  onRefresh: () => void;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({
  currentUser,
  counters,
  currentPath = '/staff/dashboard',
  onNavigate,
  onRefresh,
}) => {
  const getSubRoute = (): string => {
    if (currentPath.includes('/queue')) return 'queue';
    if (currentPath.includes('/current-token')) return 'current-token';
    if (currentPath.includes('/history')) return 'history';
    if (currentPath.includes('/notifications')) return 'notifications';
    if (currentPath.includes('/profile')) return 'profile';
    return 'overview';
  };

  const activeTab = getSubRoute();

  const handleTabChange = (tab: string) => {
    if (onNavigate) {
      if (tab === 'overview') onNavigate('/staff/dashboard');
      else onNavigate(`/staff/${tab}`);
    }
  };

  const [selectedCounterId, setSelectedCounterId] = useState<string>(
    counters[0]?.id || ''
  );
  const [queueData, setQueueData] = useState<{
    counter: Counter;
    waitingQueue: Token[];
    currentlyServing: Token | null;
    calledToken: Token | null;
    waitingCount: number;
    averageServiceTimeMinutes: number;
  } | null>(null);

  const [serviceTimerSeconds, setServiceTimerSeconds] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [todayHistory, setTodayHistory] = useState<ServiceHistoryItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const loadQueue = async () => {
    const data = await api.getStaffQueue(selectedCounterId);
    setQueueData(data);
    const hist = await api.getHistory();
    setTodayHistory(hist);
    const notifs = api.getNotifications();
    setNotifications(notifs);
  };

  useEffect(() => {
    if (selectedCounterId) {
      loadQueue();
    }
  }, [selectedCounterId]);

  // Live seconds timer for active serving token
  useEffect(() => {
    let interval: any = null;
    if (queueData?.currentlyServing?.status === 'SERVING') {
      const startTime = queueData.currentlyServing.serviceStartedAt
        ? new Date(queueData.currentlyServing.serviceStartedAt).getTime()
        : Date.now();

      setServiceTimerSeconds(Math.max(0, Math.floor((Date.now() - startTime) / 1000)));

      interval = setInterval(() => {
        setServiceTimerSeconds(Math.max(0, Math.floor((Date.now() - startTime) / 1000)));
      }, 1000);
    } else {
      setServiceTimerSeconds(0);
    }
    return () => clearInterval(interval);
  }, [queueData?.currentlyServing]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Actions
  const handleCallToken = async (tokenId: string) => {
    setActionLoading(true);
    try {
      await api.staffCallToken(tokenId);
      toast.success('Next customer called successfully.');
      await loadQueue();
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to call token');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartService = async (tokenId: string) => {
    setActionLoading(true);
    try {
      await api.staffStartService(tokenId);
      toast.success('Consultation started successfully.');
      await loadQueue();
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to start consultation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteService = async (tokenId: string) => {
    setActionLoading(true);
    try {
      await api.staffCompleteService(tokenId);
      toast.success('Consultation completed successfully.');
      await loadQueue();
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to complete consultation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSkipToken = async (tokenId: string) => {
    setActionLoading(true);
    try {
      await api.staffSkipToken(tokenId);
      toast.warning('Customer marked as absent.');
      await loadQueue();
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to skip customer');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecallToken = async (tokenId: string) => {
    setActionLoading(true);
    try {
      await api.staffRecallToken(tokenId);
      toast.info('Customer recalled successfully.');
      await loadQueue();
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to recall customer');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCallNextInLine = async () => {
    if (!queueData || queueData.waitingQueue.length === 0) return;
    const nextToken = queueData.waitingQueue[0];
    setActionLoading(true);
    try {
      await api.staffCallToken(nextToken.id);
      toast.success('Next customer called successfully.');
      await loadQueue();
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to call next customer');
    } finally {
      setActionLoading(false);
    }
  };

  const activeTokenAtDesk = queueData?.currentlyServing || queueData?.calledToken;

  return (
    <div className="space-y-6">
      {/* Header and Desk Selector */}
      <div className="bg-white rounded-2xl border border-[#E7E9F2] p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              Staff Service Station
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#171A2B] mt-1">
            Service Desk Console
          </h1>
          <p className="text-xs text-[#687086]">
            Staff Officer: <strong className="text-[#171A2B]">{currentUser.name}</strong> • Desk: {queueData?.counter?.counterName} ({queueData?.counter?.code})
          </p>
        </div>

        {/* Counter Selector Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="desk-select" className="text-xs font-semibold text-[#687086]">
            Active Desk:
          </label>
          <select
            id="desk-select"
            value={selectedCounterId}
            onChange={(e) => setSelectedCounterId(e.target.value)}
            className="text-xs font-bold text-[#171A2B] bg-slate-50 border border-[#E7E9F2] rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-600/20 focus:outline-none cursor-pointer"
          >
            {counters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.counterName} ({c.code}) - {c.waitingCount || 0} waiting
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sub-Route Navigation Tabs */}
      <div className="bg-white rounded-xl border border-[#E7E9F2] p-1.5 overflow-x-auto shadow-xs">
        <div className="flex items-center gap-1 min-w-max text-xs font-semibold">
          {[
            { id: 'overview', label: 'Overview', icon: <UserCheck className="w-3.5 h-3.5" /> },
            { id: 'queue', label: `Assigned Queue (${queueData?.waitingQueue.length || 0})`, icon: <Users className="w-3.5 h-3.5" /> },
            { id: 'current-token', label: 'Active Desk', icon: <Play className="w-3.5 h-3.5" /> },
            { id: 'history', label: 'Service History', icon: <FileText className="w-3.5 h-3.5" /> },
            { id: 'notifications', label: 'Announcements', icon: <Bell className="w-3.5 h-3.5" /> },
            { id: 'profile', label: 'Staff Profile', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
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

      {/* 1. OVERVIEW VIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Call & Serving Card */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E7E9F2] p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#687086]">
                    Current Consultation Status
                  </span>
                  <h2 className="text-xl font-bold text-[#171A2B] mt-0.5">
                    {queueData?.counter?.counterName}
                  </h2>
                </div>
                {activeTokenAtDesk ? (
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${
                      getStatusBadgeConfig(activeTokenAtDesk.status as any).bg
                    } ${getStatusBadgeConfig(activeTokenAtDesk.status as any).text}`}
                  >
                    <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                    {activeTokenAtDesk.status}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                    Desk Idle
                  </span>
                )}
              </div>

              {activeTokenAtDesk ? (
                <div className="bg-slate-50 border border-[#E7E9F2] rounded-2xl p-6 text-center mb-6">
                  <span className="text-xs font-semibold uppercase tracking-widest text-[#687086] block">
                    Now Serving Token
                  </span>
                  <div className="text-6xl font-black text-indigo-700 font-mono tracking-tight my-2">
                    {activeTokenAtDesk.tokenNumber}
                  </div>
                  <p className="text-sm font-semibold text-[#171A2B]">
                    Student: {activeTokenAtDesk.userName || 'Enrolled Student'}
                  </p>

                  {/* Stopwatch */}
                  {activeTokenAtDesk.status === 'SERVING' && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-mono font-bold mt-3 border border-emerald-200">
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                      Active Duration: {formatTimer(serviceTimerSeconds)}
                    </div>
                  )}

                  {activeTokenAtDesk.status === 'CALLED' && (
                    <p className="text-xs text-blue-600 font-medium mt-2">
                      Customer summoned to desk. Waiting for arrival.
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-slate-50 border border-dashed border-[#E7E9F2] rounded-2xl p-12 text-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-sm text-[#171A2B]">No Customer at Desk</h3>
                  <p className="text-xs text-[#687086] max-w-sm mx-auto mt-1">
                    Call the next eligible waiting student from the queue to start consulting.
                  </p>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {activeTokenAtDesk?.status === 'CALLED' && (
                  <button
                    onClick={() => handleStartService(activeTokenAtDesk.id)}
                    disabled={actionLoading}
                    className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
                  >
                    <Play className="w-4 h-4" />
                    Begin Serving
                  </button>
                )}

                {activeTokenAtDesk?.status === 'SERVING' && (
                  <button
                    onClick={() => handleCompleteService(activeTokenAtDesk.id)}
                    disabled={actionLoading}
                    className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    Complete Consultation
                  </button>
                )}

                {activeTokenAtDesk && (
                  <>
                    <button
                      onClick={() => handleRecallToken(activeTokenAtDesk.id)}
                      disabled={actionLoading}
                      title="Chime again"
                      className="py-2.5 px-3 bg-white border border-[#E7E9F2] hover:bg-slate-50 text-[#171A2B] text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
                      Recall
                    </button>
                    <button
                      onClick={() => handleSkipToken(activeTokenAtDesk.id)}
                      disabled={actionLoading}
                      className="py-2.5 px-3 bg-white border border-[#E7E9F2] hover:bg-rose-50 hover:text-rose-700 text-[#687086] text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <SkipForward className="w-3.5 h-3.5" />
                      No-Show / Skip
                    </button>
                  </>
                )}
              </div>

              <button
                onClick={handleCallNextInLine}
                disabled={actionLoading || !queueData || queueData.waitingQueue.length === 0}
                className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
              >
                <FastForward className="w-4 h-4" />
                Call Next Customer ({queueData?.waitingQueue.length || 0})
              </button>
            </div>
          </div>

          {/* Side Queue Summary */}
          <div className="bg-white rounded-2xl border border-[#E7E9F2] p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <h3 className="font-bold text-sm text-[#171A2B]">Next in Line</h3>
                <span className="text-xs font-bold text-indigo-600">
                  {queueData?.waitingQueue.length || 0} waiting
                </span>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {!queueData || queueData.waitingQueue.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-6 text-center">No students currently in queue.</p>
                ) : (
                  queueData.waitingQueue.slice(0, 5).map((t, idx) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-mono font-bold text-[#171A2B]">#{idx + 1} &bull; {t.tokenNumber}</div>
                        <span className="text-[11px] text-slate-500">{t.userName || 'Student'}</span>
                      </div>
                      <button
                        onClick={() => handleCallToken(t.id)}
                        disabled={actionLoading}
                        className="py-1 px-2.5 rounded-lg bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 text-xs font-bold transition cursor-pointer"
                      >
                        Call
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => handleTabChange('queue')}
                className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs rounded-xl transition cursor-pointer text-center"
              >
                View Full Assigned Queue List →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. ASSIGNED QUEUE VIEW */}
      {activeTab === 'queue' && (
        <div className="bg-white rounded-2xl border border-[#E7E9F2] p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#171A2B]">Active Queue for {queueData?.counter?.counterName}</h3>
              <p className="text-xs text-[#687086]">All students waiting in sequence for this specific service desk.</p>
            </div>
            <button
              onClick={handleCallNextInLine}
              disabled={actionLoading || !queueData || queueData.waitingQueue.length === 0}
              className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <FastForward className="w-3.5 h-3.5" />
              Call Next ({queueData?.waitingQueue.length || 0})
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[#687086] uppercase tracking-wider border-y border-[#E7E9F2]">
                <tr>
                  <th className="py-3 px-4">Position</th>
                  <th className="py-3 px-4">Token #</th>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Joined At</th>
                  <th className="py-3 px-4">Est. Wait</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {!queueData || queueData.waitingQueue.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                      Queue is currently clear. No students waiting.
                    </td>
                  </tr>
                ) : (
                  queueData.waitingQueue.map((t, idx) => (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-500">#{idx + 1}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">{t.tokenNumber}</td>
                      <td className="py-3.5 px-4 font-semibold text-[#171A2B]">{t.userName || 'Student'}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        ~{t.estimatedWaitMinutes || (idx + 1) * 5} mins
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleCallToken(t.id)}
                          disabled={actionLoading}
                          className="py-1 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs shadow-xs transition cursor-pointer"
                        >
                          Call to Desk
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. CURRENT TOKEN VIEW */}
      {activeTab === 'current-token' && (
        <div className="max-w-xl mx-auto bg-white rounded-2xl border border-[#E7E9F2] p-8 shadow-xs text-center space-y-6">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
            Active Counter Serving Console
          </span>

          {activeTokenAtDesk ? (
            <div className="p-8 rounded-2xl bg-slate-50 border border-[#E7E9F2] space-y-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#687086] block">
                Active Ticket
              </span>
              <div className="text-7xl font-black text-indigo-700 font-mono tracking-tight">
                {activeTokenAtDesk.tokenNumber}
              </div>
              <p className="text-base font-bold text-[#171A2B]">
                {activeTokenAtDesk.userName || 'Enrolled Student'}
              </p>

              {activeTokenAtDesk.status === 'SERVING' && (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-900 text-sm font-mono font-bold">
                  <Clock className="w-4 h-4 animate-spin" />
                  Elapsed: {formatTimer(serviceTimerSeconds)}
                </div>
              )}

              <div className="pt-6 border-t border-slate-200 flex flex-wrap justify-center gap-3">
                {activeTokenAtDesk.status === 'CALLED' && (
                  <button
                    onClick={() => handleStartService(activeTokenAtDesk.id)}
                    disabled={actionLoading}
                    className="py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-xs transition cursor-pointer"
                  >
                    Customer Present &bull; Begin Serving
                  </button>
                )}
                {activeTokenAtDesk.status === 'SERVING' && (
                  <button
                    onClick={() => handleCompleteService(activeTokenAtDesk.id)}
                    disabled={actionLoading}
                    className="py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-xs transition cursor-pointer"
                  >
                    Complete Service Consultation
                  </button>
                )}
                <button
                  onClick={() => handleRecallToken(activeTokenAtDesk.id)}
                  disabled={actionLoading}
                  className="py-3 px-4 bg-white border border-[#E7E9F2] text-[#171A2B] text-sm font-semibold rounded-xl shadow-xs transition cursor-pointer"
                >
                  Recall Chime
                </button>
                <button
                  onClick={() => handleSkipToken(activeTokenAtDesk.id)}
                  disabled={actionLoading}
                  className="py-3 px-4 bg-white border border-[#E7E9F2] text-rose-600 text-sm font-semibold rounded-xl shadow-xs transition cursor-pointer"
                >
                  Mark No-Show
                </button>
              </div>
            </div>
          ) : (
            <div className="py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-[#171A2B]">No Customer Currently Summoned</h3>
              <p className="text-xs text-[#687086] max-w-sm mx-auto">
                Ready to take the next visitor? Click below to advance the queue.
              </p>
              <button
                onClick={handleCallNextInLine}
                disabled={actionLoading || !queueData || queueData.waitingQueue.length === 0}
                className="py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                Call Next Customer ({queueData?.waitingQueue.length || 0} waiting)
              </button>
            </div>
          )}
        </div>
      )}

      {/* 4. SERVICE HISTORY VIEW */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-[#E7E9F2] p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-bold text-[#171A2B]">Today's Completed Consultations</h3>
            <p className="text-xs text-[#687086]">Audit trail of tokens handled and durations logged to MongoDB.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[#687086] uppercase tracking-wider border-y border-[#E7E9F2]">
                <tr>
                  <th className="py-3 px-4">Token #</th>
                  <th className="py-3 px-4">Desk</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Outcome</th>
                  <th className="py-3 px-4 text-right">Completed Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {todayHistory.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400 italic">
                      No service records logged yet today.
                    </td>
                  </tr>
                ) : (
                  todayHistory.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">{h.tokenNumber}</td>
                      <td className="py-3.5 px-4 font-bold text-[#171A2B]">{h.counterName}</td>
                      <td className="py-3.5 px-4 font-semibold text-emerald-700">
                        {Math.floor((h.serviceDurationSeconds || 240) / 60)}m {(h.serviceDurationSeconds || 240) % 60}s
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                          COMPLETED
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-500 font-mono">
                        {new Date(h.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. NOTIFICATIONS VIEW */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-2xl border border-[#E7E9F2] p-6 shadow-xs space-y-4">
          <h3 className="text-lg font-bold text-[#171A2B]">Facility Announcements &amp; Alerts</h3>
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

      {/* 6. PROFILE VIEW */}
      {activeTab === 'profile' && (
        <div className="max-w-xl bg-white rounded-2xl border border-[#E7E9F2] p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-black text-2xl flex items-center justify-center shadow-sm">
              {currentUser.name ? currentUser.name.charAt(0) : 'S'}
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#171A2B]">{currentUser.name}</h3>
              <p className="text-xs text-blue-600 font-semibold">{currentUser.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                ROLE: STAFF OFFICER
              </span>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-[#687086]">Assigned Facility Counter</span>
              <strong className="text-[#171A2B]">{queueData?.counter?.counterName} ({queueData?.counter?.code})</strong>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-[#687086]">Staff Phone</span>
              <span className="font-mono text-slate-700">{currentUser.phone || '+1 (555) 876-5432'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-[#687086]">Shift Status</span>
              <span className="font-semibold text-emerald-700">On Active Duty</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-[#687086]">Session Auth ID</span>
              <span className="font-mono text-slate-500">{currentUser.id}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
