/**
 * sounds.js — synthesised metronome voices (no audio files).
 *
 * Every voice has the signature (ctx, out, time, accent):
 *   out     – node to connect to (its gain sets the level)
 *   accent  – true for the accented, higher-pitched variant
 */

const noiseBuffers = new WeakMap();

/** Short white-noise buffer, created once per AudioContext. */
function noise(ctx) {
  if (!noiseBuffers.has(ctx)) {
    const length = Math.floor(ctx.sampleRate * 0.15);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    noiseBuffers.set(ctx, buffer);
  }
  return noiseBuffers.get(ctx);
}

function tone(ctx, out, time, { type, freq, endFreq, gain, decay }) {
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, time);
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, time + decay * 0.75);
  env.gain.setValueAtTime(gain, time);
  env.gain.exponentialRampToValueAtTime(0.001, time + decay);
  osc.connect(env).connect(out);
  osc.start(time);
  osc.stop(time + decay + 0.01);
}

function noiseBurst(ctx, out, time, { filterType, freq, q = 1, gain, decay }) {
  const src = ctx.createBufferSource();
  src.buffer = noise(ctx);
  const filter = ctx.createBiquadFilter();
  filter.type = filterType;
  filter.frequency.value = freq;
  filter.Q.value = q;
  const env = ctx.createGain();
  env.gain.setValueAtTime(gain, time);
  env.gain.exponentialRampToValueAtTime(0.001, time + decay);
  src.connect(filter).connect(env).connect(out);
  src.start(time);
  src.stop(time + decay + 0.01);
}

export const SOUNDS = {
  click: (ctx, out, time, accent) =>
    tone(ctx, out, time, { type: "square", freq: accent ? 1800 : 1200, gain: accent ? 0.8 : 0.5, decay: 0.04 }),

  woodblock: (ctx, out, time, accent) =>
    tone(ctx, out, time, {
      type: "sine",
      freq: accent ? 900 : 700,
      endFreq: accent ? 300 : 200,
      gain: accent ? 1.0 : 0.7,
      decay: 0.08,
    }),

  hihat: (ctx, out, time, accent) =>
    noiseBurst(ctx, out, time, {
      filterType: "bandpass",
      freq: accent ? 10000 : 8000,
      q: 0.5,
      gain: accent ? 1.0 : 0.6,
      decay: accent ? 0.1 : 0.06,
    }),

  rimshot: (ctx, out, time, accent) => {
    tone(ctx, out, time, { type: "triangle", freq: 400, gain: accent ? 0.8 : 0.5, decay: 0.06 });
    noiseBurst(ctx, out, time, { filterType: "highpass", freq: 1500, gain: accent ? 0.6 : 0.35, decay: 0.05 });
  },

  beep: (ctx, out, time, accent) =>
    tone(ctx, out, time, { type: "sine", freq: accent ? 880 : 440, gain: accent ? 0.7 : 0.45, decay: 0.1 }),
};

export const SOUND_IDS = Object.keys(SOUNDS);
