// Optional, strictly opt-in Web Audio ambient accompaniment & Web Speech narration.
// Never autoplays without user consent. Note: sound is an artistic planetarium dome accompaniment, not vacuum propagation.

class PlanetariumAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isAmbientPlaying = false;

  public startAmbient(): void {
    if (typeof window === 'undefined' || this.isAmbientPlaying) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.ctx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.04;
        this.masterGain.connect(this.ctx.destination);

        // Warm harmonic fifth drone (D2 + A2 + F#3)
        const freqs = [73.42, 110.0, 185.0];
        for (const f of freqs) {
          const osc = this.ctx.createOscillator();
          const filter = this.ctx.createBiquadFilter();
          osc.type = 'sine';
          osc.frequency.value = f;
          filter.type = 'lowpass';
          filter.frequency.value = 320;
          osc.connect(filter);
          filter.connect(this.masterGain);
          osc.start();
        }
      }
      if (this.ctx.state === 'suspended') {
        void this.ctx.resume();
      }
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setTargetAtTime(0.035, this.ctx.currentTime, 0.6);
      }
      this.isAmbientPlaying = true;
    } catch {
      // Gracefully ignore in restricted audio environments
    }
  }

  public stopAmbient(): void {
    if (!this.ctx || !this.masterGain) {
      this.isAmbientPlaying = false;
      return;
    }
    try {
      this.masterGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.3);
      this.isAmbientPlaying = false;
    } catch {
      this.isAmbientPlaying = false;
    }
  }

  public speakNarration(text: string, enabled: boolean): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (!enabled || !text) return;
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.96;
      utterance.pitch = 0.98;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignore if speech synthesis unsupported
    }
  }

  public cancelNarration(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const audioEngine = new PlanetariumAudioEngine();
