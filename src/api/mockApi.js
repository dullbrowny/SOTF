// src/api/mockApi.js

// ---------------------------------------------------------------------
// Existing JSON fetchers (preserved)
// ---------------------------------------------------------------------
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

async function get(path) {
  await delay(400); // simulate latency
  const res = await fetch(`/api${path}`);
  if (!res.ok) throw new Error(`Mock fetch failed: ${path}`);
  return res.json();
}

const apiBase = {
  getQuestions: () => get('/questions.json'),
  getGradingBatch: () => get('/grading.json'),
  getPractice: () => get('/practice.json'),
  getTutorScript: () => get('/tutor.json'),
  getAdminMetrics: () => get('/admin.json'),
  getParentDigest: () => get('/parent.json'),
};

// ---------------------------------------------------------------------
// Utilities (shared)
// ---------------------------------------------------------------------
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
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];
const gcd = (x, y) => (y ? gcd(y, x % y) : x);
const ri = (rng, range) => {
  const [lo, hi] = range;
  return lo + Math.floor(rng() * (hi - lo + 1));
};
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function gaussian(rng, mean = 0, sd = 1) {
  const u1 = Math.max(rng(), 1e-9), u2 = Math.max(rng(), 1e-9);
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + sd * z0;
}
function uniqueByStem(items) {
  const seen = new Set();
  return items.filter((it) => {
    const k = (it?.stem || '').toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

// ---------------------------------------------------------------------
// Grade knobs (used by Assessment + Grading difficulty)
// ---------------------------------------------------------------------
const GradeKnobs = {
  '6': { intAbs: 10, fracDen: [2,3,4,5,6], dec2: false,
    sci: { dist: [50,200], time: [5,30], mass: [100,500], vol: [50,250], dv: [2,10] } },
  '7': { intAbs: 15, fracDen: [2,3,4,5,6,8,9], dec2: true,
    sci: { dist: [100,500], time: [5,60], mass: [200,1000], vol: [100,500], dv: [3,15] } },
  '8': { intAbs: 25, fracDen: [3,4,5,6,7,8,9,10,12], dec2: true,
    sci: { dist: [200,1000], time: [10,120], mass: [500,2000], vol: [200,1000], dv: [5,20] } },
  '9': { intAbs: 40, fracDen: [5,6,7,8,9,10,12,15], dec2: true,
    sci: { dist: [500,3000], time: [10,180], mass: [1000,5000], vol: [500,2000], dv: [8,30] } },
  '10': { intAbs: 60, fracDen: [6,8,9,10,12,15,16], dec2: true,
    sci: { dist: [1000,5000], time: [20,300], mass: [2000,10000], vol: [1000,4000], dv: [10,40] } },
};
const normGrade = (g) => (GradeKnobs[String(g ?? '7')] ? String(g) : '7');

// ---------------------------------------------------------------------
// Topic detection (Assessment)
// ---------------------------------------------------------------------
function detectMathTopic(seed = '') {
  const s = seed.toLowerCase();
  if (s.includes('fraction')) return 'fractions';
  if (s.includes('decimal')) return 'decimals';
  if (s.includes('integer')) return 'integers';
  if (s.includes('geometry') || s.includes('area') || s.includes('perimeter')) return 'geometry';
  if (s.includes('algebra') || s.includes('equation') || s.includes('solve')) return 'algebra';
  return 'fractions';
}
function detectScienceTopic(seed = '') {
  const s = seed.toLowerCase();
  if (s.includes('density') || s.includes('chem')) return 'chem_density';
  if (s.includes('composition') || s.includes('%')) return 'chem_percent';
  if (s.includes('accel')) return 'phys_accel';
  if (s.includes('speed') || s.includes('velocity') || s.includes('distance') || s.includes('phys')) return 'phys_speed';
  if (s.includes('punnett') || s.includes('genetic') || s.includes('bio')) return 'bio_punnett';
  return 'phys_speed';
}

// ---------------------------------------------------------------------
// Assessment builders
// ---------------------------------------------------------------------
function bFractions(rng, k) {
  let a = 1 + Math.floor(rng() * 9), c = 1 + Math.floor(rng() * 9);
  let b = pick(rng, k.fracDen), d = pick(rng, k.fracDen);
  const g1 = gcd(a, b), g2 = gcd(c, d);
  a /= g1; b /= g1; c /= g2; d /= g2;
  const num = a * d + c * b, den = b * d, g = gcd(num, den);
  const ans = `${num / g}/${den / g}`;
  return {
    stem: `Compute: ${a}/${b} + ${c}/${d}.`,
    answer: ans,
    altA: `Add ${a}/${b} and ${c}/${d}.`,
    altB: `What is ${a}/${b} plus ${c}/${d}?`,
    rubric: `1 pt: common denom; 1 pt: add numerators; 1 pt: simplify to ${ans}.`,
  };
}
function bDecimals(rng, k) {
  const a = k.dec2 ? (Math.round(rng() * 900) / 10).toFixed(1) : (Math.round(rng() * 90) / 10).toFixed(1);
  const b = k.dec2 ? (Math.round(rng() * 900) / 100).toFixed(2) : (Math.round(rng() * 90) / 10).toFixed(1);
  const sum = (parseFloat(a) + parseFloat(b)).toFixed(k.dec2 ? 2 : 1);
  return {
    stem: `Add the decimals: ${a} + ${b}.`,
    answer: sum,
    altA: `Find the sum of ${a} and ${b}.`,
    altB: `Compute ${a} + ${b}.`,
    rubric: `1 pt: align decimals; 1 pt: sum ${sum}.`,
  };
}
function bIntegers(rng, k) {
  const A = k.intAbs, a = Math.floor(rng() * (2 * A + 1)) - A, b = Math.floor(rng() * (2 * A + 1)) - A;
  const add = rng() < 0.5;
  const ans = add ? a + b : a - b;
  return {
    stem: `Evaluate: ${a} ${add ? '+' : '−'} ${b}.`,
    answer: String(ans),
    altA: `Compute the integer ${add ? 'sum' : 'difference'} of ${a} and ${b}.`,
    altB: `What is ${a} ${add ? '+' : '−'} ${b}?`,
    rubric: `1 pt: sign rules; 1 pt: final ${ans}.`,
  };
}
function bGeometry(rng) {
  const w = 3 + Math.floor(rng() * 12), h = 3 + Math.floor(rng() * 12), area = rng() < 0.5;
  const ans = area ? String(w * h) : String(2 * (w + h));
  return {
    stem: `A rectangle is ${w} by ${h} units. Find its ${area ? 'area' : 'perimeter'}.`,
    answer: ans,
    altA: `Calculate the ${area ? 'area' : 'perimeter'} for a ${w}×${h} rectangle.`,
    altB: `What is the ${area ? 'area' : 'perimeter'}?`,
    rubric: area ? `1 pt: A=w×h; 1 pt: ${ans}.` : `1 pt: P=2(w+h); 1 pt: ${ans}.`,
  };
}
function bAlgebra(rng, k) {
  const a = 2 + Math.floor(rng() * 8), x = 1 + Math.floor(rng() * 10), b = Math.floor(rng() * k.intAbs), c = a * x + b;
  return {
    stem: `Solve for x: ${a}x + ${b} = ${c}.`,
    answer: String(x),
    altA: `Find x if ${a}x + ${b} = ${c}.`,
    altB: `Determine x: ${a}x + ${b} = ${c}.`,
    rubric: `1 pt: ${a}x=${c}-${b}; 1 pt: ÷${a}; 1 pt: x=${x}.`,
  };
}
const MathBuilders = { fractions: bFractions, decimals: bDecimals, integers: bIntegers, geometry: bGeometry, algebra: bAlgebra };

// Science/Bio builders
function bPhysSpeed(rng, k) {
  const d = ri(rng, k.sci.dist), t = ri(rng, k.sci.time), v = (d / t).toFixed(2);
  return {
    stem: `A body travels ${d} m in ${t} s. What is its average speed (m/s)?`,
    answer: String(v),
    altA: `Compute v for d=${d} m, t=${t} s.`,
    altB: `Find speed using v=d/t.`,
    rubric: `1 pt: v=d/t; 1 pt: ${d}/${t}=${v} m/s.`,
  };
}
function bPhysAccel(rng, k) {
  const dv = ri(rng, k.sci.dv), t = ri(rng, k.sci.time), a = (dv / t).toFixed(2);
  return {
    stem: `A cart increases its speed by ${dv} m/s in ${t} s. What is its average acceleration (m/s^2)?`,
    answer: String(a),
    altA: `Compute a=Δv/t for Δv=${dv} m/s, t=${t} s.`,
    altB: `Find acceleration given change in speed ${dv} and time ${t}.`,
    rubric: `1 pt: a=Δv/t; 1 pt: ${dv}/${t}=${a} m/s^2.`,
  };
}
function bChemDensity(rng, k) {
  const m = ri(rng, k.sci.mass), V = ri(rng, k.sci.vol), rho = (m / V).toFixed(2);
  return {
    stem: `A sample has mass ${m} g and volume ${V} cm^3. Find its density (g/cm^3).`,
    answer: String(rho),
    altA: `Compute rho=m/V for m=${m} g, V=${V} cm^3.`,
    altB: `What is rho if mass=${m} g and volume=${V} cm^3?`,
    rubric: `1 pt: rho=m/V; 1 pt: ${m}/${V}=${rho} g/cm^3.`,
  };
}
function bChemPercent(rng) {
  const part = 10 + Math.floor(rng() * 90), total = part + (10 + Math.floor(rng() * 90));
  const pct = ((part / total) * 100).toFixed(1);
  return {
    stem: `A solution has ${part} g of solute in ${total} g total mass. What is the percent composition of solute?`,
    answer: `${pct}%`,
    altA: `Compute % = (part/total)×100.`,
    altB: `Find percent by mass for ${part} of ${total}.`,
    rubric: `1 pt: %=(part/total)×100; 1 pt: ${(part / total * 100).toFixed(1)}%.`,
  };
}
function bBioPunnett(rng) {
  const crosses = ['Aa×Aa', 'Aa×aa', 'AA×aa', 'Aa×AA'];
  const c = pick(rng, crosses);
  let ans = '100%';
  if (c === 'Aa×Aa') ans = '75%';
  if (c === 'Aa×aa') ans = '50%';
  return {
    stem: `For the monohybrid cross ${c} (A=dominant, a=recessive), what percent of offspring show the dominant phenotype?`,
    answer: ans,
    altA: `Predict dominant phenotype % for ${c}.`,
    altB: `Using a Punnett square, what % are dominant?`,
    rubric: `1 pt: setup Punnett; 1 pt: count dominant; 1 pt: ${ans}.`,
  };
}
const SciBuilders = { phys_speed: bPhysSpeed, phys_accel: bPhysAccel, chem_density: bChemDensity, chem_percent: bChemPercent, bio_punnett: bBioPunnett };

// ---------------------------------------------------------------------
// Assessment generator (unchanged API)
// ---------------------------------------------------------------------
export async function generateAssessmentItems(arg1, arg2) {
  const opts = (typeof arg1 === 'object' && arg1) ? arg1 : { seed: arg1, count: arg2 };
  const seed = String(opts?.seed ?? 'fractions');
  const count = Math.max(1, Math.min(100, Number(opts?.count ?? 8)));
  const subject = String(opts?.subject ?? 'Math');
  const grade = normGrade(opts?.grade);
  const k = GradeKnobs[grade];

  const topic = (subject.toLowerCase() === 'science' || subject.toLowerCase() === 'biology')
    ? detectScienceTopic(seed)
    : detectMathTopic(seed);

  const rng = mulberry32(strHash(`${subject}:${grade}:${seed}:${topic}`));
  const build = (subject.toLowerCase() === 'science' || subject.toLowerCase() === 'biology')
    ? (SciBuilders[topic] || SciBuilders.phys_speed)
    : (MathBuilders[topic] || MathBuilders.fractions);

  const raw = Array.from({ length: Math.ceil(count * 1.5) }, (_, i) => ({ id: i + 1, ...build(rng, k) }));
  const uniq = uniqueByStem(raw).slice(0, count);

  await delay(60 + Math.floor(rng() * 100));
  return uniq;
}

// ---------------------------------------------------------------------
// Practice generator (adds multiple-choice choices from assessment items)
// ---------------------------------------------------------------------
export async function generatePracticeItems({
  subject = 'Math',
  grade = '8',
  seed = 'Linear Equations',
  count = 5,
  difficulty = 'easy',     // 'easy' | 'medium' | 'hard'
  distractors = 'numeric'  // 'numeric' | 'algebraic' | 'mixed'
} = {}) {
  const base = await generateAssessmentItems({ subject, grade, seed, count });

  const rng = mulberry32(strHash(`practice:${subject}:${grade}:${seed}:${difficulty}:${distractors}`));

  function randPick(arr) { return arr[Math.floor(rng() * arr.length)]; }

  function gauss(mean = 0, sd = 1) {
    const u1 = Math.max(rng(), 1e-9), u2 = Math.max(rng(), 1e-9);
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + sd * z;
  }

  function buildChoices(item) {
    if (Array.isArray(item.choices) && item.choices.length >= 2) return item.choices;
    if (Array.isArray(item.options) && item.options.length >= 2) return item.options;

    const correct = String(item.answer ?? '').trim();
    const out = new Set([correct]);

    const asNum = Number(correct.replace(/[^0-9.\-]/g, ''));
    const numericOK = Number.isFinite(asNum);
    const sd = difficulty === 'hard' ? 2.5 : difficulty === 'medium' ? 1.25 : 0.75;

    let guard = 0;
    while (out.size < 4 && guard < 64) {
      guard++;
      let d;
      if (distractors === 'numeric' && numericOK) {
        d = String(Math.round((asNum + gauss(0, sd)) * 100) / 100);
      } else if (distractors === 'algebraic') {
        const forms = [`(${correct})`, `${correct}x`, `${correct} + 1`, `${correct} - 1`];
        d = randPick(forms);
      } else {
        if (numericOK && rng() < 0.5) {
          d = String(Math.round((asNum + gauss(0, sd)) * 100) / 100);
        } else {
          const forms = [`(${correct})`, `${correct}x`, `${correct} + 2`, `${correct} - 2`];
          d = randPick(forms);
        }
      }
      out.add(d);
    }

    const arr = Array.from(out);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, 4);
  }

  const items = (Array.isArray(base) ? base : base?.items || []).map((it, i) => ({
    id: it.id ?? i + 1,
    stem: it.stem ?? it.question ?? `Question ${i + 1}`,
    answer: String(it.answer ?? ''),
    rubric: it.rubric ?? it.hint ?? '',
    choices: buildChoices(it),
  }));

  return items;
}

// ---------------------------------------------------------------------
// Grading batch generator (unchanged)
// ---------------------------------------------------------------------
const STUDENT_FIRST = [
  'Arjun','Meera','Kavya','Dev','Zoya','Irfan','Nina','Omar','Lila','Rohit',
  'Tara','Isha','Ravi','Anaya','Kabir','Maya','Zain','Nikhil','Rhea','Veer'
];

export async function generateGradingBatch(optsOrSeed, countMaybe) {
  const opts = (typeof optsOrSeed === 'object' && optsOrSeed) ? optsOrSeed : { seed: optsOrSeed, count: countMaybe };
  const seed = String(opts?.seed ?? 'unit');
  const subject = String(opts?.subject ?? 'Math');
  const grade = normGrade(opts?.grade);
  const count = Math.max(1, Math.min(200, Number(opts?.count ?? 10)));

  const rng = mulberry32(strHash(`grading:${subject}:${grade}:${seed}`));

  const baseBySubject = { Math: 0, Science: -2, Biology: -1 };
  const subjectAdj = baseBySubject[subject] ?? 0;
  const gradeAdj = (Number(grade) - 7) * -1.5;
  const mean = 72 + subjectAdj + gradeAdj;
  const sd = 12;

  const rows = Array.from({ length: count }, (_, i) => {
    const g = Number(grade);
    const name = `${pick(rng, STUDENT_FIRST)} ${g}`;
    const score = clamp(Math.round(gaussian(rng, mean, sd)), 20, 99);
    const conf = clamp(Math.round(gaussian(rng, 65 + (score - 65) * 0.4, 10)), 40, 98);
    const evidence = {
      rationale: `Model rationale: Scored ${score} based on rubric alignment and partially correct steps. Confidence ${conf}%.`,
      rubric: [
        { label: 'Concept', points: clamp(Math.round(score * 0.4 / 10), 0, 4) },
        { label: 'Procedure', points: clamp(Math.round(score * 0.4 / 10), 0, 4) },
        { label: 'Communication', points: clamp(Math.round(score * 0.2 / 10), 0, 2) },
      ],
      excerpts: [
        'Shows setup but misses a sign.',
        'Justifies final value with brief explanation.',
        'Work is readable; steps labeled.',
      ],
    };

    return {
      id: i + 1,
      student: name,
      gradeLevel: g,
      subject,
      score,
      confidence: conf,
      status: 'Graded',
      flagged: score < 50 || conf < 55,
      evidence,
    };
  });

  await delay(120 + Math.floor(rng() * 200));
  return rows;
}

// ---------------------------------------------------------------------
// Final export
// ---------------------------------------------------------------------
export const api = {
  ...apiBase,
  generateAssessmentItems,
  generateGradingBatch,
  generatePracticeItems,
};

export default api;

