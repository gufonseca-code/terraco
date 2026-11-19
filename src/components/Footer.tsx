import Link from "next/link";
import { TerracoLogo } from "./TerracoLogo";
import { buildWhatsAppUrl } from "@/data/lancamentos";

export function Footer() {
  const whatsappHref = buildWhatsAppUrl(
    "Oi! Gostaria de conversar sobre um lançamento na Terraço."
  );

  return (
    <footer
      id="contato"
      className="mt-auto border-t border-border-subtle bg-surface scroll-mt-24"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 lg:px-8 md:flex-row md:items-end md:justify-between">
        <div className="max-w-md space-y-3">
          <TerracoLogo />
          <p className="text-sm sm:text-base leading-[1.55] text-ink-muted">
            Curadoria de lançamentos residenciais em Belo Horizonte, com
            atendimento direto no WhatsApp.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <Link
            href="/lancamentos"
            className="terraco-link-underline inline-flex min-h-[44px] items-center px-1 text-sm font-semibold leading-[1.35] text-ink-muted transition-colors duration-150 hover:text-ink"
          >
            Lançamentos
          </Link>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="terraco-btn terraco-btn-moss inline-flex min-h-[44px] items-center justify-center rounded-pill bg-brand px-6 py-3 text-sm font-semibold leading-[1.35] text-ink-inverse hover:bg-brand-hover"
          >
            Falar no WhatsApp
          </a>
        </div>
      </div>

      <div className="border-t border-border-subtle/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-6 py-4 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between lg:px-8 tabular-nums">
          <span>© 2026 Terraço</span>
          <span>Belo Horizonte, MG</span>
        </div>
      </div>
    </footer>
  );
}
