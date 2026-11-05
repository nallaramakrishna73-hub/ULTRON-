import React, { useState } from 'react';
import {
  Clock,
  Search,
  Filter,
  Terminal,
  Shield,
  Mic,
  FolderClosed,
  TrendingUp,
  Trash2,
} from 'lucide-react';

interface AuditItem {
  id: string;
  category: 'Terminal' | 'Security Scan' | 'Voice' | 'File' | 'Research' | 'Trading';
  title: string;
  detail: string;
  timestamp: string;
  status: 'success' | 'warn' | 'info';
}

const INITIAL_AUDIT_LOGS: AuditItem[] = [
  { id: '1', category: 'Security Scan', title: 'Local Posture Audit Completed', detail: 'Lynis scan executed: Hardening index 84/100, 2 recommendations generated.', timestamp: '2026-11-05 21:45', status: 'success' },
  { id: '2', category: 'Research', title: 'Researched CVE-2024-6387', detail: 'Accessed regreSSHion signal race condition dossier and Debian 9.8p1 mitigation.', timestamp: '2026-11-05 21:32', status: 'info' },
  { id: '3', category: 'Terminal', title: 'Executed ss -tulnp', detail: 'Inspected active listening ports 22, 80, 443, 11434 with zero errors.', timestamp: '2026-11-05 21:20', status: 'success' },
  { id: '4', category: 'Voice', title: 'Voice Command: "Open Kali terminal"', detail: 'Voice recognized with 98% confidence. Launched xfce4-terminal.', timestamp: '2026-11-05 20:55', status: 'success' },
  { id: '5', category: 'Trading', title: 'Paper Trade BTCUSDT Long', detail: 'Calculated 1% risk position at $106,800 entry after 4H FVG sweep.', timestamp: '2026-11-05 19:10', status: 'success' },
  { id: '6', category: 'File', title: 'Inspected network_audit_lab.pcap', detail: 'Verified binary capture integrity in /home/kali/captures.', timestamp: '2026-11-05 18:30', status: 'info' },
  { id: '7', category: 'Terminal', title: 'Blocked Dangerous Root Command', detail: 'Permission guard intercepted invalid recursive deletion command.', timestamp: '2026-11-05 17:15', status: 'warn' },
];

export const HistoryView: React.FC = () => {
  const [logs, setLogs] = useState<AuditItem[]>(INITIAL_AUDIT_LOGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Terminal', 'Security Scan', 'Voice', 'File', 'Research', 'Trading'];

  const filteredLogs = logs.filter((log) => {
    const matchesCat = selectedCategory === 'All' || log.category === selectedCategory;
    const matchesSearch =
      log.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.detail.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-4">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl glass-panel flex flex-col md:flex-row items-center justify-between gap-4 border border-indigo-900/40">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-600/30 border border-purple-400/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <Clock className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="font-orbitron font-bold text-xl text-white">
              ACTIVITY & SECURITY AUDIT HISTORY
            </h1>
            <p className="text-xs font-rajdhani text-slate-300">
              Immutable chronological record of commands, voice interactions, scans, and system modifications
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search audit trail..."
              className="py-1.5 pl-8 pr-3 rounded-xl bg-black/50 border border-indigo-800/40 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>

          <button
            onClick={() => setLogs([])}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-indigo-950 font-mono text-xs text-rose-400 hover:text-white hover:bg-rose-950/40 flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </div>

      {/* Filter Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-xl text-xs font-mono border transition-all ${
              selectedCategory === cat
                ? 'bg-purple-600/40 border-purple-400 text-cyan-300 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                : 'bg-black/40 border-indigo-950 text-slate-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Audit Log Timeline */}
      <div className="rounded-2xl glass-panel p-4 border border-indigo-900/40 space-y-2">
        <div className="flex items-center justify-between pb-2 border-b border-indigo-950 text-xs font-mono text-slate-400">
          <span>Event / Operation</span>
          <span>Timestamp</span>
        </div>

        <div className="space-y-2">
          {filteredLogs.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-xl bg-slate-950/60 border border-indigo-950 hover:border-indigo-800/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-2"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg mt-0.5 shrink-0 ${
                    item.status === 'warn'
                      ? 'bg-rose-950/60 text-rose-400 border border-rose-500/30'
                      : item.status === 'info'
                      ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-500/30'
                      : 'bg-purple-950/60 text-purple-400 border border-purple-500/30'
                  }`}
                >
                  {item.category === 'Terminal' && <Terminal className="w-4 h-4" />}
                  {item.category === 'Security Scan' && <Shield className="w-4 h-4" />}
                  {item.category === 'Voice' && <Mic className="w-4 h-4" />}
                  {item.category === 'File' && <FolderClosed className="w-4 h-4" />}
                  {item.category === 'Research' && <Clock className="w-4 h-4" />}
                  {item.category === 'Trading' && <TrendingUp className="w-4 h-4" />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-orbitron font-bold text-xs text-white">
                      {item.title}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-xs font-rajdhani text-slate-300 mt-0.5">
                    {item.detail}
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-mono text-cyan-400 shrink-0">
                {item.timestamp}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
