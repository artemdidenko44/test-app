import * as React from "react";
import { Option } from "../option";
import { useComboboxContext } from "./combobox";

type ComboboxOptionProps = {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
  onSelect?: () => void;
  displayValue?: string;
};

export function ComboboxOption({
  value,
  children,
  disabled = false,
  onSelect,
  displayValue,
}: ComboboxOptionProps) {
  const {
    activeIndex,
    setActiveIndex,
    registerOption,
    unregisterOption,
    selectOption,
    setInputValue,
  } = useComboboxContext();

  const idRef = React.useRef(value);
  const [index, setIndex] = React.useState<number | null>(null);

  React.useLayoutEffect(() => {
    const nextIndex = registerOption(idRef.current);
    setIndex(nextIndex);
    return () => unregisterOption(idRef.current);
  }, [registerOption, unregisterOption]);
  const active = index !== null && index === activeIndex;

  return (
    <Option
      active={active}
      selected={false}
      disabled={disabled}
      onClick={() => {
        if (disabled) return;
        if (index === null) return;
        selectOption(index);
        if (displayValue !== undefined) {
          setInputValue(displayValue);
        }
        onSelect?.();
      }}
    >
      {children}
    </Option>
  );
}
