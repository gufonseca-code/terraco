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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#FAF5E2",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Terraço — Seu próximo canto, sem burocracia",
    template: "%s | Terraço",
  },
  description:
    "Curadoria de lançamentos imobiliários residenciais em São Paulo, com informações claras e atendimento direto no WhatsApp.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    title: "Terraço — Seu próximo canto, sem burocracia",
    description:
      "Curadoria de lançamentos imobiliários selecionados em São Paulo, com plantas claras e visita marcada no WhatsApp.",
    images: [
      {
        url: "/images/hero-terraco.jpg",
        width: 1142,
        height: 2048,
        alt: "Ilustração editorial de terraço residencial brasileiro com cobogós e varandas",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terraço — Seu próximo canto, sem burocracia",
    description:
      "Curadoria de lançamentos imobiliários selecionados em São Paulo.",
    images: ["/images/hero-terraco.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${fraunces.variable} ${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-canvas text-ink">
        {children}
      </body>
    </html>
  );
}
