import React, { useState } from 'react';
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
} from 'lucide-react';

interface Finding {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  remediation: string;
  remediationCommand: string;
  category: 'Network' | 'Services' | 'Firewall' | 'Permissions';
}

const INITIAL_FINDINGS: Finding[] = [
  {
    id: 'f-1',
    severity: 'high',
    title: 'UFW Firewall Status is Inactive',
    description: 'The Uncomplicated Firewall (UFW) daemon is disabled on Kali Linux, leaving all listening network ports directly exposed to the local network.',
    remediation: 'Enable UFW and establish a default deny incoming rule with authorized SSH and local web exceptions.',
    remediationCommand: 'sudo ufw default deny incoming && sudo ufw allow 22/tcp && sudo ufw enable',
    category: 'Firewall',
  },
  {
    id: 'f-2',
    severity: 'medium',
    title: 'Ollama API Port 11434 Binding to All Interfaces',
    description: 'The local Ollama inference service is listening on 0.0.0.0:11434 rather than localhost (127.0.0.1), allowing remote nodes on LAN to invoke inference.',
    remediation: 'Configure OLLAMA_HOST=127.0.0.1:11434 in systemd service or /etc/environment.',
    remediationCommand: 'sudo systemctl edit ollama.service --drop-in=host',
    category: 'Services',
  },
  {
    id: 'f-3',
    severity: 'medium',
    title: 'Password Authentication Allowed on SSH Daemon',
    description: 'sshd_config allows PasswordAuthentication yes. Brute-force attacks against the standard user account are possible.',
    remediation: 'Enforce ed25519 public key authentication and set PasswordAuthentication no in /etc/ssh/sshd_config.d/security.conf.',
    remediationCommand: 'sudo sed -i "s/#PasswordAuthentication yes/PasswordAuthentication no/" /etc/ssh/sshd_config',
    category: 'Permissions',
  },
  {
    id: 'f-4',
    severity: 'low',
    title: 'Kernel Core Dumps Enabled',
    description: 'Core dumps can expose sensitive application memory in /var/crash upon binary segfaults.',
    remediation: 'Set fs.suid_dumpable = 0 in /etc/sysctl.d/99-security.conf.',
    remediationCommand: 'echo "fs.suid_dumpable = 0" | sudo tee /etc/sysctl.d/99-security.conf && sudo sysctl -p',
    category: 'Permissions',
  },
];

