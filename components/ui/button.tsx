import * as React from "react";

type PolymorphicProps<E extends React.ElementType, P> =
  P &
  Omit<React.ComponentPropsWithoutRef<E>, keyof P> & {
    as?: E;
  };

type ClassNameProp = { className?: string };

type Variant = "primary" | "secondary";
type Size = "sm" | "md" | "lg";

type BaseButtonProps = {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
};

type IconOnlyButtonProps = {
  icon: React.ReactElement;
  "aria-label": string;
  children?: never;
};

type RegularButtonProps = {
  icon?: never;
  children: React.ReactNode;
};

type ButtonOwnProps = BaseButtonProps &
  (IconOnlyButtonProps | RegularButtonProps) & {
    asChild?: boolean;
  };

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

const buttonVariants = ({
  variant = "primary",
  size = "md",
}: {
  variant?: Variant;
  size?: Size;
}) => {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 disabled:pointer-events-none disabled:opacity-50";

  const variants: Record<Variant, string> = {
    primary:
      "bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc]",
    secondary:
      "border border-black/[.08] hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]",
  };

  const sizes: Record<Size, string> = {
    sm: "h-9 px-4 text-sm",
    md: "h-12 px-5 text-base",
    lg: "h-14 px-6 text-lg",
  };

  return cn(base, variants[variant], sizes[size]);
};

function Button<E extends React.ElementType = "button">({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  children,
  icon,
  ...props
}: PolymorphicProps<E, ButtonOwnProps>) {
  const classes = cn(buttonVariants({ variant, size }), className);

  if (asChild) {
    if (!React.isValidElement(children)) {
      throw new Error("Button with asChild requires a single React element as a child");
    }

    return React.cloneElement(
      children as React.ReactElement<any>,
      {
        className: cn(
          classes,
          (children.props as any)?.className
        ),
      }
    );
  }

  return (
    <button
      data-slot="button"
      className={classes}
      disabled={loading || (props as any).disabled}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span className="sr-only">Loading</span>
        </span>
      ) : icon ? (
        icon
      ) : (
        children
      )}
    </button>
  );
}

export { Button, buttonVariants };