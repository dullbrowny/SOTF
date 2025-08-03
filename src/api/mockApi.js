const delay = (ms) => new Promise((res) => setTimeout(res, ms));

function datasetBase() {
  const ds = localStorage.getItem("dataset") || "g8";
  return `/api/datasets/${ds}`;
}

async function safeFetchJson(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function mulberry32(a) {
  return function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

export async function getQuestionsBySubjectTopic(subject = "math", topic = "", seed = 1, count = 8) {
  await delay(100);
  const sub = String(subject || "math").toLowerCase().trim();
  const top = String(topic || "").toLowerCase().replace(/\s+/g, "-").trim();
  const base = datasetBase();

  let bank = [];
  async function pushFrom(url) {
    const data = await safeFetchJson(url);
    if (data && Array.isArray(data.items)) bank = bank.concat(data.items);
    return !!data;
  }

  if (top) await pushFrom(`${base}/${sub}/${top}/questions.json`);
  if (!bank.length) await pushFrom(`${base}/${sub}/questions.json`);
  if (!bank.length) await pushFrom(`${base}/questions.json`);

  const rnd = mulberry32(Number(seed) || 1);
  const chosen = [];
  for (let i = 0; i < Math.min(count, bank.length || 8); i++) {
    const idx = Math.floor(rnd() * (bank.length));
    chosen.push(bank[idx]);
  }

  return { items: chosen, _source: bank.length ? 'mixed' : '(none)' };
}

export async function generatePractice(subject = "math", topic = "Linear Equations", opts = {}) {
  await delay(100);
  const { difficulty='easy', count=5, distractors='numeric' } = opts || {};
  const diffMap = { easy: [2,3,4,5], medium: [1,2,3,4], hard: [0,2,4,6] };
  const optsArr = diffMap[difficulty] || [2,3,4,5];

  const items = Array.from({length: count}).map((_,i)=>{
    const choices = optsArr.map(n=>String(n+(i%2)));
    const correct = String(4);
    return {
      question: `${i+1}. (${subject} • ${topic} • ${difficulty}) Solve for x: 2x + ${3+i} = ${11+i}`,
      options: distractors==='words' ? choices.map(x=>`option ${x}`) : choices,
      answer: distractors==='words' ? `option ${correct}` : correct,
      hint: difficulty==='hard' ? 'Isolate x and check with substitution.' : 'Reverse the last operation.'
    }
  });
  return { items };
}

const evidenceBank = (id) => ({
  question: "Explain why 2x + 3 = 11 leads to x = 4",
  student: [ "I subtracted 3 then divided by 2", "I think x is 5 because 2*5+3=13", "I moved 3 to RHS and divided by 2" ][id%3],
  rubric: [
    { dim: "Setup", score: (id%5?1:0), note: (id%5? "Correct isolation of variable": "Incorrect rearrangement") },
    { dim: "Method", score: (id%2?1:0), note: (id%2? "Valid operations used": "Missing an operation") },
    { dim: "Answer", score: (id%4?1:0), note: (id%4? "Correct final value": "Arithmetic slip at end") },
  ]
});

async function get(path) {
  await delay(100);
  const url = `${datasetBase()}${path}`;
  const data = await safeFetchJson(url);
  return data ?? {};
}

export const api = {
  getQuestions: (subject, topic, seed, count) => getQuestionsBySubjectTopic(subject, topic, seed, count),
  getGradingBatch: () => get("/grading.json"),
  getPractice: () => get("/practice.json"),
  getTutorScript: () => get("/tutor.json"),
  getAdminMetrics: () => get("/admin.json"),
  getParentDigest: () => get("/parent.json"),
  generatePractice,
  evidenceBank,
};
