import Link from "next/link";
import { TerracoLogo } from "./TerracoLogo";
import { buildWhatsAppUrl } from "@/data/lancamentos";

export function Navbar() {
  const whatsappHref = buildWhatsAppUrl(
    "Oi! Vim pelo site da Terraço e gostaria de saber mais sobre os lançamentos."
  );

  return (
    <header className="fixed inset-x-0 top-0 z-30 px-4 pt-6 sm:px-6 sm:pt-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between rounded-pill border border-border-subtle/90 bg-elevated/95 px-5 py-2.5 shadow-card backdrop-blur-md sm:px-7">
        <TerracoLogo />

        <div className="flex items-center gap-6 lg:gap-8">
          <nav
            aria-label="Navegação principal"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-ink-muted"
          >
            <Link
              href="/lancamentos"
              className="transition-colors hover:text-ink"
            >
              Lançamentos
            </Link>
            <Link
              href="/lancamentos?tag=Varanda"
              className="transition-colors hover:text-ink"
            >
              Com varanda
            </Link>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-ink"
            >
              Contato
            </a>
          </nav>

          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-pill bg-brand px-5 py-2 text-sm font-semibold text-ink-inverse transition-colors hover:bg-brand-hover"
          >
            Falar no WhatsApp
          </a>
        </div>
      </div>
    </header>
  );
}
