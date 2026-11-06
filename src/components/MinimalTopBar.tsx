import React from 'react';
import { Sparkles, Trash2, Settings, Cpu, Radio, Shield } from 'lucide-react';

interface MinimalTopBarProps {
  ollamaConnected: boolean;
  ollamaModel: string;
  hostPlatform?: string;
  onOpenSettings: () => void;
  onClearChat: () => void;
  messageCount: number;
}

export const MinimalTopBar: React.FC<MinimalTopBarProps> = ({
  ollamaConnected,
  ollamaModel,
  hostPlatform = 'host',
  onOpenSettings,
  onClearChat,
  messageCount,
}) => {
  return (
    <header className="relative z-20 w-full h-16 px-6 flex items-center justify-between border-b border-indigo-900/30 bg-black/40 backdrop-blur-md">
      {/* 1. Minimal ULTRON Identity & Logo */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-900/60 via-purple-900/40 to-cyan-900/40 border border-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
          <div className="w-3.5 h-3.5 rounded-sm rotate-45 border-2 border-cyan-400 bg-cyan-500/20 shadow-[0_0_8px_#06b6d4]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-orbitron font-extrabold text-base tracking-widest bg-gradient-to-r from-cyan-400 via-indigo-200 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(6,182,212,0.3)]">
              ULTRON
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 uppercase">
              AI OS
            </span>
          </div>
          <div className="text-[10px] font-rajdhani font-semibold tracking-wider text-slate-400 uppercase">
            Think • Analyze • Execute
          </div>
        </div>
      </div>

      {/* 2. Central Live Connection Status Badges */}
      <div className="hidden sm:flex items-center gap-2.5">
        {/* Ollama Local AI Status */}
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 hover:bg-slate-900/80 border border-indigo-800/40 hover:border-cyan-400/50 transition-all text-xs font-mono shadow-sm"
          title="Click to configure Ollama Local AI endpoint or change model"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              ollamaConnected
                ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]'
                : 'bg-amber-400 shadow-[0_0_8px_#f59e0b]'
            }`}
          />
          <span className="text-slate-300">
            {ollamaConnected ? `Ollama: ${ollamaModel}` : 'Ollama: Standby'}
          </span>
        </button>

        {/* Host OS Platform Tag */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/60 border border-indigo-900/40 text-[11px] font-mono text-slate-400">
          <Cpu className="w-3.5 h-3.5 text-purple-400" />
          <span className="uppercase text-slate-300 font-semibold">{hostPlatform}</span>
        </div>
      </div>

      {/* 3. Right Action Tools: Clear Conversation & Settings Modal */}
      <div className="flex items-center gap-2">
        {messageCount > 0 && (
          <button
            onClick={onClearChat}
            className="p-2 rounded-xl bg-black/50 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-indigo-900/40 hover:border-rose-500/40 transition-all"
            title="Clear conversation history"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl bg-black/50 hover:bg-cyan-950/40 text-slate-400 hover:text-cyan-300 border border-indigo-900/40 hover:border-cyan-400/40 transition-all"
          title="Open Settings & System Tools"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
