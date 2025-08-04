// src/api/mockApi.js

// --- tiny seeded RNG helpers (stable per seed string) ---
function strHash(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }

// --- topic detectors from seed ---
function detectTopic(seed = '') {
  const s = seed.toLowerCase();
  if (s.includes('fraction')) return 'fractions';
  if (s.includes('decimal')) return 'decimals';
  if (s.includes('integer')) return 'integers';
  if (s.includes('geometry') || s.includes('area') || s.includes('perimeter')) return 'geometry';
  if (s.includes('algebra') || s.includes('equation') || s.includes('solve')) return 'algebra';
  return 'fractions'; // sensible default
}

// --- question builders per topic ---
function buildFractions(rng) {
  // a/b + c/d with small denominators
  const den = [2, 3, 4, 5, 6, 8, 9];
  let a = 1 + Math.floor(rng() * 8);
  let b = pick(rng, den);
  let c = 1 + Math.floor(rng() * 8);
  let d = pick(rng, den);

  // reduce a/b and c/d a little
  const gcd = (x, y) => y ? gcd(y, x % y) : x;
  const g1 = gcd(a, b), g2 = gcd(c, d);
  a /= g1; b /= g1; c /= g2; d /= g2;

  const num = a * d + c * b;
  const deno = b * d;
  const g = gcd(num, deno);
  const ans = `${num / g}/${deno / g}`;

  const stem = `Compute: ${a}/${b} + ${c}/${d}.`;
  const altA = `Add the fractions ${a}/${b} and ${c}/${d}.`;
  const altB = `What is ${a}/${b} plus ${c}/${d}?`;
  const rubric = `1 pt: common denominator; 1 pt: correct numerator sum; 1 pt: simplified ${ans}.`;

  return { stem, answer: ans, altA, altB, rubric };
}

function buildDecimals(rng) {
  const a = (Math.round(rng() * 900) / 10).toFixed(1); // 0.0–90.0
  const b = (Math.round(rng() * 900) / 100).toFixed(2); // 0.00–9.00
  const ans = (parseFloat(a) + parseFloat(b)).toFixed(2);
  const stem = `Add the decimals: ${a} + ${b}.`;
  const altA = `Find the sum of ${a} and ${b}.`;
  const altB = `Compute ${a} plus ${b} (round to 2 decimals).`;
  const rubric = `1 pt: aligned decimal places; 1 pt: correct sum ${ans}.`;
  return { stem, answer: ans, altA, altB, rubric };
}

function buildIntegers(rng) {
  const a = Math.floor(rng() * 31) - 15; // -15..15
  const b = Math.floor(rng() * 31) - 15;
  const op = rng() < 0.5 ? '+' : '−';
  const ans = op === '+' ? (a + b) : (a - b);
  const stem = `Evaluate: ${a} ${op} ${b}.`;
  const altA = `Compute the integer ${op === '+' ? 'sum' : 'difference'} of ${a} and ${b}.`;
  const altB = `What is ${a} ${op} ${b}?`;
  const rubric = `1 pt: correct sign rules; 1 pt: final value ${ans}.`;
  return { stem, answer: String(ans), altA, altB, rubric };
}

function buildGeometry(rng) {
  const w = 3 + Math.floor(rng() * 12);
  const h = 3 + Math.floor(rng() * 12);
  const choose = rng() < 0.5 ? 'area' : 'perimeter';
  const ans = choose === 'area' ? String(w * h) : String(2 * (w + h));
  const stem = `A rectangle is ${w} units by ${h} units. Find its ${choose}.`;
  const altA = `Calculate the ${choose} for a ${w}×${h} rectangle.`;
  const altB = `What is the ${choose} when width=${w} and height=${h}?`;
  const rubric = choose === 'area'
    ? `1 pt: formula A = w × h; 1 pt: correct product ${ans}.`
    : `1 pt: formula P = 2(w + h); 1 pt: correct total ${ans}.`;
  return { stem, answer: ans, altA, altB, rubric };
}

function buildAlgebra(rng) {
  // ax + b = c
  const a = 2 + Math.floor(rng() * 8);
  const x = 1 + Math.floor(rng() * 10);
  const b = Math.floor(rng() * 15);
  const c = a * x + b;
  const stem = `Solve for x: ${a}x + ${b} = ${c}.`;
  const altA = `Find x if ${a}x + ${b} equals ${c}.`;
  const altB = `Determine x: ${a}x + ${b} = ${c}.`;
  const rubric = `1 pt: isolate ${a}x = ${c} − ${b}; 1 pt: divide by ${a}; 1 pt: x = ${x}.`;
  return { stem, answer: String(x), altA, altB, rubric };
}

const builders = {
  fractions: buildFractions,
  decimals: buildDecimals,
  integers: buildIntegers,
  geometry: buildGeometry,
  algebra: buildAlgebra,
};

function uniqueByStem(items) {
  const seen = new Set();
  return items.filter((it) => {
    const key = (it?.stem || '').toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Main generator
 * Accepts ({ seed, count }) or (seed, count)
 * Returns an array of { id, stem, answer, altA, altB, rubric }
 */
export async function generateAssessmentItems(arg1, arg2) {
  const opts = typeof arg1 === 'object' ? arg1 : { seed: arg1, count: arg2 };
  const seed = String(opts?.seed ?? 'fractions');
  const count = Math.max(1, Math.min(100, Number(opts?.count ?? 8)));

  const topic = detectTopic(seed);
  const rng = mulberry32(strHash(seed + '::' + topic));
  const build = builders[topic] || builders.fractions;

  // create slightly more and then de-dup by stem
  const raw = Array.from({ length: Math.ceil(count * 1.5) }, () => build(rng)).map((q, i) => ({
    id: i + 1,
    ...q,
  }));
  const uniq = uniqueByStem(raw).slice(0, count);

  // simulate latency a touch
  await new Promise((r) => setTimeout(r, 80 + Math.floor(rng() * 120)));
  return uniq;
}

export const api = { generateAssessmentItems };
export default api;

