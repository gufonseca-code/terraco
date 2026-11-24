import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { BairroGuide } from './bairros.data';
import { Lancamento } from './lancamentos.data';
import {
  DEFAULT_LAUNCH_OG_IMAGE_URL,
  SITE_HERO_IMAGE_URL,
  SITE_NAME,
  SITE_URL,
} from './site.config';

const HOME_JSONLD_ID = 'terraco-home-jsonld';
const LANCAMENTOS_JSONLD_ID = 'terraco-lancamentos-jsonld';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  updateHomeMeta(): void {
    const pageTitle = `${SITE_NAME} — Seu próximo canto, sem burocracia`;
    const description =
      'Curadoria de lançamentos imobiliários residenciais, com informações claras e atendimento direto no WhatsApp.';
    const ogDescription =
      'Curadoria de lançamentos imobiliários selecionados, com plantas claras e visita marcada no WhatsApp.';
    const twitterDescription =
      'Curadoria de lançamentos imobiliários selecionados, com preço claro e zero enrolação.';

    this.title.setTitle(pageTitle);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });

    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:locale', content: 'pt_BR' });
    this.meta.updateTag({ property: 'og:site_name', content: SITE_NAME });
    this.meta.updateTag({ property: 'og:url', content: '/' });
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: ogDescription });
    this.meta.updateTag({
      property: 'og:image',
      content: SITE_HERO_IMAGE_URL,
    });
    this.meta.updateTag({ property: 'og:image:width', content: '1142' });
    this.meta.updateTag({ property: 'og:image:height', content: '2048' });
    this.meta.updateTag({
      property: 'og:image:alt',
      content:
        'Ilustração editorial de terraço residencial brasileiro com cobogós e varandas',
    });

    this.meta.updateTag({
      name: 'twitter:card',
      content: 'summary_large_image',
    });
    this.meta.updateTag({ name: 'twitter:title', content: pageTitle });
    this.meta.updateTag({
      name: 'twitter:description',
      content: twitterDescription,
    });
    this.meta.updateTag({
      name: 'twitter:image',
      content: SITE_HERO_IMAGE_URL,
    });

    this.setCanonical('/');
    this.removeLancamentosJsonLd();
    this.setHomeJsonLd(description);
  }

  updateLancamentosMeta(lancamentos: readonly Lancamento[] = []): void {
    this.removeHomeJsonLd();
    const pageTitle = `Lançamentos | ${SITE_NAME}`;
    const description =
      'Lançamentos imobiliários selecionados em Belo Horizonte nos bairros Estoril, Santa Efigênia e Serrano: studios, 1 e 2 quartos com suíte e lazer completo.';

    this.title.setTitle(pageTitle);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });

    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:locale', content: 'pt_BR' });
    this.meta.updateTag({ property: 'og:site_name', content: SITE_NAME });
    this.meta.updateTag({ property: 'og:url', content: '/lancamentos' });
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({
      property: 'og:image',
      content: DEFAULT_LAUNCH_OG_IMAGE_URL,
    });
    this.meta.updateTag({ property: 'og:image:width', content: '1024' });
    this.meta.updateTag({ property: 'og:image:height', content: '614' });
    this.meta.updateTag({
      property: 'og:image:alt',
      content:
        'Lançamentos imobiliários em Belo Horizonte nos bairros Estoril, Santa Efigênia e Serrano',
    });

    this.meta.updateTag({
      name: 'twitter:card',
      content: 'summary_large_image',
    });
    this.meta.updateTag({ name: 'twitter:title', content: pageTitle });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({
      name: 'twitter:image',
      content: DEFAULT_LAUNCH_OG_IMAGE_URL,
    });

    this.setCanonical('/lancamentos');
    this.setLancamentosJsonLd(description, lancamentos);
  }

  updateBairroMeta(bairro: BairroGuide): void {
    this.removeHomeJsonLd();
    this.removeLancamentosJsonLd();
    const canonicalPath = `/bairros/${bairro.slug}`;
    const pageTitle = bairro.tituloSeo.includes(SITE_NAME)
      ? bairro.tituloSeo
      : `${bairro.tituloSeo} | ${SITE_NAME}`;
    const description = bairro.descricaoSeo;

    this.title.setTitle(pageTitle);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });

    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:locale', content: 'pt_BR' });
    this.meta.updateTag({ property: 'og:site_name', content: SITE_NAME });
    this.meta.updateTag({ property: 'og:url', content: canonicalPath });
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({
      property: 'og:image',
      content: DEFAULT_LAUNCH_OG_IMAGE_URL,
    });
    this.meta.updateTag({ property: 'og:image:width', content: '1024' });
    this.meta.updateTag({ property: 'og:image:height', content: '614' });
    this.meta.updateTag({
      property: 'og:image:alt',
      content: `Guia do bairro ${bairro.nome}, ${bairro.cidade} — ${SITE_NAME}`,
    });

    this.meta.updateTag({
      name: 'twitter:card',
      content: 'summary_large_image',
    });
    this.meta.updateTag({ name: 'twitter:title', content: pageTitle });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({
      name: 'twitter:image',
      content: DEFAULT_LAUNCH_OG_IMAGE_URL,
    });

    this.setCanonical(canonicalPath);
  }

  updateLancamentoDetailMeta(item: Lancamento): void {
    this.removeHomeJsonLd();
    this.removeLancamentosJsonLd();
    const canonicalPath = `/lancamentos/${item.slug}`;
    const pageTitle = `${item.nome}, ${item.bairro}, ${item.cidade} | ${SITE_NAME}`;
    const socialTitle = `${item.nome}, ${item.bairro} | ${SITE_NAME}`;
    const description = `${item.nome} no ${item.bairro}, ${item.cidade}: ${item.quartos}, ${item.metragem} e lazer completo. Receba plantas e condições no WhatsApp.`;

    this.title.setTitle(pageTitle);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });

    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:locale', content: 'pt_BR' });
    this.meta.updateTag({ property: 'og:site_name', content: SITE_NAME });
    this.meta.updateTag({ property: 'og:url', content: canonicalPath });
    this.meta.updateTag({ property: 'og:title', content: socialTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:image', content: item.imagem });
    this.meta.updateTag({
      property: 'og:image:width',
      content: String(item.imagemWidth),
    });
    this.meta.updateTag({
      property: 'og:image:height',
      content: String(item.imagemHeight),
    });
    this.meta.updateTag({ property: 'og:image:alt', content: item.imagemAlt });

    this.meta.updateTag({
      name: 'twitter:card',
      content: 'summary_large_image',
    });
    this.meta.updateTag({ name: 'twitter:title', content: socialTitle });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: item.imagem });

    this.setCanonical(canonicalPath);
  }

  updateNotFoundMeta(): void {
    this.removeHomeJsonLd();
    this.removeLancamentosJsonLd();
    this.title.setTitle(`Lançamento não encontrado | ${SITE_NAME}`);
    this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
  }

  private setHomeJsonLd(description: string): void {
    const jsonLd = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'RealEstateAgent',
          '@id': `${SITE_URL}/#organization`,
          name: SITE_NAME,
          url: SITE_URL,
          image: SITE_HERO_IMAGE_URL,
          description,
          areaServed: {
            '@type': 'City',
            name: 'Belo Horizonte',
            addressRegion: 'MG',
            addressCountry: 'BR',
          },
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Belo Horizonte',
            addressRegion: 'MG',
            addressCountry: 'BR',
          },
        },
        {
          '@type': 'WebSite',
          '@id': `${SITE_URL}/#website`,
          url: SITE_URL,
          name: SITE_NAME,
          inLanguage: 'pt-BR',
          publisher: {
            '@id': `${SITE_URL}/#organization`,
          },
          potentialAction: {
            '@type': 'SearchAction',
            target: `${SITE_URL}/lancamentos?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
          },
        },
      ],
    };

    this.upsertJsonLd(HOME_JSONLD_ID, jsonLd);
  }

  private setLancamentosJsonLd(
    description: string,
    lancamentos: readonly Lancamento[]
  ): void {
    const jsonLd = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'CollectionPage',
          '@id': `${SITE_URL}/lancamentos#collection`,
          url: `${SITE_URL}/lancamentos`,
          name: `Lançamentos em Belo Horizonte | ${SITE_NAME}`,
          description,
          inLanguage: 'pt-BR',
          isPartOf: {
            '@id': `${SITE_URL}/#website`,
          },
          mainEntity: {
            '@type': 'ItemList',
            numberOfItems: lancamentos.length,
            itemListElement: lancamentos.map((item, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              url: `${SITE_URL}/lancamentos/${item.slug}`,
              name: `${item.nome} — ${item.bairro}, ${item.cidade}`,
            })),
          },
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Início',
              item: SITE_URL,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Lançamentos',
              item: `${SITE_URL}/lancamentos`,
            },
          ],
        },
      ],
    };

    this.upsertJsonLd(LANCAMENTOS_JSONLD_ID, jsonLd);
  }

  private upsertJsonLd(id: string, payload: unknown): void {
    const head = this.document?.head;
    if (!head) {
      return;
    }

    const serialized = JSON.stringify(payload).replace(/</g, '\\u003c');
    let scriptEl = this.document.getElementById(id) as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = this.document.createElement('script');
      scriptEl.type = 'application/ld+json';
      scriptEl.id = id;
      head.appendChild(scriptEl);
    }
    scriptEl.textContent = serialized;
  }

  private removeHomeJsonLd(): void {
    this.document?.getElementById(HOME_JSONLD_ID)?.remove();
  }

  private removeLancamentosJsonLd(): void {
    this.document?.getElementById(LANCAMENTOS_JSONLD_ID)?.remove();
  }

  private setCanonical(path: string): void {
    const head = this.document?.head;
    if (!head) {
      return;
    }

    let link = head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      head.appendChild(link);
    }
    link.setAttribute('href', path);
  }
}
