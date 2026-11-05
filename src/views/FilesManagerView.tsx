import React, { useState } from 'react';
import {
  FolderClosed,
  FolderOpen,
  FileCode,
  FileText,
  Search,
  Plus,
  Trash2,
  Lock,
  Download,
  Eye,
  FileArchive,
  Terminal,
} from 'lucide-react';

interface FileNode {
  id: string;
  name: string;
  type: 'folder' | 'file';
  size?: string;
  modified: string;
  isProtected?: boolean;
  content?: string;
}

const INITIAL_FILES: FileNode[] = [
  { id: '1', name: 'projects', type: 'folder', modified: '2026-11-05 09:30' },
  { id: '2', name: 'captures', type: 'folder', modified: '2026-11-04 18:22' },
  { id: '3', name: 'wordlists', type: 'folder', modified: '2026-11-02 11:15' },
  {
    id: '4',
    name: 'ultron_core.py',
    type: 'file',
    size: '18.4 KB',
    modified: '2026-11-05 10:14',
    content: `# ULTRON System Core - Kali Linux Orchestrator
import os
import psutil
import subprocess

class UltronKernel:
    def __init__(self):
        self.version = "2026.3"
        print(f"[ULTRON] Initialized on Linux {os.uname().release}")

    def get_system_telemetry(self):
        return {
            "cpu": psutil.cpu_percent(interval=1),
            "ram": psutil.virtual_memory().percent,
            "disk": psutil.disk_usage('/').percent
        }
`,
  },
  {
    id: '5',
    name: 'network_audit_lab.pcap',
    type: 'file',
    size: '4.2 MB',
    modified: '2026-11-04 21:40',
    content: '[PCAP Binary Format Header: Magic 0xa1b2c3d4, Version 2.4, LinkType 1 (Ethernet)]\nPackets captured: 12,480\nProtocols: TLSv1.3, TCP, DNS, HTTP/2',
  },
  {
    id: '6',
    name: 'notes.md',
    type: 'file',
    size: '2.1 KB',
    modified: '2026-11-05 08:00',
    content: '# Cybersecurity Study Checklist\n- [x] Review OpenSSH race condition advisories\n- [x] Configure Kali UFW default deny rules\n- [ ] Complete OSCP active directory lab',
  },
  {
    id: '7',
    name: '/etc/shadow',
    type: 'file',
    size: '1.4 KB',
    modified: '2026-10-20 12:00',
    isProtected: true,
  },
];

export const FilesManagerView: React.FC = () => {
  const [currentPath, setCurrentPath] = useState('/home/kali');
  const [files, setFiles] = useState<FileNode[]>(INITIAL_FILES);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(INITIAL_FILES[3]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);

  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectFile = (file: FileNode) => {
    if (file.isProtected) {
      alert("Access Denied: Protected system file. Requires explicit root authentication.");
      return;
    }
    if (file.type === 'folder') {
      setCurrentPath((prev) => `${prev}/${file.name}`);
    } else {
      setSelectedFile(file);
    }
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    const newF: FileNode = {
      id: 'f-' + Date.now(),
      name: newFolderName.trim(),
      type: 'folder',
      modified: new Date().toLocaleString(),
    };
    setFiles([newF, ...files]);
    setNewFolderName('');
    setShowNewFolderModal(false);
  };

  const handleDeleteFile = (id: string, name: string) => {
    if (confirm(`Confirm deletion of file: ${name}?`)) {
      setFiles((prev) => prev.filter((f) => f.id !== id));
      if (selectedFile?.id === id) setSelectedFile(null);
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-4">
      {/* Header Bar */}
      <div className="p-4 rounded-2xl glass-panel flex flex-col md:flex-row items-center justify-between gap-4 border border-indigo-900/40">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-600/30 border border-purple-400/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <FolderClosed className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="font-orbitron font-bold text-xl text-white">
              KALI FILES MANAGER
            </h1>
            <p className="text-xs font-rajdhani text-slate-300">
              Sandboxed filesystem navigation, file previews, project organization, and root protection
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 md:w-60">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files in /home/kali..."
              className="w-full py-1.5 pl-8 pr-3 rounded-xl bg-black/50 border border-indigo-800/40 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>

          <button
            onClick={() => setShowNewFolderModal(true)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 font-mono text-xs text-white flex items-center gap-1.5 shrink-0 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
          >
            <Plus className="w-3.5 h-3.5" />
            New Folder
          </button>
        </div>
      </div>

      {/* Path Breadcrumbs */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 border border-indigo-950 font-mono text-xs text-slate-300">
        <span className="text-cyan-400">Path:</span>
        <span className="text-purple-300">{currentPath}</span>
        {currentPath !== '/home/kali' && (
          <button
            onClick={() => setCurrentPath('/home/kali')}
            className="ml-auto text-xs text-cyan-400 hover:underline"
          >
            Reset Root
          </button>
        )}
      </div>

      {/* Files Grid & Preview Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* File Browser Grid */}
        <div className="lg:col-span-7 rounded-2xl glass-panel p-4 border border-indigo-900/40 space-y-2">
          <div className="text-xs font-mono text-slate-400 pb-1 border-b border-indigo-950 flex justify-between">
            <span>Name</span>
            <span>Modified</span>
          </div>

          <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                onClick={() => handleSelectFile(file)}
                className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  selectedFile?.id === file.id
                    ? 'bg-purple-950/40 border-purple-400 text-cyan-200 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                    : 'bg-slate-900/40 border-indigo-950 hover:border-indigo-700/50 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {file.type === 'folder' ? (
                    <FolderClosed className="w-4 h-4 text-cyan-400 shrink-0" />
                  ) : file.isProtected ? (
                    <Lock className="w-4 h-4 text-rose-400 shrink-0" />
                  ) : (
                    <FileCode className="w-4 h-4 text-purple-400 shrink-0" />
                  )}
                  <span className="font-mono text-xs font-medium">{file.name}</span>
                  {file.size && (
                    <span className="text-[10px] font-mono text-slate-500">
                      ({file.size})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-slate-500">
                    {file.modified}
                  </span>
                  {!file.isProtected && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFile(file.id, file.name);
                      }}
                      className="text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* File Preview Pane */}
        <div className="lg:col-span-5 rounded-2xl glass-panel p-4 border border-indigo-900/40 flex flex-col justify-between min-h-[420px]">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-indigo-950">
              <span className="font-orbitron font-bold text-xs text-white">
                File Preview
              </span>
              <span className="text-xs font-mono text-cyan-400">
                {selectedFile ? selectedFile.name : 'No file selected'}
              </span>
            </div>

            {selectedFile?.content ? (
              <pre className="mt-3 p-3 rounded-xl bg-slate-950 border border-indigo-950 font-mono text-xs text-slate-200 h-[380px] overflow-y-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                {selectedFile.content}
              </pre>
            ) : (
              <div className="p-8 text-center text-xs font-mono text-slate-500">
                Select a code, log, or text file to inspect contents in sandbox.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: New Folder */}
      {showNewFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl glass-panel p-5 border border-purple-500/40 space-y-4">
            <h3 className="font-orbitron font-bold text-sm text-white">
              Create New Directory
            </h3>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="e.g. pentest_payloads"
              className="w-full px-3 py-2 rounded-xl bg-black border border-indigo-800/40 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
            />
            <div className="flex justify-end gap-2 font-mono text-xs">
              <button
                onClick={() => setShowNewFolderModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                className="px-3 py-1.5 rounded-lg bg-cyan-600 text-white font-bold"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
