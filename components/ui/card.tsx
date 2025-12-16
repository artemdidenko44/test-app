import * as React from "react";
import Image from "next/image";

type CardProps = {
  imageSrc: string;
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
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 400px"
        />
      </div>

      <div className="p-4 space-y-2">
        {children}
      </div>
    </div>
  );
}
