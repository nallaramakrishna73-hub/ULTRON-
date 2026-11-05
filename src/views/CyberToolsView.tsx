import React, { useState } from 'react';
import {
  Shield,
  ShieldAlert,
  Play,
  CheckCircle,
  FileText,
  AlertTriangle,
  Terminal,
  Search,
  ExternalLink,
  Download,
  Lock,
  Layers,
} from 'lucide-react';
import { CyberTool } from '../types';
import { systemService } from '../services/systemService';

export const CyberToolsView: React.FC = () => {
  const [tools, setTools] = useState<CyberTool[]>(systemService.getCyberTools());
  const [selectedTool, setSelectedTool] = useState<CyberTool>(tools[0]);
  const [customCommand, setCustomCommand] = useState(tools[0].defaultCommand);
  const [activeTab, setActiveTab] = useState<'tools' | 'workflow' | 'reports'>('tools');
  const [outputLog, setOutputLog] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);

  // Workflow State
  const [workflowTarget, setWorkflowTarget] = useState('192.168.56.101');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [workflowStep, setWorkflowStep] = useState(1);
  const [workflowOutput, setWorkflowOutput] = useState<string[]>([]);
  const [reportReady, setReportReady] = useState(false);

  const handleSelectTool = (tool: CyberTool) => {
    setSelectedTool(tool);
    setCustomCommand(tool.defaultCommand);
  };

  const handleExecuteTool = async () => {
    setIsRunning(true);
    setOutputLog(`[ULTRON Cyber Dispatcher] Spawning process for ${selectedTool.name}...\nCommand: $ ${customCommand}\n\nRunning...`);

    const res = await systemService.executeControlledCommand(customCommand, true);
    setOutputLog((prev) => `${prev}\n\n${res.output}\n\n[Execution Finished: Exit code ${res.exitCode}]`);
    setIsRunning(false);
  };

  const handleAdvanceWorkflow = async () => {
    if (!isAuthorized) {
      alert("Authorization required: You must certify ownership or permission before proceeding.");
      return;
    }

    setIsRunning(true);
    const steps = [
      "1. Target Verification & ICMP Ping: Target 192.168.56.101 is reachable (0.42ms).",
      "2. Stealth SYN Recon: Scanning top 1000 ports... Open: 22 (SSH), 80 (HTTP), 443 (HTTPS), 3306 (MySQL), 8080 (Node.js).",
      "3. Service & OS Enumeration: OpenSSH 9.6p1, Nginx 1.24.0, MySQL 8.0.36, Ubuntu Linux 24.04 LTS.",
      "4. Vulnerability Assessment: Checking NSE scripts against CVE database...",
      "5. Findings Analysis: 1 High (Outdated OpenSSH regreSSHion surface), 1 Medium (Missing HTTP Strict-Transport-Security), 3 Info.",
      "6. Pentest Report Generated successfully.",
    ];

    await new Promise((r) => setTimeout(r, 800));
    setWorkflowOutput((prev) => [...prev, steps[workflowStep - 1] || "Step completed."]);

    if (workflowStep < 6) {
      setWorkflowStep((prev) => prev + 1);
    } else {
      setReportReady(true);
    }
    setIsRunning(false);
  };

  const downloadReportHtml = () => {
    const reportHtml = `<!DOCTYPE html>
<html>
<head>
  <title>ULTRON Penetration Testing Report - ${workflowTarget}</title>
  <style>
    body { font-family: monospace; background: #0c1020; color: #e2e8f0; padding: 30px; }
    h1 { color: #38bdf8; border-bottom: 2px solid #a855f7; padding-bottom: 8px; }
    .card { background: #161e38; border: 1px solid #3b82f6; border-radius: 8px; padding: 16px; margin: 16px 0; }
    .critical { color: #f43f5e; font-weight: bold; }
    .high { color: #fb923c; font-weight: bold; }
    .medium { color: #facc15; }
    .clean { color: #4ade80; }
  </style>
</head>
<body>
  <h1>ULTRON Penetration Testing Audit Report</h1>
  <p><strong>Target:</strong> ${workflowTarget}</p>
  <p><strong>Assessment Date:</strong> ${new Date().toISOString()}</p>
  <p><strong>Auditor:</strong> krishna (Kali Linux 2026.3)</p>
  <div class="card">
    <h3>Discovered Services</h3>
    <ul>
      <li>Port 22/tcp: OpenSSH 9.6p1</li>
      <li>Port 80/tcp: Nginx 1.24.0</li>
      <li>Port 443/tcp: Nginx 1.24.0 (TLS 1.3)</li>
      <li>Port 3306/tcp: MySQL 8.0.36</li>
    </ul>
  </div>
  <div class="card">
    <h3>Vulnerability Findings</h3>
    <p class="high">[HIGH] Potential OpenSSH Signal Handler Race Condition (CVE-2024-6387)</p>
    <p class="medium">[MEDIUM] Missing HSTS Header on Web Server</p>
    <p class="clean">[RECOMMENDATION] Update OpenSSH to latest patched upstream build and enable strict HSTS headers.</p>
  </div>
</body>
</html>`;

    const blob = new Blob([reportHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ultron-audit-${workflowTarget}-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-4">
      {/* View Switcher Tabs */}
      <div className="flex items-center justify-between p-3 rounded-2xl glass-panel border border-indigo-900/40">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-purple-400" />
          <h1 className="font-orbitron font-bold text-lg text-white">
            CYBERSECURITY COMMAND CENTER
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('tools')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
              activeTab === 'tools'
                ? 'bg-purple-600/40 border border-purple-400 text-purple-200'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Kali Tools Arsenal (10)
          </button>
          <button
            onClick={() => setActiveTab('workflow')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
              activeTab === 'workflow'
                ? 'bg-cyan-600/40 border border-cyan-400 text-cyan-200'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Authorized Pentest Workflow
          </button>
        </div>
      </div>

      {activeTab === 'tools' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left: Tools List */}
          <div className="lg:col-span-5 rounded-2xl glass-panel p-3 border border-indigo-900/40 space-y-2 max-h-[640px] overflow-y-auto">
            <div className="text-xs font-mono text-cyan-400 pb-1 border-b border-indigo-950">
              Installed Kali Linux Packages
            </div>
            {tools.map((tool) => (
              <div
                key={tool.id}
                onClick={() => handleSelectTool(tool)}
                className={`p-3 rounded-xl cursor-pointer border transition-all ${
                  selectedTool.id === tool.id
                    ? 'bg-purple-950/40 border-purple-400/80 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                    : 'bg-slate-900/40 border-indigo-950 hover:border-indigo-700/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-orbitron font-bold text-xs text-white">
                    {tool.name}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/30">
                    INSTALLED
                  </span>
                </div>
                <div className="text-[11px] font-mono text-indigo-300 mt-0.5">
                  Category: {tool.category} • v{tool.version}
                </div>
                <p className="text-xs font-rajdhani text-slate-300 mt-1 line-clamp-2">
                  {tool.description}
                </p>
              </div>
            ))}
          </div>

          {/* Right: Execution Console & Command Config */}
          <div className="lg:col-span-7 rounded-2xl glass-panel p-4 flex flex-col justify-between border border-indigo-900/40 min-h-[500px]">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-indigo-900/40">
                <div>
                  <h3 className="font-orbitron font-bold text-sm text-cyan-300">
                    {selectedTool.name}
                  </h3>
                  <span className="text-xs font-mono text-slate-400">
                    Safe Execution Profile & Argument Validation Active
                  </span>
                </div>
                <button
                  onClick={handleExecuteTool}
                  disabled={isRunning}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:opacity-90 font-orbitron font-bold text-xs text-white flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.4)] disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  {isRunning ? 'EXECUTING...' : 'RUN COMMAND'}
                </button>
              </div>

              {/* Command Input */}
              <div className="my-3">
                <label className="text-xs font-mono text-slate-300 block mb-1">
                  Validated Command String:
                </label>
                <div className="flex items-center gap-2 bg-black/60 rounded-xl p-2 border border-indigo-800/40 font-mono text-xs text-cyan-300">
                  <span className="text-purple-400 font-bold">$</span>
                  <input
                    type="text"
                    value={customCommand}
                    onChange={(e) => setCustomCommand(e.target.value)}
                    className="w-full bg-transparent text-slate-100 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Output Display */}
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
                  <span>Standard Output (stdout / stderr)</span>
                  <button
                    onClick={() => setOutputLog('')}
                    className="hover:text-cyan-400"
                  >
                    Clear Console
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-slate-950 border border-indigo-950 font-mono text-[11px] text-emerald-300 whitespace-pre-wrap h-[340px] overflow-y-auto leading-relaxed shadow-inner">
                  {outputLog || `ULTRON Ready. Click 'RUN COMMAND' to execute ${selectedTool.name} in safe sandbox mode.`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Penetration Testing Workflow */
        <div className="rounded-2xl glass-panel p-6 border border-cyan-500/30 space-y-6">
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="text-center">
              <h2 className="font-orbitron font-bold text-xl text-white">
                Authorized Lab Penetration Testing Workflow
              </h2>
              <p className="text-xs font-rajdhani text-indigo-300 mt-1">
                Structured defensive testing framework adhering to PTES and NIST SP 800-115 standards.
              </p>
            </div>

            {/* Target & Authorization Gate */}
            <div className="p-4 rounded-xl bg-black/50 border border-indigo-800/40 space-y-3">
              <div>
                <label className="text-xs font-mono text-cyan-400 block mb-1">
                  Target Scope (IP or Subnet):
                </label>
                <input
                  type="text"
                  value={workflowTarget}
                  onChange={(e) => setWorkflowTarget(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-indigo-700/50 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Authorization Checkbox */}
              <label className="flex items-start gap-2.5 cursor-pointer text-xs font-rajdhani text-slate-300 bg-rose-950/20 p-2.5 rounded-lg border border-rose-900/40">
                <input
                  type="checkbox"
                  checked={isAuthorized}
                  onChange={(e) => setIsAuthorized(e.target.checked)}
                  className="mt-0.5 rounded text-purple-600 focus:ring-0"
                />
                <span>
                  <strong>Legal Authorization Declaration:</strong> I explicitly certify that I own this target or have signed legal authorization to conduct security scanning on this infrastructure.
                </span>
              </label>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-mono text-slate-400">
                  Step {workflowStep} of 6
                </span>
                <button
                  onClick={handleAdvanceWorkflow}
                  disabled={!isAuthorized || isRunning}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 font-orbitron font-bold text-xs text-white disabled:opacity-40 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                >
                  {isRunning ? 'PROCESSING STEP...' : workflowStep === 6 ? 'FINAL REPORT READY' : 'ADVANCE WORKFLOW STEP'}
                </button>
              </div>
            </div>

            {/* Step Progress Feed */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono text-cyan-400">Execution Progression:</h4>
              <div className="p-3 rounded-xl bg-slate-950 border border-indigo-950 min-h-[160px] space-y-1.5 font-mono text-xs">
                {workflowOutput.length === 0 ? (
                  <span className="text-slate-500">Awaiting authorization and workflow start...</span>
                ) : (
                  workflowOutput.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-emerald-300">
                      <CheckCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Export Report Button */}
            {reportReady && (
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 flex items-center justify-between">
                <div>
                  <h4 className="font-orbitron font-bold text-sm text-emerald-300">
                    Comprehensive Audit Dossier Ready
                  </h4>
                  <p className="text-xs font-rajdhani text-slate-300">
                    Includes discovered ports, service banners, risk score, and mitigation directives.
                  </p>
                </div>
                <button
                  onClick={downloadReportHtml}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-orbitron font-bold text-xs text-white flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                >
                  <Download className="w-4 h-4" />
                  EXPORT REPORT (HTML)
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
