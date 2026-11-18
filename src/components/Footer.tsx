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
      className="border-t border-border-subtle bg-surface/60 mt-16"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <TerracoLogo />
          <p className="text-sm text-ink-muted">
            Entra, a casa é sua. Curadoria de lançamentos imobiliários sem
            complicação.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-pill bg-brand px-5 py-2.5 text-sm font-semibold text-ink-inverse transition-colors hover:bg-brand-hover"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Atendimento via WhatsApp</span>
          </a>
        </div>
      </div>
      <div className="border-t border-border-subtle/70 py-4 text-center text-xs text-ink-muted">
        © 2026 Terraço. Todos os direitos reservados.
      </div>
    </footer>
  );
}
