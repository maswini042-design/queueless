import React, { useState } from 'react';
import {
  Check,
  Clipboard,
  FileCode,
  FolderTree,
  Server,
  Terminal,
  X,
  Database,
  ExternalLink,
} from 'lucide-react';

interface DeploymentGuideModalProps {
  onClose: () => void;
}

export const DeploymentGuideModal: React.FC<DeploymentGuideModalProps> = ({ onClose }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const codeSnippets = [
    // 0: Build WAR command
    `mvn clean package`,
    // 1: Run frontend build into webapp
    `npm run build`,
    // 2: PowerShell env var set
    `$env:MONGODB_URI="mongodb://localhost:27017"\n$env:MONGODB_DATABASE="queueless_db"\nmvn clean package`,
    // 3: Atlas URI example
    `mongodb+srv://admin:StrongPassword123@cluster0.abcde.mongodb.net/queueless_db?retryWrites=true&w=majority`,
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 text-xs max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                QueueLess — IntelliJ IDEA &amp; Apache Tomcat 10.1 Deployment Guide
              </h2>
              <span className="text-[11px] text-slate-500">
                Java 26 &bull; Jakarta Servlet 6.0 &bull; MongoDB Java Driver 5.5.1 &bull; WAR Packaging
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-6 space-y-6 text-slate-700">
          {/* Section 1: Overview */}
          <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200/80 text-blue-950">
            <h3 className="font-bold text-sm mb-1">Architecture Summary</h3>
            <p className="text-xs leading-relaxed text-blue-900/90">
              QueueLess is configured as a single integrated Maven Web Application (WAR) containing both the compiled React SPA frontend (in <code className="bg-blue-100 px-1 py-0.5 rounded text-blue-900 font-mono">src/main/webapp/</code>) and the pure Java 26 Jakarta Servlets (in <code className="bg-blue-100 px-1 py-0.5 rounded text-blue-900 font-mono">com.queueless.*</code>). It runs directly on external Apache Tomcat 10.1 with zero Node.js dependencies at runtime.
            </p>
          </div>

          {/* Section 2: IntelliJ Configuration Steps */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">1</span>
              Importing Project in IntelliJ IDEA
            </h3>
            <ol className="list-decimal list-inside space-y-2 pl-2 text-slate-600 leading-relaxed">
              <li>Launch <strong>IntelliJ IDEA Ultimate</strong> (or Community with Smart Tomcat plugin).</li>
              <li>Click <strong>File &rarr; Open...</strong> and choose the root directory containing <code className="font-mono bg-slate-100 px-1">pom.xml</code>.</li>
              <li>Open as <strong>Maven Project</strong>. IntelliJ will resolve dependencies:
                <ul className="list-disc list-inside pl-4 text-slate-500 text-[11px] mt-1 space-y-0.5">
                  <li><code className="font-mono">jakarta.servlet-api:6.0.0</code> (scope: provided)</li>
                  <li><code className="font-mono">org.mongodb:mongodb-driver-sync:5.5.1</code></li>
                  <li><code className="font-mono">com.google.code.gson:gson:2.12.1</code></li>
                  <li><code className="font-mono">org.mindrot:jbcrypt:0.4</code></li>
                </ul>
              </li>
              <li>Open <strong>File &rarr; Project Structure &rarr; Project</strong>: Set SDK to <strong>JDK 26</strong> and Language Level to <strong>26</strong>.</li>
            </ol>
          </div>

          {/* Section 3: Tomcat 10.1 Run Configuration */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">2</span>
              Configuring External Apache Tomcat 10.1 Run Configuration
            </h3>
            <ol className="list-decimal list-inside space-y-2 pl-2 text-slate-600 leading-relaxed">
              <li>Click <strong>Run &rarr; Edit Configurations... &rarr; Add New (+) &rarr; Tomcat Server &rarr; Local</strong>.</li>
              <li>Under <strong>Application server</strong>, browse to your installed <strong>Apache Tomcat 10.1.x</strong> root folder.</li>
              <li>Switch to the <strong>Deployment</strong> tab:
                <ul className="list-disc list-inside pl-4 text-slate-500 text-[11px] mt-1 space-y-0.5">
                  <li>Click <strong>+ &rarr; Artifact &rarr; queueless:war exploded</strong> (or <code className="font-mono">queueless:war</code>).</li>
                  <li>Set <strong>Application context</strong> to: <code className="font-mono bg-slate-100 px-1 text-blue-700">/queueless</code> (or <code className="font-mono bg-slate-100 px-1 text-blue-700">/</code>).</li>
                </ul>
              </li>
              <li>Switch back to the <strong>Server</strong> tab:
                <p className="pl-4 text-[11px] text-slate-500 mt-1">
                  Click <strong>Environment Variables</strong> and enter your MongoDB credentials:
                </p>
                <div className="mt-2 ml-4 p-3 bg-slate-900 text-slate-300 font-mono text-[11px] rounded-xl flex items-center justify-between">
                  <span>
                    MONGODB_URI=mongodb://localhost:27017<br />
                    MONGODB_DATABASE=queueless_db
                  </span>
                  <button
                    onClick={() => copyToClipboard('MONGODB_URI="mongodb://localhost:27017"\nMONGODB_DATABASE="queueless_db"', 2)}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 cursor-pointer"
                  >
                    {copiedIndex === 2 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Clipboard className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </li>
            </ol>
          </div>

          {/* Section 4: Building with Maven */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">3</span>
              Windows PowerShell / Terminal Maven Build
            </h3>
            <p className="text-slate-600">
              Run this command in the project root to package the complete application into <code className="font-mono bg-slate-100 px-1">target/queueless.war</code>:
            </p>
            <div className="p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl flex items-center justify-between">
              <span>mvn clean package</span>
              <button
                onClick={() => copyToClipboard(codeSnippets[0], 0)}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer flex items-center gap-1 text-[11px]"
              >
                {copiedIndex === 0 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Clipboard className="w-3.5 h-3.5" />}
                Copy
              </button>
            </div>
          </div>

          {/* Section 5: MongoDB Atlas Connection Example */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              MongoDB Atlas URI Format
            </h3>
            <div className="p-3 bg-slate-100 text-slate-800 font-mono text-[11px] rounded-xl flex items-center justify-between">
              <span className="break-all">{codeSnippets[3]}</span>
              <button
                onClick={() => copyToClipboard(codeSnippets[3], 3)}
                className="p-1 rounded text-slate-500 hover:text-slate-900 cursor-pointer shrink-0 ml-2"
              >
                {copiedIndex === 3 ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Clipboard className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="py-2.5 px-6 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer text-xs"
          >
            Got it, Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
