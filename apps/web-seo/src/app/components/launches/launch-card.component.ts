import { NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  computed,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { type Lancamento, formatCurrencyBRL } from '../../core';
import { FavoriteButtonComponent } from './favorite-button.component';

export interface LaunchThirdSpec {
  label: string;
  value: string;
  tabular?: boolean;
}

export function resolveLaunchThirdSpec(launch: Lancamento): LaunchThirdSpec {
  if (typeof launch.precoAPartirDe === 'number' && launch.precoAPartirDe > 0) {
    return {
      label: 'A partir de',
      value: formatCurrencyBRL(launch.precoAPartirDe),
      tabular: true,
    };
  }
  if (launch.vagas.trim().length > 0) {
    return { label: 'Vagas', value: launch.vagas };
  }
  return {
    label: 'Tipologias',
    value: launch.tipologias || 'Consulte opções',
  };
}

@Component({
  selector: 'app-launch-card',
  imports: [NgOptimizedImage, RouterLink, FavoriteButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block h-full',
  },
  template: `
    @let item = launch();
    @let spec = thirdSpec();
    <article
      [attr.id]="cardId()"
      class="terraco-reveal-delay terraco-plate flex h-full flex-col overflow-hidden rounded-xl bg-elevated scroll-mt-24"
    >
      <div class="p-3 pb-0">
        <div
          [class.terraco-skeleton]="!imageLoaded()"
          class="relative aspect-[16/10] overflow-hidden rounded-[20px] bg-surface"
        >
          <a
            [routerLink]="['/lancamentos', item.slug]"
            class="relative z-[1] block h-full w-full overflow-hidden rounded-[20px]"
            [attr.aria-label]="'Conhecer ' + item.nome"
          >
            <img
              #coverImg
              data-testid="lancamentos-cover-image"
              [attr.data-slug]="item.slug"
              [ngSrc]="item.imagem"
              [alt]="item.imagemAlt"
              [width]="item.imagemWidth"
              [height]="item.imagemHeight"
              [priority]="priority()"
              [style.view-transition-name]="'launch-image-' + item.slug"
              (load)="markImageLoaded()"
              (error)="markImageLoaded()"
              class="h-full w-full rounded-[20px] object-cover object-center"
            />
          </a>

          <div class="absolute top-3 right-3 z-10">
            <app-favorite-button [slug]="item.slug" [nome]="item.nome" />
          </div>
        </div>
      </div>

      <div class="flex flex-1 flex-col justify-between gap-4 px-5 pt-4 pb-3">
        <div class="space-y-1.5">
          <p class="text-[13px] font-normal text-ink-muted">
            {{ item.bairro }}, {{ item.cidade }}
          </p>

          @if (headingLevel() === 'h3') {
            <h3
              [style.view-transition-name]="'launch-title-' + item.slug"
              class="font-display text-[1.3125rem] font-medium not-italic leading-[1.18] tracking-[-0.02em] text-ink text-balance"
            >
              <a
                [routerLink]="['/lancamentos', item.slug]"
                class="transition-colors duration-150 hover:text-brand"
              >
                {{ item.nome }}
              </a>
            </h3>
          } @else if (headingLevel() === 'h4') {
            <h4
              [style.view-transition-name]="'launch-title-' + item.slug"
              class="font-display text-[1.3125rem] font-medium not-italic leading-[1.18] tracking-[-0.02em] text-ink text-balance"
            >
              <a
                [routerLink]="['/lancamentos', item.slug]"
                class="transition-colors duration-150 hover:text-brand"
              >
                {{ item.nome }}
              </a>
            </h4>
          } @else {
            <h2
              [style.view-transition-name]="'launch-title-' + item.slug"
              class="font-display text-[1.3125rem] font-medium not-italic leading-[1.18] tracking-[-0.02em] text-ink text-balance"
            >
              <a
                [routerLink]="['/lancamentos', item.slug]"
                class="transition-colors duration-150 hover:text-brand"
              >
                {{ item.nome }}
              </a>
            </h2>
          }

          @if (item.tagline) {
            <p class="text-[14px] font-normal leading-[1.45] text-ink-muted">
              {{ item.tagline }}
            </p>
          }
        </div>

        <dl class="grid grid-cols-2 overflow-hidden rounded-[18px] bg-surface/80">
          <div class="space-y-0.5 border-r border-border-subtle/75 px-3.5 py-2.5">
            <dt class="text-[13px] font-normal text-ink-muted">Dormitórios</dt>
            <dd class="text-[14px] font-normal leading-[1.35] text-ink tabular-nums">
              {{ item.quartos }}
            </dd>
          </div>
          <div class="space-y-0.5 px-3.5 py-2.5">
            <dt class="text-[13px] font-normal text-ink-muted">Metragem</dt>
            <dd class="text-[14px] font-normal leading-[1.35] text-ink tabular-nums">
              {{ item.metragem }}
            </dd>
          </div>
          @let entrega = item.entrega?.trim();
          <div
            [class]="
              entrega
                ? 'space-y-0.5 border-t border-r border-border-subtle/75 px-3.5 py-2.5'
                : 'col-span-2 space-y-0.5 border-t border-border-subtle/75 px-3.5 py-2.5'
            "
          >
            <dt class="text-[13px] font-normal text-ink-muted">
              {{ spec.label }}
            </dt>
            <dd
              [class]="
                spec.tabular
                  ? 'text-[14px] font-medium leading-[1.35] text-ink tabular-nums'
                  : 'text-[14px] font-normal leading-[1.35] text-ink'
              "
            >
              {{ spec.value }}
            </dd>
          </div>
          @if (entrega) {
            <div class="space-y-0.5 border-t border-border-subtle/75 px-3.5 py-2.5">
              <dt class="text-[13px] font-normal text-ink-muted">Entrega</dt>
              <dd class="text-[14px] font-normal leading-[1.35] text-ink tabular-nums">
                {{ entrega }}
              </dd>
            </div>
          }
        </dl>
      </div>

      <div class="px-3 pt-1 pb-3">
        <a
          [routerLink]="['/lancamentos', item.slug]"
          class="terraco-btn terraco-btn-moss inline-flex min-h-[44px] w-full items-center justify-center rounded-pill bg-brand px-5 py-2.5 text-[13px] font-medium leading-[1.35] text-ink-inverse hover:bg-brand-hover"
        >
          Conhecer lançamento
        </a>
      </div>
    </article>
  `,
})
export class LaunchCardComponent {
  readonly launch = input.required<Lancamento>();
  readonly headingLevel = input<'h2' | 'h3' | 'h4'>('h2');
  readonly priority = input<boolean>(false);
  readonly cardId = input<string | null>(null);

  readonly thirdSpec = computed(() => resolveLaunchThirdSpec(this.launch()));
  readonly imageLoaded = signal(false);

  private readonly coverImg =
    viewChild<ElementRef<HTMLImageElement>>('coverImg');

  constructor() {
    afterNextRender(() => {
      const el = this.coverImg()?.nativeElement;
      if (el && el.complete && el.naturalWidth > 0) {
        this.imageLoaded.set(true);
      }
    });
  }

  markImageLoaded(): void {
    this.imageLoaded.set(true);
  }
}
