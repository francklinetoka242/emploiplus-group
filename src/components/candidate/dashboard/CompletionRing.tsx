import {
  animate as animateValue,
  motion,
  useMotionValue,
  useMotionValueEvent,
} from "framer-motion";
import { CheckCircle } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import type { CompletionItem } from "@/features/profile/types";

interface CompletionRingProps {
  percentage: number;
  items: CompletionItem[];
  animate: boolean;
}

function getSegmentPath(index: number, count: number): string {
  const gap = 5;
  const start = (-90 + index * (360 / count) + gap / 2) * (Math.PI / 180);
  const end = (-90 + (index + 1) * (360 / count) - gap / 2) * (Math.PI / 180);
  const radius = 31;
  const startX = 38 + radius * Math.cos(start);
  const startY = 38 + radius * Math.sin(start);
  const endX = 38 + radius * Math.cos(end);
  const endY = 38 + radius * Math.sin(end);
  return `M ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${endY}`;
}

export function CompletionRing({ percentage, items, animate }: CompletionRingProps) {
  const completedCount = items.filter((item) => item.isCompleted).length;
  const totalCount = items.length;
  const value = useMotionValue(animate ? 0 : percentage);
  const [displayedPercentage, setDisplayedPercentage] = useState(animate ? 0 : percentage);

  useMotionValueEvent(value, "change", (nextValue) => {
    setDisplayedPercentage(Math.round(nextValue));
  });

  useEffect(() => {
    if (!animate) {
      value.set(percentage);
      setDisplayedPercentage(percentage);
      return;
    }
    value.set(0);
    const controls = animateValue(value, percentage, { duration: 0.6, ease: "easeOut" });
    return controls.stop;
  }, [animate, percentage, value]);

  return (
    <div
      role="progressbar"
      aria-label={`Complétude du profil : ${percentage} %`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percentage}
      className="relative size-[76px] shrink-0"
    >
      <svg viewBox="0 0 76 76" className="size-full" aria-hidden="true">
        {Array.from({ length: totalCount }, (_, index) => {
          const done = items[index]?.isCompleted ?? false;
          return (
            <motion.path
              key={index}
              d={getSegmentPath(index, totalCount)}
              fill="none"
              stroke="currentColor"
              strokeWidth="5"
              strokeLinecap="round"
              className={done ? "text-white" : "text-white/25"}
              initial={animate && done ? { pathLength: 0 } : false}
              animate={{ pathLength: 1 }}
              transition={
                animate
                  ? { duration: 0.06, delay: (index / Math.max(totalCount, 1)) * 0.6 }
                  : { duration: 0 }
              }
            />
          );
        })}
      </svg>
      {totalCount > 0 && completedCount === totalCount && (
        <span
          aria-hidden="true"
          className="absolute bottom-0 right-0 flex size-5 items-center justify-center rounded-full bg-emerald-200 text-emerald-700"
        >
          <CheckCircle size={15} weight="fill" />
        </span>
      )}
      <span className="absolute inset-0 flex flex-col items-center justify-center text-white">
        <span className="flex items-baseline">
          <motion.span className="text-sm font-semibold tabular-nums">
            {displayedPercentage}
          </motion.span>
          <span className="text-[9px]">%</span>
        </span>
        <span className="text-[8px] leading-none text-white/75">
          {completedCount}/{totalCount}
        </span>
      </span>
    </div>
  );
}
