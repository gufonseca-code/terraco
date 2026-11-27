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
      class="terraco-reveal-delay group flex h-full flex-col scroll-mt-24"
    >
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
            class="h-full w-full rounded-[20px] object-cover object-center transition-transform duration-300 ease-out motion-reduce:transition-none group-hover:scale-[1.02] motion-reduce:group-hover:scale-100"
          />
        </a>

        <div class="absolute top-3 right-3 z-10">
          <app-favorite-button [slug]="item.slug" [nome]="item.nome" />
        </div>
      </div>

      <div class="mt-3.5 flex flex-1 flex-col gap-3">
        <div class="space-y-0.5">
          <div class="flex flex-wrap items-center gap-2">
            <p class="text-[13px] font-normal text-ink-muted">
              {{ item.bairro }}, {{ item.cidade }}
            </p>
            @if (item.badge) {
              <span
                class="inline-flex items-center rounded-pill bg-success-bg px-2.5 py-0.5 text-[12px] font-medium leading-[1.3] text-success-fg"
              >
                {{ item.badge }}
              </span>
            }
          </div>

          @if (headingLevel() === 'h3') {
            <h3
              [style.view-transition-name]="'launch-title-' + item.slug"
              class="font-display text-[1.25rem] font-medium not-italic leading-[1.2] tracking-[-0.015em] text-ink text-balance"
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
              class="font-display text-[1.25rem] font-medium not-italic leading-[1.2] tracking-[-0.015em] text-ink text-balance"
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
              class="font-display text-[1.25rem] font-medium not-italic leading-[1.2] tracking-[-0.015em] text-ink text-balance"
            >
              <a
                [routerLink]="['/lancamentos', item.slug]"
                class="transition-colors duration-150 hover:text-brand"
              >
                {{ item.nome }}
              </a>
            </h2>
          }
        </div>

        <dl
          class="grid grid-cols-2 gap-x-5 gap-y-2.5 border-t border-border-subtle pt-3"
        >
          <div class="space-y-0.5">
            <dt class="text-[13px] font-normal text-ink-muted">Dormitórios</dt>
            <dd
              class="text-[14px] font-medium leading-[1.4] text-ink tabular-nums"
            >
              {{ item.quartos }}
            </dd>
          </div>
          <div class="space-y-0.5">
            <dt class="text-[13px] font-normal text-ink-muted">Metragem</dt>
            <dd
              class="text-[14px] font-medium leading-[1.4] text-ink tabular-nums"
            >
              {{ item.metragem }}
            </dd>
          </div>
          @let entrega = item.entrega?.trim();
          <div [class]="entrega ? 'space-y-0.5' : 'col-span-2 space-y-0.5'">
            <dt class="text-[13px] font-normal text-ink-muted">
              {{ spec.label }}
            </dt>
            <dd
              [class]="
                spec.tabular
                  ? 'text-[14px] font-medium leading-[1.4] text-ink tabular-nums'
                  : 'text-[14px] font-medium leading-[1.4] text-ink'
              "
            >
              {{ spec.value }}
            </dd>
          </div>
          @if (entrega) {
            <div class="space-y-0.5">
              <dt class="text-[13px] font-normal text-ink-muted">Entrega</dt>
              <dd
                class="text-[14px] font-medium leading-[1.4] text-ink tabular-nums"
              >
                {{ entrega }}
              </dd>
            </div>
          }
        </dl>

        <div class="mt-auto pt-1">
          <a
            [routerLink]="['/lancamentos', item.slug]"
            class="terraco-link-editorial inline-flex min-h-[40px] w-fit items-center gap-1.5 text-[13px] font-medium leading-[1.35] text-brand hover:text-brand-hover focus-visible:text-brand-hover"
          >
            <span>Conhecer lançamento</span>
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="terraco-link-arrow h-4 w-4 shrink-0 group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0"
            >
              <path d="M4.5 10h11" />
              <path d="m11 5.5 4.5 4.5-4.5 4.5" />
            </svg>
          </a>
        </div>
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
