import * as React from "react";
import { Trigger as PopoverTrigger } from "../popover";
import { useComboboxContext } from "./combobox";

type ComboboxTriggerProps = {
  children: React.ReactElement;
};

export function ComboboxTrigger({ children }: ComboboxTriggerProps) {
  const { open, setOpen } = useComboboxContext();

  return (
    <PopoverTrigger asChild>
      {React.cloneElement(
        children as React.ReactElement<any>,
        {
          "aria-expanded": open,
          "aria-haspopup": "listbox",
          onClick: (event: React.MouseEvent) => {
            (children.props as any)?.onClick?.(event);
            setOpen(true);
          },
        }
      )}
    </PopoverTrigger>
  );
}
