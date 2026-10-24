import React from 'react';
import { ArrowLeft, Clock, Lock, ShieldCheck } from 'lucide-react';

interface PrivacyPageProps {
  onNavigate: (path: string) => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onNavigate }) => {
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
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#171A2B]">
                Privacy Policy
              </h1>
              <span className="text-xs text-[#687086]">
                QueueLess Enterprise Data Protection — Effective October 2026
              </span>
            </div>
          </div>

          <div className="prose prose-slate max-w-none text-sm text-[#687086] space-y-6 leading-relaxed">
            <section>
              <h2 className="text-base font-bold text-[#171A2B] mb-2">1. Overview</h2>
              <p>
                QueueLess – Smart Queue Prediction and Management System is committed to safeguarding the privacy and security of user, student, staff, and institutional data. This policy details how queue transactions and personal credentials are collected, processed, and safeguarded.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#171A2B] mb-2">2. Information We Collect</h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Account Information:</strong> Name, institutional email, phone number, and hashed authentication credentials (salted via BCrypt).</li>
                <li><strong>Queue Operations:</strong> Service category requested, counter assignment, token generation timestamp, queue duration, and service status (WAITING, CALLED, SERVING, COMPLETED).</li>
                <li><strong>Session &amp; Security Logs:</strong> HTTP session identifiers (JSESSIONID), role authorization records, and operational audit trails.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#171A2B] mb-2">3. Storage &amp; Encryption</h2>
              <p>
                Passwords are never stored in plaintext; all credentials undergo secure BCrypt hashing prior to storage in MongoDB collections. Session cookies are maintained strictly with <code className="text-xs bg-slate-100 px-1 py-0.5 rounded text-indigo-700">HttpOnly</code> and <code className="text-xs bg-slate-100 px-1 py-0.5 rounded text-indigo-700">SameSite=Lax</code> security attributes.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#171A2B] mb-2">4. Data Retention &amp; Rights</h2>
              <p>
                Token transactions and service logs are retained for institutional auditing and wait-time prediction algorithm tuning. Users may request account deactivation or historical queue record purge by contacting the system administrator.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
