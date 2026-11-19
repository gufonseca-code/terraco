import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LaunchExplorer } from "@/components/LaunchExplorer";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Lançamentos",
  description:
    "Prime View no Estoril, Belo Horizonte: 2 quartos com suíte, 49 a 103 m² e lazer completo.",
  alternates: {
    canonical: "/lancamentos",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: SITE_NAME,
    url: "/lancamentos",
    title: `Lançamentos | ${SITE_NAME}`,
    description:
      "Prime View no Estoril, Belo Horizonte: 2 quartos com suíte, 49 a 103 m² e lazer completo.",
    images: [
      {
        url: "/images/lancamentos/prime-view.webp",
        width: 1024,
        height: 614,
        alt: "Fachada contemporânea do residencial Prime View no Estoril, Belo Horizonte",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Lançamentos | ${SITE_NAME}`,
    description:
      "Prime View no Estoril, Belo Horizonte: 2 quartos com suíte, 49 a 103 m² e lazer completo.",
    images: ["/images/lancamentos/prime-view.webp"],
  },
};

export default function LancamentosPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <Navbar />
      <main id="homepage" tabIndex={-1} className="flex flex-1 flex-col">
        <LaunchExplorer />
      </main>
      <Footer />
    </div>
  );
}
