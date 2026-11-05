import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Cpu,
  Mic,
  Shield,
  Database,
  Trash2,
  Save,
  CheckCircle,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { aiService, AIServiceConfig } from '../services/aiService';
import { MemoryEntry } from '../types';

export const SettingsView: React.FC = () => {
  const [config, setConfig] = useState<AIServiceConfig>(aiService.getConfig());
  const [memories, setMemories] = useState<MemoryEntry[]>(aiService.getMemories());
  const [newTopic, setNewTopic] = useState('');
  const [newContent, setNewContent] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [requireApproval, setRequireApproval] = useState(true);
  const [protectEtc, setProtectEtc] = useState(true);

  const handleSaveConfig = () => {
    aiService.setConfig(config);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleAddMemory = () => {
    if (!newTopic.trim() || !newContent.trim()) return;
    const created = aiService.addMemory(newTopic.trim(), newContent.trim(), 'high');
    setMemories([created, ...memories]);
    setNewTopic('');
    setNewContent('');
  };

  const handleDeleteMemory = (id: string) => {
    aiService.deleteMemory(id);
    setMemories(memories.filter((m) => m.id !== id));
  };

  const handleClearMemories = () => {
    if (confirm("Clear all ULTRON memories? This cannot be undone.")) {
      aiService.clearMemories();
      setMemories([]);
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-4">
      {/* Header */}
      <div className="p-4 rounded-2xl glass-panel flex flex-col md:flex-row items-center justify-between gap-4 border border-indigo-900/40">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-600/30 border border-purple-400/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <SettingsIcon className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="font-orbitron font-bold text-xl text-white">
              ULTRON SYSTEM SETTINGS
            </h1>
            <p className="text-xs font-rajdhani text-slate-300">
              Ollama local engine configuration, speech preferences, security gates, and AI memory editor
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-xs font-mono text-emerald-300">
            <CheckCircle className="w-4 h-4" />
            <span>Settings saved successfully!</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column: AI & Engine Settings */}
        <div className="space-y-4">
          {/* AI Inference Provider */}
          <div className="rounded-2xl glass-panel p-4 border border-indigo-900/40 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-indigo-950">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span className="font-orbitron font-bold text-xs text-white">
                AI Inference Engine (Ollama / Local)
              </span>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Inference Provider:</label>
                <select
                  value={config.provider}
                  onChange={(e) => setConfig({ ...config, provider: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-indigo-800/40 text-cyan-300 focus:outline-none focus:border-cyan-400"
                >
                  <option value="ollama">Local Ollama Engine (Recommended for Kali)</option>
                  <option value="gemini">Google Gemini Cloud API Fallback</option>
                  <option value="offline">Offline Autonomous Heuristics</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Ollama API Endpoint:</label>
                <input
                  type="text"
                  value={config.ollamaEndpoint}
                  onChange={(e) => setConfig({ ...config, ollamaEndpoint: e.target.value })}
                  placeholder="http://localhost:11434"
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-indigo-800/40 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Active Model Tag:</label>
                <select
                  value={config.ollamaModel}
                  onChange={(e) => setConfig({ ...config, ollamaModel: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-indigo-800/40 text-purple-300 focus:outline-none focus:border-cyan-400"
                >
                  <option value="llama3.2:3b">llama3.2:3b (Ultra-fast responsive)</option>
                  <option value="llama3.2:1b">llama3.2:1b (Minimal RAM footprint)</option>
                  <option value="deepseek-r1:7b">deepseek-r1:7b (Advanced reasoning & CTF)</option>
                  <option value="qwen2.5-coder:7b">qwen2.5-coder:7b (Exploit & Python coding)</option>
                  <option value="mistral:7b">mistral:7b (General technical intelligence)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleSaveConfig}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 font-mono text-xs text-white font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Configuration
                </button>
              </div>
            </div>
          </div>

          {/* Security & Permissions */}
          <div className="rounded-2xl glass-panel p-4 border border-indigo-900/40 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-indigo-950">
              <Shield className="w-4 h-4 text-purple-400" />
              <span className="font-orbitron font-bold text-xs text-white">
                Permission Guards & Sandbox Safeguards
              </span>
            </div>

            <div className="space-y-2 text-xs font-rajdhani">
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-indigo-950 cursor-pointer">
                <span>Require explicit user approval for root & sudo commands</span>
                <input
                  type="checkbox"
                  checked={requireApproval}
                  onChange={(e) => setRequireApproval(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-indigo-950 cursor-pointer">
                <span>Protect /etc/shadow, /root/.ssh, and kernel sysfs directories</span>
                <input
                  type="checkbox"
                  checked={protectEtc}
                  onChange={(e) => setProtectEtc(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-indigo-950 cursor-pointer">
                <span>Localhost-only default binding (Block incoming WAN telemetry)</span>
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded text-purple-600 focus:ring-0"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: AI Memory Management */}
        <div className="rounded-2xl glass-panel p-4 border border-indigo-900/40 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-indigo-950">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <span className="font-orbitron font-bold text-xs text-white">
                  ULTRON Memory Core (Persistent)
                </span>
              </div>
              <button
                onClick={handleClearMemories}
                className="text-[10px] font-mono text-rose-400 hover:underline"
              >
                Clear All
              </button>
            </div>

            <p className="text-xs font-rajdhani text-slate-300 mt-2">
              ULTRON retains project goals, system architecture preferences, and research history across restarts.
            </p>

            {/* Add Memory Form */}
            <div className="p-3 rounded-xl bg-black/50 border border-indigo-950 mt-3 space-y-2">
              <div className="text-[11px] font-mono text-cyan-400 font-bold">
                Add Permanent Memory Entry
              </div>
              <input
                type="text"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                placeholder="Topic: e.g. Kali Lab IP Range"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-indigo-800/40 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
              />
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Content details to remember..."
                rows={2}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-indigo-800/40 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
              />
              <button
                onClick={handleAddMemory}
                className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 font-mono text-xs text-white flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Store Memory
              </button>
            </div>

            {/* Memories List */}
            <div className="space-y-2 mt-3 max-h-60 overflow-y-auto pr-1">
              {memories.map((mem) => (
                <div
                  key={mem.id}
                  className="p-3 rounded-xl bg-slate-950/60 border border-indigo-950 flex items-start justify-between gap-2"
                >
                  <div className="text-xs font-rajdhani">
                    <div className="font-bold text-cyan-300 font-mono text-[11px]">
                      {mem.topic}
                    </div>
                    <p className="text-slate-300 mt-0.5">{mem.content}</p>
                    <div className="text-[10px] font-mono text-slate-500 mt-1">
                      Recorded: {mem.timestamp}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteMemory(mem.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
