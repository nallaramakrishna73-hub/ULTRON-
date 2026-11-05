import React, { useState } from 'react';
import {
  Search,
  BookOpen,
  FileCode,
  ShieldCheck,
  AlertTriangle,
  Bookmark,
  Share2,
  Cpu,
  Layers,
  Plus,
} from 'lucide-react';
import { ResearchDossier } from '../types';

const INITIAL_DOSSIERS: ResearchDossier[] = [
  {
    id: 'cve-1',
    title: 'regreSSHion: Remote Unauthenticated Code Execution in OpenSSH',
    cveId: 'CVE-2024-6387',
    severity: 'CRITICAL (CVSS 8.1)',
    publishedDate: '2024-07-01',
    summary: 'A signal handler race condition in OpenSSH server (sshd) in glibc-based Linux systems allows unauthenticated remote attackers to execute arbitrary code as root.',
    technicalDetails: 'The vulnerability exists within the SIGALRM handler in sshd which calls async-signal-unsafe functions such as syslog() and free() if a client does not authenticate within LoginGraceTime (default 120s). Exploitation requires precise timing alignment with heap layout.',
    mitigation: 'Update openssh-server to >= 9.8p1 in Kali / Debian repositories. Temporary mitigation: Set LoginGraceTime 0 in /etc/ssh/sshd_config (note: may enable DoS).',
    tags: ['Network', 'SSH', 'Linux', 'Race Condition', 'Root Escalation'],
  },
  {
    id: 'cve-2',
    title: 'Windows Remote Desktop Licensing Service RCE',
    cveId: 'CVE-2024-38077',
    severity: 'CRITICAL (CVSS 9.8)',
    publishedDate: '2024-07-09',
    summary: 'Heap buffer overflow in the Remote Desktop Licensing service (RDL) enabling unauthenticated remote code execution with SYSTEM privileges over port 135 / RPC.',
    technicalDetails: 'The MadLicense service improperly validates decoding lengths for X.509 certificate exchange packets during license negotiation, triggering a heap corruption primitive.',
    mitigation: 'Apply Microsoft Security Update KB5040434 or disable Remote Desktop Licensing on internet-exposed perimeter controllers.',
    tags: ['Windows', 'RDP', 'Heap Overflow', 'RPC'],
  },
  {
    id: 'cve-3',
    title: 'XZ Utils Supply Chain Backdoor',
    cveId: 'CVE-2024-3094',
    severity: 'CRITICAL (CVSS 10.0)',
    publishedDate: '2024-03-29',
    summary: 'Malicious code inserted into upstream release tarballs of xz-utils library (liblzma) designed to intercept RSA public key decryption in sshd.',
    technicalDetails: 'Obfuscated M4 build macros extracted pre-compiled test binaries during configure step, modifying symbol tables via IFUNC (Indirect Functions) to inject a custom authentication bypass into OpenSSH.',
    mitigation: 'Verify system uses xz-utils version 5.6.1 or reverted pristine versions 5.4.6+. Run debian debsums verification.',
    tags: ['Supply Chain', 'Backdoor', 'XZ', 'Build System'],
  },
];

