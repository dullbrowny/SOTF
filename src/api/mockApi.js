// Mock API for Assessment generation (bank + synthetic) with seeded sampling
import { mulberry32, pickN, normalizeSeed } from '../utils/random.js';

// Minimal local banks (extend as needed)
const BANK = {
  Math: {
    'Linear Equations': [
      { question: 'Solve for x: 2x + 3 = 11', answer: '4' },
      { question: 'Solve for x: 5x - 7 = 18', answer: '5' },
      { question: 'Find x: 3x + 9 = 0', answer: '-3' },
    ]
  },
  Science: {
    'Atoms': [
      { question: 'Which subatomic particle determines atomic number?', answer: 'Proton' },
      { question: 'Which particle has a negative charge?', answer: 'Electron' },
      { question: 'What changes in an isotope of an element?', answer: 'Neutron count' },
    ]
  }
};

function makeRubric(subject, topic) {
  if (subject === 'Math') return '1 pt: reasoning; 1 pt: answer';
  return '1 pt: concept; 1 pt: justification';
}

function altWording(base, rand) {
  const variants = [
    'Alt wording A', 'Alt wording B',
    'Try another phrasing', 'Alternate stem'
  ];
  const i1 = Math.floor(rand() * variants.length);
  let i2 = Math.floor(rand() * variants.length);
  if (i2 === i1) i2 = (i2 + 1) % variants.length;
  return [variants[i1], variants[i2]];
}

// Synthetic generators — add variety
function synthMathLinear(rand, grade) {
  // ax + b = c; numbers scaled by grade
  const a = 1 + Math.floor(rand() * 6);
  const b = Math.floor(rand() * 12);
  const c = b + (1 + Math.floor(rand() * 8)) * a;
  const q = `Solve for x: ${a}x + ${b} = ${c}`;
  const ans = String((c - b) / a);
  return { question: q, answer: ans };
}

function synthScienceAtoms(rand, grade) {
  const stems = [
    'Which subatomic particle determines atomic number?',
    'Which particle has a negative charge?',
    'What changes in an isotope of an element?',
    'Which particle is found in the nucleus and is neutral?',
  ];
  const answers = {
    0: 'Proton',
    1: 'Electron',
    2: 'Neutron count',
    3: 'Neutron'
  };
  const idx = Math.floor(rand() * stems.length);
  return { question: stems[idx], answer: answers[idx] };
}

function mixBankAndSynthetic({ subject, topic, grade, seed, count }) {
  const s = normalizeSeed(seed);
  const rand = mulberry32(s);
  const bank = (BANK[subject] && BANK[subject][topic]) ? BANK[subject][topic] : [];
  const nFromBank = Math.min(bank.length, Math.floor(count * 0.6)); // 60% from bank
  const nSynth = count - nFromBank;

  const picked = pickN(bank, nFromBank, rand);

  const synths = [];
  for (let i = 0; i < nSynth; i++) {
    if (subject === 'Math' && topic === 'Linear Equations') {
      synths.push(synthMathLinear(rand, grade));
    } else if (subject === 'Science' && topic === 'Atoms') {
      synths.push(synthScienceAtoms(rand, grade));
    } else {
      // default: echo a generic
      synths.push({ question: `${subject} • ${topic} (G${grade}): Item ${i+1}`, answer: 'A' });
    }
  }
  const merged = picked.concat(synths);
  // attach alt wording + rubric + id
  return merged.map((it, idx) => {
    const [altA, altB] = altWording(it.question, rand);
    return {
      id: idx + 1,
      question: it.question,
      answer: it.answer,
      altA, altB,
      rubric: makeRubric(subject, topic)
    };
  });
}

// PUBLIC API
export async function generateAssessmentItems({ grade, subject, topic, seed = 42, count = 8 }) {
  // simulate latency
  await new Promise(r => setTimeout(r, 150));
  const items = mixBankAndSynthetic({ grade, subject, topic, seed, count });
  return { items };
}

// add both of these lines near the bottom:
export const api = { generateAssessmentItems };    // compat for old callers
export default { generateAssessmentItems };        // optional default export


