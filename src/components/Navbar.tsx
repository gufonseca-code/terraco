import { TerracoLogo } from "./TerracoLogo";
import { NavbarLinks } from "./NavbarLinks";

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-border-subtle bg-canvas/92 backdrop-blur-md">
      <div className="relative mx-auto flex h-[72px] max-w-6xl items-center justify-between gap-4 px-6 lg:px-8">
        <a href="#homepage" className="skip-link">
          Pular para o conteúdo
        </a>
        <TerracoLogo />
        <NavbarLinks />
      </div>
    </header>
  );
}
