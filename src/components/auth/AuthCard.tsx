import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AuthCardProps {
  children: ReactNode;
  className?: string;
}

export function AuthCard({ children, className }: AuthCardProps) {
  return (
    <div className={cn(
      "w-full max-w-[420px] p-8 rounded-2xl",
      "bg-card/80 backdrop-blur-xl",
      "border border-border/50",
      "shadow-2xl shadow-black/50",
      className
    )}>
      {children}
    </div>
  );
}
