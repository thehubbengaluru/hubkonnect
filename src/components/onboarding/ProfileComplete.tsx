import { useEffect, useState, useMemo } from "react";
import { CheckCircle } from "lucide-react";

interface Props {
  matchCount: number;
  onDone: () => void;
}

const CONFETTI_COLORS = [
  "hsl(var(--accent))",
  "hsl(var(--teal))",
  "hsl(var(--destructive))",
  "hsl(var(--info))",
  "hsl(var(--foreground))",
];

const ProfileComplete = ({ matchCount, onDone }: Props) => {
  const [phase, setPhase] = useState<"check" | "text" | "dots" | "fade">("check");

  const confettiPieces = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 1.5}s`,
        duration: `${1.5 + Math.random() * 1.5}s`,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: 4 + Math.random() * 8,
        rotation: Math.random() * 360,
      })),
    []
  );

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase("text"), 500),
      setTimeout(() => setPhase("dots"), 1000),
      setTimeout(() => setPhase("fade"), 2000),
      setTimeout(onDone, 2400),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background transition-opacity duration-300 ${
        phase === "fade" ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Confetti */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {confettiPieces.map((piece) => (
          <div
            key={piece.id}
            className="absolute animate-confetti-fall"
            style={{
              left: piece.left,
              top: -20,
              width: piece.size,
              height: piece.size * (Math.random() > 0.5 ? 1 : 2.5),
              backgroundColor: piece.color,
              animationDelay: piece.delay,
              animationDuration: piece.duration,
              transform: `rotate(${piece.rotation}deg)`,
            }}
          />
        ))}
      </div>

      {/* Checkmark */}
      <div className={`transition-all duration-500 ${phase === "check" ? "scale-0 opacity-0" : "scale-100 opacity-100"}`}>
        <div className="h-24 w-24 border-4 border-foreground bg-accent flex items-center justify-center shadow-brutal-lg mb-8">
          <CheckCircle className="h-12 w-12 text-foreground" strokeWidth={2.5} />
        </div>
      </div>

      {/* Text */}
      <div className={`text-center space-y-3 transition-all duration-300 ${
        phase === "check" ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
      }`}>
        <h1 className="font-heading text-3xl md:text-5xl uppercase">
          Profile Complete! 🎉
        </h1>
        <p className="font-mono text-base text-muted-foreground">
          We found {matchCount} people you should connect with
        </p>
      </div>

      {/* Loading dots */}
      {(phase === "dots" || phase === "fade") && (
        <div className="flex gap-2 mt-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-3 w-3 bg-foreground animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfileComplete;
