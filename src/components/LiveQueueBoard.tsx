import React, { useEffect, useState } from 'react';
import { ArrowLeft, Clock, Monitor, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { Counter, Token } from '../types';

interface LiveQueueBoardProps {
  counters: Counter[];
  tokens: Token[];
  onBack: () => void;
}

export const LiveQueueBoard: React.FC<LiveQueueBoardProps> = ({
  counters,
  tokens,
  onBack,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeCounters = counters.filter((c) => c.status === 'ACTIVE');

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 sm:p-10 flex flex-col justify-between -m-4 sm:-m-6 lg:-m-8">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition cursor-pointer flex items-center gap-2 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Exit Display Mode
          </button>
          <div>
            <span className="text-xs uppercase tracking-widest text-blue-400 font-bold block">
              Campus Live Queue Terminal
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-0.5">
              QueueLess Display
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
              soundEnabled
                ? 'bg-blue-600/20 border-blue-500/40 text-blue-400'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{soundEnabled ? 'Chime Active' : 'Muted'}</span>
          </button>

          <div className="text-right">
            <span className="text-2xl sm:text-3xl font-mono font-black text-slate-200">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <span className="text-xs text-slate-500 block">
              {currentTime.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Active Counters Cards */}
      <div className="py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeCounters.map((counter) => {
            const servingToken = tokens.find((t) => t.counterId === counter.id && (t.status === 'SERVING' || t.status === 'CALLED'));
            const waitingCount = tokens.filter((t) => t.counterId === counter.id && t.status === 'WAITING').length;
            const nextToken = tokens.filter((t) => t.counterId === counter.id && t.status === 'WAITING')[0];

            return (
              <div
                key={counter.id}
                className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />

                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 font-mono text-xs font-bold border border-blue-400/30">
                      DESK {counter.code}
                    </span>
                    <span className="text-xs font-medium text-slate-400">
                      {counter.staffName || 'Operator On Duty'}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-slate-100">
                    {counter.counterName}
                  </h2>

                  {/* Big Number Now Serving */}
                  <div className="my-6 bg-slate-950 rounded-2xl p-6 text-center border border-slate-800/80">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 block mb-1">
                      Now Serving
                    </span>
                    <div className="text-5xl font-mono font-black text-blue-400 tracking-tight">
                      {servingToken ? servingToken.tokenNumber : '— IDLE —'}
                    </div>
                    {servingToken && (
                      <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {servingToken.status === 'CALLED' ? 'Proceed to Desk' : 'In Service'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>
                    Next in line:{' '}
                    <strong className="text-slate-200 font-mono font-bold">
                      {nextToken ? nextToken.tokenNumber : 'None'}
                    </strong>
                  </span>
                  <span>
                    Waiting:{' '}
                    <strong className="text-blue-400 font-bold">{waitingCount}</strong>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Ticker */}
      <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>Please proceed promptly to the designated desk when your token is called.</span>
        </div>
        <div className="font-mono text-[11px]">
          QueueLess Real-Time Campus Display &bull; Apache Tomcat 10.1 &bull; Jakarta Servlet 6.0
        </div>
      </div>
    </div>
  );
};
