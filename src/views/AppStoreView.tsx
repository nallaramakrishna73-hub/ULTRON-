import React, { useState } from 'react';
import {
  Grid,
  Download,
  CheckCircle,
  Shield,
  Code,
  Cpu,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface AppItem {
  id: string;
  name: string;
  category: 'Cybersecurity' | 'Development' | 'AI Tools' | 'System Utilities';
  description: string;
  installed: boolean;
  version: string;
  aptPackage: string;
}

const APPS_CATALOG: AppItem[] = [
  { id: '1', name: 'Nmap', category: 'Cybersecurity', description: 'Network exploration tool and security scanner.', installed: true, version: '7.94-kali', aptPackage: 'nmap' },
  { id: '2', name: 'Wireshark', category: 'Cybersecurity', description: 'Deep network protocol analyzer and packet decoder.', installed: true, version: '4.2.2', aptPackage: 'wireshark' },
  { id: '3', name: 'Metasploit', category: 'Cybersecurity', description: 'Penetration testing execution platform.', installed: true, version: '6.3.55', aptPackage: 'metasploit-framework' },
  { id: '4', name: 'Ollama', category: 'AI Tools', description: 'Local LLM inference runner for Llama, Mistral, Qwen, and DeepSeek.', installed: true, version: '0.4.1', aptPackage: 'ollama' },
  { id: '5', name: 'Ghidra', category: 'Cybersecurity', description: 'NSA software reverse engineering framework for SRE & binary analysis.', installed: false, version: '11.0.3', aptPackage: 'ghidra' },
  { id: '6', name: 'Aircrack-ng', category: 'Cybersecurity', description: 'Complete suite of tools to assess 802.11 Wi-Fi network security.', installed: true, version: '1.7', aptPackage: 'aircrack-ng' },
  { id: '7', name: 'VS Code (OSS)', category: 'Development', description: 'Open-source code editor with Python and Go extensions.', installed: false, version: '1.92', aptPackage: 'code-oss' },
  { id: '8', name: 'Docker Engine', category: 'System Utilities', description: 'Container runtime for isolated lab vulnerable targets.', installed: true, version: '27.1.1', aptPackage: 'docker.io' },
  { id: '9', name: 'Piper TTS', category: 'AI Tools', description: 'Fast, local neural text-to-speech engine optimized for Linux.', installed: true, version: '1.2.0', aptPackage: 'piper-tts' },
];

export const AppStoreView: React.FC = () => {
  const [apps, setApps] = useState<AppItem[]>(APPS_CATALOG);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Cybersecurity', 'Development', 'AI Tools', 'System Utilities'];

  const filteredApps =
    selectedCategory === 'All' ? apps : apps.filter((a) => a.category === selectedCategory);

  const handleToggleInstall = (app: AppItem) => {
    if (!app.installed) {
      if (confirm(`Authorize installation of ${app.name}?\nCommand: sudo apt install -y ${app.aptPackage}`)) {
        setApps((prev) =>
          prev.map((a) => (a.id === app.id ? { ...a, installed: true } : a))
        );
      }
    } else {
      if (confirm(`Confirm uninstallation of ${app.name} (${app.aptPackage})?`)) {
        setApps((prev) =>
          prev.map((a) => (a.id === app.id ? { ...a, installed: false } : a))
        );
      }
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-4">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl glass-panel flex flex-col md:flex-row items-center justify-between gap-4 border border-indigo-900/40">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-600/30 border border-purple-400/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <Grid className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="font-orbitron font-bold text-xl text-white">
              KALI LINUX APP STORE & PACKAGES
            </h1>
            <p className="text-xs font-rajdhani text-slate-300">
              Verified Kali repositories, local AI inference engines, and security auditing tools
            </p>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-mono border transition-all ${
                selectedCategory === cat
                  ? 'bg-cyan-600/40 border-cyan-400 text-cyan-200'
                  : 'bg-black/40 border-indigo-950 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Apps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredApps.map((app) => (
          <div
            key={app.id}
            className="p-4 rounded-2xl glass-panel border border-indigo-900/40 hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-orbitron font-bold text-sm text-white">
                  {app.name}
                </span>
                <span className="text-[10px] font-mono text-purple-300 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-500/30">
                  {app.category}
                </span>
              </div>
              <p className="text-xs font-rajdhani text-slate-300 mt-2 leading-relaxed">
                {app.description}
              </p>
              <div className="text-[11px] font-mono text-cyan-400 mt-2">
                apt: {app.aptPackage} • v{app.version}
              </div>
            </div>

            <div className="pt-2 border-t border-indigo-950 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">
                {app.installed ? 'Status: Active' : 'Available'}
              </span>
              <button
                onClick={() => handleToggleInstall(app)}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all ${
                  app.installed
                    ? 'bg-rose-950/60 text-rose-300 border border-rose-600/40 hover:bg-rose-900'
                    : 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                }`}
              >
                {app.installed ? 'UNINSTALL' : 'INSTALL PACKAGE'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
