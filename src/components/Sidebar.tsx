import React from 'react';
import {
  Home,
  Mic,
  ShieldAlert,
  Search,
  ShieldCheck,
  TrendingUp,
  Cpu,
  FolderClosed,
  Grid,
  Settings as SettingsIcon,
  Clock,
  Info,
} from 'lucide-react';
import { NavSection, OrbState } from '../types';
import { AudioWaveform } from './AudioWaveform';

interface SidebarProps {
  currentSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  orbState: OrbState;
}

interface NavItem {
  id: NavSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'voice', label: 'Voice Console', icon: Mic },
  { id: 'cyber_tools', label: 'Cyber Tools', icon: ShieldAlert },
  { id: 'research', label: 'Research Engine', icon: Search },
  { id: 'scanner', label: 'Security Scanner', icon: ShieldCheck },
  { id: 'trading', label: 'Trading Hub', icon: TrendingUp },
  { id: 'system', label: 'System Control', icon: Cpu },
  { id: 'files', label: 'Files Manager', icon: FolderClosed },
  { id: 'appstore', label: 'App Store', icon: Grid },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
  { id: 'history', label: 'History', icon: Clock },
  { id: 'about', label: 'About ULTRON', icon: Info },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onSelectSection,
  orbState,
}) => {
  return (
    <aside className="w-56 h-[calc(100vh-3.5rem)] flex flex-col justify-between p-3 border-r border-indigo-950/40 bg-[#060814]/80 backdrop-blur-md select-none shrink-0 z-20">
      {/* Navigation Links */}
      <div className="space-y-1 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectSection(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-rajdhani font-semibold tracking-wide transition-all duration-150 ${
                isActive
                  ? 'bg-gradient-to-r from-purple-700/80 via-indigo-600/70 to-purple-800/80 text-white shadow-[0_0_15px_rgba(147,51,234,0.35)] border border-purple-400/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-white' : 'text-slate-400'
                }`}
              />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Bottom ULTRON Status Card */}
      <div className="mt-2 p-3 rounded-2xl bg-gradient-to-br from-slate-950/90 to-indigo-950/40 border border-indigo-800/30 shadow-lg">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
          </span>
          <div className="flex flex-col">
            <span className="text-[11px] font-orbitron font-bold tracking-wider text-slate-100">
              ULTRON
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">Online</span>
          </div>
        </div>

        {/* Real-time spectrum visualizer */}
        <div className="mt-1 bg-black/40 rounded-lg p-1 border border-indigo-950">
          <AudioWaveform
            isActive={orbState !== 'idle'}
            color={
              orbState === 'listening'
                ? '#22d3ee'
                : orbState === 'thinking'
                ? '#c084fc'
                : orbState === 'speaking'
                ? '#38bdf8'
                : '#06b6d4'
            }
          />
        </div>
      </div>
    </aside>
  );
};
