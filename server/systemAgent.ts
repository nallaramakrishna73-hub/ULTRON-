import os from 'os';
import path from 'path';
import fs from 'fs';
import { exec, spawn } from 'child_process';
import util from 'util';
import { db } from './database';
import { randomUUID } from 'crypto';

const execAsync = util.promisify(exec);

export type PermissionLevel = 'safe' | 'confirmation_required' | 'admin';

export interface SystemTool {
  id: string;
  name: string;
  category: 'system' | 'files' | 'development' | 'browser' | 'cybersecurity';
  description: string;
  permission: PermissionLevel;
  parameters: {
    [key: string]: {
      type: string;
      description: string;
      required?: boolean;
    };
  };
  execute: (params: any, authorized?: boolean) => Promise<ToolExecutionResult>;
}

export interface ToolExecutionResult {
  success: boolean;
  message: string;
  data?: any;
  requiresConfirmation?: boolean;
  command?: string;
  output?: string;
  error?: string;
}

// Dangerous patterns strictly intercepted across all OS environments
const BLOCKED_PATTERNS = [
  /rm\s+(-[a-zA-Z]*r[a-zA-Z]*f|--no-preserve-root)\s+\//i,
  /mkfs(\.[a-z0-9]+)?\s+/i,
  /dd\s+if=.*of=\/dev\/(sd[a-z]|nvme|vd[a-z])/i,
  /:(){ :|:& };:/,
  />\s*\/dev\/(sd[a-z]|nvme|vd[a-z])/i,
  /format\s+[a-z]:/i,
  /del\s+\/[sfq]\s+c:\\windows/i,
  /rd\s+\/s\s+\/q\s+c:\\windows/i,
  /chmod\s+-R\s+777\s+\//i,
];

// Determine operating system
export const isWindows = os.platform() === 'win32';
export const isMac = os.platform() === 'darwin';
export const isLinux = os.platform() === 'linux';

// Known application paths/binaries across platforms
const APP_REGISTRY: Record<string, { win: string; linux: string; mac: string; name: string }> = {
  terminal: {
    win: 'start wt.exe || start powershell || start cmd.exe',
    linux: 'x-terminal-emulator || xfce4-terminal || gnome-terminal || konsole || xterm',
    mac: 'open -a Terminal',
    name: 'Terminal',
  },
  vscode: {
    win: 'code',
    linux: 'code',
    mac: 'open -a "Visual Studio Code"',
    name: 'VS Code',
  },
  chrome: {
    win: 'start chrome',
    linux: 'google-chrome || chromium || firefox',
    mac: 'open -a "Google Chrome"',
    name: 'Google Chrome',
  },
  firefox: {
    win: 'start firefox',
    linux: 'firefox',
    mac: 'open -a Firefox',
    name: 'Firefox Browser',
  },
  explorer: {
    win: 'explorer.exe',
    linux: 'xdg-open',
    mac: 'open',
    name: 'File Explorer',
  },
  notepad: {
    win: 'notepad.exe',
    linux: 'gedit || mousepad || nano',
    mac: 'open -a TextEdit',
    name: 'Text Editor',
  },
  calculator: {
    win: 'calc.exe',
    linux: 'gnome-calculator || galculator || kcalc',
    mac: 'open -a Calculator',
    name: 'Calculator',
  },
  wireshark: {
    win: 'start wireshark',
    linux: 'wireshark',
    mac: 'open -a Wireshark',
    name: 'Wireshark',
  },
};

/**
 * Universal Tool Registry
 */
export const toolRegistry: Map<string, SystemTool> = new Map();

export function registerTool(tool: SystemTool) {
  toolRegistry.set(tool.id, tool);
}

// 1. Tool: Open Terminal
registerTool({
  id: 'open_terminal',
  name: 'Open Terminal',
  category: 'system',
  description: 'Opens the native terminal or command prompt window on the host computer (Windows Terminal, PowerShell, or Linux Terminal).',
  permission: 'safe',
  parameters: {
    initialDir: { type: 'string', description: 'Optional directory path to open terminal in' },
  },
  execute: async (params = {}) => {
    try {
      let cmd = '';
      const targetDir = params.initialDir ? path.resolve(params.initialDir) : process.cwd();

      if (isWindows) {
        // Try Windows Terminal first, fallback to powershell or cmd
        cmd = `start wt.exe -d "${targetDir}" || start powershell -NoExit -Command "Set-Location '${targetDir}'" || start cmd.exe /K "cd /d ${targetDir}"`;
      } else if (isMac) {
        cmd = `open -a Terminal "${targetDir}"`;
      } else {
        cmd = `x-terminal-emulator --working-directory="${targetDir}" || xfce4-terminal --working-directory="${targetDir}" || gnome-terminal --working-directory="${targetDir}" || xterm`;
      }

      const child = spawn(cmd, { shell: true, detached: true, stdio: 'ignore' });
      child.unref();

      logAudit('open_terminal', 0, `Opened terminal in ${targetDir}`, '', 'success', 20);
      return {
        success: true,
        message: `Native terminal launched successfully on ${os.platform()} in ${targetDir}.`,
        output: `Launched terminal in ${targetDir}`,
      };
    } catch (err: any) {
      logAudit('open_terminal', 1, '', err.message, 'error', 20);
      return {
        success: false,
        message: `Failed to open terminal: ${err.message}`,
        error: err.message,
      };
    }
  },
});

