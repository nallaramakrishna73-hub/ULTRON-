import React, { useState, useEffect } from 'react';
import {
  FolderClosed,
  FolderOpen,
  FileCode,
  FileText,
  Search,
  Plus,
  Trash2,
  Lock,
  Eye,
  RefreshCw,
  ArrowUp,
  File,
} from 'lucide-react';

interface RealFileItem {
  name: string;
  path: string;
  type: 'file' | 'directory' | 'symlink';
  sizeBytes: number;
  sizeFormatted: string;
  modified: string;
  permissions: string;
  extension?: string;
}

export const FilesManagerView: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>('');
  const [parentPath, setParentPath] = useState<string | null>(null);
  const [items, setItems] = useState<RealFileItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<RealFileItem | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);

  const loadDirectory = async (path?: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const url = path ? `/api/files/browse?path=${encodeURIComponent(path)}` : '/api/files/browse';
      const res = await fetch(url);
      const data = await res.json();
      if (data.error) {
        setErrorMsg(data.error);
      } else {
        setCurrentPath(data.currentPath);
        setParentPath(data.parentPath);
        setItems(data.items || []);
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to browse filesystem');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDirectory();
  }, []);

  const handleSelectFile = async (item: RealFileItem) => {
    if (item.type === 'directory') {
      setSelectedFile(null);
      setFileContent('');
      await loadDirectory(item.path);
    } else {
      setSelectedFile(item);
      try {
        const res = await fetch(`/api/files/read?path=${encodeURIComponent(item.path)}`);
        const data = await res.json();
        if (data.success) {
          setFileContent(data.content || '');
          setErrorMsg(null);
        } else {
          setFileContent(`[Could not read file: ${data.error || 'Access restricted'}]`);
        }
      } catch (err: any) {
        setFileContent(`[Error reading file: ${err.message}]`);
      }
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    const folderPath = `${currentPath}/${newFolderName.trim()}`;
    try {
      const res = await fetch('/api/files/mkdir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: folderPath }),
      });
      const data = await res.json();
      if (data.success) {
        setNewFolderName('');
        setShowNewFolderModal(false);
        loadDirectory(currentPath);
      } else {
        alert(data.error || 'Failed to create directory');
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDelete = async (item: RealFileItem) => {
    if (confirm(`Confirm deletion of ${item.type}: "${item.name}"?`)) {
      try {
        const res = await fetch('/api/files/delete', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: item.path }),
        });
        const data = await res.json();
        if (data.success) {
          if (selectedFile?.path === item.path) {
            setSelectedFile(null);
            setFileContent('');
          }
          loadDirectory(currentPath);
        } else {
          alert(`Deletion failed: ${data.error}`);
        }
      } catch (e: any) {
        alert(e.message);
      }
    }
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              Live filesystem browser with DAC permission checks, previews, and root safety guard
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
              placeholder="Search directory..."
              className="w-full py-1.5 pl-8 pr-3 rounded-xl bg-black/50 border border-indigo-800/40 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>

          <button
            onClick={() => loadDirectory(currentPath)}
            className="p-2 rounded-xl bg-indigo-900/40 border border-indigo-700/50 text-cyan-400 hover:bg-indigo-800/50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

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
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/40 border border-indigo-950 font-mono text-xs text-slate-300">
        <span className="text-cyan-400 font-bold">Path:</span>
        <span className="text-purple-300 truncate">{currentPath || '/'}</span>
        {parentPath && (
          <button
            onClick={() => loadDirectory(parentPath)}
            className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-xs text-cyan-400 transition-colors"
          >
            <ArrowUp className="w-3 h-3" /> Up One Level
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-xs font-mono text-rose-300">
          {errorMsg}
        </div>
      )}

      {/* Files Grid & Preview Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* File Browser Grid */}
        <div className="lg:col-span-7 rounded-2xl glass-panel p-4 border border-indigo-900/40 space-y-2">
          <div className="text-xs font-mono text-slate-400 pb-1 border-b border-indigo-950 flex justify-between">
            <span>Name ({filteredItems.length} items)</span>
            <span>Size / Perms</span>
          </div>

          <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
            {filteredItems.length === 0 ? (
              <div className="text-center py-8 font-mono text-xs text-slate-500">
                Directory is empty or no matches found.
              </div>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item.path}
                  onClick={() => handleSelectFile(item)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    selectedFile?.path === item.path
                      ? 'bg-purple-950/40 border-purple-400 text-cyan-200 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                      : 'bg-slate-900/40 border-indigo-950 hover:border-indigo-700/50 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    {item.type === 'directory' ? (
                      <FolderClosed className="w-4 h-4 text-cyan-400 shrink-0" />
                    ) : item.name.endsWith('.ts') || item.name.endsWith('.tsx') || item.name.endsWith('.py') || item.name.endsWith('.js') ? (
                      <FileCode className="w-4 h-4 text-purple-400 shrink-0" />
                    ) : (
                      <File className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <span className="font-mono text-xs font-medium truncate">{item.name}</span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] font-mono text-slate-400">
                      {item.sizeFormatted}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {item.permissions}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item);
                      }}
                      className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* File Preview Pane */}
        <div className="lg:col-span-5 rounded-2xl glass-panel p-4 border border-indigo-900/40 flex flex-col justify-between min-h-[420px]">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-indigo-950">
              <span className="font-orbitron font-bold text-xs text-white">
                Live File Inspection
              </span>
              <span className="text-xs font-mono text-cyan-400 truncate max-w-[200px]">
                {selectedFile ? selectedFile.name : 'Select file'}
              </span>
            </div>

            {selectedFile ? (
              <pre className="mt-3 p-3 rounded-xl bg-slate-950 border border-indigo-950 font-mono text-xs text-slate-200 h-[380px] overflow-y-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                {fileContent}
              </pre>
            ) : (
              <div className="p-8 text-center text-xs font-mono text-slate-500">
                Click any file from the real filesystem to inspect its contents.
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
              placeholder="e.g. pentest_recon"
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
