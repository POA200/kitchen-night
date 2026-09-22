/**
 * Web Audio Arcade Sound Effects for Kitchen Night
 * Synthesizes crisp, zero-latency chimes natively in the browser without external assets.
 */

class SoundEffects {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  constructor() {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("kn_sound_muted");
        if (saved !== null) {
          this.muted = saved === "true";
        }
      } catch {
        this.muted = false;
      }
    }
  }

  /**
   * Must be called during a user interaction (click/tap) to unlock AudioContext
   * in browsers with strict autoplay policies (Chrome, Safari, Brave).
   */
  init(): AudioContext | null {
    if (typeof window === "undefined") return null;
    try {
      if (!this.ctx) {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        if (AudioContextClass) {
          this.ctx = new AudioContextClass();
        }
      }
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  isMuted(): boolean {
    return this.muted;
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("kn_sound_muted", String(muted));
      } catch {
        // Ignore
      }
    }
  }

  toggleMute(): boolean {
    const next = !this.muted;
    this.setMuted(next);
    if (!next) {
      this.playTestSound();
    }
    return next;
  }

  /**
   * Quick test sound when toggling audio in Header
   */
  playTestSound() {
    if (this.muted) return;
    try {
      const ctx = this.init();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(659.25, now); // E5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.1); // A5

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // Ignore
    }
  }

  /**
   * Oven Ding / Bake Completed Sound:
   * Cheerful resonant bell chime on successful on-chain bake confirmation.
   */
  playBakeSuccess() {
    if (this.muted) return;
    try {
      const ctx = this.init();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Primary chime oscillator (D5 - 587 Hz ramping to A5 - 880 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(587.33, now);
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12);

      gain1.gain.setValueAtTime(0.35, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.7);

      // Harmonizing high sparkle (E6 - 1318.5 Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(1174.66, now + 0.06);
      osc2.frequency.exponentialRampToValueAtTime(1318.51, now + 0.18);

      gain2.gain.setValueAtTime(0.2, now + 0.06);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc2.start(now + 0.06);
      osc2.stop(now + 0.8);
    } catch {
      // Gracefully ignore audio failure
    }
  }

  /**
   * Gear Equip / Tool Upgrade Sound:
   * Quick rising arcade arpeggio when unlocking or equipping a utensil.
   */
  playEquipSuccess() {
    if (this.muted) return;
    try {
      const ctx = this.init();
      if (!ctx) return;

      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

      notes.forEach((freq, idx) => {
        const startTime = now + idx * 0.06;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.25, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.28);
      });
    } catch {
      // Gracefully ignore audio failure
    }
  }
}

export const soundEffects = new SoundEffects();
