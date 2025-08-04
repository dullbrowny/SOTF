export function itemsToCSV(items) {
  const headers = ['#','Question','Answer','Alt wording A','Alt wording B','Rubric'];
  const rows = items.map((it, idx) => [
    idx + 1,
    (it.question || '').replace(/\n/g, ' '),
    it.answer || '',
    (it.altA || '').replace(/\n/g, ' '),
    (it.altB || '').replace(/\n/g, ' '),
    (it.rubric || '').replace(/\n/g, ' ')
  ]);
  const lines = [headers].concat(rows).map(cols =>
    cols.map(v => `"${String(v).replace(/"/g,'""')}"`).join(','));
  return lines.join('\n');
}

export function downloadCSV(filename, csv) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}