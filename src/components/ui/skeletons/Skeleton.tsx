import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "line" | "circle" | "rectangle";
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  variant = "rectangle",
  width,
  height,
  className,
  ...props
}: SkeletonProps) {
  const baseClass = "bg-slate-200 dark:bg-slate-700 animate-pulse rounded";

  const variantClass = {
    line: "h-4 w-full",
    circle: "rounded-full",
    rectangle: "h-8 w-full",
  }[variant];

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === "number" ? `${width}px` : width;
  if (height) style.height = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      className={cn(baseClass, variantClass, className)}
      style={style}
      {...props}
    />
  );
}
