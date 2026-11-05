export type OrbState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'executing';

export type NavSection =
  | 'home'
  | 'voice'
  | 'cyber_tools'
  | 'research'
  | 'scanner'
  | 'trading'
  | 'system'
  | 'files'
  | 'appstore'
  | 'settings'
  | 'history'
  | 'about';

export interface SystemMetrics {
  cpuUsage: number;
  ramUsage: number;
  diskUsage: number;
  networkDownload: number;
  networkUpload: number;
  latencyMs: number;
  uptime: string;
  osVersion: string;
  temperatureC: number;
  batteryPercent: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ultron';
  text: string;
  timestamp: string;
  actionTriggered?: string;
  commandProposal?: {
    command: string;
    description: string;
    requiresApproval: boolean;
    executed?: boolean;
    result?: string;
  };
}

export interface GoalItem {
  id: string;
  title: string;
  completed: boolean;
  category: string;
  deadline?: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  time: string;
  category: 'security' | 'research' | 'system' | 'voice' | 'trading';
  status: 'completed' | 'running' | 'alert' | 'pending';
}

export interface MarketTicker {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  sparkline: number[];
}

export interface CyberTool {
  id: string;
  name: string;
  category: 'Reconnaissance' | 'Vulnerability Analysis' | 'Network Analysis' | 'Exploitation' | 'Password Cracking';
  description: string;
  installed: boolean;
  version: string;
  status: 'ready' | 'running' | 'idle' | 'not_installed';
  defaultCommand: string;
  safeProfileOnly: boolean;
}

export interface VulnerabilityReport {
  id: string;
  target: string;
  timestamp: string;
  riskScore: number;
  status: 'clean' | 'low' | 'medium' | 'high' | 'critical';
  findings: {
    title: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    description: string;
    recommendation: string;
    cve?: string;
  }[];
  openPorts: number[];
}

export interface ResearchDossier {
  id: string;
  title: string;
  cveId?: string;
  severity: string;
  publishedDate: string;
  summary: string;
  technicalDetails: string;
  mitigation: string;
  tags: string[];
}

export interface MemoryEntry {
  id: string;
  topic: string;
  content: string;
  timestamp: string;
  importance: 'high' | 'medium' | 'low';
}
