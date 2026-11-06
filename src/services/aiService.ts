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
  engine?: string;
}

export interface AIServiceConfig {
  provider: 'ollama' | 'gemini' | 'offline';
  ollamaEndpoint: string;
  ollamaModel: string;
  geminiModel: string;
}

const DEFAULT_CONFIG: AIServiceConfig = {
  provider: 'ollama',
  ollamaEndpoint: 'http://localhost:11434',
  ollamaModel: 'qwen2.5-coder:7b',
  geminiModel: 'gemini-3.8-flash',
};

class AIService {
  private config: AIServiceConfig = DEFAULT_CONFIG;
  private memories: MemoryEntry[] = [];

  constructor() {
    try {
      const saved = localStorage.getItem('ultron_ai_config');
      if (saved) {
        this.config = { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
      }
    } catch {}

    this.refreshMemories();
  }

  async refreshMemories(): Promise<MemoryEntry[]> {
    try {
      const res = await fetch('/api/database/memories');
      if (res.ok) {
        const rows = await res.json();
        this.memories = rows.map((r: any) => ({
          id: r.id,
          topic: r.topic,
          content: r.content,
          timestamp: r.created_at,
          importance: r.importance,
        }));
        return this.memories;
      }
    } catch {}
    return this.memories;
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

  async addMemory(topic: string, content: string, importance: 'high' | 'medium' | 'low' = 'medium') {
    try {
      const res = await fetch('/api/database/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, content, importance }),
      });
      if (res.ok) {
        const entry = await res.json();
        const formatted: MemoryEntry = {
          id: entry.id,
          topic: entry.topic,
          content: entry.content,
          timestamp: new Date().toISOString(),
          importance: entry.importance,
        };
        this.memories.unshift(formatted);
        return formatted;
      }
    } catch {}

    const entry: MemoryEntry = {
      id: 'mem-' + Date.now(),
      topic,
      content,
      timestamp: new Date().toISOString(),
      importance,
    };
    this.memories.unshift(entry);
    return entry;
  }

  async deleteMemory(id: string) {
    try {
      await fetch(`/api/database/memories/${id}`, { method: 'DELETE' });
    } catch {}
    this.memories = this.memories.filter((m) => m.id !== id);
  }

  clearMemories() {
    this.memories = [];
  }

  async processQuery(
    prompt: string,
    context?: { currentSection?: string; orbTheme?: OrbTheme },
    onStatusUpdate?: (status: 'thinking' | 'speaking' | 'executing') => void
  ): Promise<BrainActionResponse> {
    onStatusUpdate?.('thinking');

    // 1. Send query to central ULTRON AI Brain endpoint (which tries Ollama first)
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);

      const res = await fetch('/api/ultron/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          currentSection: context?.currentSection || 'home',
          orbTheme: context?.orbTheme || 'gold',
          forceProvider: this.config.provider === 'gemini' ? 'gemini' : undefined,
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
            engine: data.engine,
          };
        }
      }
    } catch {
      // Smooth fallback to local heuristic core
    }

    // 2. Autonomous Local Heuristics Fallback Core
    const lower = prompt.toLowerCase().trim();

    if (lower.includes('red') || lower.includes('combat') || lower.includes('crimson')) {
      onStatusUpdate?.('executing');
      return {
        text: "ULTRON Neural Matrix switching to Crimson Combat Protocol. Visual feedback initialized.",
        themeChange: 'red',
        actionTriggered: 'home',
      };
    }

    if (lower.includes('gold') || lower.includes('amber') || lower.includes('jarvis')) {
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

    if (lower.includes('scan') && (lower.includes('security') || lower.includes('vulnerabilit') || lower.includes('system') || lower.includes('audit'))) {
      onStatusUpdate?.('executing');
      return {
        text: "Initiating Kali Linux local security posture audit. Checking open listening sockets, systemd services, UFW firewall status, and shadow permissions.",
        actionTriggered: 'scanner',
        commandProposal: {
          command: 'ss -tuln && ufw status',
          description: 'Run non-destructive local system security baseline audit and open socket inspection.',
          requiresApproval: true,
        },
      };
    }

    if (lower.includes('pentest') || lower.includes('nmap') || lower.includes('port scan') || lower.includes('recon')) {
      onStatusUpdate?.('executing');
      return {
        text: "Launching Cybersecurity Arsenal. Target scope configuration and authorized lab workflow loaded.",
        actionTriggered: 'cyber_tools',
        commandProposal: {
          command: 'nmap -sV -sC -Pn -T4 127.0.0.1',
          description: 'Scan local ports and inspect active service banners.',
          requiresApproval: true,
        },
      };
    }

    if (lower.includes('trading') || lower.includes('btc') || lower.includes('eth') || lower.includes('market') || lower.includes('crypto')) {
      return {
        text: "Accessing Trading Hub. Live Binance feeds loaded for BTCUSDT, ETHUSDT, and Gold. Liquidity pools and Fair Value Gaps marked.",
        actionTriggered: 'trading',
      };
    }

    if (lower.includes('terminal') || lower.includes('bash') || lower.includes('shell')) {
      onStatusUpdate?.('executing');
      return {
        text: "Opening controlled terminal execution console. Security guard active.",
        actionTriggered: 'system',
        commandProposal: {
          command: 'uname -a && whoami',
          description: 'Inspect Kali kernel release and current user context.',
          requiresApproval: false,
        },
      };
    }

    if (lower.includes('firefox')) {
      onStatusUpdate?.('executing');
      return {
        text: "Launching Firefox browser session on Kali Linux.",
        actionTriggered: 'system',
        appAction: { action: 'launch', appName: 'Firefox Browser' },
        commandProposal: {
          command: 'firefox & disown',
          description: 'Launch Firefox browser in background process.',
          requiresApproval: false,
        },
      };
    }

    if (lower.includes('wireshark')) {
      onStatusUpdate?.('executing');
      return {
        text: "Launching Wireshark network protocol analyzer.",
        actionTriggered: 'system',
        appAction: { action: 'launch', appName: 'Wireshark' },
      };
    }

    if (lower.includes('open') && (lower.includes('folder') || lower.includes('files') || lower.includes('project'))) {
      onStatusUpdate?.('executing');
      return {
        text: "Accessing Files Manager.",
        actionTriggered: 'files',
      };
    }

    if (lower.includes('research') || lower.includes('cve') || lower.includes('vulnerability')) {
      return {
        text: "Opening Cybersecurity Research Engine. Accessing CVE threat intelligence dossiers.",
        actionTriggered: 'research',
      };
    }

    await new Promise((r) => setTimeout(r, 400));
    onStatusUpdate?.('speaking');

    return {
      text: `ULTRON Autonomous Core: Online and listening. Local Ollama inference and safe terminal execution are ready. What command would you like executed?`,
      engine: 'Local Core',
    };
  }
}

export const aiService = new AIService();
