"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function NavbarNav({ isCurrent }: { isCurrent?: boolean }) {
  return (
    <nav
      data-testid="site-navbar"
      aria-label="Navegação principal"
      className="flex items-center"
    >
      <Link
        href="/lancamentos"
        aria-current={isCurrent ? "page" : undefined}
        className="terraco-nav-link px-1 text-sm font-semibold leading-[1.35]"
      >
        Lançamentos
      </Link>
    </nav>
  );
}

export function NavbarLinksFallback() {
  return <NavbarNav />;
}

export function NavbarLinks() {
  const pathname = usePathname();
  return <NavbarNav isCurrent={pathname.startsWith("/lancamentos")} />;
}
