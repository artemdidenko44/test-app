import * as React from "react";
import { Content as PopoverContent } from "../popover";
import { useComboboxContext } from "./combobox";

type ComboboxContentProps = {
  children: React.ReactNode;
  className?: string;
};

export function ComboboxContent({
  children,
  className,
}: ComboboxContentProps) {
  const { open } = useComboboxContext();

  if (!open) return null;

  return (
    <PopoverContent
      className={[
        "min-w-[340px] rounded-md bg-background p-2 shadow-md",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </PopoverContent>
  );
}