// 2. Tool: Open Installed Application
registerTool({
  id: 'open_app',
  name: 'Open Application',
  category: 'system',
  description: 'Launches an installed software application such as VS Code, Chrome, Firefox, Calculator, or Wireshark.',
  permission: 'safe',
  parameters: {
    appName: { type: 'string', description: 'Name or key of the application to launch (e.g., vscode, chrome, firefox, terminal)', required: true },
  },
  execute: async (params) => {
    const appKey = (params.appName || '').toLowerCase().trim();
    let reg = APP_REGISTRY[appKey];

    // Fuzzy matching if not direct key
    if (!reg) {
      const foundKey = Object.keys(APP_REGISTRY).find((k) => k.includes(appKey) || appKey.includes(k));
      if (foundKey) reg = APP_REGISTRY[foundKey];
    }

    if (!reg) {
      // Direct binary invocation fallback
      try {
        const cmd = isWindows ? `start "" "${params.appName}"` : `${params.appName}`;
        const child = spawn(cmd, { shell: true, detached: true, stdio: 'ignore' });
        child.unref();
        logAudit(`open_app:${params.appName}`, 0, 'Dispatched process launch', '', 'success', 20);
        return {
          success: true,
          message: `Application "${params.appName}" launched.`,
        };
      } catch (e: any) {
        return {
          success: false,
          message: `Application "${params.appName}" not found in registry. Try specifying the full binary name or path.`,
          error: e.message,
        };
      }
    }

    const command = isWindows ? reg.win : isMac ? reg.mac : reg.linux;
    try {
      const child = spawn(command, { shell: true, detached: true, stdio: 'ignore' });
      child.unref();
      logAudit(`open_app:${reg.name}`, 0, `Launched ${reg.name}`, '', 'success', 20);
      return {
        success: true,
        message: `${reg.name} launched successfully.`,
      };
    } catch (err: any) {
      logAudit(`open_app:${reg.name}`, 1, '', err.message, 'error', 20);
      return {
        success: false,
        message: `Failed to launch ${reg.name}: ${err.message}`,
        error: err.message,
      };
    }
  },
});

// 3. Tool: Open Folder in File Explorer
registerTool({
  id: 'open_folder',
  name: 'Open Folder in Explorer',
  category: 'files',
  description: 'Opens a folder on the computer in Windows File Explorer or Linux file manager (e.g., Downloads, Projects, Documents, or a specific path).',
  permission: 'safe',
  parameters: {
    folderPath: { type: 'string', description: 'Folder name or path (e.g. downloads, documents, desktop, or custom path)' },
  },
  execute: async (params = {}) => {
    try {
      let targetPath = params.folderPath || '';
      const lower = targetPath.toLowerCase();

      if (!targetPath || lower === 'downloads') {
        targetPath = path.join(os.homedir(), 'Downloads');
      } else if (lower === 'documents') {
        targetPath = path.join(os.homedir(), 'Documents');
      } else if (lower === 'desktop') {
        targetPath = path.join(os.homedir(), 'Desktop');
      } else if (lower === 'project' || lower === 'projects') {
        targetPath = process.cwd();
      } else {
        targetPath = path.resolve(targetPath);
      }

      if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(targetPath, { recursive: true });
      }

      const cmd = isWindows
        ? `explorer.exe "${targetPath}"`
        : isMac
        ? `open "${targetPath}"`
        : `xdg-open "${targetPath}" || thunar "${targetPath}" || nautilus "${targetPath}"`;

      const child = spawn(cmd, { shell: true, detached: true, stdio: 'ignore' });
      child.unref();

      logAudit(`open_folder:${targetPath}`, 0, `Opened folder ${targetPath}`, '', 'success', 20);
      return {
        success: true,
        message: `Opened folder: ${targetPath}`,
        output: targetPath,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Could not open folder: ${err.message}`,
        error: err.message,
      };
    }
  },
});

// 4. Tool: Create Folder
registerTool({
  id: 'create_folder',
  name: 'Create New Folder',
  category: 'files',
  description: 'Creates a new directory at the specified path on the computer.',
  permission: 'safe',
  parameters: {
    folderPath: { type: 'string', description: 'Path of the folder to create', required: true },
  },
  execute: async (params) => {
    try {
      if (!params.folderPath) throw new Error('Folder path is required');
      const targetPath = path.resolve(params.folderPath);
      fs.mkdirSync(targetPath, { recursive: true });
      logAudit(`create_folder:${targetPath}`, 0, `Created directory ${targetPath}`, '', 'success', 20);
      return {
        success: true,
        message: `Folder created at: ${targetPath}`,
        output: targetPath,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Failed to create folder: ${err.message}`,
        error: err.message,
      };
    }
  },
});

