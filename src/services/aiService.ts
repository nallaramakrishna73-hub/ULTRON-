import { ChatMessage, MemoryEntry } from '../types';
import { OrbTheme } from '../components/ThreeOrb';

export interface BrainActionResponse {
  text: string;
  actionTriggered?: string;
  themeChange?: OrbTheme;
  commandProposal?: ChatMessage['commandProposal'];
  appAction?: {
    action: 'launch' | 'kill';
    appName: string;
  };
  goalAction?: {
    action: 'add' | 'complete';
    title: string;
  };
}

export interface AIServiceConfig {
  provider: 'gemini' | 'ollama' | 'offline';
  ollamaEndpoint: string;
  ollamaModel: string;
  geminiModel: string;
}

const DEFAULT_CONFIG: AIServiceConfig = {
  provider: 'gemini',
  ollamaEndpoint: 'http://localhost:11434',
  ollamaModel: 'llama3.2:3b',
  geminiModel: 'gemini-3.8-flash',
};

class AIService {
  private config: AIServiceConfig = DEFAULT_CONFIG;
  private memories: MemoryEntry[] = [
    {
      id: 'mem-1',
      topic: 'Kali Linux Environment',
      content: 'Primary operating system is Kali Linux 2026.3 with XFCE desktop. Authorized lab network is 192.168.56.0/24.',
      timestamp: '2026-11-05 10:14',
      importance: 'high',
    },
    {
      id: 'mem-2',
      topic: 'Cybersecurity Goals',
      content: 'Targeting advanced OSCP certification, building ULTRON AI OS, and ISRO cybersecurity internship.',
      timestamp: '2026-11-06 14:20',
      importance: 'high',
    },
    {
      id: 'mem-3',
      topic: 'Trading Strategy',
      content: 'Focus on Smart Money Concepts (SMC): Liquidity sweeps, Fair Value Gaps (FVG), Break of Structure (BOS) on BTCUSDT and ETHUSDT.',
      timestamp: '2026-11-08 09:30',
      importance: 'medium',
    },
  ];

