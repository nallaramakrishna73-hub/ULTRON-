import { SystemMetrics, MarketTicker, CyberTool } from '../types';

export const INITIAL_METRICS: SystemMetrics = {
  cpuUsage: 18,
  ramUsage: 43,
  diskUsage: 62,
  networkDownload: 12.4,
  networkUpload: 8.7,
  latencyMs: 12,
  uptime: '5h 24m',
  osVersion: 'Kali Linux 2026.3 (Rolling Release)',
  temperatureC: 48,
  batteryPercent: 85,
};

export const INITIAL_TICKERS: MarketTicker[] = [
  {
    symbol: 'BTCUSDT',
    name: 'Bitcoin',
    price: 108320.45,
    change24h: 1.21,
    sparkline: [106400, 107100, 106800, 107500, 107900, 108100, 108320],
  },
  {
    symbol: 'ETHUSDT',
    name: 'Ethereum',
    price: 3850.12,
    change24h: 0.87,
    sparkline: [3780, 3810, 3795, 3820, 3835, 3842, 3850],
  },
  {
    symbol: 'XAUUSD',
    name: 'Gold Spot',
    price: 2742.8,
    change24h: 0.45,
    sparkline: [2725, 2730, 2732, 2738, 2740, 2741, 2742],
  },
];

export const KALI_CYBER_TOOLS: CyberTool[] = [
  {
    id: 'nmap',
    name: 'Nmap Network Scanner',
    category: 'Reconnaissance',
    description: 'Network exploration tool and security / port scanner. Supports stealth SYN scans, OS detection, and NSE scripts.',
    installed: true,
    version: '7.94-kali',
    status: 'ready',
    defaultCommand: 'nmap -sV -sC -Pn -T4 127.0.0.1',
    safeProfileOnly: true,
  },
  {
    id: 'wireshark',
    name: 'Wireshark & TShark',
    category: 'Network Analysis',
    description: 'World premier network protocol packet analyzer for deep inspection of hundreds of network protocols.',
    installed: true,
    version: '4.2.2',
    status: 'ready',
    defaultCommand: 'tshark -i lo -c 20',
    safeProfileOnly: true,
  },
  {
    id: 'burpsuite',
    name: 'Burp Suite Community',
    category: 'Vulnerability Analysis',
    description: 'Web vulnerability scanner, intercepting proxy, repeater, and sequencer for testing web applications.',
    installed: true,
    version: '2024.1.2',
    status: 'ready',
    defaultCommand: 'burpsuite & disown',
    safeProfileOnly: true,
  },
  {
    id: 'gobuster',
    name: 'Gobuster Directory Buster',
    category: 'Reconnaissance',
    description: 'High-speed URI, DNS subdomain, and vhost brute-forcing tool written in Go.',
    installed: true,
    version: 'v3.6.0',
    status: 'ready',
    defaultCommand: 'gobuster dir -u http://127.0.0.1:3000 -w /usr/share/wordlists/dirb/common.txt -q',
    safeProfileOnly: true,
  },
  {
    id: 'nikto',
    name: 'Nikto Web Server Scanner',
    category: 'Vulnerability Analysis',
    description: 'Web server scanner that tests for dangerous files, outdated server software, and configuration issues.',
    installed: true,
    version: '2.5.0',
    status: 'ready',
    defaultCommand: 'nikto -h http://127.0.0.1:3000 -Tuning 1,2,3',
    safeProfileOnly: true,
  },
  {
    id: 'whatweb',
    name: 'WhatWeb Identifier',
    category: 'Reconnaissance',
    description: 'Next generation web scanner recognizing technologies including content management systems (CMS) and JS libraries.',
    installed: true,
    version: '0.5.5',
    status: 'ready',
    defaultCommand: 'whatweb -v http://127.0.0.1:3000',
    safeProfileOnly: true,
  },
  {
    id: 'john',
    name: 'John the Ripper',
    category: 'Password Cracking',
    description: 'Fast password cracker for testing password strength against authorized security audit standards.',
    installed: true,
    version: '1.9.0-jumbo-1',
    status: 'ready',
    defaultCommand: 'john --test=2',
    safeProfileOnly: true,
  },
  {
    id: 'hydra',
    name: 'THC Hydra',
    category: 'Password Cracking',
    description: 'Parallelized network login cracker supporting numerous protocols (SSH, FTP, HTTP) for credential resilience audits.',
    installed: true,
    version: 'v9.5',
    status: 'ready',
    defaultCommand: 'hydra -h',
    safeProfileOnly: true,
  },
];

