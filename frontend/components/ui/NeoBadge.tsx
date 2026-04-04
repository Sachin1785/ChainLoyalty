import { cn } from "@/lib/utils";
import React from "react";

interface NeoBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "pink" | "green" | "blue" | "red" | "yellow" | "black";
}

export function NeoBadge({ className, variant = "pink", ...props }: NeoBadgeProps) {
  const variants = {
    pink: "bg-neo-pink text-black",
    green: "bg-neo-green text-black",
    blue: "bg-neo-blue text-black",
    red: "bg-neo-red text-white",
    yellow: "bg-neo-yellow text-black",
    black: "bg-black text-white",
  };

  return (
    <span
      className={cn(
        "neo-badge",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
