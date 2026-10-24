import React from 'react';
import { ArrowLeft, Clock, FileText, Scale } from 'lucide-react';

interface TermsPageProps {
  onNavigate: (path: string) => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#F7F8FC] text-[#171A2B] py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => onNavigate('/')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800 mb-8 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        <div className="bg-white rounded-3xl p-8 md:p-12 border border-[#E7E9F2] shadow-xs">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#171A2B]">
                Terms of Service
              </h1>
              <span className="text-xs text-[#687086]">
                QueueLess Operating Guidelines — Academic &amp; Facility Deployment
              </span>
            </div>
          </div>

          <div className="prose prose-slate max-w-none text-sm text-[#687086] space-y-6 leading-relaxed">
            <section>
              <h2 className="text-base font-bold text-[#171A2B] mb-2">1. Acceptance of Terms</h2>
              <p>
                By accessing QueueLess, booking service tokens, or managing desk counters, users agree to abide by institutional queue regulations, fair booking principles, and these terms.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#171A2B] mb-2">2. Single Active Token Rule</h2>
              <p>
                To maintain fair access for all facility visitors, each registered account is permitted only one active token (in WAITING, CALLED, or SERVING state) per specific counter or service desk at any given time.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#171A2B] mb-2">3. Token Calling &amp; No-Show Policy</h2>
              <p>
                When a token number is summoned to a physical desk, users receive visual and audible notification on lobby signage and mobile views. If the user fails to report within the designated grace period, counter staff reserve the right to flag the ticket as NO_SHOW or advance to the next customer.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#171A2B] mb-2">4. Wait-Time Forecasting Disclaimer</h2>
              <p>
                Predicted wait times are statistical estimates based on moving average handling times and active desk concurrency. Unforeseen student complexities or emergency counter closures may alter actual service timing.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
