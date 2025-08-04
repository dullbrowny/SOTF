import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { generateAssessmentItems } from '../api/mockApi.js';

/**
 * Lightweight toast system (no external deps)
 */
function useToast() {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const show = useCallback((message) => {
    const id = ++idRef.current;
    setToasts((t) => [...t, { id, message }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 1800);
  }, []);

  const ToastHost = useMemo(
    () => (
      <div
        style={{
          position: 'fixed',
          right: 16,
          bottom: 16,
          display: 'flex',
          gap: 8,
          flexDirection: 'column',
          zIndex: 9999,
        }}
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              background: '#1f2937',
              color: 'white',
              padding: '8px 12px',
              borderRadius: 8,
              boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
              fontSize: 14,
              maxWidth: 320,
            }}
          >
            {t.message}
          </div>
        ))}
      </div>
    ),
    [toasts]
  );

  return { show, ToastHost };
}

/**
 * CSV download (client-side only)
 */
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
        r.id ?? i + 1,
        escape(r.stem),
        escape(r.answer),
        escape(r.altA),
        escape(r.altB),
        escape(r.rubric),
      ].join(',')
    ),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const subtleLabel = {
  fontSize: 12,
  color: '#6b7280',
  marginBottom: 4,
};

const inputStyle = {
  padding: '8px 10px',
  border: '1px solid #d1d5db',
  borderRadius: 8,
  width: '100%',
  fontSize: 14,
};

const buttonStyle = (primary = false) => ({
  padding: '10px 14px',
  borderRadius: 8,
  fontSize: 14,
  border: '1px solid ' + (primary ? '#2563eb' : '#d1d5db'),
  background: primary ? '#2563eb' : 'white',
  color: primary ? 'white' : '#111827',
  cursor: 'pointer',
});

const cardStyle = {
  background: 'white',
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  padding: 16,
};

const calloutStyle = {
  background: '#eef2ff',
  border: '1px solid #c7d2fe',
  color: '#3730a3',
  borderRadius: 12,
  padding: 12,
  fontWeight: 600,
};

const chip = {
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: 999,
  background: '#f3f4f6',
  border: '1px solid #e5e7eb',
  fontSize: 12,
  color: '#374151',
};

const copyAffordanceClass = 'copy-affordance';

