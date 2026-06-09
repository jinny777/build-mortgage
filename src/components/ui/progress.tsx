import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  color?: "blue" | "green" | "yellow" | "red";
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, color = "blue", ...props }, ref) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    const colorMap = {
      blue: "bg-blue-500",
      green: "bg-emerald-500",
      yellow: "bg-amber-500",
      red: "bg-red-500",
    };
    return (
      <div
        ref={ref}
        className={cn("relative h-2 w-full overflow-hidden rounded-full bg-gray-100", className)}
        {...props}
      >
        <div
          className={cn("h-full transition-all duration-500", colorMap[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  }
);
Progress.displayName = "Progress";

export { Progress };
