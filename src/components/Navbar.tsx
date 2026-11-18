import { TerracoLogo } from "./TerracoLogo";
import { NavbarLinks } from "./NavbarLinks";

export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-30 px-4 pt-6 sm:px-6 sm:pt-8">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-2 rounded-pill border border-border-subtle bg-elevated/95 px-4 py-2 shadow-card backdrop-blur-md sm:px-7 sm:py-2.5">
        <a href="#conteudo-principal" className="skip-link">
          Pular para o conteúdo
        </a>
        <TerracoLogo />
        <NavbarLinks />
      </div>
    </header>
  );
}
