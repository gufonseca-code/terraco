import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  PLATFORM_ID,
  afterNextRender,
  inject,
  input,
  signal,
} from '@angular/core';
import { NavbarLinksComponent } from './navbar-links.component';
import { TerracoLogoComponent } from './terraco-logo.component';

@Component({
  selector: 'app-navbar',
  imports: [TerracoLogoComponent, NavbarLinksComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'sticky top-0 z-30 block w-full',
  },
  template: `
    <header
      data-testid="site-header"
      [class]="
        mobileMenuOpen()
          ? 'terraco-header-shell terraco-header-shell--open w-full'
          : isScrolled() || !overlayHero()
            ? 'terraco-header-shell terraco-header-shell--scrolled w-full'
            : 'terraco-header-shell w-full'
      "
    >
      <div class="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div class="relative z-30 flex min-h-[58px] items-center justify-between gap-3 py-1.5 sm:min-h-[68px] sm:py-2">
          <a href="#homepage" class="skip-link">Pular para o conteúdo</a>
          <app-terraco-logo [animate]="animateLogo()" />
          <app-navbar-links
            (mobileOpenChange)="mobileMenuOpen.set($event)"
            class="flex flex-1 items-center justify-end"
          />
        </div>
      </div>
    </header>
  `,
})
export class NavbarComponent {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  readonly animateLogo = input<boolean>(false);
  readonly overlayHero = input<boolean>(false);
  readonly mobileMenuOpen = signal<boolean>(false);
  readonly isScrolled = signal<boolean>(false);

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) {
        return;
      }

      const win = this.document.defaultView;
      if (!win) {
        return;
      }

      const updateScroll = () => {
        this.isScrolled.set(win.scrollY > 12);
      };

      updateScroll();
      win.addEventListener('scroll', updateScroll, { passive: true });
      this.destroyRef.onDestroy(() => {
        win.removeEventListener('scroll', updateScroll);
      });
    });
  }
}
