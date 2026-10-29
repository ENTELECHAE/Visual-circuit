/**
 * Web Audio API manager for synthesized Piezo Buzzer audio.
 */
class AudioManager {
  private ctx: AudioContext | null = null;
  private osc: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private currentFrequency = 0;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public playTone(freq: number) {
    if (freq <= 20 || freq > 20000) {
      this.stopTone();
      return;
    }

    try {
      this.initContext();
      if (!this.ctx) return;

      if (!this.osc) {
        this.osc = this.ctx.createOscillator();
        this.gainNode = this.ctx.createGain();

        // Square wave or triangle produces authentic piezo buzzer tone
        this.osc.type = 'triangle';
        this.gainNode.gain.setValueAtTime(0.08, this.ctx.currentTime); // Comfortable volume

        this.osc.connect(this.gainNode);
        this.gainNode.connect(this.ctx.destination);
        this.osc.start();
      }

      this.osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      this.currentFrequency = freq;
    } catch {
      // Audio playback blocked or uninitialized
    }
  }

  public stopTone() {
    if (this.osc) {
      try {
        this.osc.stop();
        this.osc.disconnect();
      } catch {}
      this.osc = null;
    }
    if (this.gainNode) {
      try {
        this.gainNode.disconnect();
      } catch {}
      this.gainNode = null;
    }
    this.currentFrequency = 0;
  }

  public getFrequency(): number {
    return this.currentFrequency;
  }
}

export const audioManager = new AudioManager();

