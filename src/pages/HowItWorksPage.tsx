import React from 'react';
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  Clock,
  Layers,
  Monitor,
  PhoneCall,
  QrCode,
  ShieldCheck,
  Smartphone,
  Ticket,
  UserCheck,
  Users,
} from 'lucide-react';

interface HowItWorksPageProps {
  onNavigate: (path: string) => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ onNavigate }) => {
  const steps = [
    {
      step: '01',
      title: 'Select Facility Service',
      desc: 'Users browse available campus or office desks (Admissions, Billing, Registrar, ID Cards) and view live queue depths before joining.',
      icon: <Layers className="w-6 h-6 text-indigo-600" />,
      tag: 'Discovery',
    },
    {
      step: '02',
      title: 'Generate Digital Queue Token',
      desc: 'With one click, the system securely generates a unique token (e.g., ADM-104) and computes an accurate wait-time forecast.',
      icon: <Ticket className="w-6 h-6 text-emerald-600" />,
      tag: 'Instant Ticket',
    },
    {
      step: '03',
      title: 'Track Live Status Remotely',
      desc: 'Users can relax in campus lounges or cafeterias while tracking their dynamic position and wait countdown in real time on mobile.',
      icon: <Smartphone className="w-6 h-6 text-blue-600" />,
      tag: 'Freedom',
    },
    {
      step: '04',
      title: 'Staff Calls Token to Counter',
      desc: 'When a counter opens, staff click "Call Next". The token updates immediately on lobby screens and alerts the user.',
      icon: <PhoneCall className="w-6 h-6 text-purple-600" />,
      tag: 'Staff Dispatch',
    },
    {
      step: '05',
      title: 'Service & History Completion',
      desc: 'Staff mark the consultation completed. The duration is logged in MongoDB to further refine future wait-time accuracy.',
      icon: <CheckCircle2 className="w-6 h-6 text-teal-600" />,
      tag: 'Closure & Analytics',
    },
  ];

  const states = [
    { name: 'WAITING', color: 'bg-amber-100 text-amber-800 border-amber-200', desc: 'Token is in line; position counts down dynamically.' },
    { name: 'CALLED', color: 'bg-blue-100 text-blue-800 border-blue-200', desc: 'Counter staff has summoned user; chime alerts user.' },
    { name: 'SERVING', color: 'bg-indigo-100 text-indigo-800 border-indigo-200', desc: 'User is present at desk; active timer running.' },
    { name: 'COMPLETED', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', desc: 'Transaction finished; logged to service history.' },
    { name: 'NO_SHOW', color: 'bg-slate-100 text-slate-800 border-slate-200', desc: 'Customer did not arrive; staff can recall if needed.' },
    { name: 'CANCELLED', color: 'bg-rose-100 text-rose-800 border-rose-200', desc: 'Cancelled by user or system administrator.' },
  ];

  return (
    <div className="min-h-screen bg-[#F7F8FC] text-[#171A2B]">
      {/* Hero Header */}
      <section className="bg-white border-b border-[#E7E9F2] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-700 mb-4">
            <Clock className="w-3.5 h-3.5" />
            Transparent 5-Stage Queue Lifecycle
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#171A2B] mb-4">
            How QueueLess Eliminates Physical Waiting Lines
          </h1>
          <p className="max-w-2xl mx-auto text-base md:text-lg text-[#687086]">
            From token creation to service desk completion, every stage is synchronized across student mobile screens, staff dispatchers, and lobby boards.
          </p>
        </div>
      </section>

      {/* Steps Flow */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-6">
          {steps.map((s, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 md:p-8 border border-[#E7E9F2] shadow-xs flex flex-col md:flex-row items-start md:items-center gap-6"
            >
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                {s.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1.5">
                  <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                    STAGE {s.step}
                  </span>
                  <span className="text-xs font-semibold text-[#687086] uppercase tracking-wider">
                    {s.tag}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#171A2B] mb-2">{s.title}</h3>
                <p className="text-sm text-[#687086] leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* State Machine Specification */}
      <section className="bg-white border-t border-[#E7E9F2] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-[#171A2B] mb-3">
              Deterministic Token State Machine
            </h2>
            <p className="text-sm text-[#687086]">
              All token transitions are verified strictly by the server-side Java Servlet state machine to prevent race conditions or illegitimate status hops.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {states.map((st, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl border border-[#E7E9F2] bg-[#F7F8FC] flex flex-col justify-between"
              >
                <div>
                  <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-md border ${st.color} mb-3`}>
                    {st.name}
                  </span>
                  <p className="text-xs text-[#687086] leading-relaxed">{st.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={() => onNavigate('/portals')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-xs transition cursor-pointer"
            >
              Get Started with QueueLess
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
