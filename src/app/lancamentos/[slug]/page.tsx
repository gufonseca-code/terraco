import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PrimeViewLanding } from "@/components/PrimeViewLanding";
import { LANCAMENTOS, getLancamentoBySlug } from "@/data/lancamentos";
import { SITE_NAME } from "@/lib/site";

export function generateStaticParams() {
  return LANCAMENTOS.map((item) => ({
    slug: item.slug,
  }));
}

export async function generateMetadata({
  params,
}: PageProps<"/lancamentos/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const item = getLancamentoBySlug(slug);

  if (!item) {
    return {
      title: "Lançamento não encontrado",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const canonicalPath = `/lancamentos/${item.slug}`;
  const title = `${item.nome}, ${item.bairro}, ${item.cidade}`;
  const description = `${item.nome} no ${item.bairro}, ${item.cidade}: ${item.quartos}, ${item.metragem} e lazer completo. Receba plantas e condições no WhatsApp.`;
  const socialTitle = `${item.nome}, ${item.bairro} | ${SITE_NAME}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      siteName: SITE_NAME,
      url: canonicalPath,
      title: socialTitle,
      description,
      images: [
        {
          url: item.imagem,
          width: item.imagemWidth,
          height: item.imagemHeight,
          alt: item.imagemAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [item.imagem],
    },
  };
}

async function LancamentoDetalheContent({
  params,
}: Pick<PageProps<"/lancamentos/[slug]">, "params">) {
  const { slug } = await params;
  const item = getLancamentoBySlug(slug);

  if (!item) {
    notFound();
  }

  return <PrimeViewLanding item={item} />;
}

function LancamentoDetalheFallback() {
  return (
    <section
      aria-busy="true"
      aria-label="Carregando lançamento"
      className="flex flex-1 flex-col justify-center bg-canvas py-10 sm:py-14"
    >
      <div className="mx-auto w-full max-w-5xl px-6 lg:px-8">
        <div className="mb-5 h-[44px] w-44" />
        <div className="h-[460px] w-full animate-pulse rounded-lg border border-border-subtle bg-elevated shadow-floating" />
      </div>
    </section>
  );
}

export default function LancamentoDetalhePage({
  params,
}: PageProps<"/lancamentos/[slug]">) {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <Navbar />

      <main id="homepage" tabIndex={-1} className="flex flex-1 flex-col">
        <Suspense fallback={<LancamentoDetalheFallback />}>
          <LancamentoDetalheContent params={params} />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
