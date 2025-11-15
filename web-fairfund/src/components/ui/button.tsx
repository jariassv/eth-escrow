"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-[rgb(var(--primary))] via-[rgb(var(--accent))] to-[rgb(var(--accent-secondary))] text-[rgb(var(--primary-foreground))] shadow-[0_10px_25px_-15px_rgba(59,130,246,0.6)] hover:opacity-95 focus-visible:outline-[rgb(var(--primary))]",
  secondary:
    "bg-[rgb(var(--surface-muted))] text-[rgb(var(--foreground))] hover:bg-[rgb(var(--surface))] focus-visible:outline-[rgb(var(--foreground))]",
  ghost:
    "bg-transparent text-[rgb(var(--foreground))] hover:bg-[rgb(var(--surface-muted))] focus-visible:outline-[rgb(var(--foreground))]",
  outline:
    "border border-[rgb(var(--border))] text-[rgb(var(--foreground))] hover:bg-[rgb(var(--surface-muted))] focus-visible:outline-[rgb(var(--foreground))]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-6 text-base",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={isLoading || disabled}
        {...props}
      >
        {isLoading && (
          <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

