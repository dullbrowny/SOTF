export default function ProgressBar({ value=0, max=1, label }) {
  const pct = Math.round((value/Math.max(1,max))*100);
  return (
    <div className="progress" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}>
      <div className="progress-bar" style={{ width: pct + '%' }} />
      <div className="progress-label">{label ?? pct + '%'}</div>
    </div>
  );
}
