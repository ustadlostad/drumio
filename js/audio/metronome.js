/**
 * metronome.js — Drumio metronome engine
 *
 * Audio uses the Web Audio "look-ahead" pattern: a ticker schedules sounds
 * slightly ahead on the audio clock. Every scheduled step is queued, and a
 * requestAnimationFrame loop emits "step" events when the audio clock reaches
 * them, so visuals stay locked to what is heard and stop with the audio.
 *
 * Events (subscribe with metronome.on(type, fn)):
 *   start, stop
 *   step       { index, bar, pulse, sub, level, time }
 *   bpmchange  { bpm, source }   source: "user" | "trainer"
 *   config     {}                time signature or subdivision changed
 *   trainer    { active, done }  tempo trainer state changed
 */

import { SOUNDS } from "./sounds.js";

export const BPM_MIN = 20;
export const BPM_MAX = 300;

const LOOKAHEAD = 0.1;       // seconds of audio scheduled ahead
const TICK_INTERVAL = 25;    // ms between scheduler ticks
const MAX_QUEUE = 256;       // visual steps kept while the page is hidden

// To add a time signature, append an entry.
// beats       – pulses per bar
// noteValue   – pulse note value (4 = quarter, 8 = eighth); BPM is in quarter notes
// accentBeats – 0-indexed pulses that get the accent sound
export const TIME_SIGNATURES = [
  { id: "4/4",  beats: 4,  noteValue: 4, accentBeats: [0] },
  { id: "3/4",  beats: 3,  noteValue: 4, accentBeats: [0] },
  { id: "2/4",  beats: 2,  noteValue: 4, accentBeats: [0] },
  { id: "5/4",  beats: 5,  noteValue: 4, accentBeats: [0] },
  { id: "6/8",  beats: 6,  noteValue: 8, accentBeats: [0, 3] },
  { id: "7/8",  beats: 7,  noteValue: 8, accentBeats: [0, 2, 4] },
  { id: "12/8", beats: 12, noteValue: 8, accentBeats: [0, 3, 6, 9] },
];

// Clicks per pulse: 1 = off, 2 = eighths, 3 = triplets, 4 = sixteenths.
export const SUBDIVISIONS = [1, 2, 3, 4];

// Accent beats are loudest, subdivision clicks quietest.
const LEVEL_GAIN = { accent: 1, beat: 0.75, sub: 0.3 };

export function clampBpm(value) {
  return Math.min(BPM_MAX, Math.max(BPM_MIN, Math.round(value)));
}

/**
 * Calls fn every TICK_INTERVAL ms. Uses a Worker when possible because
 * browsers throttle main-thread timers in background tabs.
 */
function createTicker(fn) {
  try {
    const src = `let id = null;
      onmessage = (e) => {
        clearInterval(id);
        id = e.data === "start" ? setInterval(() => postMessage(0), ${TICK_INTERVAL}) : null;
      };`;
    const worker = new Worker(URL.createObjectURL(new Blob([src], { type: "text/javascript" })));
    worker.onmessage = fn;
    return { start: () => worker.postMessage("start"), stop: () => worker.postMessage("stop") };
  } catch {
    let id = null;
    return {
      start: () => { clearInterval(id); id = setInterval(fn, TICK_INTERVAL); },
      stop: () => { clearInterval(id); id = null; },
    };
  }
}

export class Metronome {
  constructor() {
    this.bpm = 100;
    this.sound = "click";
    this.timeSignature = TIME_SIGNATURES[0];
    this.subdivision = 1;
    this.isPlaying = false;

    this._ctx = null;
    this._levels = null;       // level -> GainNode
    this._listeners = {};
    this._queue = [];
    this._raf = 0;
    this._ticker = createTicker(() => this._schedule());
    this._taps = [];
    this._trainerConfig = null;
    this._trainer = null;      // running trainer state
  }

  // ─── Events ─────────────────────────────────────────────────────

  on(type, fn) {
    (this._listeners[type] ||= new Set()).add(fn);
    return () => this._listeners[type].delete(fn);
  }

  _emit(type, detail = {}) {
    this._listeners[type]?.forEach((fn) => fn(detail));
  }

  // ─── Transport ──────────────────────────────────────────────────

  start() {
    if (this.isPlaying) return;
    const ctx = this._ensureAudio();
    if (ctx.state !== "running") ctx.resume();

    this.isPlaying = true;
    this._index = 0;
    this._bar = 0;
    this._pulse = 0;
    this._sub = 0;
    this._nextTime = ctx.currentTime + 0.06;
    this._startTrainer();

    this._ticker.start();
    this._schedule();
    this._raf = requestAnimationFrame(this._frame);
    this._emit("start");
  }

