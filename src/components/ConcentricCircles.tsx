const ConcentricCircles = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 600 600"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {[120, 180, 240, 300].map((r, i) => (
      <circle
        key={r}
        cx="300"
        cy="300"
        r={r}
        stroke="currentColor"
        strokeWidth="1"
        opacity={0.08 + i * 0.04}
      />
    ))}
  </svg>
);

export default ConcentricCircles;