// 5. Tool: Search Files
registerTool({
  id: 'search_files',
  name: 'Search Files',
  category: 'files',
  description: 'Searches for files matching a query or pattern in a specified directory.',
  permission: 'safe',
  parameters: {
    query: { type: 'string', description: 'Filename or extension pattern to search for', required: true },
    dirPath: { type: 'string', description: 'Base directory to search in (defaults to current project directory)' },
  },
  execute: async (params) => {
    try {
      const baseDir = params.dirPath ? path.resolve(params.dirPath) : process.cwd();
      const query = (params.query || '').toLowerCase();
      const matches: string[] = [];

      function walk(current: string, depth = 0) {
        if (depth > 5 || matches.length >= 25) return;
        try {
          const items = fs.readdirSync(current, { withFileTypes: true });
          for (const item of items) {
            if (item.name === 'node_modules' || item.name === '.git' || item.name === 'dist') continue;
            const full = path.join(current, item.name);
            if (item.name.toLowerCase().includes(query)) {
              matches.push(full);
            }
            if (item.isDirectory()) {
              walk(full, depth + 1);
            }
          }
        } catch {}
      }

      walk(baseDir);
      return {
        success: true,
        message: `Found ${matches.length} matching files for "${query}".`,
        data: matches,
        output: matches.length > 0 ? matches.slice(0, 15).join('\n') : 'No matching files found.',
      };
    } catch (err: any) {
      return {
        success: false,
        message: `File search error: ${err.message}`,
        error: err.message,
      };
    }
  },
});

// 6. Tool: Read File Content
registerTool({
  id: 'read_file',
  name: 'Read File',
  category: 'files',
  description: 'Reads the text content of a local file on the computer.',
  permission: 'safe',
  parameters: {
    filePath: { type: 'string', description: 'Path of the file to read', required: true },
  },
  execute: async (params) => {
    try {
      const target = path.resolve(params.filePath);
      if (!fs.existsSync(target)) throw new Error(`File does not exist: ${target}`);
      const stat = fs.statSync(target);
      if (stat.size > 1024 * 500) {
        throw new Error('File is larger than 500KB; preview limited.');
      }
      const content = fs.readFileSync(target, 'utf8');
      return {
        success: true,
        message: `Read ${stat.size} bytes from ${path.basename(target)}.`,
        output: content.slice(0, 4000),
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Error reading file: ${err.message}`,
        error: err.message,
      };
    }
  },
});

// 7. Tool: Get System Telemetry & Performance
registerTool({
  id: 'get_system_info',
  name: 'Get System Telemetry',
  category: 'system',
  description: 'Gathers real-time CPU, RAM, Disk usage, OS version, architecture, and uptime.',
  permission: 'safe',
  parameters: {},
  execute: async () => {
    try {
      const cpus = os.cpus();
      let totalIdle = 0;
      let totalTick = 0;
      for (const cpu of cpus) {
        for (const type in cpu.times) {
          totalTick += (cpu.times as any)[type];
        }
        totalIdle += cpu.times.idle;
      }
      const cpuPercent = Math.min(100, Math.max(0, Math.round(((totalTick - totalIdle) / (totalTick || 1)) * 100)));

      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;
      const ramPercent = Math.round((usedMem / totalMem) * 100);

      const uptimeSec = Math.floor(os.uptime());
      const hours = Math.floor(uptimeSec / 3600);
      const minutes = Math.floor((uptimeSec % 3600) / 60);

      const info = {
        os: `${os.type()} ${os.release()} (${os.arch()})`,
        hostname: os.hostname(),
        platform: os.platform(),
        cpuCores: cpus.length,
        cpuModel: cpus[0]?.model || 'Standard Processor',
        cpuUsage: `${cpuPercent}%`,
        ramUsage: `${ramPercent}% (${(usedMem / (1024 ** 3)).toFixed(1)} GB / ${(totalMem / (1024 ** 3)).toFixed(1)} GB)`,
        uptime: `${hours}h ${minutes}m`,
      };

      return {
        success: true,
        message: `System Telemetry: CPU ${info.cpuUsage} | RAM ${info.ramUsage} | OS ${info.os}`,
        data: info,
        output: `OS: ${info.os}\nHostname: ${info.hostname}\nCPU: ${info.cpuModel} (${info.cpuCores} cores) - ${info.cpuUsage} load\nRAM: ${info.ramUsage}\nUptime: ${info.uptime}`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Failed to retrieve system telemetry: ${err.message}`,
        error: err.message,
      };
    }
  },
});

