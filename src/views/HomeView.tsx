import React, { useState } from 'react';
import {
  Send,
  Mic,
  Paperclip,
  Activity,
  ArrowUpRight,
  Shield,
  Wrench,
  Globe,
  Download,
  Rocket,
  TrendingUp,
  CheckCircle2,
  Circle,
  Trophy,
  Wifi,
  Radio,
  ChevronDown,
} from 'lucide-react';
import { ThreeOrb, OrbTheme } from '../components/ThreeOrb';
import {
  ChatMessage,
  GoalItem,
  ActivityItem,
  MarketTicker,
  SystemMetrics,
  OrbState,
  NavSection,
} from '../types';

interface HomeViewProps {
  metrics: SystemMetrics;
  tickers: MarketTicker[];
  orbState: OrbState;
  onActivateVoice: () => void;
  onNavigate: (section: NavSection) => void;
  onSendMessage: (text: string) => void;
  messages: ChatMessage[];
  isThinking: boolean;
  theme?: OrbTheme;
  onThemeChange?: (theme: OrbTheme) => void;
  audioLevel?: number;
}

export const HomeView: React.FC<HomeViewProps> = ({
  metrics,
  tickers,
  orbState,
  onActivateVoice,
  onNavigate,
  onSendMessage,
  messages,
  isThinking,
  theme = 'gold',
  onThemeChange,
  audioLevel = 0,
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedModel, setSelectedModel] = useState('Local (Ollama)');
  const [goals, setGoals] = useState<GoalItem[]>([
    { id: '1', title: 'Learn Advanced Cybersecurity', completed: true, category: 'cyber' },
    { id: '2', title: 'Build ULTRON AI OS', completed: true, category: 'dev' },
    { id: '3', title: 'Become Profitable Trader', completed: false, category: 'trading' },
    { id: '4', title: 'Get ISRO Internship', completed: false, category: 'career' },
  ]);

  const [activities] = useState<ActivityItem[]>([
    { id: '1', title: 'Security scan completed', time: '21:45', category: 'security', status: 'completed' },
    { id: '2', title: 'Research: Zero-Day Exploit', time: '21:32', category: 'research', status: 'running' },
    { id: '3', title: 'System update ready', time: '21:20', category: 'system', status: 'completed' },
  ]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const toggleGoal = (id: string) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g))
    );
  };

  // Helper for Circular SVG Gauges
  const renderGauge = (value: number, color: string, label: string) => {
    const radius = 28;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
      <div className="flex flex-col items-center">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="32"
              cy="32"
              r={radius}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="5"
              fill="transparent"
            />
            <circle
              cx="32"
              cy="32"
              r={radius}
              stroke={color}
              strokeWidth="5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-xs font-bold font-mono text-slate-100">{value}%</span>
          </div>
        </div>
        <span className="text-[11px] font-mono font-semibold tracking-wider text-slate-400 mt-1 uppercase">
          {label}
        </span>
      </div>
    );
  };

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-4">
      {/* Top Main Grid: Left Orb, Center Assistant, Right System Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* LEFT COLUMN: 3D Holographic AI Neural Globe (As in Picture) */}
        <div className="lg:col-span-4 flex flex-col justify-between rounded-2xl glass-panel p-3 relative overflow-hidden border border-amber-500/30 shadow-[0_0_25px_rgba(245,158,11,0.12)] min-h-[460px]">
          {/* Hologram Canvas Area */}
          <div className="w-full flex-1 min-h-[380px] relative">
            <ThreeOrb
              state={orbState}
              onActivateVoice={onActivateVoice}
              theme={theme}
              onThemeChange={onThemeChange}
              audioLevel={audioLevel}
            />
          </div>

          {/* Holographic Pedestal & Telemetry base bar */}
          <div className="mt-2 px-3 py-2 flex items-center justify-between text-xs font-mono text-amber-300 border-t border-amber-500/20 bg-black/50 rounded-xl">
            <div className="flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="text-[11px]">Neural Synapse Core (Active)</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-amber-400 font-bold">
              <span>99.8% STABILITY</span>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Header & ULTRON Assistant Chat Panel */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-3">
          {/* Futuristic Hero Title */}
          <div className="text-center pt-1">
            <h1 className="font-orbitron font-extrabold text-3xl tracking-widest bg-gradient-to-r from-purple-400 via-indigo-200 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(168,85,247,0.4)]">
              ULTRON
            </h1>
            <p className="text-xs tracking-widest uppercase font-rajdhani font-semibold text-indigo-300/90 mt-0.5">
              Think &nbsp;•&nbsp; Analyze &nbsp;•&nbsp; Execute
            </p>

            {/* Sub-hero Pill */}
            <div className="inline-flex items-center gap-1.5 px-4 py-1 mt-1.5 rounded-full bg-gradient-to-r from-indigo-950/70 via-purple-950/50 to-cyan-950/70 border border-cyan-500/30 text-[11px] font-mono text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.15)]">
              <span>Your Personal AI OS for a Smarter, Safer Digital World?</span>
              <ArrowUpRight className="w-3 h-3 text-cyan-400" />
            </div>
          </div>

          {/* Assistant Chat Card */}
          <div className="flex-1 rounded-2xl glass-panel-glow p-3.5 flex flex-col justify-between border border-purple-500/30 min-h-[340px]">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-indigo-900/40">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-purple-600/30 border border-purple-400/50 flex items-center justify-center">
                  <Activity className="w-3.5 h-3.5 text-purple-300" />
                </div>
                <span className="font-orbitron font-bold text-sm tracking-wide text-white">
                  ULTRON Assistant
                </span>
                <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Online
                </span>
              </div>

              {/* Model Dropdown */}
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/40 border border-indigo-900/60 text-xs font-mono text-slate-300">
                <span>{selectedModel}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1 max-h-[220px]">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs font-rajdhani leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-purple-700/60 text-white border border-purple-400/40 rounded-br-none shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                        : 'bg-indigo-950/60 text-slate-200 border border-indigo-500/30 rounded-bl-none shadow-md backdrop-blur-sm'
                    }`}
                  >
                    {/* Assistant Avatar in message */}
                    {msg.sender === 'ultron' && (
                      <div className="flex items-center gap-2 mb-1.5 pb-1 border-b border-indigo-900/40 text-[11px] font-mono text-cyan-300">
                        <div className="w-4 h-4 rounded-full bg-cyan-500/20 border border-cyan-400/60 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                        </div>
                        <span>ULTRON Intelligence</span>
                      </div>
                    )}

                    <div className="whitespace-pre-line text-[13px]">{msg.text}</div>

                    {/* Proposal Action Card if present */}
                    {msg.commandProposal && (
                      <div className="mt-2.5 p-2 rounded-lg bg-black/60 border border-cyan-500/30 font-mono text-[11px]">
                        <div className="text-cyan-400 font-semibold mb-1">
                          Terminal Proposal:
                        </div>
                        <code className="text-purple-300 bg-slate-900 px-1.5 py-0.5 rounded block overflow-x-auto">
                          $ {msg.commandProposal.command}
                        </code>
                        <div className="text-slate-400 text-[10px] mt-1">
                          {msg.commandProposal.description}
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            onClick={() => onNavigate('system')}
                            className="px-2 py-0.5 rounded bg-cyan-600/80 hover:bg-cyan-500 text-white text-[10px] font-bold"
                          >
                            Authorize & Run
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isThinking && (
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
                  <span>ULTRON is thinking...</span>
                </div>
              )}
            </div>

            {/* Quick Suggestions */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 text-[11px] font-mono no-scrollbar">
              <button
                onClick={() => onSendMessage('Run a Security Scan on local system')}
                className="px-2.5 py-1 rounded-full bg-slate-900/80 hover:bg-purple-900/50 border border-indigo-800/40 text-slate-300 shrink-0 transition-all hover:border-cyan-400/60"
              >
                Run a Security Scan
              </button>
              <button
                onClick={() => onNavigate('system')}
                className="px-2.5 py-1 rounded-full bg-slate-900/80 hover:bg-purple-900/50 border border-indigo-800/40 text-slate-300 shrink-0 transition-all hover:border-cyan-400/60"
              >
                Open Terminal
              </button>
              <button
                onClick={() => onNavigate('research')}
                className="px-2.5 py-1 rounded-full bg-slate-900/80 hover:bg-purple-900/50 border border-indigo-800/40 text-slate-300 shrink-0 transition-all hover:border-cyan-400/60"
              >
                Research Cybersecurity
              </button>
              <button
                onClick={() => onSendMessage('Check my system security status')}
                className="px-2.5 py-1 rounded-full bg-slate-900/80 hover:bg-purple-900/50 border border-indigo-800/40 text-slate-300 shrink-0 transition-all hover:border-cyan-400/60"
              >
                Check System
              </button>
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} className="relative flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={onActivateVoice}
                title="Activate Voice Input"
                className={`p-2.5 rounded-full transition-all shadow-md ${
                  orbState === 'listening'
                    ? 'bg-cyan-500 text-black shadow-[0_0_15px_#06b6d4]'
                    : 'bg-purple-600/80 hover:bg-purple-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                }`}
              >
                <Mic className="w-4 h-4" />
              </button>

              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask ULTRON anything..."
                  className="w-full py-2.5 pl-4 pr-10 rounded-full bg-slate-950/80 border border-indigo-700/40 focus:border-cyan-400 focus:outline-none text-xs font-mono text-slate-100 placeholder-slate-500 shadow-inner"
                />
                <button
                  type="button"
                  title="Attach PCAP, Log, or Code file"
                  onClick={() => onNavigate('files')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
              </div>

              <button
                type="submit"
                className="p-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:opacity-90 transition-opacity shadow-[0_0_12px_rgba(6,182,212,0.4)]"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: System Status, Quick Actions, Goals, ULTRON Badge */}
        <div className="lg:col-span-3 space-y-3">
          {/* System Status Card */}
          <div className="rounded-2xl glass-panel p-3 border border-indigo-900/40">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-orbitron font-bold text-xs text-white">System Status</span>
              </div>
              <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Live
              </span>
            </div>

            {/* Donut Gauges */}
            <div className="grid grid-cols-3 gap-1 py-1">
              {renderGauge(metrics.cpuUsage, '#06b6d4', 'CPU')}
              {renderGauge(metrics.ramUsage, '#a855f7', 'RAM')}
              {renderGauge(metrics.diskUsage, '#10b981', 'Disk')}
            </div>

            <div className="text-[10px] font-mono text-center text-slate-400 border-t border-indigo-950/60 pt-2 mt-1">
              Uptime: <span className="text-slate-200">{metrics.uptime}</span> • <span className="text-cyan-300">Kali 2026.3</span>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="rounded-2xl glass-panel p-3 border border-indigo-900/40">
            <div className="flex items-center gap-1.5 mb-2.5">
              <span className="text-amber-400 text-sm">⚡</span>
              <span className="font-orbitron font-bold text-xs text-white">Quick Actions</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onNavigate('cyber_tools')}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900/60 hover:bg-purple-950/40 border border-indigo-800/30 hover:border-cyan-400/50 transition-all text-center group"
              >
                <Shield className="w-4 h-4 text-cyan-400 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-rajdhani font-semibold text-slate-200 leading-tight">
                  Run Pentest
                </span>
              </button>

              <button
                onClick={() => onNavigate('cyber_tools')}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900/60 hover:bg-purple-950/40 border border-indigo-800/30 hover:border-cyan-400/50 transition-all text-center group"
              >
                <Wrench className="w-4 h-4 text-cyan-400 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-rajdhani font-semibold text-slate-200 leading-tight">
                  Open Kali Tools
                </span>
              </button>

              <button
                onClick={() => onNavigate('cyber_tools')}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900/60 hover:bg-purple-950/40 border border-indigo-800/30 hover:border-cyan-400/50 transition-all text-center group"
              >
                <Globe className="w-4 h-4 text-cyan-400 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-rajdhani font-semibold text-slate-200 leading-tight">
                  Web Recon
                </span>
              </button>

              <button
                onClick={() => onNavigate('system')}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900/60 hover:bg-purple-950/40 border border-indigo-800/30 hover:border-cyan-400/50 transition-all text-center group"
              >
                <Download className="w-4 h-4 text-cyan-400 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-rajdhani font-semibold text-slate-200 leading-tight">
                  Update System
                </span>
              </button>

              <button
                onClick={() => onNavigate('voice')}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900/60 hover:bg-purple-950/40 border border-indigo-800/30 hover:border-cyan-400/50 transition-all text-center group"
              >
                <Rocket className="w-4 h-4 text-purple-400 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-rajdhani font-semibold text-slate-200 leading-tight">
                  Launch ULTRON
                </span>
              </button>

              <button
                onClick={() => onNavigate('trading')}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900/60 hover:bg-purple-950/40 border border-indigo-800/30 hover:border-cyan-400/50 transition-all text-center group"
              >
                <TrendingUp className="w-4 h-4 text-purple-400 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-rajdhani font-semibold text-slate-200 leading-tight">
                  Start Trading Bot
                </span>
              </button>
            </div>
          </div>

          {/* Your Goals Card */}
          <div className="rounded-2xl glass-panel p-3 border border-indigo-900/40">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full border border-purple-400 bg-purple-600/40" />
                <span className="font-orbitron font-bold text-xs text-white">Your Goals</span>
              </div>
              <button
                onClick={() => onNavigate('history')}
                className="text-[10px] font-mono text-purple-300 hover:text-cyan-300"
              >
                Manage
              </button>
            </div>

            <div className="space-y-1.5">
              {goals.map((goal) => (
                <div
                  key={goal.id}
                  onClick={() => toggleGoal(goal.id)}
                  className="flex items-center gap-2 cursor-pointer text-xs font-rajdhani hover:text-cyan-300 transition-colors"
                >
                  {goal.completed ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  )}
                  <span
                    className={`truncate ${
                      goal.completed ? 'text-slate-300 line-through opacity-75' : 'text-slate-200'
                    }`}
                  >
                    {goal.title}
                  </span>
                </div>
              ))}
            </div>

            {/* Motivational Banner */}
            <div className="mt-2.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-950/50 to-purple-950/50 border border-amber-500/20 flex items-center justify-center gap-1.5 text-[10px] font-mono text-amber-300">
              <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Dream Big... Achieve More...</span>
            </div>
          </div>

          {/* ULTRON Badge Card */}
          <div className="rounded-2xl bg-gradient-to-r from-indigo-950/80 via-purple-950/60 to-slate-950/90 border border-purple-500/30 p-2.5 text-center relative overflow-hidden">
            <div className="font-orbitron font-extrabold text-sm tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-200 to-purple-400">
              ULTRON
            </div>
            <div className="text-[10px] font-rajdhani text-indigo-300 mt-0.5">
              More Than an OS... A Complete AI Companion
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Activities, Market & Trading, Network Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Recent Activities */}
        <div className="rounded-2xl glass-panel p-3.5 border border-indigo-900/40">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span className="font-orbitron font-bold text-xs text-white">Recent Activities</span>
            </div>
            <button
              onClick={() => onNavigate('history')}
              className="text-[10px] font-mono text-cyan-400 hover:underline flex items-center gap-1"
            >
              View All →
            </button>
          </div>

          <div className="space-y-2">
            {activities.map((act) => (
              <div key={act.id} className="flex items-center justify-between text-xs font-rajdhani">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      act.category === 'security'
                        ? 'bg-emerald-400'
                        : act.category === 'research'
                        ? 'bg-sky-400'
                        : 'bg-purple-400'
                    }`}
                  />
                  <span className="text-slate-200 font-medium">{act.title}</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">{act.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Market & Trading */}
        <div className="rounded-2xl glass-panel p-3.5 border border-indigo-900/40 cursor-pointer" onClick={() => onNavigate('trading')}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span className="font-orbitron font-bold text-xs text-white">Market & Trading</span>
            </div>
          </div>

          <div className="flex items-baseline justify-between mb-1 text-xs font-mono">
            <div>
              <span className="text-slate-300 font-bold">BTC: </span>
              <span className="text-white">${tickers[0]?.price.toLocaleString()}</span>
              <span className="text-emerald-400 text-[11px] ml-1.5 font-semibold">▲ +1.21%</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between mb-2 text-xs font-mono">
            <div>
              <span className="text-slate-300 font-bold">ETH: </span>
              <span className="text-white">${tickers[1]?.price.toLocaleString()}</span>
              <span className="text-emerald-400 text-[11px] ml-1.5 font-semibold">▲ +0.87%</span>
            </div>
          </div>

          {/* Sparkline SVG */}
          <div className="h-9 w-full">
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 25">
              <path
                d="M 0 18 Q 15 12, 30 16 T 60 8 T 85 10 T 100 3"
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
              />
              <path
                d="M 0 18 Q 15 12, 30 16 T 60 8 T 85 10 T 100 3 L 100 25 L 0 25 Z"
                fill="url(#greenGrad)"
                opacity="0.25"
              />
              <defs>
                <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Network Status */}
        <div className="rounded-2xl glass-panel p-3.5 border border-indigo-900/40">
          <div className="flex items-center gap-2 mb-2">
            <Wifi className="w-4 h-4 text-cyan-400" />
            <span className="font-orbitron font-bold text-xs text-white">Network Status</span>
          </div>

          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs font-mono mb-2">
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="text-cyan-400 text-[11px]">⊕</span>
              <span className="text-[11px]">Download</span>
              <span className="font-bold text-slate-100 ml-auto">{metrics.networkDownload} MB/s</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="text-purple-400 text-[11px]">✈</span>
              <span className="text-[11px]">Upload</span>
              <span className="font-bold text-slate-100 ml-auto">{metrics.networkUpload} MB/s</span>
            </div>
            <div className="col-span-2 flex items-center gap-1.5 text-slate-300 mt-0.5">
              <span className="text-emerald-400 text-[11px]">⊙</span>
              <span className="text-[11px]">Latency</span>
              <span className="font-bold text-emerald-400 ml-2">{metrics.latencyMs} ms</span>
            </div>
          </div>

          {/* Network Flow Sparkline */}
          <div className="h-9 w-full">
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 25">
              <path
                d="M 0 20 L 15 15 L 25 18 L 40 8 L 55 12 L 70 5 L 85 10 L 100 2"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2"
              />
              <path
                d="M 0 20 L 15 15 L 25 18 L 40 8 L 55 12 L 70 5 L 85 10 L 100 2 L 100 25 L 0 25 Z"
                fill="url(#cyanGrad)"
                opacity="0.3"
              />
              <defs>
                <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
