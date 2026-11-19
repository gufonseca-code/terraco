import { Suspense } from "react";
import { TerracoLogo } from "./TerracoLogo";
import { NavbarLinks, NavbarLinksFallback } from "./NavbarLinks";

export function Navbar() {
  return (
    <header
      data-testid="site-header"
      className="pointer-events-none sticky top-0 z-30 px-4 pt-4 sm:px-6 sm:pt-5"
    >
      <div className="pointer-events-auto relative mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-pill border border-border-subtle bg-elevated/95 px-5 py-2 shadow-card backdrop-blur-md sm:px-7 sm:py-2.5">
        <a href="#homepage" className="skip-link">
          Pular para o conteúdo
        </a>
        <TerracoLogo />
        <Suspense fallback={<NavbarLinksFallback />}>
          <NavbarLinks />
        </Suspense>
      </div>
    </header>
  );
}
