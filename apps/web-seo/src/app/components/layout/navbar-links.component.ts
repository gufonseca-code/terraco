import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  computed,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs/operators';
import { BAIRROS_BH, buildWhatsAppUrl } from '../../core';

interface PrimaryNavItem {
  readonly label: string;
  readonly route: string;
  readonly matchExact?: boolean;
  readonly icon: 'home' | 'launches';
}

const PRIMARY_NAV_ITEMS: readonly PrimaryNavItem[] = [
  { label: 'Início', route: '/', matchExact: true, icon: 'home' },
  { label: 'Lançamentos', route: '/lancamentos', icon: 'launches' },
];

@Component({
  selector: 'app-navbar-links',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'closeAllMenus()',
  },
  template: `
    <nav
      #navRef
      data-testid="site-navbar"
      aria-label="Navegação principal"
      class="flex w-full items-center justify-end gap-2 md:justify-between md:pl-6"
    >
      <!-- Desktop (md+): M3 Expressive Tonal Pill Rail (scalable for future items) -->
      <div class="terraco-m3-nav-rail hidden md:inline-flex">
        @for (item of primaryItems; track item.route) {
          <a
            [routerLink]="item.route"
            [attr.aria-current]="isRouteActive(item) ? 'page' : null"
            (click)="closeAllMenus()"
            class="terraco-m3-rail-item"
          >
            {{ item.label }}
          </a>
        }

        <div class="relative">
          <button
            type="button"
            (click)="toggleBairrosMenu($event)"
            [attr.aria-expanded]="bairrosMenuOpen()"
            aria-haspopup="menu"
            aria-controls="navbar-bairros-menu"
            [attr.aria-current]="isBairrosCurrent() ? 'page' : null"
            class="terraco-m3-rail-item cursor-pointer"
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
              class="absolute right-0 top-full z-40 mt-2.5 w-64 overflow-hidden rounded-[22px] border border-border-subtle bg-elevated p-1.5 shadow-floating"
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
                    (click)="closeAllMenus()"
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

      <!-- Desktop (md+): M3 Expressive Tonal Action Pill -->
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

      <!-- Mobile (< md): Quick Lançamentos Pill + M3 Expressive Menu Toggle -->
      <div class="flex items-center gap-2 md:hidden">
        <a
          routerLink="/lancamentos"
          [attr.aria-current]="isLancamentosCurrent() ? 'page' : null"
          (click)="closeAllMenus()"
          class="terraco-m3-nav-item px-3.5 text-[13px] font-medium leading-[1.35]"
        >
          Lançamentos
        </a>

        <button
          #menuToggleRef
          type="button"
          (click)="toggleMobileMenu($event)"
          [attr.aria-expanded]="mobileMenuOpen()"
          aria-controls="navbar-mobile-sheet"
          [attr.aria-label]="
            mobileMenuOpen() ? 'Fechar menu de navegação' : 'Abrir menu de navegação'
          "
          class="terraco-m3-menu-toggle cursor-pointer"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            class="h-5 w-5"
          >
            <line
              x1="4"
              y1="8"
              x2="20"
              y2="8"
              class="terraco-m3-burger-line terraco-m3-burger-line--top"
            />
            <line
              x1="4"
              y1="16"
              x2="20"
              y2="16"
              class="terraco-m3-burger-line terraco-m3-burger-line--bottom"
            />
          </svg>
        </button>
      </div>
    </nav>

    <!-- Mobile (< md): M3 Expressive Docked Floating Navigation Sheet -->
    @if (mobileMenuOpen()) {
      <div
        #mobileSheetRef
        id="navbar-mobile-sheet"
        role="dialog"
        aria-label="Menu de navegação"
        animate.enter="terraco-m3-sheet-enter"
        animate.leave="terraco-m3-sheet-leave"
        class="pointer-events-auto absolute inset-x-0 top-full z-40 mt-1.5 overflow-hidden rounded-t-[14px] rounded-b-[28px] border border-border-subtle bg-elevated p-3 shadow-floating md:hidden"
      >
        <div class="space-y-1">
          @for (item of primaryItems; track item.route) {
            @let active = isRouteActive(item);
            <a
              [href]="item.route"
              [attr.aria-current]="active ? 'page' : null"
              (click)="navigateFromMobileSheet($event, [item.route])"
              [class]="
                active
                  ? 'flex min-h-[48px] items-center justify-between gap-3 rounded-[16px] bg-ink/8 px-3 py-2.5 text-[15px] font-medium text-ink transition-colors duration-150'
                  : 'flex min-h-[48px] items-center justify-between gap-3 rounded-[16px] px-3 py-2.5 text-[15px] font-normal text-ink transition-colors duration-150 hover:bg-surface/85'
              "
            >
              <span class="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  [class]="
                    active
                      ? 'flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-ink text-ink-inverse'
                      : 'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface text-ink-muted'
                  "
                >
                  @if (item.icon === 'home') {
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.85"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="h-4 w-4"
                    >
                      <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
                      <path
                        d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
                      />
                    </svg>
                  } @else {
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.85"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="h-4 w-4"
                    >
                      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
                      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
                      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
                      <path d="M10 6h4" />
                      <path d="M10 10h4" />
                      <path d="M10 14h4" />
                      <path d="M10 18h4" />
                    </svg>
                  }
                </span>
                <span>{{ item.label }}</span>
              </span>
              @if (active) {
                <span
                  aria-hidden="true"
                  class="h-2 w-2 rounded-full bg-brand"
                ></span>
              }
            </a>
          }
        </div>

        <div class="mt-3 border-t border-border-subtle pt-3">
          <p class="px-2 pb-2 text-[13px] font-normal text-ink-muted">
            Guias de bairros em BH
          </p>
          <div class="grid grid-cols-2 gap-2">
            @for (bairro of bairros; track bairro.slug) {
              @let active = isBairroSlugCurrent(bairro.slug);
              <a
                [href]="'/bairros/' + bairro.slug"
                [attr.aria-current]="active ? 'page' : null"
                (click)="navigateFromMobileSheet($event, ['/bairros', bairro.slug])"
                [class]="
                  active
                    ? 'flex min-h-[52px] flex-col justify-center rounded-[16px] border border-brand/35 bg-brand/10 px-3.5 py-2 transition-colors duration-150'
                    : 'flex min-h-[52px] flex-col justify-center rounded-[16px] border border-border-subtle/80 bg-surface/65 px-3.5 py-2 transition-colors duration-150 hover:border-border-strong hover:bg-surface'
                "
              >
                <span
                  [class]="
                    active
                      ? 'text-[14px] font-medium leading-[1.3] text-brand'
                      : 'text-[14px] font-medium leading-[1.3] text-ink'
                  "
                >
                  {{ bairro.nome }}
                </span>
                <span class="text-[13px] font-normal leading-[1.3] text-ink-muted">
                  {{ bairro.regiao }}
                </span>
              </a>
            }
          </div>
        </div>

        <div class="mt-3 border-t border-border-subtle pt-3">
          <a
            [href]="whatsappHref"
            target="_blank"
            rel="noopener noreferrer"
            (click)="closeAllMenus()"
            class="terraco-btn flex min-h-[48px] w-full items-center justify-center gap-2 rounded-pill bg-action px-5 py-2.5 text-[14px] font-medium leading-[1.35] text-white hover:bg-action-hover"
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
            <span>Falar no WhatsApp</span>
          </a>
        </div>
      </div>
    }
  `,
})
export class NavbarLinksComponent {
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly currentUrl = signal<string>(this.router.url);
  private readonly navRef = viewChild<ElementRef<HTMLElement>>('navRef');
  private readonly mobileSheetRef =
    viewChild<ElementRef<HTMLElement>>('mobileSheetRef');
  private readonly menuToggleRef =
    viewChild<ElementRef<HTMLButtonElement>>('menuToggleRef');

