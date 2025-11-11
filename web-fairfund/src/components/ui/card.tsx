"use client";

import { forwardRef, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-6 shadow-sm",
        className
      )}
      {...props}
    />
  )
);

Card.displayName = "Card";

export const CardHeader = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mb-4 flex flex-col gap-2", className)} {...props} />
);

export const CardTitle = ({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={cn(
      "text-lg font-semibold text-[rgb(var(--foreground))]",
      className
    )}
    {...props}
  />
);

export const CardContent = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("text-sm text-[rgb(var(--foreground))]/80", className)} {...props} />
);