export const ResearchEngineView: React.FC = () => {
  const [dossiers, setDossiers] = useState<ResearchDossier[]>(INITIAL_DOSSIERS);
  const [selectedDossier, setSelectedDossier] = useState<ResearchDossier>(INITIAL_DOSSIERS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [researchNotes, setResearchNotes] = useState<string>('');
  const [savedNotes, setSavedNotes] = useState<{ id: string; title: string; text: string; date: string }[]>([
    {
      id: '1',
      title: 'Lab Hardening Plan',
      text: 'Need to audit Kali SSH config and test UFW default deny rules for external eth0 interface.',
      date: '2026-11-04',
    },
  ]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Simulate searching and creating new dossier
    const newEntry: ResearchDossier = {
      id: 'cve-' + Date.now(),
      title: `Intelligence Query: ${searchQuery}`,
      cveId: searchQuery.toUpperCase().includes('CVE') ? searchQuery.toUpperCase() : 'RESEARCH-REF',
      severity: 'HIGH (Analysis Pending)',
      publishedDate: new Date().toISOString().split('T')[0],
      summary: `Automated threat reconnaissance compiled for '${searchQuery}'. Threat model mapped against MITRE ATT&CK Matrix.`,
      technicalDetails: `Deep packet and binary vulnerability research indicates potential protocol fuzzing vectors. Verify patch levels across Kali package repos.`,
      mitigation: 'Ensure zero-trust isolation on development gateways and run automated dependency vulnerability scanning.',
      tags: ['Threat Intel', 'Recon', 'AI Synthesized'],
    };

    setDossiers([newEntry, ...dossiers]);
    setSelectedDossier(newEntry);
  };

  const handleSaveNote = () => {
    if (!researchNotes.trim()) return;
    setSavedNotes([
      {
        id: 'n-' + Date.now(),
        title: `Note: ${selectedDossier.cveId || selectedDossier.title.slice(0, 20)}`,
        text: researchNotes,
        date: new Date().toLocaleDateString(),
      },
      ...savedNotes,
    ]);
    setResearchNotes('');
  };

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-4">
      {/* Header */}
      <div className="p-4 rounded-2xl glass-panel flex flex-col md:flex-row items-center justify-between gap-4 border border-indigo-900/40">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-cyan-600/20 border border-cyan-400/40">
            <BookOpen className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="font-orbitron font-bold text-xl text-white">
              CYBERSECURITY RESEARCH ENGINE
            </h1>
            <p className="text-xs font-rajdhani text-slate-300">
              Vulnerability intelligence, CVE exploitation breakdowns, defensive mitigations, and lab research
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search CVE-2024-XXXX, keywords..."
            className="w-full py-2 pl-9 pr-3 rounded-xl bg-black/60 border border-indigo-800/40 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Dossiers List */}
        <div className="lg:col-span-4 rounded-2xl glass-panel p-3 border border-indigo-900/40 space-y-2 max-h-[620px] overflow-y-auto">
          <div className="flex items-center justify-between pb-1 border-b border-indigo-950 text-xs font-mono text-cyan-400">
            <span>Verified CVE Advisories</span>
            <span>{dossiers.length} items</span>
          </div>

          {dossiers.map((d) => (
            <div
              key={d.id}
              onClick={() => setSelectedDossier(d)}
              className={`p-3 rounded-xl cursor-pointer border transition-all ${
                selectedDossier.id === d.id
                  ? 'bg-purple-950/40 border-purple-400/80 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                  : 'bg-slate-900/40 border-indigo-950 hover:border-indigo-700/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-cyan-300">
                  {d.cveId || 'THREAT-INTEL'}
                </span>
                <span className="text-[10px] font-mono text-rose-400 bg-rose-950/50 px-1.5 py-0.5 rounded border border-rose-500/30">
                  {d.severity.split(' ')[0]}
                </span>
              </div>
              <h4 className="font-rajdhani font-bold text-sm text-white mt-1 line-clamp-1">
                {d.title}
              </h4>
              <p className="text-xs font-rajdhani text-slate-300 mt-1 line-clamp-2">
                {d.summary}
              </p>
            </div>
          ))}
        </div>

        {/* Selected Dossier Technical Analysis */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-2xl glass-panel p-5 border border-indigo-900/40 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-indigo-900/40">
              <div>
                <span className="text-xs font-mono text-cyan-400">
                  {selectedDossier.cveId} • Published {selectedDossier.publishedDate}
                </span>
                <h2 className="font-orbitron font-bold text-lg text-white mt-0.5">
                  {selectedDossier.title}
                </h2>
              </div>
              <span className="px-3 py-1 rounded-full bg-rose-950/60 border border-rose-500/40 text-xs font-mono text-rose-300">
                {selectedDossier.severity}
              </span>
            </div>

            {/* Summary */}
            <div>
              <h3 className="font-orbitron font-bold text-xs text-indigo-300 mb-1">
                VULNERABILITY OVERVIEW
              </h3>
              <p className="text-sm font-rajdhani text-slate-200 leading-relaxed bg-black/30 p-3 rounded-xl border border-indigo-950">
                {selectedDossier.summary}
              </p>
            </div>

            {/* Technical Breakdown */}
            <div>
              <h3 className="font-orbitron font-bold text-xs text-cyan-400 mb-1">
                TECHNICAL MECHANISM & PROTOCOL DETAILS
              </h3>
              <div className="p-3 rounded-xl bg-slate-950 border border-indigo-900/50 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                {selectedDossier.technicalDetails}
              </div>
            </div>

            {/* Mitigation */}
            <div>
              <h3 className="font-orbitron font-bold text-xs text-emerald-400 mb-1">
                DEFENSIVE MITIGATION & REMEDIATION
              </h3>
              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 font-rajdhani text-xs text-emerald-200">
                {selectedDossier.mitigation}
              </div>
            </div>

            {/* Tags */}
            <div className="flex items-center gap-1.5 flex-wrap pt-2">
              {selectedDossier.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-800/40 text-[10px] font-mono text-indigo-300"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Research Notes & Dossier Journal */}
          <div className="rounded-2xl glass-panel p-4 border border-indigo-900/40">
            <h3 className="font-orbitron font-bold text-xs text-white mb-2 flex items-center gap-1.5">
              <Bookmark className="w-4 h-4 text-purple-400" />
              Research Lab Notebook
            </h3>

            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={researchNotes}
                onChange={(e) => setResearchNotes(e.target.value)}
                placeholder="Write research hypothesis, payload test notes, or remediation tasks..."
                className="flex-1 px-3 py-2 rounded-xl bg-black/50 border border-indigo-800/40 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
              />
              <button
                onClick={handleSaveNote}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 font-mono text-xs text-white flex items-center gap-1 shadow-[0_0_12px_rgba(168,85,247,0.4)]"
              >
                <Plus className="w-3.5 h-3.5" />
                Save Note
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {savedNotes.map((n) => (
                <div key={n.id} className="p-2.5 rounded-xl bg-black/40 border border-indigo-950 text-xs font-rajdhani">
                  <div className="flex items-center justify-between text-[10px] font-mono text-purple-300 mb-1">
                    <span className="font-bold">{n.title}</span>
                    <span className="text-slate-500">{n.date}</span>
                  </div>
                  <p className="text-slate-300">{n.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
