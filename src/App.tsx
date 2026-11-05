import React, { useState, useEffect, useRef } from 'react';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { HomeView } from './views/HomeView';
import { VoiceConsoleView } from './views/VoiceConsoleView';
import { CyberToolsView } from './views/CyberToolsView';
import { ResearchEngineView } from './views/ResearchEngineView';
import { SecurityScannerView } from './views/SecurityScannerView';
import { TradingHubView } from './views/TradingHubView';
import { SystemControlView } from './views/SystemControlView';
import { FilesManagerView } from './views/FilesManagerView';
import { AppStoreView } from './views/AppStoreView';
import { SettingsView } from './views/SettingsView';
import { HistoryView } from './views/HistoryView';
import { AboutView } from './views/AboutView';
import { CyberBackground } from './components/CyberBackground';
import { OrbTheme } from './components/ThreeOrb';
import {
  NavSection,
  OrbState,
  ChatMessage,
  SystemMetrics,
  MarketTicker,
} from './types';
import { aiService } from './services/aiService';
import { voiceService } from './services/voiceService';
import { systemService } from './services/systemService';

export default function App() {
  const [currentSection, setCurrentSection] = useState<NavSection>('home');
  const [orbState, setOrbState] = useState<OrbState>('idle');
  const [orbTheme, setOrbTheme] = useState<OrbTheme>('gold');
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [metrics, setMetrics] = useState<SystemMetrics>(systemService.getMetrics());
  const [tickers, setTickers] = useState<MarketTicker[]>(systemService.getTickers());
  const [isThinking, setIsThinking] = useState(false);

  // Initial Conversation from the Reference Mockup
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'user',
      text: 'Hey ULTRON, what can you do for me today?',
      timestamp: '21:46',
    },
    {
      id: 'msg-2',
      sender: 'ultron',
      text: `I'm ULTRON — your AI companion.
Here are some things I can help you with:
✅ Scan for vulnerabilities & pentest
✅ Research cybersecurity topics
✅ Analyze files & code
✅ Manage your system & apps
✅ Track stocks & trading insights
✅ Learn and explore with AI
What would you like to do?`,
      timestamp: '21:46',
    },
  ]);

  // Periodic telemetry refresh
  useEffect(() => {
    const timer = setInterval(() => {
      setMetrics(systemService.getMetrics());
      setTickers(systemService.getTickers());
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  // Voice Service Setup
  useEffect(() => {
    voiceService.setCallbacks(
      (state) => {
        if (state === 'listening') {
          setOrbState('listening');
        } else if (state === 'speaking') {
          setOrbState('speaking');
        } else if (state === 'idle') {
          setOrbState('idle');
        } else if (state === 'error') {
          setOrbState('idle');
        }
      },
      (transcript, isFinal) => {
        if (isFinal && transcript.trim()) {
          handleSendMessage(transcript);
        }
      },
      (level) => {
        setAudioLevel(level);
      }
    );
  }, []);

  const handleToggleVoice = () => {
    if (orbState === 'listening') {
      voiceService.stopListening();
      setOrbState('idle');
    } else {
      voiceService.startListening();
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);
    setOrbState('thinking');

    const result = await aiService.processQuery(
      text,
      { currentSection, orbTheme },
      (status) => {
        setOrbState(status as OrbState);
      }
    );

    setIsThinking(false);

    // Apply dynamic theme change if requested by AI Brain
    if (result.themeChange && result.themeChange !== orbTheme) {
      setOrbTheme(result.themeChange);
    }

    const ultronMsg: ChatMessage = {
      id: 'ultron-' + Date.now(),
      sender: 'ultron',
      text: result.text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actionTriggered: result.actionTriggered,
      commandProposal: result.commandProposal,
    };

    setMessages((prev) => [...prev, ultronMsg]);

    // Speak response so ULTRON speaks back with neural audio
    voiceService.speak(result.text, () => {
      setOrbState('idle');
    });

    // Auto-navigate if the AI decided a specific workspace was requested
    if (result.actionTriggered && result.actionTriggered !== currentSection) {
      setTimeout(() => {
        setCurrentSection(result.actionTriggered as NavSection);
      }, 700);
    }
  };

  return (
    <div className="relative flex flex-col h-screen w-screen overflow-hidden bg-[#03050d] text-slate-100 font-sans select-none">
      {/* Global Futuristic Atmospheric Background with Light Pillars & Floor Grid */}
      <CyberBackground theme={orbTheme} />

      {/* Top Application Bar */}
      <TopBar
        onOpenSettings={() => setCurrentSection('settings')}
        onOpenTerminal={() => setCurrentSection('system')}
      />

      {/* Main Workspace: Left Sidebar + Active View */}
      <div className="relative z-10 flex flex-1 h-[calc(100vh-3.5rem)] overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar
          currentSection={currentSection}
          onSelectSection={(sec) => setCurrentSection(sec)}
          orbState={orbState}
        />

        {/* Dynamic Section View */}
        <main className="flex-1 h-full overflow-hidden relative">
          {currentSection === 'home' && (
            <HomeView
              metrics={metrics}
              tickers={tickers}
              orbState={orbState}
              onActivateVoice={handleToggleVoice}
              onNavigate={(sec) => setCurrentSection(sec)}
              onSendMessage={handleSendMessage}
              messages={messages}
              isThinking={isThinking}
              theme={orbTheme}
              onThemeChange={setOrbTheme}
              audioLevel={audioLevel}
            />
          )}

          {currentSection === 'voice' && (
            <VoiceConsoleView
              orbState={orbState}
              onActivateVoice={handleToggleVoice}
              onSendMessage={handleSendMessage}
              messages={messages}
              audioLevel={audioLevel}
              theme={orbTheme}
              onThemeChange={setOrbTheme}
            />
          )}

          {currentSection === 'cyber_tools' && <CyberToolsView />}
          {currentSection === 'research' && <ResearchEngineView />}
          {currentSection === 'scanner' && <SecurityScannerView />}
          {currentSection === 'trading' && <TradingHubView tickers={tickers} />}
          {currentSection === 'system' && <SystemControlView metrics={metrics} />}
          {currentSection === 'files' && <FilesManagerView />}
          {currentSection === 'appstore' && <AppStoreView />}
          {currentSection === 'settings' && <SettingsView />}
          {currentSection === 'history' && <HistoryView />}
          {currentSection === 'about' && <AboutView />}
        </main>
      </div>
    </div>
  );
}
