import React, { useState, useEffect } from 'react';
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
  RefreshCw,
  CheckCircle,
  AlertOctagon,
} from 'lucide-react';

interface AuditItem {
  id: string;
  category: 'Terminal' | 'Security Scan' | 'Voice' | 'File' | 'Research' | 'Trading';
  title: string;
  detail: string;
  timestamp: string;
  status: 'success' | 'warn' | 'info';
}

export const HistoryView: React.FC = () => {
  const [logs, setLogs] = useState<AuditItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(false);

  const categories = ['All', 'Terminal', 'Security Scan', 'Voice', 'File', 'Research', 'Trading'];

  const fetchRealAuditLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/database/audit');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const mapped: AuditItem[] = data.map((a: any) => ({
            id: a.id,
            category: a.command.includes('lynis') || a.command.includes('scan') ? 'Security Scan' : 'Terminal',
            title: `Command: ${a.command}`,
            detail: `Exit code: ${a.exit_code} • Duration: ${a.execution_time_ms || 0}ms • Status: ${a.status.toUpperCase()}`,
            timestamp: a.created_at ? new Date(a.created_at).toLocaleString() : 'Recent',
            status: a.status === 'success' ? 'success' : a.status === 'blocked' ? 'warn' : 'info',
          }));
          setLogs(mapped);
        }
      }
    } catch (e) {
      console.error('Audit fetch error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRealAuditLogs();
  }, []);

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
              IMMUTABLE COMMAND AUDIT HISTORY
            </h1>
            <p className="text-xs font-rajdhani text-slate-300">
              Live SQLite audit trail (`command_audit`) with exit codes, durations, and safety intercepts
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
            onClick={fetchRealAuditLogs}
            className="p-2 rounded-xl bg-indigo-900/40 border border-indigo-700/50 text-cyan-400 hover:bg-indigo-800/50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
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

        <div className="space-y-2 max-h-[520px] overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-10 font-mono text-xs text-slate-500">
              No audit logs recorded yet. Run a command or scan to generate audit trail entries.
            </div>
          ) : (
            filteredLogs.map((item) => (
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
                    {item.status === 'warn' ? <AlertOctagon className="w-4 h-4" /> : <Terminal className="w-4 h-4" />}
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
            ))
          )}
        </div>
      </div>
    </div>
  );
};
