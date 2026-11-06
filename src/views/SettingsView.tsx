import React, { useState, useEffect } from 'react';
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
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [newTopic, setNewTopic] = useState('');
  const [newContent, setNewContent] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [requireApproval, setRequireApproval] = useState(true);
  const [protectEtc, setProtectEtc] = useState(true);

  // Ollama status
  const [ollamaStatus, setOllamaStatus] = useState<{ connected: boolean; models: string[]; baseUrl: string }>({
    connected: false,
    models: ['qwen2.5-coder:7b', 'llama3.2:3b', 'mistral:7b'],
    baseUrl: 'http://127.0.0.1:11434',
  });
  const [isCheckingOllama, setIsCheckingOllama] = useState(false);

  const checkOllama = async () => {
    setIsCheckingOllama(true);
    try {
      const res = await fetch('/api/ollama/models');
      if (res.ok) {
        const data = await res.json();
        setOllamaStatus({
          connected: data.connected,
          models: data.models?.map((m: any) => m.name) || ['qwen2.5-coder:7b'],
          baseUrl: data.baseUrl,
        });
      }
    } catch {} finally {
      setIsCheckingOllama(false);
    }
  };

  const loadMemories = async () => {
    const mems = await aiService.refreshMemories();
    setMemories(mems);
  };

  useEffect(() => {
    checkOllama();
    loadMemories();
  }, []);

  const handleSaveConfig = () => {
    aiService.setConfig(config);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleAddMemory = async () => {
    if (!newTopic.trim() || !newContent.trim()) return;
    const created = await aiService.addMemory(newTopic.trim(), newContent.trim(), 'high');
    setMemories([created, ...memories]);
    setNewTopic('');
    setNewContent('');
  };

  const handleDeleteMemory = async (id: string) => {
    await aiService.deleteMemory(id);
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
              Ollama local engine configuration, speech preferences, security gates, and SQLite memory editor
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
            <div className="flex items-center justify-between pb-2 border-b border-indigo-950">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span className="font-orbitron font-bold text-xs text-white">
                  Local AI Inference Engine (Ollama)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                  ollamaStatus.connected ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                }`}>
                  {ollamaStatus.connected ? 'Ollama Online' : 'Standby / Fallback'}
                </span>
                <button onClick={checkOllama} className="text-slate-400 hover:text-white" title="Check connection">
                  <RefreshCw className={`w-3 h-3 ${isCheckingOllama ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Primary Engine:</label>
                <select
                  value={config.provider}
                  onChange={(e) => setConfig({ ...config, provider: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-indigo-800/40 text-cyan-300 focus:outline-none focus:border-cyan-400"
                >
                  <option value="ollama">Local Ollama (Primary / Kali Linux Default)</option>
                  <option value="gemini">Google Gemini Cloud API (Secondary Fallback)</option>
                  <option value="offline">Offline Autonomous Core (Zero Internet)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Ollama Daemon URL:</label>
                <input
                  type="text"
                  value={config.ollamaEndpoint}
                  onChange={(e) => setConfig({ ...config, ollamaEndpoint: e.target.value })}
                  placeholder="http://127.0.0.1:11434"
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-indigo-800/40 text-white focus:outline-none focus:border-cyan-400"
                >
                </input>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Active Model Name:</label>
                <select
                  value={config.ollamaModel}
                  onChange={(e) => setConfig({ ...config, ollamaModel: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-indigo-800/40 text-purple-300 focus:outline-none focus:border-cyan-400"
                >
                  {ollamaStatus.models.map((m) => (
                    <option key={m} value={m}>
                      {m} {m.includes('qwen2.5-coder') ? '(Recommended Default)' : ''}
                    </option>
                  ))}
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
                <span>Require explicit user approval for destructive commands</span>
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
                  ULTRON SQLite Memory Core
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
              Persistent memory entries stored in local SQLite database (`data/ultron.db`).
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
