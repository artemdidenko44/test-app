import * as React from "react";

type Variant = "default" | "search";
type Size = "sm" | "md" | "lg";

type InputOwnProps = {
  variant?: Variant;
  size?: Size;
  error?: boolean;
};

type PolymorphicProps<E extends React.ElementType, P> =
  P &
  Omit<React.ComponentPropsWithoutRef<E>, keyof P> & {
    as?: E;
  };

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

const inputVariants = ({
  variant = "default",
  size = "md",
  error = false,
}: {
  variant?: Variant;
  size?: Size;
  error?: boolean;
}) => {
  const base =
    "w-full rounded-md bg-transparent outline-none transition-colors placeholder:text-zinc-500 dark:placeholder:text-zinc-400";

  const variants: Record<Variant, string> = {
    default:
      "border border-black/[.12] focus:border-black dark:border-white/[.145] dark:focus:border-white",
    search:
      "border border-black/[.12] focus:border-black dark:border-white/[.145] dark:focus:border-white pl-9",
  };

  const sizes: Record<Size, string> = {
    sm: "h-8 px-2 text-sm",
    md: "h-10 px-3 text-base",
    lg: "h-12 px-4 text-lg",
  };

  const errorStyles = error
    ? "border-red-500 focus:border-red-500 dark:border-red-500"
    : "";

  return cn(base, variants[variant], sizes[size], errorStyles);
};

function Input<E extends React.ElementType = "input">({
  as,
  className,
  variant,
  size,
  error = false,
  ...props
}: PolymorphicProps<E, InputOwnProps>) {
  const Comp = as || "input";

  return (
    <Comp
      className={cn(
        inputVariants({ variant, size, error }),
        className
      )}
      {...props}
    />
  );
}

export { Input, inputVariants };
