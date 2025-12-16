import * as React from "react";
import { Popover } from "../popover";

type ComboboxContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;

  inputValue: string;
  setInputValue: (value: string) => void;

  activeIndex: number;
  setActiveIndex: (index: number) => void;

  registerOption: (id: string) => number;
  unregisterOption: (id: string) => void;

  selectOption: (index: number) => void;
};

const ComboboxContext = React.createContext<ComboboxContextValue | null>(null);

export function useComboboxContext() {
  const ctx = React.useContext(ComboboxContext);
  if (!ctx) {
    throw new Error("Combobox components must be used within <Combobox>");
  }
  return ctx;
}

type ComboboxProps = {
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function Combobox({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
}: ComboboxProps) {
  const [uncontrolledOpen, setUncontrolledOpen] =
    React.useState(defaultOpen);

  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (controlledOpen === undefined) {
        setUncontrolledOpen(next);
      }
      onOpenChange?.(next);
    },
    [controlledOpen, onOpenChange]
  );

  const [inputValue, setInputValue] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(-1);

  const optionsRef = React.useRef<string[]>([]);

  const registerOption = React.useCallback((id: string) => {
    optionsRef.current.push(id);
    return optionsRef.current.length - 1;
  }, []);

  const unregisterOption = React.useCallback((id: string) => {
    optionsRef.current = optionsRef.current.filter(
      (optionId) => optionId !== id
    );
  }, []);

  const selectOption = React.useCallback(
    (index: number) => {
      setActiveIndex(index);
      setOpen(false);
    },
    [setOpen]
  );

  const value = React.useMemo<ComboboxContextValue>(
    () => ({
      open,
      setOpen,
      inputValue,
      setInputValue,
      activeIndex,
      setActiveIndex,
      registerOption,
      unregisterOption,
      selectOption,
    }),
    [
      open,
      setOpen,
      inputValue,
      activeIndex,
      registerOption,
      unregisterOption,
      selectOption,
    ]
  );

  return (
    <ComboboxContext.Provider value={value}>
      <Popover open={open} onOpenChange={setOpen}>
        {children}
      </Popover>
    </ComboboxContext.Provider>
  );
}
