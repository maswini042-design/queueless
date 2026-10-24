import React, { useState } from 'react';
import {
  ArrowRight,
  Clock,
  Layers,
  MapPin,
  Search,
  Sparkles,
  Ticket,
  UserCheck,
  Users,
} from 'lucide-react';
import { Counter, Service, User } from '../types';

interface PublicServicesPageProps {
  counters: Counter[];
  currentUser: User | null;
  onNavigate: (path: string) => void;
}

export const PublicServicesPage: React.FC<PublicServicesPageProps> = ({
  counters,
  currentUser,
  onNavigate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = ['ALL', 'Academic Services', 'Finance Desk', 'Records & Archive', 'Security & Campus', 'Financial Aid'];

  const filteredCounters = counters.filter((c) => {
    const matchesSearch =
      c.counterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleJoinClick = (counter: Counter) => {
    if (currentUser) {
      onNavigate('/user/dashboard');
    } else {
      onNavigate('/user/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FC] text-[#171A2B]">
      {/* Header */}
      <section className="bg-white border-b border-[#E7E9F2] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-700 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Live Campus Directory
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#171A2B] mb-3">
              Campus Service Counters
            </h1>
            <p className="text-sm md:text-base text-[#687086]">
              Check live queue lengths, active staff desks, and estimated wait times before booking your token.
            </p>
          </div>

          {/* Search bar */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 max-w-xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search services (e.g. Admissions, Cashier, ID Card)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E7E9F2] bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 text-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCounters.map((c) => {
            const isAvailable = c.status === 'ACTIVE';
            return (
              <div
                key={c.id}
                className="bg-white rounded-2xl p-6 border border-[#E7E9F2] shadow-xs flex flex-col justify-between hover:border-indigo-200 transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2.5 py-1 text-xs font-mono font-bold bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100">
                      {c.code}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        isAvailable
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                        }`}
                      />
                      {isAvailable ? 'Counter Active' : 'Offline'}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#171A2B] mb-2">{c.counterName}</h3>
                  <p className="text-xs text-[#687086] leading-relaxed mb-6 line-clamp-2">
                    {c.description || 'General inquiry desk and official university student service counter.'}
                  </p>

                  <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-[#E7E9F2] mb-6 text-center">
                    <div>
                      <div className="text-[11px] font-medium text-[#687086] uppercase tracking-wider">
                        In Waiting Line
                      </div>
                      <div className="text-xl font-bold text-indigo-600 mt-0.5">
                        {c.waitingCount ?? 0}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-medium text-[#687086] uppercase tracking-wider">
                        Est. Wait
                      </div>
                      <div className="text-xl font-bold text-[#171A2B] mt-0.5">
                        ~{((c.waitingCount || 0) * (c.averageServiceMinutes || 5))} min
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleJoinClick(c)}
                  disabled={!isAvailable}
                  className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer ${
                    isAvailable
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Ticket className="w-4 h-4" />
                  {currentUser ? 'Book Token at this Counter' : 'Sign In to Join Queue'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