class SystemService {
  private metrics: SystemMetrics = { ...INITIAL_METRICS };
  private tickers: MarketTicker[] = [...INITIAL_TICKERS];
  private cyberTools: CyberTool[] = [...KALI_CYBER_TOOLS];
  private commandAuditLog: { command: string; timestamp: string; status: 'success' | 'denied' | 'error'; output: string }[] = [];

  constructor() {
    this.pollRealSystemMetrics();
    this.pollRealTickers();
    this.fetchRealCyberTools();
  }

  // Poll real system telemetry from backend (/proc/stat, /proc/meminfo, etc.)
  private async pollRealSystemMetrics() {
    const fetchMetrics = async () => {
      try {
        const res = await fetch('/api/system/metrics');
        if (res.ok) {
          const data = await res.json();
          this.metrics = {
            ...this.metrics,
            ...data,
          };
        }
      } catch {}
    };

    fetchMetrics();
    setInterval(fetchMetrics, 3000);
  }

  // Poll real live crypto tickers from backend Binance/CoinGecko stream
  private async pollRealTickers() {
    const fetchTickers = async () => {
      try {
        const res = await fetch('/api/trading/tickers');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            this.tickers = data.map((t: any) => ({
              symbol: t.symbol,
              name: t.name,
              price: t.price,
              change24h: t.change24h,
              sparkline: [
                t.price * 0.985,
                t.price * 0.99,
                t.price * 0.995,
                t.price * 1.002,
                t.price * 0.998,
                t.price * 1.005,
                t.price,
              ],
            }));
          }
        }
      } catch {}
    };

    fetchTickers();
    setInterval(fetchTickers, 6000);
  }

  // Detect installed Kali tools via backend
  private async fetchRealCyberTools() {
    try {
      const res = await fetch('/api/cyber/tools');
      if (res.ok) {
        const tools = await res.json();
        if (Array.isArray(tools) && tools.length > 0) {
          this.cyberTools = tools.map((t: any) => ({
            id: t.id,
            name: t.name,
            category: (t.category === 'recon' ? 'Reconnaissance' : t.category === 'passwords' ? 'Password Cracking' : 'Vulnerability Analysis') as any,
            description: t.description,
            installed: t.installed,
            version: t.version,
            status: (t.installed ? 'ready' : 'not_installed') as 'ready' | 'not_installed',
            defaultCommand: `${t.binary} --help`,
            safeProfileOnly: true,
          }));
        }
      }
    } catch {}
  }

  getMetrics(): SystemMetrics {
    return { ...this.metrics };
  }

  getTickers(): MarketTicker[] {
    return [...this.tickers];
  }

  getCyberTools(): CyberTool[] {
    return [...this.cyberTools];
  }

  async executeControlledCommand(
    command: string,
    isApproved: boolean = true
  ): Promise<{ success: boolean; output: string; exitCode: number }> {
    const trimmed = command.trim();

    try {
      const res = await fetch('/api/terminal/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: trimmed, authorized: isApproved }),
      });

      if (res.ok) {
        const data = await res.json();
        const output = data.stdout || data.stderr || (data.success ? '[Command completed with 0 errors]' : '[Command failed]');
        this.commandAuditLog.unshift({
          command: trimmed,
          timestamp: new Date().toLocaleTimeString(),
          status: data.blocked ? 'denied' : data.success ? 'success' : 'error',
          output,
        });

        return {
          success: data.success,
          output,
          exitCode: data.exitCode ?? (data.success ? 0 : 1),
        };
      }
    } catch (e: any) {
      console.warn('Backend terminal execution failed, falling back:', e);
    }

    const deniedMsg = 'Execution error: Could not reach ULTRON Terminal Engine.';
    this.commandAuditLog.unshift({ command: trimmed, timestamp: new Date().toLocaleTimeString(), status: 'error', output: deniedMsg });
    return { success: false, output: deniedMsg, exitCode: 1 };
  }

  getAuditLog() {
    return this.commandAuditLog;
  }
}

export const systemService = new SystemService();
