import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Lancamento } from './lancamentos.data';
import {
  DEFAULT_LAUNCH_OG_IMAGE_URL,
  SITE_HERO_IMAGE_URL,
  SITE_NAME,
} from './site.config';

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
  }

  updateLancamentosMeta(): void {
    const pageTitle = `Lançamentos | ${SITE_NAME}`;
    const description =
      'Prime View no Estoril, Belo Horizonte: 2 quartos com suíte, 49 a 103 m² e lazer completo.';

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
        'Fachada contemporânea do residencial Prime View no Estoril, Belo Horizonte',
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
  }

  updateLancamentoDetailMeta(item: Lancamento): void {
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
    this.title.setTitle(`Lançamento não encontrado | ${SITE_NAME}`);
    this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
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
