type VoiceStateCallback = (state: 'idle' | 'listening' | 'speaking' | 'error') => void;
type TranscriptCallback = (text: string, isFinal: boolean) => void;
type AudioLevelCallback = (level: number) => void;

class VoiceService {
  private recognition: any = null;
  private isListening = false;
  private isSpeaking = false;
  private onStateChange: VoiceStateCallback | null = null;
  private onTranscript: TranscriptCallback | null = null;
  private onAudioLevel: AudioLevelCallback | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private animFrameId: number | null = null;
  private continuousMode = false;

  constructor() {
    this.initRecognition();
  }

  private initRecognition() {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.isListening = true;
        this.onStateChange?.('listening');
      };

      this.recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (final) {
          this.onTranscript?.(final.trim(), true);
          if (!this.continuousMode) {
            this.stopListening();
          }
        } else if (interim) {
          this.onTranscript?.(interim.trim(), false);
        }
      };

      this.recognition.onerror = () => {
        this.isListening = false;
        this.onStateChange?.('error');
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (this.continuousMode) {
          try {
            this.recognition.start();
          } catch {}
        } else {
          this.onStateChange?.('idle');
          this.stopAudioAnalysis();
        }
      };
    }
  }

  setCallbacks(
    onState: VoiceStateCallback,
    onTranscript: TranscriptCallback,
    onAudioLevel?: AudioLevelCallback
  ) {
    this.onStateChange = onState;
    this.onTranscript = onTranscript;
    this.onAudioLevel = onAudioLevel || null;
  }

  setContinuousMode(enabled: boolean) {
    this.continuousMode = enabled;
  }

  getContinuousMode() {
    return this.continuousMode;
  }

  async startListening(): Promise<boolean> {
    if (this.isSpeaking) {
      this.stopSpeaking();
    }

    if (!this.recognition) {
      this.onStateChange?.('error');
      return false;
    }

    try {
      this.recognition.start();
      await this.startAudioAnalysis();
      return true;
    } catch {
      return false;
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
    this.isListening = false;
    this.stopAudioAnalysis();
    this.onStateChange?.('idle');
  }

  toggleListening() {
    if (this.isListening) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }

  speak(text: string, onFinish?: () => void) {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      onFinish?.();
      return;
    }

    this.stopSpeaking();

    // Clean markdown stars/bullets before reading
    const cleanText = text
      .replace(/[*#`_~]/g, '')
      .replace(/\[.*?\]/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 0.95; // Slightly deeper, futuristic cadence

    const voices = window.speechSynthesis.getVoices();
    // Prefer English natural or male/robot style voice
    const preferredVoice = voices.find(
      (v) =>
        (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Alex') || v.name.includes('Daniel')) &&
        v.lang.startsWith('en')
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    let speakInterval: number | null = null;

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.onStateChange?.('speaking');
      // Emit voice cadence audio level to dynamically accelerate 3D orbital rings while ULTRON speaks
      speakInterval = window.setInterval(() => {
        if (!this.isSpeaking) return;
        const voiceLevel = 0.3 + Math.random() * 0.5;
        this.onAudioLevel?.(voiceLevel);
      }, 75);
    };

    utterance.onend = () => {
      if (speakInterval) clearInterval(speakInterval);
      this.onAudioLevel?.(0);
      this.isSpeaking = false;
      this.onStateChange?.('idle');
      onFinish?.();
    };

    utterance.onerror = () => {
      if (speakInterval) clearInterval(speakInterval);
      this.onAudioLevel?.(0);
      this.isSpeaking = false;
      this.onStateChange?.('idle');
      onFinish?.();
    };

    window.speechSynthesis.speak(utterance);
  }

  stopSpeaking() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
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
        this.onAudioLevel?.(normalized);

        this.animFrameId = requestAnimationFrame(checkLevel);
      };

      checkLevel();
    } catch {
      // Audio capture permission might not be granted; fallback to silent level
      this.onAudioLevel?.(0.2);
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
    this.onAudioLevel?.(0);
  }
}

export const voiceService = new VoiceService();
