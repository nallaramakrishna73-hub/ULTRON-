import { exec } from 'child_process';
import { db } from './database';
import { randomUUID } from 'crypto';

const BLOCKED_PATTERNS = [
  /rm\s+(-[a-zA-Z]*r[a-zA-Z]*f|--no-preserve-root)\s+\//i,
  /mkfs(\.[a-z0-9]+)?\s+/i,
  /dd\s+if=.*of=\/dev\/(sd[a-z]|nvme|vd[a-z])/i,
  /:(){ :|:& };:/,
  />\s*\/dev\/(sd[a-z]|nvme|vd[a-z])/i,
  /chmod\s+-R\s+777\s+\//i,
];

export async function executeRealCommand(command: string, authorized: boolean = true): Promise<{
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
  blocked?: boolean;
}> {
  const trimmed = command.trim();

  // 1. Safety Guard Check
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(trimmed)) {
      const errorMsg = 'SECURITY INTERCEPT: Command blocked by ULTRON Safety Guard. Destructive filesystem operations are prohibited.';
      logAudit(trimmed, 126, '', errorMsg, 'blocked', 0);
      return {
        success: false,
        stdout: '',
        stderr: errorMsg,
        exitCode: 126,
        blocked: true,
      };
    }
  }

  // 2. Authorization Verification
  if (!authorized) {
    const errorMsg = 'Execution aborted: User approval required for this command.';
    logAudit(trimmed, 1, '', errorMsg, 'denied', 0);
    return {
      success: false,
      stdout: '',
      stderr: errorMsg,
      exitCode: 1,
    };
  }

  // 3. Execution via safe child process with timeout
  const startTime = Date.now();
  return new Promise((resolve) => {
    exec(trimmed, { timeout: 25000, maxBuffer: 1024 * 1024 * 2 }, (error, stdout, stderr) => {
      const durationMs = Date.now() - startTime;
      const exitCode = error ? (error.code ?? 1) : 0;
      const isSuccess = exitCode === 0;

      logAudit(trimmed, exitCode, stdout, stderr, isSuccess ? 'success' : 'error', durationMs);

      resolve({
        success: isSuccess,
        stdout: stdout || (isSuccess ? '[Process completed with 0 errors]' : ''),
        stderr: stderr || (error ? error.message : ''),
        exitCode,
      });
    });
  });
}

function logAudit(command: string, exitCode: number, stdout: string, stderr: string, status: string, durationMs: number) {
  try {
    const insert = db.prepare(`
      INSERT INTO command_audit (id, command, exit_code, stdout, stderr, status, execution_time_ms, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insert.run(randomUUID(), command, exitCode, stdout.slice(0, 10000), stderr.slice(0, 5000), status, durationMs, new Date().toISOString());
  } catch (e) {
    console.error('Audit logging failed:', e);
  }
}
