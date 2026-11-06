import { OrbState } from '../types';

export type VoiceState = OrbState;

export interface VoiceAssistantCallbacks {
  onStateChange: (state: VoiceState) => void;
  onTranscriptUpdate: (interim: string, isFinal: boolean) => void;
  onSilenceCountdown: (secondsRemaining: number | null) => void;
  onSubmitVoice: (fullTranscript: string) => void;
  onAudioLevel?: (level: number) => void;
  onError?: (errMessage: string) => void;
}

class VoiceAssistantService {
  private recognition: any = null;
  private isListening = false;
  private isSpeaking = false;
  private continuousMode = true; // Default continuous listening
  private silenceTimeoutSeconds = 5; // Default 5 seconds as requested
  private silenceTimer: number | null = null;
  private countdownInterval: number | null = null;
  private currentTranscript = '';
  private lastSpeechTimestamp = 0;
  private callbacks: VoiceAssistantCallbacks | null = null;

  // Web Audio API for actual microphone frequency / voice activity
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private animFrameId: number | null = null;
  private currentAudioElement: HTMLAudioElement | null = null;

  constructor() {
    this.initSpeechRecognition();
  }

  private initSpeechRecognition() {
    if (typeof window === 'undefined') return;

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRec) {
      this.recognition = new SpeechRec();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.isListening = true;
        this.callbacks?.onStateChange('listening');
      };

