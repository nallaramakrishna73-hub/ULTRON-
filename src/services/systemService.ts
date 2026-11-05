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
    defaultCommand: 'nmap -sV -sC -Pn -T4 192.168.56.101',
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
    defaultCommand: 'tshark -i eth0 -c 100 -f "tcp port 80 or tcp port 443"',
    safeProfileOnly: true,
  },
  {
    id: 'metasploit',
    name: 'Metasploit Framework',
    category: 'Exploitation',
    description: 'Penetration testing platform for vulnerability verification and security assessment research in authorized labs.',
    installed: true,
    version: 'v6.3.55',
    status: 'ready',
    defaultCommand: 'msfconsole -q -x "db_status; version"',
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
    defaultCommand: 'gobuster dir -u http://192.168.56.101 -w /usr/share/wordlists/dirb/common.txt -q',
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
    defaultCommand: 'nikto -h http://192.168.56.101 -Tuning 1,2,3',
    safeProfileOnly: true,
  },
  {
    id: 'whatweb',
    name: 'WhatWeb Identifier',
    category: 'Reconnaissance',
    description: 'Next generation web scanner recognizing technologies including content management systems (CMS), blogging platforms, and JS libraries.',
    installed: true,
    version: '0.5.5',
    status: 'ready',
    defaultCommand: 'whatweb -v http://192.168.56.101',
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
  private commandAuditLog: { command: string; timestamp: string; status: 'success' | 'denied' | 'error'; output: string }[] = [];

  constructor() {
    // Start slight realistic telemetry fluctuations
    setInterval(() => {
      this.metrics.cpuUsage = Math.max(10, Math.min(85, Math.round(this.metrics.cpuUsage + (Math.random() - 0.48) * 4)));
      this.metrics.ramUsage = Math.max(38, Math.min(75, Math.round(this.metrics.ramUsage + (Math.random() - 0.49) * 2)));
      this.metrics.networkDownload = Number((12.4 + (Math.random() - 0.5) * 3.5).toFixed(1));
      this.metrics.networkUpload = Number((8.7 + (Math.random() - 0.5) * 2.2).toFixed(1));
      this.metrics.latencyMs = Math.round(11 + Math.random() * 4);

      // Fluctuate crypto slightly
      this.tickers[0].price = Number((this.tickers[0].price + (Math.random() - 0.48) * 25).toFixed(2));
      this.tickers[1].price = Number((this.tickers[1].price + (Math.random() - 0.48) * 1.5).toFixed(2));
    }, 2500);
  }

  getMetrics(): SystemMetrics {
    return { ...this.metrics };
  }

  getTickers(): MarketTicker[] {
    return [...this.tickers];
  }

  getCyberTools(): CyberTool[] {
    return [...KALI_CYBER_TOOLS];
  }

  async executeControlledCommand(
    command: string,
    isApproved: boolean = true
  ): Promise<{ success: boolean; output: string; exitCode: number }> {
    const trimmed = command.trim();

    // Dangerous command blocking (Safety Hardening)
    const dangerousPatterns = [/rm\s+-rf\s+\//i, /mkfs/i, /dd\s+if=/i, />\s*\/dev\/sd/i, /:(){ :|:& };:/];
    for (const pattern of dangerousPatterns) {
      if (pattern.test(trimmed)) {
        const errorMsg = 'SECURITY VIOLATION: Command blocked by ULTRON Permission Guard. Potential destructive system damage detected.';
        this.commandAuditLog.unshift({ command: trimmed, timestamp: new Date().toLocaleTimeString(), status: 'denied', output: errorMsg });
        return { success: false, output: errorMsg, exitCode: 126 };
      }
    }

    if (!isApproved) {
      const deniedMsg = 'Execution aborted: User approval required for elevated operation.';
      this.commandAuditLog.unshift({ command: trimmed, timestamp: new Date().toLocaleTimeString(), status: 'denied', output: deniedMsg });
      return { success: false, output: deniedMsg, exitCode: 1 };
    }

    await new Promise((r) => setTimeout(r, 600));

    let output = '';
    if (trimmed.startsWith('nmap')) {
      output = `Starting Nmap 7.94 ( https://nmap.org ) at 2026-11-05 21:48 EST
Nmap scan report for 192.168.56.101
Host is up (0.00042s latency).
Not shown: 994 closed tcp ports (reset)
PORT     STATE SERVICE     VERSION
22/tcp   open  ssh         OpenSSH 9.6p1 Debian 4 (protocol 2.0)
80/tcp   open  http        nginx 1.24.0
443/tcp  open  ssl/http    nginx 1.24.0
3306/tcp open  mysql       MySQL 8.0.36
8080/tcp open  http-proxy  Node.js Express framework
MAC Address: 08:00:27:B4:9C:12 (Oracle VirtualBox virtual NIC)

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 3.12 seconds`;
    } else if (trimmed.startsWith('tshark')) {
      output = `Running as user "root" and group "root". This could be dangerous.
Capturing on 'eth0'
    1 0.000000000 192.168.56.1 -> 192.168.56.101 TCP 74 54312 → 443 [SYN] Seq=0 Win=64240 Len=0 MSS=1460 SACK_PERM TSval=3891409228 TSecr=0
    2 0.000213100 192.168.56.101 -> 192.168.56.1 TCP 74 443 → 54312 [SYN, ACK] Seq=0 Ack=1 Win=65160 Len=0 MSS=1460 SACK_PERM
    3 0.000305400 192.168.56.1 -> 192.168.56.101 TCP 66 54312 → 443 [ACK] Seq=1 Ack=1 Win=64240 Len=0
    4 0.000950200 192.168.56.1 -> 192.168.56.101 TLSv1.3 583 Client Hello
Packets captured: 100 packets | 0 dropped | Protocol distribution: TLSv1.3 (72%), DNS (18%), TCP (10%)`;
    } else if (trimmed.includes('ss -tulnp') || trimmed.includes('netstat')) {
      output = `Netid State  Recv-Q Send-Q  Local Address:Port   Peer Address:Port Process
tcp   LISTEN 0      128          0.0.0.0:22            0.0.0.0:*     users:(("sshd",pid=712,fd=3))
tcp   LISTEN 0      511          0.0.0.0:80            0.0.0.0:*     users:(("nginx",pid=842,fd=6))
tcp   LISTEN 0      128        127.0.0.1:11434         0.0.0.0:*     users:(("ollama",pid=1120,fd=7))
tcp   LISTEN 0      128        127.0.0.1:3000          0.0.0.0:*     users:(("node",pid=1540,fd=19))`;
    } else if (trimmed.includes('uname')) {
      output = `Linux kali-xfce-desktop 6.10.11-kali1-amd64 #1 SMP PREEMPT_DYNAMIC Kali 6.10.11-1kali1 (2026-10-18) x86_64 GNU/Linux\nkrishna`;
    } else if (trimmed.includes('lynis') || trimmed.includes('audit')) {
      output = `[+] Initializing Lynis 3.1.1 Enterprise Audit
[+] Operating System: Kali GNU/Linux 2026.3
[+] Kernel version: 6.10.11-kali1-amd64
[+] Hardening Index: 78 / 100
[+] Discovered open ports: 22, 80, 443, 11434
[+] Warnings found: 2 (UFW inactive, Core dumps enabled)
[+] Suggestions found: 14 (Enable SELinux/AppArmor profiles, install fail2ban)`;
    } else {
      output = `[ULTRON Execution Service] Command completed successfully.\n$ ${trimmed}\n[Process completed with exit status 0]`;
    }

    this.commandAuditLog.unshift({ command: trimmed, timestamp: new Date().toLocaleTimeString(), status: 'success', output });
    return { success: true, output, exitCode: 0 };
  }

  getAuditLog() {
    return this.commandAuditLog;
  }
}

export const systemService = new SystemService();
