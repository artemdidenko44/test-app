import * as React from "react";
import {
  useFloating,
  offset,
  flip,
  shift,
  autoUpdate,
  useClick,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
} from "@floating-ui/react";

type PopoverContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  refs: ReturnType<typeof useFloating>["refs"];
  floatingStyles: React.CSSProperties;
  getReferenceProps: ReturnType<typeof useInteractions>["getReferenceProps"];
  getFloatingProps: ReturnType<typeof useInteractions>["getFloatingProps"];
};

const PopoverContext = React.createContext<PopoverContextValue | null>(null);

function usePopoverContext() {
  const ctx = React.useContext(PopoverContext);
  if (!ctx) {
    throw new Error("Popover components must be used within <Popover>");
  }
  return ctx;
}

type PopoverProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
};

function Popover({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
}: PopoverProps) {
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

  const floating = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "bottom-start",
    middleware: [offset({ mainAxis: 8, crossAxis: -8 }), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(floating.context, { toggle: false });
  const dismiss = useDismiss(floating.context);
  const role = useRole(floating.context, { role: "dialog" });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);

  const value = React.useMemo<PopoverContextValue>(
    () => ({
      open,
      setOpen,
      refs: floating.refs,
      floatingStyles: floating.floatingStyles,
      getReferenceProps,
      getFloatingProps,
    }),
    [
      open,
      setOpen,
      floating.refs,
      floating.floatingStyles,
      getReferenceProps,
      getFloatingProps,
    ]
  );

  return (
    <PopoverContext.Provider value={value}>
      {children}
    </PopoverContext.Provider>
  );
}

type PopoverTriggerProps = {
  asChild?: boolean;
  children: React.ReactElement;
};

function PopoverTrigger({ asChild = false, children }: PopoverTriggerProps) {
  const { refs, getReferenceProps } = usePopoverContext();

  if (!React.isValidElement(children)) {
    throw new Error("<Popover.Trigger> expects a single React element");
  }

  return React.cloneElement(
    children as React.ReactElement<any>,
    {
      ref: refs.setReference,
      ...getReferenceProps(children.props as any),
    }
  );
}

type PopoverContentProps = {
  children: React.ReactNode;
  className?: string;
};

function PopoverContent({ children, className }: PopoverContentProps) {
  const {
    open,
    refs,
    floatingStyles,
    getFloatingProps,
  } = usePopoverContext();

  if (!open) return null;

  return (
    <FloatingPortal>
      <div
        ref={refs.setFloating}
        style={floatingStyles}
        className={className}
        {...getFloatingProps()}
      >
        {children}
      </div>
    </FloatingPortal>
  );
}

export {
  Popover,
  PopoverTrigger as Trigger,
  PopoverContent as Content,
};
