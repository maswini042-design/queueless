import React, { useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  Bell,
  CheckCircle2,
  ChevronDown,
  Clock,
  Layers,
  MapPin,
  QrCode,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Ticket,
  UserCheck,
  Users,
  Zap,
} from 'lucide-react';
import { Counter } from '../types';

interface HomePageProps {
  counters: Counter[];
  onNavigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ counters, onNavigate }) => {
  const [selectedDemoCounter, setSelectedDemoCounter] = useState<string>(
    counters[0]?.id || 'c-adm'
  );
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const activeCounter = counters.find((c) => c.id === selectedDemoCounter) || counters[0];

  const faqs = [
    {
      q: 'How does QueueLess predict wait times accurately?',
      a: 'QueueLess utilizes an adaptive queue prediction algorithm that continuously analyzes historical service durations, active counter capacity, and current queue depth. The prediction model updates dynamically each time a token is called or completed.',
    },
    {
      q: 'Do users need to install an app or create an account to get a token?',
      a: 'Users can register in seconds with just their name and email, or browse live queue board displays on digital signage without registering. Digital tokens can be tracked on any mobile browser.',
    },
    {
      q: 'Can staff members recall or skip absent customers?',
      a: 'Yes. Staff consoles provide one-click controls to call the next customer, begin service, mark completion, or safely skip a no-show token with option to recall if they arrive shortly after.',
    },
    {
      q: 'How do administrators manage service desks and staff assignments?',
      a: 'The Administrator Command Center allows creating multiple service categories, configuring estimated service minutes, provisioning staff accounts, and tracking system-wide performance metrics in real time.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F8FC] text-[#171A2B] font-sans">
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden border-b border-[#E7E9F2] bg-white">
        <div className="absolute inset-0 bg-radial-[circle_at_top_right] from-indigo-50/50 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Value Prop & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Next-Generation Queue Intelligence</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#171A2B] leading-[1.12]">
                Your Turn. <br />
                <span className="text-indigo-600">Without the Wait.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#687086] max-w-xl font-normal leading-relaxed">
                Transform physical wait lines into frictionless digital queues. Join
                from your phone, monitor your position with smart wait-time predictions,
                and arrive right when your number is called.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onNavigate('/user/login')}
                  className="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Get a Token</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigate('/portals')}
                  className="px-6 py-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-[#E7E9F2] text-[#171A2B] font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Users className="w-4 h-4 text-slate-500" />
                  <span>Explore Portals</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-[#E7E9F2] grid grid-cols-3 gap-4 max-w-md text-left">
                <div>
                  <div className="text-2xl font-bold text-[#171A2B]">94%</div>
                  <div className="text-xs text-[#687086] font-medium">Wait Time Saved</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#171A2B]">&lt; 3s</div>
                  <div className="text-xs text-[#687086] font-medium">Token Generation</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#171A2B]">100%</div>
                  <div className="text-xs text-[#687086] font-medium">Digital & Paperless</div>
                </div>
              </div>
            </div>

            {/* Right Column: Live Interactive Token Card Simulator */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md">
                {/* Background decorative glow */}
                <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-3xl blur-lg opacity-20" />

                <div className="relative bg-white rounded-2xl border border-[#E7E9F2] shadow-xl p-6 sm:p-7 text-left space-y-6">
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Live Queue Simulator
                        </div>
                        <div className="text-sm font-bold text-[#171A2B]">
                          {activeCounter?.counterName || 'Service Desk'}
                        </div>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Live Queue
                    </span>
                  </div>

                  {/* Token Ticket Display */}
                  <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-xl p-6 text-white text-center shadow-inner relative overflow-hidden">
                    <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full pointer-events-none" />
                    <div className="text-xs font-medium uppercase tracking-widest text-indigo-200">
                      Digital Queue Token
                    </div>
                    <div className="text-5xl font-black tracking-tight my-2">
                      {activeCounter?.code || 'REG'}-104
                    </div>
                    <div className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-xs">
                      Status: Ready Soon
                    </div>
                  </div>

                  {/* Smart Prediction Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-left">
                      <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                        Estimated Wait
                      </div>
                      <div className="text-xl font-bold text-[#171A2B] mt-0.5">
                        ~{((activeCounter?.waitingCount || 1) * (activeCounter?.averageServiceMinutes || 5))} mins
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-left">
                      <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                        Queue Position
                      </div>
                      <div className="text-xl font-bold text-indigo-600 mt-0.5">
                        #{(activeCounter?.waitingCount || 0) + 1} in line
                      </div>
                    </div>
                  </div>

                  {/* Desk Selector Pills */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-2">
                      Simulate Service Desk:
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {counters.slice(0, 4).map((c) => (
                        <button
                          key={c.id}
                          onClick={() => setSelectedDemoCounter(c.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                            selectedDemoCounter === c.id
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {c.code}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate('/user/login')}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Join This Queue Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE COUNTERS MONITOR GRID */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
              Active Desks &amp; Capacities
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#171A2B] tracking-tight">
              Real-Time Service Counters
            </h2>
            <p className="text-sm text-[#687086] mt-1">
              Live status across all operational departments and student service desks.
            </p>
          </div>
          <button
            onClick={() => onNavigate('/kiosk')}
            className="self-start md:self-auto px-4 py-2 rounded-lg border border-[#E7E9F2] bg-white hover:bg-slate-50 text-xs font-semibold text-[#171A2B] flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Smartphone className="w-4 h-4 text-indigo-600" />
            <span>Open Kiosk Display Board</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {counters.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-[#E7E9F2] p-6 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                    {c.code}
                  </span>
                  <h3 className="text-base font-bold text-[#171A2B] mt-2">
                    {c.counterName}
                  </h3>
                  <p className="text-xs text-[#687086] line-clamp-1 mt-0.5">
                    {c.serviceName || c.description}
                  </p>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  OPEN
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-100 my-4 text-left">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Now Serving
                  </span>
                  <span className="text-base font-bold text-[#171A2B] font-mono">
                    {c.currentServingToken || 'None'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Waiting In Line
                  </span>
                  <span className="text-base font-bold text-indigo-600">
                    {c.waitingCount || 0} People
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-[#687086]">
                  Avg handling: <strong>{c.averageServiceMinutes} mins</strong>
                </span>
                <button
                  onClick={() => onNavigate('/user/login')}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 transition cursor-pointer"
                >
                  Join
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3-STEP PROCESS: HOW IT WORKS */}
      <section id="how-it-works" className="py-16 md:py-24 bg-white border-y border-[#E7E9F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">
              Simple 3-Step Flow
            </div>
            <h2 className="text-3xl font-extrabold text-[#171A2B] tracking-tight">
              Eliminate physical lines forever
            </h2>
            <p className="text-sm text-[#687086] mt-2">
              QueueLess makes waiting respectful of everyone's time. Here is how your users experience it.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#F7F8FC] p-8 rounded-2xl border border-[#E7E9F2] relative">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg mb-6 shadow-xs">
                1
              </div>
              <h3 className="text-lg font-bold text-[#171A2B] mb-2">
                Select Your Service
              </h3>
              <p className="text-sm text-[#687086] leading-relaxed">
                Choose the exact service desk or department you need assistance from with up-to-date queue lengths and wait estimates.
              </p>
            </div>

            <div className="bg-[#F7F8FC] p-8 rounded-2xl border border-[#E7E9F2] relative">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg mb-6 shadow-xs">
                2
              </div>
              <h3 className="text-lg font-bold text-[#171A2B] mb-2">
                Receive Digital Token
              </h3>
              <p className="text-sm text-[#687086] leading-relaxed">
                Your digital token confirms your queue position, estimated wait in minutes, and notifies you when your turn approaches.
              </p>
            </div>

            <div className="bg-[#F7F8FC] p-8 rounded-2xl border border-[#E7E9F2] relative">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg mb-6 shadow-xs">
                3
              </div>
              <h3 className="text-lg font-bold text-[#171A2B] mb-2">
                Arrive Right on Time
              </h3>
              <p className="text-sm text-[#687086] leading-relaxed">
                Walk up to the assigned counter right when your ticket turns active. No crowding, no paperwork, zero standing in line.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PORTALS CHOOSER BANNER */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 rounded-3xl p-8 sm:p-12 text-white text-left relative overflow-hidden shadow-2xl">
          <div className="max-w-2xl space-y-4">
            <span className="px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-semibold uppercase tracking-wider">
              Role-Based Access
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Dedicated workspaces for Users, Staff, and Administrators
            </h2>
            <p className="text-indigo-200 text-sm sm:text-base leading-relaxed">
              QueueLess features separate authenticated dashboards tailored to each stakeholder: service counters, desk operators, and campus supervisors.
            </p>
            <div className="pt-4 flex flex-wrap gap-3">
              <button
                onClick={() => onNavigate('/portals')}
                className="px-6 py-3 rounded-xl bg-white text-indigo-900 font-bold text-sm hover:bg-indigo-50 transition cursor-pointer"
              >
                View All Portals
              </button>
              <button
                onClick={() => onNavigate('/admin/login')}
                className="px-6 py-3 rounded-xl bg-indigo-700/60 hover:bg-indigo-700 text-white font-semibold text-sm border border-indigo-400/30 transition cursor-pointer"
              >
                Admin Sign In
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-16 bg-white border-t border-[#E7E9F2]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#171A2B] tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-[#687086] mt-2">
              Everything you need to know about the QueueLess digital queue platform.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-[#E7E9F2] overflow-hidden bg-[#F7F8FC] transition"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full py-4 px-5 text-left font-semibold text-sm text-[#171A2B] flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-100"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      openFaq === idx ? 'rotate-180 text-indigo-600' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 pt-1 text-xs text-[#687086] leading-relaxed border-t border-[#E7E9F2]/60">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLEAN FOOTER */}
      <footer className="bg-white border-t border-[#E7E9F2] py-12 text-xs text-[#687086]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-[#E7E9F2]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                <Clock className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="font-bold text-[#171A2B] text-sm block">QueueLess</span>
                <span className="text-[11px] text-[#687086]">
                  Smart Queue Prediction &amp; Management System
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 font-medium">
              <button
                onClick={() => onNavigate('/')}
                className="hover:text-indigo-600 transition cursor-pointer"
              >
                Home
              </button>
              <button
                onClick={() => onNavigate('/portals')}
                className="hover:text-indigo-600 transition cursor-pointer"
              >
                Portals
              </button>
              <button
                onClick={() => onNavigate('/user/login')}
                className="hover:text-indigo-600 transition cursor-pointer"
              >
                User Login
              </button>
              <button
                onClick={() => onNavigate('/staff/login')}
                className="hover:text-indigo-600 transition cursor-pointer"
              >
                Staff Console
              </button>
              <button
                onClick={() => onNavigate('/admin/login')}
                className="hover:text-indigo-600 transition cursor-pointer"
              >
                Admin Hub
              </button>
              <button
                onClick={() => onNavigate('/kiosk')}
                className="hover:text-indigo-600 transition cursor-pointer"
              >
                Live Kiosk
              </button>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
            <div>&copy; {new Date().getFullYear()} QueueLess. All rights reserved.</div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-slate-600 font-medium">All Services Operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
