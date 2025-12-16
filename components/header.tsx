

import * as React from "react";

type HeaderProps = {
  logo: React.ReactNode;
  nav?: React.ReactNode;
  actions?: React.ReactNode;
  sticky?: boolean;
};

export function Header({
  logo,
  nav,
  actions,
  sticky = true,
}: HeaderProps) {
  return (
    <header
      className={[
        "w-full border-b border-black/[.08] dark:border-white/[.145]",
        sticky ? "sticky top-0 z-50 bg-background/80 backdrop-blur" : "",
      ].join(" ")}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {logo}
          {nav && <nav className="hidden md:flex items-center gap-4">{nav}</nav>}
        </div>

        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}