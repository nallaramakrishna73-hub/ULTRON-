import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';

const DB_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = path.join(DB_DIR, 'ultron.db');
export const db = new DatabaseSync(DB_PATH);

// Initialize Tables
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS memories (
      id TEXT PRIMARY KEY,
      topic TEXT NOT NULL,
      content TEXT NOT NULL,
      importance TEXT DEFAULT 'medium',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      role TEXT NOT NULL,
      text TEXT NOT NULL,
      action_triggered TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS command_audit (
      id TEXT PRIMARY KEY,
      command TEXT NOT NULL,
      exit_code INTEGER NOT NULL,
      stdout TEXT,
      stderr TEXT,
      status TEXT NOT NULL,
      execution_time_ms INTEGER,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS security_scans (
      id TEXT PRIMARY KEY,
      target TEXT NOT NULL,
      score INTEGER NOT NULL,
      findings_json TEXT NOT NULL,
      open_ports_json TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS research_dossiers (
      id TEXT PRIMARY KEY,
      cve_id TEXT,
      title TEXT NOT NULL,
      severity TEXT NOT NULL,
      summary TEXT NOT NULL,
      technical_details TEXT NOT NULL,
      mitigation TEXT NOT NULL,
      tags_json TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS paper_trades (
      id TEXT PRIMARY KEY,
      symbol TEXT NOT NULL,
      side TEXT NOT NULL,
      entry_price REAL NOT NULL,
      exit_price REAL,
      pnl REAL,
      notes TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_goals (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      deadline TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Seed default goals if empty
  const countRow = db.prepare('SELECT COUNT(*) as count FROM user_goals').get() as { count: number };
  if (countRow.count === 0) {
    const insertGoal = db.prepare('INSERT INTO user_goals (id, title, category, completed, created_at) VALUES (?, ?, ?, ?, ?)');
    insertGoal.run('g-1', 'Learn Advanced Cybersecurity & Kali Tooling', 'cyber', 1, new Date().toISOString());
    insertGoal.run('g-2', 'Build ULTRON AI Operating Environment', 'dev', 1, new Date().toISOString());
    insertGoal.run('g-3', 'Master Smart Money Concepts (SMC) & Paper Trading', 'trading', 0, new Date().toISOString());
    insertGoal.run('g-4', 'Secure Kali Linux Baseline & Pass Lynis Hardening', 'security', 0, new Date().toISOString());
  }

  // Seed default memories if empty
  const memCount = db.prepare('SELECT COUNT(*) as count FROM memories').get() as { count: number };
  if (memCount.count === 0) {
    const insertMem = db.prepare('INSERT INTO memories (id, topic, content, importance, created_at) VALUES (?, ?, ?, ?, ?)');
    insertMem.run('m-1', 'Operating Environment', 'Target host is Kali Linux with XFCE desktop environment and local Ollama inference.', 'high', new Date().toISOString());
    insertMem.run('m-2', 'Authorized Scope', 'Authorized penetration testing target lab subnet is 192.168.56.0/24.', 'high', new Date().toISOString());
    insertMem.run('m-3', 'Voice Configuration', 'Default voice configured with ElevenLabs neural voice ID 1SM7GgM6IMuvQlz2BwM3 and Piper offline fallback.', 'medium', new Date().toISOString());
  }
}
