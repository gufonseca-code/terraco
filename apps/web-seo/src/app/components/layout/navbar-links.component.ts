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
import { FavoritesService, buildWhatsAppUrl } from '../../core';

interface PrimaryNavItem {
  readonly label: string;
  readonly route: string;
  readonly matchExact?: boolean;
}

const PRIMARY_NAV_ITEMS: readonly PrimaryNavItem[] = [
  { label: 'Início', route: '/', matchExact: true },
  { label: 'Lançamentos', route: '/lancamentos' },
  { label: 'Bairros', route: '/bairros' },
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
      class="flex w-full items-center justify-end gap-3 md:justify-between md:pl-8"
    >
      <!-- Desktop (md+): Clean flat links with M3 Expressive shape morphing -->
      <div class="hidden items-center gap-2 md:flex">
        @for (item of primaryItems; track item.route) {
          @let active = isRouteActive(item);
          <a
            [routerLink]="item.route"
            [attr.aria-current]="active ? 'page' : null"
            (click)="closeAllMenus()"
            [class]="
              active
                ? 'terraco-nav-morph inline-flex min-h-[38px] items-center bg-surface px-3.5 py-1.5 text-[14px] font-semibold leading-[1.35] text-ink'
                : 'terraco-nav-morph inline-flex min-h-[38px] items-center px-3.5 py-1.5 text-[14px] font-medium leading-[1.35] text-ink-muted hover:bg-surface/65 hover:text-ink'
            "
          >
            {{ item.label }}
          </a>
        }
      </div>

      <!-- Desktop (md+): Live saved signal (only when > 0) + Discreet WhatsApp link -->
      <div class="hidden items-center gap-3 md:flex">
        @if (favoritesCount() > 0) {
          <a
            routerLink="/lancamentos"
            [attr.aria-label]="
              favoritesCount() === 1
                ? '1 lançamento salvo'
                : favoritesCount() + ' lançamentos salvos'
            "
            class="inline-flex min-h-[38px] items-center gap-1.5 rounded-pill px-3 py-1.5 text-[13px] font-medium leading-[1.35] text-ink-muted tabular-nums transition-colors duration-150 hover:bg-surface hover:text-ink"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="h-3.5 w-3.5 shrink-0 text-highlight"
            >
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              />
            </svg>
            <span>{{ favoritesCount() }}</span>
          </a>
        }

        <a
          [href]="whatsappHref"
          target="_blank"
          rel="noopener noreferrer"
          class="terraco-nav-morph inline-flex min-h-[38px] items-center gap-1.5 border border-border-strong/75 px-3.5 py-1.5 text-[14px] font-medium leading-[1.35] text-ink hover:border-ink hover:bg-surface/65"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="h-4 w-4 shrink-0 text-ink-muted"
          >
            <path
              d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"
            />
          </svg>
          <span>WhatsApp</span>
        </a>
      </div>

      <!-- Mobile (< md): Optional live saved count + Tactile M3E menu trigger -->
      <div class="flex items-center gap-1.5 md:hidden">
        @if (favoritesCount() > 0) {
          <a
            routerLink="/lancamentos"
            [attr.aria-label]="
              favoritesCount() === 1
                ? '1 lançamento salvo'
                : favoritesCount() + ' lançamentos salvos'
            "
            class="inline-flex h-10 items-center gap-1 rounded-[12px] px-2.5 text-[13px] font-medium text-ink tabular-nums transition-colors duration-150 hover:bg-surface/80"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="h-3.5 w-3.5 shrink-0 text-highlight"
            >
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              />
            </svg>
            <span>{{ favoritesCount() }}</span>
          </a>
        }

        <button
          #menuToggleRef
          type="button"
          (click)="toggleMobileMenu($event)"
          [attr.aria-expanded]="mobileMenuOpen()"
          aria-controls="navbar-mobile-sheet"
          [attr.aria-label]="
            mobileMenuOpen() ? 'Fechar menu de navegação' : 'Abrir menu de navegação'
          "
          class="terraco-nav-menu-trigger cursor-pointer"
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

    <!-- Mobile (< md): Expressive 24px floating drawer -->
    @if (mobileMenuOpen()) {
      <div
        #mobileSheetRef
        id="navbar-mobile-sheet"
        role="dialog"
        aria-label="Menu de navegação"
        animate.enter="terraco-m3-sheet-enter"
        animate.leave="terraco-m3-sheet-leave"
        class="pointer-events-auto absolute inset-x-4 top-full z-40 mt-2 rounded-[24px] border border-border-subtle bg-elevated/98 p-5 shadow-floating backdrop-blur-md sm:inset-x-6 md:hidden"
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
                  ? 'flex min-h-11 items-center rounded-[12px] bg-surface px-3.5 py-2.5 text-[15px] font-semibold text-ink transition-colors duration-150'
                  : 'flex min-h-11 items-center rounded-[12px] px-3.5 py-2.5 text-[15px] font-medium text-ink-muted transition-colors duration-150 hover:bg-surface/65 hover:text-ink'
              "
            >
              {{ item.label }}
            </a>
          }
        </div>

        <div class="mt-4 border-t border-border-subtle pt-4">
          <a
            [href]="whatsappHref"
            target="_blank"
            rel="noopener noreferrer"
            (click)="closeAllMenus()"
            class="terraco-btn flex min-h-[46px] w-full items-center justify-center gap-2 rounded-pill bg-action px-5 py-2.5 text-[14px] font-medium leading-[1.35] text-white hover:bg-action-hover"
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
  private readonly favoritesService = inject(FavoritesService);
  private readonly currentUrl = signal<string>(this.router.url);
  private readonly navRef = viewChild<ElementRef<HTMLElement>>('navRef');
  private readonly mobileSheetRef =
    viewChild<ElementRef<HTMLElement>>('mobileSheetRef');
  private readonly menuToggleRef =
    viewChild<ElementRef<HTMLButtonElement>>('menuToggleRef');

  private pendingNavTimer: ReturnType<typeof setTimeout> | null = null;

  readonly primaryItems = PRIMARY_NAV_ITEMS;
  readonly mobileMenuOpen = signal<boolean>(false);
  readonly mobileOpenChange = output<boolean>();

  readonly favoritesCount = computed(
    () => this.favoritesService.favorites().length
  );

  readonly whatsappHref = buildWhatsAppUrl(
    'Oi! Gostaria de conversar sobre os lançamentos da Terraço em BH.'
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

  toggleMobileMenu(event: Event): void {
    event.stopPropagation();
    const next = !this.mobileMenuOpen();
    this.mobileMenuOpen.set(next);
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
    this.closeMobileMenu(false);
  }

  onDocumentClick(event: Event): void {
    const target = event.target as Node | null;
    if (!target) return;

    const navEl = this.navRef()?.nativeElement;
    const sheetEl = this.mobileSheetRef()?.nativeElement;
    const insideNav = Boolean(navEl?.contains(target));
    const insideSheet = Boolean(sheetEl?.contains(target));

    if (!insideNav && !insideSheet) {
      this.closeMobileMenu(false);
    }
  }
}
