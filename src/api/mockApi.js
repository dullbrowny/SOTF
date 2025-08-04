// src/api/mockApi.js

// ---------- seeded RNG ----------
function strHash(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];
const gcd = (x, y) => (y ? gcd(y, x % y) : x);

// ---------- grade difficulty knobs ----------
const GradeKnobs = {
  '6': { intAbs: 10, fracDen: [2,3,4,5,6], dec2: false, sci: { dist: [50,200], time: [5,30], mass:[100,500], vol:[50,250] } },
  '7': { intAbs: 15, fracDen: [2,3,4,5,6,8,9], dec2: true,  sci: { dist: [100,500], time:[5,60], mass:[200,1000], vol:[100,500] } },
  '8': { intAbs: 25, fracDen: [3,4,5,6,7,8,9,10,12], dec2: true, sci:{ dist:[200,1000], time:[10,120], mass:[500,2000], vol:[200,1000] } },
  '9': { intAbs: 40, fracDen: [5,6,7,8,9,10,12,15], dec2: true, sci:{ dist:[500,3000], time:[10,180], mass:[1000,5000], vol:[500,2000] } },
  '10':{ intAbs: 60, fracDen: [6,8,9,10,12,15,16], dec2: true, sci:{ dist:[1000,5000],time:[20,300], mass:[2000,10000],vol:[1000,4000] } },
};
function normGrade(g) { const s = String(g ?? '7'); return GradeKnobs[s] ? s : '7'; }

// ---------- topic detection ----------
function detectMathTopic(seed = '') {
  const s = String(seed).toLowerCase();
  if (s.includes('fraction')) return 'fractions';
  if (s.includes('decimal')) return 'decimals';
  if (s.includes('integer')) return 'integers';
  if (s.includes('geometry') || s.includes('area') || s.includes('perimeter')) return 'geometry';
  if (s.includes('algebra') || s.includes('equation') || s.includes('solve')) return 'algebra';
  return 'fractions';
}
function detectScienceTopic(seed='') {
  const s = String(seed).toLowerCase();
  if (s.includes('density')) return 'chem_density';
  if (s.includes('chem')) return 'chem_density';
  if (s.includes('speed') || s.includes('velocity') || s.includes('distance')) return 'phys_speed';
  if (s.includes('phys')) return 'phys_speed';
  // default to physics speed
  return 'phys_speed';
}

// ---------- Math builders ----------
function buildFractions(rng, knobs) {
  let a = 1 + Math.floor(rng() * 9), c = 1 + Math.floor(rng() * 9);
  let b = pick(rng, knobs.fracDen), d = pick(rng, knobs.fracDen);
  const g1 = gcd(a, b), g2 = gcd(c, d); a/=g1; b/=g1; c/=g2; d/=g2;

  const num = a*d + c*b, den = b*d, g = gcd(num, den);
  const ans = `${num/g}/${den/g}`;
  return {
    stem: `Compute: ${a}/${b} + ${c}/${d}.`,
    answer: ans,
    altA: `Add ${a}/${b} and ${c}/${d}.`,
    altB: `What is ${a}/${b} plus ${c}/${d}?`,
    rubric: `1 pt: common denom; 1 pt: add numerators; 1 pt: simplify to ${ans}.`,
  };
}

function buildDecimals(rng, knobs) {
  const a = knobs.dec2 ? (Math.round(rng()*900)/10).toFixed(1) : (Math.round(rng()*90)/10).toFixed(1);
  const b = knobs.dec2 ? (Math.round(rng()*900)/100).toFixed(2) : (Math.round(rng()*90)/10).toFixed(1);
  const sum = (parseFloat(a) + parseFloat(b)).toFixed(knobs.dec2 ? 2 : 1);
  return {
    stem: `Add the decimals: ${a} + ${b}.`,
    answer: sum,
    altA: `Find the sum of ${a} and ${b}.`,
    altB: `Compute ${a} + ${b}.`,
    rubric: `1 pt: align decimals; 1 pt: sum ${sum}.`,
  };
}

function buildIntegers(rng, knobs) {
  const A = knobs.intAbs;
  const a = Math.floor(rng()*(2*A+1)) - A;
  const b = Math.floor(rng()*(2*A+1)) - A;
  const add = rng()<0.5;
  const ans = add ? a+b : a-b;
  return {
    stem: `Evaluate: ${a} ${add?'+':'−'} ${b}.`,
    answer: String(ans),
    altA: `Compute the integer ${add?'sum':'difference'} of ${a} and ${b}.`,
    altB: `What is ${a} ${add?'+':'−'} ${b}?`,
    rubric: `1 pt: sign rules; 1 pt: final ${ans}.`,
  };
}

