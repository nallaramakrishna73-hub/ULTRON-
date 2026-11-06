import React, { useState, useEffect } from 'react';
import {
  X,
  Cpu,
  Mic,
  Wrench,
  Check,
  AlertCircle,
  RefreshCw,
  Terminal,
  Shield,
  Folder,
  Code,
  Globe,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  ollamaBaseUrl: string;
  onSaveOllamaUrl: (url: string) => Promise<boolean>;
  currentModel: string;
  onSelectModel: (model: string) => void;
  availableModels: string[];
  onRefreshModels: () => void;
  silenceTimeout: number;
  onSaveSilenceTimeout: (sec: number) => void;
  continuousMode: boolean;
  onToggleContinuous: () => void;
  platform: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  ollamaBaseUrl,
  onSaveOllamaUrl,
  currentModel,
  onSelectModel,
  availableModels,
  onRefreshModels,
  silenceTimeout,
  onSaveSilenceTimeout,
  continuousMode,
  onToggleContinuous,
  platform,
}) => {
  const [activeTab, setActiveTab] = useState<'ai' | 'voice' | 'tools'>('ai');
  const [inputUrl, setInputUrl] = useState(ollamaBaseUrl);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [tools, setTools] = useState<any[]>([]);

  useEffect(() => {
    setInputUrl(ollamaBaseUrl);
  }, [ollamaBaseUrl]);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/tools/list')
        .then((r) => r.json())
        .then((d) => {
          if (d.tools) setTools(d.tools);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestAndSaveUrl = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    const success = await onSaveOllamaUrl(inputUrl);
    setIsSaving(false);
    if (success) {
      setSaveStatus('Connected successfully!');
      setTimeout(() => setSaveStatus(null), 3000);
    } else {
      setSaveStatus('Could not reach Ollama at this URL. Make sure `ollama serve` is running.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#070b18] border border-indigo-900/60 shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-indigo-950 bg-black/40">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center">
              <Cpu className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h2 className="font-orbitron font-bold text-sm tracking-wider text-white">
                ULTRON SETTINGS & AGENT
              </h2>
              <p className="text-[10px] font-mono text-slate-400">
                Host OS: <span className="text-cyan-300 uppercase">{platform}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-indigo-950 px-6 bg-slate-950/40 text-xs font-mono">
          <button
            onClick={() => setActiveTab('ai')}
            className={`py-2.5 px-4 font-semibold border-b-2 transition-all ${
              activeTab === 'ai'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Local Ollama AI
          </button>
          <button
            onClick={() => setActiveTab('voice')}
            className={`py-2.5 px-4 font-semibold border-b-2 transition-all ${
              activeTab === 'voice'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Voice & Silence Settings
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className={`py-2.5 px-4 font-semibold border-b-2 transition-all ${
              activeTab === 'tools'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Registered Tools ({tools.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs font-rajdhani">
          {/* TAB 1: LOCAL OLLAMA CONFIGURATION */}
          {activeTab === 'ai' && (
            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 font-mono text-xs mb-1.5 font-bold">
                  Ollama API Endpoint URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="http://127.0.0.1:11434"
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-indigo-900/60 focus:border-cyan-400 focus:outline-none font-mono text-slate-100"
                  />
                  <button
                    onClick={handleTestAndSaveUrl}
                    disabled={isSaving}
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    Save & Test
                  </button>
                </div>
                {saveStatus && (
                  <p className={`mt-1.5 text-[11px] font-mono ${saveStatus.includes('success') ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {saveStatus}
                  </p>
                )}
                <p className="mt-1 text-[11px] text-slate-400">
                  Ensure Ollama is running on your machine (<code className="text-cyan-300">ollama serve</code>). Default is <code className="text-cyan-300">http://127.0.0.1:11434</code>.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-slate-300 font-mono text-xs font-bold">
                    Active Ollama Model
                  </label>
                  <button
                    onClick={onRefreshModels}
                    className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:underline"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Refresh Models
                  </button>
                </div>
                <select
                  value={currentModel}
                  onChange={(e) => onSelectModel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-indigo-900/60 focus:border-cyan-400 focus:outline-none font-mono text-slate-100 text-xs"
                >
                  {availableModels.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-[11px] text-slate-400">
                  Recommended: <code className="text-cyan-300">qwen2.5-coder:7b</code>, <code className="text-cyan-300">llama3.2</code>, or <code className="text-cyan-300">mistral</code>.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: VOICE & SILENCE SETTINGS */}
          {activeTab === 'voice' && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-mono text-xs font-bold">
                    Silence Detection Timeout
                  </label>
                  <span className="text-cyan-400 font-mono font-bold">{silenceTimeout} seconds</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="10"
                  step="1"
                  value={silenceTimeout}
                  onChange={(e) => onSaveSilenceTimeout(parseInt(e.target.value, 10))}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  ULTRON waits for this many seconds of silence after you stop talking before automatically submitting your request. Default is 5 seconds.
                </p>
              </div>

              <div className="pt-3 border-t border-indigo-950/60 flex items-center justify-between">
                <div>
                  <div className="font-mono text-xs font-bold text-slate-200">Continuous Voice Mode</div>
                  <div className="text-[11px] text-slate-400">
                    Automatically re-enables listening after ULTRON finishes speaking its response.
                  </div>
                </div>
                <button
                  onClick={onToggleContinuous}
                  className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-all ${
                    continuousMode
                      ? 'bg-cyan-500 text-black shadow-[0_0_10px_#06b6d4]'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {continuousMode ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: REGISTERED SYSTEM TOOLS */}
          {activeTab === 'tools' && (
            <div className="space-y-3">
              <p className="text-slate-400 text-xs">
                These tools run real operating-system operations on your computer when triggered via conversational commands.
              </p>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {tools.map((tool) => (
                  <div
                    key={tool.id}
                    className="p-3 rounded-xl bg-slate-950/70 border border-indigo-900/40 font-mono text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="font-bold text-white">{tool.name}</span>
                        <code className="text-[10px] text-cyan-300">({tool.id})</code>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] ${
                          tool.permission === 'safe'
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-950/60 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {tool.permission}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-rajdhani">{tool.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-indigo-950 bg-black/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
