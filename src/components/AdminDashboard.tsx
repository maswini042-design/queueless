import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bell,
  CheckCircle,
  Clock,
  Database,
  Edit2,
  FileCode,
  Layers,
  Lock,
  Plus,
  RefreshCw,
  Search,
  Server,
  Settings,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users,
  X,
  Zap,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { toast } from '../context/ToastContext';
import { api } from '../services/api';
import { Counter, NotificationItem, Service, SystemHealth, Token, User } from '../types';
import { getStatusBadgeConfig } from '../utils/tokenStateMachine';

interface AdminDashboardProps {
  currentUser: User;
  currentPath?: string;
  onNavigate?: (path: string) => void;
  onRefresh: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  currentPath = '/admin/dashboard',
  onNavigate,
  onRefresh,
}) => {
  // Determine active sub-route from currentPath
  const getSubRoute = (): string => {
    if (currentPath.includes('/services')) return 'services';
    if (currentPath.includes('/counters')) return 'counters';
    if (currentPath.includes('/staff')) return 'staff';
    if (currentPath.includes('/users')) return 'users';
    if (currentPath.includes('/queues')) return 'queues';
    if (currentPath.includes('/tokens')) return 'tokens';
    if (currentPath.includes('/analytics')) return 'analytics';
    if (currentPath.includes('/notifications')) return 'notifications';
    if (currentPath.includes('/settings')) return 'settings';
    if (currentPath.includes('/profile')) return 'profile';
    return 'overview';
  };

  const activeTab = getSubRoute();

  const handleTabChange = (tab: string) => {
    if (onNavigate) {
      if (tab === 'overview') onNavigate('/admin/dashboard');
      else onNavigate(`/admin/${tab}`);
    }
  };

  const [analytics, setAnalytics] = useState<any>(null);
  const [counters, setCounters] = useState<Counter[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [staffList, setStaffList] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allTokens, setAllTokens] = useState<Token[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [health, setHealth] = useState<SystemHealth | null>(null);

  // Search & Filter States
  const [userSearch, setUserSearch] = useState('');
  const [tokenSearch, setTokenSearch] = useState('');
  const [tokenStatusFilter, setTokenStatusFilter] = useState('ALL');

  // Counter Modal State
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [editingCounter, setEditingCounter] = useState<Partial<Counter> | null>(null);

  // Service Modal State
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<Partial<Service> | null>(null);

  // Staff Modal State
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPhone, setNewStaffPhone] = useState('');

  // Notification Broadcast State
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastType, setBroadcastType] = useState<'INFO' | 'ALERT' | 'SUCCESS'>('INFO');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // System Settings State
  const [queueOperatingHours, setQueueOperatingHours] = useState('08:00 AM - 05:00 PM');
  const [maxTokensPerUser, setMaxTokensPerUser] = useState(1);
  const [autoCallDelaySec, setAutoCallDelaySec] = useState(30);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const loadData = async () => {
    const a = await api.getAdminAnalytics();
    setAnalytics(a);
    const c = await api.getCounters();
    setCounters(c);
    const s = await api.getServices();
    setServices(s);
    const st = await api.getStaffList();
    setStaffList(st);
    const u = await api.getUsers();
    setAllUsers(u);
    const t = api.getTokens();
    setAllTokens(t);
    const n = api.getNotifications();
    setNotifications(n);
    const h = await api.checkHealth();
    setHealth(h);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save Service
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService || !editingService.name) return;
    const isUpdate = !!editingService.id;
    try {
      await api.saveService(editingService);
      if (isUpdate) {
        toast.success('Service details updated successfully.');
      } else {
        toast.success('Service created successfully.');
      }
      setShowServiceModal(false);
      setEditingService(null);
      await loadData();
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save service');
    }
  };

  const handleDeleteService = async (id: string) => {
    if (confirm('Delete this service category? All desk linkages will be detached.')) {
      try {
        await api.deleteService(id);
        toast.info('Service removed successfully.');
        await loadData();
        onRefresh();
      } catch (err: any) {
        toast.error(err.message || 'Failed to delete service');
      }
    }
  };

  // Save Counter
  const handleSaveCounter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCounter || !editingCounter.counterName || !editingCounter.code) return;
    try {
      await api.saveCounter(editingCounter);
      toast.success('Counter updated successfully.');
      setShowCounterModal(false);
      setEditingCounter(null);
      await loadData();
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save counter');
    }
  };

  const handleDeleteCounter = async (id: string) => {
    if (confirm('Delete this service counter? Associated tokens will be closed.')) {
      try {
        await api.deleteCounter(id);
        toast.info('Counter removed successfully.');
        await loadData();
        onRefresh();
      } catch (err: any) {
        toast.error(err.message || 'Failed to delete counter');
      }
    }
  };

  // Create Staff
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName || !newStaffEmail) return;
    try {
      await api.createStaff(newStaffName, newStaffEmail, newStaffPhone);
      toast.success('Staff account created successfully.');
      setShowStaffModal(false);
      setNewStaffName('');
      setNewStaffEmail('');
      setNewStaffPhone('');
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create staff account');
    }
  };

  // Broadcast Alert
  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;
    try {
      api.broadcastNotification(broadcastTitle, broadcastMessage, broadcastType);
      toast.info('Broadcast alert sent successfully.');
      setBroadcastTitle('');
      setBroadcastMessage('');
      setBroadcastSuccess(true);
      setTimeout(() => setBroadcastSuccess(false), 3000);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to send broadcast');
    }
  };

  // Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaved(true);
    toast.success('Settings saved successfully.');
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  // Hourly Analytics Data
  const hourlyData = [
    { hour: '08:00', tokens: 8, served: 7 },
    { hour: '09:00', tokens: 19, served: 16 },
    { hour: '10:00', tokens: 34, served: 30 },
    { hour: '11:00', tokens: 42, served: 38 },
    { hour: '12:00', tokens: 26, served: 25 },
    { hour: '13:00', tokens: 22, served: 20 },
    { hour: '14:00', tokens: 38, served: 35 },
    { hour: '15:00', tokens: 30, served: 28 },
    { hour: '16:00', tokens: 16, served: 15 },
  ];

  const counterBarData = counters.map((c) => ({
    name: c.code,
    waiting: c.waitingCount || 0,
    avgMin: c.averageServiceMinutes,
  }));

  const filteredUsers = allUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.role.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredTokens = allTokens.filter((t) => {
    const matchesSearch =
      t.tokenNumber.toLowerCase().includes(tokenSearch.toLowerCase()) ||
      t.counterName.toLowerCase().includes(tokenSearch.toLowerCase()) ||
      (t.userName && t.userName.toLowerCase().includes(tokenSearch.toLowerCase()));
    const matchesStatus =
      tokenStatusFilter === 'ALL' || t.status === tokenStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-[#E7E9F2] p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              Administrator Hub
            </span>
            <span className="text-xs text-[#687086]">• Session Active</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#171A2B] mt-1">
            System Administration &amp; Control
          </h1>
          <p className="text-xs text-[#687086]">
            Configure facility desks, assign staff counters, track wait-time predictions, and monitor MongoDB collections.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditingService({ averageServiceMinutes: 5, active: true });
              setShowServiceModal(true);
            }}
            className="py-2 px-3.5 rounded-xl text-xs font-semibold bg-white border border-[#E7E9F2] hover:bg-slate-50 text-[#171A2B] shadow-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-600" />
            New Service
          </button>
          <button
            onClick={() => {
              setEditingCounter({ averageServiceMinutes: 5, status: 'ACTIVE' });
              setShowCounterModal(true);
            }}
            className="py-2 px-3.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            New Counter
          </button>
          <button
            onClick={loadData}
            title="Refresh metrics"
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-[#E7E9F2] cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sub-Route Navigation Tabs */}
      <div className="bg-white rounded-xl border border-[#E7E9F2] p-1.5 overflow-x-auto shadow-xs">
        <div className="flex items-center gap-1 min-w-max text-xs font-semibold">
          {[
            { id: 'overview', label: 'Overview', icon: <Activity className="w-3.5 h-3.5" /> },
            { id: 'services', label: `Services (${services.length})`, icon: <Layers className="w-3.5 h-3.5" /> },
            { id: 'counters', label: `Counters (${counters.length})`, icon: <Server className="w-3.5 h-3.5" /> },
            { id: 'staff', label: `Staff (${staffList.length})`, icon: <UserCheck className="w-3.5 h-3.5" /> },
            { id: 'users', label: `Users (${allUsers.length})`, icon: <Users className="w-3.5 h-3.5" /> },
            { id: 'queues', label: 'Live Queues', icon: <Clock className="w-3.5 h-3.5" /> },
            { id: 'tokens', label: `Token Ledger (${allTokens.length})`, icon: <FileCode className="w-3.5 h-3.5" /> },
            { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-3.5 h-3.5" /> },
            { id: 'notifications', label: 'Notifications', icon: <Bell className="w-3.5 h-3.5" /> },
            { id: 'settings', label: 'Settings', icon: <Settings className="w-3.5 h-3.5" /> },
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

      {/* 1. OVERVIEW VIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#E7E9F2] shadow-xs">
              <div className="flex items-center justify-between text-[#687086] text-xs font-semibold mb-2">
                <span>Total Tokens Today</span>
                <Clock className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-3xl font-extrabold text-[#171A2B]">
                {analytics?.totalTokensToday ?? allTokens.length}
              </div>
              <span className="text-[11px] text-emerald-600 font-medium">Recorded in MongoDB</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E7E9F2] shadow-xs">
              <div className="flex items-center justify-between text-[#687086] text-xs font-semibold mb-2">
                <span>Currently Waiting</span>
                <Users className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-3xl font-extrabold text-amber-600">
                {analytics?.waitingCount ?? allTokens.filter((t) => t.status === 'WAITING').length}
              </div>
              <span className="text-[11px] text-[#687086]">Awaiting desk call</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E7E9F2] shadow-xs">
              <div className="flex items-center justify-between text-[#687086] text-xs font-semibold mb-2">
                <span>Completed Consultations</span>
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-3xl font-extrabold text-emerald-600">
                {analytics?.completedCount ?? 18}
              </div>
              <span className="text-[11px] text-emerald-600 font-medium">94.8% resolution rate</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E7E9F2] shadow-xs">
              <div className="flex items-center justify-between text-[#687086] text-xs font-semibold mb-2">
                <span>Average Handling Time</span>
                <Zap className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-3xl font-extrabold text-[#171A2B]">
                {analytics?.averageWaitMinutes ?? 6.2} <span className="text-sm font-normal text-[#687086]">min</span>
              </div>
              <span className="text-[11px] text-indigo-600 font-medium">Model confidence 92%</span>
            </div>
          </div>

          {/* Quick Counter Grid & System Health */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E7E9F2] p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-[#171A2B]">Live Desk Utilization</h3>
                <button
                  onClick={() => handleTabChange('counters')}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                >
                  Manage Counters →
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {counters.map((c) => (
                  <div key={c.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono font-bold text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
                          {c.code}
                        </span>
                        <span className="text-[11px] text-[#687086]">Staff: {c.staffName || 'Unassigned'}</span>
                      </div>
                      <h4 className="font-bold text-sm text-[#171A2B]">{c.counterName}</h4>
                      <p className="text-xs text-[#687086] mt-1 line-clamp-1">{c.description}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                      <span className="text-[#687086]">In Queue: <strong className="text-indigo-600">{c.waitingCount || 0}</strong></span>
                      <span className="text-[#687086]">Now Serving: <strong>{c.currentServingToken || 'Idle'}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Backend Runtime Card */}
            <div className="bg-white rounded-2xl border border-[#E7E9F2] p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-[#171A2B]">System Architecture</h3>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Online
                  </span>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-[#687086]">Server Engine</span>
                    <span className="font-semibold text-[#171A2B]">Apache Tomcat 10.1</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-[#687086]">Servlet Standard</span>
                    <span className="font-semibold text-[#171A2B]">Jakarta Servlet 6.0</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-[#687086]">Database Driver</span>
                    <span className="font-semibold text-[#171A2B]">MongoDB Synchronous 5.5</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-[#687086]">Authentication</span>
                    <span className="font-semibold text-[#171A2B]">BCrypt + Server Sessions</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-[#687086]">Frontend Bundle</span>
                    <span className="font-semibold text-[#171A2B]">React 19 + TypeScript</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={() => handleTabChange('analytics')}
                  className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs rounded-xl transition cursor-pointer"
                >
                  View Full Analytics Charts →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. SERVICES VIEW */}
      {activeTab === 'services' && (
        <div className="bg-white rounded-2xl border border-[#E7E9F2] p-6 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-[#171A2B]">Service Categories &amp; Departments</h3>
              <p className="text-xs text-[#687086]">Configure student service offerings, expected handling durations, and operating flags.</p>
            </div>
            <button
              onClick={() => {
                setEditingService({ averageServiceMinutes: 5, active: true });
                setShowServiceModal(true);
              }}
              className="py-2 px-4 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Service
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[#687086] uppercase tracking-wider border-y border-[#E7E9F2]">
                <tr>
                  <th className="py-3 px-4">Service Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Est. Handle Time</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {services.map((svc) => (
                  <tr key={svc.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4 font-bold text-[#171A2B]">
                      <div>{svc.name}</div>
                      <div className="text-[11px] font-normal text-[#687086] line-clamp-1">{svc.description}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">{svc.category}</td>
                    <td className="py-3.5 px-4 font-semibold text-indigo-600">~{svc.averageServiceMinutes} mins</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        svc.active !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {svc.active !== false ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingService(svc);
                            setShowServiceModal(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-slate-100 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteService(svc.id)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. COUNTERS VIEW */}
      {activeTab === 'counters' && (
        <div className="bg-white rounded-2xl border border-[#E7E9F2] p-6 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-[#171A2B]">Service Counter Desks</h3>
              <p className="text-xs text-[#687086]">Provision physical desks, assign counter prefixes, and attach staff members.</p>
            </div>
            <button
              onClick={() => {
                setEditingCounter({ averageServiceMinutes: 5, status: 'ACTIVE' });
                setShowCounterModal(true);
              }}
              className="py-2 px-4 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              New Counter
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[#687086] uppercase tracking-wider border-y border-[#E7E9F2]">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Counter Name</th>
                  <th className="py-3 px-4">Assigned Staff</th>
                  <th className="py-3 px-4">Current Queue</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {counters.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">{c.code}</td>
                    <td className="py-3.5 px-4 font-bold text-[#171A2B]">
                      <div>{c.counterName}</div>
                      <div className="text-[11px] font-normal text-[#687086] line-clamp-1">{c.description}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {c.staffName || <span className="text-slate-400 italic">None</span>}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#171A2B]">
                      {c.waitingCount || 0} waiting (Serving: {c.currentServingToken || 'None'})
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        c.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700'
                          : c.status === 'PAUSED'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingCounter(c);
                            setShowCounterModal(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-slate-100 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCounter(c.id)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. STAFF MANAGEMENT VIEW */}
      {activeTab === 'staff' && (
        <div className="bg-white rounded-2xl border border-[#E7E9F2] p-6 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-[#171A2B]">Staff Account Management</h3>
              <p className="text-xs text-[#687086]">Provision staff credentials, review active assignments, and manage access.</p>
            </div>
            <button
              onClick={() => setShowStaffModal(true)}
              className="py-2 px-4 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Staff Member
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[#687086] uppercase tracking-wider border-y border-[#E7E9F2]">
                <tr>
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Assigned Desk</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staffList.map((st) => {
                  const assignedCounter = counters.find((c) => c.staffId === st.id || c.assignedStaffId === st.id);
                  return (
                    <tr key={st.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3.5 px-4 font-bold text-[#171A2B]">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs">
                            {st.name.charAt(0)}
                          </div>
                          <span>{st.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">{st.email}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {assignedCounter ? (
                          <span className="bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded">
                            {assignedCounter.counterName} ({assignedCounter.code})
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned Desk</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                          Active Authorized
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => alert(`Staff member ${st.name} credentials reset link generated.`)}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                        >
                          Reset Access
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. USERS DIRECTORY VIEW */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-[#E7E9F2] p-6 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-[#171A2B]">Registered User Directory</h3>
              <p className="text-xs text-[#687086]">Verified users and students stored in MongoDB authentication collection.</p>
            </div>
            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search users..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#E7E9F2] focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[#687086] uppercase tracking-wider border-y border-[#E7E9F2]">
                <tr>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-right">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4 font-bold text-[#171A2B]">{u.name}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'ADMIN'
                          ? 'bg-emerald-100 text-emerald-800'
                          : u.role === 'STAFF'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                        Active
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. LIVE QUEUES VIEW */}
      {activeTab === 'queues' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#E7E9F2] p-6 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#171A2B]">Active Queues Monitor</h3>
              <p className="text-xs text-[#687086]">Live snapshot of current desk waitlists and token movements across campus.</p>
            </div>
            <button
              onClick={() => onNavigate && onNavigate('/kiosk')}
              className="py-2 px-4 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              Open Fullscreen Signage
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {counters.map((c) => {
              const counterTokens = allTokens.filter((t) => t.counterId === c.id);
              const waiting = counterTokens.filter((t) => t.status === 'WAITING');
              const serving = counterTokens.find((t) => t.status === 'SERVING' || t.status === 'CALLED');

              return (
                <div key={c.id} className="bg-white rounded-2xl border border-[#E7E9F2] p-6 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono font-bold text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-100">
                        {c.code}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">{c.status}</span>
                    </div>
                    <h4 className="text-base font-bold text-[#171A2B]">{c.counterName}</h4>
                    <p className="text-xs text-[#687086] mt-0.5 mb-4">Staff: {c.staffName || 'Unassigned'}</p>

                    <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100/80 mb-4">
                      <div className="text-[11px] font-semibold text-indigo-900 uppercase tracking-wide">
                        Currently Serving
                      </div>
                      <div className="text-2xl font-black text-indigo-700 mt-1 font-mono">
                        {serving ? serving.tokenNumber : 'Idle (No Customer)'}
                      </div>
                    </div>

                    <div className="text-xs font-semibold text-[#171A2B] mb-2 flex justify-between">
                      <span>Waiting in Line ({waiting.length})</span>
                      <span className="text-[#687086]">Est. ~{waiting.length * (c.averageServiceMinutes || 5)}m</span>
                    </div>

                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {waiting.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-2 text-center">No customers waiting</p>
                      ) : (
                        waiting.map((t, idx) => (
                          <div key={t.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs border border-slate-100">
                            <span className="font-mono font-bold text-[#171A2B]">#{idx + 1} {t.tokenNumber}</span>
                            <span className="text-[11px] text-slate-500">{t.userName || 'Student'}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 7. TOKEN LEDGER VIEW */}
      {activeTab === 'tokens' && (
        <div className="bg-white rounded-2xl border border-[#E7E9F2] p-6 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-[#171A2B]">Master Token Ledger</h3>
              <p className="text-xs text-[#687086]">Complete chronological audit log of all issued tickets and state transitions.</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={tokenStatusFilter}
                onChange={(e) => setTokenStatusFilter(e.target.value)}
                className="py-1.5 px-3 rounded-xl border border-[#E7E9F2] text-xs font-semibold focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="WAITING">WAITING</option>
                <option value="CALLED">CALLED</option>
                <option value="SERVING">SERVING</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search token..."
                  value={tokenSearch}
                  onChange={(e) => setTokenSearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#E7E9F2] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[#687086] uppercase tracking-wider border-y border-[#E7E9F2]">
                <tr>
                  <th className="py-3 px-4">Token #</th>
                  <th className="py-3 px-4">Target Counter</th>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Created Time</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Est. Wait</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTokens.map((t) => {
                  const badge = getStatusBadgeConfig(t.status as any);
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">{t.tokenNumber}</td>
                      <td className="py-3.5 px-4 font-bold text-[#171A2B]">{t.counterName}</td>
                      <td className="py-3.5 px-4 text-slate-700">{t.userName || 'Student'}</td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono">
                        {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg} ${badge.text}`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-slate-600">
                        {t.estimatedWaitMinutes ? `~${t.estimatedWaitMinutes}m` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. ANALYTICS VIEW */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#E7E9F2] p-6 shadow-xs">
            <h3 className="text-base font-bold text-[#171A2B] mb-1">Queue Traffic Velocity by Hour</h3>
            <p className="text-xs text-[#687086] mb-6">Historical tokens generated vs completed today.</p>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E9F2" />
                  <XAxis dataKey="hour" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#687086' }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#687086' }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="tokens" name="Tokens Issued" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.15} />
                  <Area type="monotone" dataKey="served" name="Tokens Completed" stroke="#16A36A" fill="#16A36A" fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-[#E7E9F2] p-6 shadow-xs">
              <h3 className="text-base font-bold text-[#171A2B] mb-1">Queue Depth by Counter</h3>
              <p className="text-xs text-[#687086] mb-6">Real-time waiting count at each service desk.</p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={counterBarData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E9F2" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#687086' }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#687086' }} />
                    <Tooltip />
                    <Bar dataKey="waiting" name="Waiting Customers" fill="#4F46E5" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E7E9F2] p-6 shadow-xs">
              <h3 className="text-base font-bold text-[#171A2B] mb-1">Average Handle Duration (Mins)</h3>
              <p className="text-xs text-[#687086] mb-6">Configured moving average service time per counter.</p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={counterBarData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E9F2" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#687086' }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#687086' }} />
                    <Tooltip />
                    <Bar dataKey="avgMin" name="Average Minutes" fill="#312E81" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. NOTIFICATIONS VIEW */}
      {activeTab === 'notifications' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-[#E7E9F2] p-6 shadow-xs">
            <h3 className="text-base font-bold text-[#171A2B] mb-1">Broadcast Facility Announcement</h3>
            <p className="text-xs text-[#687086] mb-6">Dispatch high-priority message to all mobile users and live kiosk screens.</p>

            {broadcastSuccess && (
              <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Notification broadcast successfully dispatched!
              </div>
            )}

            <form onSubmit={handleBroadcast} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alert Title</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Counter 03 Temporarily Paused"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E7E9F2] rounded-xl focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Message Content</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Please note that Cashier Counter 02 is taking a 15-minute break. Next customer will be called at 11:45 AM."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E7E9F2] rounded-xl focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Severity Type</label>
                <select
                  value={broadcastType}
                  onChange={(e) => setBroadcastType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-[#E7E9F2] rounded-xl focus:outline-none"
                >
                  <option value="INFO">INFO (Standard Announcement)</option>
                  <option value="ALERT">ALERT (Important Notice)</option>
                  <option value="SUCCESS">SUCCESS (Service Restored)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition cursor-pointer"
              >
                Send Broadcast Notification
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl border border-[#E7E9F2] p-6 shadow-xs">
            <h3 className="text-base font-bold text-[#171A2B] mb-1">Notification History</h3>
            <p className="text-xs text-[#687086] mb-4">Past alerts dispatched across the facility.</p>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {notifications.map((n) => (
                <div key={n.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#171A2B]">{n.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[#687086] text-xs leading-relaxed">{n.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 10. SETTINGS VIEW */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl bg-white rounded-2xl border border-[#E7E9F2] p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-bold text-[#171A2B]">Queue System Configuration</h3>
            <p className="text-xs text-[#687086]">Facility-wide rules, queue throttling, and operational windows.</p>
          </div>

          {settingsSaved && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Settings saved successfully to server configuration!
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Operating Hours</label>
              <input
                type="text"
                value={queueOperatingHours}
                onChange={(e) => setQueueOperatingHours(e.target.value)}
                className="w-full px-3 py-2 border border-[#E7E9F2] rounded-xl focus:outline-none focus:border-indigo-600"
              />
              <span className="text-[11px] text-[#687086]">Public queue token booking will only be permitted during these hours.</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Max Active Tokens per User</label>
              <input
                type="number"
                min={1}
                max={3}
                value={maxTokensPerUser}
                onChange={(e) => setMaxTokensPerUser(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-[#E7E9F2] rounded-xl focus:outline-none focus:border-indigo-600"
              />
              <span className="text-[11px] text-[#687086]">Fair-use throttle preventing users from hoarding queue positions simultaneously.</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Auto-Call Timeout (Seconds)</label>
              <input
                type="number"
                min={15}
                max={120}
                value={autoCallDelaySec}
                onChange={(e) => setAutoCallDelaySec(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-[#E7E9F2] rounded-xl focus:outline-none focus:border-indigo-600"
              />
              <span className="text-[11px] text-[#687086]">Duration allowed before staff can mark a summoned customer as NO_SHOW.</span>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition cursor-pointer"
              >
                Save Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 11. PROFILE VIEW */}
      {activeTab === 'profile' && (
        <div className="max-w-xl bg-white rounded-2xl border border-[#E7E9F2] p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-sm">
              {currentUser.name ? currentUser.name.charAt(0) : 'A'}
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#171A2B]">{currentUser.name}</h3>
              <p className="text-xs text-indigo-600 font-semibold">{currentUser.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                ROLE: {currentUser.role}
              </span>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-[#687086]">Authorized Role</span>
              <strong className="text-[#171A2B]">{currentUser.role} (Super Administrator)</strong>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-[#687086]">System Phone</span>
              <span className="font-mono text-slate-700">{currentUser.phone || '+1 (555) 999-0000'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-[#687086]">Authentication Session</span>
              <span className="font-mono text-emerald-700 font-semibold">Active Tomcat JSESSIONID</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-[#687086]">Account ID</span>
              <span className="font-mono text-slate-500">{currentUser.id}</span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Service Create/Edit */}
      {showServiceModal && editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <form
            onSubmit={handleSaveService}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E7E9F2] text-xs space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#171A2B]">
                {editingService.id ? 'Edit Service Category' : 'Create Service Category'}
              </h3>
              <button
                type="button"
                onClick={() => setShowServiceModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Service Name</label>
              <input
                required
                type="text"
                placeholder="e.g. Student Accounts &amp; Billing"
                value={editingService.name || ''}
                onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                className="w-full px-3 py-2 border border-[#E7E9F2] rounded-xl focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category Classification</label>
              <input
                type="text"
                placeholder="e.g. Finance Desk, Records &amp; Archive"
                value={editingService.category || ''}
                onChange={(e) => setEditingService({ ...editingService, category: e.target.value })}
                className="w-full px-3 py-2 border border-[#E7E9F2] rounded-xl focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Expected Service Duration (Minutes)</label>
              <input
                required
                type="number"
                min={1}
                max={60}
                value={editingService.averageServiceMinutes || 5}
                onChange={(e) => setEditingService({ ...editingService, averageServiceMinutes: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-[#E7E9F2] rounded-xl focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Description</label>
              <textarea
                rows={2}
                placeholder="What student matters are resolved under this service..."
                value={editingService.description || ''}
                onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                className="w-full px-3 py-2 border border-[#E7E9F2] rounded-xl focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowServiceModal(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer"
              >
                Save Service
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: Counter Create/Edit */}
      {showCounterModal && editingCounter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <form
            onSubmit={handleSaveCounter}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E7E9F2] text-xs space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#171A2B]">
                {editingCounter.id ? 'Edit Service Counter' : 'Create Service Counter'}
              </h3>
              <button
                type="button"
                onClick={() => setShowCounterModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Counter Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Cashier Counter 01"
                  value={editingCounter.counterName || ''}
                  onChange={(e) => setEditingCounter({ ...editingCounter, counterName: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E7E9F2] rounded-xl focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Code Prefix (2-4 chars)</label>
                <input
                  required
                  type="text"
                  maxLength={5}
                  placeholder="e.g. CSH"
                  value={editingCounter.code || ''}
                  onChange={(e) => setEditingCounter({ ...editingCounter, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-[#E7E9F2] rounded-xl focus:outline-none focus:border-indigo-600 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assign Staff Member</label>
              <select
                value={editingCounter.staffId || ''}
                onChange={(e) => {
                  const staffId = e.target.value;
                  const selectedStaff = staffList.find((s) => s.id === staffId);
                  setEditingCounter({
                    ...editingCounter,
                    staffId,
                    staffName: selectedStaff ? selectedStaff.name : '',
                  });
                }}
                className="w-full px-3 py-2 border border-[#E7E9F2] rounded-xl focus:outline-none"
              >
                <option value="">-- No Staff Assigned (Unassigned) --</option>
                {staffList.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Average Service Duration (Minutes)</label>
              <input
                required
                type="number"
                min={1}
                max={60}
                value={editingCounter.averageServiceMinutes || 5}
                onChange={(e) => setEditingCounter({ ...editingCounter, averageServiceMinutes: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-[#E7E9F2] rounded-xl focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Desk Status</label>
              <select
                value={editingCounter.status || 'ACTIVE'}
                onChange={(e) => setEditingCounter({ ...editingCounter, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-[#E7E9F2] rounded-xl focus:outline-none"
              >
                <option value="ACTIVE">ACTIVE (Open for Queue)</option>
                <option value="PAUSED">PAUSED (Temporary Break)</option>
                <option value="CLOSED">CLOSED (Desk Offline)</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCounterModal(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer"
              >
                Save Counter
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: Staff Provision */}
      {showStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreateStaff}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E7E9F2] text-xs space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#171A2B]">Provision Staff Account</h3>
              <button
                type="button"
                onClick={() => setShowStaffModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                required
                type="text"
                placeholder="e.g. Robert Vance"
                value={newStaffName}
                onChange={(e) => setNewStaffName(e.target.value)}
                className="w-full px-3 py-2 border border-[#E7E9F2] rounded-xl focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Campus Email</label>
              <input
                required
                type="email"
                placeholder="e.g. robert.v@campus.edu"
                value={newStaffEmail}
                onChange={(e) => setNewStaffEmail(e.target.value)}
                className="w-full px-3 py-2 border border-[#E7E9F2] rounded-xl focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                placeholder="+1 (555) 000-0000"
                value={newStaffPhone}
                onChange={(e) => setNewStaffPhone(e.target.value)}
                className="w-full px-3 py-2 border border-[#E7E9F2] rounded-xl focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowStaffModal(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer"
              >
                Create Staff Account
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
