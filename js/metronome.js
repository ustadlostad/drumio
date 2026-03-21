/**
 * metronome.js — Drumio Metronome
 *
 * Uses the Web Audio API "look-ahead clock" pattern for accurate timing.
 * All sounds are synthesised — no audio files required.
 */

// ─── Constants ────────────────────────────────────────────────────

const BPM_MIN = 20;
const BPM_MAX = 300;
const SCHEDULE_AHEAD = 0.1;   // seconds to look ahead
const SCHEDULER_INTERVAL = 25; // ms between scheduler ticks

// ─── Time Signatures ──────────────────────────────────────────────
// To add more time signatures in the future, simply append entries here.
// beats      – total pulses per bar
// noteValue  – denominator (4 = quarter, 8 = eighth)
// accentBeats – 0-indexed pulse positions that receive the accent sound
const TIME_SIGNATURES = [
  { id: "4/4",  label: "4/4",  beats: 4,  noteValue: 4, accentBeats: [0] },
  { id: "3/4",  label: "3/4",  beats: 3,  noteValue: 4, accentBeats: [0] },
  { id: "2/4",  label: "2/4",  beats: 2,  noteValue: 4, accentBeats: [0] },
  { id: "6/8",  label: "6/8",  beats: 6,  noteValue: 8, accentBeats: [0, 3] },
  { id: "12/8", label: "12/8", beats: 12, noteValue: 8, accentBeats: [0, 3, 6, 9] },
];

// ─── Sound Synthesisers ───────────────────────────────────────────

/** Returns a short noise buffer */
function makeNoiseBuffer(ctx) {
  const bufferSize = ctx.sampleRate * 0.05;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

const SOUNDS = {
  click: (ctx, time, isAccent) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(isAccent ? 1800 : 1200, time);
    gain.gain.setValueAtTime(isAccent ? 0.8 : 0.5, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + 0.05);
  },

  woodblock: (ctx, time, isAccent) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(isAccent ? 900 : 700, time);
    osc.frequency.exponentialRampToValueAtTime(isAccent ? 300 : 200, time + 0.06);
    gain.gain.setValueAtTime(isAccent ? 1.0 : 0.7, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + 0.1);
  },

  hihat: (ctx, time, isAccent) => {
    const noise = makeNoiseBuffer(ctx);
    const source = ctx.createBufferSource();
    source.buffer = noise;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = isAccent ? 10000 : 8000;
    filter.Q.value = 0.5;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(isAccent ? 1.0 : 0.6, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + (isAccent ? 0.1 : 0.06));
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start(time);
    source.stop(time + 0.15);
  },

  rimshot: (ctx, time, isAccent) => {
    // Sine tone + noise blend
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(400, time);
    oscGain.gain.setValueAtTime(isAccent ? 0.8 : 0.5, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.06);
    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + 0.07);

    const noise = makeNoiseBuffer(ctx);
    const src = ctx.createBufferSource();
    src.buffer = noise;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(isAccent ? 0.6 : 0.35, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
    src.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    src.start(time);
    src.stop(time + 0.06);
  },

  beep: (ctx, time, isAccent) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(isAccent ? 880 : 440, time);
    gain.gain.setValueAtTime(isAccent ? 0.7 : 0.45, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + 0.12);
  },
};

// ─── Metronome Class ──────────────────────────────────────────────

class Metronome {
  constructor() {
    this.bpm           = 100;
    this.isPlaying     = false;
    this.sound         = "click";
    this.timeSignature = TIME_SIGNATURES[0]; // default 4/4
    this.beatsPerBar   = this.timeSignature.beats;

    this._audioCtx      = null;
    this._nextBeatTime  = 0;
    this._currentBeat   = 0;   // 0-indexed within bar
    this._schedulerTimer = null;

    // Callbacks
    this.onBeat  = null; // (beatIndex, beatsPerBar, isAccent) => void
    this.onStart = null; // () => void
    this.onStop  = null; // () => void
  }

  // ─── Public API ─────────────────────────────────────────────────

  start() {
    if (this.isPlaying) return;
    if (!this._audioCtx) {
      this._audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this._audioCtx.state === "suspended") {
      this._audioCtx.resume();
    }
    this.isPlaying     = true;
    this._currentBeat  = 0;
    this._nextBeatTime = this._audioCtx.currentTime + 0.05;
    this._schedulerTimer = setInterval(() => this._schedule(), SCHEDULER_INTERVAL);
    if (this.onStart) this.onStart();
  }

  stop() {
    if (!this.isPlaying) return;
    clearInterval(this._schedulerTimer);
    this._schedulerTimer = null;
    this.isPlaying = false;
    if (this.onStop) this.onStop();
  }

  toggle() {
    this.isPlaying ? this.stop() : this.start();
  }

  setBpm(value) {
    this.bpm = Math.min(BPM_MAX, Math.max(BPM_MIN, Number(value)));
  }

  setSound(name) {
    if (SOUNDS[name]) this.sound = name;
  }

  setTimeSignature(id) {
    const sig = TIME_SIGNATURES.find(s => s.id === id);
    if (!sig) return;
    this.timeSignature = sig;
    this.beatsPerBar   = sig.beats;
    this._currentBeat  = 0;
  }

  /** Tap Tempo — call on each tap, returns updated BPM */
  tap() {
    const now = performance.now();
    if (!this._taps) this._taps = [];

    // Reset if last tap was > 3 s ago
    if (this._taps.length && now - this._taps[this._taps.length - 1] > 3000) {
      this._taps = [];
    }

    this._taps.push(now);
    if (this._taps.length > 8) this._taps.shift(); // keep last 8

    if (this._taps.length < 2) return this.bpm;

    const intervals = [];
    for (let i = 1; i < this._taps.length; i++) {
      intervals.push(this._taps[i] - this._taps[i - 1]);
    }
    const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const tapped = Math.round(60000 / avg);
    this.setBpm(tapped);
    return this.bpm;
  }

  // ─── Internal ───────────────────────────────────────────────────

  _schedule() {
    const ctx = this._audioCtx;
    while (this._nextBeatTime < ctx.currentTime + SCHEDULE_AHEAD) {
      const isAccent = this.timeSignature.accentBeats.includes(this._currentBeat);
      SOUNDS[this.sound](ctx, this._nextBeatTime, isAccent);

      // Fire visual callback slightly before the beat
      const delay = Math.max(0, (this._nextBeatTime - ctx.currentTime) * 1000 - 10);
      const beat  = this._currentBeat;
      const bpb   = this.beatsPerBar;
      setTimeout(() => {
        if (this.onBeat) this.onBeat(beat, bpb, isAccent);
      }, delay);

      this._nextBeatTime += (60 / this.bpm) * (4 / this.timeSignature.noteValue);
      this._currentBeat  = (this._currentBeat + 1) % this.beatsPerBar;
    }
  }
}

// ─── Export singleton ─────────────────────────────────────────────

const metronome = new Metronome();