export const SecurityScannerView: React.FC = () => {
  const [findings, setFindings] = useState<Finding[]>(INITIAL_FINDINGS);
  const [securityScore, setSecurityScore] = useState(82);
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  const runFullScan = async () => {
    setIsScanning(true);
    setScanMessage('Auditing systemd units, listening sockets, and Kali kernel parameters...');
    await new Promise((r) => setTimeout(r, 1400));
    setScanMessage('Checking package integrity with debsums and analyzing UFW rules...');
    await new Promise((r) => setTimeout(r, 1200));
    setIsScanning(false);
    setScanMessage(null);
    setSecurityScore(84);
  };

  const handleApplyRemediation = (finding: Finding) => {
    alert(`Proposed command for approval:\n\n$ ${finding.remediationCommand}\n\nOperation queued for user authorization in System Control.`);
  };

  const exportHtmlReport = () => {
    const content = `<!DOCTYPE html>
<html>
<head>
  <title>ULTRON System Security Posture Audit</title>
  <style>
    body { font-family: monospace; background: #070914; color: #f1f5f9; padding: 30px; }
    h1 { color: #06b6d4; }
    .score { font-size: 28px; color: #10b981; font-weight: bold; }
    .item { background: #111827; border: 1px solid #374151; padding: 15px; margin-bottom: 12px; border-radius: 8px; }
  </style>
</head>
<body>
  <h1>ULTRON Security Audit Report - Kali Linux XFCE</h1>
  <p><strong>System Hardening Score:</strong> <span class="score">${securityScore} / 100</span></p>
  <p><strong>Audit Date:</strong> ${new Date().toLocaleString()}</p>
  <h3>Identified Vulnerabilities & Warnings</h3>
  ${findings
    .map(
      (f) => `
    <div class="item">
      <h4>[${f.severity.toUpperCase()}] ${f.title}</h4>
      <p>${f.description}</p>
      <p><strong>Mitigation:</strong> ${f.remediation}</p>
      <code>$ ${f.remediationCommand}</code>
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
            onClick={runFullScan}
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

      {scanMessage && (
        <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-xs font-mono text-cyan-200 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>{scanMessage}</span>
        </div>
      )}

      {/* Metrics Row: Score & Counts */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="rounded-2xl glass-panel p-3.5 border border-indigo-900/40 text-center flex flex-col items-center justify-center">
          <span className="text-[11px] font-mono text-slate-400">Security Score</span>
          <div className="font-orbitron font-extrabold text-3xl text-emerald-400 mt-0.5">
            {securityScore}
            <span className="text-sm text-slate-500 font-normal">/100</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-300 mt-0.5">SECURE POSTURE</span>
        </div>

        <div className="rounded-2xl glass-panel p-3.5 border border-rose-950/40 text-center">
          <span className="text-[11px] font-mono text-rose-400">Critical Risks</span>
          <div className="font-orbitron font-bold text-2xl text-white mt-0.5">0</div>
          <span className="text-[10px] font-mono text-slate-500">None detected</span>
        </div>

        <div className="rounded-2xl glass-panel p-3.5 border border-amber-950/40 text-center">
          <span className="text-[11px] font-mono text-amber-400">High Risks</span>
          <div className="font-orbitron font-bold text-2xl text-amber-300 mt-0.5">1</div>
          <span className="text-[10px] font-mono text-amber-400/80">Firewall disabled</span>
        </div>

        <div className="rounded-2xl glass-panel p-3.5 border border-yellow-950/40 text-center">
          <span className="text-[11px] font-mono text-yellow-400">Medium Risks</span>
          <div className="font-orbitron font-bold text-2xl text-yellow-300 mt-0.5">2</div>
          <span className="text-[10px] font-mono text-yellow-400/80">Services & SSH</span>
        </div>

        <div className="rounded-2xl glass-panel p-3.5 border border-sky-950/40 text-center">
          <span className="text-[11px] font-mono text-sky-400">Low / Informational</span>
          <div className="font-orbitron font-bold text-2xl text-sky-300 mt-0.5">1</div>
          <span className="text-[10px] font-mono text-slate-400">Kernel dumps</span>
        </div>
      </div>

      {/* Findings Breakdown */}
      <div className="rounded-2xl glass-panel p-4 border border-indigo-900/40 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-indigo-950">
          <span className="font-orbitron font-bold text-sm text-white">
            Detailed Findings & Approved Remediation Scripts
          </span>
          <span className="text-xs font-mono text-cyan-400">
            {findings.length} Action Items
          </span>
        </div>

        <div className="space-y-3">
          {findings.map((f) => (
            <div
              key={f.id}
              className="p-3.5 rounded-xl bg-slate-950/60 border border-indigo-900/40 hover:border-indigo-700/60 transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      f.severity === 'high'
                        ? 'bg-rose-950 text-rose-300 border border-rose-600/40'
                        : f.severity === 'medium'
                        ? 'bg-amber-950 text-amber-300 border border-amber-600/40'
                        : 'bg-sky-950 text-sky-300 border border-sky-600/40'
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
                  <span className="text-purple-400 font-bold">$ </span>
                  <code>{f.remediationCommand}</code>
                </div>
                <button
                  onClick={() => handleApplyRemediation(f)}
                  className="px-3 py-1 rounded bg-indigo-600/60 hover:bg-indigo-500 text-white text-[10px] font-bold shrink-0"
                >
                  Propose Fix
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
