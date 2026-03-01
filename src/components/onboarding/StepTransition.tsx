import { useState, useEffect, useRef } from "react";

interface Props {
  stepKey: number;
  direction: "forward" | "back";
  children: React.ReactNode;
}

const StepTransition = ({ stepKey, direction, children }: Props) => {
  const [displayChildren, setDisplayChildren] = useState(children);
  const [phase, setPhase] = useState<"enter" | "exit">("enter");
  const prevKey = useRef(stepKey);

  useEffect(() => {
    if (stepKey !== prevKey.current) {
      setPhase("exit");
      const timer = setTimeout(() => {
        setDisplayChildren(children);
        setPhase("enter");
        prevKey.current = stepKey;
      }, 200);
      return () => clearTimeout(timer);
    } else {
      setDisplayChildren(children);
    }
  }, [stepKey, children]);

  const exitTransform = direction === "forward" ? "translateX(-40px)" : "translateX(40px)";
  const enterTransform = direction === "forward" ? "translateX(40px)" : "translateX(-40px)";

  return (
    <div
      className="transition-all duration-200 ease-out"
      style={{
        opacity: phase === "exit" ? 0 : 1,
        transform:
          phase === "exit"
            ? exitTransform
            : phase === "enter"
            ? "translateX(0)"
            : enterTransform,
      }}
    >
      {displayChildren}
    </div>
  );
};

export default StepTransition;
