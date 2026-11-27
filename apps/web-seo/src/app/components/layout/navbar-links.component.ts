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
  buildContactMailtoUrl,
  buildWhatsAppUrl,
  isEmailContactActive,
} from '../../core';
import {
  M3ButtonDirective,
  M3ChipDirective,
} from '../shared/m3-tactile.directives';

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
  imports: [RouterLink, M3ButtonDirective, M3ChipDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'closeAllMenus(true)',
  },
  template: `
    <nav
      #navRef
      data-testid="site-navbar"
      aria-label="Navegação principal"
      class="flex w-full items-center justify-end gap-3 md:justify-between md:pl-8"
    >
      <!-- Desktop (md+): Clean flat links + integrated Contato selector with M3 Expressive shape morphing -->
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

        <div class="relative">
          <button
            #contactToggleRef
            type="button"
            (click)="toggleContactMenu($event)"
            [attr.aria-expanded]="contactMenuOpen()"
            aria-haspopup="menu"
            aria-controls="navbar-contact-popover"
            [class]="
              contactMenuOpen()
                ? 'terraco-nav-morph inline-flex min-h-[38px] cursor-pointer items-center gap-1.5 bg-surface px-3.5 py-1.5 text-[14px] font-semibold leading-[1.35] text-ink'
                : 'terraco-nav-morph inline-flex min-h-[38px] cursor-pointer items-center gap-1.5 px-3.5 py-1.5 text-[14px] font-medium leading-[1.35] text-ink-muted hover:bg-surface/65 hover:text-ink'
            "
          >
            <span>Contato</span>
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
              [class]="
                contactMenuOpen()
                  ? 'h-3.5 w-3.5 shrink-0 rotate-180 transition-transform duration-200 motion-reduce:transition-none'
                  : 'h-3.5 w-3.5 shrink-0 transition-transform duration-200 motion-reduce:transition-none'
              "
            >
              <path d="m5.5 7.5 4.5 4.5 4.5-4.5" />
            </svg>
          </button>

          @if (contactMenuOpen()) {
            <div
              #contactPopoverRef
              id="navbar-contact-popover"
              role="menu"
              aria-label="Canais de contato"
              animate.enter="terraco-search-panel-enter"
              animate.leave="terraco-search-panel-leave"
              class="absolute right-0 top-full z-40 mt-2 min-w-[264px] rounded-[20px] border border-border-subtle bg-elevated p-2 shadow-floating"
            >
              @if (contactChannels.whatsapp.enabled) {
                <a
                  role="menuitem"
                  [href]="whatsappHref"
                  target="_blank"
                  rel="noopener noreferrer"
                  (click)="closeAllMenus()"
                  class="terraco-m3-chip flex min-h-[44px] w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left text-ink hover:bg-surface"
                >
                  <span class="flex min-w-0 items-center gap-3">
                    <span
                      aria-hidden="true"
                      class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success-bg text-brand"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.85"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="h-4 w-4"
                      >
                        <path
                          d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"
                        />
                      </svg>
                    </span>
                    <span class="min-w-0">
                      <span class="block text-[14px] font-medium leading-[1.3] text-ink">
                        {{ contactChannels.whatsapp.label }}
                      </span>
                      <span class="block text-[12px] font-normal leading-[1.35] text-ink-muted">
                        {{ contactChannels.whatsapp.description }}
                      </span>
                    </span>
                  </span>
                  <span aria-hidden="true" class="text-[13px] text-ink-muted">↗</span>
                </a>
              }

              @if (emailActive()) {
                <div
                  class="mt-1 flex items-center justify-between gap-1 border-t border-border-subtle/70 pt-1"
                >
                  <a
                    role="menuitem"
                    [href]="emailHref()"
                    (click)="closeAllMenus()"
                    class="terraco-m3-chip flex min-h-[44px] flex-1 items-center gap-3 px-3.5 py-2.5 text-left text-ink hover:bg-surface"
                  >
                    <span
                      aria-hidden="true"
                      class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface text-ink-muted"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.85"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="h-4 w-4"
                      >
                        <rect x="3" y="5" width="18" height="14" rx="2" />
                        <path d="m3 7 9 6 9-6" />
                      </svg>
                    </span>
                    <span class="min-w-0">
                      <span class="block text-[14px] font-medium leading-[1.3] text-ink">
                        {{ contactChannels.email.label }}
                      </span>
                      <span class="block truncate text-[12px] font-normal leading-[1.35] text-ink-muted">
                        {{ contactChannels.email.address }}
                      </span>
                    </span>
                  </a>

                  <button
                    type="button"
                    (click)="copyEmail($event)"
                    [attr.aria-label]="
                      emailCopied() ? 'E-mail copiado' : 'Copiar endereço de e-mail'
                    "
                    class="terraco-m3-chip inline-flex min-h-[38px] shrink-0 cursor-pointer items-center px-2.5 text-[12px] font-medium text-ink-muted hover:bg-surface hover:text-ink"
                  >
                    {{ emailCopied() ? 'Copiado' : 'Copiar' }}
                  </button>
                </div>
              }
            </div>
          }
        </div>
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
        class="pointer-events-auto absolute inset-x-4 top-full z-40 mt-2 rounded-[24px] border border-border-subtle bg-elevated/98 p-5 shadow-floating backdrop-blur-md sm:inset-x-6 md:hidden"
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
        </div>

        <div class="mt-4 space-y-2 border-t border-border-subtle pt-4">
          <p class="px-1 text-[12px] font-medium text-ink-muted">Contato</p>

          @if (contactChannels.whatsapp.enabled) {
            <a
              [href]="whatsappHref"
              target="_blank"
              rel="noopener noreferrer"
              appM3Button
              variant="primary"
              (click)="closeAllMenus()"
              class="flex min-h-[46px] w-full items-center justify-center gap-2 px-5 py-2.5 text-[14px] leading-[1.35]"
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
          }

          @if (emailActive()) {
            <div class="flex items-center gap-2">
              <a
                [href]="emailHref()"
                appM3Button
                variant="tonal"
                (click)="closeAllMenus()"
                class="flex min-h-[44px] flex-1 items-center justify-center gap-2 px-4 py-2 text-[14px]"
              >
                <span>{{ contactChannels.email.label }}</span>
              </a>
              <button
                type="button"
                (click)="copyEmail($event)"
                [attr.aria-label]="
                  emailCopied() ? 'E-mail copiado' : 'Copiar endereço de e-mail'
                "
                class="terraco-m3-chip inline-flex min-h-[44px] shrink-0 cursor-pointer items-center bg-surface px-3.5 text-[13px] font-medium text-ink"
              >
                {{ emailCopied() ? 'Copiado' : 'Copiar' }}
              </button>
            </div>
          }
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
  private readonly contactToggleRef =
    viewChild<ElementRef<HTMLButtonElement>>('contactToggleRef');
  private readonly contactPopoverRef =
    viewChild<ElementRef<HTMLElement>>('contactPopoverRef');

  private pendingNavTimer: ReturnType<typeof setTimeout> | null = null;
  private copiedResetTimer: ReturnType<typeof setTimeout> | null = null;

  readonly primaryItems = PRIMARY_NAV_ITEMS;
  readonly contactChannels = SITE_CONTACT_CHANNELS;
  readonly mobileMenuOpen = signal<boolean>(false);
  readonly contactMenuOpen = signal<boolean>(false);
  readonly emailCopied = signal<boolean>(false);
  readonly mobileOpenChange = output<boolean>();

  readonly favoritesCount = computed(
    () => this.favoritesService.favorites().length
  );

  readonly whatsappHref = buildWhatsAppUrl(
    SITE_CONTACT_CHANNELS.whatsapp.defaultMessage
  );

  readonly emailActive = computed(() =>
    isEmailContactActive(this.contactChannels)
  );

  readonly emailHref = computed(() =>
    buildContactMailtoUrl(
      this.contactChannels.email.address,
      this.contactChannels.email.defaultSubject
    )
  );

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.pendingNavTimer !== null) {
        clearTimeout(this.pendingNavTimer);
        this.pendingNavTimer = null;
      }
      if (this.copiedResetTimer !== null) {
        clearTimeout(this.copiedResetTimer);
        this.copiedResetTimer = null;
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
    this.contactMenuOpen.set(false);
    const next = !this.mobileMenuOpen();
    this.mobileMenuOpen.set(next);
    this.mobileOpenChange.emit(next);
  }

  toggleContactMenu(event: Event): void {
    event.stopPropagation();
    this.closeMobileMenu(false);
    this.contactMenuOpen.update((open) => !open);
  }

  closeContactMenu(restoreFocus = false): void {
    if (!this.contactMenuOpen()) return;
    this.contactMenuOpen.set(false);
    if (restoreFocus) {
      this.contactToggleRef()?.nativeElement.focus();
    }
  }

  async copyEmail(event: Event): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    const address = this.contactChannels.email.address.trim();
    if (!address || !isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      await navigator.clipboard?.writeText(address);
      this.emailCopied.set(true);
      if (this.copiedResetTimer !== null) {
        clearTimeout(this.copiedResetTimer);
      }
      this.copiedResetTimer = setTimeout(() => {
        this.copiedResetTimer = null;
        this.emailCopied.set(false);
      }, 2000);
    } catch {
      // Clipboard API may be unavailable in restricted browser contexts.
    }
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

  closeAllMenus(restoreFocus = false): void {
    this.closeMobileMenu(false);
    this.closeContactMenu(restoreFocus);
  }

  onDocumentClick(event: Event): void {
    const target = event.target as Node | null;
    if (!target) return;

    const navEl = this.navRef()?.nativeElement;
    const sheetEl = this.mobileSheetRef()?.nativeElement;
    const contactEl = this.contactPopoverRef()?.nativeElement;
    const insideNav = Boolean(navEl?.contains(target));
    const insideSheet = Boolean(sheetEl?.contains(target));
    const insideContact = Boolean(contactEl?.contains(target));

    if (!insideNav && !insideSheet) {
      this.closeMobileMenu(false);
    }
    if (!insideNav && !insideContact) {
      this.closeContactMenu(false);
    }
  }
}