// 8. Tool: Run Approved Development / Terminal Command
registerTool({
  id: 'run_command',
  name: 'Run Approved Shell Command',
  category: 'development',
  description: 'Executes an approved terminal command (e.g., git status, python script, npm run, ping, nmap) with security checks.',
  permission: 'confirmation_required',
  parameters: {
    command: { type: 'string', description: 'Shell command string to execute', required: true },
  },
  execute: async (params, authorized = false) => {
    const command = (params.command || '').trim();
    if (!command) {
      return { success: false, message: 'Command string required' };
    }

    // 1. Safety Guard Check
    for (const pattern of BLOCKED_PATTERNS) {
      if (pattern.test(command)) {
        const errorMsg = 'SECURITY INTERCEPT: Command blocked by ULTRON Safety Guard. Destructive filesystem operations are prohibited.';
        logAudit(command, 126, '', errorMsg, 'blocked', 0);
        return {
          success: false,
          message: errorMsg,
          error: errorMsg,
        };
      }
    }

    // 2. Authorization check
    if (!authorized) {
      return {
        success: false,
        message: `Authorization required: Are you sure you want to execute "$ ${command}"?`,
        requiresConfirmation: true,
        command,
      };
    }

    // 3. Execution with timeout
    const startTime = Date.now();
    return new Promise((resolve) => {
      exec(command, { timeout: 30000, maxBuffer: 1024 * 1024 * 2 }, (error, stdout, stderr) => {
        const duration = Date.now() - startTime;
        const exitCode = error ? (error.code ?? 1) : 0;
        const isSuccess = exitCode === 0;

        logAudit(command, exitCode, stdout, stderr, isSuccess ? 'success' : 'error', duration);

        resolve({
          success: isSuccess,
          message: isSuccess ? `Command finished with exit code 0.` : `Command failed (Exit ${exitCode}): ${stderr || error?.message}`,
          output: stdout || (isSuccess ? '[Completed successfully without stdout output]' : ''),
          error: stderr || (error ? error.message : undefined),
        });
      });
    });
  },
});

// 9. Tool: Run Python Script
registerTool({
  id: 'run_python',
  name: 'Execute Python Script',
  category: 'development',
  description: 'Executes a Python command or script file on the local machine.',
  permission: 'confirmation_required',
  parameters: {
    codeOrFile: { type: 'string', description: 'Python script filepath or inline python expression', required: true },
  },
  execute: async (params, authorized = false) => {
    const input = (params.codeOrFile || '').trim();
    if (!input) return { success: false, message: 'Python script or code required' };

    let cmd = '';
    if (fs.existsSync(input)) {
      cmd = `python3 "${input}" || python "${input}"`;
    } else {
      cmd = `python3 -c "${input.replace(/"/g, '\\"')}" || python -c "${input.replace(/"/g, '\\"')}"`;
    }

    return toolRegistry.get('run_command')!.execute({ command: cmd }, authorized);
  },
});

