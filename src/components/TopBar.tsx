import React, { useState, useEffect } from 'react';
import {
  Wifi,
  Volume2,
  Battery,
  Clock,
  ChevronDown,
  Minus,
  Square,
  X,
  Shield,
  Activity,
  Terminal,
} from 'lucide-react';

interface TopBarProps {
  onOpenSettings?: () => void;
  onOpenTerminal?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenSettings, onOpenTerminal }) => {
  const [timeString, setTimeString] = useState('');
  const [dateString, setDateString] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format: Mon, Nov 10, 2026
      const dateFormatted = now.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      // Format: 21:47:32
      const timeFormatted = now.toTimeString().split(' ')[0];
      setDateString(dateFormatted);
      setTimeString(timeFormatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <header className="h-14 px-5 flex items-center justify-between border-b border-indigo-900/30 bg-[#070916]/80 backdrop-blur-md z-30 select-none">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 via-indigo-600 to-purple-600 p-[1.5px] shadow-[0_0_15px_rgba(6,182,212,0.4)]">
          <div className="w-full h-full bg-[#090d1f] rounded-[7px] flex items-center justify-center">
            {/* Hexagonal diamond icon */}
            <div className="w-4 h-4 rotate-45 border-2 border-cyan-400 bg-gradient-to-tr from-purple-500/60 to-cyan-400/60 shadow-[0_0_8px_#38bdf8]" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1.5 leading-none">
            <span className="font-orbitron font-bold text-lg tracking-widest bg-gradient-to-r from-cyan-300 via-sky-200 to-purple-300 bg-clip-text text-transparent">
              ULTRON
            </span>
          </div>
          <span className="text-[10px] tracking-wider text-indigo-300/80 font-rajdhani font-semibold">
            AI Operating System
          </span>
        </div>
      </div>

      {/* Center Clock Pill */}
      <div className="hidden md:flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/80 border border-indigo-500/30 text-xs font-mono text-indigo-200 shadow-[0_0_12px_rgba(99,102,241,0.15)]">
        <Clock className="w-3.5 h-3.5 text-cyan-400" />
        <span className="tracking-wide text-slate-300">{dateString}</span>
        <span className="text-indigo-400/50">|</span>
        <span className="font-bold text-cyan-300 tracking-wider">{timeString}</span>
      </div>

      {/* Right Controls & User */}
      <div className="flex items-center gap-4">
        {/* Network, Volume, Battery */}
        <div className="flex items-center gap-2.5 text-slate-300">
          <button
            title="Wi-Fi: Connected (wlan0 - 5GHz)"
            className="p-1 hover:text-cyan-400 transition-colors"
          >
            <Wifi className="w-4 h-4 text-cyan-400" />
          </button>
          <button
            title="Volume: 80% (PipeWire)"
            className="p-1 hover:text-cyan-400 transition-colors"
          >
            <Volume2 className="w-4 h-4 text-slate-300" />
          </button>
          <div
            title="Battery: 85% Charging (AC Connected)"
            className="flex items-center gap-1 text-xs font-mono"
          >
            <Battery className="w-4 h-4 text-emerald-400" />
          </div>
        </div>

        {/* User Pill */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900/70 border border-purple-500/30 hover:border-purple-400/60 transition-all text-xs font-mono"
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white shadow-[0_0_8px_rgba(168,85,247,0.4)]">
              K
            </div>
            <span className="text-slate-200 font-rajdhani font-semibold">krishna</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {/* User Dropdown */}
          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-lg glass-panel p-2 shadow-2xl z-50 text-xs text-slate-200 font-mono">
              <div className="px-2 py-1.5 border-b border-indigo-900/40 text-slate-400 text-[11px]">
                User: <span className="text-cyan-400 font-bold">krishna (kali)</span>
              </div>
              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  onOpenTerminal?.();
                }}
                className="w-full text-left px-2 py-1.5 hover:bg-purple-900/30 rounded flex items-center gap-2 mt-1"
              >
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                Root Terminal
              </button>
              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  onOpenSettings?.();
                }}
                className="w-full text-left px-2 py-1.5 hover:bg-purple-900/30 rounded flex items-center gap-2"
              >
                <Shield className="w-3.5 h-3.5 text-purple-400" />
                Security Config
              </button>
              <div className="my-1 border-t border-indigo-900/40" />
              <button
                onClick={() => setUserMenuOpen(false)}
                className="w-full text-left px-2 py-1 text-slate-400 hover:text-rose-400 text-[11px]"
              >
                Lock Session (XFCE)
              </button>
            </div>
          )}
        </div>

        {/* Window controls: Minimize, Maximize, Close */}
        <div className="flex items-center gap-1.5 pl-2 border-l border-indigo-900/40">
          <button
            onClick={() => {}}
            title="Minimize"
            className="w-6 h-6 rounded flex items-center justify-center hover:bg-slate-800/80 text-slate-400 hover:text-white transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            className="w-6 h-6 rounded flex items-center justify-center hover:bg-slate-800/80 text-slate-400 hover:text-white transition-colors"
          >
            <Square className="w-3 h-3" />
          </button>
          <button
            onClick={() => window.location.reload()}
            title="Reload Environment"
            className="w-6 h-6 rounded flex items-center justify-center hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
