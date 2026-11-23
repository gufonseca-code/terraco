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
  if (launch.vagas.trim().length > 0) {
    return { label: 'Vagas', value: launch.vagas };
  }
  if (typeof launch.precoAPartirDe === 'number') {
    return {
      label: 'A partir de',
      value: formatCurrencyBRL(launch.precoAPartirDe),
      tabular: true,
    };
  }
  return {
    label: 'Tipologias',
    value: launch.tipologias || 'Consulte opções',
  };
}

@Component({
  selector: 'app-launch-card',
  imports: [RouterLink, FavoriteButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let item = launch();
    @let spec = thirdSpec();
    <article
      [attr.id]="cardId()"
      animate.enter="terraco-reveal-delay"
      class="terraco-plate flex h-full flex-col overflow-hidden rounded-lg bg-elevated scroll-mt-24"
    >
      <div
        [class.terraco-skeleton]="!imageLoaded()"
        class="relative aspect-[16/10] overflow-hidden rounded-t-[calc(var(--radius-lg)-1px)] border-b border-border-subtle bg-surface"
      >
        <a
          [routerLink]="['/lancamentos', item.slug]"
          class="relative z-[1] block h-full w-full overflow-hidden rounded-t-[calc(var(--radius-lg)-1px)]"
          [attr.aria-label]="'Conhecer ' + item.nome"
        >
          <img
            #coverImg
            data-testid="lancamentos-cover-image"
            [attr.data-slug]="item.slug"
            [src]="item.imagem"
            [alt]="item.imagemAlt"
            [width]="item.imagemWidth"
            [height]="item.imagemHeight"
            [style.view-transition-name]="'launch-image-' + item.slug"
            (load)="markImageLoaded()"
            (error)="markImageLoaded()"
            [attr.fetchpriority]="priority() ? 'high' : null"
            [attr.loading]="priority() ? null : 'lazy'"
            decoding="async"
            class="h-full w-full rounded-t-[calc(var(--radius-lg)-1px)] object-cover object-center"
          />
        </a>

        <div class="absolute top-3.5 right-3.5 z-10 sm:top-4 sm:right-4">
          <app-favorite-button [slug]="item.slug" [nome]="item.nome" />
        </div>
      </div>

      <div class="flex flex-1 flex-col justify-between gap-4 px-5 py-4 sm:py-5">
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

        <a
          [routerLink]="['/lancamentos', item.slug]"
          class="terraco-btn terraco-btn-moss inline-flex min-h-[42px] w-full items-center justify-center rounded-pill bg-brand px-4 py-2 text-[13px] font-medium leading-[1.35] text-ink-inverse hover:bg-brand-hover"
        >
          Conhecer lançamento
        </a>
      </div>

      <dl class="grid grid-cols-2 border-t border-border-subtle bg-surface/45">
        <div class="space-y-0.5 border-r border-border-subtle px-5 py-3">
          <dt class="text-[12px] font-normal text-ink-muted">Dormitórios</dt>
          <dd class="text-[14px] font-normal leading-[1.4] text-ink tabular-nums">
            {{ item.quartos }}
          </dd>
        </div>
        <div class="space-y-0.5 px-5 py-3">
          <dt class="text-[12px] font-normal text-ink-muted">Metragem</dt>
          <dd class="text-[14px] font-normal leading-[1.4] text-ink tabular-nums">
            {{ item.metragem }}
          </dd>
        </div>
        <div class="col-span-2 space-y-0.5 border-t border-border-subtle px-5 py-3">
          <dt class="text-[12px] font-normal text-ink-muted">
            {{ spec.label }}
          </dt>
          <dd
            [class]="
              spec.tabular
                ? 'text-[14px] font-normal leading-[1.4] text-ink tabular-nums'
                : 'text-[14px] font-normal leading-[1.4] text-ink'
            "
          >
            {{ spec.value }}
          </dd>
        </div>
      </dl>
    </article>
  `,
})
export class LaunchCardComponent {
  readonly launch = input.required<Lancamento>();
  readonly headingLevel = input<'h2' | 'h3'>('h2');
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
