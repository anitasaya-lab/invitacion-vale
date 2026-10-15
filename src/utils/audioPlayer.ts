// Audio Player supporting HTML5 Audio element with mobile compatibility and unlock
class MusicPlayer {
  private audio: HTMLAudioElement | null = null;
  private isPlaying: boolean = false;
  private audioContext: AudioContext | null = null;
  private isInitialized: boolean = false;
  private listeners: ((playing: boolean) => void)[] = [];

  constructor() {
    // Only initialize in browser environment
    if (typeof window !== 'undefined') {
      this.initAudioElement();
      this.setupGlobalUnlockListener();
    }
  }

  private initAudioElement() {
    if (this.audio) return;
    try {
      this.audio = new Audio('/audio/celebration.mp3');
      this.audio.loop = true;
      this.audio.preload = 'auto';
      this.audio.volume = 0.65;

      this.audio.addEventListener('play', () => {
        this.isPlaying = true;
        this.notifyListeners();
      });

      this.audio.addEventListener('pause', () => {
        this.isPlaying = false;
        this.notifyListeners();
      });

      this.audio.addEventListener('ended', () => {
        if (!this.audio?.loop) {
          this.isPlaying = false;
          this.notifyListeners();
        }
      });

      this.audio.addEventListener('error', (e) => {
        console.warn('Audio element error, will fallback if necessary:', e);
      });
    } catch (e) {
      console.warn('Failed to initialize Audio element:', e);
    }
  }

  // Pre-unlocks Web Audio Context on mobile touch
  private setupGlobalUnlockListener() {
    if (typeof window === 'undefined') return;

    const unlock = () => {
      if (this.isInitialized) return;
      this.isInitialized = true;

      // Unlock AudioContext if needed
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          if (!this.audioContext) {
            this.audioContext = new AudioCtx();
          }
          if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
          }
        }
      } catch (err) {
        // ignore
      }

      // Preload audio
      if (this.audio) {
        this.audio.load();
      }

      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('touchend', unlock);
      window.removeEventListener('click', unlock);
    };

    window.addEventListener('touchstart', unlock, { passive: true });
    window.addEventListener('touchend', unlock, { passive: true });
    window.addEventListener('click', unlock, { passive: true });
  }

  public subscribe(cb: (playing: boolean) => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((cb) => cb(this.isPlaying));
  }

  public getStatus(): boolean {
    return this.isPlaying;
  }

  public async play(): Promise<boolean> {
    this.initAudioElement();
    if (!this.audio) return false;

    try {
      if (this.audioContext && this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      await this.audio.play();
      this.isPlaying = true;
      this.notifyListeners();
      return true;
    } catch (err) {
      console.warn('Playback prevented by browser policy (user interaction required):', err);
      this.isPlaying = false;
      this.notifyListeners();
      return false;
    }
  }

  public stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.isPlaying = false;
      this.notifyListeners();
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.play();
      return true;
    }
  }

  // Celebratory chime when submitting RSVP or throwing confetti
  public playCelebrationChime() {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.audioContext) {
        this.audioContext = new AudioCtx();
      }
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      const ctx = this.audioContext;
      const now = ctx.currentTime;
      const master = ctx.createGain();
      master.gain.value = 0.2;
      master.connect(ctx.destination);

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        noteGain.gain.setValueAtTime(0.001, now + idx * 0.08);
        noteGain.gain.linearRampToValueAtTime(0.2, now + idx * 0.08 + 0.03);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.7);

        osc.connect(noteGain);
        noteGain.connect(master);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.75);
      });
    } catch (e) {
      // ignore
    }
  }
}

export const musicPlayer = new MusicPlayer();
