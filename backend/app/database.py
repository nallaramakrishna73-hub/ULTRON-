import sqlite3
import os
from pathlib import Path

DB_DIR = Path(__file__).resolve().parent.parent / "data"
DB_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH = DB_DIR / "ultron.db"

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.executescript("""
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

    CREATE TABLE IF NOT EXISTS paper_trades (
        id TEXT PRIMARY KEY,
        symbol TEXT NOT NULL,
        side TEXT NOT NULL,
        entry_price REAL NOT NULL,
        notes TEXT,
        created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_goals (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        completed INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
    );
    """)
    conn.commit()
    conn.close()
