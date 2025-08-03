export default function Loading({ text = "Thinking…" }) {
  return (
    <div className="card">
      <div className="row">
        <div className="badge">AI</div>
        <div>{text}</div>
      </div>
    </div>
  )
}
