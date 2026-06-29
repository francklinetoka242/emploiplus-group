import React from "react";

interface AnimatedCounterProps {
  value: string;
  className?: string;
  children?: React.ReactNode;
}

export function AnimatedCounter({ value, className, children }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = React.useState("0");
  const [shouldAnimate, setShouldAnimate] = React.useState(true);
  const target = Number.parseInt(value.replace(/\D/g, ""), 10) || 0;
  const suffix = value.replace(/\d/g, "");

  React.useEffect(() => {
    let animationFrameId = 0;
    let startTime: number | null = null;
    const duration = 1200;

    const animate = (timestamp: number) => {
      if (startTime === null) {
        startTime = timestamp;
      }

      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * eased);
      setDisplayValue(`${current}${suffix}`);

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(animate);
      } else {
        setDisplayValue(`${target}${suffix}`);
      }
    };

    if (shouldAnimate) {
      animationFrameId = window.requestAnimationFrame(animate);
    }

    return () => window.cancelAnimationFrame(animationFrameId);
  }, [shouldAnimate, target, suffix, value]);

  return (
    <span
      className={className}
      onMouseEnter={() => setShouldAnimate(true)}
      onMouseLeave={() => setShouldAnimate(false)}
    >
      {children ?? displayValue}
    </span>
  );
}
