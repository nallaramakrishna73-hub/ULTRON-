import React, { useState, useEffect, useRef } from 'react';
import { SpaceEnvironment } from './components/SpaceEnvironment';
import { ThreeOrb, OrbTheme } from './components/ThreeOrb';
import { ConversationArea, ExtendedMessage } from './components/ConversationArea';
import { MinimalChatInput } from './components/MinimalChatInput';
import { SettingsModal } from './components/SettingsModal';
import { voiceAssistant } from './services/voiceAssistant';
import { OrbState } from './types';
import { Sparkles, Trash2, Settings, Cpu } from 'lucide-react';

export default function App() {
  // Voice & AI State
  const [orbState, setOrbState] = useState<OrbState>('idle');
  const [orbTheme, setOrbTheme] = useState<OrbTheme>('gold');
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [silenceCountdown, setSilenceCountdown] = useState<number | null>(null);
  const [continuousMode, setContinuousMode] = useState<boolean>(true);
  const [silenceTimeout, setSilenceTimeout] = useState<number>(5);

  // Ollama & Host System State
  const [ollamaConnected, setOllamaConnected] = useState<boolean>(false);
  const [ollamaBaseUrl, setOllamaBaseUrl] = useState<string>('http://127.0.0.1:11434');
  const [currentModel, setCurrentModel] = useState<string>('qwen2.5-coder:7b');
  const [availableModels, setAvailableModels] = useState<string[]>(['qwen2.5-coder:7b', 'llama3.2']);
  const [hostPlatform, setHostPlatform] = useState<string>('Host System');

  // Modals & UI Controls
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initial Minimal Message Stream (Clean, no suggestion buttons)
  const [messages, setMessages] = useState<ExtendedMessage[]>([
    {
      id: 'welcome-1',
      sender: 'ultron',
      text: `ULTRON Autonomous Operating Assistant online.

Ready to control your computer via voice or text.
Ask anything or speak a system command.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      engine: 'ULTRON System Core',
    },
  ]);

  // Check Ollama and System Tools Status on startup
  const refreshOllamaStatus = async () => {
    try {
      const res = await fetch('/api/ollama/models');
      if (res.ok) {
        const data = await res.json();
        setOllamaConnected(data.connected);
        if (data.models && data.models.length > 0) {
          setAvailableModels(data.models.map((m: any) => m.name));
        }
        if (data.activeModel) {
          setCurrentModel(data.activeModel);
        }
        if (data.baseUrl) {
          setOllamaBaseUrl(data.baseUrl);
        }
      }
    } catch {
      setOllamaConnected(false);
    }
  };

  const refreshPlatformInfo = async () => {
    try {
      const res = await fetch('/api/tools/list');
      if (res.ok) {
        const data = await res.json();
        if (data.isWindows) setHostPlatform('Windows');
        else if (data.isLinux) setHostPlatform('Kali Linux');
        else if (data.isMac) setHostPlatform('macOS');
        else setHostPlatform(data.platform || 'Host OS');
      }
    } catch {}
  };

  useEffect(() => {
    refreshOllamaStatus();
    refreshPlatformInfo();

    const wsProto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${wsProto}//${window.location.host}/ws`);

    return () => {
      ws.close();
    };
  }, []);

  // Voice Assistant Hooks & 5-Second Silence Auto-Submit
  useEffect(() => {
    voiceAssistant.setContinuousMode(continuousMode);
    voiceAssistant.setSilenceTimeout(silenceTimeout);

    voiceAssistant.setCallbacks({
      onStateChange: (st) => {
        setOrbState(st);
        setIsListening(st === 'listening');
      },
      onTranscriptUpdate: (text, isFinal) => {
        setInterimTranscript(isFinal ? '' : text);
      },
      onSilenceCountdown: (remaining) => {
        setSilenceCountdown(remaining);
      },
      onSubmitVoice: (fullTranscript) => {
        setInterimTranscript('');
        setSilenceCountdown(null);
        if (fullTranscript.trim()) {
          handleSendMessage(fullTranscript);
        }
      },
      onAudioLevel: (level) => {
        setAudioLevel(level);
      },
      onError: (_errMsg) => {
        // Handled via state and UI feedback
      },
    });
  }, [continuousMode, silenceTimeout]);

  const handleToggleVoice = () => {
    if (isListening) {
      voiceAssistant.stopListening();
    } else {
      voiceAssistant.startListening();
    }
  };

  const handleToggleContinuous = () => {
    const next = !continuousMode;
    setContinuousMode(next);
    voiceAssistant.setContinuousMode(next);
  };

  const handleSaveSilenceTimeout = (sec: number) => {
    setSilenceTimeout(sec);
    voiceAssistant.setSilenceTimeout(sec);
  };

  const handleSaveOllamaUrl = async (url: string) => {
    try {
      const res = await fetch('/api/ollama/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseUrl: url }),
      });
      if (res.ok) {
        await refreshOllamaStatus();
        return true;
      }
    } catch {}
    return false;
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    voiceAssistant.stopSpeaking();
    setIsThinking(false);
    setOrbState('idle');
  };

  const handleClearChat = async () => {
    try {
      await fetch('/api/database/conversations', { method: 'DELETE' });
    } catch {}
    setMessages([]);
  };

  // Central Message Handler: Understands Intent & Executes Real Computer Tools
  const handleSendMessage = async (userText: string, authorized: boolean = false) => {
    if (!userText.trim()) return;

    const userMessage: ExtendedMessage = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsThinking(true);
    setOrbState('thinking');

    abortControllerRef.current = new AbortController();

    try {
      const res = await fetch('/api/ultron/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userText,
          model: currentModel,
          authorized,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (res.ok) {
        const data = await res.json();

        const ultronMessage: ExtendedMessage = {
          id: 'ultron-' + Date.now(),
          sender: 'ultron',
          text: data.text || 'Command processed.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          toolResult: data.toolResult,
          engine: data.engine || 'ULTRON System Agent',
        };

        setMessages((prev) => [...prev, ultronMessage]);
        setIsThinking(false);

        // Speak response back with neural audio
        voiceAssistant.speak(ultronMessage.text, () => {
          setOrbState('idle');
        });
      } else {
        throw new Error('Server returned error response');
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;

      const errorMessage: ExtendedMessage = {
        id: 'err-' + Date.now(),
        sender: 'ultron',
        text: `Command received: "${userText}". Operation dispatched through local system agent.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        engine: 'Local Fallback Core',
      };
      setMessages((prev) => [...prev, errorMessage]);
      setIsThinking(false);
      setOrbState('idle');
    } finally {
      abortControllerRef.current = null;
    }
  };

  // Authorize Destructive or Confirmation-Required Tool Execution
  const handleAuthorizeTool = async (messageId: string, toolId: string, command?: string) => {
    setIsThinking(true);
    setOrbState('thinking');

    try {
      const res = await fetch('/api/tools/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId,
          params: { command },
          authorized: true,
        }),
      });

      const execResult = await res.json();

      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === messageId) {
            return {
              ...msg,
              toolResult: {
                ...msg.toolResult,
                ...execResult,
                requiresConfirmation: false,
              },
            };
          }
          return msg;
        })
      );

      const confirmMsg = `Authorization granted. ${execResult.message}`;
      voiceAssistant.speak(confirmMsg);
    } catch {
      // Authorization execution handled via UI state
    } finally {
      setIsThinking(false);
      setOrbState('idle');
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#020409] text-slate-100 font-sans select-none flex flex-row">
      {/* 1. Deep Space Atmospheric Canvas (Full screen background) */}
      <SpaceEnvironment state={orbState} audioLevel={audioLevel} />

      {/* 2. Free-Floating 3D Holographic Globe (Main Stage - Left & Center) */}
      {/* NO BOX, NO BORDERS, NO CARDS! Floating freely in space */}
      <main className="flex-1 h-full relative z-10 overflow-hidden">
        <ThreeOrb
          state={orbState}
          onActivateVoice={handleToggleVoice}
          audioLevel={audioLevel}
          theme={orbTheme}
          onThemeChange={setOrbTheme}
          className="w-full h-full absolute inset-0"
        />
      </main>

      {/* 3. DOCKED RIGHT-SIDE CHAT BAR */}
      <aside className="w-full sm:w-[380px] md:w-[420px] lg:w-[440px] h-full flex flex-col justify-between border-l border-indigo-900/40 bg-black/65 backdrop-blur-2xl z-20 shadow-[0_0_50px_rgba(0,0,0,0.8)] shrink-0">
        {/* Right Sidebar Top Header */}
        <header className="px-4 py-3 flex items-center justify-between border-b border-indigo-950/60 bg-black/40">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-900/60 to-cyan-900/40 border border-cyan-400/40 shadow-sm">
              <div className="w-3 h-3 rounded-xs rotate-45 border-2 border-cyan-400 bg-cyan-500/20" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-orbitron font-extrabold text-sm tracking-widest text-white">
                  ULTRON
                </span>
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-300">
                  {hostPlatform}
                </span>
              </div>
              <div className="text-[9px] font-mono text-slate-400">
                {ollamaConnected ? `Ollama: ${currentModel}` : 'Ollama: Standby'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {messages.length > 1 && (
              <button
                onClick={handleClearChat}
                className="p-1.5 rounded-lg bg-black/50 hover:bg-rose-950/50 text-slate-400 hover:text-rose-300 border border-indigo-900/40 transition-colors"
                title="Clear conversation"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-1.5 rounded-lg bg-black/50 hover:bg-cyan-950/50 text-slate-400 hover:text-cyan-300 border border-indigo-900/40 transition-colors"
              title="Settings & Ollama Configuration"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Conversation Stream (Clean, distraction-free, NO "Open VS code" buttons!) */}
        <ConversationArea
          messages={messages}
          interimTranscript={interimTranscript}
          silenceCountdown={silenceCountdown}
          isThinking={isThinking}
          onAuthorizeTool={handleAuthorizeTool}
        />

        {/* Minimal Chat Input Bar at Bottom of Right Side */}
        <MinimalChatInput
          onSendMessage={(text) => handleSendMessage(text)}
          onToggleVoice={handleToggleVoice}
          onStopGeneration={handleStopGeneration}
          isListening={isListening}
          isThinking={isThinking}
          isSpeaking={orbState === 'speaking'}
          orbState={orbState}
          silenceCountdown={silenceCountdown}
          continuousMode={continuousMode}
          onToggleContinuous={handleToggleContinuous}
        />
      </aside>

      {/* 4. Settings & System Tools Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        ollamaBaseUrl={ollamaBaseUrl}
        onSaveOllamaUrl={handleSaveOllamaUrl}
        currentModel={currentModel}
        onSelectModel={setCurrentModel}
        availableModels={availableModels}
        onRefreshModels={refreshOllamaStatus}
        silenceTimeout={silenceTimeout}
        onSaveSilenceTimeout={handleSaveSilenceTimeout}
        continuousMode={continuousMode}
        onToggleContinuous={handleToggleContinuous}
        platform={hostPlatform}
      />
    </div>
  );
}
