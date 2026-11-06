import fs from 'fs';
import { exec } from 'child_process';
import util from 'util';
import { db } from './database';
import { randomUUID } from 'crypto';

const execAsync = util.promisify(exec);

export interface SecurityFinding {
  id: string;
  category: 'Network' | 'System Configuration' | 'Authentication' | 'Filesystem' | 'Kernel';
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'PASSED';
  description: string;
  remediation: string;
}

export interface SecurityAuditReport {
  id: string;
  timestamp: string;
  overallScore: number;
  totalChecks: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  passedCount: number;
  findings: SecurityFinding[];
}

export async function runLocalSecurityAudit(): Promise<SecurityAuditReport> {
  const findings: SecurityFinding[] = [];
  let scoreDeductions = 0;

  // 1. Check Firewall (UFW / iptables)
  try {
    let ufwActive = false;
    try {
      const { stdout } = await execAsync('ufw status 2>/dev/null || iptables -L -n 2>/dev/null');
      if (stdout.toLowerCase().includes('active') || stdout.includes('Chain INPUT')) {
        ufwActive = true;
      }
    } catch {}

    if (ufwActive) {
      findings.push({
        id: 'chk-fw-1',
        category: 'Network',
        title: 'Host Firewall (iptables/UFW)',
        severity: 'PASSED',
        description: 'Host packet filtering and firewall rules are active.',
        remediation: 'Maintain default-deny policy for incoming unneeded ports.',
      });
    } else {
      findings.push({
        id: 'chk-fw-1',
        category: 'Network',
        title: 'Firewall Inactive or Unrestricted',
        severity: 'HIGH',
        description: 'UFW or default iptables packet drop policy is not strictly enforced.',
        remediation: 'Run: sudo ufw default deny incoming && sudo ufw enable',
      });
      scoreDeductions += 15;
    }
  } catch {}

  // 2. Check Open Listening Sockets
  try {
    const { stdout } = await execAsync('ss -tuln 2>/dev/null || netstat -tuln 2>/dev/null');
    const lines = stdout.split('\n');
    const openPorts: string[] = [];

    for (const line of lines) {
      const match = line.match(/:(\d+)\s+/);
      if (match && !openPorts.includes(match[1])) {
        openPorts.push(match[1]);
      }
    }

    if (openPorts.includes('23') || openPorts.includes('21')) {
      findings.push({
        id: 'chk-net-cleartext',
        category: 'Network',
        title: 'Unencrypted Management Protocols (Telnet/FTP)',
        severity: 'CRITICAL',
        description: 'Insecure cleartext transmission services detected on port 21 or 23.',
        remediation: 'Disable telnetd/ftpd and transition exclusively to SSH/SFTP.',
      });
      scoreDeductions += 30;
    } else {
      findings.push({
        id: 'chk-net-cleartext',
        category: 'Network',
        title: 'Cleartext Management Sockets',
        severity: 'PASSED',
        description: 'No legacy cleartext Telnet or unencrypted FTP services listening.',
        remediation: 'Continue enforcing SSH and TLS 1.3.',
      });
    }

    if (openPorts.length > 10) {
      findings.push({
        id: 'chk-net-ports',
        category: 'Network',
        title: `Broad Network Attack Surface (${openPorts.length} Open Sockets)`,
        severity: 'MEDIUM',
        description: `Active listening sockets detected on ports: ${openPorts.slice(0, 8).join(', ')}...`,
        remediation: 'Review ss -tuln and terminate non-essential services.',
      });
      scoreDeductions += 10;
    } else {
      findings.push({
        id: 'chk-net-ports',
        category: 'Network',
        title: 'Network Attack Surface Minimized',
        severity: 'PASSED',
        description: `Only ${openPorts.length} listening sockets detected on the host.`,
        remediation: 'Keep unwanted daemons disabled.',
      });
    }
  } catch {}

  // 3. Check SSH Configuration if present
  try {
    if (fs.existsSync('/etc/ssh/sshd_config')) {
      const sshConf = fs.readFileSync('/etc/ssh/sshd_config', 'utf8');
      if (/^PermitRootLogin\s+yes/m.test(sshConf)) {
        findings.push({
          id: 'chk-ssh-root',
          category: 'Authentication',
          title: 'Direct SSH Root Login Permitted',
          severity: 'HIGH',
          description: 'PermitRootLogin is explicitly enabled in /etc/ssh/sshd_config.',
          remediation: 'Set "PermitRootLogin no" in /etc/ssh/sshd_config and restart sshd.',
        });
        scoreDeductions += 15;
      } else {
        findings.push({
          id: 'chk-ssh-root',
          category: 'Authentication',
          title: 'SSH Root Login Hardened',
          severity: 'PASSED',
          description: 'Direct root SSH access is disabled or prohibited by default.',
          remediation: 'Use sudo with individual user keypairs.',
        });
      }
    } else {
      findings.push({
        id: 'chk-ssh-root',
        category: 'Authentication',
        title: 'SSH Server Daemon',
        severity: 'PASSED',
        description: 'sshd is not installed or not exposed in standard path.',
        remediation: 'Ensure public keys are configured before enabling sshd.',
      });
    }
  } catch {}

  // 4. Check Sensitive File Permissions (/etc/passwd, /etc/shadow)
  try {
    if (fs.existsSync('/etc/shadow')) {
      const stat = fs.statSync('/etc/shadow');
      const mode = (stat.mode & 0o777).toString(8);
      if (mode.endsWith('4') || mode.endsWith('7') || mode.endsWith('6')) {
        findings.push({
          id: 'chk-fs-shadow',
          category: 'Filesystem',
          title: 'World-Readable /etc/shadow',
          severity: 'CRITICAL',
          description: 'System password hashes file is readable by non-root users.',
          remediation: 'Run: sudo chmod 640 /etc/shadow && sudo chown root:shadow /etc/shadow',
        });
        scoreDeductions += 40;
      } else {
        findings.push({
          id: 'chk-fs-shadow',
          category: 'Filesystem',
          title: 'Shadow Password Hashes Securely Protected',
          severity: 'PASSED',
          description: '/etc/shadow permissions are restricted to root:shadow (mode 640/000).',
          remediation: 'Maintain strict DAC ownership.',
        });
      }
    }
  } catch {}

  // 5. ASLR (Address Space Layout Randomization)
  try {
    if (fs.existsSync('/proc/sys/kernel/randomize_va_space')) {
      const aslrVal = fs.readFileSync('/proc/sys/kernel/randomize_va_space', 'utf8').trim();
      if (aslrVal === '2') {
        findings.push({
          id: 'chk-kern-aslr',
          category: 'Kernel',
          title: 'Full Kernel ASLR Active',
          severity: 'PASSED',
          description: 'Address Space Layout Randomization is fully randomized (level 2).',
          remediation: 'Preserve kernel parameter in /etc/sysctl.d/99-security.conf.',
        });
      } else {
        findings.push({
          id: 'chk-kern-aslr',
          category: 'Kernel',
          title: 'ASLR Disabled or Partial',
          severity: 'HIGH',
          description: `Kernel randomize_va_space is set to ${aslrVal} instead of 2.`,
          remediation: 'Run: sudo sysctl -w kernel.randomize_va_space=2',
        });
        scoreDeductions += 20;
      }
    }
  } catch {}

  const overallScore = Math.max(20, Math.min(100, 100 - scoreDeductions));
  const criticalCount = findings.filter(f => f.severity === 'CRITICAL').length;
  const highCount = findings.filter(f => f.severity === 'HIGH').length;
  const mediumCount = findings.filter(f => f.severity === 'MEDIUM').length;
  const passedCount = findings.filter(f => f.severity === 'PASSED').length;

  const reportId = randomUUID();
  const timestamp = new Date().toISOString();

  // Store report in SQLite
  try {
    const insert = db.prepare(`
      INSERT INTO security_scans (id, target, score, findings_json, open_ports_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    insert.run(reportId, 'localhost (Kali Linux Host)', overallScore, JSON.stringify(findings), '[]', timestamp);
  } catch {}

  return {
    id: reportId,
    timestamp,
    overallScore,
    totalChecks: findings.length,
    criticalCount,
    highCount,
    mediumCount,
    passedCount,
    findings,
  };
}