  private pendingNavTimer: ReturnType<typeof setTimeout> | null = null;

  readonly primaryItems = PRIMARY_NAV_ITEMS;
  readonly bairros = BAIRROS_BH;
  readonly bairrosMenuOpen = signal<boolean>(false);
  readonly mobileMenuOpen = signal<boolean>(false);
  readonly mobileOpenChange = output<boolean>();

  readonly whatsappHref = buildWhatsAppUrl(
    'Oi! Gostaria de conversar sobre os lançamentos da Terraço em BH.'
  );

  readonly isLancamentosCurrent = computed(() =>
    this.currentUrl().startsWith('/lancamentos')
  );

  readonly isBairrosCurrent = computed(() =>
    this.currentUrl().startsWith('/bairros')
  );

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.pendingNavTimer !== null) {
        clearTimeout(this.pendingNavTimer);
        this.pendingNavTimer = null;
      }
    });

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
        this.closeAllMenus();
      });
  }

  isRouteActive(item: PrimaryNavItem): boolean {
    const cleanUrl = this.currentUrl().split(/[?#]/)[0] || '/';
    if (item.matchExact) {
      return cleanUrl === item.route;
    }
    return cleanUrl.startsWith(item.route);
  }

  isBairroSlugCurrent(slug: string): boolean {
    return this.currentUrl().startsWith(`/bairros/${slug}`);
  }

  toggleBairrosMenu(event: Event): void {
    event.stopPropagation();
    this.bairrosMenuOpen.update((open) => !open);
  }

  toggleMobileMenu(event: Event): void {
    event.stopPropagation();
    const next = !this.mobileMenuOpen();
    this.mobileMenuOpen.set(next);
    this.bairrosMenuOpen.set(false);
    this.mobileOpenChange.emit(next);
  }

  closeMobileMenu(restoreFocus = false): void {
    if (!this.mobileMenuOpen()) return;
    this.mobileMenuOpen.set(false);
    this.mobileOpenChange.emit(false);
    if (restoreFocus) {
      this.menuToggleRef()?.nativeElement.focus();
    }
  }

  navigateFromMobileSheet(event: MouseEvent, commands: string[]): void {
    // Allow modified clicks (new tab/window) to follow native link behavior.
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    this.closeMobileMenu(false);

    if (this.pendingNavTimer !== null) {
      clearTimeout(this.pendingNavTimer);
      this.pendingNavTimer = null;
    }

    const reducedMotion =
      isPlatformBrowser(this.platformId) &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion || !isPlatformBrowser(this.platformId)) {
      void this.router.navigate(commands);
      return;
    }

    this.pendingNavTimer = setTimeout(() => {
      this.pendingNavTimer = null;
      void this.router.navigate(commands);
    }, 180);
  }

  closeAllMenus(): void {
    this.bairrosMenuOpen.set(false);
    this.closeMobileMenu(false);
  }

  onDocumentClick(event: Event): void {
    const target = event.target as Node | null;
    if (!target) return;

    const navEl = this.navRef()?.nativeElement;
    const sheetEl = this.mobileSheetRef()?.nativeElement;
    const insideNav = Boolean(navEl?.contains(target));
    const insideSheet = Boolean(sheetEl?.contains(target));

    if (!insideNav) {
      this.bairrosMenuOpen.set(false);
    }
    if (!insideNav && !insideSheet) {
      this.closeMobileMenu(false);
    }
  }
}
