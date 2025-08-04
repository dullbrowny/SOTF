// src/pages/StudentTutorChat.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDemoData } from '../demoData.jsx';

const T = { card:'#0f172a', border:'#1f2937', text:'#e5e7eb', sub:'#9ca3af', header:'#0b1220', primary:'#06b6d4' };
const card = { background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:16, color:T.text };
const label = { fontSize:12, color:T.sub, marginBottom:4 };
const input = { padding:'10px 12px', border:`1px solid ${T.border}`, background:T.header, borderRadius:10, color:T.text, width:'100%' };
const pill  = { display:'inline-block', padding:'2px 8px', borderRadius:999, background:'#0b1220', border:`1px solid ${T.border}`, color:T.text, fontSize:12 };

const SUBJECTS=['Math','Science','Biology'];
const GRADES=['6','7','8','9','10'];
const TOPICS={
  Math:['Linear Equations','Integers — operations','Fractions — add, subtract, compare'],
  Science:['Physics — speed problems','Physics — acceleration','Chemistry — density'],
  Biology:['Punnett squares — monohybrid']
};
const DIFFS=['easy','medium','hard'];

function botBubble(children){return(
  <div style={{ alignSelf:'flex-start', maxWidth:680 }}>
    <div style={{ fontSize:11, color:T.sub, margin:'0 0 4px 4px' }}>AI Tutor</div>
    <div style={{ background:'#0b1220', border:`1px solid ${T.border}`, borderRadius:14, padding:'10px 12px' }}>{children}</div>
  </div>
);}
function youBubble(children){return(
  <div style={{ alignSelf:'flex-end', maxWidth:680 }}>
    <div style={{ fontSize:11, color:T.sub, textAlign:'right', margin:'0 4px 4px 0' }}>You</div>
    <div style={{ background:'#0b1220', border:`1px solid ${T.border}`, borderRadius:14, padding:'10px 12px' }}>{children}</div>
  </div>
);}

