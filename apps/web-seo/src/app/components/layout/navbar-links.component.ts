import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs/operators';
import { BAIRROS_BH, buildWhatsAppUrl } from '../../core';

@Component({
  selector: 'app-navbar-links',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'closeBairrosMenu()',
  },
  template: `
    <nav
      #navRef
      data-testid="site-navbar"
      aria-label="Navegação principal"
      class="flex items-center gap-2"
    >
      <!-- M3 Expressive Connected Navigation Group -->
      <div class="terraco-m3-nav-group">
        <a
          routerLink="/lancamentos"
          [attr.aria-current]="isCurrent() ? 'page' : null"
          (click)="closeBairrosMenu()"
          class="terraco-m3-nav-item px-4 text-sm font-medium leading-[1.35]"
        >
          Lançamentos
        </a>

        <div class="terraco-m3-nav-slot relative hidden sm:block">
          <button
            type="button"
            (click)="toggleBairrosMenu($event)"
            [attr.aria-expanded]="bairrosMenuOpen()"
            aria-haspopup="menu"
            aria-controls="navbar-bairros-menu"
            [attr.aria-current]="isBairrosCurrent() ? 'page' : null"
            class="terraco-m3-nav-item cursor-pointer px-4 text-sm font-medium leading-[1.35]"
          >
            <span>Bairros</span>
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              [class]="
                bairrosMenuOpen()
                  ? 'h-4 w-4 shrink-0 rotate-180 transition-transform duration-150'
                  : 'h-4 w-4 shrink-0 transition-transform duration-150'
              "
            >
              <path d="m5.5 7.5 4.5 4.5 4.5-4.5" />
            </svg>
          </button>

          @if (bairrosMenuOpen()) {
            <div
              id="navbar-bairros-menu"
              role="menu"
              aria-label="Guias de bairros em Belo Horizonte"
              animate.enter="terraco-search-panel-enter"
              animate.leave="terraco-search-panel-leave"
              class="absolute right-0 top-full z-40 mt-2 w-64 overflow-hidden rounded-[22px] border border-border-subtle bg-elevated p-1.5 shadow-floating"
            >
              <p class="px-3 pt-1.5 pb-1 text-[13px] font-normal text-ink-muted">
                Guias de bairros em BH
              </p>
              <div class="space-y-0.5">
                @for (bairro of bairros; track bairro.slug) {
                  @let active = isBairroSlugCurrent(bairro.slug);
                  <a
                    role="menuitem"
                    [routerLink]="['/bairros', bairro.slug]"
                    [attr.aria-current]="active ? 'page' : null"
                    (click)="closeBairrosMenu()"
                    [class]="
                      active
                        ? 'flex min-h-[44px] items-center justify-between gap-3 rounded-[14px] bg-brand/10 px-3 py-2 text-[14px] font-medium text-brand transition-colors duration-150'
                        : 'flex min-h-[44px] items-center justify-between gap-3 rounded-[14px] px-3 py-2 text-[14px] font-normal text-ink transition-colors duration-150 hover:bg-surface/85'
                    "
                  >
                    <span>{{ bairro.nome }}</span>
                    <span class="text-[13px] font-normal text-ink-muted">
                      {{ bairro.regiao }}
                    </span>
                  </a>
                }
              </div>
            </div>
          }
        </div>
      </div>

      <!-- M3 Expressive Tonal Action Pill -->
      <a
        [href]="whatsappHref"
        target="_blank"
        rel="noopener noreferrer"
        class="terraco-m3-nav-action hidden px-4 text-sm font-medium leading-[1.35] md:inline-flex"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.85"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-4 w-4 shrink-0"
        >
          <path
            d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"
          />
        </svg>
        <span>WhatsApp</span>
      </a>
    </nav>
  `,
})
export class NavbarLinksComponent {
  private readonly router = inject(Router);
  private readonly currentUrl = signal<string>(this.router.url);
  private readonly navRef = viewChild<ElementRef<HTMLElement>>('navRef');

  readonly bairros = BAIRROS_BH;
  readonly bairrosMenuOpen = signal<boolean>(false);

  readonly whatsappHref = buildWhatsAppUrl(
    'Oi! Gostaria de conversar sobre os lançamentos da Terraço em BH.'
  );

  readonly isCurrent = computed(() =>
    this.currentUrl().startsWith('/lancamentos')
  );

  readonly isBairrosCurrent = computed(() =>
    this.currentUrl().startsWith('/bairros')
  );

  constructor() {
    this.currentUrl.set(this.router.url);
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd
        ),
        takeUntilDestroyed()
      )
      .subscribe((event) => {
        this.currentUrl.set(event.urlAfterRedirects || event.url);
        this.bairrosMenuOpen.set(false);
      });
  }

  isBairroSlugCurrent(slug: string): boolean {
    return this.currentUrl().startsWith(`/bairros/${slug}`);
  }

  toggleBairrosMenu(event: Event): void {
    event.stopPropagation();
    this.bairrosMenuOpen.update((open) => !open);
  }

  closeBairrosMenu(): void {
    this.bairrosMenuOpen.set(false);
  }

  onDocumentClick(event: Event): void {
    const container = this.navRef()?.nativeElement;
    const target = event.target as Node | null;
    if (container && target && !container.contains(target)) {
      this.closeBairrosMenu();
    }
  }
}