  constructor() {
    try {
      const saved = localStorage.getItem('ultron_ai_config');
      if (saved) {
        this.config = { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
      }
      const savedMem = localStorage.getItem('ultron_ai_memories');
      if (savedMem) {
        this.memories = JSON.parse(savedMem);
      }
    } catch {
      // fallback
    }
  }

  getConfig(): AIServiceConfig {
    return this.config;
  }

  setConfig(cfg: Partial<AIServiceConfig>) {
    this.config = { ...this.config, ...cfg };
    try {
      localStorage.setItem('ultron_ai_config', JSON.stringify(this.config));
    } catch {}
  }

  getMemories(): MemoryEntry[] {
    return this.memories;
  }

  addMemory(topic: string, content: string, importance: 'high' | 'medium' | 'low' = 'medium') {
    const entry: MemoryEntry = {
      id: 'mem-' + Date.now(),
      topic,
      content,
      timestamp: new Date().toLocaleString(),
      importance,
    };
    this.memories.unshift(entry);
    this.saveMemories();
    return entry;
  }

  deleteMemory(id: string) {
    this.memories = this.memories.filter((m) => m.id !== id);
    this.saveMemories();
  }

  clearMemories() {
    this.memories = [];
    this.saveMemories();
  }

  private saveMemories() {
    try {
      localStorage.setItem('ultron_ai_memories', JSON.stringify(this.memories));
    } catch {}
  }

  async processQuery(
    prompt: string,
    context?: { currentSection?: string; orbTheme?: OrbTheme },
    onStatusUpdate?: (status: 'thinking' | 'speaking' | 'executing') => void
  ): Promise<BrainActionResponse> {
    onStatusUpdate?.('thinking');

    // 1. Try Server-Side Gemini AI Brain Endpoint first
    if (this.config.provider === 'gemini') {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 9000);

        const res = await fetch('/api/ultron/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            currentSection: context?.currentSection || 'home',
            orbTheme: context?.orbTheme || 'gold',
          }),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (res.ok) {
          const data = await res.json();
          if (data && data.text && !data.fallback) {
            if (data.commandProposal || data.appAction) {
              onStatusUpdate?.('executing');
            } else {
              onStatusUpdate?.('speaking');
            }

            return {
              text: data.text,
              actionTriggered: data.actionTriggered || undefined,
              themeChange: data.themeChange || undefined,
              commandProposal: data.commandProposal || undefined,
              appAction: data.appAction || undefined,
              goalAction: data.goalAction || undefined,
            };
          }
        }
      } catch (e) {
        console.warn('[AI Service] Server endpoint call bypassed, activating local heuristics:', e);
      }
    }

    // 2. Try Ollama local endpoint if provider is set to Ollama
    if (this.config.provider === 'ollama') {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        const response = await fetch(`${this.config.ollamaEndpoint}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: this.config.ollamaModel,
            prompt: `You are ULTRON, a sophisticated AI operating system assistant for Kali Linux. Direct, technical, precise. User query: ${prompt}`,
            stream: false,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          onStatusUpdate?.('speaking');
          return { text: data.response || "Command processed." };
        }
      } catch {
        // Fall back gracefully to local autonomous brain
      }
    }

    // 3. Autonomous Heuristics AI Brain Engine (Local Total System Control)
    const lower = prompt.toLowerCase().trim();

    // Theme changes
    if (lower.includes('red') || lower.includes('combat') || lower.includes('crimson')) {
      onStatusUpdate?.('executing');
      return {
        text: "ULTRON Neural Matrix switching to Crimson Combat Protocol. Visual feedback initialized.",
        themeChange: 'red',
        actionTriggered: 'home',
      };
    }

    if (lower.includes('gold') || lower.includes('stark') || lower.includes('amber') || lower.includes('jarvis')) {
      onStatusUpdate?.('executing');
      return {
        text: "Switching holographic interface to Golden Amber Neural Matrix mode.",
        themeChange: 'gold',
        actionTriggered: 'home',
      };
    }

    if (lower.includes('cyan') || lower.includes('neon') || lower.includes('purple')) {
      onStatusUpdate?.('executing');
      return {
        text: "Switching holographic interface to Kali Cyber Neon mode.",
        themeChange: 'neon',
        actionTriggered: 'home',
      };
    }

    // Security Scan
    if (lower.includes('scan') && (lower.includes('security') || lower.includes('vulnerabilit') || lower.includes('system') || lower.includes('audit'))) {
      onStatusUpdate?.('executing');
      return {
        text: "Initiating Kali Linux local security posture audit. Checking open listening sockets, systemd services, UFW firewall status, and shadow permissions.",
        actionTriggered: 'scanner',
        commandProposal: {
          command: 'sudo lynis audit system --quick && ss -tulnp',
          description: 'Run non-destructive local system security baseline audit and open socket inspection.',
          requiresApproval: true,
        },
      };
    }

    // Penetration Testing & Nmap
    if (lower.includes('pentest') || lower.includes('nmap') || lower.includes('port scan') || lower.includes('recon')) {
      onStatusUpdate?.('executing');
      return {
        text: "Launching Cybersecurity Command Center. Target scope configuration and authorized lab workflow loaded.",
        actionTriggered: 'cyber_tools',
        commandProposal: {
          command: 'nmap -sS -sV -T4 -Pn 192.168.56.101',
          description: 'SYN Stealth Scan with service version detection on authorized lab target.',
          requiresApproval: true,
        },
      };
    }

    // Trading
    if (lower.includes('trading') || lower.includes('btc') || lower.includes('eth') || lower.includes('market') || lower.includes('crypto')) {
      return {
        text: "Accessing Trading Hub. BTCUSDT holding $108,320 (+1.21%) and ETHUSDT at $3,850. 4H Liquidity pool active above $109,200 with an unmitigated Bullish FVG at $106,800.",
        actionTriggered: 'trading',
      };
    }

    // Terminal
    if (lower.includes('terminal') || lower.includes('bash') || lower.includes('shell') || lower.includes('command line')) {
      onStatusUpdate?.('executing');
      return {
        text: "Opening permission-controlled terminal. You can preview, explain, and authorize commands before execution.",
        actionTriggered: 'system',
        commandProposal: {
          command: 'uname -a && uname -r && whoami',
          description: 'Inspect Kali kernel release and current user context.',
          requiresApproval: false,
        },
      };
    }

    // Application Launchers
    if (lower.includes('firefox')) {
      onStatusUpdate?.('executing');
      return {
        text: "Launching Firefox ESR browser session on Kali Linux XFCE desktop.",
        actionTriggered: 'system',
        appAction: { action: 'launch', appName: 'Firefox ESR (Browser)' },
        commandProposal: {
          command: 'firefox-esr & disown',
          description: 'Launch Firefox browser in background process.',
          requiresApproval: false,
        },
      };
    }

    if (lower.includes('wireshark')) {
      onStatusUpdate?.('executing');
      return {
        text: "Launching Wireshark network protocol analyzer with packet capture interfaces.",
        actionTriggered: 'system',
        appAction: { action: 'launch', appName: 'Wireshark Network Analyzer' },
        commandProposal: {
          command: 'wireshark & disown',
          description: 'Launch Wireshark GUI.',
          requiresApproval: false,
        },
      };
    }

    if (lower.includes('burp')) {
      onStatusUpdate?.('executing');
      return {
        text: "Launching Burp Suite Community edition proxy.",
        actionTriggered: 'system',
        appAction: { action: 'launch', appName: 'Burp Suite Community' },
      };
    }

    // Files Manager
    if (lower.includes('open') && (lower.includes('folder') || lower.includes('files') || lower.includes('project'))) {
      onStatusUpdate?.('executing');
      return {
        text: "Accessing Kali Files Manager at /home/kali/projects.",
        actionTriggered: 'files',
      };
    }

    // CVE Research
    if (lower.includes('research') || lower.includes('cve') || lower.includes('vulnerability') || lower.includes('exploit')) {
      return {
        text: "Opening Cybersecurity Research Engine. Accessing CVE threat intelligence dossiers.",
        actionTriggered: 'research',
      };
    }

    // Goal Management
    if (lower.includes('goal') || lower.includes('target') || lower.includes('objective')) {
      if (lower.includes('add')) {
        const titleMatch = prompt.replace(/add goal/i, '').replace(/add/i, '').trim();
        const goalTitle = titleMatch || 'Master Advanced Exploit Development';
        return {
          text: `Added new objective: "${goalTitle}" to your goals checklist.`,
          actionTriggered: 'home',
          goalAction: { action: 'add', title: goalTitle },
        };
      }
      return {
        text: "Displaying your active goals and progress.",
        actionTriggered: 'home',
      };
    }

    // App Store
    if (lower.includes('app store') || lower.includes('packages') || lower.includes('software')) {
      return {
        text: "Opening Kali App Store & Package Repository.",
        actionTriggered: 'appstore',
      };
    }

    // History
    if (lower.includes('history') || lower.includes('activity') || lower.includes('logs')) {
      return {
        text: "Opening System Audit History.",
        actionTriggered: 'history',
      };
    }

    // Voice Console
    if (lower.includes('voice console') || lower.includes('talk mode') || lower.includes('listen')) {
      return {
        text: "Switching to full-screen Voice Console.",
        actionTriggered: 'voice',
      };
    }

    // Default Intelligence response
    await new Promise((r) => setTimeout(r, 450));
    onStatusUpdate?.('speaking');

    return {
      text: `ULTRON AI Brain: Standing by. I can execute Kali Linux terminal commands, audit open ports, switch holographic orb modes, launch desktop applications, or research CVEs. How may I assist your mission?`,
    };
  }
}

export const aiService = new AIService();
