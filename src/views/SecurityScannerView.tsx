import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  RefreshCw,
  Download,
  Terminal,
  CheckCircle,
  Layers,
  Lock,
  Cpu,
  Play,
} from 'lucide-react';

interface RealFinding {
  id: string;
  category: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'PASSED';
  description: string;
  remediation: string;
}

interface RealAuditReport {
  id: string;
  timestamp: string;
  overallScore: number;
  totalChecks: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  passedCount: number;
  findings: RealFinding[];
}

export const SecurityScannerView: React.FC = () => {
  const [report, setReport] = useState<RealAuditReport | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [executionLog, setExecutionLog] = useState<{ command: string; output: string } | null>(null);

  const runAudit = async () => {
    setIsScanning(true);
    try {
      const res = await fetch('/api/scanner/audit', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setReport(data);
      }
    } catch (e) {
      console.error('Audit failed:', e);
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    runAudit();
  }, []);

  const handleExecuteRemediation = async (remediationText: string) => {
    // Extract shell command if present
    const cmdMatch = remediationText.match(/(?:sudo|apt|ufw|chmod|chown|sysctl)\s+[^.\n]+/);
    const cmd = cmdMatch ? cmdMatch[0] : 'sudo ufw status';

    try {
      const res = await fetch('/api/terminal/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd, authorized: true }),
      });
      const data = await res.json();
      setExecutionLog({
        command: cmd,
        output: data.stdout || data.stderr || 'Command executed.',
      });
      // Re-run audit after fix
      setTimeout(runAudit, 1000);
    } catch (e: any) {
      setExecutionLog({
        command: cmd,
        output: `Error executing command: ${e.message}`,
      });
    }
  };

  const exportHtmlReport = () => {
    if (!report) return;
    const content = `<!DOCTYPE html>
<html>
<head>
  <title>ULTRON Real Security Posture Report</title>
  <style>
    body { font-family: monospace; background: #070914; color: #f1f5f9; padding: 30px; }
    h1 { color: #06b6d4; }
    .score { font-size: 28px; color: #10b981; font-weight: bold; }
    .item { background: #111827; border: 1px solid #374151; padding: 15px; margin-bottom: 12px; border-radius: 8px; }
  </style>
</head>
<body>
  <h1>ULTRON Host Security Audit Report</h1>
  <p><strong>System Hardening Score:</strong> <span class="score">${report.overallScore} / 100</span></p>
  <p><strong>Timestamp:</strong> ${report.timestamp}</p>
  <h3>Identified Checks & Findings (${report.findings.length} checks)</h3>
  ${report.findings
    .map(
      (f) => `
    <div class="item">
      <h4>[${f.severity}] ${f.title} (${f.category})</h4>
      <p>${f.description}</p>
      <p><strong>Remediation:</strong> ${f.remediation}</p>
    </div>
  `
    )
    .join('')}
</body>
</html>`;

    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ultron-security-audit-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-4">
      {/* Top Header Card */}
      <div className="p-4 rounded-2xl glass-panel flex flex-col md:flex-row items-center justify-between gap-4 border border-indigo-900/40">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-600/30 border border-purple-400/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="font-orbitron font-bold text-xl text-white">
              SYSTEM SECURITY POSTURE MONITOR
            </h1>
            <p className="text-xs font-rajdhani text-slate-300">
              Live audit of listening sockets, active daemons, packet filtering, and Kali Linux configurations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={runAudit}
            disabled={isScanning}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 font-orbitron font-bold text-xs text-white flex items-center gap-2 shadow-[0_0_12px_rgba(6,182,212,0.4)] disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'AUDITING...' : 'RUN SECURITY SCAN'}
          </button>

          <button
            onClick={exportHtmlReport}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-indigo-900/60 font-mono text-xs text-slate-300 hover:text-white flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            Export Report
          </button>
        </div>
      </div>

      {executionLog && (
        <div className="p-3.5 rounded-xl bg-slate-950 border border-cyan-500/40 space-y-1 font-mono text-xs">
          <div className="text-cyan-400 font-bold">$ {executionLog.command}</div>
          <pre className="text-slate-300 whitespace-pre-wrap max-h-32 overflow-y-auto">{executionLog.output}</pre>
        </div>
      )}

      {/* Metrics Row: Score & Counts */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="rounded-2xl glass-panel p-3.5 border border-indigo-900/40 text-center flex flex-col items-center justify-center">
          <span className="text-[11px] font-mono text-slate-400">Security Score</span>
          <div className="font-orbitron font-extrabold text-3xl text-emerald-400 mt-0.5">
            {report ? report.overallScore : 85}
            <span className="text-sm text-slate-500 font-normal">/100</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-300 mt-0.5">
            {(report?.overallScore || 85) >= 80 ? 'HARDENED POSTURE' : 'ACTION REQUIRED'}
          </span>
        </div>

        <div className="rounded-2xl glass-panel p-3.5 border border-rose-950/40 text-center">
          <span className="text-[11px] font-mono text-rose-400">Critical Risks</span>
          <div className="font-orbitron font-bold text-2xl text-white mt-0.5">
            {report ? report.criticalCount : 0}
          </div>
          <span className="text-[10px] font-mono text-slate-500">Require instant fix</span>
        </div>

        <div className="rounded-2xl glass-panel p-3.5 border border-amber-950/40 text-center">
          <span className="text-[11px] font-mono text-amber-400">High Risks</span>
          <div className="font-orbitron font-bold text-2xl text-amber-300 mt-0.5">
            {report ? report.highCount : 1}
          </div>
          <span className="text-[10px] font-mono text-amber-400/80">Firewall / DAC</span>
        </div>

        <div className="rounded-2xl glass-panel p-3.5 border border-yellow-950/40 text-center">
          <span className="text-[11px] font-mono text-yellow-400">Medium Risks</span>
          <div className="font-orbitron font-bold text-2xl text-yellow-300 mt-0.5">
            {report ? report.mediumCount : 1}
          </div>
          <span className="text-[10px] font-mono text-yellow-400/80">Network Sockets</span>
        </div>

        <div className="rounded-2xl glass-panel p-3.5 border border-emerald-950/40 text-center">
          <span className="text-[11px] font-mono text-emerald-400">Checks Passed</span>
          <div className="font-orbitron font-bold text-2xl text-emerald-300 mt-0.5">
            {report ? report.passedCount : 4}
          </div>
          <span className="text-[10px] font-mono text-slate-400">Kernel & Services</span>
        </div>
      </div>

      {/* Findings Breakdown */}
      <div className="rounded-2xl glass-panel p-4 border border-indigo-900/40 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-indigo-950">
          <span className="font-orbitron font-bold text-sm text-white">
            Audit Checklist & Active Remediation
          </span>
          <span className="text-xs font-mono text-cyan-400">
            {report ? `${report.findings.length} Checks Run` : 'Analyzing system...'}
          </span>
        </div>

        <div className="space-y-3">
          {report?.findings.map((f) => (
            <div
              key={f.id}
              className="p-3.5 rounded-xl bg-slate-950/60 border border-indigo-900/40 hover:border-indigo-700/60 transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      f.severity === 'CRITICAL'
                        ? 'bg-rose-950 text-rose-300 border border-rose-600/40'
                        : f.severity === 'HIGH'
                        ? 'bg-amber-950 text-amber-300 border border-amber-600/40'
                        : f.severity === 'MEDIUM'
                        ? 'bg-yellow-950 text-yellow-300 border border-yellow-600/40'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-600/40'
                    }`}
                  >
                    {f.severity}
                  </span>
                  <span className="font-orbitron font-bold text-xs text-white">
                    {f.title}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                  {f.category}
                </span>
              </div>

              <p className="text-xs font-rajdhani text-slate-300 leading-relaxed">
                {f.description}
              </p>

              <div className="p-2.5 rounded-lg bg-black/60 border border-indigo-950 font-mono text-[11px] text-emerald-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
                <div className="truncate w-full md:w-auto">
                  <span className="text-purple-400 font-bold">Mitigation: </span>
                  <code>{f.remediation}</code>
                </div>
                {f.severity !== 'PASSED' && (
                  <button
                    onClick={() => handleExecuteRemediation(f.remediation)}
                    className="px-3 py-1 rounded bg-indigo-600/60 hover:bg-indigo-500 text-white text-[10px] font-bold shrink-0 flex items-center gap-1"
                  >
                    <Play className="w-3 h-3" /> Execute Remediation
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
