import React from 'react';
import {
  ArrowRight,
  BarChart3,
  Bell,
  CheckCircle2,
  Clock,
  Cpu,
  Layers,
  Lock,
  Monitor,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react';

interface FeaturesPageProps {
  onNavigate: (path: string) => void;
}

export const FeaturesPage: React.FC<FeaturesPageProps> = ({ onNavigate }) => {
  const coreFeatures = [
    {
      icon: <Clock className="w-6 h-6 text-indigo-600" />,
      title: 'Smart Queue Prediction Engine',
      description:
        'Continuous wait-time forecasting using historical service durations, active counter capacity, and real-time arrival velocity.',
      points: [
        'Dynamic moving average calculation',
        'Staff serving rate adaptation',
        'Transparent confidence metrics',
      ],
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
      title: 'Role-Based Authentication & Security',
      description:
        'Three isolated security portals with server-side session authentication, bcrypt password hashing, and zero role leakage.',
      points: [
        'Isolated Admin, Staff & User credentials',
        'Strict server-side privilege validation',
        'Session fixation defense & HttpOnly cookies',
      ],
    },
    {
      icon: <Monitor className="w-6 h-6 text-blue-600" />,
      title: 'Digital Signage & Kiosk Displays',
      description:
        'High-contrast live queue boards for lobby TVs and public monitors with instant audio-visual calling announcements.',
      points: [
        'Fullscreen kiosk presentation mode',
        'Auto-cycling counter status',
        'Real-time token status updates',
      ],
    },
    {
      icon: <Zap className="w-6 h-6 text-amber-600" />,
      title: 'Concurrency-Safe Token Operations',
      description:
        'Atomic database transactions preventing double-calling or skipped tokens across multiple concurrent staff desks.',
      points: [
        'Atomic status transitions',
        'Anti-double-booking safeguards',
        'Full queue integrity guarantees',
      ],
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-purple-600" />,
      title: 'Operational Analytics & Reports',
      description:
        'System-wide throughput graphs, peak-hour bottlenecks, and staff service-time tracking for facility administrators.',
      points: [
        'Hourly traffic distribution',
        'Average handle time per counter',
        'Daily completion and no-show rates',
      ],
    },
    {
      icon: <Smartphone className="w-6 h-6 text-rose-600" />,
      title: 'Mobile Queue Tracking for Users',
      description:
        'Users can monitor their position, estimated wait countdown, and service updates from any mobile smartphone browser.',
      points: [
        'No mobile app download required',
        'Live position and wait countdown',
        'Instant digital ticket generation',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F8FC] text-[#171A2B]">
      {/* Header Banner */}
      <section className="bg-white border-b border-[#E7E9F2] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-700 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Enterprise-Grade Queue Management
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#171A2B] mb-4">
            Engineered for High-Throughput Service Desks
          </h1>
          <p className="max-w-3xl mx-auto text-base md:text-lg text-[#687086]">
            QueueLess replaces chaotic physical lines with an intelligent, predictive digital workflow
            connecting students, staff counters, and department leadership.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => onNavigate('/portals')}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-sm transition flex items-center gap-2 cursor-pointer"
            >
              Explore Portals
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('/services')}
              className="px-5 py-2.5 bg-white hover:bg-slate-50 text-[#171A2B] border border-[#E7E9F2] font-medium text-sm rounded-lg shadow-xs transition cursor-pointer"
            >
              Browse Active Services
            </button>
          </div>
        </div>
      </section>

      {/* Grid of features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {coreFeatures.map((feat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-[#E7E9F2] shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-[#E7E9F2] flex items-center justify-center mb-5">
                  {feat.icon}
                </div>
                <h3 className="text-lg font-bold text-[#171A2B] mb-2">{feat.title}</h3>
                <p className="text-sm text-[#687086] leading-relaxed mb-6">{feat.description}</p>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-2">
                {feat.points.map((pt, pIdx) => (
                  <div key={pIdx} className="flex items-center gap-2 text-xs text-[#171A2B]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Architecture Highlights */}
      <section className="bg-white border-t border-[#E7E9F2] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#171A2B] text-white rounded-3xl p-8 md:p-12 relative overflow-hidden">
            <div className="max-w-2xl relative z-10">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 block mb-2">
                Under the Hood
              </span>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Java Servlets & MongoDB High-Concurrency Backend
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                QueueLess uses Jakarta Servlets 6.0 deployed on Apache Tomcat 10.1 with the official MongoDB Java Synchronous Driver. All queue status transitions, token numbers, and session authorizations execute with transactional integrity.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-mono">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-slate-400">Application Server</div>
                  <div className="text-white font-bold mt-1">Apache Tomcat 10.1</div>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-slate-400">Database Engine</div>
                  <div className="text-white font-bold mt-1">MongoDB 7+</div>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-slate-400">Security Standard</div>
                  <div className="text-white font-bold mt-1">BCrypt + Sessions</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
