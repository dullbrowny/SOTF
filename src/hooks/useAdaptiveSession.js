import { useState } from "react";
export function useAdaptiveSession({ getItems, skillGraph }) {
  const [state, setState] = useState("idle");
  const [queue, setQueue] = useState([]);
  const [idx, setIdx] = useState(0);
  const [difficulty, setDifficulty] = useState(3);
  const [streak, setStreak] = useState(0);
  const [skillId, setSkillId] = useState(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [lastOutcome, setLastOutcome] = useState(null);

  const item = queue[idx] || null;
  const total = queue.length;

  async function start({ skillId: s, difficulty: d = 3, count = 5, types = ["mcq","numeric"] }) {
    setSkillId(s); setDifficulty(d); setState("idle"); setHintsUsed(0); setLastOutcome(null); setStreak(0);
    const items = await getItems({ skillId: s, difficulty: d, count, types });
    setQueue(items); setIdx(0); setState(items.length ? "active" : "idle");
  }
  function giveHint(){ setHintsUsed(h => h+1); }
  function record({ correct }) {
    setLastOutcome(correct ? "correct":"incorrect");
    if (correct && hintsUsed===0) setDifficulty(x=>Math.min(5,x+1));
    if (!correct) setDifficulty(x=>Math.max(1,x-1));
    setStreak(s=> correct ? Math.max(1,s+1) : Math.min(-1,s-1));
    setHintsUsed(0);
  }
  async function next(){
    if (streak <= -2 && skillGraph?.[skillId]?.prereqs?.length){
      const prereq = skillGraph[skillId].prereqs[0];
      const items = await getItems({ skillId: prereq, difficulty: Math.max(1,difficulty-1), count: 3, types: ["mcq","numeric"] });
      setQueue(items); setIdx(0); setState(items.length?"active":"finished"); setStreak(0); setSkillId(prereq);
      return { branched:true, prereq };
    }
    if (idx+1 < total){ setIdx(idx+1); return { branched:false }; }
    setState("finished"); return { branched:false };
  }
  return { state,item,idx,total,difficulty,skillId,lastOutcome,start,next,record,giveHint };
}
