import React from 'react';
import {
  Info,
  Shield,
  Terminal,
  Cpu,
  Layers,
  Download,
  ExternalLink,
  CheckCircle,
  FileCode,
} from 'lucide-react';

export const AboutView: React.FC = () => {
  const downloadStartupScript = () => {
    const script = `#!/bin/bash
# ==========================================================
# ULTRON - Kali Linux XFCE Startup & Environment Launcher
# ==========================================================
set -e

echo -e "\\033[1;36m[+] Initializing ULTRON AI Operating Environment...\\033[0m"

# 1. Check Ollama Daemon
if ! pgrep -x "ollama" > /dev/null; then
    echo -e "\\033[1;33m[*] Starting local Ollama service on 127.0.0.1:11434...\\033[0m"
    ollama serve > /dev/null 2>&1 &
    sleep 2
else
    echo -e "\\033[1;32m[+] Ollama inference service is running.\\033[0m"
fi

# 2. Check Primary Model
echo -e "\\033[1;34m[*] Verifying local LLM model (llama3.2:3b)...\\033[0m"
ollama list | grep -q "llama3.2" || ollama pull llama3.2:3b

# 3. Check Kali Audio (PulseAudio / PipeWire for Piper/Whisper)
echo -e "\\033[1;35m[*] Initializing audio subsystem for ULTRON Voice Core...\\033[0m"

# 4. Launch ULTRON Desktop Applet
echo -e "\\033[1;32m[+] ULTRON Core operational on port 3000. Launching browser...\\033[0m"
xdg-open "http://localhost:3000" > /dev/null 2>&1 &

echo -e "\\033[1;36m[+] ULTRON is online. Think • Analyze • Execute.\\033[0m"
`;

    const blob = new Blob([script], { type: 'application/x-sh' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ultron-start.sh';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-4">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl glass-panel flex flex-col md:flex-row items-center justify-between gap-4 border border-indigo-900/40">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-600/30 border border-purple-400/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <Info className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="font-orbitron font-bold text-xl text-white">
              ABOUT ULTRON AI OPERATING SYSTEM
            </h1>
            <p className="text-xs font-rajdhani text-slate-300">
              Personal AI Operating Environment engineered specifically for Kali Linux XFCE
            </p>
          </div>
        </div>

        <button
          onClick={downloadStartupScript}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 font-orbitron font-bold text-xs text-white flex items-center gap-2 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
        >
          <Download className="w-4 h-4" />
          DOWNLOAD ultron-start.sh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Architecture Overview */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl glass-panel p-5 border border-indigo-900/40 space-y-3">
            <h2 className="font-orbitron font-bold text-base text-cyan-300">
              System Architecture & Design Philosophy
            </h2>
            <p className="text-xs font-rajdhani text-slate-300 leading-relaxed">
              ULTRON transforms the standard Kali Linux distribution into a proactive, intelligent personal operating environment. Operating without replacing the existing Linux kernel or XFCE desktop environment, ULTRON acts as an executive AI companion capable of natural language task execution, automated defensive security audits, vulnerability intelligence research, and trading analysis.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-xs">
              <div className="p-3 rounded-xl bg-black/40 border border-indigo-950">
                <span className="text-purple-400 font-bold">Frontend Layer:</span>
                <p className="text-slate-400 text-[11px] mt-1 font-rajdhani">
                  React 19, Three.js 3D energy orb, Tailwind CSS, Web Speech API speech-to-text & synthesis.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-indigo-950">
                <span className="text-cyan-400 font-bold">Local AI Core:</span>
                <p className="text-slate-400 text-[11px] mt-1 font-rajdhani">
                  Ollama local inference engine (Llama 3.2, DeepSeek-R1, Qwen 2.5 Coder) on port 11434 with persistent SQLite memories.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-indigo-950">
                <span className="text-emerald-400 font-bold">System Dispatcher:</span>
                <p className="text-slate-400 text-[11px] mt-1 font-rajdhani">
                  Controlled subprocess execution, argument verification, permission allowlisting, and zero unrestricted root bypass.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-indigo-950">
                <span className="text-amber-400 font-bold">Cyber Arsenal:</span>
                <p className="text-slate-400 text-[11px] mt-1 font-rajdhani">
                  Integrated Kali tools (Nmap, Wireshark, Burp Suite, Gobuster, Nikto, Metasploit) with safe profiles.
                </p>
              </div>
            </div>
          </div>

          {/* Legal and Compliance */}
          <div className="rounded-2xl glass-panel p-5 border border-purple-500/30 space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-400" />
              <h3 className="font-orbitron font-bold text-sm text-white">
                Authorized Use & Ethical Declaration
              </h3>
            </div>
            <p className="text-xs font-rajdhani text-slate-300 leading-relaxed">
              ULTRON is strictly designed for defensive cybersecurity operations, authorized security auditing, educational research, and personal system productivity. The penetration testing workflows explicitly require signed authorization before scanning network targets, and destructive root filesystem commands are blocked by the built-in Permission Guard.
            </p>
          </div>
        </div>

        {/* Kali Linux Setup Guide */}
        <div className="lg:col-span-5 rounded-2xl glass-panel p-5 border border-indigo-900/40 space-y-4">
          <h2 className="font-orbitron font-bold text-base text-white">
            Kali Linux XFCE Setup Guide
          </h2>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <span className="text-cyan-400 font-bold block mb-1">
                1. Install Ollama on Kali:
              </span>
              <code className="block p-2 rounded-lg bg-black text-slate-200 border border-indigo-950 text-[11px]">
                curl -fsSL https://ollama.com/install.sh | sh
              </code>
            </div>

            <div>
              <span className="text-cyan-400 font-bold block mb-1">
                2. Pull Optimized AI Model:
              </span>
              <code className="block p-2 rounded-lg bg-black text-purple-300 border border-indigo-950 text-[11px]">
                ollama pull llama3.2:3b
              </code>
            </div>

            <div>
              <span className="text-cyan-400 font-bold block mb-1">
                3. Make Launcher Executable:
              </span>
              <code className="block p-2 rounded-lg bg-black text-emerald-300 border border-indigo-950 text-[11px]">
                chmod +x ultron-start.sh && ./ultron-start.sh
              </code>
            </div>

            <div className="pt-2 border-t border-indigo-950 text-[11px] font-rajdhani text-slate-400">
              <strong>Tip for XFCE Autostart:</strong> Copy `ultron-start.sh` into `~/.config/autostart/ultron.desktop` to have ULTRON initialize automatically upon graphical user login.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
