// src/components/Modal.jsx
import React from 'react';

export default function Modal({ open, title, children, actions, onClose }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e)=>e.stopPropagation()}>
        <div className="row" style={{justifyContent:'space-between'}}>
          <h3 style={{margin:0}}>{title}</h3>
          <button className="btn secondary" onClick={onClose}>Close</button>
        </div>
        <div style={{marginTop:12}}>{children}</div>
        {actions && <div style={{marginTop:12, display:'flex', gap:8, justifyContent:'flex-end'}}>{actions}</div>}
      </div>
    </div>
  );
}