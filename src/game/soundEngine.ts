/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Web Audio API Subterranean Bio-Acoustic Sound Engine
 * Synthesizes 50-kHz frequency-shifted prosocial trills, 22-kHz alarm resonance,
 * stone chisel excavation hits, and royal decree chords.
 */

class SubterraneanSoundEngine {
  private ctx: AudioContext | null = null;
  public muted: boolean = false;

  private ensureContext(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /** Pitch-shifted representation of a 50-kHz appetitive ultrasonic trill */
  public play50kHzProsocialTrill() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.07);
    osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.14);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.17);
  }

  /** Deep earthen stone excavation thud + crystalline chime */
  public playExcavationUpgrade() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Low stone thud
    const oscLow = ctx.createOscillator();
    const gainLow = ctx.createGain();
    oscLow.type = 'triangle';
    oscLow.frequency.setValueAtTime(140, now);
    oscLow.frequency.exponentialRampToValueAtTime(52, now + 0.18);
    gainLow.gain.setValueAtTime(0.16, now);
    gainLow.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    oscLow.connect(gainLow);
    gainLow.connect(ctx.destination);
    oscLow.start(now);
    oscLow.stop(now + 0.21);

    // Harmonicamber chime
    const oscHigh = ctx.createOscillator();
    const gainHigh = ctx.createGain();
    oscHigh.type = 'sine';
    oscHigh.frequency.setValueAtTime(523.25, now + 0.05);
    oscHigh.frequency.exponentialRampToValueAtTime(783.99, now + 0.22);
    gainHigh.gain.setValueAtTime(0.08, now + 0.05);
    gainHigh.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
    oscHigh.connect(gainHigh);
    gainHigh.connect(ctx.destination);
    oscHigh.start(now + 0.05);
    oscHigh.stop(now + 0.27);
  }

  /** Royal pheromone decree chord */
  public playRoyalDecreeChord() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const freqs = [293.66, 440, 554.37, 659.25]; // D major 9th subterranean resonance
    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + idx * 0.025);
      gain.gain.setValueAtTime(0.06, now + idx * 0.025);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.025);
      osc.stop(now + 0.46);
    });
  }

  /** 22-kHz warning pulse */
  public play22kHzAlarmPulse() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(195, now + 0.25);

    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.27);
  }
}

export const soundEngine = new SubterraneanSoundEngine();
