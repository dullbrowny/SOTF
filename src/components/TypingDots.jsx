export default function TypingDots({ text = "Generating" }) {
  return (
    <div className="badge" aria-live="polite">
      {text}<span className="dots"><span>.</span><span>.</span><span>.</span></span>
    </div>
  );
}
