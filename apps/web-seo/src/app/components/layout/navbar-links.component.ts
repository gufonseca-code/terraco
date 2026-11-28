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
import {
  FavoritesService,
  SITE_CONTACT_CHANNELS,
  buildWhatsAppUrl,
} from '../../core';
import { M3ChipDirective } from '../shared/m3-tactile.directives';

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
  imports: [RouterLink, M3ChipDirective],
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
      <!-- Desktop (md+): Clean flat links + integrated Contato link with M3 Expressive shape morphing -->
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

        <a
          [href]="whatsappHref"
          target="_blank"
          rel="noopener noreferrer"
          (click)="closeAllMenus()"
          class="terraco-nav-morph inline-flex min-h-[38px] items-center px-3.5 py-1.5 text-[14px] font-medium leading-[1.35] text-ink-muted hover:bg-surface/65 hover:text-ink"
        >
          Contato
        </a>
      </div>

      <!-- Desktop (md+): Live saved signal (only when > 0) -->
      <div class="hidden items-center gap-3 md:flex">
        @if (favoritesCount() > 0) {
          <a
            routerLink="/lancamentos"
            [attr.aria-label]="
              favoritesCount() === 1
                ? '1 lançamento salvo'
                : favoritesCount() + ' lançamentos salvos'
            "
            class="terraco-nav-morph inline-flex min-h-[38px] items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium leading-[1.35] text-ink-muted tabular-nums hover:bg-surface hover:text-ink"
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
            class="terraco-nav-morph inline-flex h-11 items-center gap-1 px-3 text-[13px] font-medium text-ink tabular-nums hover:bg-surface/80"
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
          class="terraco-nav-menu-trigger !h-11 !w-11 cursor-pointer"
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
        class="pointer-events-auto absolute inset-x-4 top-full z-40 mt-2 rounded-[20px] border border-[#1C1B19]/10 bg-[#FAF8F4] p-4 shadow-floating sm:inset-x-6 md:hidden"
      >
        <div class="space-y-1">
          @for (item of primaryItems; track item.route) {
            @let active = isRouteActive(item);
            <a
              [href]="item.route"
              appM3Chip
              tone="nav"
              [active]="active"
              [attr.aria-current]="active ? 'page' : null"
              (click)="navigateFromMobileSheet($event, [item.route])"
              class="flex min-h-11 items-center px-3.5 py-2.5 text-[15px]"
            >
              {{ item.label }}
            </a>
          }

          <a
            [href]="whatsappHref"
            target="_blank"
            rel="noopener noreferrer"
            appM3Chip
            tone="nav"
            [active]="false"
            (click)="closeAllMenus()"
            class="flex min-h-11 items-center px-3.5 py-2.5 text-[15px]"
          >
            Contato
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
    SITE_CONTACT_CHANNELS.whatsapp.defaultMessage
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