export default function TeacherAssessmentStudio() {
  const { show, ToastHost } = useToast();

  const [seed, setSeed] = useState('Fractions — add, subtract, compare');
  const [count, setCount] = useState(8);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  // Simple “right column balance”: show a couple of compact info cards
  const varietyScore = useMemo(() => {
    if (!rows.length) return 0;
    // Example heuristic: unique stems/total * 100
    const uniq = new Set(rows.map((r) => r.stem.trim().toLowerCase())).size;
    return Math.round((uniq / rows.length) * 100);
  }, [rows]);

  const altCoverage = useMemo(() => {
    if (!rows.length) return 0;
    const withAlt = rows.filter((r) => r.altA || r.altB).length;
    return Math.round((withAlt / rows.length) * 100);
  }, [rows]);

  const handleGenerate = async () => {
    setLoading(true);
    const start = performance.now();
    try {
      const data = await generateAssessmentItems({ seed, count: Number(count) });
      // Expecting items with fields: id, stem, answer, altA, altB, rubric
      setRows(Array.isArray(data) ? data : []);
      setElapsedMs(performance.now() - start);
    } catch (err) {
      console.error(err);
      show('Generation failed. Please try again.');
    } finally {
      setLoading(false); // <- required guardrail
    }
  };

  const handleExport = () => {
    if (!rows.length) {
      show('Nothing to export yet.');
      return;
    }
    downloadCSV('assessment_items.csv', rows);
    show('Exported CSV.');
  };

  const swapIntoStem = (rowIndex, source) => {
    setRows((prev) => {
      const next = [...prev];
      const r = { ...next[rowIndex] };
      if (source === 'altA') {
        const oldStem = r.stem ?? '';
        r.stem = r.altA ?? '';
        r.altA = oldStem;
      } else if (source === 'altB') {
        const oldStem = r.stem ?? '';
        r.stem = r.altB ?? '';
        r.altB = oldStem;
      }
      next[rowIndex] = r;
      return next;
    });
  };

  const copyText = async (text, label = 'Copied') => {
    try {
      await navigator.clipboard.writeText(text ?? '');
      show(`${label} to clipboard.`);
    } catch {
      show('Copy failed.');
    }
  };

  // Keyboard accessibility: Enter on alt chips to swap
  const onAltKeyDown = (e, idx, src) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      swapIntoStem(idx, src);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      {/* Top: Controls */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ minWidth: 280, flex: '1 1 340px' }}>
          <div style={subtleLabel}>Seed</div>
          <input
            style={inputStyle}
            type="text"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            placeholder="e.g., Fractions — add, subtract, compare"
          />
        </div>

        <div style={{ width: 140 }}>
          <div style={subtleLabel}>Count</div>
          <input
            style={inputStyle}
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button style={buttonStyle(true)} disabled={loading} onClick={handleGenerate}>
            {loading ? 'Generating…' : 'Generate'}
          </button>
          <button style={buttonStyle(false)} onClick={handleExport} disabled={loading}>
            Export CSV
          </button>
        </div>
      </div>

      {/* Callout: Questions generated + elapsed time */}
      <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={calloutStyle}>
          {rows.length ? `${rows.length} Questions generated` : 'No questions yet'}
          {rows.length ? (
            <span style={{ fontWeight: 500, marginLeft: 8 }}>
              (in {(elapsedMs / 1000).toFixed(2)}s)
            </span>
          ) : null}
        </div>
        {!!rows.length && (
          <div style={{ ...chip }}>Seed: “{seed.slice(0, 48)}{seed.length > 48 ? '…' : ''}”</div>
        )}
      </div>

      {/* Main layout: table + right sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, marginTop: 16 }}>
        {/* Left: Items table */}
        <div style={{ ...cardStyle, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                borderCollapse: 'separate',
                borderSpacing: 0,
                width: '100%',
                fontSize: 14,
              }}
            >
              <thead>
                <tr>
                  {['#', 'Stem', 'Answer', 'Alt A', 'Alt B', 'Rubric'].map((h, i) => (
                    <th
                      key={i}
                      style={{
                        textAlign: 'left',
                        background: '#f9fafb',
                        borderBottom: '1px solid #e5e7eb',
                        padding: '10px 12px',
                        position: 'sticky',
                        top: 0,
                        zIndex: 1,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr key={r.id ?? idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    {/* # */}
                    <td style={{ padding: '10px 12px', verticalAlign: 'top', color: '#6b7280' }}>
                      {r.id ?? idx + 1}
                    </td>

                    {/* Stem with copy on hover */}
                    <td style={{ padding: '10px 12px', verticalAlign: 'top', position: 'relative' }}>
                      <div
                        style={{
                          lineHeight: 1.4,
                          paddingRight: 28,
                        }}
                        title="Question stem"
                      >
                        {r.stem}
                      </div>

                      <button
                        className={copyAffordanceClass}
                        aria-label="Copy stem"
                        onClick={() => copyText(r.stem, 'Stem copied')}
                        title="Copy stem"
                        style={{
                          position: 'absolute',
                          right: 8,
                          top: 8,
                          border: '1px solid #e5e7eb',
                          background: 'white',
                          borderRadius: 6,
                          padding: '2px 6px',
                          fontSize: 12,
                          cursor: 'pointer',
                          opacity: 0,
                          transition: 'opacity 120ms',
                        }}
                      >
                        Copy
                      </button>
                    </td>

                    {/* Answer */}
                    <td style={{ padding: '10px 12px', verticalAlign: 'top', position: 'relative' }}>
                      <div style={{ lineHeight: 1.4, paddingRight: 28 }}>{r.answer}</div>
                      <button
                        className={copyAffordanceClass}
                        aria-label="Copy answer"
                        onClick={() => copyText(r.answer, 'Answer copied')}
                        title="Copy answer"
                        style={{
                          position: 'absolute',
                          right: 8,
                          top: 8,
                          border: '1px solid #e5e7eb',
                          background: 'white',
                          borderRadius: 6,
                          padding: '2px 6px',
                          fontSize: 12,
                          cursor: 'pointer',
                          opacity: 0,
                          transition: 'opacity 120ms',
                        }}
                      >
                        Copy
                      </button>
                    </td>

                    {/* Alt A (click to swap + copy on hover) */}
                    <td style={{ padding: '10px 12px', verticalAlign: 'top', position: 'relative' }}>
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => swapIntoStem(idx, 'altA')}
                        onKeyDown={(e) => onAltKeyDown(e, idx, 'altA')}
                        title="Click to swap Alt A into stem"
                        style={{
                          lineHeight: 1.4,
                          border: '1px dashed #e5e7eb',
                          borderRadius: 8,
                          padding: 8,
                          cursor: 'pointer',
                          background: '#fcfcfc',
                          paddingRight: 34,
                        }}
                      >
                        {r.altA || <span style={{ color: '#9ca3af' }}>—</span>}
                      </div>

                      <button
                        className={copyAffordanceClass}
                        aria-label="Copy Alt A"
                        onClick={() => copyText(r.altA ?? '', 'Alt A copied')}
                        title="Copy Alt A"
                        style={{
                          position: 'absolute',
                          right: 8,
                          top: 8,
                          border: '1px solid #e5e7eb',
                          background: 'white',
                          borderRadius: 6,
                          padding: '2px 6px',
                          fontSize: 12,
                          cursor: 'pointer',
                          opacity: 0,
                          transition: 'opacity 120ms',
                        }}
                      >
                        Copy
                      </button>
                    </td>

                    {/* Alt B (click to swap + copy on hover) */}
                    <td style={{ padding: '10px 12px', verticalAlign: 'top', position: 'relative' }}>
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => swapIntoStem(idx, 'altB')}
                        onKeyDown={(e) => onAltKeyDown(e, idx, 'altB')}
                        title="Click to swap Alt B into stem"
                        style={{
                          lineHeight: 1.4,
                          border: '1px dashed #e5e7eb',
                          borderRadius: 8,
                          padding: 8,
                          cursor: 'pointer',
                          background: '#fcfcfc',
                          paddingRight: 34,
                        }}
                      >
                        {r.altB || <span style={{ color: '#9ca3af' }}>—</span>}
                      </div>

                      <button
                        className={copyAffordanceClass}
                        aria-label="Copy Alt B"
                        onClick={() => copyText(r.altB ?? '', 'Alt B copied')}
                        title="Copy Alt B"
                        style={{
                          position: 'absolute',
                          right: 8,
                          top: 8,
                          border: '1px solid #e5e7eb',
                          background: 'white',
                          borderRadius: 6,
                          padding: '2px 6px',
                          fontSize: 12,
                          cursor: 'pointer',
                          opacity: 0,
                          transition: 'opacity 120ms',
                        }}
                      >
                        Copy
                      </button>
                    </td>

                    {/* Rubric */}
                    <td style={{ padding: '10px 12px', verticalAlign: 'top', position: 'relative' }}>
                      <div style={{ lineHeight: 1.4, paddingRight: 28 }}>
                        {r.rubric || <span style={{ color: '#9ca3af' }}>—</span>}
                      </div>
                      <button
                        className={copyAffordanceClass}
                        aria-label="Copy rubric"
                        onClick={() => copyText(r.rubric ?? '', 'Rubric copied')}
                        title="Copy rubric"
                        style={{
                          position: 'absolute',
                          right: 8,
                          top: 8,
                          border: '1px solid #e5e7eb',
                          background: 'white',
                          borderRadius: 6,
                          padding: '2px 6px',
                          fontSize: 12,
                          cursor: 'pointer',
                          opacity: 0,
                          transition: 'opacity 120ms',
                        }}
                      >
                        Copy
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!rows.length && (
            <div style={{ padding: 12, color: '#6b7280', fontSize: 14 }}>
              Tip: enter a seed and click <b>Generate</b> to create assessment items.
            </div>
          )}
        </div>

        {/* Right: Balanced info column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={cardStyle}>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Variety</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{varietyScore}%</div>
            <div style={{ marginTop: 6, fontSize: 12, color: '#6b7280' }}>
              Unique stems / total items.
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Alt coverage</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{altCoverage}%</div>
            <div style={{ marginTop: 6, fontSize: 12, color: '#6b7280' }}>
              Items with Alt A or Alt B present.
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Session</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span style={chip}>Items: {rows.length}</span>
              <span style={chip}>Elapsed: {(elapsedMs / 1000).toFixed(2)}s</span>
              <span style={chip}>Seed length: {seed.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hover CSS for copy affordance */}
      <style>
        {`
          td:hover .${copyAffordanceClass} { opacity: 1; }
          button:disabled { opacity: 0.6; cursor: not-allowed; }
          @media (max-width: 960px) {
            .right-col { grid-column: 1 / -1; }
          }
        `}
      </style>

      {ToastHost}
    </div>
  );
}

