import fs from 'fs';
import path from 'path';

// Restricted sensitive system files
const SENSITIVE_PATHS = [
  '/etc/shadow',
  '/etc/gshadow',
  '/root/.ssh',
];

function isPathRestricted(targetPath: string): boolean {
  const resolved = path.resolve(targetPath);
  for (const restricted of SENSITIVE_PATHS) {
    if (resolved === restricted || resolved.startsWith(restricted + '/')) {
      return true;
    }
  }
  return false;
}

export interface FileItem {
  name: string;
  path: string;
  type: 'file' | 'directory' | 'symlink';
  sizeBytes: number;
  sizeFormatted: string;
  modified: string;
  permissions: string;
  extension?: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function browseDirectory(dirPath: string = process.cwd()): {
  currentPath: string;
  parentPath: string | null;
  items: FileItem[];
  error?: string;
} {
  const target = path.resolve(dirPath);

  if (isPathRestricted(target)) {
    return {
      currentPath: target,
      parentPath: path.dirname(target),
      items: [],
      error: 'ACCESS DENIED: Attempted access to privileged system security root.',
    };
  }

  if (!fs.existsSync(target)) {
    return {
      currentPath: target,
      parentPath: path.dirname(target),
      items: [],
      error: `Directory not found: ${target}`,
    };
  }

  try {
    const rawItems = fs.readdirSync(target, { withFileTypes: true });
    const items: FileItem[] = [];

    for (const item of rawItems) {
      const fullItemPath = path.join(target, item.name);
      let sizeBytes = 0;
      let modified = new Date().toISOString();
      let permissions = 'rw-r--r--';

      try {
        const stat = fs.statSync(fullItemPath);
        sizeBytes = stat.size;
        modified = stat.mtime.toISOString();
        permissions = (stat.mode & 0o777).toString(8);
      } catch {}

      const ext = item.isFile() ? path.extname(item.name).slice(1) : undefined;

      items.push({
        name: item.name,
        path: fullItemPath,
        type: item.isDirectory() ? 'directory' : item.isSymbolicLink() ? 'symlink' : 'file',
        sizeBytes,
        sizeFormatted: item.isDirectory() ? '--' : formatBytes(sizeBytes),
        modified,
        permissions,
        extension: ext,
      });
    }

    // Sort: directories first, then alphabetically
    items.sort((a, b) => {
      if (a.type === 'directory' && b.type !== 'directory') return -1;
      if (a.type !== 'directory' && b.type === 'directory') return 1;
      return a.name.localeCompare(b.name);
    });

    return {
      currentPath: target,
      parentPath: target === '/' ? null : path.dirname(target),
      items,
    };
  } catch (err: any) {
    return {
      currentPath: target,
      parentPath: path.dirname(target),
      items: [],
      error: err.message || 'Permission denied',
    };
  }
}

export function readFileContent(filePath: string): {
  success: boolean;
  content?: string;
  error?: string;
  sizeBytes?: number;
} {
  const target = path.resolve(filePath);

  if (isPathRestricted(target)) {
    return { success: false, error: 'ACCESS DENIED: Security restriction on sensitive system target.' };
  }

  if (!fs.existsSync(target)) {
    return { success: false, error: 'File does not exist.' };
  }

  try {
    const stat = fs.statSync(target);
    if (stat.isDirectory()) {
      return { success: false, error: 'Target is a directory, not a file.' };
    }
    if (stat.size > 1024 * 1024 * 2) {
      return { success: false, error: 'File is too large to preview (>2MB).' };
    }

    const content = fs.readFileSync(target, 'utf8');
    return {
      success: true,
      content,
      sizeBytes: stat.size,
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export function writeFileContent(filePath: string, content: string): {
  success: boolean;
  error?: string;
} {
  const target = path.resolve(filePath);
  if (isPathRestricted(target)) {
    return { success: false, error: 'ACCESS DENIED: Cannot modify restricted system paths.' };
  }

  try {
    const dir = path.dirname(target);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(target, content, 'utf8');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export function createDirectory(dirPath: string): { success: boolean; error?: string } {
  const target = path.resolve(dirPath);
  if (isPathRestricted(target)) {
    return { success: false, error: 'ACCESS DENIED: Cannot create restricted path.' };
  }
  try {
    fs.mkdirSync(target, { recursive: true });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export function deleteFileOrFolder(targetPath: string): { success: boolean; error?: string } {
  const target = path.resolve(targetPath);
  if (target === '/' || isPathRestricted(target)) {
    return { success: false, error: 'CRITICAL SECURITY ALERT: Root or protected path deletion prohibited.' };
  }
  try {
    const stat = fs.statSync(target);
    if (stat.isDirectory()) {
      fs.rmSync(target, { recursive: true, force: true });
    } else {
      fs.unlinkSync(target);
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
