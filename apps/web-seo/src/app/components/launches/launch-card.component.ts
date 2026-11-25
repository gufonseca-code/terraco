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
      <div class="p-2.5 pb-0">
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

          @if (item.badge) {
            <span
              class="pointer-events-none absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-pill bg-accent px-3 py-1 text-[13px] font-medium leading-[1.3] text-ink shadow-chip"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="currentColor"
                class="h-3.5 w-3.5 shrink-0"
              >
                <path
                  d="M12 1.5c1.1 0 2 .7 2.4 1.6.9-.4 2-.2 2.7.5.7.7.9 1.8.5 2.7.9.4 1.6 1.3 1.6 2.4 0 1.1-.7 2-1.6 2.4.4.9.2 2-.5 2.7-.7.7-1.8.9-2.7.5-.4.9-1.3 1.6-2.4 1.6-1.1 0-2-.7-2.4-1.6-.9.4-2 .2-2.7-.5-.7-.7-.9-1.8-.5-2.7-.9-.4-1.6-1.3-1.6-2.4 0-1.1.7-2 1.6-2.4-.4-.9-.2-2 .5-2.7.7-.7 1.8-.9 2.7-.5C10 2.2 10.9 1.5 12 1.5Z"
                  transform="translate(0 3)"
                />
              </svg>
              <span>{{ item.badge }}</span>
            </span>
          }

          <div class="absolute top-3 right-3 z-10">
            <app-favorite-button [slug]="item.slug" [nome]="item.nome" />
          </div>
        </div>
      </div>

      <div class="flex flex-1 flex-col gap-4 px-5 py-5">
        <div class="space-y-1">
          <p class="text-[13px] font-normal text-ink-muted">
            {{ item.bairro }}, {{ item.cidade }}
          </p>

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
          class="grid grid-cols-2 gap-x-6 gap-y-3 border-t border-border-subtle/80 pt-4"
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

        <div class="mt-auto border-t border-border-subtle/70 pt-4">
          <a
            [routerLink]="['/lancamentos', item.slug]"
            class="terraco-btn inline-flex min-h-[40px] w-fit items-center gap-2 rounded-pill border border-border-strong bg-canvas/70 px-4 py-2 text-[13px] font-medium leading-[1.35] text-brand hover:border-brand hover:bg-brand hover:text-ink-inverse"
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
              class="h-4 w-4 shrink-0"
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
