import { cn } from "@/lib/utils";
import React from "react";

interface NeoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hover?: boolean;
}

export function NeoCard({ children, className, hover = true, ...props }: NeoCardProps) {
  return (
    <div
      className={cn(
        "neo-card",
        hover && "neo-card-hover cursor-default",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
