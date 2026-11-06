import React, { useState, useRef } from 'react';
import { Mic, Send, Square, Radio } from 'lucide-react';
import { OrbState } from '../types';

interface MinimalChatInputProps {
  onSendMessage: (text: string) => void;
  onToggleVoice: () => void;
  onStopGeneration?: () => void;
  isListening: boolean;
  isThinking: boolean;
  isSpeaking: boolean;
  orbState: OrbState;
  silenceCountdown: number | null;
  continuousMode: boolean;
  onToggleContinuous: () => void;
}

export const MinimalChatInput: React.FC<MinimalChatInputProps> = ({
  onSendMessage,
  onToggleVoice,
  onStopGeneration,
  isListening,
  isThinking,
  orbState,
  silenceCountdown,
  continuousMode,
  onToggleContinuous,
}) => {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isThinking) return;
    onSendMessage(text.trim());
    setText('');
  };

  return (
    <div className="w-full px-3 py-3 border-t border-indigo-950/60 bg-black/40">
      {/* Silence Countdown Feedback Badge */}
      {silenceCountdown !== null && silenceCountdown !== undefined && (
        <div className="flex items-center justify-center mb-2 animate-fade-in">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/90 border border-cyan-400/60 shadow-[0_0_12px_rgba(6,182,212,0.3)] text-[11px] font-mono text-cyan-200">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span>Silence detected — auto-send in</span>
            <span className="font-bold text-amber-300 text-xs">{silenceCountdown}s</span>
          </div>
        </div>
      )}

      {/* Chat Input Bar */}
      <form
        onSubmit={handleSubmit}
        className="relative flex items-center gap-2 p-1.5 rounded-full bg-slate-950/90 border border-indigo-900/60 focus-within:border-cyan-500/60 shadow-lg backdrop-blur-xl transition-all"
      >
        {/* Microphone Button with Dynamic Voice Glow */}
        <button
          type="button"
          onClick={onToggleVoice}
          title={isListening ? 'Click to stop listening' : 'Click to start voice listening'}
          className={`relative p-2.5 rounded-full flex items-center justify-center shrink-0 transition-all ${
            isListening
              ? 'bg-rose-600 text-white shadow-[0_0_15px_rgba(225,29,72,0.6)] animate-pulse'
              : 'bg-indigo-950/70 hover:bg-purple-900/50 text-cyan-400 hover:text-white border border-indigo-800/40 hover:border-cyan-400/50'
          }`}
        >
          <Mic className="w-4 h-4" />
          {isListening && (
            <span className="absolute -inset-1 rounded-full border border-rose-500/50 animate-ping pointer-events-none" />
          )}
        </button>

        {/* Text Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            isListening
              ? 'Listening to speech (5s silence auto-submits)...'
              : 'Ask ULTRON or speak a command...'
          }
          disabled={isThinking}
          className="flex-1 min-w-0 bg-transparent px-2 py-1 text-xs font-rajdhani font-medium text-slate-100 placeholder-slate-500 focus:outline-none"
        />

        {/* Continuous Voice Toggle Pill */}
        <button
          type="button"
          onClick={onToggleContinuous}
          title="Toggle Continuous Voice Listening"
          className={`hidden md:flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-mono border shrink-0 transition-all ${
            continuousMode
              ? 'bg-cyan-950/70 border-cyan-400/60 text-cyan-300'
              : 'bg-black/50 border-slate-800 text-slate-500 hover:text-slate-300'
          }`}
        >
          <Radio className="w-2.5 h-2.5 text-cyan-400" />
          <span>{continuousMode ? 'CONT' : 'OFF'}</span>
        </button>

        {/* Stop Generation Button (When thinking) */}
        {isThinking && onStopGeneration && (
          <button
            type="button"
            onClick={onStopGeneration}
            title="Stop AI response generation"
            className="p-2 rounded-full bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-500/50 transition-all shrink-0 shadow-md"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
          </button>
        )}

        {/* Send Button */}
        {!isThinking && (
          <button
            type="submit"
            disabled={!text.trim()}
            title="Send Message"
            className={`p-2 rounded-full transition-all shrink-0 flex items-center justify-center ${
              text.trim()
                ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.4)] hover:opacity-95'
                : 'bg-slate-900/60 text-slate-600 cursor-not-allowed border border-slate-800/40'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        )}
      </form>
    </div>
  );
};
