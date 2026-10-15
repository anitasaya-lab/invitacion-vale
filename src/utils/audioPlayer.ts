// Hybrid YouTube & HTML5 Audio Player for seamless background celebration music
declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: any;
  }
}

class MusicPlayer {
  private audio: HTMLAudioElement | null = null;
  private ytPlayer: any = null;
  private isYtReady: boolean = false;
  private isPlaying: boolean = false;
  private usingYouTube: boolean = false;
  private audioContext: AudioContext | null = null;
  private listeners: ((playing: boolean) => void)[] = [];
  private readonly ytVideoId = 'WIZ38JAh5CA'; // She Don't Give a FO - Duki ft. Khea (Instrumental)
  public readonly currentSongTitle = "Duki ft. Khea - She Don't Give a FO";

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAudioElement();
      this.initYouTubeApi();
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
        if (!this.usingYouTube) {
          this.isPlaying = true;
          this.notifyListeners();
        }
      });

      this.audio.addEventListener('pause', () => {
        if (!this.usingYouTube) {
          this.isPlaying = false;
          this.notifyListeners();
        }
      });
    } catch (e) {
      console.warn('Audio element initialization warning:', e);
    }
  }

  private initYouTubeApi() {
    if (typeof window === 'undefined') return;

    // Create container for YouTube Player if not already in DOM
    let container = document.getElementById('yt-music-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'yt-music-container';
      container.style.position = 'fixed';
      container.style.bottom = '0';
      container.style.left = '0';
      container.style.width = '1px';
      container.style.height = '1px';
      container.style.opacity = '0.01';
      container.style.pointerEvents = 'none';
      container.style.zIndex = '-9999';
      document.body.appendChild(container);
    }

    const createPlayer = () => {
      try {
        if (!window.YT || !window.YT.Player) return;
        this.ytPlayer = new window.YT.Player('yt-music-container', {
          height: '1',
          width: '1',
          videoId: this.ytVideoId,
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            loop: 1,
            playlist: this.ytVideoId,
            modestbranding: 1,
            playsinline: 1, // Crucial for iOS to prevent fullscreen video popup
            enablejsapi: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: (event: any) => {
              this.isYtReady = true;
              try {
                event.target.setVolume(70);
              } catch (e) {
                // ignore
              }
            },
            onStateChange: (event: any) => {
              if (window.YT) {
                if (event.data === window.YT.PlayerState.PLAYING) {
                  this.isPlaying = true;
                  this.usingYouTube = true;
                  // Pause HTML5 audio if YouTube took over
                  if (this.audio && !this.audio.paused) {
                    this.audio.pause();
                  }
                  this.notifyListeners();
                } else if (
                  event.data === window.YT.PlayerState.PAUSED ||
                  event.data === window.YT.PlayerState.ENDED
                ) {
                  if (this.usingYouTube) {
                    this.isPlaying = false;
                    this.notifyListeners();
                  }
                }
              }
            },
            onError: (err: any) => {
              console.warn('YouTube playback notice, switching to internal audio fallback:', err);
              this.usingYouTube = false;
              if (this.isPlaying) {
                this.audio?.play().catch(() => {});
              }
            },
          },
        });
      } catch (err) {
        console.warn('YouTube Player initialization notice:', err);
      }
    };

    if (window.YT && window.YT.Player) {
      createPlayer();
    } else {
      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        createPlayer();
      };

      // Load YouTube IFrame API script
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        tag.async = true;
        document.head.appendChild(tag);
      }
    }
  }

  // Pre-unlocks Web Audio / HTML5 audio on mobile touch
  private setupGlobalUnlockListener() {
    if (typeof window === 'undefined') return;

    const unlock = () => {
      // Pre-warm audio element for mobile browsers
      if (this.audio) {
        this.audio.load();
      }
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
      } catch (e) {
        // ignore
      }

      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('click', unlock);
    };

    window.addEventListener('touchstart', unlock, { passive: true });
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
    // 1. First attempt: YouTube player (exact video https://youtu.be/WIZ38JAh5CA)
    if (this.isYtReady && this.ytPlayer && typeof this.ytPlayer.playVideo === 'function') {
      try {
        this.ytPlayer.playVideo();
        this.usingYouTube = true;
        this.isPlaying = true;
        this.notifyListeners();
        return true;
      } catch (e) {
        console.warn('YouTube playVideo failed, trying HTML5 audio fallback:', e);
      }
    }

    // 2. High-fidelity HTML5 audio fallback (synthesized instrumental of She Don't Give a FO)
    this.initAudioElement();
    if (this.audio) {
      try {
        await this.audio.play();
        this.usingYouTube = false;
        this.isPlaying = true;
        this.notifyListeners();
        return true;
      } catch (err) {
        console.warn('Playback notice:', err);
        this.isPlaying = false;
        this.notifyListeners();
        return false;
      }
    }

    return false;
  }

  public stop(): void {
    this.isPlaying = false;
    if (this.ytPlayer && typeof this.ytPlayer.pauseVideo === 'function') {
      try {
        this.ytPlayer.pauseVideo();
      } catch (e) {
        // ignore
      }
    }
    if (this.audio) {
      this.audio.pause();
    }
    this.notifyListeners();
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

      const notes = [523.25, 659.25, 783.99, 1046.50];
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
