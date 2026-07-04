export default function WaitingDots({ label }) {
  return (
    <span className="waiting-dots-wrap">
      {label}
      <span className="waiting-dots">
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
      </span>
    </span>
  );
}
