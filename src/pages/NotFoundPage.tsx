import React from 'react';
import { ArrowLeft, Clock, Compass, Home } from 'lucide-react';

interface NotFoundPageProps {
  onNavigate: (path: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#F7F8FC] text-[#171A2B] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#E7E9F2] shadow-sm text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-6">
          <Compass className="w-8 h-8" />
        </div>
        <span className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-widest block mb-2">
          Error 404
        </span>
        <h1 className="text-2xl font-bold text-[#171A2B] mb-2">Page Not Found</h1>
        <p className="text-sm text-[#687086] mb-8">
          The requested route does not exist or has been relocated within the QueueLess system.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => onNavigate('/')}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            Return to Homepage
          </button>
          <button
            onClick={() => onNavigate('/portals')}
            className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-[#171A2B] font-semibold text-xs rounded-xl border border-[#E7E9F2] transition flex items-center justify-center gap-2 cursor-pointer"
          >
            Go to Portals Switcher
          </button>
        </div>
      </div>
    </div>
  );
};
