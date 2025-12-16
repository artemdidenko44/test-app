import * as React from "react";

type CardProps = {
  imageSrc?: string;
  imageAlt: string;
  children: React.ReactNode;
  className?: string;
};

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export function Card({
  imageSrc,
  imageAlt,
  children,
  className,
}: CardProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-black/[.08] bg-background shadow-sm dark:border-white/[.145]",
        className
      )}
    >
      <div className="relative aspect-[4/3] w-full">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={imageAlt}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="h-full w-full bg-muted" />
        )}
      </div>

      <div className="p-4 space-y-2">
        {children}
      </div>
    </div>
  );
}
