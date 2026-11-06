import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  Sparkles,
  Terminal,
  Settings,
  Flame,
  CheckCircle,
} from 'lucide-react';
import { ThreeOrb, OrbTheme } from '../components/ThreeOrb';
import { AudioWaveform } from '../components/AudioWaveform';
import { OrbState, ChatMessage } from '../types';
import { voiceService } from '../services/voiceService';

interface VoiceConsoleViewProps {
  orbState: OrbState;
  onActivateVoice: () => void;
  onSendMessage: (text: string) => void;
  messages: ChatMessage[];
  audioLevel: number;
  theme?: OrbTheme;
  onThemeChange?: (theme: OrbTheme) => void;
}

export const VoiceConsoleView: React.FC<VoiceConsoleViewProps> = ({
  orbState,
  onActivateVoice,
  onSendMessage,
  messages,
  audioLevel,
  theme = 'gold',
  onThemeChange,
}) => {
  const [continuous, setContinuous] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('Default Futuristic Male (Synthesized)');
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [sampleCommands] = useState([
    'ULTRON, open my Kali terminal.',
    'ULTRON, check my system security.',
    'ULTRON, research CVE-2024-6387 OpenSSH vulnerability.',
    'ULTRON, start trading analysis on BTC.',
    'ULTRON, run Nmap scan on 192.168.56.101.',
    'ULTRON, find large files on my system.',
  ]);

  useEffect(() => {
    voiceService.setContinuousMode(continuous);
  }, [continuous]);

  const handleInterrupt = () => {
    voiceService.stopSpeaking();
    voiceService.stopListening();
  };

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-4">
      {/* Top Banner */}
      <div className="flex items-center justify-between p-4 rounded-2xl glass-panel-glow border border-purple-500/30">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-600/30 border border-purple-400/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <Radio className="w-6 h-6 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <h1 className="font-orbitron font-bold text-xl text-white tracking-wider flex items-center gap-2">
              VOICE CONSOLE
              <span className="text-xs font-mono font-normal text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/40">
                WHISPER / PIPER READY
              </span>
            </h1>
            <p className="text-xs font-rajdhani text-indigo-300">
              Low-latency continuous speech recognition and synthesized neural voice feedback for Kali Linux
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setContinuous(!continuous)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
              continuous
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'bg-slate-900 border-indigo-900/60 text-slate-400 hover:text-white'
            }`}
          >
            Continuous Mode: {continuous ? 'ACTIVE' : 'OFF'}
          </button>

          <button
            onClick={() => setTtsEnabled(!ttsEnabled)}
            className={`p-2 rounded-lg border transition-all ${
              ttsEnabled
                ? 'bg-purple-600/20 border-purple-400 text-purple-300'
                : 'bg-slate-900 border-indigo-900/60 text-slate-500'
            }`}
            title="Toggle Text-To-Speech Output"
          >
            {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Voice Center: 3D Orb Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Orb Interactive Canvas */}
        <div className="lg:col-span-7 rounded-2xl glass-panel p-6 flex flex-col items-center justify-between border border-indigo-900/40 min-h-[420px] relative">
          <div className="text-center">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
              State: {orbState} • Audio Input Level: {(audioLevel * 100).toFixed(0)}%
            </span>
            <div className="h-1 w-48 mx-auto mt-1 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-75"
                style={{ width: `${Math.max(5, audioLevel * 100)}%` }}
              />
            </div>
          </div>

          <div className="w-full flex-1 min-h-[340px] h-[340px] relative">
            <ThreeOrb
              state={orbState}
              onActivateVoice={onActivateVoice}
              audioLevel={audioLevel}
              theme={theme}
              onThemeChange={onThemeChange}
            />
          </div>

          {/* Voice Action Control Row */}
          <div className="w-full flex items-center justify-center gap-4 mt-2">
            <button
              onClick={onActivateVoice}
              className={`px-6 py-3 rounded-full font-orbitron font-bold text-xs tracking-wider flex items-center gap-2 transition-all ${
                orbState === 'listening'
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_20px_rgba(225,29,72,0.6)] animate-pulse'
                  : 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:opacity-90 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]'
              }`}
            >
              {orbState === 'listening' ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              {orbState === 'listening' ? 'STOP LISTENING' : 'START TALKING'}
            </button>

            <button
              onClick={handleInterrupt}
              className="px-4 py-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-indigo-900/60 font-mono text-xs"
            >
              Interrupt Speech
            </button>
          </div>
        </div>

        {/* Live Conversation Transcript */}
        <div className="lg:col-span-5 rounded-2xl glass-panel p-4 flex flex-col justify-between border border-indigo-900/40 min-h-[420px]">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-indigo-900/40">
              <span className="font-orbitron font-bold text-xs text-white">Voice Transcript</span>
              <span className="text-[10px] font-mono text-slate-400">Speech-To-Text Feed</span>
            </div>

            <div className="space-y-3 py-3 overflow-y-auto max-h-[300px]">
              {messages.slice(-6).map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-xl text-xs font-rajdhani ${
                    msg.sender === 'user'
                      ? 'bg-purple-950/40 border border-purple-500/30 text-purple-200 ml-4'
                      : 'bg-cyan-950/30 border border-cyan-500/30 text-cyan-100 mr-4'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                    <span className="font-bold text-white uppercase">{msg.sender}</span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <div className="whitespace-pre-line text-sm">{msg.text}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Voice Command Prompts */}
          <div className="border-t border-indigo-900/40 pt-3">
            <span className="text-[11px] font-mono text-cyan-400 block mb-1.5">
              Click to speak command:
            </span>
            <div className="grid grid-cols-1 gap-1">
              {sampleCommands.slice(0, 3).map((cmd, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(cmd)}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg bg-slate-900/60 hover:bg-purple-950/40 border border-indigo-900/40 text-[11px] font-mono text-slate-300 truncate transition-colors"
                >
                  "{cmd}"
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
