/**
 * Generates public/heartbeat.wav
 * Sound: Epic Competition Drum Hit  (deep BOOM + sharp metallic CRACK + shimmer)
 * Pattern: BOOM-crack every 0.5 s  →  120 BPM, perfect for game-show tension
 * Run once: node generate-heartbeat.js
 */
const fs   = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;
const DURATION    = 0.5;          // one hit cycle at 120 BPM
const N           = Math.floor(SAMPLE_RATE * DURATION);
const samples     = new Float32Array(N);

// ── Pseudo-random number seeded (for reproducible noise) ─────────────────────
let seed = 123456789;
function rand() { seed ^= seed << 13; seed ^= seed >> 7; seed ^= seed << 17; return ((seed >>> 0) / 0xFFFFFFFF) * 2 - 1; }

// ── Deep sub-kick (pitch-swept sine 180 → 40 Hz) ─────────────────────────────
function addKick(startSec, vol, dur) {
  const s0 = Math.floor(startSec * SAMPLE_RATE);
  const len = Math.floor(dur * SAMPLE_RATE);
  let phase = 0;
  for (let i = 0; i < len && s0 + i < N; i++) {
    const t    = i / SAMPLE_RATE;
    const frac = t / dur;
    // Pitch sweep: 180 → 38 Hz exponential
    const freq = 180 * Math.pow(38 / 180, frac);
    phase += (2 * Math.PI * freq) / SAMPLE_RATE;
    // Envelope: very fast attack (2 ms), long exp decay
    const env  = frac < 0.004 ? frac / 0.004 : Math.exp(-8 * (frac - 0.004));
    samples[s0 + i] += Math.sin(phase) * vol * env;
  }
}

// ── Sharp metallic crack (filtered white noise burst) ────────────────────────
function addCrack(startSec, vol, dur) {
  const s0  = Math.floor(startSec * SAMPLE_RATE);
  const len = Math.floor(dur * SAMPLE_RATE);
  // One-pole high-pass filter state
  let prev = 0, filtered = 0;
  const rc = 1 - (2 * Math.PI * 3500 / SAMPLE_RATE); // ~3.5 kHz HP
  for (let i = 0; i < len && s0 + i < N; i++) {
    const t    = i / SAMPLE_RATE;
    const frac = t / dur;
    const env  = frac < 0.003 ? frac / 0.003 : Math.exp(-18 * (frac - 0.003));
    const noise = rand();
    // Simple 1-pole high-pass
    filtered = rc * (filtered + noise - prev);
    prev = noise;
    samples[s0 + i] += filtered * vol * env;
  }
}

// ── Metallic shimmer ring (mid-high tone decay) ───────────────────────────────
function addShimmer(startSec, freq, vol, dur) {
  const s0  = Math.floor(startSec * SAMPLE_RATE);
  const len = Math.floor(dur * SAMPLE_RATE);
  for (let i = 0; i < len && s0 + i < N; i++) {
    const t   = i / SAMPLE_RATE;
    const env = Math.exp(-12 * t / dur);
    samples[s0 + i] += Math.sin(2 * Math.PI * freq * t) * vol * env;
  }
}

// ── Body thud (low-mid punch at 200 Hz, fast) ────────────────────────────────
function addThud(startSec, vol, dur) {
  const s0  = Math.floor(startSec * SAMPLE_RATE);
  const len = Math.floor(dur * SAMPLE_RATE);
  for (let i = 0; i < len && s0 + i < N; i++) {
    const t   = i / SAMPLE_RATE;
    const env = Math.exp(-20 * t / dur);
    samples[s0 + i] += Math.sin(2 * Math.PI * 200 * t) * vol * env;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  BUILD THE HIT  (everything lands at t = 0)
// ═══════════════════════════════════════════════════════════════════════════════
addKick   (0.000, 0.95, 0.30);   // deep sub boom
addThud   (0.000, 0.60, 0.08);   // mid punch body
addCrack  (0.000, 0.70, 0.06);   // sharp snare crack
addShimmer(0.000, 1400, 0.25, 0.18);  // metallic ring high
addShimmer(0.000,  800, 0.18, 0.14);  // warm ring mid

// ── Normalize to 92 % peak ───────────────────────────────────────────────────
let peak = 0;
for (let i = 0; i < N; i++) if (Math.abs(samples[i]) > peak) peak = Math.abs(samples[i]);
if (peak > 0) for (let i = 0; i < N; i++) samples[i] = samples[i] / peak * 0.92;

// ── Pack to 16-bit PCM ───────────────────────────────────────────────────────
const pcm = Buffer.alloc(N * 2);
for (let i = 0; i < N; i++) {
  const v = Math.max(-1, Math.min(1, samples[i]));
  pcm.writeInt16LE(Math.round(v * 32767), i * 2);
}

// ── WAV header ───────────────────────────────────────────────────────────────
const hdr = Buffer.alloc(44);
hdr.write('RIFF', 0);
hdr.writeUInt32LE(36 + pcm.length, 4);
hdr.write('WAVE', 8);
hdr.write('fmt ', 12);
hdr.writeUInt32LE(16,              16);
hdr.writeUInt16LE(1,               20);   // PCM
hdr.writeUInt16LE(1,               22);   // mono
hdr.writeUInt32LE(SAMPLE_RATE,     24);
hdr.writeUInt32LE(SAMPLE_RATE * 2, 28);
hdr.writeUInt16LE(2,               32);
hdr.writeUInt16LE(16,              34);
hdr.write('data', 36);
hdr.writeUInt32LE(pcm.length,      40);

const outPath = path.join(__dirname, 'public', 'heartbeat.wav');
fs.writeFileSync(outPath, Buffer.concat([hdr, pcm]));
console.log(`✅  heartbeat.wav (Epic Drum Hit) → ${outPath}  (${(pcm.length / 1024).toFixed(1)} KB PCM)`);
