import { isPlatformBrowser } from '@angular/common';
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

const SCROLL_THRESHOLD_PX = 12;

@Component({
  selector: 'app-navbar',
  imports: [TerracoLogoComponent, NavbarLinksComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'sticky top-0 z-30 block',
  },
  template: `
    <header
      data-testid="site-header"
      [attr.data-scrolled]="isScrolled() || mobileMenuOpen()"
      [class]="
        isScrolled() || mobileMenuOpen()
          ? 'border-b border-[rgba(28,27,25,0.08)] bg-canvas/90 backdrop-blur-md transition-[background-color,border-color] duration-200 motion-reduce:transition-none'
          : 'border-b border-transparent bg-canvas transition-[background-color,border-color] duration-200 motion-reduce:transition-none'
      "
    >
      <div
        class="relative mx-auto flex min-h-[58px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
      >
        <a href="#homepage" class="skip-link">Pular para o conteúdo</a>
        <app-terraco-logo [animate]="animateLogo()" />
        <app-navbar-links
          (mobileOpenChange)="mobileMenuOpen.set($event)"
          class="flex flex-1 items-center justify-end"
        />
      </div>
    </header>
  `,
})
export class NavbarComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  readonly animateLogo = input<boolean>(false);
  readonly mobileMenuOpen = signal<boolean>(false);
  readonly isScrolled = signal<boolean>(false);

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) {
        return;
      }

      const updateScroll = (): void => {
        const next = window.scrollY > SCROLL_THRESHOLD_PX;
        if (next !== this.isScrolled()) {
          this.isScrolled.set(next);
        }
      };

      updateScroll();
      window.addEventListener('scroll', updateScroll, { passive: true });
      this.destroyRef.onDestroy(() => {
        window.removeEventListener('scroll', updateScroll);
      });
    });
  }
}
