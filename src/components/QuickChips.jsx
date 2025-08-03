export default function QuickChips({ items=[], onPick }) {
  return (
    <div className="row" style={{gap:8, flexWrap:'wrap'}}>
      {items.map((t,i)=> <button key={i} className="btn secondary" onClick={()=>onPick?.(t)}>{t}</button>)}
    </div>
  )
}
