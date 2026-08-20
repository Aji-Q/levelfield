// The instrument signature: a 0–100 tick ruler with the score's marker dropped on it.
// Band boundaries (25/50/75) get taller ticks; the number always appears elsewhere with
// its band word, so the meter carries position, not color-coded judgment.
export function Meter({ score, compact = false }: { score: number; compact?: boolean }) {
  const x = 8 + (Math.max(0, Math.min(100, score)) / 100) * 284; // 8..292 plot area
  const ticks: React.ReactNode[] = [];
  for (let v = 0; v <= 100; v += 5) {
    const tx = 8 + (v / 100) * 284;
    const major = v % 25 === 0;
    ticks.push(
      <line
        key={v}
        x1={tx}
        y1={major ? 10 : 15}
        x2={tx}
        y2={20}
        stroke="currentColor"
        strokeWidth={major ? 1.1 : 0.6}
        opacity={major ? 0.75 : 0.32}
      />,
    );
  }
  return (
    <svg
      className={compact ? "meter meter--compact" : "meter"}
      viewBox="0 0 300 30"
      role="img"
      aria-label={`Score ${score} on a 0 to 100 scale`}
    >
      <line x1="8" y1="20" x2="292" y2="20" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      {ticks}
      {!compact && (
        <>
          <text x="8" y="29" textAnchor="middle" className="meter-label">0</text>
          <text x="79" y="29" textAnchor="middle" className="meter-label">25</text>
          <text x="150" y="29" textAnchor="middle" className="meter-label">50</text>
          <text x="221" y="29" textAnchor="middle" className="meter-label">75</text>
          <text x="292" y="29" textAnchor="middle" className="meter-label">100</text>
        </>
      )}
      <path d={`M ${x} 17 l -4 -7.5 h 8 z`} className="meter-marker" />
    </svg>
  );
}
