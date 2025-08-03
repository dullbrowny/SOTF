export default function Modal({ open, title, children, onClose, actions }) {
  if (!open) return null;
  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.4)',
      display:'flex', alignItems:'center', justifyContent:'center', zIndex: 9999
    }}
      onClick={onClose}
    >
      <div className="card" style={{minWidth: 420, maxWidth: 640}} onClick={(e)=>e.stopPropagation()}>
        <h3 style={{marginTop:0}}>{title}</h3>
        <div>{children}</div>
        <div className="row" style={{justifyContent:'flex-end', gap:8, marginTop:12}}>
          {actions}
          <button className="btn secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
