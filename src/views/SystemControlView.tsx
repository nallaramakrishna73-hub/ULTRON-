import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Terminal,
  Play,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Power,
  Layers,
  Folder,
  Eye,
  Sliders,
} from 'lucide-react';
import { SystemMetrics } from '../types';
import { systemService } from '../services/systemService';

interface SystemControlViewProps {
  metrics: SystemMetrics;
}

interface RealApp {
  id: string;
  name: string;
  binary: string;
  category: string;
  running: boolean;
  icon: string;
}

interface RealProcess {
  pid: number;
  name: string;
  cpu: string;
  mem: string;
  user: string;
  status: string;
}

export const SystemControlView: React.FC<SystemControlViewProps> = ({ metrics }) => {
  const [apps, setApps] = useState<RealApp[]>([]);
  const [processes, setProcesses] = useState<RealProcess[]>([]);
  const [terminalPrompt, setTerminalPrompt] = useState('Inspect active listening ports and processes');
  const [generatedCommand, setGeneratedCommand] = useState('ss -tuln');
  const [explanation, setExplanation] = useState(
    'Queries the Linux socket statistics subsystem (ss) for TCP/UDP sockets currently in LISTEN state (-l), displaying numeric addresses (-n).'
  );
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [approvalGranted, setApprovalGranted] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState(false);

  const fetchApps = async () => {
    try {
      const res = await fetch('/api/applications/list');
      if (res.ok) {
        const data = await res.json();
        setApps(data);
      }
    } catch {}
  };

  const fetchProcesses = async () => {
    try {
      const res = await fetch('/api/system/processes');
      if (res.ok) {
        const data = await res.json();
        setProcesses(data);
      }
    } catch {}
  };

  useEffect(() => {
    fetchApps();
    fetchProcesses();
    const interval = setInterval(() => {
      fetchProcesses();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleGenerateCommand = (task: string) => {
    setTerminalPrompt(task);
    const lower = task.toLowerCase();

    if (lower.includes('port') || lower.includes('listening')) {
      setGeneratedCommand('ss -tuln');
      setExplanation('Queries listening TCP/UDP sockets and maps numeric port assignments.');
      setRequiresApproval(false);
    } else if (lower.includes('update') || lower.includes('upgrade')) {
      setGeneratedCommand('apt list --upgradable');
      setExplanation('Previews Kali package updates with zero risk to current installation.');
      setRequiresApproval(false);
    } else if (lower.includes('disk') || lower.includes('space') || lower.includes('storage')) {
      setGeneratedCommand('df -h / && free -h');
      setExplanation('Displays human-readable filesystem usage across root mountpoint and physical RAM allocation.');
      setRequiresApproval(false);
    } else if (lower.includes('kernel') || lower.includes('uname')) {
      setGeneratedCommand('uname -a && cat /etc/os-release');
      setExplanation('Outputs Linux kernel build details and official OS release identification.');
      setRequiresApproval(false);
    } else {
      setGeneratedCommand(`whoami && uptime`);
      setExplanation('Executes bounded user context and uptime check.');
      setRequiresApproval(false);
    }
  };

  const handleExecute = async () => {
    if (requiresApproval && !approvalGranted) {
      alert("Elevation Approval Required: Please grant approval before executing this system-level command.");
      return;
    }

    setIsExecuting(true);
    setTerminalOutput(`$ ${generatedCommand}\n[Executing real command on host...]`);

    const res = await systemService.executeControlledCommand(generatedCommand, true);
    setTerminalOutput(`$ ${generatedCommand}\n\n${res.output}\n\n[Process completed: exit ${res.exitCode}]`);
    setIsExecuting(false);
    setApprovalGranted(false);
    fetchProcesses();
  };

  const toggleApp = async (app: RealApp) => {
    if (app.running) {
      // Kill
      try {
        await fetch('/api/applications/kill', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ binary: app.binary }),
        });
        setTimeout(fetchApps, 500);
      } catch {}
    } else {
      // Launch
      try {
        await fetch('/api/applications/launch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ binary: app.binary }),
        });
        setTimeout(fetchApps, 500);
      } catch {}
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-4">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl glass-panel flex flex-col md:flex-row items-center justify-between gap-4 border border-indigo-900/40">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-cyan-600/20 border border-cyan-400/40">
            <Cpu className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="font-orbitron font-bold text-xl text-white">
              KALI LINUX SYSTEM CONTROL
            </h1>
            <p className="text-xs font-rajdhani text-slate-300">
              Live subprocess execution, real process table (/proc), XFCE application manager, and kernel telemetry
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-lg bg-black/40 border border-indigo-950 text-slate-300">
            RAM: <span className="text-purple-400 font-bold">{metrics.ramUsage}%</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-black/40 border border-indigo-950 text-slate-300">
            CPU: <span className="text-emerald-400 font-bold">{metrics.cpuUsage}%</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-black/40 border border-indigo-950 text-slate-300">
            Uptime: <span className="text-cyan-300 font-bold">{metrics.uptime}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Controlled Terminal Workspace */}
        <div className="lg:col-span-7 rounded-2xl glass-panel p-4 border border-indigo-900/40 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-indigo-950">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span className="font-orbitron font-bold text-xs text-white">
                Permission-Controlled Terminal
              </span>
            </div>
            <span className="text-[10px] font-mono text-purple-300 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-500/30">
              SAFE SUBPROCESS GUARD ACTIVE
            </span>
          </div>

          {/* Quick Command Suggestions */}
          <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono">
            <span className="text-slate-400">Quick intent:</span>
            {[
              'Inspect active listening ports',
              'Check disk space & RAM',
              'Check Kali kernel version',
              'Preview system updates',
            ].map((task, idx) => (
              <button
                key={idx}
                onClick={() => handleGenerateCommand(task)}
                className="px-2 py-1 rounded bg-slate-900 hover:bg-cyan-950/60 border border-indigo-950 text-slate-300 hover:text-cyan-300 transition-colors"
              >
                {task}
              </button>
            ))}
          </div>

          {/* Prompt Input */}
          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-300">Natural Language Request:</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={terminalPrompt}
                onChange={(e) => handleGenerateCommand(e.target.value)}
                placeholder="What task would you like to execute on Kali Linux?"
                className="flex-1 px-3 py-2 rounded-xl bg-black/50 border border-indigo-800/40 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Generated Command & Explanation */}
          <div className="p-3 rounded-xl bg-slate-950 border border-indigo-900/50 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-cyan-400 font-bold">Validated Shell Command:</span>
              {requiresApproval && (
                <span className="text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded text-[10px] border border-rose-500/30">
                  ROOT APPROVAL REQUIRED
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 bg-black rounded-lg p-2 border border-purple-500/20 text-xs font-mono text-purple-300">
              <span>$</span>
              <input
                type="text"
                value={generatedCommand}
                onChange={(e) => setGeneratedCommand(e.target.value)}
                className="w-full bg-transparent focus:outline-none text-white font-mono"
              />
            </div>

            <p className="text-xs font-rajdhani text-slate-300 leading-relaxed">
              <strong>Technical Explanation:</strong> {explanation}
            </p>

            {requiresApproval && (
              <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-amber-300 pt-1">
                <input
                  type="checkbox"
                  checked={approvalGranted}
                  onChange={(e) => setApprovalGranted(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-0"
                />
                <span>I approve elevated privilege execution for this operation.</span>
              </label>
            )}

            <div className="pt-1 flex justify-end">
              <button
                onClick={handleExecute}
                disabled={isExecuting || (requiresApproval && !approvalGranted)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 font-orbitron font-bold text-xs text-white flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.4)] disabled:opacity-40"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                {isExecuting ? 'RUNNING PROCESS...' : 'EXECUTE ON KALI'}
              </button>
            </div>
          </div>

          {/* Terminal Console Output */}
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
              <span>Standard Output (stdout / stderr)</span>
              <button onClick={() => setTerminalOutput('')} className="hover:text-cyan-400">
                Clear
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-slate-950 border border-indigo-950 font-mono text-[11px] text-emerald-300 h-44 overflow-y-auto whitespace-pre-wrap leading-relaxed shadow-inner">
              {terminalOutput || 'ULTRON Real Command Service Idle. Propose a task to inspect.'}
            </pre>
          </div>
        </div>

        {/* Right Column: Applications & Process Manager */}
        <div className="lg:col-span-5 space-y-4">
          {/* XFCE Applications Launcher */}
          <div className="rounded-2xl glass-panel p-4 border border-indigo-900/40 space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-indigo-950">
              <span className="font-orbitron font-bold text-xs text-white">
                XFCE Applications Manager
              </span>
              <button onClick={fetchApps} className="text-slate-400 hover:text-white" title="Refresh">
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {apps.map((app) => (
                <div
                  key={app.id}
                  className="p-2.5 rounded-xl bg-slate-950/60 border border-indigo-950 flex items-center justify-between text-xs font-mono"
                >
                  <div>
                    <div className="font-bold text-slate-200">{app.name}</div>
                    <div className="text-[10px] text-slate-400">
                      {app.category} • binary: {app.binary}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleApp(app)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      app.running
                        ? 'bg-rose-950/60 text-rose-300 border border-rose-600/40 hover:bg-rose-900/60'
                        : 'bg-emerald-950/60 text-emerald-300 border border-emerald-600/40 hover:bg-emerald-900/60'
                    }`}
                  >
                    {app.running ? 'RUNNING' : 'LAUNCH'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Running Processes Table from /proc */}
          <div className="rounded-2xl glass-panel p-4 border border-indigo-900/40 space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-indigo-950">
              <span className="font-orbitron font-bold text-xs text-white">
                Active Linux Processes ({processes.length})
              </span>
              <button onClick={fetchProcesses} className="text-slate-400 hover:text-white" title="Refresh">
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>

            <div className="overflow-x-auto max-h-56 overflow-y-auto">
              <table className="w-full text-left font-mono text-[11px]">
                <thead>
                  <tr className="text-slate-500 border-b border-indigo-950">
                    <th className="pb-1">PID</th>
                    <th className="pb-1">COMMAND</th>
                    <th className="pb-1">CPU</th>
                    <th className="pb-1">MEM</th>
                    <th className="pb-1">USER</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-indigo-950/40 text-slate-300">
                  {processes.slice(0, 15).map((p) => (
                    <tr key={p.pid} className="hover:bg-slate-900/40">
                      <td className="py-1 text-cyan-400">{p.pid}</td>
                      <td className="py-1 font-bold truncate max-w-[120px]">{p.name}</td>
                      <td className="py-1 text-amber-300">{p.cpu}</td>
                      <td className="py-1 text-purple-300">{p.mem}</td>
                      <td className="py-1 text-slate-400">{p.user}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
