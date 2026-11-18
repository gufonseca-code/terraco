import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { TerracoLogo } from "./TerracoLogo";
import { buildWhatsAppUrl } from "@/data/lancamentos";

export function Footer() {
  const whatsappHref = buildWhatsAppUrl(
    "Oi! Gostaria de conversar sobre um lançamento na Terraço."
  );

  return (
    <footer
      id="contato"
      className="border-t border-border-subtle bg-surface/60 mt-16 scroll-mt-24"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2 max-w-md">
          <TerracoLogo />
          <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
            Entra, a casa é sua. Curadoria de lançamentos imobiliários em São
            Paulo com informações claras e visita marcada no WhatsApp.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/lancamentos"
            className="terraco-btn inline-flex min-h-[44px] items-center justify-center rounded-pill border border-border-subtle bg-elevated px-5 py-2.5 text-sm font-semibold text-ink hover:bg-surface"
          >
            Ver lançamentos
          </Link>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="terraco-btn inline-flex min-h-[44px] items-center gap-2 rounded-pill bg-brand px-5 py-2.5 text-sm font-semibold text-ink-inverse hover:bg-brand-hover"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            <span>Atendimento via WhatsApp</span>
          </a>
        </div>
      </div>
      <div className="border-t border-border-subtle/70 py-4 px-6 text-center text-xs text-ink-muted">
        © 2026 Terraço. São Paulo, SP · Todos os direitos reservados.
      </div>
    </footer>
  );
}