// 10. Tool: Open Web URL in Browser
registerTool({
  id: 'open_url',
  name: 'Open URL in Browser',
  category: 'browser',
  description: 'Opens a website or web search URL in the default web browser.',
  permission: 'safe',
  parameters: {
    url: { type: 'string', description: 'HTTP or HTTPS URL to navigate to', required: true },
  },
  execute: async (params) => {
    let url = (params.url || '').trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    try {
      const cmd = isWindows ? `start "" "${url}"` : isMac ? `open "${url}"` : `xdg-open "${url}" &`;
      await execAsync(cmd);
      logAudit(`open_url:${url}`, 0, `Opened ${url}`, '', 'success', 50);
      return {
        success: true,
        message: `Opened ${url} in your default browser.`,
        output: url,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Failed to open browser URL: ${err.message}`,
        error: err.message,
      };
    }
  },
});

// Audit logger helper
function logAudit(command: string, exitCode: number, stdout: string, stderr: string, status: string, durationMs: number) {
  try {
    const insert = db.prepare(`
      INSERT INTO command_audit (id, command, exit_code, stdout, stderr, status, execution_time_ms, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insert.run(randomUUID(), command, exitCode, (stdout || '').slice(0, 5000), (stderr || '').slice(0, 5000), status, durationMs, new Date().toISOString());
  } catch (e) {
    console.error('Audit logging error:', e);
  }
}

/**
 * Natural Language Tool Intent Resolver
 * Identifies tool name and extracts parameters from user's conversational command
 */
export function resolveToolIntent(text: string): { toolId: string; params: any } | null {
  const lower = text.toLowerCase().trim();

  // 1. Open Terminal
  if (
    lower.includes('open terminal') ||
    lower.includes('launch terminal') ||
    lower.includes('start terminal') ||
    lower.includes('open cmd') ||
    lower.includes('open powershell') ||
    lower.includes('open bash')
  ) {
    return { toolId: 'open_terminal', params: {} };
  }

  // 2. Open VS Code
  if (lower.includes('open vs code') || lower.includes('open vscode') || lower.includes('launch vscode') || lower.includes('open code')) {
    return { toolId: 'open_app', params: { appName: 'vscode' } };
  }

  // 3. Open Chrome / Browser
  if (lower.includes('open chrome') || lower.includes('launch chrome') || lower.includes('open browser')) {
    return { toolId: 'open_app', params: { appName: 'chrome' } };
  }

  // 4. Open Firefox
  if (lower.includes('open firefox') || lower.includes('launch firefox')) {
    return { toolId: 'open_app', params: { appName: 'firefox' } };
  }

  // 5. Open File Explorer / Files
  if (lower.includes('open file explorer') || lower.includes('open explorer') || lower.includes('open files') || lower.includes('open my files')) {
    return { toolId: 'open_folder', params: { folderPath: '' } };
  }

  // 6. Open Downloads
  if (lower.includes('open downloads') || lower.includes('open download folder') || lower.includes('show downloads')) {
    return { toolId: 'open_folder', params: { folderPath: 'downloads' } };
  }

  // 7. Open Project Folder
  if (lower.includes('open project folder') || lower.includes('open my project') || lower.includes('open project')) {
    return { toolId: 'open_folder', params: { folderPath: 'projects' } };
  }

  // 8. Create New Folder
  const createFolderMatch = text.match(/create (?:a )?(?:new )?folder (?:named |called )?['"]?([a-zA-Z0-9_\-\.\/]+)['"]?/i);
  if (createFolderMatch) {
    return { toolId: 'create_folder', params: { folderPath: createFolderMatch[1] } };
  }

  // 9. Search Files
  const searchMatch = text.match(/search (?:for )?(?:files? )?['"]?([a-zA-Z0-9_\-\.\*]+)['"]?/i) || text.match(/find (?:large )?files? ['"]?([a-zA-Z0-9_\-\.\*]+)?['"]?/i);
  if (searchMatch && searchMatch[1]) {
    return { toolId: 'search_files', params: { query: searchMatch[1] } };
  }

  // 10. System Information / CPU / RAM
  if (
    lower.includes('system info') ||
    lower.includes('system information') ||
    lower.includes('check cpu') ||
    lower.includes('check ram') ||
    lower.includes('system status') ||
    lower.includes('hardware info')
  ) {
    return { toolId: 'get_system_info', params: {} };
  }

  // 11. Git Commands
  if (lower.startsWith('git ') || lower.includes('run git ')) {
    const gitCmd = text.replace(/^(?:ultron,?\s*)?(?:run\s*)?/i, '').trim();
    return { toolId: 'run_command', params: { command: gitCmd } };
  }

  // 12. Python script
  if (lower.includes('execute python') || lower.includes('run python')) {
    const pyCode = text.replace(/.*(?:execute|run) python (?:script )?/i, '').trim();
    return { toolId: 'run_python', params: { codeOrFile: pyCode } };
  }

  // 13. Open URL
  const urlMatch = text.match(/open (?:url|website|link|page) ['"]?(https?:\/\/[^\s'"]+)['"]?/i);
  if (urlMatch) {
    return { toolId: 'open_url', params: { url: urlMatch[1] } };
  }

  return null;
}
