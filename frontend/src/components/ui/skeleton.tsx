import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-accent-blue/10", className)}
      style={style}
    />
  );
}

export function ChartSkeleton({ height = 280 }: { height?: number }) {
  return (
    <div className="glass-card p-6">
      <Skeleton className="mb-4 h-5 w-48" />
      <Skeleton className="w-full" style={{ height }} />
    </div>
  );
}