function buildGeometry(rng) {
  const w = 3 + Math.floor(rng()*12), h = 3 + Math.floor(rng()*12);
  const area = rng()<0.5;
  const ans = area ? String(w*h) : String(2*(w+h));
  return {
    stem: `A rectangle is ${w} by ${h} units. Find its ${area?'area':'perimeter'}.`,
    answer: ans,
    altA: `Calculate the ${area?'area':'perimeter'} for a ${w}×${h} rectangle.`,
    altB: `What is the ${area?'area':'perimeter'}?`,
    rubric: area ? `1 pt: A = w×h; 1 pt: ${ans}.` : `1 pt: P=2(w+h); 1 pt: ${ans}.`,
  };
}

function buildAlgebra(rng, knobs) {
  const a = 2 + Math.floor(rng()*8);
  const x = 1 + Math.floor(rng()*10);
  const b = Math.floor(rng()*(knobs.intAbs));
  const c = a*x + b;
  return {
    stem: `Solve for x: ${a}x + ${b} = ${c}.`,
    answer: String(x),
    altA: `Find x if ${a}x + ${b} = ${c}.`,
    altB: `Determine x: ${a}x + ${b} = ${c}.`,
    rubric: `1 pt: ${a}x=${c}-${b}; 1 pt: ÷${a}; 1 pt: x=${x}.`,
  };
}

const MathBuilders = {
  fractions: buildFractions,
  decimals:  buildDecimals,
  integers:  buildIntegers,
  geometry:  buildGeometry,
  algebra:   buildAlgebra,
};

// ---------- Science builders ----------
function randInt(rng, [lo, hi]) {
  return lo + Math.floor(rng() * (hi - lo + 1));
}

function buildPhysSpeed(rng, knobs) {
  const d = randInt(rng, knobs.sci.dist); // meters
  const t = randInt(rng, knobs.sci.time); // seconds
  const v = (d / t).toFixed(2);
  return {
    stem: `A body travels ${d} m in ${t} s. What is its average speed (m/s)?`,
    answer: String(v),
    altA: `Compute speed given distance ${d} m and time ${t} s.`,
    altB: `Find v for d=${d} m, t=${t} s (v=d/t).`,
    rubric: `1 pt: v=d/t; 1 pt: ${d}/${t}=${v} m/s.`,
  };
}

function buildChemDensity(rng, knobs) {
  const m = randInt(rng, knobs.sci.mass); // grams
  const V = randInt(rng, knobs.sci.vol);  // cm^3
  const rho = (m / V).toFixed(2);
  return {
    stem: `A sample has mass ${m} g and volume ${V} cm³. Find its density (g/cm³).`,
    answer: String(rho),
    altA: `Compute density ρ=m/V for m=${m} g, V=${V} cm³.`,
    altB: `What is ρ if mass=${m} g and volume=${V} cm³?`,
    rubric: `1 pt: ρ=m/V; 1 pt: ${m}/${V}=${rho} g/cm³.`,
  };
}

const SciBuilders = {
  phys_speed:    buildPhysSpeed,
  chem_density:  buildChemDensity,
};

// ---------- main ----------
export async function generateAssessmentItems(arg1, arg2) {
  // Back-compat: (seed, count) OR ({ seed, count, subject, grade })
  const opts = (typeof arg1 === 'object' && arg1) ? arg1 : { seed: arg1, count: arg2 };
  const seed = String(opts?.seed ?? 'fractions');
  const count = Math.max(1, Math.min(100, Number(opts?.count ?? 8)));
  const subject = String(opts?.subject ?? 'Math');
  const grade = normGrade(opts?.grade);

  const knobs = GradeKnobs[grade];
  const topic =
    subject.toLowerCase() === 'science' ? detectScienceTopic(seed) : detectMathTopic(seed);

  const rng = mulberry32(strHash(`${subject}:${grade}:${seed}:${topic}`));

  let build;
  if (subject.toLowerCase() === 'science') {
    build = SciBuilders[topic] || SciBuilders.phys_speed;
  } else {
    build = MathBuilders[topic] || MathBuilders.fractions;
  }

  const raw = Array.from({ length: Math.ceil(count*1.5) }, (_, i) => ({ id: i+1, ...build(rng, knobs) }));
  const uniq = uniqueByStem(raw).slice(0, count);

  await new Promise(r => setTimeout(r, 60 + Math.floor(rng()*100)));
  return uniq;
}

function uniqueByStem(items) {
  const seen = new Set();
  return items.filter(it => {
    const k = (it?.stem||'').toLowerCase();
    if (seen.has(k)) return false; seen.add(k); return true;
  });
}

export const api = { generateAssessmentItems };
export default api;

