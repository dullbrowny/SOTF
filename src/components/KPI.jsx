export default function KPI({ label, value, delta }) {
  return (
    <div className="card kpi">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      {delta && <div className="badge">Δ {delta}</div>}
    </div>
  )
}
