import * as React from "react";

type Size = "sm" | "md" | "lg";

type OptionProps = {
  size?: Size;
  active?: boolean;
  selected?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
} & React.ComponentPropsWithoutRef<"div">;

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

function Option({
  size = "md",
  active = false,
  selected = false,
  disabled = false,
  className,
  children,
  ...props
}: OptionProps) {
  const sizes: Record<Size, string> = {
    sm: "px-2 py-1 text-sm",
    md: "px-3 py-2 text-base",
    lg: "px-4 py-3 text-lg",
  };

  return (
    <div
      role="option"
      aria-selected={selected}
      aria-disabled={disabled || undefined}
      data-active={active || undefined}
      data-selected={selected || undefined}
      className={cn(
        "flex cursor-default select-none items-center rounded-md transition-colors",
        !disabled && "hover:bg-black/[.04] dark:hover:bg-white/[.06]",
        active && "bg-black/[.06] dark:bg-white/[.08]",
        selected && "font-medium",
        disabled && "opacity-50 pointer-events-none",
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { Option };