export default function StudentTutorChat(){
  const nav = useNavigate();
  const { grade, setGrade } = useDemoData();

  // Chat state
  const [messages,setMessages] = useState([
    { role:'system', text:'Topic: Linear Equations • Source: NCERT G8' }
  ]);
  const [mode,setMode] = useState('standard'); // standard | eli5 | socratic | steps
  const [comfort,setComfort] = useState(null); // null until asked once in socratic
  const [inputText,setInputText] = useState("I don’t get how to solve 2x + 3 = 11");

  // Practice generator controls
  const [subject,setSubject]=useState('Math');
  const [topic,setTopic]=useState('Linear Equations');
  const [difficulty,setDifficulty]=useState('easy');
  const [count,setCount]=useState(5);

  const canAskComfort = useMemo(()=> mode==='socratic' && comfort==null, [mode,comfort]);

  useEffect(()=>{
    // Show header change
    setMessages(m=>[m[0], ...m.slice(1)]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  const addBot = (text)=> setMessages(m=>[...m,{role:'bot',text}]);
  const addYou = (text)=> setMessages(m=>[...m,{role:'you',text}]);

  function respondStandard(q){
    addBot(`Try isolating **x**.\n\n1) Subtract 3 from both sides.\n2) Divide by 2.\n\nWhat do you get?`);
  }
  function respondELI5(q){
    addBot(`Think of \`2x + 3 = 11\` like a box doubled, then +3 gives 11. Take away 3 first → 8. Now split 8 into two equal parts → 4. So \`x = 4\`. Want another example?`);
  }
  function respondSteps(q){
    addBot(`**Step 1:** Subtract 3 from both sides.\n**Step 2:** Divide by 2.\n**Step 3:** State the value of x.\n\nType your result, I’ll check it.`);
  }
  function respondSocratic(q){
    if (comfort==null) {
      addBot(`Before we dive in—how comfortable are you with this topic?\n\nChoose one below: Not at all / A bit / Mostly / I've got it`);
      return;
    }
    // Socratic probing chain
    const chain = [
      'What could you subtract from both sides to remove the +3?',
      'After that, what operation would undo the “×2” on x?',
      'Do the arithmetic and tell me the value of x.'
    ];
    // Append next question based on last bot
    const botQs = messages.filter(m=>m.role==='bot').map(m=>m.text);
    const already = botQs.filter(t=>chain.includes(t)).length;
    const nextQ = chain[already] ?? 'Great — what did you get for x?';
    addBot(nextQ);
  }

  const onSend = ()=>{
    const text = inputText.trim();
    if(!text) return;
    addYou(text);
    setInputText('');
    if (mode==='socratic' && comfort==null) {
      // interpret first user reply as comfort choice
      const norm = text.toLowerCase();
      if (['not at all','a bit','mostly',"i've got it","ive got it"].some(s=>norm.includes(s))){
        setComfort(norm.startsWith('not')?'low': norm.startsWith('a bit')?'midlow': norm.startsWith('mostly')?'midhigh':'high');
        addBot(`Got it — ${norm.includes('mostly')?'mostly':norm}. I’ll adjust my explanations.`);
        return;
      }
    }
    switch(mode){
      case 'eli5':     respondELI5(text); break;
      case 'steps':    respondSteps(text); break;
      case 'socratic': respondSocratic(text); break;
      default:         respondStandard(text); break;
    }
  };

  const onMakePractice = ()=>{
    const params = new URLSearchParams({
      from:'tutor',
      subject, topic,
      grade:String(grade),
      difficulty, count:String(count)
    }).toString();
    nav(`/practice?${params}`);
  };

  return (
    <div style={{ padding:20, color:T.text }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:16 }}>
        {/* Chat column */}
        <div style={card}>
          <div style={{ fontSize:20, fontWeight:800, marginBottom:12 }}>AI Tutor</div>
          <div style={{ marginBottom:10 }}>
            <span style={pill}>Topic: {topic}</span>{' '}
            <span style={pill}>Source: NCERT G{grade}</span>
          </div>

          {/* Transcript */}
          <div style={{ display:'flex', flexDirection:'column', gap:12, minHeight:220 }}>
            {messages.slice(1).map((m,i)=>
              m.role==='bot' ? <div key={i}>{botBubble(<div dangerouslySetInnerHTML={{__html: m.text.replace(/\n/g,'<br/>')}} />)}</div>
                              : <div key={i}>{youBubble(m.text)}</div>
            )}
          </div>

          {/* Composer */}
          <div style={{ marginTop:12 }}>
            <input style={input} placeholder="Ask a question…" value={inputText} onChange={e=>setInputText(e.target.value)} onKeyDown={e=>{if(e.key==='Enter') onSend();}} />
            <div style={{ display:'flex', gap:8, marginTop:10, alignItems:'center', flexWrap:'wrap' }}>
              <span style={{ fontSize:12, color:T.sub }}>Mode</span>
              {['standard','eli5','socratic','steps'].map(m=>(
                <button key={m} onClick={()=>{setMode(m); if(m!=='socratic') setComfort(null);}}
                  style={{ padding:'6px 10px', borderRadius:999, border:`1px solid ${T.border}`,
                           background: mode===m ? T.primary : '#0b1220', color: mode===m ? '#001b1f' : T.text }}>
                  {m==='eli5'?'ELI5': m[0].toUpperCase()+m.slice(1)}
                </button>
              ))}
              {mode==='socratic' && (
                <>
                  <span style={{ marginLeft:8, fontSize:12, color:T.sub }}>Comfort</span>
                  {['Not at all','A bit','Mostly',"I've got it"].map(c=>(
                    <button key={c} onClick={()=>setComfort(c.toLowerCase())}
                      style={{ padding:'6px 10px', borderRadius:999, border:`1px solid ${T.border}`,
                               background: comfort===c.toLowerCase()?T.primary:'#0b1220', color: comfort===c.toLowerCase()?'#001b1f':T.text }}>
                      {c}
                    </button>
                  ))}
                </>
              )}
              <div style={{ flex:1 }} />
              <button onClick={onSend}
                style={{ padding:'10px 14px', borderRadius:10, border:`1px solid ${T.border}`, background:T.primary, color:'#001b1f', fontWeight:700 }}>
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Side panel */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div style={card}>
            <div style={label}>Completion without human help</div>
            <div style={{ fontSize:28, fontWeight:800 }}>82%</div>
          </div>
          <div style={card}>
            <div style={label}>Recommended next</div>
            <div style={{ fontSize:22, fontWeight:800 }}>2-step equations (easy)</div>
          </div>
          <div style={card}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div>
                <div style={label}>Subject</div>
                <select style={input} value={subject} onChange={e=>{setSubject(e.target.value); setTopic(TOPICS[e.target.value][0]);}}>
                  {SUBJECTS.map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <div style={label}>Grade</div>
                <select style={input} value={String(grade)} onChange={e=>setGrade(String(e.target.value))}>
                  {GRADES.map(g=><option key={g} value={g}>G{g}</option>)}
                </select>
              </div>
              <div style={{ gridColumn:'span 2' }}>
                <div style={label}>Topic</div>
                <select style={input} value={topic} onChange={e=>setTopic(e.target.value)}>
                  {(TOPICS[subject]||[]).map(t=><option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <div style={label}>Difficulty</div>
                <select style={input} value={difficulty} onChange={e=>setDifficulty(e.target.value)}>
                  {DIFFS.map(d=><option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <div style={label}>Count</div>
                <input style={input} type="number" min={1} max={20} value={count} onChange={e=>setCount(Number(e.target.value||5))} />
              </div>
            </div>
            <div style={{ marginTop:12 }}>
              <button onClick={onMakePractice}
                style={{ padding:'10px 14px', borderRadius:10, border:`1px solid ${T.border}`, background:T.primary, color:'#001b1f', fontWeight:700 }}>
                Make a practice set
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

