import * as React from "react";
import { useComboboxContext } from "./combobox/combobox";

type Size = "sm" | "md" | "lg";

type ListProps = {
  size?: Size;
  empty?: boolean;
  children: React.ReactNode;
} & React.ComponentPropsWithoutRef<"div">;

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

function List({
  size = "md",
  empty = false,
  className,
  children,
  ...props
}: ListProps) {
  const { setActiveIndex } = useComboboxContext();

  const sizes: Record<Size, string> = {
    sm: "py-1",
    md: "py-2",
    lg: "py-3",
  };

  return (
    <div
      role="listbox"
      data-empty={empty ? "" : undefined}
      onMouseLeave={() => {
        setActiveIndex(-1);
      }}
      className={cn(
        "max-h-64 overflow-y-auto rounded-md border border-black/[.08] bg-background shadow-sm dark:border-white/[.145] space-y-1",
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { List };