      this.recognition.onresult = (event: any) => {
        let interimText = '';
        let finalText = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalText += event.results[i][0].transcript + ' ';
          } else {
            interimText += event.results[i][0].transcript;
          }
        }

        if (finalText) {
          this.currentTranscript += ' ' + finalText.trim();
          this.currentTranscript = this.currentTranscript.trim();
        }

        const combined = (this.currentTranscript + ' ' + interimText).trim();
        if (combined) {
          this.lastSpeechTimestamp = Date.now();
          this.callbacks?.onTranscriptUpdate(combined, false);
          // Restart 5-second silence countdown whenever new speech is heard!
          this.resetSilenceCountdown();
        }
      };

      this.recognition.onerror = (e: any) => {
        // 'no-speech' is benign during pauses in continuous listening
        if (e.error === 'no-speech') {
          return;
        }
        if (e.error === 'not-allowed') {
          this.callbacks?.onError?.('Microphone access denied. Please grant microphone permissions.');
        }
        this.callbacks?.onStateChange('idle');
      };

      this.recognition.onend = () => {
        // If continuous mode is enabled and user hasn't explicitly stopped, restart listening
        if (this.isListening && !this.isSpeaking) {
          try {
            this.recognition.start();
          } catch {}
        } else {
          this.callbacks?.onStateChange('idle');
        }
      };
    }
  }

  setCallbacks(cbs: VoiceAssistantCallbacks) {
    this.callbacks = cbs;
  }

  setContinuousMode(enabled: boolean) {
    this.continuousMode = enabled;
  }

  getContinuousMode() {
    return this.continuousMode;
  }

  setSilenceTimeout(seconds: number) {
    this.silenceTimeoutSeconds = Math.max(2, Math.min(15, seconds));
  }

  getSilenceTimeout() {
    return this.silenceTimeoutSeconds;
  }

  /**
   * Resets and starts the 5-second silence countdown timer.
   * If silence continues for the full duration, it triggers automatic voice message submission.
   */
  private resetSilenceCountdown() {
    this.clearSilenceCountdown();

    let remaining = this.silenceTimeoutSeconds;
    this.callbacks?.onSilenceCountdown(remaining);

    this.countdownInterval = window.setInterval(() => {
      remaining -= 1;
      if (remaining > 0) {
        this.callbacks?.onSilenceCountdown(remaining);
      } else {
        this.callbacks?.onSilenceCountdown(0);
      }
    }, 1000);

    this.silenceTimer = window.setTimeout(() => {
      this.clearSilenceCountdown();
      const textToSubmit = this.currentTranscript.trim();
      if (textToSubmit) {
        this.currentTranscript = '';
        this.callbacks?.onTranscriptUpdate('', true);
        this.callbacks?.onSubmitVoice(textToSubmit);
      }
    }, this.silenceTimeoutSeconds * 1000);
  }

  private clearSilenceCountdown() {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
    this.callbacks?.onSilenceCountdown(null);
  }

  async startListening(): Promise<boolean> {
    if (this.isSpeaking) {
      this.stopSpeaking();
    }

    if (!this.recognition) {
      this.callbacks?.onError?.('Speech recognition is not supported in this browser. You can type queries directly.');
      return false;
    }

    this.currentTranscript = '';
    this.clearSilenceCountdown();

    try {
      this.isListening = true;
      this.recognition.start();
      await this.startAudioAnalysis();
      this.callbacks?.onStateChange('listening');
      return true;
    } catch (e: any) {
      // If already started, that's fine
      this.callbacks?.onStateChange('listening');
      return true;
    }
  }

  stopListening() {
    this.isListening = false;
    this.clearSilenceCountdown();
    this.currentTranscript = '';
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
    }
    this.stopAudioAnalysis();
    this.callbacks?.onTranscriptUpdate('', true);
    this.callbacks?.onStateChange('idle');
  }

  toggleListening() {
    if (this.isListening) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }

  getIsListening() {
    return this.isListening;
  }

  /**
   * Synthesize and speak response
   */
  async speak(text: string, onFinish?: () => void) {
    this.stopSpeaking();

    // Temporarily pause recognition while speaking to prevent feedback loop
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {}
    }

    const cleanText = text
      .replace(/[*#`_~]/g, '')
      .replace(/\[.*?\]/g, '')
      .replace(/https?:\/\/\S+/g, 'link')
      .trim();

    this.isSpeaking = true;
    this.callbacks?.onStateChange('speaking');

    // 1. Try ElevenLabs API
    try {
      const res = await fetch('/api/voice/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText, voiceId: '1SM7GgM6IMuvQlz2BwM3' }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('audio/mpeg')) {
        const blob = await res.blob();
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        this.currentAudioElement = audio;

        let speakInterval: number | null = null;
        speakInterval = window.setInterval(() => {
          if (!this.isSpeaking) return;
          this.callbacks?.onAudioLevel?.(0.25 + Math.random() * 0.45);
        }, 80);

        audio.onended = () => {
          if (speakInterval) clearInterval(speakInterval);
          URL.revokeObjectURL(audioUrl);
          this.currentAudioElement = null;
          this.onSpeechFinished(onFinish);
        };

        audio.onerror = () => {
          if (speakInterval) clearInterval(speakInterval);
          this.speakBrowserFallback(cleanText, onFinish);
        };

        await audio.play();
        return;
      }
    } catch {}

    // 2. Fallback to Browser SpeechSynthesis
    this.speakBrowserFallback(cleanText, onFinish);
  }

  private speakBrowserFallback(text: string, onFinish?: () => void) {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      this.onSpeechFinished(onFinish);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 0.95;

    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) =>
        (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Alex') || v.name.includes('David')) &&
        v.lang.startsWith('en')
    );
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    let interval: number | null = null;

    utterance.onstart = () => {
      interval = window.setInterval(() => {
        if (!this.isSpeaking) return;
        this.callbacks?.onAudioLevel?.(0.25 + Math.random() * 0.5);
      }, 75);
    };

    utterance.onend = () => {
      if (interval) clearInterval(interval);
      this.onSpeechFinished(onFinish);
    };

    utterance.onerror = () => {
      if (interval) clearInterval(interval);
      this.onSpeechFinished(onFinish);
    };

    window.speechSynthesis.speak(utterance);
  }

  private onSpeechFinished(onFinish?: () => void) {
    this.isSpeaking = false;
    this.callbacks?.onAudioLevel?.(0);
    this.callbacks?.onStateChange('idle');
    onFinish?.();

    // If continuous mode is enabled, resume listening automatically
    if (this.continuousMode && this.isListening) {
      try {
        this.recognition.start();
        this.callbacks?.onStateChange('listening');
      } catch {}
    }
  }

  stopSpeaking() {
    if (this.currentAudioElement) {
      this.currentAudioElement.pause();
      this.currentAudioElement = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
    this.callbacks?.onAudioLevel?.(0);
  }

  private async startAudioAnalysis() {
    try {
      if (!navigator.mediaDevices?.getUserMedia) return;
      this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioCtx();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 64;

      const source = this.audioContext.createMediaStreamSource(this.micStream);
      source.connect(this.analyser);

      const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

      const checkLevel = () => {
        if (!this.analyser || !this.isListening) return;
        this.analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(1, avg / 128);
        this.callbacks?.onAudioLevel?.(normalized);

        this.animFrameId = requestAnimationFrame(checkLevel);
      };

      checkLevel();
    } catch {
      this.callbacks?.onAudioLevel?.(0.15);
    }
  }

  private stopAudioAnalysis() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach((t) => t.stop());
      this.micStream = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
    this.callbacks?.onAudioLevel?.(0);
  }
}

export const voiceAssistant = new VoiceAssistantService();
