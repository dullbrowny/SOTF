import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { generateAssessmentItems, api } from '../api/mockApi.js';
import { useDemoData } from '../demoData.jsx'; // adjust if your path differs

/* toast */
function useToast() {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);
  const show = useCallback((message) => {
    const id = ++idRef.current;
    setToasts((t) => [...t, { id, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 1800);
  }, []);
  const ToastHost = (
    <div style={{ position: 'fixed', right: 16, bottom: 16, display: 'flex', flexDirection: 'column', gap: 8, zIndex: 9999 }} aria-live="polite" aria-atomic="true">
      {toasts.map((t) => (
        <div key={t.id} style={{ background: '#0b1220', color: '#e5e7eb', padding: '8px 12px', borderRadius: 8, border: '1px solid #1f2937', boxShadow: '0 8px 20px rgba(0,0,0,0.35)', fontSize: 14 }}>
          {t.message}
        </div>
      ))}
    </div>
  );
  return { show, ToastHost };
}

/* CSV */
function downloadCSV(filename, rows) {
  const headers = ['id', 'stem', 'answer', 'altA', 'altB', 'rubric'];
  const escape = (v) => {
    if (v == null) return '';
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [
    headers.join(','),
    ...rows.map((r, i) =>
      [
        r?.id ?? i + 1,
        escape(r?.stem),
        escape(r?.answer),
        escape(r?.altA),
        escape(r?.altB),
        escape(r?.rubric),
      ].join(',')
    ),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.style.display = 'none';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* theme */
const T = {
  bg: '#0a0f1a', card: '#0f172a', cardBorder: '#1f2937', text: '#e5e7eb',
  subtext: '#9ca3af', header: '#0b1220', rowHover: '#111827',
  chipBg: '#0b1220', chipBorder: '#1f2937', primary: '#2563eb',
};
const subtleLabel = { fontSize: 12, color: T.subtext, marginBottom: 4 };
const inputStyle = { padding: '8px 10px', border: `1px solid ${T.cardBorder}`, background: T.header, borderRadius: 8, width: '100%', fontSize: 14, color: T.text };
const selectStyle = { ...inputStyle, width: 220 };
const smallSelect = { ...inputStyle, width: 140 };
const buttonStyle = (primary=false)=>({ padding:'10px 14px', borderRadius:8, fontSize:14, border: primary?`1px solid ${T.primary}`:`1px solid ${T.cardBorder}`, background: primary?T.primary:T.header, color: primary?'white':T.text, cursor:'pointer' });
const cardStyle = { background: T.card, border: `1px solid ${T.cardBorder}`, borderRadius: 12, padding: 16, color: T.text };
const calloutWrap = { background:'linear-gradient(180deg, rgba(37,99,235,0.18), rgba(37,99,235,0.08))', border:'1px solid rgba(99,102,241,0.35)', color:'#c7d2fe', borderRadius:12, padding:12, fontWeight:600 };
const chip = { display:'inline-block', padding:'2px 8px', borderRadius:999, background:T.chipBg, border:`1px solid ${T.chipBorder}`, fontSize:12, color:T.text };
const copyAffordanceClass = 'copy-affordance';

/* subject/grade presets */
const SUBJECTS = ['Math', 'Science'];
const GRADES = ['6','7','8','9','10'];

const PRESETS = {
  Math: {
    '6': ['Fractions — add, subtract, compare', 'Decimals — place value', 'Integers — basics', 'Geometry — rectangles'],
    '7': ['Fractions — add, subtract, compare', 'Decimals — rounding', 'Integers — operations', 'Geometry — area & perimeter', 'Algebra — simple equations'],
    '8': ['Fractions — add, subtract, compare', 'Decimals — mixed precision', 'Integers — operations', 'Geometry — area & perimeter', 'Algebra — simple equations'],
    '9': ['Integers — operations', 'Geometry — area & perimeter', 'Algebra — simple equations', 'Decimals — mixed precision'],
    '10': ['Algebra — simple equations', 'Geometry — area & perimeter', 'Integers — operations'],
  },
  Science: {
    '6': ['Physics — speed problems', 'Chemistry — density'],
    '7': ['Physics — speed problems', 'Chemistry — density'],
    '8': ['Physics — speed problems', 'Chemistry — density'],
    '9': ['Physics — speed problems', 'Chemistry — density'],
    '10': ['Physics — speed problems', 'Chemistry — density'],
  },
};

const deepCopy = (x) => JSON.parse(JSON.stringify(x));

export default function TeacherAssessmentStudio() {
  const { show, ToastHost } = useToast();
  const { grade, setGrade } = useDemoData(); // global Grade from header

  const [subject, setSubject] = useState('Math');
  const [seed, setSeed] = useState(() => PRESETS['Math'][String(grade) || '7']?.[0] ?? 'Fractions — add, subtract, compare');
  const [count, setCount] = useState(8);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  const presetsForSG = useMemo(() => deepCopy(PRESETS[subject]?.[String(grade)] ?? []), [subject, grade]);

  useEffect(() => {
    if (!presetsForSG.length) return;
    const s = String(seed).toLowerCase();
    const hints = subject === 'Science'
      ? ['phys','speed','velocity','distance','density','chem']
      : ['fraction','decimal','integer','geometry','algebra'];
    const hit = hints.some(h => s.includes(h));
    if (!hit) setSeed(presetsForSG[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject, grade]);

  const varietyScore = useMemo(() => {
    if (!rows?.length) return 0;
    const uniq = new Set(rows.map((r) => (r?.stem ? String(r.stem) : '').trim().toLowerCase())).size;
    return Math.round((uniq / rows.length) * 100);
  }, [rows]);

  const altCoverage = useMemo(() => {
    if (!rows?.length) return 0;
    const withAlt = rows.filter((r) => (r?.altA ?? '') !== '' || (r?.altB ?? '') !== '').length;
    return Math.round((withAlt / rows.length) * 100);
  }, [rows]);

  const handleGenerate = async () => {
    setLoading(true);
    const start = performance.now();
    try {
      const n = Number(count);
      const payload = { seed, count: n, subject, grade: String(grade) };
      const attempts = [
        () => generateAssessmentItems?.(payload),
        () => generateAssessmentItems?.(seed, n),
        () => api?.generateAssessmentItems?.(payload),
        () => api?.generateAssessmentItems?.(seed, n),
      ];
      let data, items = [];
      for (const call of attempts) {
        if (!call) continue;
        try {
          data = await call();
          items = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
          if (items.length) break;
        } catch {}
      }
      if (!items.length) {
        console.warn('generateAssessmentItems: unexpected shape', data);
        show('No items returned. Check mockApi (see console).');
      }
      setRows(items || []);
      setElapsedMs(performance.now() - start);
    } catch (err) {
      console.error(err);
      show('Generation failed. See console.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!rows?.length) return show('Nothing to export yet.');
    downloadCSV(`assessment_${subject}_G${grade}.csv`, rows);
    show('Exported CSV.');
  };

  const swapIntoStem = (rowIndex, source) => {
    setRows((prev) => {
      const next = [...prev];
      const r = { ...(next[rowIndex] ?? {}) };
      const oldStem = r.stem ?? '';
      if (source === 'altA') { r.stem = r.altA ?? ''; r.altA = oldStem; }
      else if (source === 'altB') { r.stem = r.altB ?? ''; r.altB = oldStem; }
      next[rowIndex] = r; return next;
    });
  };

  const copyText = async (text, label = 'Copied') => {
    try { await navigator.clipboard.writeText(text ?? ''); show(`${label} to clipboard.`); }
    catch { show('Copy failed.'); }
  };
  const onAltKeyDown = (e, idx, src) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); swapIntoStem(idx, src); }
  };

  return (
    <div style={{ padding: 20, background: T.bg, minHeight: '100vh', color: T.text }}>
      <div style={{ color: '#9ca3af', fontSize: 12, marginBottom: 6 }}>Assessment • v2</div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div>
          <div style={subtleLabel}>Subject</div>
          <select style={smallSelect} value={subject} onChange={(e)=>{ setSubject(e.target.value); }}>
            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <div style={subtleLabel}>Grade</div>
          {/* Bound to global grade from header */}
          <select style={smallSelect} value={String(grade)} onChange={(e)=> setGrade(String(e.target.value))}>
            {GRADES.map(g => <option key={g} value={g}>G{g}</option>)}
          </select>
        </div>

        <div style={{ minWidth: 280, flex: '1 1 360px' }}>
          <div style={subtleLabel}>Seed</div>
          <input style={inputStyle} type="text" value={seed} onChange={(e) => setSeed(e.target.value)} />
        </div>

        <div>
          <div style={subtleLabel}>Presets</div>
          <select style={selectStyle} value={'__custom__'} onChange={(e) => {
            const v = e.target.value;
            if (v !== '__custom__') setSeed(v);
          }}>
            <option value="__custom__">— choose preset —</option>
            {(presetsForSG).map((p) => (<option key={p} value={p}>{p}</option>))}
          </select>
        </div>

        <div style={{ width: 120 }}>
          <div style={subtleLabel}>Count</div>
          <input style={inputStyle} type="number" min={1} max={100} value={count} onChange={(e) => setCount(e.target.value)} />
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button style={buttonStyle(true)} disabled={loading} onClick={handleGenerate}>
            {loading ? 'Generating…' : 'Generate'}
          </button>
          <button style={buttonStyle(false)} onClick={handleExport} disabled={loading}>Export CSV</button>
        </div>
      </div>

      {/* Callout */}
      <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={calloutWrap}>
          {rows?.length ? `${rows.length} Questions generated` : 'No questions yet'}
          {rows?.length ? <span style={{ fontWeight: 500, marginLeft: 8 }}>(in {(elapsedMs / 1000).toFixed(2)}s)</span> : null}
        </div>
        {!!rows?.length && <div style={chip}>Seed: “{seed.slice(0, 48)}{seed.length > 48 ? '…' : ''}”</div>}
      </div>

      {/* Main */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, marginTop: 16 }}>
        {/* Table */}
        <div style={{ ...cardStyle, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'separate', borderSpacing: 0, width: '100%', fontSize: 14, color: T.text }}>
              <thead>
                <tr>
                  {['#', 'Stem', 'Answer', 'Alt A', 'Alt B', 'Rubric'].map((h, i) => (
                    <th key={i} style={{ textAlign: 'left', background: T.header, color: T.subtext, borderBottom: `1px solid ${T.cardBorder}`, padding: '10px 12px', position: 'sticky', top: 0, zIndex: 1, fontWeight: 600 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(rows ?? []).map((r, idx) => (
                  <tr key={r?.id ?? idx} style={{ borderBottom: `1px solid ${T.cardBorder}`, background: 'transparent' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = T.rowHover)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '10px 12px', verticalAlign: 'top', color: T.subtext }}>{r?.id ?? idx + 1}</td>

                    <td style={{ padding: '10px 12px', verticalAlign: 'top', position: 'relative' }}>
                      <div style={{ lineHeight: 1.4, paddingRight: 28 }}>{r?.stem ?? ''}</div>
                      <button className={copyAffordanceClass} aria-label="Copy stem" onClick={() => copyText(r?.stem ?? '', 'Stem copied')}
                        title="Copy stem" style={{ position: 'absolute', right: 8, top: 8, border: `1px solid ${T.cardBorder}`, background: T.header, color: T.text, borderRadius: 6, padding: '2px 6px', fontSize: 12, cursor: 'pointer', opacity: 0, transition: 'opacity 120ms' }}>Copy</button>
                    </td>

                    <td style={{ padding: '10px 12px', verticalAlign: 'top', position: 'relative' }}>
                      <div style={{ lineHeight: 1.4, paddingRight: 28 }}>{r?.answer ?? ''}</div>
                      <button className={copyAffordanceClass} aria-label="Copy answer" onClick={() => copyText(r?.answer ?? '', 'Answer copied')}
                        title="Copy answer" style={{ position: 'absolute', right: 8, top: 8, border: `1px solid ${T.cardBorder}`, background: T.header, color: T.text, borderRadius: 6, padding: '2px 6px', fontSize: 12, cursor: 'pointer', opacity: 0, transition: 'opacity 120ms' }}>Copy</button>
                    </td>

                    <td style={{ padding: '10px 12px', verticalAlign: 'top', position: 'relative' }}>
                      <div role="button" tabIndex={0} onClick={() => swapIntoStem(idx, 'altA')} onKeyDown={(e) => onAltKeyDown(e, idx, 'altA')}
                           title="Click to swap Alt A into stem"
                           style={{ lineHeight: 1.4, border: `1px dashed ${T.cardBorder}`, borderRadius: 8, padding: 8, cursor: 'pointer', background: T.header, paddingRight: 34, color: (r?.altA ?? '') ? T.text : T.subtext }}>
                        {r?.altA ?? '—'}
                      </div>
                      <button className={copyAffordanceClass} aria-label="Copy Alt A" onClick={() => copyText(r?.altA ?? '', 'Alt A copied')}
                        title="Copy Alt A" style={{ position: 'absolute', right: 8, top: 8, border: `1px solid ${T.cardBorder}`, background: T.header, color: T.text, borderRadius: 6, padding: '2px 6px', fontSize: 12, cursor: 'pointer', opacity: 0, transition: 'opacity 120ms' }}>Copy</button>
                    </td>

                    <td style={{ padding: '10px 12px', verticalAlign: 'top', position: 'relative' }}>
                      <div role="button" tabIndex={0} onClick={() => swapIntoStem(idx, 'altB')} onKeyDown={(e) => onAltKeyDown(e, idx, 'altB')}
                           title="Click to swap Alt B into stem"
                           style={{ lineHeight: 1.4, border: `1px dashed ${T.cardBorder}`, borderRadius: 8, padding: 8, cursor: 'pointer', background: T.header, paddingRight: 34, color: (r?.altB ?? '') ? T.text : T.subtext }}>
                        {r?.altB ?? '—'}
                      </div>
                      <button className={copyAffordanceClass} aria-label="Copy Alt B" onClick={() => copyText(r?.altB ?? '', 'Alt B copied')}
                        title="Copy Alt B" style={{ position: 'absolute', right: 8, top: 8, border: `1px solid ${T.cardBorder}`, background: T.header, color: T.text, borderRadius: 6, padding: '2px 6px', fontSize: 12, cursor: 'pointer', opacity: 0, transition: 'opacity 120ms' }}>Copy</button>
                    </td>

                    <td style={{ padding: '10px 12px', verticalAlign: 'top', position: 'relative' }}>
                      <div style={{ lineHeight: 1.4, paddingRight: 28, color: (r?.rubric ?? '') ? T.text : T.subtext }}>{r?.rubric ?? '—'}</div>
                      <button className={copyAffordanceClass} aria-label="Copy rubric" onClick={() => copyText(r?.rubric ?? '', 'Rubric copied')}
                        title="Copy rubric" style={{ position: 'absolute', right: 8, top: 8, border: `1px solid ${T.cardBorder}`, background: T.header, color: T.text, borderRadius: 6, padding: '2px 6px', fontSize: 12, cursor: 'pointer', opacity: 0, transition: 'opacity 120ms' }}>Copy</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!rows?.length && (
            <div style={{ padding: 12, color: T.subtext, fontSize: 14 }}>
              Tip: pick Subject & Grade, choose/edit a Seed, then click <b>Generate</b>.
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={cardStyle}>
            <div style={{ fontSize: 12, color: T.subtext, marginBottom: 6 }}>Variety</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#c7d2fe' }}>{varietyScore}%</div>
            <div style={{ marginTop: 6, fontSize: 12, color: T.subtext }}>Unique stems / total items.</div>
          </div>

          <div style={cardStyle}>
            <div style={{ fontSize: 12, color: T.subtext, marginBottom: 6 }}>Alt coverage</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#93c5fd' }}>{altCoverage}%</div>
            <div style={{ marginTop: 6, fontSize: 12, color: T.subtext }}>Items with Alt A or Alt B present.</div>
          </div>

          <div style={cardStyle}>
            <div style={{ fontSize: 12, color: T.subtext, marginBottom: 6 }}>Session</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span style={chip}>Subject: {subject}</span>
              <span style={chip}>Grade: {String(grade)}</span>
              <span style={chip}>Items: {rows?.length ?? 0}</span>
              <span style={chip}>Elapsed: {(elapsedMs / 1000).toFixed(2)}s</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        td:hover .${copyAffordanceClass} { opacity: 1; }
        button:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      {ToastHost}
    </div>
  );
}

