export default function Home() {
  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="max-w-2xl w-full rounded-lg bg-elevated border border-border-subtle p-8 md:p-12 shadow-card">
        <span className="inline-block rounded-pill bg-accent/20 text-ink px-3 py-1 text-xs font-semibold mb-4">
          Em construção · Fase 1
        </span>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-ink leading-tight mb-4">
          Seu próximo canto, sem burocracia.
        </h1>
        <p className="text-ink-muted text-lg leading-relaxed mb-8">
          A Terraço está preparando uma curadoria leve e transparente de
          lançamentos imobiliários para você encontrar o seu espaço na cidade.
        </p>
        <div className="flex flex-wrap gap-3">
          <span className="inline-flex items-center rounded-pill bg-brand text-ink-inverse px-6 py-3 text-sm font-semibold">
            Explorar lançamentos
          </span>
          <span className="inline-flex items-center rounded-pill bg-surface text-ink px-5 py-3 text-sm font-semibold">
            Design System Ipê &amp; Grafite
          </span>
        </div>
      </div>
    </main>
  );
}
