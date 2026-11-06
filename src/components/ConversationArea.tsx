import React, { useRef, useEffect, useState } from 'react';
import {
  Terminal,
  Folder,
  Code,
  Globe,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Play,
  RotateCw,
} from 'lucide-react';
import { ChatMessage } from '../types';

export interface ToolResult {
  toolId?: string;
  toolName?: string;
  success: boolean;
  message: string;
  output?: string;
  error?: string;
  requiresConfirmation?: boolean;
  command?: string;
}

export interface ExtendedMessage extends ChatMessage {
  toolResult?: ToolResult;
  engine?: string;
  isStreaming?: boolean;
}

interface ConversationAreaProps {
  messages: ExtendedMessage[];
  interimTranscript?: string;
  silenceCountdown?: number | null;
  isThinking?: boolean;
  onAuthorizeTool?: (messageId: string, toolId: string, command?: string) => void;
}

export const ConversationArea: React.FC<ConversationAreaProps> = ({
  messages,
  interimTranscript,
  silenceCountdown,
  isThinking = false,
  onAuthorizeTool,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedOutputs, setExpandedOutputs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, interimTranscript, isThinking, silenceCountdown]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleOutput = (id: string) => {
    setExpandedOutputs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getToolIcon = (toolId?: string) => {
    if (!toolId) return <Terminal className="w-3.5 h-3.5 text-cyan-400" />;
    if (toolId.includes('terminal') || toolId.includes('command')) return <Terminal className="w-3.5 h-3.5 text-cyan-400" />;
    if (toolId.includes('folder') || toolId.includes('files')) return <Folder className="w-3.5 h-3.5 text-amber-400" />;
    if (toolId.includes('app')) return <Cpu className="w-3.5 h-3.5 text-purple-400" />;
    if (toolId.includes('python') || toolId.includes('code')) return <Code className="w-3.5 h-3.5 text-emerald-400" />;
    if (toolId.includes('url')) return <Globe className="w-3.5 h-3.5 text-sky-400" />;
    return <Terminal className="w-3.5 h-3.5 text-cyan-400" />;
  };

  return (
    <div
      ref={scrollRef}
      className="flex-1 w-full h-full overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin scrollbar-thumb-indigo-900/30 text-xs"
    >
      {/* Clean Stream of Messages */}
      {messages.map((msg) => {
        const isUser = msg.sender === 'user';
        const hasTool = Boolean(msg.toolResult);

        return (
          <div
            key={msg.id}
            className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} transition-all`}
          >
            {/* Message Bubble Container */}
            <div
              className={`relative max-w-[92%] rounded-2xl p-3.5 transition-all backdrop-blur-md ${
                isUser
                  ? 'bg-gradient-to-br from-purple-950/80 to-indigo-950/70 border border-purple-500/40 text-white rounded-br-sm shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                  : 'bg-black/75 border border-indigo-900/60 text-slate-200 rounded-bl-sm shadow-[0_0_20px_rgba(6,182,212,0.1)]'
              }`}
            >
              {/* Header inside Assistant Message */}
              {!isUser && (
                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-indigo-900/40 text-[10px] font-mono text-cyan-400">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full bg-cyan-500/20 border border-cyan-400/60 flex items-center justify-center">
                      <Sparkles className="w-2 h-2 text-cyan-300" />
                    </div>
                    <span className="font-orbitron font-bold tracking-wider text-white">ULTRON</span>
                    {msg.engine && (
                      <span className="text-[9px] text-slate-400 font-normal px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800">
                        {msg.engine}
                      </span>
                    )}
                  </div>
                  <span className="text-slate-500 text-[9px]">{msg.timestamp}</span>
                </div>
              )}

              {/* Message Text Content */}
              <div className="text-xs font-rajdhani font-medium leading-relaxed whitespace-pre-wrap break-words">
                {msg.text}
              </div>

              {/* Tool Execution Card (When Real Computer Operation is Performed) */}
              {hasTool && msg.toolResult && (
                <div className="mt-2.5 p-2.5 rounded-xl bg-slate-950/90 border border-cyan-500/40 font-mono text-[11px] shadow-inner">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0 pr-1">
                      <div className="p-1 rounded bg-cyan-950/60 border border-cyan-500/40 shrink-0">
                        {getToolIcon(msg.toolResult.toolId)}
                      </div>
                      <div className="truncate">
                        <div className="font-bold text-white tracking-wide truncate">
                          {msg.toolResult.toolName || 'System Tool'}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {msg.toolResult.requiresConfirmation ? (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] bg-amber-950/80 text-amber-300 border border-amber-500/50">
                          <AlertCircle className="w-2.5 h-2.5" />
                          CONFIRM
                        </span>
                      ) : msg.toolResult.success ? (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] bg-emerald-950/80 text-emerald-300 border border-emerald-500/50">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          DONE
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] bg-rose-950/80 text-rose-300 border border-rose-500/50">
                          <AlertCircle className="w-2.5 h-2.5" />
                          FAILED
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Confirmation Action Button */}
                  {msg.toolResult.requiresConfirmation && onAuthorizeTool && (
                    <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] text-amber-200">
                        Approve execution?
                      </span>
                      <button
                        onClick={() =>
                          onAuthorizeTool(
                            msg.id,
                            msg.toolResult?.toolId || '',
                            msg.toolResult?.command
                          )
                        }
                        className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[10px] flex items-center gap-1 shadow-sm transition-all"
                      >
                        <Play className="w-2.5 h-2.5" />
                        Authorize
                      </button>
                    </div>
                  )}

                  {/* Expandable Console Output */}
                  {msg.toolResult.output && (
                    <div className="mt-2 pt-1.5 border-t border-slate-800/80">
                      <button
                        onClick={() => toggleOutput(msg.id)}
                        className="flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        {expandedOutputs[msg.id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        <span>{expandedOutputs[msg.id] ? 'Hide output' : 'Show terminal output'}</span>
                      </button>

                      {expandedOutputs[msg.id] && (
                        <div className="relative mt-1.5 p-2 rounded bg-black/90 border border-slate-800 text-[10px] font-mono text-slate-300 max-h-40 overflow-y-auto whitespace-pre-wrap">
                          <button
                            onClick={() => copyToClipboard(msg.toolResult?.output || '', msg.id + '-out')}
                            className="absolute top-1 right-1 p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                            title="Copy output"
                          >
                            {copiedId === msg.id + '-out' ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                          </button>
                          {msg.toolResult.output}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* User Timestamp */}
              {isUser && (
                <div className="text-right text-[9px] text-purple-300/70 mt-1 font-mono">
                  {msg.timestamp}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Interim Live Speech Bubble */}
      {interimTranscript && (
        <div className="flex flex-col items-end animate-fade-in">
          <div className="max-w-[90%] rounded-2xl p-3 bg-purple-950/40 border border-purple-400/50 text-purple-200 rounded-br-sm backdrop-blur-md shadow-md">
            <div className="flex items-center gap-1.5 mb-1 text-[10px] font-mono text-cyan-400">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span>LISTENING...</span>
              {silenceCountdown !== null && silenceCountdown !== undefined && (
                <span className="ml-auto text-[9px] px-1.5 py-0.2 rounded bg-amber-950/70 text-amber-300 border border-amber-500/40">
                  {silenceCountdown}s auto-send
                </span>
              )}
            </div>
            <p className="text-xs font-rajdhani italic">{interimTranscript}</p>
          </div>
        </div>
      )}

      {/* AI Processing / Thinking Indicator */}
      {isThinking && (
        <div className="flex items-center gap-2 py-1.5 text-[11px] font-mono text-cyan-400 animate-pulse">
          <div className="w-5 h-5 rounded-full bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center">
            <RotateCw className="w-3 h-3 animate-spin text-cyan-400" />
          </div>
          <span>ULTRON executing...</span>
        </div>
      )}
    </div>
  );
};