  stop() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    this._ticker.stop();
    cancelAnimationFrame(this._raf);
    this._queue = [];
    this._stopTrainer();
    this._emit("stop");
  }

  toggle() {
    this.isPlaying ? this.stop() : this.start();
  }

  // ─── Settings ───────────────────────────────────────────────────

  setBpm(value, source = "user") {
    const bpm = Number(value);
    if (!Number.isFinite(bpm)) return;
    const clamped = clampBpm(bpm);
    if (clamped === this.bpm) return;
    this.bpm = clamped;
    this._emit("bpmchange", { bpm: clamped, source });
  }

  setSound(id) {
    if (SOUNDS[id]) this.sound = id;
  }

  setTimeSignature(id) {
    const sig = TIME_SIGNATURES.find((s) => s.id === id);
    if (!sig || sig === this.timeSignature) return;
    this.timeSignature = sig;
    this._restartBar();
  }

  setSubdivision(n) {
    if (!SUBDIVISIONS.includes(n) || n === this.subdivision) return;
    this.subdivision = n;
    this._restartBar();
  }

  /** The next scheduled step starts a new bar with the new settings. */
  _restartBar() {
    this._pulse = 0;
    this._sub = 0;
    this._emit("config");
  }

  /** Tap tempo: call on each tap, returns the resulting BPM. */
  tap() {
    const now = performance.now();
    if (this._taps.length && now - this._taps[this._taps.length - 1] > 2000) this._taps = [];
    this._taps.push(now);
    if (this._taps.length > 8) this._taps.shift();
    if (this._taps.length >= 2) {
      const span = this._taps[this._taps.length - 1] - this._taps[0];
      this.setBpm(60000 / (span / (this._taps.length - 1)));
    }
    return this.bpm;
  }

  // ─── Tempo trainer ──────────────────────────────────────────────

  /**
   * config: { step, everySeconds, target, returnToStart } or null to disable.
   * Applied at bar lines while playing; the start BPM is restored on stop.
   */
  setTrainer(config) {
    this._trainerConfig = config;
    if (this.isPlaying) {
      this._stopTrainer();
      this._startTrainer();
    }
  }

  get trainer() {
    return this._trainerConfig;
  }

  _startTrainer() {
    const cfg = this._trainerConfig;
    if (!cfg || cfg.step <= 0 || cfg.everySeconds <= 0 || cfg.target === this.bpm) {
      this._trainer = null;
      return;
    }
    this._trainer = {
      startBpm: this.bpm,
      direction: cfg.target > this.bpm ? 1 : -1,
      nextAt: this._nextTime + cfg.everySeconds,
      returning: false,
      done: false,
    };
    this._emit("trainer", { active: true, done: false });
  }

  _stopTrainer() {
    if (!this._trainer) return;
    const { startBpm } = this._trainer;
    this._trainer = null;
    this.setBpm(startBpm, "trainer");
    this._emit("trainer", { active: false, done: false });
  }

  _advanceTrainer(time) {
    const tr = this._trainer;
    const cfg = this._trainerConfig;
    if (!tr || tr.done || time < tr.nextAt) return;
    tr.nextAt += cfg.everySeconds;

    const goal = tr.returning ? tr.startBpm : cfg.target;
    const dir = tr.returning ? -tr.direction : tr.direction;
    let bpm = this.bpm + dir * cfg.step;
    if ((dir > 0 && bpm >= goal) || (dir < 0 && bpm <= goal)) {
      bpm = goal;
      if (cfg.returnToStart && !tr.returning) tr.returning = true;
      else tr.done = true;
    }
    this.setBpm(bpm, "trainer");
    if (tr.done) this._emit("trainer", { active: true, done: true });
  }

  // ─── Internals ──────────────────────────────────────────────────

  _ensureAudio() {
    if (this._ctx) return this._ctx;
    // iOS: play through the silent switch (Safari 16.4+).
    if (navigator.audioSession) {
      try { navigator.audioSession.type = "playback"; } catch { /* unsupported */ }
    }
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    this._levels = {};
    for (const [level, gain] of Object.entries(LEVEL_GAIN)) {
      const node = ctx.createGain();
      node.gain.value = gain;
      node.connect(ctx.destination);
      this._levels[level] = node;
    }
    this._ctx = ctx;
    return ctx;
  }

  _schedule() {
    if (!this.isPlaying) return;
    const ctx = this._ctx;
    const sig = this.timeSignature;

    while (this._nextTime < ctx.currentTime + LOOKAHEAD) {
      const time = this._nextTime;
      if (this._pulse === 0 && this._sub === 0) this._advanceTrainer(time);

      const level =
        this._sub > 0 ? "sub" : sig.accentBeats.includes(this._pulse) ? "accent" : "beat";
      SOUNDS[this.sound](ctx, this._levels[level], time, level === "accent");

      this._queue.push({
        index: this._index,
        bar: this._bar,
        pulse: this._pulse,
        sub: this._sub,
        level,
        time,
      });
      if (this._queue.length > MAX_QUEUE) this._queue.shift();

      // Advance to the next step.
      this._nextTime += (60 / this.bpm) * (4 / sig.noteValue) / this.subdivision;
      this._index++;
      if (++this._sub >= this.subdivision) {
        this._sub = 0;
        if (++this._pulse >= sig.beats) {
          this._pulse = 0;
          this._bar++;
        }
      }
    }
  }

  _frame = () => {
    if (!this.isPlaying) return;
    const ctx = this._ctx;
    const heardAt = ctx.currentTime - (ctx.outputLatency || 0) - (ctx.baseLatency || 0);
    while (this._queue.length && this._queue[0].time <= heardAt) {
      this._emit("step", this._queue.shift());
    }
    this._raf = requestAnimationFrame(this._frame);
  };
}

export const metronome = new Metronome();
