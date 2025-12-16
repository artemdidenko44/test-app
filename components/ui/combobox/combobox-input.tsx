import * as React from "react";
import { Input } from "../input";
import { useComboboxContext } from "./combobox";

type ComboboxInputProps = {
  placeholder?: string;
  className?: string;
  onValueChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
};

export const ComboboxInput = React.forwardRef<
  HTMLInputElement,
  ComboboxInputProps
>(function ComboboxInputInner(
  { placeholder, className, onValueChange, onSubmit }: ComboboxInputProps,
  ref
) {
  const {
    inputValue,
    setInputValue,
    setActiveIndex,
    setOpen,
  } = useComboboxContext();

  return (
    <Input
      ref={ref}
      variant="search"
      placeholder={placeholder}
      className={className}
      value={inputValue}
      onFocus={() => setOpen(true)}
      onClick={() => setOpen(true)}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
        setActiveIndex(0);
        onValueChange?.(value);
      }}
      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
        switch (e.key) {
          case "Enter":
            e.preventDefault();
            setOpen(false);
            onSubmit?.(inputValue);
            e.currentTarget.blur();
            break;

          case "Escape":
            e.preventDefault();
            setOpen(false);
            e.currentTarget.blur();
            break;
        }
      }}
    />
  );
});
