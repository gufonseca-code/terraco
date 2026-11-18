import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "WONK"],
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#FAF5E2",
};

export const metadata: Metadata = {
  title: "Terraço: curadoria de lançamentos imobiliários em São Paulo",
  description:
    "Lançamentos residenciais selecionados na Vila Madalena, Pinheiros e Perdizes a partir de R$ 485.000, com planta clara e visita marcada no WhatsApp.",
  openGraph: {
    type: "website",
    title: "Terraço: curadoria de lançamentos imobiliários em São Paulo",
    description:
      "Lançamentos residenciais selecionados na Vila Madalena, Pinheiros e Perdizes a partir de R$ 485.000.",
    images: ["/images/hero-terraco.jpg"],
  },
  twitter: {
    card: "summary_large_image",
  },
  other: {
    "site-kind": "other",
    "page-type": "service",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      data-type="service"
      data-radius="soft"
      data-buttons="tonal"
      data-motion=""
      className={`${fraunces.variable} ${plusJakartaSans.variable}`}
    >
      <head>
        {/* eslint-disable-next-line @next/next/no-css-tags */}
        <link rel="stylesheet" href="/assets/system.css" />
        {/* eslint-disable-next-line @next/next/no-css-tags */}
        <link rel="stylesheet" href="/assets/ui/cards.css" />
        {/* eslint-disable-next-line @next/next/no-css-tags */}
        <link rel="stylesheet" href="/assets/motion/motion.css" />
        {/* eslint-disable-next-line @next/next/no-css-tags */}
        <link rel="stylesheet" href="/assets/layout/layout.css" />
        <style
          dangerouslySetInnerHTML={{
            __html: `:root{--p-bg:#FAF5E2;--p-surface:#EFEAE0;--p-ink:#1E1D1B;--p-muted:#57534E;--p-accent:#265C4B;--p-accent-ink:#FAF7F0;--p-action:#265C4B;--p-action-ink:#FAF7F0;--p-inv-bg:#1E1D1B;--p-inv-surface:#2B2926;--p-inv-ink:#FAF7F0;--p-inv-muted:#C2BCB0;--p-inv-accent:#F2B705;--p-inv-accent-ink:#1E1D1B;--p-inv-action:#F2B705;--p-inv-action-ink:#1E1D1B;--font-display:var(--font-fraunces),Georgia,serif;--font-text:var(--font-plus-jakarta),system-ui,-apple-system,sans-serif;--display-weight:500;--display-tracking:-0.025em;--display-tracking-xl:-0.03em;--display-axes:"SOFT" 100,"WONK" 1;--ly-scale:0.85;}`,
          }}
        />
        <link rel="modulepreload" href="/assets/moments/moments.js" />
        <link rel="modulepreload" href="/assets/moments/lib.js" />
        <link
          rel="modulepreload"
          href="/assets/moments/photo-chapters/moment.js"
        />
        <script
          dangerouslySetInnerHTML={{
            __html:
              "document.documentElement.classList.add('m-enter');setTimeout(()=>document.documentElement.classList.add('m-enter-done'),700);document.documentElement.classList.add('mo-js');setTimeout(()=>document.documentElement.classList.add('mo-safe'),2500);",
          }}
        />
      </head>
      <body>
        {children}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script type="module" src="/assets/system.js" />
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script type="module" src="/assets/motion/motion.js" />
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script type="module" src="/assets/layout/layout.js" />
      </body>
    </html>
  );
}
