import React from 'react';
import {
  ArrowRight,
  Clock,
  KeyRound,
  ShieldCheck,
  Sparkles,
  Ticket,
  UserCheck,
  Users,
} from 'lucide-react';

interface PortalSelectionProps {
  onNavigate: (path: string) => void;
}

export const PortalSelection: React.FC<PortalSelectionProps> = ({ onNavigate }) => {
  const portals = [
    {
      title: 'User & Student Portal',
      role: 'USER',
      badge: 'Public & Students',
      description:
        'Join service queues remotely, generate digital queue tokens, track your queue position, and receive real-time wait-time predictions.',
      icon: Users,
      color: 'indigo',
      loginRoute: '/user/login',
      registerRoute: '/user/register',
      features: [
        'Generate instant digital tokens',
        'Real-time queue position & wait estimate',
        'Token cancellation & history log',
        'Mobile notification alerts',
      ],
      quickCreds: 'student@campus.edu / student123',
    },
    {
      title: 'Staff Service Station',
      role: 'STAFF',
      badge: 'Desk Operators',
      description:
        'Operational console for counter staff to call the next customer, begin service, track handling times, and record completed interactions.',
      icon: UserCheck,
      color: 'blue',
      loginRoute: '/staff/login',
      features: [
        'Assigned service desk controls',
        'Call next, serve, skip, and recall',
        'Live handling duration stopwatch',
        'Shift metrics & completed logs',
      ],
      quickCreds: 'staff1@queueless.com / staff123',
    },
    {
      title: 'Admin Command Center',
      role: 'ADMIN',
      badge: 'Supervisors & IT',
      description:
        'Comprehensive management workspace for configuring service desks, assigning staff members, and analyzing operational flow.',
      icon: ShieldCheck,
      color: 'emerald',
      loginRoute: '/admin/login',
      features: [
        'Full service desk & counter provisioning',
        'Staff account creation & assignments',
        'Real-time analytics & wait-time charts',
        'System & database connectivity health',
      ],
      quickCreds: 'admin@queueless.com / admin123',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F8FC] py-12 px-4 sm:px-6 lg:px-8 text-left">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Multi-Role Access Control</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#171A2B] tracking-tight">
            Select Your QueueLess Workspace
          </h1>
          <p className="text-sm sm:text-base text-[#687086]">
            Choose your authorized portal to sign in. Each portal provides tailored
            workflows, security controls, and role-specific permissions.
          </p>
        </div>

        {/* Portal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {portals.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.role}
                className="bg-white rounded-2xl border border-[#E7E9F2] p-8 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        p.color === 'indigo'
                          ? 'bg-indigo-50 text-indigo-600'
                          : p.color === 'blue'
                          ? 'bg-blue-50 text-blue-600'
                          : 'bg-emerald-50 text-emerald-600'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                      {p.badge}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-[#171A2B] mb-2">{p.title}</h2>
                  <p className="text-xs text-[#687086] leading-relaxed mb-6">
                    {p.description}
                  </p>

                  <div className="space-y-2 mb-6 border-t border-slate-100 pt-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Key Capabilities:
                    </span>
                    {p.features.map((feat, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-[#171A2B]">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-[#E7E9F2]">
                  <button
                    onClick={() => onNavigate(p.loginRoute)}
                    className={`w-full py-2.5 px-4 rounded-xl text-white font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-xs ${
                      p.color === 'indigo'
                        ? 'bg-indigo-600 hover:bg-indigo-700'
                        : p.color === 'blue'
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    <span>Sign In to {p.title.split(' ')[0]}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {p.registerRoute && (
                    <button
                      onClick={() => onNavigate(p.registerRoute)}
                      className="w-full py-2 px-4 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-slate-50 border border-[#E7E9F2] font-semibold text-xs transition cursor-pointer"
                    >
                      Create User Account
                    </button>
                  )}

                  <div className="pt-2 text-[10px] text-slate-400 text-center font-mono">
                    Demo: {p.quickCreds}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Back Link */}
        <div className="text-center pt-4">
          <button
            onClick={() => onNavigate('/')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
          >
            &larr; Back to QueueLess Overview
          </button>
        </div>
      </div>
    </div>
  );
};
