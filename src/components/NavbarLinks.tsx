"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavbarLinks() {
  const pathname = usePathname();
  const isCurrent = pathname.startsWith("/lancamentos");

  return (
    <nav aria-label="Navegação principal" className="flex items-center">
      <Link
        href="/lancamentos"
        aria-current={isCurrent ? "page" : undefined}
        className="terraco-nav-glow text-sm font-medium"
      >
        Lançamentos
      </Link>
    </nav>
  );
}
